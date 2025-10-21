// src/features/auth/hooks/AuthUse.js
import { useState } from 'react';
import userStore from '../../../store/userStore';

export const useAuth = () => {
  const [error, setError] = useState(null);

  const register = async (formData) => {
    try {
      setError(null);
      console.log('🚀 发送注册请求...');
      
      const response = await fetch('http://localhost:4000/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '注册失败');
      }

      console.log('✅ 注册成功，用户ID:', data.userid);
      return { success: true, data };

    } catch (err) {
      console.error('❌ 注册错误:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      console.log('🚀 发送登录请求，验证用户:', credentials.email);
      
      const response = await fetch('http://localhost:4000/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log('📨 登录响应:', data.message);

      if (!response.ok) {
        throw new Error(data.message || '登录失败');
      }

      // 登录成功：保存用户信息到 store
      if (data.user) {
        const userData = {
          id: data.user.userid,
          nickname: data.user.username,
          avatar: data.user.avatar,
          email: data.user.email
        };
        
        // 保存到 localStorage
        localStorage.setItem('blogUser', JSON.stringify(userData));
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        // 触发状态更新
        if (userStore.onChange) {
          userStore.onChange();
        }
        
        console.log('✅ 用户状态已更新');
      }
      
      return { success: true, data };

    } catch (err) {
      console.error('❌ 登录错误:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return { login, register, error };
};