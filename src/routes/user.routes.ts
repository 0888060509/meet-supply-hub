import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Route kiểm tra trùng lặp (đặt trước các routes có tham số)
router.post('/check-duplicate', authenticateToken, userController.checkDuplicateFields);

// Các routes khác
router.get('/', authenticateToken, userController.getUsers);
router.post('/', authenticateToken, userController.createUser);
router.put('/:id', authenticateToken, userController.updateUser);
router.delete('/:id', authenticateToken, userController.deleteUser);
router.post('/:id/status', authenticateToken, userController.updateUserStatus);

export default router; 