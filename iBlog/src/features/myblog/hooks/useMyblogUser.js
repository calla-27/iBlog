// src/features/myblog/hooks/useMyblogUser.js
import { useState, useEffect } from "react";
import { userService } from "../../../services/userService"; // 修复路径

export default function useMyblogUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 从数据库获取用户信息
  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        // 如果没有token，检查本地存储
        const savedUser = localStorage.getItem('blogUser');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        setLoading(false);
        return;
      }

      // 从API获取最新用户信息
      const userData = await userService.getCurrentUser();
      if (userData) {
        setUser(userData);
        localStorage.setItem('blogUser', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      setError(error.message);
      // 降级处理：使用本地存储
      const savedUser = localStorage.getItem('blogUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('blogUser', JSON.stringify(userData));
  };

  return {
    user,
    loading,
    error,
    updateUser,
    refetch: fetchUser
  };
}