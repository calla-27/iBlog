// src/controllers/commentController.js
import { commentModel } from '../models/commentModel.js';

export const commentController = {
  // 获取文章评论
  async getArticleComments(req, res) {
    try {
      const { articleId } = req.params;
      const comments = await commentModel.getCommentsByArticleId(articleId);
      
      res.json({
        success: true,
        comments
      });
    } catch (error) {
      console.error('获取评论失败:', error);
      res.status(500).json({
        success: false,
        message: '获取评论失败: ' + error.message
      });
    }
  },

  // 创建评论
  async createComment(req, res) {
    try {
      const { articleId } = req.params;
      const { commentContent } = req.body;
      
      if (!commentContent || commentContent.trim() === '') {
        return res.status(400).json({
          success: false,
          message: '评论内容不能为空'
        });
      }
      
      const newComment = await commentModel.createComment({
        articleId,
        userId: req.user.userid,
        commentContent
      });
      
      res.status(201).json({
        success: true,
        comment: newComment
      });
    } catch (error) {
      console.error('创建评论失败:', error);
      res.status(500).json({
        success: false,
        message: '创建评论失败: ' + error.message
      });
    }
  },

  // 评论点赞
  async likeComment(req, res) {
    try {
      const { commentId } = req.params;
      const success = await commentModel.likeComment(commentId);
      
      if (success) {
        res.json({
          success: true,
          message: '点赞成功'
        });
      } else {
        res.status(404).json({
          success: false,
          message: '评论不存在'
        });
      }
    } catch (error) {
      console.error('评论点赞失败:', error);
      res.status(500).json({
        success: false,
        message: '点赞失败: ' + error.message
      });
    }
  }
};