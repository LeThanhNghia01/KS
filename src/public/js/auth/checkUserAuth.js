// src/public/js/auth/checkUserAuth.js
async function checkUserAuth() {
    try {
        const response = await fetch('/api/user/check-auth', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!data.isAuthenticated) {
            window.location.href = '/LoginUser/LoginUser.html';
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error checking user auth:', error);
        window.location.href = '/LoginUser/LoginUser.html';
        return false;
    }
}

document.addEventListener('DOMContentLoaded', checkUserAuth);

export { checkUserAuth };