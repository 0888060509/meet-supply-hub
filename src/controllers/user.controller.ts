import { Request, Response } from 'express';
import { db } from '../database';

export const checkDuplicateFields = async (req: Request, res: Response) => {
  try {
    const { username, email } = req.body;

    // Kiểm tra username
    const duplicateUsername = await db.oneOrNone(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    // Kiểm tra email
    const duplicateEmail = await db.oneOrNone(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    res.json({
      duplicateUsername: !!duplicateUsername,
      duplicateEmail: !!duplicateEmail
    });
  } catch (error) {
    console.error('Error checking duplicate fields:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 