const { Pool } = require('pg');
require('dotenv').config();

// Cấu hình kết nối cơ sở dữ liệu PostgreSQL (hoạt động tốt với AWS RDS PostgreSQL)
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'mydb',
  max: 20, // Số connection tối đa trong pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// Khi kết nối với AWS RDS, thường có thể cần SSL tùy theo cấu hình RDS
if (process.env.DB_SSL === 'true') {
  poolConfig.ssl = {
    rejectUnauthorized: false, // RDS AWS SSL certificate
  };
}

const pool = new Pool(poolConfig);

// Lắng nghe sự kiện lỗi connection trong pool
pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

// Hàm khởi tạo bảng mẫu nếu chưa tồn tại
async function initDatabase() {
  try {
    const client = await pool.connect();
    try {
      console.log('[DB] Connecting to database successfully. Initializing tables...');
      
      // Tạo bảng users demo
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Kiểm tra xem đã có dữ liệu mẫu chưa
      const checkResult = await client.query('SELECT COUNT(*) FROM users;');
      if (parseInt(checkResult.rows[0].count, 10) === 0) {
        console.log('[DB] Seeding initial data...');
        await client.query(`
          INSERT INTO users (name, email, role) VALUES 
          ('Nguyen Van A', 'nguyenvana@example.com', 'admin'),
          ('Tran Thi B', 'tranthib@example.com', 'editor'),
          ('Le Van C', 'levanc@example.com', 'user');
        `);
      }

      console.log('[DB] Database tables verified and ready.');
    } finally {
      client.release();
    }
  } catch (error) {
    console.warn('[DB] Could not initialize database immediately. Will retry on request.', error.message);
  }
}

module.exports = {
  pool,
  initDatabase,
};
