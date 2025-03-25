import { Request, Response } from 'express';
import pool from '../config/database';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.username, 
        u.name,
        u.email,
        u.status,
        u.created_at,
        u.last_login,
        u.login_count,
        ARRAY_AGG(r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id, u.username, u.name, u.email, u.status, u.created_at, u.last_login, u.login_count
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { username, password, name, email, roles } = req.body;

    // Insert user
    const userResult = await client.query(
      'INSERT INTO users (username, password_hash, name, email) VALUES ($1, MD5($2 || \'henry@cuong\'), $3, $4) RETURNING id, username, name, email, created_at',
      [username, password, name, email]
    );

    const user = userResult.rows[0];

    // Get role IDs
    const roleIds = await client.query(
      'SELECT id FROM roles WHERE name = ANY($1::varchar[])',
      [roles]
    );

    // Insert user roles
    for (const role of roleIds.rows) {
      await client.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
        [user.id, role.id]
      );
    }

    // Get complete user data with roles
    const finalResult = await client.query(`
      SELECT 
        u.id, 
        u.username, 
        u.name,
        u.email,
        u.status,
        u.created_at,
        u.last_login,
        u.login_count,
        ARRAY_AGG(r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1
      GROUP BY u.id, u.username, u.name, u.email, u.status, u.created_at, u.last_login, u.login_count
    `, [user.id]);

    await client.query('COMMIT');
    res.status(201).json(finalResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { username, name, roles } = req.body;

    // Update user
    const userResult = await client.query(
      'UPDATE users SET username = $1, name = $2 WHERE id = $3 RETURNING id, username, name, created_at',
      [username, name, id]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete existing roles
    await client.query('DELETE FROM user_roles WHERE user_id = $1', [id]);

    // Get role IDs
    const roleIds = await client.query(
      'SELECT id FROM roles WHERE name = ANY($1::varchar[])',
      [roles]
    );

    // Insert new roles
    for (const role of roleIds.rows) {
      await client.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
        [id, role.id]
      );
    }

    // Get complete user data with roles
    const finalResult = await client.query(`
      SELECT 
        u.id, 
        u.username, 
        u.name, 
        u.created_at,
        ARRAY_AGG(r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1
      GROUP BY u.id, u.username, u.name, u.created_at
    `, [id]);

    await client.query('COMMIT');
    res.json(finalResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Update user status
    const result = await client.query(`
      UPDATE users 
      SET status = $1 
      WHERE id = $2 
      RETURNING id, username, name, email, status, created_at, last_login, login_count
    `, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get complete user data with roles
    const finalResult = await client.query(`
      SELECT 
        u.id, 
        u.username, 
        u.name,
        u.email,
        u.status,
        u.created_at,
        u.last_login,
        u.login_count,
        ARRAY_AGG(r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1
      GROUP BY u.id, u.username, u.name, u.email, u.status, u.created_at, u.last_login, u.login_count
    `, [id]);

    res.json(finalResult.rows[0]);
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const checkDuplicateFields = async (req: Request, res: Response) => {
  try {
    const { username, email } = req.body;
    const client = await pool.connect();

    try {
      // Kiểm tra username
      const usernameResult = await client.query(
        'SELECT id FROM users WHERE username = $1',
        [username]
      );

      // Kiểm tra email
      const emailResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      res.json({
        duplicateUsername: usernameResult.rows.length > 0,
        duplicateEmail: emailResult.rows.length > 0
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error checking duplicate fields:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 