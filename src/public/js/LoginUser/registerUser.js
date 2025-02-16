document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        try {
            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

            const formData = {
                tenNguoiDung: document.getElementById('tenNguoiDung').value,
                email: document.getElementById('email').value,
                soDienThoai: document.getElementById('soDienThoai').value,
                diaChi: document.getElementById('diaChi').value,
                matKhau: document.getElementById('matKhau').value,
                xacNhanMatKhau: document.getElementById('xacNhanMatKhau').value
            };

            if (!validateForm(formData, errorMessage)) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Đăng ký';
                return;
            }

            const response = await fetch('/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tenNguoiDung: formData.tenNguoiDung,
                    email: formData.email,
                    soDienThoai: formData.soDienThoai,
                    diaChi: formData.diaChi,
                    matKhau: formData.matKhau
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('Đăng ký thành công!');
                window.location.href = '/LoginUser/LoginUser.html';
            } else {
                throw new Error(data.message || 'Đăng ký thất bại');
            }

        } catch (error) {
            console.error('Register error:', error);
            errorMessage.textContent = error.message || 'Có lỗi xảy ra, vui lòng thử lại';
            errorMessage.style.display = 'block';
        } finally {
            const submitButton = registerForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.innerHTML = 'Đăng ký';
        }
    });
});
function validateForm(formData, errorMessage) {
    // Kiểm tra mật khẩu khớp nhau
    if (formData.matKhau !== formData.xacNhanMatKhau) {
        errorMessage.textContent = 'Mật khẩu xác nhận không khớp';
        errorMessage.style.display = 'block';
        return false;
    }

    // Kiểm tra số điện thoại
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.soDienThoai)) {
        errorMessage.textContent = 'Số điện thoại không hợp lệ';
        errorMessage.style.display = 'block';
        return false;
    }

    // Kiểm tra email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        errorMessage.textContent = 'Email không hợp lệ';
        errorMessage.style.display = 'block';
        return false;
    }

    return true;
}

function validateEmail() {
    const email = document.getElementById('email').value;
    const errorMessage = document.getElementById('errorMessage');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        errorMessage.textContent = 'Email không hợp lệ';
        errorMessage.style.display = 'block';
        return false;
    }
    errorMessage.style.display = 'none';
    return true;
}

function validatePhone() {
    const phone = document.getElementById('soDienThoai').value;
    const errorMessage = document.getElementById('errorMessage');
    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(phone)) {
        errorMessage.textContent = 'Số điện thoại không hợp lệ (phải có 10 số)';
        errorMessage.style.display = 'block';
        return false;
    }
    errorMessage.style.display = 'none';
    return true;
}