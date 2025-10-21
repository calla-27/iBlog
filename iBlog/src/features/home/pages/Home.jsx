import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import ArticleCard from "../../../components/ArticleCard";
import SidebarLeft from "../../../components/SidebarLeft";
import SidebarRight from "../../../components/SidebarRight";
import { categories, hotArticles, tags } from "../../../data/sidebarData";
import Recommend from "./Recommend";
import HotBlogs from "./HotBlogs";
import Columns from "./Columns";
import "./Home.css";
import { articleService } from '../../../services/articleService';
import { safeFormatDate } from '../../myblog/hooks/useMyblogComments';

const ITEMS_PER_PAGE = 50;

export default function Home({ isSidebarCollapsed }) {
  const [activeTab, setActiveTab] = useState("columns");
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const searchKeyword = searchParams.get('search') || '';
  
  // 状态管理
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  // 使用 ref 记录搜索关键词，避免不必要的重新加载
  const prevSearchKeyword = useRef(searchKeyword);
  const prevActiveTab = useRef(activeTab);

  // 使用 useCallback 优化加载函数
  const loadArticles = useCallback(async (targetPage = 0, keyword = searchKeyword, isSearchChange = false) => {
    if (loading) return;
    
    console.log(`加载文章: page=${targetPage}, keyword="${keyword}", isSearchChange=${isSearchChange}`);
    
    setLoading(true);
    try {
      let response;
      if (keyword) {
        response = await articleService.searchArticles(
          keyword,
          ITEMS_PER_PAGE,
          targetPage * ITEMS_PER_PAGE
        );
        console.log(`搜索结果:`, response.list.length, '篇文章');
      } else {
        response = await articleService.getAllArticles(
          ITEMS_PER_PAGE,
          targetPage * ITEMS_PER_PAGE
        );
      }

      if (!response || !Array.isArray(response.list)) {
        console.error("后端返回格式错误:", response);
        throw new Error("数据格式不正确");
      }

      // 如果是搜索变化或第一页，替换列表；否则追加
      if (isSearchChange || targetPage === 0) {
        setList(response.list);
      } else {
        setList(prev => [...prev, ...response.list]);
      }
      
      setHasMore(response.hasMore !== undefined ? response.hasMore : true);
      setPage(targetPage + 1);
    } catch (e) {
      console.error("加载失败:", e);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, searchKeyword]);

  // 修复：只在搜索关键词真正变化时重新加载
  useEffect(() => {
    const isKeywordChanged = prevSearchKeyword.current !== searchKeyword;
    const isTabChanged = prevActiveTab.current !== activeTab;
    
    if (isKeywordChanged || isTabChanged) {
      console.log(`检测到变化: keywordChanged=${isKeywordChanged}, tabChanged=${isTabChanged}`);
      
      prevSearchKeyword.current = searchKeyword;
      prevActiveTab.current = activeTab;
      
      // 只有在推荐标签页且有关键词变化时才重置加载
      if (activeTab === "recommend" && isKeywordChanged) {
        setList([]);
        setPage(0);
        setHasMore(true);
        
        // 使用 requestAnimationFrame 确保状态更新完成
        requestAnimationFrame(() => {
          loadArticles(0, searchKeyword, true);
        });
      }
    }
  }, [searchKeyword, activeTab, loadArticles]);

  // 初始加载 - 只在组件挂载时执行一次
  useEffect(() => {
    if (activeTab === "recommend" && list.length === 0 && !loading) {
      console.log("初始加载文章");
      loadArticles(0, searchKeyword, false);
    }
  }, []); // 空依赖数组，只执行一次

  // 滚动加载更多 - 优化依赖项
  useEffect(() => {
    if (activeTab !== "recommend") return;
    
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
        document.documentElement.scrollHeight
      ) {
        if (!loading && hasMore) {
          loadArticles(page, searchKeyword, false);
        }
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, page, activeTab, loadArticles]);

  // 标签页切换处理
  const handleTabChange = (tabKey) => {
    if (tabKey !== activeTab) {
      setActiveTab(tabKey);
    }
  };

  // 内容渲染
  const renderContent = () => {
    switch (activeTab) {
      case "recommend":
        if (loading && list.length === 0) {
          return <p className="loading">加载中…</p>;
        }

        if (!list.length && !hasMore) {
          return searchKeyword ? (
            <p className="empty">没有找到包含"{searchKeyword}"的文章</p>
          ) : (
            <p className="empty">暂无文章</p>
          );
        }
        
        return (
          <>
            {list.map((article) => (
              <ArticleCard 
                key={article.articleId} 
                article={{
                  ...article,
                  // 格式化时间显示
                  articleCreatedAt: safeFormatDate(article.articleCreatedAt)
                }} 
              />
            ))}
            {hasMore && (
              <button 
                className="load-more" 
                onClick={() => loadArticles(page, searchKeyword, false)}
                disabled={loading}
              >
                {loading ? "加载中…" : "加载更多"}
              </button>
            )}
          </>
        );
      case "hot":
        return <HotBlogs />;
      case "columns":
        return <Columns />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <div className="home-container">
        <aside className={`left-card ${isSidebarCollapsed ? "collapsed" : ""}`}>
          <SidebarLeft
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isCollapsed={isSidebarCollapsed}
          />
        </aside>

        <main className={`main-content ${isSidebarCollapsed ? "expanded" : ""}`}>
          {renderContent()}
        </main>

        <aside className="right-card">
          <SidebarRight hotArticles={hotArticles} tags={tags} />
        </aside>
      </div>
    </div>
  );
}