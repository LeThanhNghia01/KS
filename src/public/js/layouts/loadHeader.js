//src/public/js/layouts/loadHeader.js
export async function loadHeader() {
    try {
        const headerResponse = await fetch('/layouts/header.html');
        const headerHtml = await headerResponse.text();
        document.getElementById('header-placeholder').innerHTML = headerHtml;

        const authResponse = await fetch('/api/admin/check-auth', {
            credentials: 'include'
        });
        const authData = await authResponse.json();

        if (authData.isAuthenticated && authData.user) {  // Kiểm tra cả user object
            const userName = document.getElementById('userName');
            if (userName) {
                userName.textContent = authData.user.ten || 'Admin'; // Thêm giá trị mặc định
            }
        }
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

// Load header khi trang load xong
document.addEventListener('DOMContentLoaded', loadHeader); 