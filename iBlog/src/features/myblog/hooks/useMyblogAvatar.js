// src/features/myblog/hooks/useMyblogAvatar.js
import { useState, useEffect } from "react";
import { userService } from "../../../services/userService";

const defaultAvatar = "/default-avatar.png";

export default function useMyblogAvatar() {
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取当前用户信息
  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (token) {
        // 从数据库获取最新用户信息
        try {
          const userData = await userService.getCurrentUser();
          
          if (userData && userData.username) {
            setUser(userData);
            setAvatar(userData.avatar || defaultAvatar);
            // 更新本地存储
            localStorage.setItem('blogUser', JSON.stringify(userData));
          } else {
            throw new Error('用户数据不完整');
          }
        } catch (apiError) {
          // 使用备用方案：从本地存储获取
          const savedUser = localStorage.getItem('blogUser');
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser);
              if (userData && userData.username) {
                setUser(userData);
                setAvatar(userData.avatar || defaultAvatar);
                return;
              }
            } catch (parseError) {
              console.error('解析本地存储数据失败:', parseError);
            }
          }
          setError(apiError.message);
        }
      } else {
        // 如果没有登录，检查本地存储（可能是之前登录过）
        const savedUser = localStorage.getItem('blogUser');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            if (userData && userData.username) {
              setUser(userData);
              setAvatar(userData.avatar || defaultAvatar);
            }
          } catch (parseError) {
            console.error('解析本地存储数据失败:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // 头像更新函数 - 与后端同步
  const updateAvatar = async (newAvatar) => {
    if (!user) {
      throw new Error('用户未登录');
    }
    
    try {
      setError(null);
      // 调用后端API更新头像
      const result = await userService.updateAvatar(user.userid, newAvatar);
      
      // 更新本地状态
      setAvatar(newAvatar);
      
      // 更新本地存储的用户信息
      const updatedUser = { ...user, avatar: newAvatar };
      setUser(updatedUser);
      localStorage.setItem('blogUser', JSON.stringify(updatedUser));
      
      return true;
    } catch (error) {
      console.error('更新头像失败:', error);
      setError(error.message);
      return false;
    }
  };

  // 刷新用户信息
  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  // 清除用户数据（退出登录）
  const clearUser = () => {
    setUser(null);
    setAvatar(defaultAvatar);
    localStorage.removeItem('token');
    localStorage.removeItem('blogUser');
  };

  return {
    avatar,
    updateAvatar,
    user,
    loading,
    error,
    refreshUser,
    clearUser
  };
}