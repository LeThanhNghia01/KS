# Đọc mà làm đi mấy con giời
# cách chạy database
nodemon server.js       
# cách chạy web
http://localhost:3000/LoginAdmin/LoginAdmin.html
tài khoản admin là 
admin@admin.com
admin123
http://localhost:3000/LoginUser/LoginUser.html
# cách trình bày 1 trang(ví dụ ở đây là trang loại phòng )
src/
├── controllers/
│   └── LoaiPhongController/
│       ├── loaiPhongController.js     # Xử lý logic
│       └── loaiPhongRoutes.js         # Định nghĩa routes
│       └── LoaiPhongConsole.js         # Model tương tác với DB
│
├── view/
│   └── LoaiPhong/
│       └── QuanLyLoaiPhong.html       # Giao diện
│
└── public/
    └── js/
        └── LoaiPhong/
            └── loaiPhongManager.js     # JavaScript cho giao diện
# và Cập nhật server.js để thêm routes mới:( là thêm vào file server.js á có vậy mà không hiểu à)
const loaiPhongRoutes = require('./src/controllers/LoaiPhongController/loaiPhongRoutes');
// Thêm route API
app.use('/api/loai-phong', checkAdminAuth, loaiPhongRoutes);

// Thêm route cho trang Quản lý loại phòng
app.get('/LoaiPhong/QuanLyLoaiPhong.html', checkAdminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'src/view/LoaiPhong/QuanLyLoaiPhong.html'));
});
# còn làm không chạy được thì hỏi thôi có miệng có tay chân mà:>