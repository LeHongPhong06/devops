const express = require('express');
const dotenv = require('dotenv');
const routes = require('./routes');
const { initDatabase } = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware cơ bản
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ExpressJS API connected to RDS on AWS ECS!',
    version: '1.0.0',
    documentation: {
      healthCheck: 'GET /health',
      systemInfo: 'GET /api/info',
      listUsers: 'GET /api/users',
      userDetail: 'GET /api/users/:id',
    },
  });
});

// Gắn các API routes
app.use('/', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.originalUrl,
  });
});

// Khởi chạy server và kết nối DB
const server = app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`Server is running on port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);

  // Thử kết nối và khởi tạo table trong RDS
  await initDatabase();
});

// Graceful shutdown khi ECS gửi tín hiệu SIGTERM để stop container
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  server.close(() => {
    process.exit(0);
  });
});
