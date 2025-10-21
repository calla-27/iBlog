// src/components/SidebarLeft.jsx
import './SidebarLeft.css';

export default function SidebarLeft({ activeTab, onTabChange, isCollapsed }) {
  const menuItems = [
    { key: 'columns', label: '首页',   icon: 'fas fa-home' },   // ← 移到第一位并改名
    { key: 'recommend', label: '推荐', icon: 'fas fa-star' },
    { key: 'hot',       label: '热门博客', icon: 'fas fa-fire' },
  ];

  return (
    <div className={`sidebar-left ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-navigation">
        <ul className="nav-menu">
          {menuItems.map((item) => (
            <li
              key={item.key}
              className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => onTabChange(item.key)}
              title={isCollapsed ? item.label : ''}
            >
              <i className={item.icon} />
              {!isCollapsed && <span>{item.label}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}