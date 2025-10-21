// src/routes/userRoutes.js
import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  getUserById, 
  updateAvatar, 
  updateProfile 
} from '../controllers/userController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

// 公开路由
router.post('/register', register);
router.post('/login', login);

// 需要认证的路由
router.get('/me', authenticate, getMe);  // 确保这行存在
router.get('/:id', getUserById);
router.put('/:id/avatar', authenticate, updateAvatar);
router.put('/:id/profile', authenticate, updateProfile);

export default router;