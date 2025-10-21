// src/features/home/pages/Columns.jsx
import { useState, useEffect } from 'react';
import { articleService } from '../../../services/articleService';
import ArticleCard from '../../../components/ArticleCard';
import HotFourGrid from '../../../components/HotFourGrid/HotFourGrid';
import { categories } from '../../../data/sidebarData';
import './Columns.css';
import { safeFormatDate } from '../../myblog/hooks/useMyblogComments';

const allCategories = ['全部', ...categories];

export default function Columns() {
  const [activeCategory, setActiveCategory] = useState(allCategories[0]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadArticles = async (category) => {
    setLoading(true);
    try {
      const response =
        category === '全部'
          ? await articleService.getAllArticles(100, 0)
          : await articleService.getArticlesByCategory(category, 0, 100);

      const formattedArticles = (response.list || []).map((art) => ({
        articleId: art.articleId   || art.id,
        articleTitle: art.articleTitle || art.title,
        articleContent: art.articleContent || art.summary || '',
        articleCover: art.articleCover || art.cover, // ✅ 新增：确保封面字段存在
        userName: art.userName || art.author || '未知作者',
        articleCreatedAt: safeFormatDate(art.articleCreatedAt || art.createdAt),
        articleTopics: art.articleTopics || art.topics || [],
      }));
      setArticles(formattedArticles);
    } catch (error) {
      console.error('获取文章失败:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles(activeCategory);
  }, [activeCategory]);

  return (
    <div className="columns-container">
      <div className="category-tabs">
        {allCategories.map((category) => (
          <button
            key={category}
            className={`category-tab ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 🔥 仅「全部」分类时显示热门四宫格 */}
      {activeCategory === '全部' && <HotFourGrid />}

      {loading && <p className="loading">加载中...</p>}

      {!loading && (
        <>
          {articles.length === 0 ? (
            <p className="empty">暂无文章</p>
          ) : (
            <div className="article-list">
              {articles.map((article) => (
                <ArticleCard key={article.articleId} article={article} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}