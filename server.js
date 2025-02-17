const express = require('express');
const session = require('express-session');
const path = require('path');
const { checkAuth, checkUserAuth, checkAdminAuth } = require('./src/middleware/authMiddleware');
const app = express();

// ===== Cấu hình Middleware =====
app.use(express.json());
app.use(session({
    secret: 'your-secret-key', // Khóa bí mật cho phiên làm việc
    resave: true, // Lưu phiên làm việc ngay cả khi không thay đổi
    saveUninitialized: true, // Lưu phiên ngay cả khi chưa được khởi tạo
    cookie: { 
        secure: false, // Không sử dụng bảo mật HTTPS
        maxAge: 24 * 60 * 60 * 1000 // Thời hạn cookie 1 ngày
    }
}));

// ===== Cấu hình tập tin tĩnh =====
app.use(express.static(path.join(__dirname, 'src'))); // Chỉ định thư mục tĩnh
app.use('/public', express.static(path.join(__dirname, 'src/public')));

// ===== Nhập các controller =====
const loginUserController = require('./src/controllers/LoginUserController/LoginUserController');
const loginAdminController = require('./src/controllers/LoginAdminController/loginadminController');
const profileUserController = require('./src/controllers/ProfileController/profileUserConsole');
const profileController = require('./src/controllers/ProfileController/profileController');

// ===== Nhập các route =====
const loginRoutes = require('./src/controllers/LoginAdminController/loginAdminRoutes');
const profileRoutes = require('./src/controllers/ProfileController/profileRoutes');
const accountsAdminRoutes = require('./src/controllers/AccountsAdminController/accountsAdminRoutes');
const loginUserRoutes = require('./src/controllers/LoginUserController/loginUserRoutes');
const loaiPhongRoutes = require('./src/controllers/LoaiPhongController/loaiPhongRoutes');
const tinhTrangPhongRoutes=require('./src/controllers/TinhTrangPhongController/tinhTrangPhongRoutes')//1

// ===== Các route công khai =====
// Route xác thực
app.post('/api/user/register', loginUserController.register); // Đăng ký người dùng
app.post('/api/user/login', loginUserController.login); // Đăng nhập người dùng

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

// Route accounts admin
app.use('/api/accounts-admin', accountsAdminRoutes);

// Route thông tin cá nhân người dùng
app.get('/api/profileUser/info', profileUserController.getProfileUserInfo); // Lấy thông tin cá nhân
app.post('/api/profileUser/update', profileUserController.updateProfileUser); // Cập nhật thông tin cá nhân
app.get('/api/profile/info', checkAdminAuth, profileController.getProfileInfo);
app.post('/api/profile/update', checkAdminAuth, profileController.updateProfile);

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

// Thêm route API
app.use('/api/loai-phong', checkAdminAuth, loaiPhongRoutes);

// Thêm route cho trang Quản lý loại phòng
app.get('/LoaiPhong/QuanLyLoaiPhong.html', checkAdminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'src/view/LoaiPhong/QuanLyLoaiPhong.html'));
});

app.use('/api/tinh-trang-phong',checkAdminAuth,tinhTrangPhongRoutes);//2
app.get('/TinhTrangPhong/QuanLyTinhTrangPhong.html',checkAdminAuth,(req,res)=>{
    res.sendFile(path.join(__dirname,'src/view/TinhTrangPhong/QuanLyTinhTrangPhong.html'));
});

// ===== Khởi chạy Server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy ở port ${PORT}`); // Thông báo server đã khởi động
});
require('events').EventEmitter.defaultMaxListeners = 15;