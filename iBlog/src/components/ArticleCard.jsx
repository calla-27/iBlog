import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./ArticleCard.css";

// 简易去标签+截断
const plainText = (html = '') =>
  html.replace(/<[^>]+>/g, '').slice(0, 120) + '...';

// 图片URL处理函数
const getImageUrl = (coverPath) => {
  if (!coverPath || coverPath === 'undefined' || coverPath === 'null') {
    return '/default-cover.jpg';
  }
  const normalizedPath = coverPath.startsWith('/') ? coverPath : `/${coverPath}`;
  return `http://localhost:4000${normalizedPath}`;
};

// 格式化数字显示
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + '千';
  }
  return num;
};

export default function ArticleCard({ article }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  // 在组件挂载时设置图片URL
  useEffect(() => {
    const url = getImageUrl(article.articleCover);
    setCurrentImageUrl(url);
    setImageLoaded(false);
    setImageError(false);
  }, [article.articleCover]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    setImageError(true);
    setImageLoaded(true);
    setCurrentImageUrl('/default-cover.jpg');
  };

  return (
    <div className="article-card">
      <div className="article-card-left">
        <h2><Link to={`/article/${article.articleId}`}>{article.articleTitle}</Link></h2>
        <p>{plainText(article.articleContent)}</p>
        
        {/* 作者和日期信息 */}
        <div className="meta">
          <span className="author">{article.userName}</span>
          <span className="date">{article.articleCreatedAt}</span>
        </div>
        
        {/* 点赞、收藏、浏览量统计 */}
        <div className="article-stats">
          <div className="stat-item">
            <span className="stat-icon">👍</span>
            <span className="stat-number">{formatNumber(article.articleLikes || 0)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">❤️</span>
            <span className="stat-number">{formatNumber(article.articleCollects || 0)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">👁️</span>
            <span className="stat-number">{formatNumber(article.articleViews || 0)}</span>
          </div>
        </div>
        
        {/* 标签区域 */}
        <div className="tags">
          {article.articleTopics.map((tag, idx) => (
            <span key={idx} className="tag">{tag}</span>
          ))}
        </div>
      </div>

      <div className="article-card-right">
        <img
          src={currentImageUrl}
          alt="cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={imageLoaded ? "loaded" : "loading"}
        />
      </div>
    </div>
  );
}