// src/features/myblog/hooks/useMyblogComments.js
import { useState, useEffect } from "react";
import { commentService } from "../../../services/commentService"; // 修复路径
import { userService } from "../../../services/userService"; // 修复路径

// 获取当前登录用户信息 - 从数据库获取
const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      // 降级到本地存储
      const savedUser = localStorage.getItem('blogUser');
      return savedUser ? JSON.parse(savedUser) : null;
    }
    
    // 从数据库获取最新用户信息
    try {
      const userData = await userService.getCurrentUser();
      if (userData) {
        localStorage.setItem('blogUser', JSON.stringify(userData));
        return userData;
      }
    } catch (apiError) {
      console.warn('API获取用户失败，使用本地存储:', apiError);
    }
    
    // 降级处理
    const savedUser = localStorage.getItem('blogUser');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (err) {
    console.warn("获取用户信息失败:", err);
    const savedUser = localStorage.getItem('blogUser');
    return savedUser ? JSON.parse(savedUser) : null;
  }
};

// 安全处理日期格式
export const safeFormatDate = (dateString) => {
  // 函数原有逻辑保持不变
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error("无效的日期格式");
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (err) {
    console.warn("日期格式化失败:", err);
    return new Date().toLocaleString();
  }
};

export default function useMyblogComments(articleId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 加载评论
  const loadComments = async () => {
    if (!articleId) return;
    
    try {
      setLoading(true);
      setError(null);
      const rawData = await commentService.getArticleComments(articleId);
      const currentUser = await getCurrentUser();
      
      const formattedComments = rawData.map(comment => {
        const isCurrentUser = currentUser && comment.userId === currentUser.userid;
        return {
          nick: isCurrentUser 
            ? currentUser.username 
            : (comment.username || '用户'),
          txt: comment.commentContent || '',
          time: safeFormatDate(comment.commentCreatedAt),
          id: comment.commentId || Date.now().toString(),
          likes: comment.commentLikes || 0,
          userId: comment.userId,
          avatar: comment.avatar || '/default-avatar.png'
        };
      });
      
      setComments(formattedComments);
      localStorage.setItem(`cmt_raw_${articleId}`, JSON.stringify(rawData));
    } catch (err) {
      console.error("加载评论错误:", err);
      setError(err.message || "加载评论失败");
      try {
        const savedRaw = localStorage.getItem(`cmt_raw_${articleId}`);
        if (savedRaw) {
          const rawData = JSON.parse(savedRaw);
          const currentUser = await getCurrentUser();
          const formattedComments = rawData.map(comment => ({
            nick: currentUser && comment.userId === currentUser.userid 
              ? currentUser.username 
              : (comment.username || '用户'),
            txt: comment.commentContent || '',
            time: safeFormatDate(comment.commentCreatedAt),
            id: comment.commentId || Date.now().toString(),
            likes: comment.commentLikes || 0,
            userId: comment.userId,
            avatar: comment.avatar || '/default-avatar.png'
          }));
          setComments(formattedComments);
        }
      } catch (storageErr) {
        console.warn("本地存储加载失败:", storageErr);
        setComments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载评论
  useEffect(() => {
    const timer = setTimeout(loadComments, 100);
    return () => clearTimeout(timer);
  }, [articleId]);

  // 添加评论
  const addComment = async (commentContent) => {
    if (!articleId || !commentContent.trim()) return false;
    
    try {
      setLoading(true);
      setError(null);
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        const tempRawComment = {
          commentId: `temp_${Date.now()}`,
          userId: null,
          username: '匿名用户',
          commentContent,
          commentCreatedAt: new Date().toISOString(),
          commentLikes: 0,
          avatar: '/default-avatar.png'
        };
        
        const formattedComment = {
          nick: '匿名用户',
          txt: commentContent,
          time: safeFormatDate(tempRawComment.commentCreatedAt),
          id: tempRawComment.commentId,
          likes: 0,
          userId: null,
          avatar: '/default-avatar.png'
        };
        
        const savedRaw = localStorage.getItem(`cmt_raw_${articleId}`);
        const rawComments = savedRaw ? JSON.parse(savedRaw) : [];
        rawComments.unshift(tempRawComment);
        localStorage.setItem(`cmt_raw_${articleId}`, JSON.stringify(rawComments));
        
        setComments([formattedComment, ...comments]);
        return true;
      }
      
      const newCommentRaw = await commentService.createComment(articleId, commentContent);
      const formattedComment = {
        nick: currentUser.username,
        txt: newCommentRaw.commentContent || commentContent,
        time: safeFormatDate(newCommentRaw.commentCreatedAt),
        id: newCommentRaw.commentId || Date.now().toString(),
        likes: newCommentRaw.commentLikes || 0,
        userId: currentUser.userid,
        avatar: newCommentRaw.avatar || currentUser.avatar || '/default-avatar.png'
      };
      
      const savedRaw = localStorage.getItem(`cmt_raw_${articleId}`);
      const rawComments = savedRaw ? JSON.parse(savedRaw) : [];
      rawComments.unshift(newCommentRaw);
      localStorage.setItem(`cmt_raw_${articleId}`, JSON.stringify(rawComments));
      
      setComments([formattedComment, ...comments]);
      return true;
    } catch (err) {
      console.error("添加评论错误:", err);
      setError(err.message || "添加评论失败");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 评论点赞
  const likeComment = async (commentId) => {
    if (!commentId) return false;
    
    try {
      await commentService.likeComment(commentId);
      setComments(prevComments => prevComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, likes: (comment.likes || 0) + 1 } 
          : comment
      ));
      
      const savedRaw = localStorage.getItem(`cmt_raw_${articleId}`);
      if (savedRaw) {
        const rawComments = JSON.parse(savedRaw).map(comment => 
          comment.commentId === commentId
            ? { ...comment, commentLikes: (comment.commentLikes || 0) + 1 }
            : comment
        );
        localStorage.setItem(`cmt_raw_${articleId}`, JSON.stringify(rawComments));
      }
      
      return true;
    } catch (err) {
      console.error("评论点赞错误:", err);
      setError(err.message || "点赞失败");
      return false;
    }
  };

  return { comments, loading, error, addComment, likeComment, loadComments };
}