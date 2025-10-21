// src/controllers/articleController.js
import { articleModel } from '../models/articleModel.js';
import { getFeaturedArticles as getFeaturedArticlesModel } from '../models/articleModel.js';
import { getHotTags as getHotTagsModel } from '../models/articleModel.js';
import { pool } from '../config/db.js';

// 确保每个方法都是独立的函数
const getAllArticles = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    console.log(`📝 获取文章列表: limit=${limit}, offset=${offset}`);
    
    const articles = await articleModel.getAllArticles(limit, offset);
    
    console.log(`📊 数据库返回 ${articles.length} 条记录`);
    
    // 格式化话题数据
    const formattedArticles = articles.map(article => {
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
    console.error('❌ 获取文章列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误: ' + error.message
    });
  }
};

// 在 articleController.js 的 getArticleById 方法中
const getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    console.log(`📝 获取文章详情: id=${id}`);
    
    const article = await articleModel.getArticleById(id);
    if (!article) {
      console.log(`❌ 文章不存在: id=${id}`);
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 只有在查看已发布文章时才增加浏览量
    if (article.articleStatus === 'published') {
      try {
        await articleModel.incrementViews(id);
      } catch (viewsError) {
        console.warn('增加浏览量失败:', viewsError);
        // 不阻断主流程，继续返回文章数据
      }
    }

    // 格式化话题数据
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

    const formattedArticle = {
      ...article,
      articleTopics
    };

    console.log(`✅ 成功获取文章: ${formattedArticle.articleTitle}`);
    
    res.json({
      success: true,
      article: formattedArticle
    });
  } catch (error) {
    console.error('❌ 获取文章详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误: ' + error.message
    });
  }
};

const createArticle = async (req, res, next) => {
  try {
    // 修复：统一用户ID字段名
    const currentUserId = req.user?.userid || req.user?.userId;
    
    const articleData = {
      ...req.body,
      userId: currentUserId
    };

    console.log('📝 创建文章:', articleData.articleTitle);
    console.log('🔍 创建用户ID:', articleData.userId);

    if (!articleData.articleTitle || !articleData.articleContent) {
      return res.status(400).json({
        success: false,
        message: '标题和内容不能为空'
      });
    }

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    // 处理话题标签
    if (articleData.articleTopics && Array.isArray(articleData.articleTopics)) {
      articleData.articleTopics = JSON.stringify(articleData.articleTopics);
    }

    const newArticle = await articleModel.createArticle(articleData);
    
    console.log(`✅ 文章创建成功: ID=${newArticle.articleId}`);
    
    res.status(201).json({
      success: true,
      article: newArticle
    });
  } catch (error) {
    console.error('❌ 创建文章失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误: ' + error.message
    });
  }
};

// 在 articleController.js 的 updateArticle 方法中添加
const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    console.log(`📝 更新文章: id=${id}`);
    
    // 检查文章是否存在且属于当前用户
    const existingArticle = await articleModel.getArticleById(id);
    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 修复：统一用户ID字段名
    const currentUserId = req.user?.userid || req.user?.userId;
    if (existingArticle.userId !== currentUserId) {
      console.log(`❌ 权限不足: 文章用户ID=${existingArticle.userId}, 当前用户ID=${currentUserId}`);
      return res.status(403).json({
        success: false,
        message: '无权修改此文章'
      });
    }

    const updateData = { ...req.body };
    
    // 修复：确保所有字段都有值，将 undefined 转换为 null 或空字符串
    updateData.articleTitle = updateData.articleTitle || '';
    updateData.articleContent = updateData.articleContent || '';
    updateData.articleCategory = updateData.articleCategory || '';
    updateData.articleCover = updateData.articleCover || '';
    
    // 处理话题标签
    if (updateData.articleTopics && Array.isArray(updateData.articleTopics)) {
      updateData.articleTopics = JSON.stringify(updateData.articleTopics);
    } else {
      updateData.articleTopics = '[]';
    }

    console.log('🔧 更新数据:', updateData);

    const updatedArticle = await articleModel.updateArticle(id, updateData);
    
    console.log(`✅ 文章更新成功: ID=${id}`);
    
    res.json({
      success: true,
      article: updatedArticle
    });
  } catch (error) {
    console.error('❌ 更新文章失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误: ' + error.message
    });
  }
};

