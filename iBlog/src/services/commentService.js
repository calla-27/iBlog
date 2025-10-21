// src/services/commentService.js
const API_BASE = 'http://localhost:4000/api';

export const commentService = {
  // 获取文章评论 - 确保路径正确
  async getArticleComments(articleId) {
    const response = await fetch(`${API_BASE}/articles/${articleId}/comments`);
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取评论失败');
    }
    
    return data.comments;
  },
  
  // 创建评论
  async createComment(articleId, commentContent) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/articles/${articleId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ commentContent })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '创建评论失败');
    }
    
    return data.comment;
  },
  
  // 评论点赞
  async likeComment(commentId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/comments/${commentId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '点赞失败');
    }
    
    return data;
  }
};