// src/features/myblog/pages/MyblogArticle.jsx
import MyblogHeader from "../components/MyblogHeader";
import MyblogCommentSection from "../components/MyblogCommentSection";
import { mdToHtml } from "../utils/myblog-md-util";
import s from "../styles/myblog-article.module.css";
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
// 在 MyblogArticle.jsx 顶部添加导入语句
import { safeFormatDate } from "../hooks/useMyblogComments";

export default function MyblogArticle() {
  const [search] = useSearchParams();
  const articleId = search.get("id"); // 现在id是文章的articleId

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!articleId) {
      setError("文章ID不能为空");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    // 调用真实API获取文章详情
    fetch(`http://localhost:4000/api/articles/${articleId}`)
      .then(async (r) => {
        if (!r.ok) {
          const errorData = await r.json().catch(() => ({}));
          throw new Error(errorData.message || "文章加载失败");
        }
        return r.json();
      })
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "获取文章失败");
        }
        
        const articleData = data.article;
        setArticle(articleData);
        
        // 如果内容是Markdown格式，转换为HTML
        let contentHtml;
        if (articleData.articleContent && articleData.articleContent.includes('```')) {
          // 假设是Markdown内容
          contentHtml = mdToHtml(articleData.articleContent);
        } else {
          // 假设已经是HTML内容
          contentHtml = articleData.articleContent;
        }
        
        setArticle(prev => ({ ...prev, contentHtml }));
        setLoading(false);
      })
      .catch((err) => {
        console.error('加载文章详情失败:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [articleId]);

  if (loading) return <div className={s.loading}>加载中...</div>;
  if (error) return <div className={s.error}>{error} <Link to="/myblog">返回首页</Link></div>;
  if (!article) return <div className={s.error}>文章不存在 <Link to="/myblog">返回首页</Link></div>;

  return (
    <div className={s.wrapper}>
      <MyblogHeader />
      <section className={s.detail}>
        <h1>{article.articleTitle}</h1>
        <div className={s.meta}>
          <span>发布时间: {safeFormatDate(article.articleCreatedAt)}</span>
        {article.articleUpdatedAt !== article.articleCreatedAt && (
          <span>更新时间: {safeFormatDate(article.articleUpdatedAt)}</span>
        )}
          <span>浏览: {article.articleViews}</span>
          <span>点赞: {article.articleLikes}</span>
        </div>
        {article.articleCover && (
          <img src={article.articleCover} alt="文章封面" className={s.cover} />
        )}
        <div 
          className={s.content} 
          dangerouslySetInnerHTML={{ __html: article.contentHtml || article.articleContent }} 
        />
        {article.articleTopics && article.articleTopics.length > 0 && (
          <div className={s.topics}>
            <strong>标签: </strong>
            {article.articleTopics.map(topic => (
              <span key={topic} className={s.topic}>{topic}</span>
            ))}
          </div>
        )}
        <Link to="/myblog">← 返回首页</Link>
      </section>
      <MyblogCommentSection articleId={articleId} />
    </div>
  );
}