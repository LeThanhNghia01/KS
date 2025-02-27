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
        const formData = new FormData();
        
        // Thu thập giá trị từ các trường nhập liệu hiện có
        const tenValue = document.getElementById('ten').value;
        const soDienThoaiValue = document.getElementById('soDienThoai').value;
        const diaChiValue = document.getElementById('diaChi').value;
        const anhDaiDienValue = document.getElementById('anhdaidien').value;
        
        // Thêm dữ liệu vào FormData, bao gồm cả dữ liệu hiện tại nếu không thay đổi
        formData.append('ten', tenValue);
        formData.append('soDienThoai', soDienThoaiValue);
        formData.append('diaChi', diaChiValue);
        formData.append('anhDaiDienCu', anhDaiDienValue); // Gửi URL ảnh hiện tại để dự phòng
        
        // Thêm file nếu đã chọn
        if (fileInput && fileInput.files.length > 0) {
            formData.append('anhDaiDien', fileInput.files[0]);
        }
        
        // Debug: Hiển thị dữ liệu trước khi gửi
        console.log('Tên:', tenValue);
        console.log('SĐT:', soDienThoaiValue);
        console.log('Địa chỉ:', diaChiValue);
        
        const response = await fetch('/api/profileUser/update', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Cập nhật thông tin thành công');
            
            // Trở về chế độ xem
            inputs.forEach(input => input.readOnly = true);
            if (fileInput) fileInput.style.display = 'none';
            
            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            
            // Hiển thị lại trường mật khẩu
            passwordField.style.display = 'block';
            document.querySelector('label[for="matKhau"]').style.display = 'block';
            
            // Tải lại dữ liệu hồ sơ
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