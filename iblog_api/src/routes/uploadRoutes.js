// src/routes/uploadRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// 1. 确保上传目录存在
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 2. 配置 multer 存储规则
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `cover_${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// 3. 封面图上传接口
router.post('/upload/cover', upload.single('cover'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '未上传文件' });
  }
  // 返回可直访的 URL
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

export default router;