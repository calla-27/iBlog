// src/features/myblog/pages/MyblogHome.jsx
import MyblogHeader from "../components/MyblogHeader";
import useMyblogArticles from "../hooks/useMyblogArticles";
import useMyblogDrafts from "../hooks/useMyblogDrafts"; // 新增：导入草稿Hook
import s from "../styles/myblog-home.module.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useMyblogAvatar from "../hooks/useMyblogAvatar";

const PER_PAGE = 5;

export default function MyblogHome() {
  const nav = useNavigate();
  const { list: publishedArticles, loading: articlesLoading, error: articlesError } = useMyblogArticles();
  const { drafts, loading: draftsLoading, error: draftsError } = useMyblogDrafts(); // 新增：草稿数据
  const { avatar, user, loading: userLoading, error: userError, refreshUser } = useMyblogAvatar();
  const [visible, setVisible] = useState(PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expanded, setExpanded] = useState({
    about: false,
    contact: false
  });
  const [activeTab, setActiveTab] = useState('published'); // 'published' 或 'drafts'

  // 如果没有用户数据但已登录，尝试刷新
  useEffect(() => {
    if (!user && !userLoading && localStorage.getItem('token')) {
      refreshUser();
    }
  }, [user, userLoading, refreshUser]);

  // 根据当前标签选择显示的数据
  const currentList = activeTab === 'published' ? publishedArticles : drafts;
  const currentLoading = activeTab === 'published' ? articlesLoading : draftsLoading;
  const currentError = activeTab === 'published' ? articlesError : draftsError;

  const loadMore = () => {
    if (loadingMore || visible >= currentList.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisible((prev) => Math.min(prev + PER_PAGE, currentList.length));
      setLoadingMore(false);
    }, 500);
  };

  const toggleExpand = (type) => {
    setExpanded(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // 切换标签时重置可见数量
  useEffect(() => {
    setVisible(PER_PAGE);
  }, [activeTab]);

  // 显示加载状态
  if (userLoading || currentLoading) {
    return (
      <div className={s.wrapper}>
        <MyblogHeader />
        <div className={s.loading}>加载中...</div>
      </div>
    );
  }

  // 显示错误状态
  if (currentError) {
    return (
      <div className={s.wrapper}>
        <MyblogHeader />
        <div className={s.error}>
          加载{activeTab === 'published' ? '文章' : '草稿'}失败: {currentError}
          <button onClick={() => window.location.reload()} className={s.retryBtn}>
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={s.wrapper}>
      <MyblogHeader />
      
      {/* 头像、名字、关注粉丝及展开区域 */}
      <section className={s.profileArea}>
        <img src={avatar} alt="个人头像" className={s.avatar} />
        
        <div className={s.profileInfo}>
          <h2 className={s.username}>
            {user?.username || '游客'}
          </h2>
          
          <div className={s.statsAndActions}>
            {/* 粉丝和关注 */}
            <div className={s.stats}>
              <span className={s.statItem}>0 粉丝</span>
              <span className={s.statItem}>28 关注</span>
            </div>
            
            {/* 关于我和联系方式按钮 */}
            <div className={s.actionButtons}>
              <button 
                className={s.actionBtn} 
                onClick={() => toggleExpand('about')}
              >
                关于我 {expanded.about ? '∧' : '∨'}
              </button>
              <button 
                className={s.actionBtn} 
                onClick={() => toggleExpand('contact')}
              >
                联系方式 {expanded.contact ? '∧' : '∨'}
              </button>
            </div>
          </div>
          
          {/* 展开内容区域 */}
          <div className={s.expandableAreas}>
            {/* 关于我展开内容 */}
            {expanded.about && (
              <div className={s.expandedContent}>
                <h3>关于我</h3>
                <p>大家好，我是一名热爱技术的开发者，喜欢分享自己在编程学习和实践中的心得与体会。</p>
                <p>擅长前端开发，对 React、Vue 等框架有一定的研究，也在不断探索后端相关技术。</p>
              </div>
            )}
            
            {/* 联系方式展开内容 */}
            {expanded.contact && (
              <div className={s.expandedContent}>
                <h3>联系方式</h3>
                <ul className={s.contactList}>
                  <li>邮箱：{user?.email || 'example@xxx.com'}</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* 导航栏 */}
      <nav className={s.nav}>
        <button 
          className={`${s.navBtn} ${activeTab === 'published' ? s.active : ''}`} 
          onClick={() => setActiveTab('published')}
        >
          我的文章 ({publishedArticles.length})
        </button>
        <button 
          className={`${s.navBtn} ${activeTab === 'drafts' ? s.active : ''}`} 
          onClick={() => setActiveTab('drafts')}
        >
          草稿箱 ({drafts.length})
        </button>
        <button 
          className={s.publishBtn} 
          onClick={() => nav("/myblog/publish")}
        >
          发布博客
        </button>
      </nav>
      
      {/* 文章列表区域 */}
      <section className={s.articles}>
        <h2>
          {activeTab === 'published' ? `我的文章 (${publishedArticles.length}篇)` : `草稿箱 (${drafts.length}篇)`}
        </h2>
        <div className={s.list}>
          {currentList.length === 0 ? (
            <div className={s.emptyState}>
              <p>{activeTab === 'published' ? '暂无文章' : '暂无草稿'}</p>
              <button 
                className={s.publishBtn}
                onClick={() => nav("/myblog/publish")}
              >
                {activeTab === 'published' ? '发布第一篇文章' : '创建新草稿'}
              </button>
            </div>
          ) : (
            currentList.slice(0, visible).map((article) => (
              <article key={article.file} className={s.card}>
                <div className={s.cardHeader}>
                  <h3>{article.title}</h3>
                  {activeTab === 'drafts' && (
                    <span className={s.draftBadge}>草稿</span>
                  )}
                </div>
                {article.date && <span className={s.date}>{article.date}</span>}
                {article.topics && article.topics.length > 0 && (
                  <div className={s.topics}>
                    {article.topics.slice(0, 3).map(topic => (
                      <span key={topic} className={s.topic}>{topic}</span>
                    ))}
                  </div>
                )}
                <div className={s.stats}>
                  <span>👍 {article.likes || 0}</span>
                  <span>👁 {article.views || 0}</span>
                  <span>⭐ {article.collects || 0}</span>
                </div>
                <div className={s.actions}>
                  <button
                    className={s.btnRead}
                    onClick={() =>
                      nav(`/myblog/article?id=${encodeURIComponent(article.file)}`)
                    }
                  >
                    查看详情
                  </button>
                  {activeTab === 'drafts' && (
                    <button
                      className={s.btnEdit}
                      onClick={() =>
                        nav(`/myblog/publish?id=${encodeURIComponent(article.file)}`)
                      }
                    >
                      继续编辑
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
        {visible < currentList.length && (
          <button
            className={s.loadMore}
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "加载中..." : "加载更多"}
          </button>
        )}
      </section>

      <footer className={s.footer}>&copy; 2025 H9的个人博客. All rights reserved.</footer>
    </div>
  );
}