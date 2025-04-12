const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors'); // Add this line
const { checkUserAuth, checkAdminAuth } = require('./src/middleware/authMiddleware');
const app = express();

// ===== Cấu hình Middleware Cơ bản =====
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ===== Cấu hình Session =====
app.use(session({
    secret: 'hhhhjjjaaaa1hja1',
    resave: false, // Changed to false to avoid unnecessary session saves
    saveUninitialized: false, // Changed to false for better session handling
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    },
    name: 'sessionId' // Custom session name for better security
}));

// Add this after session configuration
app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session Data:', req.session);
    next();
});

app.use('/public', express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// ===== Cấu hình Static Files =====
app.use('/public', express.static(path.join(__dirname, 'src/public')));
app.use(express.static(path.join(__dirname, 'src')));

// Thêm các route API công khai cho người dùng
app.get('/api/loai-phong/list', require('./src/controllers/LoaiPhongController/loaiPhongController').getAllLoaiPhong);
app.get('/api/tinh-trang-phong/list', require('./src/controllers/TinhTrangPhongController/tinhTrangPhongController').getAllTinhTrangPhong);
app.get('/api/tien-nghi-phong/list', require('./src/controllers/tienNghiPhongController/tienNghiPhongController').getAllTienNghi);


// ===== Nhập các controller =====
const loginUserController = require('./src/controllers/LoginUserController/LoginUserController');
const loginAdminController = require('./src/controllers/LoginAdminController/loginadminController');
const profileUserController = require('./src/controllers/ProfileController/profileUserController');
const profileController = require('./src/controllers/ProfileController/profileController');

// ===== Nhập các route =====
const loginRoutes = require('./src/controllers/LoginAdminController/loginAdminRoutes');
const profileRoutes = require('./src/controllers/ProfileController/profileRoutes');
const profileUserRoutes = require('./src/controllers/ProfileController/profileUserRoutes');
const accountsAdminRoutes = require('./src/controllers/AccountsAdminController/accountsAdminRoutes');
const loginUserRoutes = require('./src/controllers/LoginUserController/loginUserRoutes');
const loaiPhongRoutes = require('./src/controllers/LoaiPhongController/loaiPhongRoutes');
const tinhTrangPhongRoutes=require('./src/controllers/TinhTrangPhongController/tinhTrangPhongRoutes')//1
const tienNghiPhongRoutes=require('./src/controllers/TienNghiPhongController/tienNghiPhongRoutes')
const phongAdminRoutes = require('./src/controllers/PhongAdminController/PhongAdminRoutes');
const phongUserRoutes = require('./src/controllers/PhongUserController/phongUserRoutes');
const datPhongRoutes = require('./src/controllers/DatPhongController/datPhongRoutes');

// ===== Public Routes =====
app.post('/api/user/register', loginUserController.register);
app.post('/api/user/login', loginUserController.login);
app.post('/api/user/google-login', loginUserController.googleLogin);
app.get('/api/user/check-auth', loginUserController.checkAuth);

// Profile route - before auth middleware
app.get('/api/user/profile', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Ensure user data exists and log it
        console.log('Session user data:', req.session.user);
        
        if (!req.session.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user data in session'
            });
        }

        res.json({
            success: true,
            data: {
                NguoiDungID: req.session.user.id,
                ten: req.session.user.ten,
                email: req.session.user.email,
                soDienThoai: req.session.user.soDienThoai,
                diaChi: req.session.user.diaChi
            }
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ===== Auth Middleware - After public routes =====
app.use('/api/user', checkUserAuth);
app.use('/api/admin', checkAdminAuth);

// ===== Protected Routes - After auth middleware =====
app.use('/api/profileUser', profileUserRoutes);
app.use('/api/dat-phong', datPhongRoutes);

// ===== Các route công khai =====
// Route xác thực
app.post('/api/user/register', loginUserController.register); // Đăng ký người dùng
app.post('/api/user/login', loginUserController.login); // Đăng nhập người dùng
app.post('/api/user/google-login', loginUserController.googleLogin); // Đăng nhập bằng Google
app.get('/api/user/check-auth', loginUserController.checkAuth); // Kiểm tra xác thực
app.use('/api/phong', phongUserRoutes);
app.use('/api/dat-phong', require('./src/controllers/DatPhongController/datPhongRoutes'));
// Routes cho User - những route user cần xác thực
app.use('/api/user/profile', checkUserAuth);
app.use('/api/user/bookings', checkUserAuth);
// Route đăng nhập admin không cần middleware auth
app.post('/api/admin/login', loginAdminController.loginAdmin);
app.get('/api/admin/check-auth', loginAdminController.checkAuth);

// Route HTML công khai
app.get('/LoginUser/LoginUser.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/view/LoginUser/LoginUser.html')); // Gửi file LoginUser.html
});

app.get('/RegisterUser/RegisterUser.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/view/RegisterUser/RegisterUser.html')); // Gửi file RegisterUser.html
});
app.get('/LoginAdmin/LoginAdmin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/view/LoginAdmin/LoginAdmin.html')); // Gửi file LoginAdmin.html
});

// Route giao diện bố cục
app.get('/layouts/header.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/view/layouts/header.html')); // Gửi file header.html
});
app.get('/layouts/headerUser.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/view/layouts/headerUser.html')); // Gửi file headerUser.html
});

// ===== Các route bảo vệ =====
// Các route admin khác mới cần middleware
app.use('/api/admin', checkAdminAuth);
app.use('/api/user', loginUserRoutes);
// Route accounts admin
app.use('/api/accounts-admin', accountsAdminRoutes);

