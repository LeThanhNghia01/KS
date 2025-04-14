//src/public/js/Profile/profileUser.js
document.addEventListener('DOMContentLoaded', async function() {
    await loadProfileData();
    setupEditButtons();
});

async function loadProfileData() {
    try {
        const response = await fetch('/api/profileUser/info', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Profile data received:', data);
        
        // Direct access to data properties - no nested structure
        document.getElementById('ten').value = data.Ten || '';
        document.getElementById('email').value = data.Email || '';
        document.getElementById('soDienThoai').value = data.SoDienThoai || '';
        document.getElementById('diaChi').value = data.DiaChi || '';
    } catch (error) {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi tải thông tin profile');
    }
}

function setupEditButtons() {
    const form = document.getElementById('profileForm');
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    if (!form || !editBtn || !saveBtn || !cancelBtn) {
        console.error('Missing required elements');
        return;
    }

    const inputs = form.querySelectorAll('input:not([name="email"])');
    
    editBtn.addEventListener('click', () => {
        inputs.forEach(input => input.readOnly = false);
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
    });
    
    cancelBtn.addEventListener('click', () => {
        loadProfileData();
        inputs.forEach(input => input.readOnly = true);
        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const profileData = {
                ten: document.getElementById('ten').value,
                soDienThoai: document.getElementById('soDienThoai').value,
                diaChi: document.getElementById('diaChi').value
            };
            
            const response = await fetch('/api/profileUser/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Cập nhật thông tin thành công');
                inputs.forEach(input => input.readOnly = true);
                editBtn.style.display = 'inline-block';
                saveBtn.style.display = 'none';
                cancelBtn.style.display = 'none';
            } else {
                alert(data.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Có lỗi xảy ra khi cập nhật thông tin');
        }
    });
}