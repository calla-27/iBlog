// app.js 
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './src/routes/userRoutes.js';
import errorHandler from './src/middlewares/errorHandler.js';
import { pool, testConnection } from './src/config/db.js';
import articleRoutes from './src/routes/articleRoutes.js';
import commentRoutes from './src/routes/commentRoutes.js';
import jwt from 'jsonwebtoken'; // 添加 jwt 导入
import uploadRoutes from './src/routes/uploadRoutes.js';

dotenv.config();
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use('/api', uploadRoutes);
app.use('/api', commentRoutes);

// 静态资源托管：封面图访问
import path from 'path';
app.use('/uploads', express.static(path.resolve('uploads')));

// 测试路由
app.get('/', (req, res) => res.send('Express + MySQL 后端已启动！'));

// 调试路由 - 放在业务路由之前
app.get('/api/debug/articles', async (req, res) => {
  try {
    // 测试直接查询
    const [articles] = await pool.execute(`
      SELECT a.*, u.username, u.avatar 
      FROM articles a 
      LEFT JOIN users u ON a.userId = u.userid 
      ORDER BY a.articleCreatedAt DESC 
      LIMIT 5
    `);
    
    const [count] = await pool.execute('SELECT COUNT(*) as count FROM articles');
    
    res.json({
      success: true,
      message: `数据库连接正常，共有 ${count[0].count} 篇文章`,
      articles: articles,
      rawData: articles.map(article => ({
        id: article.articleId,
        title: article.articleTitle,
        topics: article.articleTopics,
        topicsType: typeof article.articleTopics,
        userId: article.userId,
        userName: article.username
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '测试失败: ' + error.message,
      error: error
    });
  }
});

// 用户调试接口
app.get('/api/debug/users', async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT userid, username, email, avatar, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    const [count] = await pool.execute('SELECT COUNT(*) as count FROM users');
    
    res.json({
      success: true,
      message: `数据库连接正常，共有 ${count[0].count} 个用户`,
      users: users,
      availableEndpoints: [
        'GET /api/user/me (需要认证)',
        'GET /api/user/:id',
        'POST /api/user/register',
        'POST /api/user/login'
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '测试失败: ' + error.message,
      error: error
    });
  }
});

// 测试用户认证端点
app.get('/api/debug/auth-test', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.json({
      success: false,
      message: '未提供token',
      auth: false
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    res.json({
      success: true,
      message: 'Token验证成功',
      auth: true,
      user: decoded,
      availableEndpoints: [
        'GET /api/user/me',
        'PUT /api/user/:id/avatar',
        'PUT /api/user/:id/profile'
      ]
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Token验证失败: ' + error.message,
      auth: false
    });
  }
});

// 简单文章列表接口
app.get('/api/simple/articles', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    console.log(`📝 简单查询文章: limit=${limit}, offset=${offset}`);
    
    // 使用字符串拼接避免参数问题
    const sql = `
      SELECT 
        a.articleId, a.articleTitle, a.articleContent,
        a.articleCover, a.articleCategory, a.articleTopics,
        a.articleLikes, a.articleCollects, a.articleViews,
        a.articleCreatedAt, a.articleUpdatedAt,
        u.userid as userId, u.username as userName, u.avatar as userAvatar
      FROM articles a 
      JOIN users u ON a.userId = u.userid 
      ORDER BY a.articleCreatedAt DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    console.log('执行SQL:', sql);
    
    const [rows] = await pool.execute(sql);
    
    console.log(`📊 数据库返回 ${rows.length} 条记录`);
    
    // 格式化话题数据
    const formattedArticles = rows.map(article => {
      let articleTopics = [];
      try {
        if (typeof article.articleTopics === 'string') {
          articleTopics = JSON.parse(article.articleTopics);
        } else if (Array.isArray(article.articleTopics)) {
          articleTopics = article.articleTopics;
        }
      } catch (e) {
        console.warn('解析 articleTopics 失败:', e.message);
        articleTopics = [];
      }
      
      return {
        ...article,
        articleTopics
      };
    });

    console.log(`✅ 成功获取 ${formattedArticles.length} 篇文章`);
    
    res.json({
      success: true,
      list: formattedArticles,
      hasMore: formattedArticles.length === limit
    });
  } catch (error) {
    console.error('❌ 简单查询失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误: ' + error.message
    });
  }
});

// 业务路由
app.use('/api/user', userRoutes);
app.use('/api', articleRoutes);



// 统一错误处理
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// 启动服务器
app.listen(PORT, async () => {
  console.log(`✅ API 运行地址 → http://localhost:${PORT}`);
  
  // 只在启动时测试一次连接
  try {
    await testConnection();
    console.log('🚀 服务器启动完成，可以开始测试接口了！');
    console.log('');
    console.log('📋 测试接口列表:');
    console.log('1. 数据库调试接口: GET http://localhost:4000/api/debug/articles');
    console.log('2. 用户调试接口: GET http://localhost:4000/api/debug/users');
    console.log('3. 认证测试接口: GET http://localhost:4000/api/debug/auth-test');
    console.log('4. 简单文章列表: GET http://localhost:4000/api/simple/articles?limit=5&offset=0');
    console.log('5. 正式文章列表: GET http://localhost:4000/api/articles?limit=5&offset=0');
    console.log('');
    console.log('👤 用户相关接口:');
    console.log('• 注册: POST http://localhost:4000/api/user/register');
    console.log('• 登录: POST http://localhost:4000/api/user/login');
    console.log('• 获取当前用户: GET http://localhost:4000/api/user/me (需要认证)');
    console.log('• 获取指定用户: GET http://localhost:4000/api/user/:id');
    console.log('• 更新头像: PUT http://localhost:4000/api/user/:id/avatar (需要认证)');
    console.log('• 更新资料: PUT http://localhost:4000/api/user/:id/profile (需要认证)');
    console.log('');
    console.log('📝 文章相关接口:');
    console.log('• 获取文章列表: GET http://localhost:4000/api/articles');
    console.log('• 获取单篇文章: GET http://localhost:4000/api/articles/:id');
    console.log('• 创建文章: POST http://localhost:4000/api/articles (需要认证)');
    console.log('• 点赞文章: POST http://localhost:4000/api/articles/:id/like (需要认证)');
    console.log('• 收藏文章: POST http://localhost:4000/api/articles/:id/collect (需要认证)');
    console.log('');
    console.log('💬 评论相关接口:');
    console.log('• 获取文章评论: GET http://localhost:4000/api/articles/:id/comments');
    console.log('• 创建评论: POST http://localhost:4000/api/articles/:id/comments (需要认证)');
    console.log('• 点赞评论: POST http://localhost:4000/api/comments/:id/like (需要认证)');
    console.log('');
  } catch (error) {
    console.error('❌ 数据库连接测试失败，但服务器已启动');
  }
});