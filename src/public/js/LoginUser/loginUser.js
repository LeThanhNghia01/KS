document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const matKhau = document.getElementById('password').value;

        try {
            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, matKhau }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                await HeaderUser.updateHeaderUI();
                window.location.href = '/TrangChu/TrangChuUser.html';
            } else {
                errorMessage.textContent = data.message;
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = 'Có lỗi xảy ra, vui lòng thử lại';
            errorMessage.style.display = 'block';
        }
    });
});