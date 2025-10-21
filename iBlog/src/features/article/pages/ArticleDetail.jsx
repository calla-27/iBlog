import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { articleService } from "../../../services/articleService";
import "./ArticleDetail.css";
import MyblogCommentSection from "../../myblog/components/MyblogCommentSection";

export default function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 拉取真实文章
  useEffect(() => {
    setLoading(true);
    articleService
      .getArticleById(id)
      .then(({ article: data }) => setArticle(data))
      .catch((e) => setError(e.message || "文章加载失败"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>加载中…</p>;
  if (error) return <p>❌ {error}</p>;
  if (!article) return <p>文章不存在</p>;

  // 处理封面图片URL
  const getCoverUrl = (coverPath) => {
    if (!coverPath || coverPath === 'undefined' || coverPath === 'null') {
      return '/default-cover.jpg';
    }
    // 如果已经是完整URL，直接返回
    if (coverPath.startsWith('http')) {
      return coverPath;
    }
    // 确保不以斜杠开头，避免双斜杠
    const normalizedPath = coverPath.startsWith('/') ? coverPath : `/${coverPath}`;
    return `http://localhost:4000${normalizedPath}`;
  };

  const coverUrl = getCoverUrl(article.articleCover);

  // 点赞 / 收藏
  const handleLike = async () => {
    await articleService.likeArticle(article.articleId);
    setArticle({ ...article, articleLikes: article.articleLikes + 1 });
  };
  const handleCollect = async () => {
    await articleService.collectArticle(article.articleId);
    setArticle({ ...article, articleCollects: article.articleCollects + 1 });
  };

  // 相关文章（同话题）
  const related = []; // 后续可换接口

  return (
    <div className="article-detail">
      <h1>{article.articleTitle}</h1>
      <div className="meta">
        {article.userName} · {new Date(article.articleCreatedAt).toLocaleString()}
      </div>

      {/* 封面图 */}
      {article.articleCover && (
        <div className="cover-container">
          <img 
            src={coverUrl} 
            alt="cover" 
            className="cover-img"
            onError={(e) => {
              e.target.src = '/default-cover.jpg';
            }}
          />
        </div>
      )}

      {/* 正文 */}
      <div
        className="content"
        dangerouslySetInnerHTML={{ __html: article.articleContent }}
      />

      {/* 点赞 / 收藏 / 浏览 */}
      <div className="article-meta">
        <span className="like-btn" onClick={handleLike}>
          👍 {article.articleLikes}
        </span>
        <span className="collect-btn" onClick={handleCollect}>
          ⭐ {article.articleCollects}
        </span>
        <span>👀 {article.articleViews}</span>
      </div>

      {/* 新评论区组件 */}
      <MyblogCommentSection articleId={article.articleId} />

      {/* 相关推荐（占位） */}
      <div className="related-articles">
        <h3>相关推荐</h3>
        {related.length ? (
          <ul>
            {related.map((a) => (
              <li key={a.articleId}>
                <Link to={`/article/${a.articleId}`}>{a.articleTitle}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>暂无相关文章</p>
        )}
      </div>
    </div>
  );
}