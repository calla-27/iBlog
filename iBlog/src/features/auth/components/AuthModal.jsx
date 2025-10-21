// src/features/auth/components/AuthModal.jsx
import React, { useState } from 'react';
import AuthForm from './AuthForm';
import { useAuth } from '../hooks/AuthUse';
import './AuthModal.css';

const AuthModal = ({ visible, onClose, initialMode = 'login', onAuthSuccess }) => {
  const [mode, setMode] = useState(initialMode);
  const { login, register, error } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (formData) => {
    console.log('📝 表单提交数据:', formData);
    
    const isRegister = mode === 'register';
    const result = isRegister
      ? await register(formData)
      : await login({ email: formData.email, password: formData.password });

    console.log('🔑 认证结果:', result);

    if (result.success) {
      if (isRegister) {
        // 注册成功：显示成功消息，清空表单，切换到登录模式
        setSuccessMessage('🎉 注册成功！请登录');
        
        // 3秒后清空成功消息
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
        
        // 立即切换到登录模式
        setMode('login');
        
      } else {
        // 登录成功：显示成功消息，然后关闭弹窗
        setSuccessMessage('🎉 登录成功！');
        
        setTimeout(() => {
          if (onAuthSuccess) {
            onAuthSuccess(result.data.user);
          }
          setSuccessMessage('');
          onClose();
        }, 1000);
      }
    }
  };

  // 切换模式时清空消息
  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setSuccessMessage('');
  };

  if (!visible) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}>×</button>
        
        {/* 显示成功消息 */}
        {successMessage && (
          <div className="auth-success">
            {successMessage}
          </div>
        )}
        
        <AuthForm
          isRegister={mode === 'register'}
          onSubmit={handleSubmit}
          onSwitchMode={handleSwitchMode}
          error={error}
        />
      </div>
    </div>
  );
};

export default AuthModal;