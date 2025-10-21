import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { articleService } from '../services/articleService';
import './SidebarRight.css';

export default function SidebarRight() {
  const nav = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  // 使用原本的图片文件名
  const images = [
    '/1_(1).png',
    '/1_(2).png',
    '/1_(3).png',
    '/1_(4).png',
    '/1_(5).png',
    '/1_(6).png',
    '/1_(7).png',
    '/1_(8).png',
    '/1_(9).png',
    '/1_(10).png',
    '/1_(11).png',
    '/1_(12).png',
    '/1_(13).png',
    '/1_(14).png',
    '/1_(15).png',
    '/1_(16).png',
    '/1_(17).png',
    '/1_(18).png',
    '/1_(19).png',
    '/1_(20).png'
  ];

  const fetchFeatured = async () => {
    setLoading(true);
    try {
      const data = await articleService.getFeaturedArticles();
      const articlesWithFixedImages = data.slice(0, 5).map((item, index) => ({
        ...item,
        fixedCover: images[index % images.length] // 为每篇文章固定一张图片
      }));
      setList(articlesWithFixedImages);
      setIdx(0);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (list.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIdx(v => (v + 1) % list.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [list]);

  const goSlide = (i) => setIdx(i);

  const [tagList, setTagList] = useState([]);
  const [tagLoading, setTagLoading] = useState(false);
  
  const fetchHotTags = async () => {
    setTagLoading(true);
    try {
      const data = await articleService.getHotTags();
      if (data.success) setTagList(data.list);
    } catch {
      setTagList([]);
    } finally {
      setTagLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatured();
    fetchHotTags();
  }, []);

  return (
    <aside className="sidebar-right">
      <div className="featured-slider">
        <h3 className="sidebar-title">精选文章</h3>

        {list.length ? (
          <>
            <div className="slider-card" onClick={() => nav(`/article/${list[idx].articleId}`)}>
              {/* 使用固定的图片URL */}
              <img 
                src={list[idx].fixedCover}
                alt="精选文章封面" 
                className="slider-img"
                onError={(e) => {
                  e.target.src = '/default-cover.jpg';
                }}
              />
              <div className="slider-info">
                <h4 className="slider-title">{list[idx].articleTitle}</h4>
              </div>
            </div>

            <div className="slider-dots">
              {list.map((_, i) => (
                <span key={i} className={`dot ${i === idx ? 'active' : ''}`} onClick={() => goSlide(i)} />
              ))}
            </div>
          </>
        ) : (
          <p className="sidebar-empty">暂无精选文章</p>
        )}
      </div>

      <div className="hot-tags">
        <div className="sr-header">
          <h3 className="sidebar-title">热门标签</h3>
          <button
            className="refresh-btn"
            onClick={fetchHotTags}
            disabled={tagLoading}
          >
            {tagLoading ? '加载中…' : '刷新'}
          </button>
        </div>
        {tagList.length ? (
          <ul className="tag-cloud">
            {tagList.map(({ tag, used }) => (
              <li
                key={tag}
                className="tag-item"
                onClick={() => nav(`/?search=${encodeURIComponent(tag)}`)}
                title={`查看"${tag}"相关文章`}
              >
                {tag}
                <sup>{used}</sup>
              </li>
            ))}
          </ul>
        ) : (
          <p className="sidebar-empty">暂无热门标签</p>
        )}
      </div>
    </aside>
  );
}