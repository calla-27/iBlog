import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

// 注册
export const register = async (req, res, next) => {
  console.log('=== 开始处理注册请求 ===');
  
  try {
    const { username, email, password, avatar } = req.body;
    
    console.log('📋 接收到的数据:', {
      username: username || '空',
      email: email || '空', 
      password: password ? '***' : '空',
      avatar: avatar || '空'
    });

    // 验证必填字段
    if (!username || !email || !password) {
      console.log('❌ 缺少必填字段');
      return res.status(400).json({ message: '缺少必填字段' });
    }

    console.log('✅ 字段验证通过');

    // 检查邮箱是否已存在
    console.log('🔍 检查邮箱是否已存在:', email);
    try {
      const [rows] = await pool.execute('SELECT userid FROM users WHERE email = ?', [email]);
      console.log('邮箱查询结果:', rows);
      
      if (rows.length > 0) {
        console.log('❌ 邮箱已存在');
        return res.status(409).json({ message: '邮箱已存在' });
      }
      console.log('✅ 邮箱可用');
    } catch (dbError) {
      console.error('❌ 数据库查询错误:', dbError);
      throw new Error('数据库查询失败: ' + dbError.message);
    }

    // 加密密码
    console.log('🔐 开始加密密码...');
    let hash;
    try {
      hash = await bcrypt.hash(password, 10);
      console.log('✅ 密码加密完成');
    } catch (hashError) {
      console.error('❌ 密码加密失败:', hashError);
      throw new Error('密码加密失败: ' + hashError.message);
    }

    // 处理头像
    const finalAvatar = avatar || '/default-avatar.png';
    console.log('🖼️ 最终头像路径:', finalAvatar);

    // 插入用户数据
    console.log('💾 开始插入用户数据...');
    let result;
    try {
      [result] = await pool.execute(
        'INSERT INTO users (username, email, password_hash, avatar) VALUES (?, ?, ?, ?)',
        [username, email, hash, finalAvatar]
      );
      console.log('✅ 用户数据插入成功, ID:', result.insertId);
    } catch (insertError) {
      console.error('❌ 数据插入失败:');
      console.error('错误信息:', insertError.message);
      console.error('错误代码:', insertError.code);
      console.error('SQL 状态:', insertError.sqlState);
      console.error('SQL 消息:', insertError.sqlMessage);
      throw new Error('数据库插入失败: ' + insertError.message);
    }

    // 返回成功响应
    console.log('🎉 注册成功，返回响应');
    res.status(201).json({
      message: '注册成功',
      userid: result.insertId,
    });

  } catch (err) {
    console.error('💥 注册过程发生未捕获的错误:');
    console.error('错误名称:', err.name);
    console.error('错误消息:', err.message);
    console.error('错误堆栈:', err.stack);
    
    res.status(500).json({ 
      message: '服务器内部错误',
      error: err.message
    });
  } finally {
    console.log('=== 注册请求处理结束 ===\n');
  }
};

// 登录
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔑 登录请求:', { email, password: '***' });
    
    if (!email || !password) {
      return res.status(400).json({ message: '缺少必填字段' });
    }

    // 查询用户
    const [rows] = await pool.execute(
      'SELECT userid, username, email, password_hash, avatar FROM users WHERE email = ?',
      [email]
    );
    
    const user = rows[0];
    if (!user) {
      console.log('❌ 用户不存在:', email);
      return res.status(401).json({ message: '用户不存在' });
    }

    // 验证密码
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      console.log('❌ 密码错误:', email);
      return res.status(401).json({ message: '密码错误' });
    }

    // 生成 token
    const token = jwt.sign(
      { userid: user.userid, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ 登录成功:', user.username);

    // 返回用户信息（确保包含所有必要字段）
    res.json({
      message: '登录成功',
      token,
      user: {
        userid: user.userid,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      },
    });
  } catch (err) {
    console.error('💥 登录错误:', err);
    next(err);
  }
};

// 获取当前登录用户 - 适配新的认证中间件
export const getMe = async (req, res, next) => {
  try {
    console.log('🔍 获取当前用户信息，用户ID:', req.user.userid);
    console.log('🔍 JWT解码数据:', req.user);
    
    const [rows] = await pool.execute(
      'SELECT userid, username, email, avatar FROM users WHERE userid = ?',
      [req.user.userid]
    );
    
    if (!rows.length) {
      console.log('❌ 用户不存在');
      return res.status(404).json({ 
        success: false,
        message: '用户不存在' 
      });
    }
    
    const user = rows[0];
    console.log('✅ 查询到的用户数据:', user);
    
    // 确保返回正确的数据结构
    res.json({ 
      success: true,
      user: {
        userid: user.userid,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (e) {
    console.error('💥 获取用户信息错误:', e);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 根据 id 查用户
export const getUserById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'id 必须是数字' });

    const [rows] = await pool.execute(
      'SELECT userid, username, email, avatar, created_at FROM users WHERE userid = ?',
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: '用户不存在' });

    res.json({ 
      success: true,
      user: rows[0] 
    });
  } catch (err) {
    next(err);
  }
};

// 更新用户头像
export const updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    const userId = parseInt(req.params.id);
    
    if (!avatar) {
      return res.status(400).json({ message: '头像URL不能为空' });
    }
    
    // 验证用户是否存在
    const [userRows] = await pool.execute(
      'SELECT userid FROM users WHERE userid = ?',
      [userId]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 更新头像
    const [result] = await pool.execute(
      'UPDATE users SET avatar = ? WHERE userid = ?',
      [avatar, userId]
    );
    
    // 返回更新后的用户信息
    const [rows] = await pool.execute(
      'SELECT userid, username, email, avatar FROM users WHERE userid = ?',
      [userId]
    );
    
    res.json({
      success: true,
      message: '头像更新成功',
      user: rows[0]
    });
  } catch (err) {
    console.error('更新头像错误:', err);
    next(err);
  }
};

// 更新用户信息
export const updateProfile = async (req, res, next) => {
  try {
    const { username, email } = req.body;
    const userId = parseInt(req.params.id);
    
    if (!username || !email) {
      return res.status(400).json({ message: '用户名和邮箱不能为空' });
    }
    
    // 检查邮箱是否被其他用户使用
    const [emailRows] = await pool.execute(
      'SELECT userid FROM users WHERE email = ? AND userid != ?',
      [email, userId]
    );
    
    if (emailRows.length > 0) {
      return res.status(409).json({ message: '邮箱已被其他用户使用' });
    }
    
    // 更新用户信息
    const [result] = await pool.execute(
      'UPDATE users SET username = ?, email = ? WHERE userid = ?',
      [username, email, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 返回更新后的用户信息
    const [rows] = await pool.execute(
      'SELECT userid, username, email, avatar FROM users WHERE userid = ?',
      [userId]
    );
    
    res.json({
      success: true,
      message: '用户信息更新成功',
      user: rows[0]
    });
  } catch (err) {
    console.error('更新用户信息错误:', err);
    next(err);
  }
};