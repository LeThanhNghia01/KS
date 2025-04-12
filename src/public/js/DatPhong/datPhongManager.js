// src/public/js/DatPhong/datPhongManager.js
const DatPhongManager = {
    roomData: null,
    userData: null,
    
      // Khởi tạo
      async init() {
        try {
            // Kiểm tra xác thực
            const response = await fetch('/api/user/check-auth', {
                method: 'GET',
                credentials: 'include'
            });
    
            const authData = await response.json();
    
            if (!authData.isAuthenticated) {
                const currentUrl = encodeURIComponent(window.location.href);
                window.location.href = `/LoginUser/LoginUser.html?redirect=${currentUrl}`;
                return;
            }
    
            // Lưu thông tin người dùng
            this.userData = authData.user;
            
            // Tiếp tục khởi tạo
            const urlParams = new URLSearchParams(window.location.search);
            const phongId = urlParams.get('phongId');
    
            if (!phongId) {
                alert('Không tìm thấy thông tin phòng');
                window.location.href = '/Phong/roomUserManager.html';
                return;
            }
    
            await this.loadRoomInfo(phongId);
            this.setupEventListeners();
            this.setupDefaultDates();
            this.fillUserInfo();
    
        } catch (error) {
            console.error('Error initializing booking manager:', error);
            alert('Đã xảy ra lỗi, vui lòng thử lại sau');
        }
    }
    ,
    isUserLoggedIn() {
        const userJson = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (userJson && token) {
            try {
                const userData = JSON.parse(userJson);
                return userData && userData.NguoiDungID;
            } catch (e) {
                console.error('Error parsing user data:', e);
                return false;
            }
        }
        return false;
    },
    fillUserInfo() {
        // Điền tên người dùng từ dữ liệu API và giữ readonly
        document.getElementById('fullName').value = this.userData.ten || this.userData.TenNguoiDung || '';
        
        // Điền số điện thoại nếu có, nhưng cho phép chỉnh sửa
        const phoneField = document.getElementById('phoneNumber');
        phoneField.value = this.userData.soDienThoai || this.userData.SoDienThoai || '';
        phoneField.removeAttribute('readonly'); // Xóa thuộc tính readonly
        
        // Điền email nếu có, nhưng cho phép chỉnh sửa
        const emailField = document.getElementById('email');
        emailField.value = this.userData.email || this.userData.Email || '';
        emailField.removeAttribute('readonly'); // Xóa thuộc tính readonly
    },
    
    
    // Thiết lập ngày mặc định
    setupDefaultDates() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        
        // Format ngày thành YYYY-MM-DD
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        // Thiết lập ngày nhận phòng = ngày mai
        const checkInInput = document.getElementById('checkInDate');
        checkInInput.value = formatDate(tomorrow);
        checkInInput.min = formatDate(tomorrow);
        
        // Thiết lập ngày trả phòng = ngày sau ngày mai
        const checkOutInput = document.getElementById('checkOutDate');
        checkOutInput.value = formatDate(dayAfterTomorrow);
        checkOutInput.min = formatDate(dayAfterTomorrow);
        
        // Cập nhật tóm tắt đặt phòng
        this.updateBookingSummary();
    },
    
    // Lấy thông tin phòng
    async loadRoomInfo(phongId) {
        try {
            const response = await fetch(`/api/phong/${phongId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            if (result.success) {
                this.roomData = result.data;
                this.displayRoomInfo();
                this.updateBookingSummary();
            } else {
                alert('Không thể tải thông tin phòng');
                window.location.href = '/roomUser.html';
            }
        } catch (error) {
            console.error('Error loading room info:', error);
            alert('Đã có lỗi xảy ra khi tải thông tin phòng');
            window.location.href = '/roomUser.html';
        }
    },
    
    // Hiển thị thông tin phòng
    displayRoomInfo() {
        const { TenLoai, Gia, anhPhong } = this.roomData;
        
        document.getElementById('roomName').textContent = `Phòng ${TenLoai}`;
        document.getElementById('roomType').textContent = TenLoai;
        
        // Format giá
        const priceFormatted = new Intl.NumberFormat('vi-VN').format(Gia);
        document.getElementById('roomPrice').textContent = `${priceFormatted}đ / đêm`;
        
        // Hiển thị ảnh đầu tiên nếu có
        if (anhPhong && anhPhong.length > 0) {
            document.getElementById('roomImage').src = anhPhong[0];
        }
    },
    
    // Thiết lập các sự kiện
    setupEventListeners() {
        // Sự kiện thay đổi ngày
        const checkInInput = document.getElementById('checkInDate');
        const checkOutInput = document.getElementById('checkOutDate');
        
        checkInInput.addEventListener('change', () => {
            // Ngày trả phòng phải sau ngày nhận ít nhất 1 ngày
            const checkInDate = new Date(checkInInput.value);
            const nextDay = new Date(checkInDate);
            nextDay.setDate(nextDay.getDate() + 1);
            
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            
            checkOutInput.min = formatDate(nextDay);
            
            // Nếu ngày trả <= ngày nhận, cập nhật ngày trả
            const checkOutDate = new Date(checkOutInput.value);
            if (checkOutDate <= checkInDate) {
                checkOutInput.value = formatDate(nextDay);
            }
            
            this.updateBookingSummary();
        });
        
        checkOutInput.addEventListener('change', () => {
            this.updateBookingSummary();
        });
        
        // Sự kiện số lượng khách
        document.getElementById('numberOfGuests').addEventListener('change', this.updateBookingSummary.bind(this));
        
        // Sự kiện nút đặt phòng
        document.getElementById('confirmBookingBtn').addEventListener('click', () => {
            // Kiểm tra form
            const form = document.getElementById('bookingForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            // Hiển thị modal xác nhận
            const confirmModal = new bootstrap.Modal(document.getElementById('bookingConfirmModal'));
            confirmModal.show();
        });
        
        // Sự kiện nút xác nhận trong modal
        document.getElementById('processBookingBtn').addEventListener('click', this.processBooking.bind(this));
    },
    
    // Cập nhật tóm tắt đặt phòng
    updateBookingSummary() {
        if (!this.roomData) return;
        
        const checkInDate = new Date(document.getElementById('checkInDate').value);
        const checkOutDate = new Date(document.getElementById('checkOutDate').value);
        
        // Tính số đêm
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        
        // Format ngày hiển thị
        const formatDisplayDate = (date) => {
            return date.toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };
        
        // Hiển thị thông tin
        document.getElementById('summaryCheckIn').textContent = formatDisplayDate(checkInDate);
        document.getElementById('summaryCheckOut').textContent = formatDisplayDate(checkOutDate);
        document.getElementById('summaryNights').textContent = `${nights} đêm`;
        
        // Tính giá phòng
        const roomRate = this.roomData.Gia * nights;
        const roomRateFormatted = new Intl.NumberFormat('vi-VN').format(roomRate);
        document.getElementById('summaryRoomRate').textContent = `${roomRateFormatted}đ`;
        
        // Tính thuế và phí (giả sử 10%)
        const tax = roomRate * 0.1;
        const taxFormatted = new Intl.NumberFormat('vi-VN').format(tax);
        document.getElementById('summaryTax').textContent = `${taxFormatted}đ`;
        
        // Tính tổng cộng
        const total = roomRate + tax;
        const totalFormatted = new Intl.NumberFormat('vi-VN').format(total);
        document.getElementById('summaryTotal').textContent = `${totalFormatted}đ`;
    },
    async fetchUserDetails() {
        try {
            const response = await fetch('/api/user/profile', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }
            
            const result = await response.json();
            console.log('Profile API response:', result); // Debug log
            
            // Thay đổi logic kiểm tra kết quả
            if (result.data) {
                this.userData = result.data;
                console.log('Stored user data:', this.userData); // Debug log
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error fetching user details:', error);
            return false;
        }
    },
    // Xử lý đặt phòng
    async processBooking() {
        try {
            // Fetch lại thông tin người dùng trước khi xử lý
            const userDataFetched = await this.fetchUserDetails();
            console.log('User data fetched:', userDataFetched);
            
            if (!userDataFetched) {
                throw new Error('Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.');
            }
    
            const userId = this.getUserId();
            console.log('Retrieved user ID:', userId);
            
            if (!userId) {
                throw new Error('Không thể xác định ID người dùng - Vui lòng đăng nhập lại');
            }

            // Lấy thông tin đặt phòng
            const phongId = new URLSearchParams(window.location.search).get('phongId');
            const checkInDate = document.getElementById('checkInDate').value;
            const checkOutDate = document.getElementById('checkOutDate').value;
            const numberOfGuests = document.getElementById('numberOfGuests').value;
            const specialRequests = document.getElementById('specialRequests').value;
            const paymentMethod = document.getElementById('paymentMethod').value;

            const bookingData = {
                NguoiDungID: userId,
                PhongID: phongId,
                NgayNhanPhong: checkInDate,
                NgayTraPhong: checkOutDate,
                SoNguoi: numberOfGuests,
                GhiChu: specialRequests,
                PhuongThucThanhToan: paymentMethod
            };

            // Kiểm tra dữ liệu bắt buộc
            if (!bookingData.PhongID) {
                throw new Error('Thiếu thông tin phòng');
            }

            // Gửi request đặt phòng
            const response = await fetch('/api/dat-phong', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(bookingData)
            });

            const result = await response.json();

            if (response.status === 401) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                window.location.href = `/LoginUser/LoginUser.html?redirect=${encodeURIComponent(window.location.href)}`;
                return;
            }

            // Đóng modal xác nhận
            const confirmModal = bootstrap.Modal.getInstance(document.getElementById('bookingConfirmModal'));
            confirmModal.hide();

            if (result.success) {
                // Hiển thị modal thành công
                document.getElementById('bookingCode').textContent = result.data.MaDatPhong;
                const successModal = new bootstrap.Modal(document.getElementById('bookingSuccessModal'));
                successModal.show();

                // Xử lý thanh toán VNPay
                if (paymentMethod === 'vnpay' && result.data.paymentUrl) {
                    document.getElementById('bookingSuccessModal').addEventListener('hidden.bs.modal', () => {
                        window.location.href = result.data.paymentUrl;
                    });
                }
            } else {
                alert(`Đặt phòng thất bại: ${result.message}`);
            }
        } catch (error) {
            console.error('Error processing booking:', error);
            alert('Đã có lỗi xảy ra khi xử lý đặt phòng: ' + error.message);
        }
    },

    // Thêm phương thức mới để lấy ID người dùng
    getUserId() {
        if (!this.userData) return null;
        
        console.log('Getting user ID from:', this.userData); // Debug log
        
        // Kiểm tra tất cả các trường có thể chứa ID
        const possibleIds = [
            this.userData.NguoiDungID,
            this.userData.id,
            this.userData.nguoiDungID,
            this.userData.ID
        ];
        
        // Trả về ID đầu tiên tìm thấy và không phải undefined/null
        const validId = possibleIds.find(id => id !== undefined && id !== null);
        console.log('Found valid ID:', validId); // Debug log
        
        return validId || null;
    }
};