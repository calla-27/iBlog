import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Header from "./components/Header"; // 全局 Header
import Home from "./features/home/pages/Home";
import ArticleDetail from "./features/article/pages/ArticleDetail";
import { MyblogHome, MyblogArticle, MyblogPublish } from "./features/myblog";
import Recommend from "./features/home/pages/Recommend";
import HotBlogs from "./features/home/pages/HotBlogs";
import Columns from "./features/home/pages/Columns";


export default function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <Router>
      {/* 全局 Header，传递侧边栏控制参数 */}
      <Header 
        onToggleSidebar={toggleSidebar} 
        isSidebarCollapsed={isSidebarCollapsed} 
      />
      <Routes>
        {/* 将侧边栏状态传递给 Home 页面 */}
        <Route path="/" element={<Home isSidebarCollapsed={isSidebarCollapsed} />} />
        <Route path="/article/:id" element={<ArticleDetail />} /> 
        <Route path="/myblog" element={<MyblogHome />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/hot-blogs" element={<HotBlogs />} />
        <Route path="/columns" element={<Columns />} />
         {/* 个人博客相关路由 */}
        <Route path="/myblog/article" element={<MyblogArticle />} />
        <Route path="/myblog/publish" element={<MyblogPublish />} />
      </Routes>
    </Router>
  );
}