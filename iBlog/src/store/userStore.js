// 全局用户状态管理（修复登录验证问题）
const userStore = {
  // 获取所有注册用户
  getAllUsers() {
    const users = localStorage.getItem('blogUsers');
    return users ? JSON.parse(users) : [];
  },

  // 保存用户到本地存储
  saveUsers(users) {
    localStorage.setItem('blogUsers', JSON.stringify(users));
  },

  // 获取当前登录用户
  getCurrentUser() {
    const user = localStorage.getItem('blogUser');
    return user ? JSON.parse(user) : null;
  },

  // 注册新用户
  register(userInfo) {
    const users = this.getAllUsers();
    // 检查邮箱是否已注册
    const existingUser = users.find(u => u.email === userInfo.email);
    if (existingUser) {
      return { success: false, message: '该邮箱已被注册' };
    }
    
    // 创建新用户（包含密码用于验证）
    const newUser = {
      id: Date.now(),
      nickname: userInfo.nickname,
      avatar: userInfo.avatar,
      email: userInfo.email,
      password: userInfo.password // 实际项目中应加密存储
    };
    
    // 保存用户列表
    users.push(newUser);
    this.saveUsers(users);
    
    // 自动登录
    this.login(userInfo.email, userInfo.password);
    return { success: true };
  },

  // 登录验证（通过邮箱和密码）
  login(email, password) {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // 登录成功，存储当前用户信息（不含密码）
      const userData = {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        email: user.email
      };
      localStorage.setItem('blogUser', JSON.stringify(userData));
      if (this.onChange) this.onChange();
      return { success: true };
    } else {
      return { success: false, message: '邮箱或密码错误' };
    }
  },

  // 退出登录
  logout() {
    localStorage.removeItem('blogUser');
    if (this.onChange) this.onChange();
  },

  // 监听状态变化
  onChange: null,
  subscribe(callback) {
    this.onChange = callback;
  },

  // 更新用户头像
  updateAvatar(userId, newAvatar) {
    const users = this.getAllUsers();
    const currentUser = this.getCurrentUser();
    
    if (currentUser && currentUser.id === userId) {
      // 更新用户列表中的头像
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex].avatar = newAvatar;
        this.saveUsers(users);
      }
      
      // 更新当前登录用户的头像
      currentUser.avatar = newAvatar;
      localStorage.setItem('blogUser', JSON.stringify(currentUser));
      
      if (this.onChange) this.onChange();
      return true;
    }
    return false;
  }
};

export default userStore;
