import React, { useEffect } from 'react'

const App: React.FC = () => {
  // 动态加载原脚本（避免 Vite 对相对路径报错）
  useEffect(() => {
    // 加载顺序：先公共工具，再业务
    const loadScript = (src: string) => {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      document.body.appendChild(script)
      return () => {
        document.body.removeChild(script)
      }
    }
    loadScript('/src/personal/script.js')
    loadScript('/src/personal/index.js')
  }, [])

  return (
    <div className="personal-blog">
      {/* 1. 返回广场（固定右上角） */}
      <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 999 }}>
        <a
          href="/"
          style={{
            color: '#fff',
            background: '#3b82f6',
            padding: '6px 12px',
            borderRadius: 4,
            textDecoration: 'none'
          }}
        >
          ← 返回广场
        </a>
      </div>

      {/* 2. 原 MYBLOG 整页内容（className 已对应命名空间） */}
      <div className="page-wrapper">
        <nav className="navbar">
          <div className="brand">
            <h1>H9的博客</h1>
            <i className="fa-solid fa-hands-asl-interpreting"></i>
          </div>
          <ul className="nav-links">
            <li><a href="index.html">首页</a></li>
            <li><a href="about.html">关于我</a></li>
            <li><a href="contact.html">联系方式</a></li>
          </ul>
        </nav>

        <section className="hero">
          <div className="hello">
            <i className="fa-solid fa-hands-clapping"></i>
            <h2>欢 迎 来 到 我 的 个 人 博 客</h2>
          </div>
          <h3>记录生活、分享技术、表达观点</h3>
        </section>

        <section className="articles">
          <h2>最 新 文 章</h2>
          <div id="articleList"></div>
        </section>

        <footer>
          <p>&copy; 2025 H9的个人博客. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}

export default App