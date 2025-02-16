document.addEventListener('DOMContentLoaded', function() {
    // Load danh sách roles thay vì chức vụ
    fetch('/api/register/roles')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('roleID');
            data.forEach(role => {
                const option = document.createElement('option');
                option.value = role.RoleID;
                option.textContent = role.RoleName;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error:', error));

    // Xử lý form đăng ký
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const matKhau = document.getElementById('matKhau').value;
        const xacNhanMatKhau = document.getElementById('xacNhanMatKhau').value;
        const errorMessage = document.getElementById('errorMessage');

        if (matKhau !== xacNhanMatKhau) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Mật khẩu xác nhận không khớp';
            return;
        }

        const formData = {
            Ten: document.getElementById('ten').value,
            Email: document.getElementById('email').value,
            SoDienThoai: document.getElementById('soDienThoai').value,
            DiaChi: document.getElementById('diaChi').value,
            RoleID: document.getElementById('roleID').value,
            MatKhau: matKhau
        };

        try {
            const response = await fetch('/api/register/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Đăng ký thành công!');
                window.location.href = '/LoginAdmin/LoginAdmin.html';
            } else {
                errorMessage.style.display = 'block';
                errorMessage.textContent = data.message;
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Có lỗi xảy ra, vui lòng thử lại';
        }
    });
}); 