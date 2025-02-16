document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('/api/admin/check-auth', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Auth check response:', data);
        
        const guestMenu = document.querySelector('.guest-menu');
        const userMenu = document.querySelector('.user-menu');
        const mainMenu = document.querySelector('.main-menu');
        const userName = document.getElementById('userName');

        if (data.isLoggedIn && data.user) {
            guestMenu.style.display = 'none';
            userMenu.style.display = 'flex';
            mainMenu.style.display = 'flex';
            userName.textContent = data.user.Ten || 'User';
        } else {
            guestMenu.style.display = 'flex';
            userMenu.style.display = 'none';
            mainMenu.style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        document.querySelector('.guest-menu').style.display = 'flex';
        document.querySelector('.user-menu').style.display = 'none';
        document.querySelector('.main-menu').style.display = 'none';
    }
}); 