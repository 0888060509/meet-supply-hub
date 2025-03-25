import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const dbConfig = {
  host: 'app.riviu.com.vn',
  port: 5432,
  database: 'meetly_dev',
  user: 'root',
  password: 'PJp6xBv29pnRUZO'
};

class MigrationManager {
  private pool: pg.Pool;

  constructor() {
    this.pool = new Pool(dbConfig);
  }

  async init() {
    // Tạo bảng schema_migrations nếu chưa tồn tại
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async getCurrentVersion(): Promise<number> {
    const result = await this.pool.query(
      'SELECT MAX(version) as version FROM schema_migrations'
    );
    return result.rows[0].version || 0;
  }

  private async executeMigration(sqlContent: string, direction: 'up' | 'down'): Promise<string[]> {
    const sections = sqlContent.split(`-- migrate:${direction}`);
    if (sections.length < 2) {
      throw new Error(`No migrate:${direction} section found in migration file`);
    }
    
    const migrationSQL = sections[1].split(`-- migrate:${direction === 'up' ? 'down' : 'up'}`)[0];
    return migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  async migrate() {
    await this.init();
    const currentVersion = await this.getCurrentVersion();

    // Đọc tất cả các file migration
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const version = parseInt(file.split('_')[0]);
      if (version > currentVersion) {
        console.log(`Applying migration ${file}...`);
        
        // Đọc và thực thi file migration
        const sqlPath = path.join(migrationsDir, file);
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        try {
          await this.pool.query('BEGIN');
          
          // Thực thi migration
          const statements = await this.executeMigration(sqlContent, 'up');
          
          for (const statement of statements) {
            await this.pool.query(statement);
          }
          
          // Cập nhật version
          await this.pool.query(
            'INSERT INTO schema_migrations (version) VALUES ($1)',
            [version]
          );
          
          await this.pool.query('COMMIT');
          console.log(`Migration ${file} applied successfully`);
        } catch (error) {
          await this.pool.query('ROLLBACK');
          console.error(`Error applying migration ${file}:`, error);
          throw error;
        }
      }
    }
  }

  async rollback(targetVersion?: number) {
    const currentVersion = await this.getCurrentVersion();
    if (targetVersion === undefined) {
      targetVersion = currentVersion - 1;
    }

    if (targetVersion < 0) {
      console.log('Nothing to rollback');
      return;
    }

    console.log(`Rolling back to version ${targetVersion}...`);

    try {
      // Lấy tất cả các migrations cần rollback
      const migrationsDir = path.join(__dirname, 'migrations');
      const files = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort()
        .reverse();

      for (const file of files) {
        const version = parseInt(file.split('_')[0]);
        if (version > targetVersion) {
          console.log(`Rolling back migration ${file}...`);
          
          const sqlPath = path.join(migrationsDir, file);
          const sqlContent = fs.readFileSync(sqlPath, 'utf8');

          await this.pool.query('BEGIN');
          try {
            // Thực thi down migration
            const statements = await this.executeMigration(sqlContent, 'down');
            
            for (const statement of statements) {
              await this.pool.query(statement);
            }

            // Xóa version
            await this.pool.query(
              'DELETE FROM schema_migrations WHERE version = $1',
              [version]
            );

            await this.pool.query('COMMIT');
            console.log(`Rolled back migration ${file} successfully`);
          } catch (error) {
            await this.pool.query('ROLLBACK');
            console.error(`Error rolling back migration ${file}:`, error);
            throw error;
          }
        }
      }

      console.log('Rollback completed successfully');
    } catch (error) {
      console.error('Rollback failed:', error);
      throw error;
    }
  }

  async close() {
    await this.pool.end();
  }
}

// Sử dụng Migration Manager
async function main() {
  const manager = new MigrationManager();
  try {
    if (process.argv.includes('--rollback')) {
      await manager.rollback();
    } else {
      await manager.migrate();
    }
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await manager.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 