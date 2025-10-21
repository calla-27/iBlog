// src/features/myblog/components/MyblogHeader.jsx
import { NavLink } from "react-router-dom";
import s from "../styles/myblog-header.module.css";

export default function MyblogHeader() {
  return (
    <nav className={s.navbar}>
      <ul className={s.navLinks}>
        <li>
          <NavLink to="/myblog" className={({ isActive }) => (isActive ? s.active : "")}>
            首页
          </NavLink>
        </li>
        
      </ul>
    </nav>
  );
}