const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    console.log(`📝 删除文章: id=${id}`);
    
    // 检查文章是否存在且属于当前用户
    const existingArticle = await articleModel.getArticleById(id);
    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 修复：统一用户ID字段名
    const currentUserId = req.user?.userid || req.user?.userId;
    if (existingArticle.userId !== currentUserId) {
      console.log(`❌ 权限不足: 文章用户ID=${existingArticle.userId}, 当前用户ID=${currentUserId}`);
      return res.status(403).json({
        success: false,
        message: '无权删除此文章'
      });
    }

    const deleted = await articleModel.deleteArticle(id);
    
    if (deleted) {
      console.log(`✅ 文章删除成功: ID=${id}`);
      res.json({
        success: true,
        message: '文章删除成功'
      });
    } else {
      console.log(`❌ 文章删除失败: ID=${id}`);
      res.status(500).json({
        success: false,
        message: '删除失败'
      });
    }
  } catch (error) {
    console.error('❌ 删除文章失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误: ' + error.message
    });
  }
};

const likeArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    console.log(`📝 点赞文章: id=${id}`);
    
    const success = await articleModel.likeArticle(id);
    
    if (success) {
      console.log(`✅ 点赞成功: ID=${id}`);
      res.json({
        success: true,
        message: '点赞成功'
      });
    } else {
      console.log(`❌ 文章不存在: ID=${id}`);
      res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }
  } catch (error) {
    console.error('❌ 点赞失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误: ' + error.message
    });
  }
};

const collectArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    console.log(`📝 收藏文章: id=${id}`);
    
    const success = await articleModel.collectArticle(id);
    
    if (success) {
      console.log(`✅ 收藏成功: ID=${id}`);
      res.json({
        success: true,
        message: '收藏成功'
      });
    } else {
      console.log(`❌ 文章不存在: ID=${id}`);
      res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }
  } catch (error) {
    console.error('❌ 收藏失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误: ' + error.message
    });
  }
};

const getUserArticles = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    console.log(`📝 获取用户文章: userId=${userId}, limit=${limit}, offset=${offset}`);
    
    const articles = await articleModel.getArticlesByUserId(userId, limit, offset);
    
    const formattedArticles = articles.map(article => ({
      ...article,
      articleTopics: typeof article.articleTopics === 'string' 
        ? JSON.parse(article.articleTopics) 
        : article.articleTopics
    }));

    console.log(`✅ 成功获取用户 ${userId} 的 ${formattedArticles.length} 篇文章`);
    
    res.json({
      success: true,
      articles: formattedArticles
    });
  } catch (error) {
    console.error('❌ 获取用户文章失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误: ' + error.message
    });
  }
};

// 新增：获取当前用户的文章
const getMyArticles = async (req, res, next) => {
  try {
    console.log('🔍 getMyArticles 开始执行');
    console.log('🔍 req.user:', req.user);
    
    if (!req.user) {
      console.log('❌ 用户未认证');
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }
    
    // 修复：统一用户ID字段名（JWT中是 userid，不是 userId）
    const userId = req.user.userid || req.user.userId;
    console.log(`🔍 当前用户ID: ${userId}`);
    
    if (!userId) {
      console.log('❌ 用户ID不存在');
      return res.status(400).json({
        success: false,
        message: '用户ID不存在'
      });
    }

    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    console.log(`📝 获取当前用户文章: userId=${userId}, limit=${limit}, offset=${offset}`);
    
    const articles = await articleModel.getArticlesByUserId(userId, limit, offset);
    
    console.log(`📊 数据库返回 ${articles.length} 条记录`);
    
    // 格式化话题数据
    const formattedArticles = articles.map(article => {
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

    console.log(`✅ 成功获取当前用户 ${formattedArticles.length} 篇文章`);
    
    res.json({
      success: true,
      articles: formattedArticles,
      hasMore: formattedArticles.length === limit
    });
  } catch (error) {
    console.error('❌ 获取当前用户文章失败:', error);
    console.error('❌ 错误堆栈:', error.stack);
    res.status(500).json({
      success: false,
      message: '服务器内部错误: ' + error.message
    });
  }
};

// 搜索文章
const searchArticles = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: '搜索关键词不能为空'
      });
    }
    
    console.log(`🔍 搜索文章: keyword=${keyword}, limit=${limit}, offset=${offset}`);
    
    const articles = await articleModel.searchArticles(keyword, limit, offset);
    
    // 格式化话题数据
    const formattedArticles = articles.map(article => {
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

    console.log(`✅ 搜索到 ${formattedArticles.length} 篇相关文章`);
    
    res.json({
      success: true,
      list: formattedArticles,
      hasMore: formattedArticles.length === limit
    });
  } catch (error) {
    console.error('❌ 搜索文章失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误: ' + error.message
    });
  }
};

