import { useNavigate } from 'react-router-dom';
import { articleService } from '../../services/articleService';
import { useEffect, useState } from 'react';
import './HotFourGrid.css';
import FieldNews from '../../components/FieldNews/FieldNews';

export default function HotFourGrid() {
  const [list, setList] = useState([]);
  const nav = useNavigate();

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

  useEffect(() => {
    articleService.getHotArticles({ limit: 30 }).then(res => {
      const articlesWithFixedImages = res.slice(0, 12).map((item, index) => ({
        ...item,
        fixedCover: images[index % images.length] // 为每篇文章固定一张图片
      }));
      setList(articlesWithFixedImages);
    });
  }, []);

  return (
    <div className="hot-four-grid">
      <div className="hot-four-header">
        <span>🔥 热门博客</span>
        <button className="more-btn" onClick={() => nav('/home/hot')}>
          查看更多 →
        </button>
      </div>

      <div className="hot-four-body">
        {list.map((item) => (
          <div
            key={item.id}
            className="hot-four-item"
            onClick={() => nav(`/article/${item.id}`)}
          >
            {/* 使用固定的图片URL */}
            <img
              src={item.fixedCover}
              alt="博客封面"
              onError={(e) => {
                e.target.src = '/default-cover.jpg';
              }}
            />
            <div className="hot-four-info">
              <h4>{item.title}</h4>
              <span>浏览 {item.views}</span>
            </div>
          </div>
        ))}
      </div>
      <FieldNews />
    </div>
  );
}