document.addEventListener('DOMContentLoaded', function() {
    loadProfileData();
    setupEditButtons();
});

async function loadProfileData() {
    try {
        console.log('Đang gọi API profile...');
        const response = await fetch('/api/profile/info', {
            credentials: 'include'
        });
        console.log('Response:', response);
        const data = await response.json();
        console.log('Data:', data);

        if (response.ok) {
            document.getElementById('ten').value = data.Ten || '';
            document.getElementById('email').value = data.Email || '';
            document.getElementById('soDienThoai').value = data.SoDienThoai || '';
            document.getElementById('diaChi').value = data.DiaChi || '';
            document.getElementById('chucVu').value = data.RoleName || '';
        } else {
            console.error('Lỗi response:', data);
            alert('Không thể tải thông tin profile');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi tải thông tin');
    }
}

function setupEditButtons() {
    const form = document.getElementById('profileForm');
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const inputs = form.querySelectorAll('input:not([name="email"]):not([name="chucVu"])');

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
        
        const formData = {
            ten: document.getElementById('ten').value,
            soDienThoai: document.getElementById('soDienThoai').value,
            diaChi: document.getElementById('diaChi').value
        };

        try {
            const response = await fetch('/api/profile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
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