// Route thông tin cá nhân người dùng
app.get('/api/profileUser/info', profileUserController.getProfileUserInfo); // Lấy thông tin cá nhân
app.post('/api/profileUser/update', profileUserController.updateProfileUser); // Cập nhật thông tin cá nhân
app.get('/api/profile/info', checkAdminAuth, profileController.getProfileInfo);
app.post('/api/profile/update', checkAdminAuth, profileController.updateProfile);

// Add this route before other user routes
app.get('/api/user/profile', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Log session data
        console.log('Session user data:', req.session.user);

        res.json({
            success: true,
            data: {
                NguoiDungID: req.session.user.id,
                ten: req.session.user.ten,
                email: req.session.user.email,
                soDienThoai: req.session.user.soDienThoai,
                diaChi: req.session.user.diaChi
            }
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Routes cho User
app.use('/api/user', checkUserAuth);
app.get('/api/user/check-auth', loginUserController.checkAuth);

// Thêm endpoint đăng xuất cho người dùng
app.post('/api/user/logout', (req, res) => {
    // Hủy session của người dùng
    req.session.destroy((err) => {
        if (err) {
            console.error('Lỗi khi đăng xuất:', err);
            return res.status(500).json({ success: false, message: 'Đăng xuất không thành công' });
        }
        // Xóa cookie session nếu có
        res.clearCookie('connect.sid'); // 'connect.sid' là tên mặc định của cookie session
        res.json({ success: true, message: 'Đăng xuất thành công' });
    });
});

// Thêm endpoint đăng xuất cho người dùng admin
app.post('/api/admin/logout', (req, res) => {
    // Hủy session của người dùng
    req.session.destroy((err) => {
        if (err) {
            console.error('Lỗi khi đăng xuất:', err);
            return res.status(500).json({ success: false, message: 'Đăng xuất không thành công' });
        }
        // Xóa cookie session nếu có
        res.clearCookie('connect.sid'); // 'connect.sid' là tên mặc định của cookie session
        res.json({ success: true, message: 'Đăng xuất thành công' });
    });
});

// Khai báo publicRoutes ở mức global
const publicRoutes = [
    '/LoginAdmin/LoginAdmin.html',
    '/LoginUser/LoginUser.html', 
    '/RegisterUser/RegisterUser.html',
    '/layouts/header.html',
    '/layouts/headerUser.html',
    '/TrangChu/TrangChuUser.html',
    '/public'
];

// ===== Middleware xác thực route HTML =====
app.use('/:folder/:file', (req, res, next) => {
    if (publicRoutes.some(route => req.path.startsWith(route))) {
        return next();
    }
    
    // Kiểm tra session user hoặc admin
    if (!req.session.user && !req.session.admin) {
        if (req.path.includes('Admin')) {
            return res.redirect('/LoginAdmin/LoginAdmin.html');
        }
        return res.redirect('/LoginUser/LoginUser.html');
    }
    next();
});

// Tách middleware xác thực cho admin
app.use('/Admin/:file', (req, res, next) => {
    if (!req.session.admin) {
        return res.redirect('/LoginAdmin/LoginAdmin.html');
    }
    next();
});

// Route HTML được bảo vệ
app.get('/TrangChu/TrangChuUser.html', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/LoginUser/LoginUser.html');
    }
    res.sendFile(path.join(__dirname, 'src/view/TrangChu/TrangChuUser.html'));
});

// Route mặc định cho các file khác
app.get('/:folder/:file', (req, res) => {
    const filePath = path.join(__dirname, 'src/view', req.params.folder, req.params.file);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Lỗi khi gửi file:', err);
            res.status(err.status).end();
        }
    });
});

// ===== Các route tiện ích =====
// Xử lý kiểu nội dung JavaScript
app.use((req, res, next) => {
    if (req.url.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript'); // Đặt kiểu nội dung cho JavaScript
    }
    next();
});
// Thêm route cho trang Quản lý phòng
app.use('/api/phong-admin', phongAdminRoutes);
app.get('/Phong/roomManager.html', checkAdminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'src/view/Phong/roomManager.html'));
});


app.get('/Phong/roomUserManager.html', checkUserAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'src/view/Phong/roomUserManager.html'));
});


// Thêm route API
app.use('/api/loai-phong', checkAdminAuth, loaiPhongRoutes);
app.use('/api/tinh-trang-phong', checkAdminAuth, tinhTrangPhongRoutes);
app.use('/api/tien-nghi-phong', checkAdminAuth, tienNghiPhongRoutes);   

// Thêm route cho trang Quản lý loại phòng
app.get('/LoaiPhong/QuanLyLoaiPhong.html', checkAdminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'src/view/LoaiPhong/QuanLyLoaiPhong.html'));
});

app.get('/TinhTrangPhong/QuanLyTinhTrangPhong.html',checkAdminAuth,(req,res)=>{
    res.sendFile(path.join(__dirname,'src/view/TinhTrangPhong/QuanLyTinhTrangPhong.html'));
});

app.get('/TienNghiPhong/TienNghiPhongManager.html',checkAdminAuth,(req,res)=>{
    res.sendFile(path.join(__dirname,'src/view/TienNghiPhong/TienNghiPhongManager.html'));
});
// ===== Khởi chạy Server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy ở port ${PORT}`); // Thông báo server đã khởi động
});
// Add a unified auth check endpoint
app.get('/api/auth/check-status', (req, res) => {
    if (req.session.user) {
        return res.json({
            isAuthenticated: true,
            userType: 'user',
            user: req.session.user
        });
    } else if (req.session.admin) {
        return res.json({
            isAuthenticated: true,
            userType: 'admin',
            admin: req.session.admin
        });
    } else {
        return res.json({
            isAuthenticated: false
        });
    }
});
require('events').EventEmitter.defaultMaxListeners = 15;