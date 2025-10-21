// src/services/userService.js
const API_BASE = 'http://localhost:4000/api';

export const userService = {
  // 获取当前登录用户信息 - 修正路径
  async getCurrentUser() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('❌ 未找到token');
      throw new Error('用户未登录');
    }
    
    console.log('📡 发送获取用户信息请求...');
    
    const response = await fetch(`${API_BASE}/user/me`, {  // 修正路径：/api/user/me
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 响应状态:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ API错误响应:', errorData);
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('blogUser');
        throw new Error(errorData.message || '登录已过期，请重新登录');
      }
      throw new Error(errorData.message || `HTTP错误: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ API返回的用户数据:', data);
    
    // 确保返回正确的用户对象
    if (data.success && data.user) {
      return data.user;
    } else {
      throw new Error(data.message || '用户数据格式错误');
    }
  },

  // 根据ID获取用户信息 - 修正路径
  async getUserById(userId) {
    console.log('📡 根据ID获取用户信息:', userId);
    
    const response = await fetch(`${API_BASE}/user/${userId}`);  // 修正路径：/api/user/:id
    
    console.log('📊 响应状态:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ 错误响应:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      
      throw new Error(errorData.message || `HTTP错误: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ API返回的用户数据:', data);
    
    if (data.success && data.user) {
      return data.user;
    } else {
      throw new Error(data.message || '用户数据格式错误');
    }
  },

  // 更新用户头像 - 修正路径
  async updateAvatar(userId, avatarUrl) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('用户未登录');
    }
    
    const response = await fetch(`${API_BASE}/user/${userId}/avatar`, {  // 修正路径：/api/user/:id/avatar
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ avatar: avatarUrl })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP错误: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  },

  // 更新用户信息 - 修正路径
  async updateProfile(userId, profileData) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('用户未登录');
    }
    
    const response = await fetch(`${API_BASE}/user/${userId}/profile`, {  // 修正路径：/api/user/:id/profile
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP错误: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  },

  // 检查登录状态
  checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('blogUser');
    
    return {
      isAuthenticated: !!token,
      token: token,
      user: user ? JSON.parse(user) : null
    };
  }
};