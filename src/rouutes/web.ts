import { Router } from "express";

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = Router();

const port = 3000;

// 设置文件上传存储路径和文件名
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, 'uploads/');
  },
  filename: (req: any, file: any, cb: any) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// 静态文件服务
router.use(express.static(path.join(__dirname, 'public')));

// 文件上传接口
router.post('/upload', upload.single('video'), (req: any, res: any) => {
  // res.status(200).send({tf:1});
  res.status(200).json({ success: true, message: 'Video uploaded successfully' })
});

export default router
