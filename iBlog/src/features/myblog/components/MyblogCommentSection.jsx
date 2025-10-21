import { useState, useEffect } from "react";
import useMyblogComments from "../hooks/useMyblogComments";
import s from "../styles/myblog-comment.module.css";

export default function MyblogCommentSection({ articleId }) {
  const { comments, loading, error, addComment, likeComment } = useMyblogComments(articleId);
  const [commentText, setCommentText] = useState("");
  const [user, setUser] = useState(null);

  // 获取当前登录用户
  useEffect(() => {
    const savedUser = localStorage.getItem('blogUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    const success = await addComment(commentText);
    if (success) {
      setCommentText("");
    }
  };

  return (
    <section className={s.comments}>
      <h3>评论区</h3>
      
      {error && (
        <div className="error-msg" style={{ color: '#dc3545', margin: '1rem 0' }}>
          {error}
        </div>
      )}
      
      <form id="commentForm" onSubmit={handleSubmit} className={s.commentForm}>
        <textarea
          id="commentText"
          placeholder="写下你的评论..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className={s.commentText}
          required
        />
        <button 
          type="submit" 
          disabled={loading || !user}
          className={s.submitBtn}
        >
          {loading ? '提交中...' : '提交评论'}
        </button>
        {!user && (
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
            登录后可以发表评论
          </p>
        )}
      </form>

      {loading ? (
        <div>加载评论中...</div>
      ) : (
        <ul id="commentList" className={s.commentList}>
          {comments.length === 0 ? (
            <li>暂无评论，快来发表第一条评论吧~</li>
          ) : (
            comments.map((comment) => (
              <li key={comment.id} className={s.commentItem}>
                <div className={s.commentHeader}>
                  <span className={s.commentAuthor}>{comment.nick}</span>
                  <span className={s.commentTime}>{comment.time}</span>
                </div>
                <div className={s.commentBody}>{comment.txt}</div>
                <div className={s.commentActions}>
                  <button 
                    onClick={() => likeComment(comment.id)}
                    disabled={!user}
                    className={s.likeBtn}
                  >
                    👍 {comment.likes || 0}
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </section>
  );
}