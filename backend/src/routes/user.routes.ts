import { Router } from 'express';
import { getAllUsers, createUser, updateUser, deleteUser, updateUserStatus, checkDuplicateFields } from '../controllers/user.controller';
import { auth } from '../middleware/auth';

const router = Router();

// Tất cả các routes đều yêu cầu xác thực
router.use(auth);

// Route kiểm tra trùng lặp (đặt trước các routes có tham số)
router.post('/check-duplicate', checkDuplicateFields);

// Các routes khác
router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.put('/:id/status', updateUserStatus);

export default router; 