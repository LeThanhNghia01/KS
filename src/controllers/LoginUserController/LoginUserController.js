//src/controllers/LoginUserController/LoginUserController.js
const db = require('../../config/database');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const clientId = '203577863762-qh01gi66p10qq35grb8ki1kpjvqmurug.apps.googleusercontent.com';
const client = new OAuth2Client(clientId);

const loginUserController = {
    login: async (req, res) => {
        try {
            const { email, matKhau } = req.body;

            const [users] = await db.execute(
                'SELECT * FROM NguoiDung WHERE Email = ? AND is_deleted = 0',
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Email hoặc mật khẩu không đúng'
                });
            }

            const user = users[0];
            const isMatch = await bcrypt.compare(matKhau, user.MatKhau);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Email hoặc mật khẩu không đúng'
                });
            }

            // Lưu thông tin user vào session
            req.session.user = {
                id: user.NguoiDungID,
                ten: user.TenNguoiDung,
                email: user.Email,
                role: 'user'
            };

            res.json({
                success: true,
                message: 'Đăng nhập thành công',
                user: {
                    ten: user.TenNguoiDung,
                    email: user.Email
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },

    register: async (req, res) => {
        try {
            const { tenNguoiDung, email, soDienThoai, diaChi, matKhau } = req.body;

            // Kiểm tra email tồn tại
            const [existingUsers] = await db.execute(
                'SELECT * FROM NguoiDung WHERE Email = ?',
                [email]
            );

            if (existingUsers.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email đã được sử dụng'
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(matKhau, 10);

            // Thêm user mới
            const [result] = await db.execute(
                'INSERT INTO NguoiDung (TenNguoiDung, Email, SoDienThoai, DiaChi, MatKhau) VALUES (?, ?, ?, ?, ?)',
                [tenNguoiDung, email, soDienThoai, diaChi, hashedPassword]
            );

            res.status(201).json({
                success: true,
                message: 'Đăng ký thành công',
                user: {
                    id: result.insertId,
                    ten: tenNguoiDung,
                    email: email
                }
            });

        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },

    logout: async (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi server'
                });
            }
            res.json({
                success: true,
                message: 'Đăng xuất thành công'
            });
        });
    },

    checkAuth: async (req, res) => {
        try {
            if (req.session && req.session.user) {
                res.json({
                    isAuthenticated: true,
                    user: {
                        ten: req.session.user.ten,
                        email: req.session.user.email
                    }
                });
            } else {
                res.json({ isAuthenticated: false });
            }
        } catch (error) {
            console.error('Check auth error:', error);
            res.json({ isAuthenticated: false });
        }
    },
     //login gg method
     googleLogin: async (req, res) => {
        try {
            const { credential } = req.body;
            const clientId = '203577863762-qh01gi66p10qq35grb8ki1kpjvqmurug.apps.googleusercontent.com';
            
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: clientId
            });
            
            const payload = ticket.getPayload();
            const { email, name, picture, sub: googleId } = payload;
    
            // Check if user exists
            const [users] = await db.execute(
                'SELECT * FROM NguoiDung WHERE Email = ? AND is_deleted = 0',
                [email]
            );
    
            let user;
            let isFirstTime = false;
            
            if (users.length === 0) {
                // New user - create account
                isFirstTime = true;
                
                // Construct the query based on the actual columns in your database
                const [result] = await db.execute(
                    `INSERT INTO NguoiDung (
                        TenNguoiDung, 
                        Email, 
                        GoogleId, 
                        AnhDaiDien,
                        FirstTimeLogin,
                        LastLoginDate,
                        MatKhau
                    ) VALUES (?, ?, ?, ?, TRUE, NOW(), ?)`,
                    [name, email, googleId, picture, bcrypt.hashSync(Math.random().toString(36), 10)] // Generate a random password for Google users
                );
                
                user = {
                    id: result.insertId,
                    ten: name,
                    email: email,
                    anhDaiDien: picture
                };
            } else {
                // Existing user
                user = users[0];
                // Update login information
                await db.execute(
                    `UPDATE NguoiDung 
                     SET LastLoginDate = NOW(),
                         AnhDaiDien = ?,
                         GoogleId = ?
                     WHERE NguoiDungID = ?`,
                    [picture, googleId, user.NguoiDungID]
                );
            }
    
            // Set session
            req.session.user = {
                id: user.NguoiDungID || user.id,
                ten: user.TenNguoiDung || user.ten,
                email: user.Email,
                anhDaiDien: user.AnhDaiDien || picture,
                role: 'user',
                isFirstTime: isFirstTime
            };
    
            res.json({
                success: true,
                message: 'Đăng nhập thành công với Google',
                isFirstTime: isFirstTime,
                user: {
                    ten: user.TenNguoiDung || user.ten,
                    email: user.Email,
                    anhDaiDien: user.AnhDaiDien || picture
                }
            });
    
        } catch (error) {
            console.error('Google login error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi xác thực Google'
            });
        }
    },
    updateProfile: async (req, res) => {
        try {
            // Kiểm tra người dùng đã đăng nhập chưa
            if (!req.session || !req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Bạn cần đăng nhập để cập nhật thông tin'
                });
            }
    
            const userId = req.session.user.id;
            const { soDienThoai, diaChi } = req.body;
    
            // Cập nhật thông tin người dùng trong database
            await db.execute(
                'UPDATE NguoiDung SET SoDienThoai = ?, DiaChi = ? WHERE NguoiDungID = ?',
                [soDienThoai, diaChi, userId]
            );
    
            // Cập nhật session nếu cần
            if (req.session.user) {
                req.session.user = {
                    ...req.session.user,
                    soDienThoai,
                    diaChi
                };
            }
    
            res.json({
                success: true,
                message: 'Cập nhật thông tin thành công',
                user: {
                    ten: req.session.user.ten,
                    email: req.session.user.email,
                    soDienThoai,
                    diaChi
                }
            });
    
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi cập nhật thông tin'
            });
        }
    }
};
  
 

module.exports = loginUserController;