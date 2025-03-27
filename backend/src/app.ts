import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

const app = express();
const port = process.env.PORT || 3000;

// Cấu hình CORS trước các middleware khác
const corsOptions = {
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// Áp dụng CORS cho tất cả routes
app.use(cors(corsOptions));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Origin:', req.headers.origin);
  next();
});

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Khởi tạo database
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'meetly',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Tạo unaccent extension
const createUnaccentExtension = async () => {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS unaccent;');
    console.log('Unaccent extension created or already exists');
  } catch (error) {
    console.error('Error creating unaccent extension:', error);
  }
};

// Khởi tạo database và extensions
createUnaccentExtension();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('CORS enabled for http://localhost:8080');
});

export default app; 