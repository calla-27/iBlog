// src/models/articleModel.js
import { pool } from '../config/db.js';

export const articleModel = {
  // 现有的方法...
  
  // 增加浏览量
  async incrementViews(articleId) {
    try {
      const [result] = await pool.execute(
        'UPDATE articles SET articleViews = articleViews + 1 WHERE articleId = ?',
        [parseInt(articleId)]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('增加浏览量失败:', error);
      throw error;
    }
  },

  // 其他现有方法保持不变...
  async getAllArticles(limit = 10, offset = 0) {
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    
    const sql = `SELECT 
        a.articleId, a.articleTitle, a.articleContent, 
        a.articleCover, a.articleCategory, a.articleTopics,
        a.articleLikes, a.articleCollects, a.articleViews,
        a.articleStatus, a.articleCreatedAt, a.articleUpdatedAt,
        u.userid as userId, u.username as userName, u.avatar as userAvatar
       FROM articles a 
       JOIN users u ON a.userId = u.userid 
       WHERE a.articleStatus = 'published'
       ORDER BY a.articleCreatedAt DESC 
       LIMIT ${limitNum} OFFSET ${offsetNum}`;
    
    console.log('执行SQL:', sql);
    
    const [rows] = await pool.execute(sql);
    return rows;
  },

  async getArticleById(articleId) {
    const [rows] = await pool.execute(
      `SELECT 
        a.articleId, a.articleTitle, a.articleContent, 
        a.articleCover, a.articleCategory, a.articleTopics,
        a.articleLikes, a.articleCollects, a.articleViews,
        a.articleStatus, a.articleCreatedAt, a.articleUpdatedAt,
        u.userid as userId, u.username as userName, u.avatar as userAvatar
       FROM articles a 
       JOIN users u ON a.userId = u.userid 
       WHERE a.articleId = ?`,
      [parseInt(articleId)]
    );
    return rows[0];
  },

  async createArticle(articleData) {
    const {
      articleTitle,
      articleContent,
      articleCover = '',
      articleCategory = '',
      articleTopics = '[]',
      articleStatus = 'published',
      userId
    } = articleData;

    const [result] = await pool.execute(
      `INSERT INTO articles 
       (articleTitle, articleContent, articleCover, articleCategory, articleTopics, articleStatus, userId) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [articleTitle, articleContent, articleCover, articleCategory, articleTopics, articleStatus, parseInt(userId)]
    );

    return this.getArticleById(result.insertId);
  },

  async updateArticle(articleId, articleData) {
    const {
      articleTitle,
      articleContent,
      articleCover,
      articleCategory,
      articleTopics,
      articleStatus
    } = articleData;

    await pool.execute(
      `UPDATE articles 
       SET articleTitle = ?, articleContent = ?, articleCover = ?, 
           articleCategory = ?, articleTopics = ?, articleStatus = ?, articleUpdatedAt = CURRENT_TIMESTAMP 
       WHERE articleId = ?`,
      [articleTitle, articleContent, articleCover, articleCategory, articleTopics, articleStatus, parseInt(articleId)]
    );

    return this.getArticleById(articleId);
  },

  async deleteArticle(articleId) {
    const [result] = await pool.execute(
      'DELETE FROM articles WHERE articleId = ?',
      [parseInt(articleId)]
    );
    return result.affectedRows > 0;
  },

  async likeArticle(articleId) {
    const [result] = await pool.execute(
      'UPDATE articles SET articleLikes = articleLikes + 1 WHERE articleId = ?',
      [parseInt(articleId)]
    );
    return result.affectedRows > 0;
  },

  async collectArticle(articleId) {
    const [result] = await pool.execute(
      'UPDATE articles SET articleCollects = articleCollects + 1 WHERE articleId = ?',
      [parseInt(articleId)]
    );
    return result.affectedRows > 0;
  },

  async getDraftArticlesByUserId(userId, limit = 10, offset = 0) {
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    
    const sql = `SELECT * FROM articles 
       WHERE userId = ${parseInt(userId)} AND articleStatus = 'draft'
       ORDER BY articleUpdatedAt DESC 
       LIMIT ${limitNum} OFFSET ${offsetNum}`;
    
    const [rows] = await pool.execute(sql);
    return rows;
  },

  async getArticlesByUserId(userId, limit = 10, offset = 0) {
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    
    const sql = `SELECT * FROM articles 
       WHERE userId = ${parseInt(userId)} AND articleStatus = 'published'
       ORDER BY articleCreatedAt DESC 
       LIMIT ${limitNum} OFFSET ${offsetNum}`;
    
    const [rows] = await pool.execute(sql);
    return rows;
  },

  async searchArticles(keyword, limit = 10, offset = 0) {
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const searchTerm = `%${keyword}%`;

    const sql = `SELECT 
        a.articleId, a.articleTitle, a.articleContent, 
        a.articleCover, a.articleCategory, a.articleTopics,
        a.articleLikes, a.articleCollects, a.articleViews,
        a.articleStatus, a.articleCreatedAt, a.articleUpdatedAt,
        u.userid as userId, u.username as userName, u.avatar as userAvatar
       FROM articles a 
       JOIN users u ON a.userId = u.userid 
       WHERE a.articleStatus = 'published'
         AND (a.articleTitle LIKE ? 
          OR a.articleContent LIKE ? 
          OR a.articleTopics LIKE ? 
          OR a.articleCategory LIKE ?)
       ORDER BY a.articleCreatedAt DESC 
       LIMIT ${limitNum} OFFSET ${offsetNum}`;
    
    console.log('执行搜索SQL:', sql);
    
    const [rows] = await pool.execute(sql, [
      searchTerm, 
      searchTerm, 
      searchTerm, 
      searchTerm
    ]);
    return rows;
  },
  async getArticlesByCategory(category, limit = 10, offset = 0) {
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    
    const sql = `SELECT 
        a.articleId, a.articleTitle, a.articleContent, 
        a.articleCover, a.articleCategory, a.articleTopics,
        a.articleLikes, a.articleCollects, a.articleViews,
        a.articleStatus, a.articleCreatedAt, a.articleUpdatedAt,
        u.userid as userId, u.username as userName, u.avatar as userAvatar
       FROM articles a 
       JOIN users u ON a.userId = u.userid 
       WHERE a.articleStatus = 'published'
         AND a.articleCategory = ?
       ORDER BY a.articleCreatedAt DESC 
       LIMIT ${limitNum} OFFSET ${offsetNum}`;
    
    console.log('执行分类查询SQL:', sql);
    
    const [rows] = await pool.execute(sql, [category]);
    return rows;
  }
};


// 随机取 5 篇高互动文章（精选侧栏用）
export async function getFeaturedArticles() {
  const sql = `
    SELECT articleId, articleTitle
    FROM   articles
    WHERE  articleLikes   > 100
      AND  articleCollects > 100
      AND  articleViews   > 100
      AND  articleStatus  = 'published'
    ORDER BY RAND()
    LIMIT 5`;
  const [rows] = await pool.query(sql);   // 本文件已有 pool
  return rows;
}

/* 热门标签 */
export async function getHotTags(limit = 20, pick = 5) {
  // 1️⃣ 取已发布文章的标签数组（Node 里已解析成数组）
  const [rows] = await pool.query(
    `SELECT articleId, articleTopics
     FROM   articles
     WHERE  articleStatus = 'published'`
  );

  // 2️⃣ 扁平 + 计数（**不再 JSON.parse**）
  const counter = {};
  rows.forEach(({ articleTopics }) => {
    // 此时 articleTopics 是数组！
    if (Array.isArray(articleTopics)) {
      articleTopics.forEach(t => {
        if (t) counter[t] = (counter[t] || 0) + 1;
      });
    }
  });

  // 3️⃣ 排序 + 随机
  const top20 = Object.entries(counter)
    .map(([tag, used]) => ({ tag, used }))
    .sort((a, b) => b.used - a.used)   // 保证高优在前
    .slice(0, limit);

  console.log('【hot-tags】Top20:', top20);   // 看这里
  return top20.sort(() => Math.random() - 0.5).slice(0, pick);
}