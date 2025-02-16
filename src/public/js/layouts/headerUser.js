/*src/public/js/layouts/headerUser.js*/
class HeaderUser {
    static async init() {
        await this.loadHeader();
        await this.setupLogoutHandler();
        await this.updateHeaderUI();
    }

    static async loadHeader() {
        const headerPlaceholder = document.getElementById('headerUser-placeholder');
        if (!headerPlaceholder) return;

        const response = await fetch('/layouts/headerUser.html');
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
                    const response = await fetch('/api/user/logout', {
                        method: 'POST', // Phương thức POST
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
    
                    if (response.ok) {
                        sessionStorage.clear();
                        localStorage.clear();
                        window.location.replace('/LoginUser/LoginUser.html');
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
            const userMenu = document.querySelector('.user-menu');
            const guestMenu = document.querySelector('.guest-menu');
            const userNameElement = document.getElementById('userName');
            
            // Kiểm tra session user
            const response = await fetch('/api/user/check-auth', {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.isAuthenticated && data.user) {
                // Đã đăng nhập
                if (userMenu) userMenu.style.display = 'flex';
                if (guestMenu) guestMenu.style.display = 'none';
                if (userNameElement) userNameElement.textContent = data.user.ten;
            } else {
                // Chưa đăng nhập
                if (userMenu) userMenu.style.display = 'none';
                if (guestMenu) guestMenu.style.display = 'flex';
                if (userNameElement) userNameElement.textContent = 'Khách';
            }
        } catch (error) {
            console.error('Error updating header UI:', error);
        }
    }
    static async checkAuthStatus() {
        try {
            const response = await fetch('/api/user/check-auth', {
                credentials: 'include'
            });
            const data = await response.json();
            return data.isAuthenticated;
        } catch (error) {
            console.error('Error checking auth status:', error);
            return false;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    HeaderUser.init();
});

window.HeaderUser = HeaderUser;