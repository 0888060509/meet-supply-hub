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

async function migrate() {
  const pool = new Pool(dbConfig);

  try {
    // Đọc file SQL
    const sqlPath = path.join(__dirname, 'database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Chia các câu lệnh SQL thành các statements riêng biệt
    const statements = sqlContent
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Thực thi từng câu lệnh
    for (const statement of statements) {
      try {
        await pool.query(statement);
        console.log('Executed:', statement.substring(0, 50) + '...');
      } catch (error) {
        console.error('Error executing statement:', statement);
        console.error('Error details:', error);
        throw error;
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Chạy migration
migrate().catch(console.error); 