// src/utils/imageUtils.js
export const getImageUrl = (coverPath) => {
  if (!coverPath || coverPath === 'undefined' || coverPath === 'null' || coverPath === '') {
    return '/default-cover.jpg';
  }
  
  // 如果已经是完整URL，直接返回
  if (coverPath.startsWith('http')) {
    return coverPath;
  }
  
  // 处理相对路径
  const normalizedPath = coverPath.startsWith('/') ? coverPath : `/${coverPath}`;
  return `http://localhost:4000${normalizedPath}`;
};