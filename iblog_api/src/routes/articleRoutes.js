import express from 'express';
import { articleController } from '../controllers/articleController.js';
import { authenticate, optionalAuthenticate } from '../middlewares/authenticate.js';

const router = express.Router();

/* 1. 固定路由 */
router.get('/articles', optionalAuthenticate, articleController.getAllArticles);
router.get('/articles/search', optionalAuthenticate, articleController.searchArticles);
router.get('/articles/featured', optionalAuthenticate, articleController.getFeaturedArticles); // ← 新增
router.get('/articles/hot-tags', optionalAuthenticate, articleController.getHotTags);
router.get('/users/:userId/articles', articleController.getUserArticles);
router.get('/articles/my/articles', authenticate, articleController.getMyArticles);
router.get('/articles/my/drafts', authenticate, articleController.getMyDrafts);
router.get('/articles/hot', optionalAuthenticate, articleController.getHotArticles);

/* 2. 动态参数路由 */
router.get('/articles/:id', optionalAuthenticate, articleController.getArticleById);

/* 3. 需要认证的路由 */
router.post('/articles', authenticate, articleController.createArticle);
router.put('/articles/:id', authenticate, articleController.updateArticle);
router.delete('/articles/:id', authenticate, articleController.deleteArticle);
router.post('/articles/:id/like', authenticate, articleController.likeArticle);
router.post('/articles/:id/collect', authenticate, articleController.collectArticle);

export default router;