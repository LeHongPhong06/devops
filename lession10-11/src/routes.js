const express = require('express');
const os = require('os');
const { pool } = require('./db');

const router = express.Router();

/**
 * 1. Health check endpoint (Dành cho AWS ALB / ECS Target Group Health Check)
 * AWS ALB sẽ định kỳ gọi GET /health hoặc GET / để kiểm tra container còn sống không
 */
router.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  const isHealthy = dbStatus === 'connected';

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
  });
});

/**
 * 2. System info endpoint
 * Giúp kiểm tra request đang được load balancing vào container (task ECS) nào
 */
router.get('/api/info', (req, res) => {
  res.json({
    message: 'ExpressJS API on AWS ECS',
    hostname: os.hostname(), // Container ID / Hostname
    platform: process.platform,
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    clientIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
  });
});

/**
 * 3. Lấy danh sách users từ RDS
 */
router.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY id ASC');
    res.json({
      success: true,
      count: result.rowCount,
      data: result.rows,
      servedByHost: os.hostname(),
    });
  } catch (error) {
    console.error('[API] Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to query database',
      error: error.message,
    });
  }
});

/**
 * 4. Lấy chi tiết 1 user theo ID từ RDS
 */
router.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `User with id ${id} not found`,
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      servedByHost: os.hostname(),
    });
  } catch (error) {
    console.error(`[API] Error fetching user ${id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to query database',
      error: error.message,
    });
  }
});

module.exports = router;
