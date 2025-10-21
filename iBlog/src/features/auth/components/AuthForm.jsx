// src/features/auth/components/AuthForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import './AuthModal.css';

const AuthForm = ({ isRegister, onSubmit, onSwitchMode, error }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    avatar: '/default-avatar.png',
  });
  const [preview, setPreview] = useState(formData.avatar);
  const fileInputRef = useRef(null);

  // 当模式切换时重置表单
  useEffect(() => {
    setFormData({
      username: '',
      email: '',
      password: '',
      avatar: '/default-avatar.png',
    });
    setPreview('/default-avatar.png');
  }, [isRegister]);

  /* 头像上传逻辑 */
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
      setFormData(prev => ({ ...prev, avatar: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // 切换模式的处理函数
  const handleModeSwitch = (mode) => {
    onSwitchMode(mode);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {isRegister && (
        <>
          <div className="auth-avatar-upload">
            <label>头像</label>
            <div className="avatar-preview-container">
              <div className="avatar-preview" onClick={() => fileInputRef.current?.click()}>
                <img src={preview} alt="预览头像" className="avatar-img" />
                <div className="avatar-upload-overlay">
                  <span>点击上传</span>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="avatar-file-input"
              />
            </div>
          </div>

          <div className="auth-form-item">
            <label>用户名</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="请输入用户名"
              required
            />
          </div>
        </>
      )}

      <div className="auth-form-item">
        <label>邮箱</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="请输入邮箱"
          required
        />
      </div>

      <div className="auth-form-item">
        <label>密码</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="请输入密码"
          required
        />
      </div>

      {error && <div className="auth-error">{error}</div>}

      <button type="submit" className="auth-submit-btn">
        {isRegister ? '注册' : '登录'}
      </button>

      <div className="auth-title">
        <span 
          className={!isRegister ? 'auth-active' : ''} 
          onClick={() => handleModeSwitch('login')}
        >
          登录
        </span>
        <span className="auth-split">|</span>
        <span 
          className={isRegister ? 'auth-active' : ''} 
          onClick={() => handleModeSwitch('register')}
        >
          注册
        </span>
      </div>
    </form>
  );
};

export default AuthForm;