import { marked } from "marked";
import prism from "prismjs";
import "prismjs/themes/prism.css";

// TODO: 后端渲染时可移除
export function mdToHtml(md) {
  const html = marked.parse(md);
  // 高亮代码块
  prism.highlightAll();
  return html;
}