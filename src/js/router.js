const routes = {
    home: '../Trangchu/TrangChuAdmin.html',
    rooms: '/PhongAdmin/ViewPhongAdmin.html',
    services: '/DichVu/ViewDichVu.html',
    booking: '/DatPhong/DatPhong.html'
} 
router.get('/check-auth', (req, res) => {
    if (req.session.user) {
        return res.json({
            isAuthenticated: true,
            user: req.session.user
        });
    }
    
    // Hoặc kiểm tra token nếu dùng JWT
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            const decoded = verifyToken(token);
            return res.json({
                isAuthenticated: true,
                user: decoded
            });
        } catch (error) {
            return res.json({
                isAuthenticated: false
            });
        }
    }
    
    return res.json({
        isAuthenticated: false
    });
});