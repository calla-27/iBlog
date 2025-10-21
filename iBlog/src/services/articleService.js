// src/services/articleService.js
const API_BASE = 'http://localhost:4000/api';

export const articleService = {
  // 获取所有文章 - 确保路径正确
  async getAllArticles(limit = 10, offset = 0) {
    const response = await fetch(`${API_BASE}/articles?limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取文章失败');
    }
    
    return data;
  },

  // 根据ID获取文章
  async getArticleById(articleId) {
    const response = await fetch(`${API_BASE}/articles/${articleId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取文章失败');
    }
    
    return data;
  },

  // 创建文章
  async createArticle(articleData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(articleData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '创建文章失败');
    }
    
    return data;
  },

  // 点赞文章
  async likeArticle(articleId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/articles/${articleId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '点赞失败');
    }
    
    return data;
  },

  // 收藏文章
  async collectArticle(articleId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/articles/${articleId}/collect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '收藏失败');
    }
    
    return data;
  },

  // 搜索文章
  async searchArticles(keyword, limit = 10, offset = 0) {
    const response = await fetch(`${API_BASE}/articles/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '搜索文章失败');
    }
    
    return data;
  },

  // 把下面方法直接塞进 articleService 对象即可
  async getFeaturedArticles() {
    const res = await fetch(`${API_BASE}/articles/featured`);
    if (!res.ok) throw new Error(`HTTP错误: ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || '获取精选文章失败');
    return data.list;   // 后端需要返回 {success:true, list:[...]}
  },

  // 与 getFeaturedArticles 并列
  async getHotTags() {
    const res = await fetch(`${API_BASE}/articles/hot-tags`);
    if (!res.ok) throw new Error(`HTTP错误: ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || '获取热门标签失败');
    return data; // 整个对象返回，控制器里已有 {success:true, list:[...]}
  },
  async getHotArticles() {
  const response = await fetch(`${API_BASE}/articles/hot`);
  
  if (!response.ok) {
    throw new Error(`HTTP错误: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || '获取热门文章失败');
  }
  
  return data.data;
},
// 修改 src/services/articleService.js 中的 getArticlesByCategory 方法
async getArticlesByCategory(category, page = 0, limit = 10) {
  // 使用已确认可访问的接口路径
  const response = await fetch(
    `${API_BASE}/articles?category=${encodeURIComponent(category)}&page=${page}&limit=${limit}`
  );
  
  if (!response.ok) {
    throw new Error(`HTTP错误: ${response.status}，请求地址: ${response.url}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || '获取分类文章失败');
  }
  
  // 临时前端过滤：如果后端未正确过滤，前端再过滤一次
  const filteredData = {
    ...data,
    list: data.list.filter(article => 
      article.articleCategory === category
    )
  };
  
  return filteredData;
}
};