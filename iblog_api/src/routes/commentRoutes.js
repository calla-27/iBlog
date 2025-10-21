import express from 'express';
import { commentController } from '../controllers/commentController.js';
import { authenticate, optionalAuthenticate } from '../middlewares/authenticate.js';

const router = express.Router();

// 获取文章评论（不需要登录也能看）
router.get('/articles/:articleId/comments', optionalAuthenticate, commentController.getArticleComments);

// 创建评论（需要登录）
router.post('/articles/:articleId/comments', authenticate, commentController.createComment);

// 评论点赞（需要登录）
router.post('/comments/:commentId/like', authenticate, commentController.likeComment);

export default router;