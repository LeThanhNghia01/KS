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

        const response = await fetch('/layouts/header.html');
        const html = await response.text();
        headerPlaceholder.innerHTML = html;
    }

    static async setupLogoutHandler() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.onclick = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    const response = await fetch('/api/admin/logout', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        sessionStorage.clear();
                        localStorage.clear();
                        window.location.replace('/LoginAdmin/LoginAdmin.html');
                    }
                } catch (error) {
                    console.error('Logout error:', error);
                    alert('Đăng xuất không thành công');
                }
                return false;
            };
        }
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

// Khởi tạo khi DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    HeaderManager.init();
});

// Export để có thể sử dụng ở nơi khác
window.HeaderManager = HeaderManager;