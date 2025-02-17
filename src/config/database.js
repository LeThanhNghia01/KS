//src/config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'MSQLNghianghia1533@@',
    database: process.env.DB_NAME || 'qlks',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kiểm tra kết nối
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Kết nối database thành công!');
        connection.release();
    } catch (error) {
        console.error('Lỗi kết nối:', error.message);
    }
};

testConnection();

module.exports = pool;