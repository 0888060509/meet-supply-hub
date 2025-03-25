import { Pool } from 'pg';

const pool = new Pool({
  host: 'app.riviu.com.vn',
  port: 5432,
  database: 'meetly_dev',
  user: 'root',
  password: 'PJp6xBv29pnRUZO',
  ssl: false
});

export default pool; 