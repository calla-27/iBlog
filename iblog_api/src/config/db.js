// src/config/db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 数据库配置检查:');
console.log('  - 主机:', process.env.MYSQL_HOST);
console.log('  - 端口:', process.env.MYSQL_PORT);
console.log('  - 用户:', process.env.MYSQL_USER);
console.log('  - 数据库:', process.env.MYSQL_DATABASE);
console.log('  - 密码:', process.env.MYSQL_PASSWORD ? '***' : '空');
console.log('');

// 创建连接池 - 使用支持的配置选项
export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'iblog',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // 移除不支持的配置选项
  // acquireTimeout: 10000, // 注释掉
  // timeout: 60000, // 注释掉
  typeCast: function (field, next) {
    if (field.type === 'TINY' && field.length === 1) {
      return field.string() === '1';
    }
    return next();
  }
});

// 连接测试函数
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    
    // 测试查询
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log('✅ 数据库查询测试成功:', rows[0].result);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:');
    console.error('   错误信息:', error.message);
    console.error('   错误代码:', error.code);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   💡 建议: 检查 MySQL 用户名和密码');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   💡 建议: 数据库不存在，请先创建:', process.env.MYSQL_DATABASE);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   💡 建议: MySQL 服务未启动');
    }
    
    return false;
  }
};

// 自动测试连接
testConnection();

export const promisePool = pool;