// 在 articleController.js 中添加以下方法

// 获取当前用户的草稿文章
const getMyDrafts = async (req, res, next) => {
  try {
    console.log('🔍 getMyDrafts 开始执行');
    console.log('🔍 req.user:', req.user);
    
    if (!req.user) {
      console.log('❌ 用户未认证');
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }
    
    const userId = req.user.userid || req.user.userId;
    console.log(`🔍 当前用户ID: ${userId}`);
    
    if (!userId) {
      console.log('❌ 用户ID不存在');
      return res.status(400).json({
        success: false,
        message: '用户ID不存在'
      });
    }

    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    console.log(`📝 获取当前用户草稿: userId=${userId}, limit=${limit}, offset=${offset}`);
    
    const articles = await articleModel.getDraftArticlesByUserId(userId, limit, offset);
    
    console.log(`📊 数据库返回 ${articles.length} 条草稿记录`);
    
    // 格式化话题数据
    const formattedArticles = articles.map(article => {
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

    console.log(`✅ 成功获取当前用户 ${formattedArticles.length} 篇草稿`);
    
    res.json({
      success: true,
      articles: formattedArticles,
      hasMore: formattedArticles.length === limit
    });
  } catch (error) {
    console.error('❌ 获取草稿文章失败:', error);
    console.error('❌ 错误堆栈:', error.stack);
    res.status(500).json({
      success: false,
      message: '服务器内部错误: ' + error.message
    });
  }
};

// 精选博客：随机 5 篇高互动文章
const getFeaturedArticles = async (req, res, next) => {
  try {
    // 复用 model 层已导出的函数，别再 pool.query
    const list = await getFeaturedArticlesModel();
    res.json({ success: true, list });
  } catch (e) {
    console.error('❌ 精选接口异常:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

const getHotTags = async (req, res, next) => {
  try {
    const list = await getHotTagsModel(20, 5); // 前 20 随机 5
    res.json({ success: true, list });
  } catch (e) {
    console.error('❌ 热门标签接口异常:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

// ==================  热门博客（浏览量>1000） ==================
const getHotArticles = async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        a.articleId               AS id,
        a.articleTitle            AS title,
        LEFT(a.articleContent,120) AS summary,
        a.articleCover            AS coverUrl,
        a.articleViews            AS views,
        a.articleCreatedAt        AS createdAt,
        u.userid                  AS userId,
        u.username                AS userName,
        u.avatar                  AS userAvatar
      FROM articles a
      JOIN users u ON a.userId = u.userid
      WHERE a.articleStatus = 'published'
        AND a.articleViews > 1000
      ORDER BY a.articleViews DESC
      LIMIT 30
    `;
    const [rows] = await pool.execute(sql);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('❌ 热门文章查询失败:', err);
    next(err);
  }
};
const getArticlesByCategory = async (req, res, next) => {
  try {
    const { category } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: '分类参数不能为空'
      });
    }
    
    console.log(`📝 获取分类文章: category=${category}, limit=${limit}, offset=${offset}`);
    
    const articles = await articleModel.getArticlesByCategory(category, limit, offset);
    
    // 格式化话题数据
    const formattedArticles = articles.map(article => {
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

    console.log(`✅ 成功获取 ${category} 分类下的 ${formattedArticles.length} 篇文章`);
    
    res.json({
      success: true,
      list: formattedArticles,
      hasMore: formattedArticles.length === limit
    });
  } catch (error) {
    console.error('❌ 获取分类文章失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误: ' + error.message
    });
  }
};

// 在导出的控制器对象中添加新方法
export const articleController = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  likeArticle,
  collectArticle,
  getUserArticles,
  searchArticles,
  getMyArticles,
  getMyDrafts,
  getFeaturedArticles,
  getHotTags,
  getHotArticles,
  getArticlesByCategory
};