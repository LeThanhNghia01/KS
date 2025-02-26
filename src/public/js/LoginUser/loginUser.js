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

// Move the Google sign-in handler to global scope so it's accessible to the Google Sign-In API
window.handleGoogleSignIn = async function(response) {
    try {
        const apiResponse = await fetch('/api/user/google-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                credential: response.credential
            }),
            credentials: 'include'
        });
        
        const data = await apiResponse.json();

        if (apiResponse.ok) {
            if (data.isFirstTime) {
                // Show welcome modal for new users
                showWelcomeModal(data.user);
            } else {
                // Redirect to home page for existing users
                window.location.href = '/TrangChu/TrangChuUser.html';
            }
        } else {
            const errorMessage = document.getElementById('errorMessage');
            errorMessage.textContent = data.message;
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Google login error:', error);
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = 'Có lỗi xảy ra khi đăng nhập với Google';
        errorMessage.style.display = 'block';
    }
};

function showWelcomeModal(user) {
    // Tạo modal HTML
    const modalHTML = `
        <div id="welcomeModal" class="modal">
            <div class="modal-content">
                <h2>Chào mừng ${user.ten}!</h2>
                <p>Cảm ơn bạn đã tham gia với chúng tôi.</p>
                <form id="additionalInfoForm">
                    <div class="form-group">
                        <label>Số điện thoại:</label>
                        <input type="tel" id="phone" required>
                    </div>
                    <div class="form-group">
                        <label>Địa chỉ:</label>
                        <textarea id="address" required></textarea>
                    </div>
                    <button type="submit">Hoàn tất</button>
                </form>
                <button onclick="skipAdditionalInfo()">Bỏ qua</button>
            </div>
        </div>
    `;

    // Thêm modal vào body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Xử lý form submit
    document.getElementById('additionalInfoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const additionalInfo = {
            soDienThoai: document.getElementById('phone').value,
            diaChi: document.getElementById('address').value
        };

        try {
            const response = await fetch('/api/user/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(additionalInfo),
                credentials: 'include'
            });

            if (response.ok) {
                window.location.href = '/TrangChu/TrangChuUser.html';
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    });
}

window.skipAdditionalInfo = function() {
    window.location.href = '/TrangChu/TrangChuUser.html';
};