import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

const JWT_SECRET = 'your-secret-key';

export const login = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { username, password } = req.body;

    // Get user with roles and check status
    const result = await client.query(`
      SELECT 
        u.id, 
        u.username, 
        u.name, 
        u.email,
        u.status,
        u.password_hash,
        u.created_at,
        u.last_login,
        u.login_count,
        ARRAY_REMOVE(ARRAY_AGG(r.name), NULL) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.username = $1
      GROUP BY u.id, u.username, u.name, u.email, u.status, u.password_hash, u.created_at, u.last_login, u.login_count
    `, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if user is active
    if (user.status === 'inactive') {
      return res.status(403).json({ 
        error: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Verify password
    const passwordCheck = await client.query(
      'SELECT MD5($1 || \'henry@cuong\') = $2 as match',
      [password, user.password_hash]
    );

    if (!passwordCheck.rows[0].match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Ensure roles is an array
    if (!user.roles) {
      user.roles = [];
    }

    // Update last_login and login_count
    await client.query(`
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP,
          login_count = COALESCE(login_count, 0) + 1
      WHERE id = $1
    `, [user.id]);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    // Remove password_hash from response
    const { password_hash: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const result = await pool.query(`
      SELECT 
        u.id, 
        u.username, 
        u.name, 
        u.created_at,
        ARRAY_REMOVE(ARRAY_AGG(r.name), NULL) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1
      GROUP BY u.id, u.username, u.name, u.created_at
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure roles is an array
    if (!result.rows[0].roles) {
      result.rows[0].roles = [];
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 