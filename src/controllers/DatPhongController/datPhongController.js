// src/controllers/DatPhongController/datPhongController.js
const db = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../../utils/emailService');

class DatPhongController {
    // Tạo đơn đặt phòng
    async createBooking(req, res) {
        try {
            const { 
                NguoiDungID, 
                PhongID, 
                NgayNhanPhong, 
                NgayTraPhong, 
                SoNguoi, 
                GhiChu,
                PhuongThucThanhToan 
            } = req.body;
            
            // Kiểm tra thông tin bắt buộc
            if (!NguoiDungID || !PhongID || !NgayNhanPhong || !NgayTraPhong) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin bắt buộc'
                });
            }
            
            // Kiểm tra ngày nhận/trả phòng hợp lệ
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const checkInDate = new Date(NgayNhanPhong);
            const checkOutDate = new Date(NgayTraPhong);
            
            if (checkInDate < today) {
                return res.status(400).json({
                    success: false,
                    message: 'Ngày nhận phòng không được là ngày trong quá khứ'
                });
            }
            
            if (checkOutDate <= checkInDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Ngày trả phòng phải sau ngày nhận phòng'
                });
            }
            
            // Kiểm tra phòng có sẵn không
            const isAvailable = await this.checkRoomAvailability(PhongID, NgayNhanPhong, NgayTraPhong);
            if (!isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: 'Phòng không khả dụng trong khoảng thời gian này'
                });
            } 
            
            // Tạo mã đặt phòng
            const MaDatPhong = `DP-${uuidv4().substring(0, 8).toUpperCase()}`;
            
            // Lấy thông tin phòng để tính giá
            const [phong] = await db.query(
                'SELECT p.*, lp.TenLoai FROM Phong p JOIN LoaiPhong lp ON p.IDLoai = lp.IDLoai WHERE p.PhongID = ?',
                [PhongID]
            );
            
            if (phong.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin phòng'
                });
            }
            
            // Tính số ngày thuê
            const soNgay = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
            
            // Tính tổng tiền
            const giaTrenDem = phong[0].Gia;
            const tienPhong = giaTrenDem * soNgay;
            const tienThue = tienPhong * 0.1; // Thuế 10%
            const TongTien = tienPhong + tienThue;
            
            // Xác định trạng thái thanh toán ban đầu
            const trangThaiThanhToan = 'unpaid';
            
            // Bắt đầu transaction
            await db.query('START TRANSACTION');
            
            // Tạo đơn đặt phòng
            const [result] = await db.query(
                `INSERT INTO DatPhong 
                (NguoiDungID, PhongID, NgayNhanPhong, NgayTraPhong, SoNguoi, GhiChu, MaDatPhong, TrangThaiThanhToan, PhuongThucThanhToan, TongTien, TrangThai) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [NguoiDungID, PhongID, NgayNhanPhong, NgayTraPhong, SoNguoi, GhiChu, MaDatPhong, trangThaiThanhToan, PhuongThucThanhToan, TongTien, 'pending']
            );
            
            if (!result || result.affectedRows === 0) {
                await db.query('ROLLBACK');
                return res.status(500).json({
                    success: false,
                    message: 'Có lỗi xảy ra khi tạo đơn đặt phòng'
                });
            }
            
            const bookingId = result.insertId;
            
            // Commit transaction
            await db.query('COMMIT');
            
            // Lấy thông tin người dùng để gửi email
            const [userData] = await db.query(
                'SELECT * FROM NguoiDung WHERE NguoiDungID = ?',
                [NguoiDungID]
            );
            
            if (userData && userData.length > 0) {
                // Gửi email xác nhận
                await this.sendBookingConfirmationEmail(userData[0], {
                    MaDatPhong,
                    TenLoai: phong[0].TenLoai,
                    NgayNhanPhong,
                    NgayTraPhong,
                    SoNguoi,
                    TongTien
                });
            }
            
            // Xử lý thanh toán VNPay nếu được chọn
            let paymentUrl = null;
            if (PhuongThucThanhToan === 'vnpay') {
                paymentUrl = await this.createVNPayPaymentUrl(
                    bookingId,
                    MaDatPhong,
                    TongTien,
                    `Thanh toán đặt phòng ${phong[0].TenLoai}`
                );
            }
            
            return res.status(201).json({
                success: true,
                message: 'Đặt phòng thành công',
                data: {
                    bookingId,
                    MaDatPhong,
                    paymentUrl
                }
            });
            
        } catch (error) {
            console.error('Error in createBooking:', error);
            
            // Rollback nếu đang trong transaction
            try {
                await db.query('ROLLBACK');
            } catch (e) {
                console.error('Error during transaction rollback:', e);
            }
            
            return res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi xử lý đặt phòng',
                error: error.message
            });
        }
    }
    
    // Kiểm tra phòng có sẵn không
    async checkRoomAvailability(PhongID, NgayNhanPhong, NgayTraPhong) {
        try {
            // Kiểm tra trạng thái phòng có phải "Trống" không
            const [roomStatus] = await db.query(
                `SELECT tp.TenTinhTrang FROM Phong p
                JOIN TinhTrangPhong tp ON p.TinhTrangID = tp.TinhTrangID
                WHERE p.PhongID = ?`,
                [PhongID]
            );
            
            if (roomStatus.length === 0 || roomStatus[0].TenTinhTrang !== 'Trống') {
                return false;
            }
            
            // Kiểm tra phòng đã được đặt trong khoảng thời gian này chưa
            const [bookings] = await db.query(
                `SELECT * FROM DatPhong
                WHERE PhongID = ? AND TrangThai != 'cancelled'
                AND (
                    (NgayNhanPhong <= ? AND NgayTraPhong > ?) OR
                    (NgayNhanPhong < ? AND NgayTraPhong >= ?) OR
                    (NgayNhanPhong >= ? AND NgayTraPhong <= ?)
                )`,
                [
                    PhongID,
                    NgayTraPhong, NgayNhanPhong,
                    NgayTraPhong, NgayNhanPhong,
                    NgayNhanPhong, NgayTraPhong
                ]
            );
            
            return bookings.length === 0;
        } catch (error) {
            console.error('Error checking room availability:', error);
            return false;
        }
    }
    
    // Tạo URL thanh toán VNPay
    async createVNPayPaymentUrl(bookingId, MaDatPhong, amount, orderInfo) {
        try {
            // Lấy config VNPay từ biến môi trường
            const vnp_TmnCode = process.env.VNP_TMN_CODE;
            const vnp_HashSecret = process.env.VNP_HASH_SECRET;
            const vnp_Url = process.env.VNP_URL;
            const vnp_ReturnUrl = process.env.VNP_RETURN_URL;
            
            // Kiểm tra tính khả dụng của VNPay
            if (!vnp_TmnCode || !vnp_HashSecret || !vnp_Url || !vnp_ReturnUrl) {
                console.error('VNPay configuration is missing');
                return null;
            }
            
            // Format ngày giờ tạo giao dịch
            const date = new Date();
            const createDate = date.toISOString().split('T')[0].split('-').join('') + 
                               date.toTimeString().split(' ')[0].split(':').join('');
            
            // Tạo mã giao dịch VNPay
            const orderId = MaDatPhong + date.getTime();
            
            // Tạo params cho VNPay URL
            const vnp_Params = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: vnp_TmnCode,
                vnp_Locale: 'vn',
                vnp_CurrCode: 'VND',
                vnp_TxnRef: orderId,
                vnp_OrderInfo: orderInfo,
                vnp_OrderType: 'billpayment',
                vnp_Amount: amount * 100, // Nhân 100 vì VNPay làm việc với đơn vị 100 đồng
                vnp_ReturnUrl: `${vnp_ReturnUrl}?bookingId=${bookingId}`,
                vnp_IpAddr: '127.0.0.1', // IP của người dùng, có thể lấy từ request
                vnp_CreateDate: createDate
            };
            
            // Sắp xếp các params theo thứ tự alphabet (yêu cầu của VNPay)
            const sortedParams = {};
            Object.keys(vnp_Params).sort().forEach(key => {
                sortedParams[key] = vnp_Params[key];
            });
            
            // Import crypto library
            const crypto = require('crypto');
            
            // Tạo chuỗi ký tự để tính hmac
            const signData = Object.keys(sortedParams)
                .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
                .join('&');
            
            // Tạo chữ ký hmac
            const hmac = crypto.createHmac('sha512', vnp_HashSecret);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
            
            // Thêm chữ ký vào params
            const finalUrl = vnp_Url + '?' + signData + '&vnp_SecureHash=' + signed;
            
            // Log URL thanh toán để debug
            console.log('Generated VNPay URL:', finalUrl);
            
            return finalUrl;
        } catch (error) {
            console.error('Error creating VNPay payment URL:', error);
            return null;
        }
    }
    
    // Gửi email xác nhận đặt phòng
    async sendBookingConfirmationEmail(userData, bookingData) {
        try {
            const { Email, TenNguoiDung } = userData;
            const { MaDatPhong, TenLoai, NgayNhanPhong, NgayTraPhong, SoNguoi, TongTien } = bookingData;
            
            // Format ngày
            const formatDate = (dateString) => {
                const date = new Date(dateString);
                return date.toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            };
            
            // Format tiền
            const formatPrice = (price) => {
                return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
            };
            
            const emailSubject = `Xác nhận đặt phòng - Mã đặt phòng: ${MaDatPhong}`;
            
            const emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                    <h2 style="color: #4a6da7; text-align: center;">Xác nhận đặt phòng</h2>
                    <p>Kính gửi <strong>${TenNguoiDung}</strong>,</p>
                    <p>Cảm ơn bạn đã đặt phòng tại Resort của chúng tôi. Đơn đặt phòng của bạn đã được ghi nhận.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h3 style="color: #4a6da7; margin-top: 0;">Chi tiết đặt phòng</h3>
                        <p><strong>Mã đặt phòng:</strong> ${MaDatPhong}</p>
                        <p><strong>Loại phòng:</strong> ${TenLoai}</p>
                        <p><strong>Ngày nhận phòng:</strong> ${formatDate(NgayNhanPhong)}</p>
                        <p><strong>Ngày trả phòng:</strong> ${formatDate(NgayTraPhong)}</p>
                        <p><strong>Số lượng khách:</strong> ${SoNguoi}</p>
                        <p><strong>Tổng thanh toán:</strong> ${formatPrice(TongTien)}</p>
                    </div>
                    
                    <p>Đơn đặt phòng của bạn đang được xét duyệt. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận.</p>
                    
                    <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại dưới đây.</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="margin: 5px 0;">Trân trọng,</p>
                        <p style="margin: 5px 0;"><strong>Resort Team</strong></p>
                        <p style="margin: 5px 0;">Email: support@resort.com</p>
                        <p style="margin: 5px 0;">Hotline: 1900 1234</p>
                    </div>
                </div>
            `;
            
            await sendEmail(Email, emailSubject, emailContent);
            console.log(`Booking confirmation email sent to ${Email}`);
            return true;
        } catch (error) {
            console.error('Error sending booking confirmation email:', error);
            return false;
        }
    }
    
    // Lấy danh sách đặt phòng của người dùng
    async getUserBookings(req, res) {
        try {
            const { userId } = req.params;
            
            // Kiểm tra userId với người dùng đang đăng nhập
            if (req.userData.NguoiDungID != userId && !req.userData.isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền xem thông tin này'
                });
            }
            
            // Lấy danh sách đặt phòng
            const [bookings] = await db.query(
                `SELECT dp.*, p.SoPhong, lp.TenLoai
                FROM DatPhong dp
                JOIN Phong p ON dp.PhongID = p.PhongID
                JOIN LoaiPhong lp ON p.IDLoai = lp.IDLoai
                WHERE dp.NguoiDungID = ?
                ORDER BY dp.NgayTao DESC`,
                [userId]
            );
            
            return res.status(200).json({
                success: true,
                data: bookings
            });
        } catch (error) {
            console.error('Error getting user bookings:', error);
            return res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy danh sách đặt phòng',
                error: error.message
            });
        }
    }
    
    // Hủy đặt phòng
    async cancelBooking(req, res) {
        try {
            const { bookingId } = req.params;
            
            // Kiểm tra đơn đặt phòng tồn tại
            const [booking] = await db.query(
                'SELECT * FROM DatPhong WHERE DatPhongID = ?',
                [bookingId]
            );
            
            if (booking.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy đơn đặt phòng'
                });
            }
            
            // Kiểm tra quyền hủy đơn
            if (booking[0].NguoiDungID != req.userData.NguoiDungID && !req.userData.isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền hủy đơn đặt phòng này'
                });
            }
            
            // Kiểm tra trạng thái đơn
            if (booking[0].TrangThai === 'cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'Đơn đặt phòng đã được hủy trước đó'
                });
            }
            
            if (booking[0].TrangThai === 'completed') {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể hủy đơn đặt phòng đã hoàn thành'
                });
            }
            
            // Kiểm tra thời gian hủy (có thể hủy trước 24h)
            const ngayNhanPhong = new Date(booking[0].NgayNhanPhong);
            const now = new Date();
            const hoursBeforeCheckIn = (ngayNhanPhong - now) / (1000 * 60 * 60);
            
            if (hoursBeforeCheckIn < 24 && !req.userData.isAdmin) {
                return res.status(400).json({
                    success: false,
                    message: 'Chỉ có thể hủy đơn đặt phòng trước thời gian nhận phòng ít nhất 24 giờ'
                });
            }
            
            // Cập nhật trạng thái đơn đặt phòng
            await db.query(
                'UPDATE DatPhong SET TrangThai = ?, NgayCapNhat = NOW() WHERE DatPhongID = ?',
                ['cancelled', bookingId]
            );
            
            // Gửi email thông báo hủy đơn
            const [userData] = await db.query(
                'SELECT * FROM NguoiDung WHERE NguoiDungID = ?',
                [booking[0].NguoiDungID]
            );
            
            if (userData && userData.length > 0) {
                this.sendCancellationEmail(userData[0], booking[0]);
            }
            
            return res.status(200).json({
                success: true,
                message: 'Hủy đơn đặt phòng thành công'
            });
        } catch (error) {
            console.error('Error cancelling booking:', error);
            return res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi hủy đơn đặt phòng',
                error: error.message
            });
        }
    }
    
    // Gửi email thông báo hủy đơn
    async sendCancellationEmail(userData, bookingData) {
        try {
            const { Email, TenNguoiDung } = userData;
            const { MaDatPhong } = bookingData;
            
            const emailSubject = `Thông báo hủy đặt phòng - Mã đặt phòng: ${MaDatPhong}`;
            
            const emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                    <h2 style="color: #4a6da7; text-align: center;">Thông báo hủy đặt phòng</h2>
                    <p>Kính gửi <strong>${TenNguoiDung}</strong>,</p>
                    <p>Đơn đặt phòng của bạn với mã <strong>${MaDatPhong}</strong> đã được hủy thành công.</p>
                    
                    <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại dưới đây.</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="margin: 5px 0;">Trân trọng,</p>
                        <p style="margin: 5px 0;"><strong>Resort Team</strong></p>
                        <p style="margin: 5px 0;">Email: support@resort.com</p>
                        <p style="margin: 5px 0;">Hotline: 1900 1234</p>
                    </div>
                </div>
            `;
            
            await sendEmail(Email, emailSubject, emailContent);
            console.log(`Booking cancellation email sent to ${Email}`);
            return true;
        } catch (error) {
            console.error('Error sending cancellation email:', error);
            return false;
        }
    }
    
    // API xử lý callback từ VNPay
    async handleVNPayReturn(req, res) {
        try {
            const vnp_Params = req.query;
            const bookingId = vnp_Params.bookingId;
            
            // Import crypto library
            const crypto = require('crypto');
            
            // Lấy config VNPay từ biến môi trường
            const vnp_HashSecret = process.env.VNP_HASH_SECRET;
            
            // Xóa chữ ký từ query params
            const secureHash = vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];
            
            // Sắp xếp các params theo thứ tự alphabet
            const sortedParams = {};
            Object.keys(vnp_Params).sort().forEach(key => {
                sortedParams[key] = vnp_Params[key];
            });
            
            // Tạo chuỗi ký tự để tính hmac
            const signData = Object.keys(sortedParams)
                .map(key => `${key}=${sortedParams[key]}`)
                .join('&');
            
            // Tạo chữ ký hmac để kiểm tra
            const hmac = crypto.createHmac('sha512', vnp_HashSecret);
            const calculatedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
            
            // Kiểm tra chữ ký
            if (secureHash !== calculatedHash) {
                console.error('Invalid VNPay signature');
                return res.redirect('/payment-error');
            }
            
            // Kiểm tra kết quả giao dịch
            const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
            
            if (vnp_ResponseCode === '00') {
                // Giao dịch thành công, cập nhật trạng thái thanh toán
                await db.query(
                    'UPDATE DatPhong SET TrangThaiThanhToan = ? WHERE DatPhongID = ?',
                    ['paid', bookingId]
                );
                
                return res.redirect('/payment-success');
            } else {
                // Giao dịch thất bại
                console.error(`VNPay payment failed with code: ${vnp_ResponseCode}`);
                return res.redirect('/payment-error');
            }
        } catch (error) {
            console.error('Error handling VNPay return:', error);
            return res.redirect('/payment-error');
        }
    }
}

module.exports = new DatPhongController();