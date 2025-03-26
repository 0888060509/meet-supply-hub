import { Request, Response } from 'express';
import pool from '../config/database';

// Thêm hàm chuyển đổi tiếng Việt có dấu thành không dấu
const removeAccents = (str: string) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const getAllUsers = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { page = 1, pageSize = 10, search, roleFilter, statusFilter, sortBy, sortOrder = 'asc' } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    let whereClause = '';
    const queryParams: any[] = [];
    let paramCount = 1;

    if (search) {
      const searchTerm = search as string;
      whereClause = `WHERE (
        u.name ILIKE $${paramCount} OR
        u.username ILIKE $${paramCount} OR
        u.email ILIKE $${paramCount}
      )`;
      queryParams.push(`%${searchTerm}%`);
      paramCount++;
    }

    if (roleFilter) {
      whereClause += whereClause ? ' AND' : 'WHERE';
      whereClause += ` r.name = $${paramCount}`;
      queryParams.push(roleFilter);
      paramCount++;
    }

    if (statusFilter) {
      whereClause += whereClause ? ' AND' : 'WHERE';
      whereClause += ` u.status = $${paramCount}`;
      queryParams.push(statusFilter);
      paramCount++;
    }

    // Xác định cột sắp xếp
    let orderByClause = '';
    if (sortBy) {
      const validSortFields = ['name', 'username', 'email', 'created_at', 'last_login'];
      if (validSortFields.includes(sortBy as string)) {
        orderByClause = `ORDER BY u.${sortBy} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
      }
    }

    // Query đếm tổng số bản ghi
    const countQuery = `
      SELECT COUNT(DISTINCT u.id)
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      ${whereClause}
    `;

    const countResult = await client.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Query chính với sắp xếp và phân trang
    const query = `
      SELECT 
        u.id,
        u.username,
        u.name,
        u.email,
        u.status,
        u.created_at,
        u.last_login,
        u.login_count,
        array_agg(DISTINCT r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      ${whereClause}
      GROUP BY u.id, u.username, u.name, u.email, u.status, u.created_at, u.last_login, u.login_count
      ${orderByClause}
      ${limit ? `LIMIT ${limit} OFFSET ${offset}` : ''}
    `;

    console.log('Query:', query);
    console.log('Params:', queryParams);

    const result = await client.query(query, queryParams);
    console.log('Results:', result.rows.length);
    console.log('Total:', total);

    res.json({
      data: result.rows,
      total,
      page: Number(page),
      pageSize: Number(pageSize)
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
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
    const { username, name, email, roles, status } = req.body;

    // Validate required fields
    if (!username || !name || !email) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Validation error',
        errors: {
          username: !username ? 'Username is required' : undefined,
          name: !name ? 'Name is required' : undefined,
          email: !email ? 'Email is required' : undefined
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Validation error',
        errors: {
          email: 'Invalid email format'
        }
      });
    }

    // Check if username or email already exists for other users
    const duplicateCheck = await client.query(
      'SELECT id, username, email FROM users WHERE (username = $1 OR email = $2) AND id != $3',
      [username, email, id]
    );

    if (duplicateCheck.rows.length > 0) {
      const errors: { username?: string; email?: string } = {};
      
      duplicateCheck.rows.forEach(row => {
        if (row.username === username) {
          errors.username = 'Username already exists';
        }
        if (row.email === email) {
          errors.email = 'Email already exists';
        }
      });

      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Validation error',
        errors
      });
    }

    // Update user
    const userResult = await client.query(
      'UPDATE users SET username = $1, name = $2, email = $3, status = $4 WHERE id = $5 RETURNING id, username, name, email, status, created_at',
      [username, name, email, status, id]
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
    const { username, email, userId } = req.body;
    const client = await pool.connect();

    try {
      let usernameQuery = 'SELECT id FROM users WHERE username = $1';
      let emailQuery = 'SELECT id FROM users WHERE email = $1';
      let queryParams: any[] = [];

      // Nếu có userId (trường hợp update), loại trừ user hiện tại
      if (userId) {
        usernameQuery += ' AND id != $2';
        emailQuery += ' AND id != $2';
        queryParams = [username, userId];
      } else {
        queryParams = [username];
      }

      // Kiểm tra username
      const usernameResult = await client.query(usernameQuery, queryParams);

      // Kiểm tra email
      const emailResult = await client.query(emailQuery, [email, ...(userId ? [userId] : [])]);

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