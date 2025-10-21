// src/models/commentModel.js
import { pool } from '../config/db.js';

// 获取文章评论
export const getCommentsByArticleId = async (articleId) => {
  try {
    const sql = `
      SELECT 
        c.*,
        u.username,
        u.avatar,
        u.userid
      FROM article_comments c
      LEFT JOIN users u ON c.userId = u.userid
      WHERE c.articleId = ?
      ORDER BY c.commentCreatedAt DESC
    `;
    
    console.log(`🔍 执行评论查询SQL: articleId=${articleId}`);
    
    const [results] = await pool.execute(sql, [articleId]);
    console.log(`✅ 评论查询成功，返回 ${results.length} 条评论`);
    return results;
  } catch (err) {
    console.error('❌ 评论查询失败:', err);
    throw err;
  }
};

// 检查文章是否存在
export const checkArticleExists = async (articleId) => {
  try {
    const sql = `SELECT articleId FROM articles WHERE articleId = ?`;
    const [results] = await pool.execute(sql, [articleId]);
    return results.length > 0;
  } catch (err) {
    console.error('❌ 检查文章存在失败:', err);
    throw err;
  }
};

// 创建评论
export const createComment = async (commentData) => {
  try {
    const sql = `
      INSERT INTO article_comments 
      (articleId, userId, commentContent) 
      VALUES (?, ?, ?)
    `;
    const values = [
      commentData.articleId,
      commentData.userId,
      commentData.commentContent
    ];
    
    console.log('🔍 创建评论SQL参数:', values);
    
    const [result] = await pool.execute(sql, values);
    
    // 获取新创建的评论完整信息
    const getCommentSql = `
      SELECT 
        c.*,
        u.username,
        u.avatar,
        u.userid
      FROM article_comments c
      LEFT JOIN users u ON c.userId = u.userid
      WHERE c.commentId = ?
    `;
    
    const [comments] = await pool.execute(getCommentSql, [result.insertId]);
    console.log(`✅ 评论创建成功，ID: ${result.insertId}`);
    return comments[0];
  } catch (err) {
    console.error('❌ 创建评论失败:', err);
    throw err;
  }
};

// 评论点赞
export const likeComment = async (commentId) => {
  try {
    const sql = `
      UPDATE article_comments 
      SET commentLikes = commentLikes + 1 
      WHERE commentId = ?
    `;
    
    const [result] = await pool.execute(sql, [commentId]);
    const success = result.affectedRows > 0;
    console.log(`✅ 评论点赞${success ? '成功' : '失败'}: ID=${commentId}`);
    return success;
  } catch (err) {
    console.error('❌ 评论点赞失败:', err);
    throw err;
  }
};

// 导出所有方法
export const commentModel = {
  getCommentsByArticleId,
  checkArticleExists,
  createComment,
  likeComment
};