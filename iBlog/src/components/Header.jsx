// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import AuthModal from "../features/auth/components/AuthModal";
import userStore from '../store/userStore';

const Header = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [modalMode, setModalMode] = useState('login');
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentUser(userStore.getCurrentUser());
    console.log('🔄 Header 初始化，当前用户:', userStore.getCurrentUser());
    
    const handleChange = () => {
      const user = userStore.getCurrentUser();
      console.log('🔄 Header 收到状态变化，新用户:', user);
      setCurrentUser(user);
    };
    
    userStore.subscribe(handleChange);
    
    return () => {
      userStore.subscribe(null);
    };
  }, []);

  const handleLogout = () => {
    console.log('🚪 用户退出登录');
    userStore.logout();
  };

  const openLoginModal = () => {
    setModalMode('login');
    setModalVisible(true);
  };

  const openRegisterModal = () => {
    setModalMode('register');
    setModalVisible(true);
  };

  const handleAuthSuccess = (user) => {
    console.log('🎉 Header 收到认证成功:', user);
    setModalVisible(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      // 导航到首页并带上搜索参数
      navigate(`/?search=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  return (
    <div className="header">
      {/* 左侧区域：侧边栏开关 + Logo（带首页跳转功能） */}
      <div className="header-left">
        {/* 侧边栏展开/收起开关 */}
        <button
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          <i className={`fas fa-${isSidebarCollapsed ? 'bars' : 'times'}`} />
        </button>

        {/* MyBlog Logo - 点击跳转到首页 */}
        <Link to="/" className="logo">
          <i className="fas fa-blog" />
          <span>iBlog</span>
        </Link>
      </div>

      {/* 搜索区域 */}
      <div className="search-container">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="搜索文章..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            {searchKeyword && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearchKeyword('')}
              >
                ×
              </button>
            )}
          </div>
          <button type="submit" className="search-btn">搜索</button>
        </form>
      </div>

      <div className="header-user">
        {!currentUser ? (
          <>
            <button className="header-btn" onClick={openLoginModal}>
              登录
            </button>
            <button className="header-btn header-btn-primary" onClick={openRegisterModal}>
              注册
            </button>
          </>
        ) : (
          <div className="user-menu">
            <button className="message-btn">
              ✉️
              <span className="message-badge">0</span>
            </button>
            <img 
              src={currentUser.avatar || 'https://via.placeholder.com/100'} 
              alt={currentUser.username || '用户头像'} 
              className="user-avatar"
              title={currentUser.username}
              onClick={() => window.location.href = '/myblog'}
              style={{ cursor: 'pointer' }}
            />
            <button className="header-btn header-btn-logout" onClick={handleLogout}>
              退出
            </button>
          </div>
        )}
      </div>

      <AuthModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        initialMode={modalMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Header;
