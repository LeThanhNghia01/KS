// src/public/js/layouts/headerManager.js
class HeaderManager {
    static async init() {
        await this.loadHeader();
        await this.setupLogoutHandler();
        await this.updateHeaderUI();
    }

    static async loadHeader() {
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (!headerPlaceholder) return;

        try {
            const response = await fetch('/layouts/header.html');
            const html = await response.text();
            headerPlaceholder.innerHTML = html;

           //Quan trọng: Thiết lập trình xử lý sự kiện sau khi DOM được cập nhật
            await this.setupLogoutHandler();
            await this.updateHeaderUI();
        } catch (error) {
            console.error('Error loading header:', error);
        }
    }

    static async setupLogoutHandler() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (!logoutBtn) {
            console.error('Logout button not found in DOM');
            return;
        }

        // Xóa bất kỳ trình lắng nghe sự kiện hiện có nào
        logoutBtn.replaceWith(logoutBtn.cloneNode(true));
        const newLogoutBtn = document.getElementById('logoutBtn');

        newLogoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                const response = await fetch('/api/admin/logout', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    // Clear storage
                    sessionStorage.clear();
                    localStorage.clear();
                    
                  // Chuyển hướng đến trang đăng nhập
                    window.location.href = '/LoginAdmin/LoginAdmin.html';
                } else {
                    const data = await response.json();
                    console.error('Logout failed:', data.message);
                    alert('Đăng xuất không thành công: ' + data.message);
                }
            } catch (error) {
                console.error('Logout error:', error);
                alert('Đăng xuất không thành công. Vui lòng thử lại.');
            }
        });
    }

    static async updateHeaderUI() {
        try {
            const response = await fetch('/api/admin/check-auth', {
                credentials: 'include'
            });
            const data = await response.json();

            const guestMenu = document.querySelector('.guest-menu');
            const userMenu = document.querySelector('.user-menu');
            const userName = document.getElementById('userName');

            if (data.isAuthenticated) {
                if (guestMenu) guestMenu.style.display = 'none';
                if (userMenu) userMenu.style.display = 'flex';
                if (userName && data.user) {
                    userName.textContent = data.user.ten || 'User';
                }
            } else {
                if (guestMenu) guestMenu.style.display = 'flex';
                if (userMenu) userMenu.style.display = 'none';
            }
        } catch (error) {
            console.error('Error updating header:', error);
        }
    }
}

// Khởi tạo khi DOM được tải
document.addEventListener('DOMContentLoaded', () => {
    HeaderManager.init().catch(error => {
        console.error('Error initializing HeaderManager:', error);
    });
});

// Xuất để sử dụng ở nơi khác
window.HeaderManager = HeaderManager;