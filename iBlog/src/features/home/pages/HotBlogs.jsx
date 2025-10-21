import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HotBlogs.css';
import { articleService } from '../../../services/articleService';
import ArticleCard from '../../../components/ArticleCard';
import { safeFormatDate } from '../../myblog/hooks/useMyblogComments';

export default function HotBlogs() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [maxItems, setMaxItems] = useState(50);

  useEffect(() => {
    const fetchHotArticles = async () => {
      try {
        setLoading(true);
        const data = await articleService.getHotArticles();
        console.log('【热门博客原始返回】', data);
        
        // 筛选浏览量大于1000的文章
        const filteredList = (data || []).filter(art => 
          (art.views || art.articleViews || 0) > 1000
        );
        
        // 格式化数据：去掉封面图片，其他字段从后端获取
        const formattedList = filteredList.map((art) => ({
          articleId: art.id || art.articleId,                  
          articleTitle: art.title || art.articleTitle,            
          articleContent: art.summary || art.articleContent || '',  
          articleCover: '', // 设置为空字符串，不显示图片
          userName: art.author || art.userName || art.username || '未知作者', 
          articleCreatedAt: safeFormatDate(art.createdAt || art.articleCreatedAt),    
          articleTopics: art.topics || art.articleTopics || [],
          articleLikes: art.likes || art.articleLikes || 0,
          articleCollects: art.favorites || art.articleCollects || 0,
          articleViews: art.views || art.articleViews || 0
        }));
        
        console.log('【格式化后的数据】', formattedList);
        setList(formattedList);
      } catch (error) {
        console.error('获取热门博客失败:', error);
        setList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotArticles();
  }, []);

  if (loading) return <div className="hot-loading">加载中…</div>;

  const displayList = list.slice(0, maxItems);

  return (
    <div className="hot-blogs">
      <h2 className="hot-title">🔥 热门博客</h2>

      {list.length === 0 ? (
        <p className="hot-empty">暂无浏览量大于 1000 的博客</p>
      ) : (
        <>
          <div className="article-list">
            {displayList.map(article => (
              <ArticleCard 
                key={article.articleId} 
                article={article} 
              />
            ))}
          </div>
          
          {list.length > maxItems && (
            <button 
              className="load-more" 
              onClick={() => setMaxItems(prev => Math.min(prev + 50, list.length))}
            >
              加载更多
            </button>
          )}
        </>
      )}
    </div>
  );
}