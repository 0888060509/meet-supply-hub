import { Router } from 'express';
import { login, getCurrentUser } from '../controllers/auth.controller';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/me', auth, getCurrentUser);

export default router; 