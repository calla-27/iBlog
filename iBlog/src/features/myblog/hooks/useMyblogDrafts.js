// src/features/myblog/hooks/useMyblogDrafts.js
import { useState, useEffect } from 'react';

const useMyblogDrafts = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('用户未登录');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:4000/api/articles/my/drafts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('获取草稿失败');
        }

        const result = await response.json();
        
        if (result.success) {
          // 转换数据格式以匹配前端期望的结构
          const formattedDrafts = result.articles.map(article => ({
            file: article.articleId.toString(),
            title: article.articleTitle,
            content: article.articleContent,
            date: new Date(article.articleUpdatedAt).toLocaleDateString(),
            topics: article.articleTopics || [],
            likes: article.articleLikes || 0,
            views: article.articleViews || 0,
            collects: article.articleCollects || 0,
            status: article.articleStatus
          }));
          
          setDrafts(formattedDrafts);
        } else {
          throw new Error(result.message || '获取草稿失败');
        }
      } catch (err) {
        console.error('获取草稿失败:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, []);

  return { drafts, loading, error };
};

export default useMyblogDrafts;