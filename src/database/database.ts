import { Pool, PoolConfig } from 'pg';
import fs from 'fs';
import path from 'path';

// Database configuration
const dbConfig: PoolConfig = {
  host: 'app.riviu.com.vn',
  port: 5432,
  database: 'meetly_dev',
  user: 'root',
  password: 'PJp6xBv29pnRUZO',
  ssl: false // Set to true if SSL is required
};

// Create a new pool instance
const pool = new Pool(dbConfig);

// Initialize database
export async function initializeDatabase() {
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Connect to database
    const client = await pool.connect();
    
    try {
      // Execute the SQL script
      await client.query(sqlContent);
      console.log('Database initialized successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Generic query function
export async function query(text: string, params?: any[]) {
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Transaction helper
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Close pool
export async function closePool() {
  await pool.end();
}

// Export pool for direct access if needed
export { pool }; 