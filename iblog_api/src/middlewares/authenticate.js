// src/middlewares/authenticate.js
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问被拒绝，未提供令牌'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 确保正确设置用户信息，保持与JWT中的字段名一致
    req.user = {
      userid: decoded.userid,  // 使用小写 userid，与JWT一致
      email: decoded.email,
      username: decoded.username
      // 其他字段...
    };
    
    console.log('🔍 JWT解码数据:', decoded);
    console.log('🔍 设置的用户信息:', req.user);
    
    next();
  } catch (error) {
    console.error('❌ 令牌验证失败:', error);
    res.status(401).json({
      success: false,
      message: '令牌无效'
    });
  }
};

export const optionalAuthenticate = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        userid: decoded.userid,  // 使用小写 userid
        email: decoded.email,
        username: decoded.username
      };
    }
    
    next();
  } catch (error) {
    // 对于可选认证，验证失败时继续处理（不设置req.user）
    next();
  }
};