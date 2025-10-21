// src/features/myblog/hooks/useMyblogArticles.js
import { useState, useEffect } from "react";

export default function useMyblogArticles() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 调用获取当前用户文章的API
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('❌ 用户未登录，无法获取文章');
          setError('用户未登录');
          setList([]);
          setLoading(false);
          return;
        }

        console.log('🔍 开始请求我的文章API...');
        const response = await fetch('http://localhost:4000/api/articles/my/articles', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('🔍 API响应状态:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API响应错误:', errorText);
          throw new Error(`HTTP错误: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('🔍 API返回数据:', data);
        
        if (!data.success) {
          throw new Error(data.message || '获取文章失败');
        }
        
        // 格式化数据，适配前端组件
        const formattedArticles = data.articles.map(article => ({
          file: article.articleId.toString(),
          title: article.articleTitle,
          date: new Date(article.articleCreatedAt).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }),
          content: article.articleContent,
          category: article.articleCategory,
          topics: article.articleTopics || [],
          likes: article.articleLikes || 0,
          collects: article.articleCollects || 0,
          views: article.articleViews || 0,
          cover: article.articleCover,
          raw: article
        }));
        
        console.log(`✅ 成功格式化 ${formattedArticles.length} 篇文章`);
        setList(formattedArticles);
      } catch (err) {
        console.error('❌ 获取我的文章失败:', err);
        setError(err.message);
        // 临时降级：显示空列表而不是错误
        setList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyArticles();
  }, []);

  return { list, loading, error };
}