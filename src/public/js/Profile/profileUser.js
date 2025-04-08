//src/public/js/Profile/profileUser.js
document.addEventListener('DOMContentLoaded', function() {
    loadProfileData();
    setupEditButtons();
});

async function loadProfileData() {
    try {
        console.log('Đang gọi API profileUser...');
        const response = await fetch('/api/profileUser/info', {
            credentials: 'include'
        });
        console.log('Response:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data:', data);
        
        // Update profile image if available
        if (data.AnhDaiDien) {
            document.getElementById('anhdaidien').value = data.AnhDaiDien;
            document.getElementById('anhdaidien').type = "hidden";
            // Create or update profile image preview
            const imgPreviewContainer = document.getElementById('profileImagePreview');
            if (imgPreviewContainer) {
                imgPreviewContainer.innerHTML = `<img src="${data.AnhDaiDien}" class="img-thumbnail" style="max-width: 150px">`;
            }
        }
        
        document.getElementById('ten').value = data.Ten || '';
        document.getElementById('email').value = data.Email || '';
        document.getElementById('soDienThoai').value = data.SoDienThoai || '';
        document.getElementById('diaChi').value = data.DiaChi || '';
        
        // For security reasons, don't display the actual password, just placeholders
        document.getElementById('matKhau').value = '••••••••';
    } catch (error) {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi tải thông tin');
    }
}

function setupEditButtons() {
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const inputs = document.querySelectorAll('input:not([name="email"]):not([name="matKhau"])');
    const fileInput = document.getElementById('fileUpload');
    const passwordField = document.getElementById('matKhau');
    
    // Handle profile image preview on file selection
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const imgPreviewContainer = document.getElementById('profileImagePreview');
                    if (imgPreviewContainer) {
                        imgPreviewContainer.innerHTML = `<img src="${event.target.result}" class="img-thumbnail" style="max-width: 150px">`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Edit button event
    editBtn.addEventListener('click', () => {
        inputs.forEach(input => input.readOnly = false);
        if (fileInput) fileInput.style.display = 'block';
        
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
        
        // Hide the password field in edit mode (we'll handle password changes separately)
        passwordField.style.display = 'none';
        document.querySelector('label[for="matKhau"]').style.display = 'none';
    });
    
    // Cancel button event
    cancelBtn.addEventListener('click', () => {
        inputs.forEach(input => input.readOnly = true);
        if (fileInput) fileInput.style.display = 'none';
        
        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
        
        // Show the password field again
        passwordField.style.display = 'block';
        document.querySelector('label[for="matKhau"]').style.display = 'block';
        
        // Reset form to original values
        loadProfileData();
    });
    
    // Save button event
    saveBtn.addEventListener('click', async () => {
        try {
            // Create an object with the form data instead of FormData
            const profileData = {
                ten: document.getElementById('ten').value,
                soDienThoai: document.getElementById('soDienThoai').value,
                diaChi: document.getElementById('diaChi').value,
                anhDaiDienCu: document.getElementById('anhdaidien').value
            };
            
            console.log('Sending data to server:', profileData);
            
            // Use JSON instead of FormData for text fields
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
                
                // Switch back to view mode
                inputs.forEach(input => input.readOnly = true);
                if (fileInput) fileInput.style.display = 'none';
                
                editBtn.style.display = 'inline-block';
                saveBtn.style.display = 'none';
                cancelBtn.style.display = 'none';
                
                // Show password field again
                passwordField.style.display = 'block';
                document.querySelector('label[for="matKhau"]').style.display = 'block';
                
                // Reload profile data
                loadProfileData();
            } else {
                alert(data.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Có lỗi xảy ra khi cập nhật thông tin');
        }
    });
}