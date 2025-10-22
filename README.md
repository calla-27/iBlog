# 📝 iBlog 博客系统

一个基于 React + Vite 前端和 Node.js + Express 后端的现代化博客平台，支持博客发布、社交互动和个人空间管理。

## 🎯 项目简介

iBlog 是一个功能完整的博客创作与分享平台，采用前后端分离架构，分为博客广场和个人博客两大核心模块。项目提供了完整的文章发布、社交互动、用户管理等功能，为创作者提供优质的写作和阅读体验。

## ✨ 核心功能

### 🏛️ 博客广场
- **文章聚合**: 展示所有用户发布的公开博客文章
- <img width="3200" height="1662" alt="image" src="https://github.com/user-attachments/assets/499f1529-897e-4388-a952-1e91069d1d10" />
- **互动功能**: 支持文章点赞、评论、收藏和浏览统计
- <img width="952" height="1468" alt="image" src="https://github.com/user-attachments/assets/d5e2e605-2f67-410a-b778-5e838af3d3f2" />
- **内容发现**: 按【分类专栏】【热门博客】【精选文章】【推荐】等维度排序展示文章
- <img width="3200" height="1662" alt="image" src="https://github.com/user-attachments/assets/3cacb942-03af-48d7-9592-e525eeefd1cd" />
- **社交互动**: 用户间通过评论系统进行交流
- <img width="3200" height="1662" alt="image" src="https://github.com/user-attachments/assets/ece4806b-739f-4329-be73-6606ae92d24b" />


### 📝 个人博客
- **文章管理**: 博客文章的创建、编辑、发布和删除
- <img width="1430" height="1362" alt="image" src="https://github.com/user-attachments/assets/f3eec649-1431-4056-9b4b-3d4c206a4f30" />
- **草稿系统**: 支持文章草稿保存和后续编辑
- <img width="2276" height="920" alt="image" src="https://github.com/user-attachments/assets/c537fa31-fae6-4d9b-97b0-93b34497a7a0" />
- **个人空间**: 展示用户个人信息和文章统计
- <img width="2258" height="668" alt="image" src="https://github.com/user-attachments/assets/fa14a79f-d0d3-4748-985c-b25a45d30d6a" />
- **内容组织**: 对已发布文章和草稿进行分类管理
- <img width="3200" height="1662" alt="image" src="https://github.com/user-attachments/assets/005dc43f-6065-40ae-9627-6a7d2058ae66" />


### 👤 用户系统
- **用户注册**: 完整的账号注册流程
- <img width="720" height="988" alt="image" src="https://github.com/user-attachments/assets/7e08b4e1-7d5c-432c-8b7a-b316782af6fc" />
- **登录认证**: JWT Token 身份验证
- <img width="732" height="564" alt="image" src="https://github.com/user-attachments/assets/ddf34a15-34c8-403a-bfaa-1830f36dbea4" />


## 🚀 快速开始

### 前置要求
- Node.js 16+ 
- MySQL 8.0+
- npm 或 yarn

### 1. 克隆项目
```bash
git clone https://github.com/your-username/iBlog.git
cd iBlog

### 2.下载依赖
```bash
npm install

## 🏗️ 技术架构

### 前端技术栈
- **框架**: React 18 + Vite
- **语言**: JavaScript/JSX
- **路由**: React Router
- **状态管理**: React Hooks + Context API
- **样式**: CSS Modules / Styled Components
- **HTTP客户端**: Axios
- **构建工具**: Vite

### 后端技术栈
- **运行时**: Node.js
- **框架**: Express.js
- **数据库**: MySQL 8.0
- **认证**: JWT Token
- **文件上传**: Multer
- **安全**: Helmet, CORS, 密码加密
- **开发工具**: Nodemon

## 📂 项目结构

### 前端项目结构
iBlog/
├── public/ # 静态资源
├── src/
│ ├── assets/ # 图片、字体等资源
│ ├── components/ # 可复用组件
│ │ ├── common/ # 通用组件
│ │ └── ui/ # UI基础组件
│ ├── features/ # 功能模块
│ │ ├── article/ # 文章相关功能
│ │ ├── auth/ # 认证功能
│ │ ├── home/ # 首页功能
│ │ ├── myblog/ # 个人博客功能
│ │ └── personal/ # 个人中心功能
│ ├── data/ # 模拟数据
│ ├── services/ # API服务
│ ├── store/ # 状态管理
│ ├── utils/ # 工具函数
│ ├── App.css # 全局样式
│ ├── App.jsx # 根组件
│ ├── index.css # 入口样式
│ └── main.jsx # 应用入口
├── package.json
├── vite.config.js # Vite配置
└── eslint.config.js # 代码规范


### 后端项目结构
iblog_api/
├── config/
│ └── db.js # 数据库配置
├── controllers/ # 控制器层
│ ├── articleController.js
│ ├── commentController.js
│ └── userController.js
├── middlewares/ # 中间件
│ ├── authenticate.js # JWT认证
│ └── errorHandler.js # 错误处理
├── models/ # 数据模型
│ ├── articleModel.js
│ └── commentModel.js
├── routes/ # 路由定义
│ ├── articleRoutes.js
│ ├── commentRoutes.js
│ ├── uploadRoutes.js
│ └── userRoutes.js
├── uploads/ # 文件上传目录
├── .env # 环境变量
├── app.js # 应用入口
└── package.json
