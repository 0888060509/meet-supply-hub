import { Pool } from 'pg';

const pool = new Pool({
  host: 'app.riviu.com.vn',
  port: 5432,
  database: 'meetly_dev',
  user: 'root',
  password: 'PJp6xBv29pnRUZO',
  ssl: false
});

// Tạo extension unaccent nếu chưa tồn tại
pool.query('CREATE EXTENSION IF NOT EXISTS unaccent;', (err) => {
  if (err) {
    console.error('Error creating unaccent extension:', err);
  } else {
    console.log('Unaccent extension created or already exists');
  }
});

export default pool; 