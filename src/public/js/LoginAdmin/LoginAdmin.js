// LoginAdmin.js
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePasswordBtn = document.querySelector('.toggle-password');

    // Xử lý hiện/ẩn mật khẩu
    togglePasswordBtn.addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });

    // Xử lý đăng nhập
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        const errorMessage = document.getElementById('errorMessage');
        const loginData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };
        
        // Log dữ liệu trước khi gửi
        console.log('Sending login data:', loginData);
        
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
                credentials: 'include'
            });
            
            // Log response status và headers
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            const responseText = await response.text();
            console.log('Raw response:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('JSON parse error:', e);
                throw new Error('Invalid JSON response');
            }
            
            console.log('Parsed response:', data);
    
            if (response.ok && data.success) {
                submitButton.innerHTML = '<i class="fas fa-check"></i> Thành công!';
                sessionStorage.setItem('skipAuthCheck', 'true');
                window.location.href = '/Trangchu/TrangChuAdmin.html';
            } else {
                errorMessage.style.display = 'block';
                errorMessage.textContent = data.message || 'Đăng nhập thất bại';
                submitButton.innerHTML = 'Đăng Nhập';
            }
        } catch (error) {
            console.error('Error details:', error);
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Có lỗi xảy ra';
            submitButton.innerHTML = 'Đăng Nhập';
        } finally {
            submitButton.disabled = false;
        }
    });
});