import { loadHeader } from '../layouts/loadHeader.js';

document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadHeader();
        await checkAuthStatus();
    } catch (error) {
        console.error('Error:', error);
    }
});

async function checkAuthStatus() {
    if (sessionStorage.getItem('skipAuthCheck')) {
        sessionStorage.removeItem('skipAuthCheck');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/check-auth', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!data.isAuthenticated) {
            window.location.replace('/LoginAdmin/LoginAdmin.html');
        }
    } catch (error) {
        console.error('Error checking auth:', error);
        window.location.replace('/LoginAdmin/LoginAdmin.html');
    }
}