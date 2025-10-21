import { articleSchema } from "./articleSchema";

// 模拟文章数据（后续替换为 API 请求）
export const articles = [
  {
    ...articleSchema,
    articleId: "1",
    articleTitle: "Vite 入门教程",
    articleContent: "Vite 是一款极速前端构建工具，本文介绍如何使用 Vite 初始化项目。",
    articleCover: "",
    articleCategory: "前端开发",
    articleTopics: ["Vite", "前端"],
    articleLikes: 123,
    articleCollections: 45,
    articleComments: [],
    articleCreatedAt: "2025-10-06",
    articleUpdatedAt: "2025-10-06",

    userId: "user1",
    userName: "张三",
    userAvatar: "",
  },
  // 更多文章...
];