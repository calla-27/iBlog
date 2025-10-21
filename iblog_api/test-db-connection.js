// test-db-connection.js
import { pool, testConnection } from './config/db.js';

async function fullTest() {
  console.log('🔍 开始数据库完整测试...\n');
  
  // 测试连接
  const connected = await testConnection();
  if (!connected) {
    console.log('❌ 数据库连接测试失败，停止测试');
    return;
  }
  
  try {
    // 检查 users 表是否存在
    console.log('\n📊 检查 users 表...');
    const [tables] = await pool.execute("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log('❌ users 表不存在');
      console.log('请运行以下 SQL 创建表:');
      console.log(`
        CREATE TABLE users (
          userid INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          avatar VARCHAR(255) DEFAULT '/default-avatar.png',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      return;
    }
    console.log('✅ users 表存在');
    
    // 检查表结构
    console.log('\n🏗️ 检查表结构...');
    const [structure] = await pool.execute('DESCRIBE users');
    console.log('表结构:');
    structure.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // 检查现有数据
    console.log('\n👥 检查现有用户...');
    const [users] = await pool.execute('SELECT userid, username, email FROM users LIMIT 5');
    console.log(`现有用户数量: ${users.length}`);
    users.forEach(user => {
      console.log(`  - ID: ${user.userid}, 用户名: ${user.username}, 邮箱: ${user.email}`);
    });
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  } finally {
    await pool.end();
  }
}

fullTest();