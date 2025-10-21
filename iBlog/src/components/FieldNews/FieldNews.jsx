import { useNavigate } from 'react-router-dom';
import { articleService } from '../../services/articleService';
import { useEffect, useState } from 'react';
import './FieldNews.css';
import { getImageUrl } from '../../utils/imageUtils'; // 新增导入

export default function FieldNews() {
  const [list, setList] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    articleService.getAllArticles(4, 0).then(res => {
      setList(res.list || res);
    });
  }, []);

  return (
    <div className="field-news">
      <div className="field-header">
        <span>🌐 领域新篇</span>
      </div>

      <div className="field-body">
        {list.map(item => (
          <div
            key={item.articleId}
            className="field-card"
            onClick={() => nav(`/article/${item.articleId}`)}
          >
            <div className="field-cover">
              {/* 使用统一的图片URL处理 */}
              <img
                src={getImageUrl(item.articleCover)}
                alt=""
                onError={e => (e.target.src = '/default-cover.jpg')}
              />
            </div>
            <div className="field-info">
              <h4 className="field-title">{item.articleTitle}</h4>
              <div className="field-stats">
                <span>👍 {item.articleLikes || 0}</span>
                <span>⭐ {item.articleCollects || 0}</span>
                <span>👁 {item.articleViews || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}