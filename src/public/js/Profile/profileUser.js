//src/public/js/Profile/profileUser.js
document.addEventListener('DOMContentLoaded', function() {
    loadProfileData();
    setupEditButtons();
});

async function loadProfileData() {
    try{
        console.log('Đang gọi API profileUser...');
        const response =await fetch('/api/profileUser/info', {
            credentials: 'include'
        });
        console.log('Response:', response);
        const data=await response.json();
        console.log('Data:', data);
        if(response.ok){
            document.getElementById('ten').value = data.Ten || '';
            document.getElementById('email').value = data.Email || '';
            document.getElementById('soDienThoai').value = data.SoDienThoai || '';
            document.getElementById('diaChi').value = data.DiaChi || '';
            document.getElementById('matKhau').value = data.MatKhau || '';
        }else{
            console.error('Lỗi response:', data);
            alert('Không thể tải thông tin profile');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi tải thông tin');
    }
}
function setupEditButtons(){
    const editBtn =document.getElementById('editBtn');
    const saveBtn =document.getElementById('saveBtn');
    const cancelBtn=document.querySelectorAll('input:not[name="email"]');

    editBtn.addEventListener('click',()=>{
        inputs.forEach(input=>input.readOnly=true);
        editBtn.style.display='inline-block';
        saveBtn.style.display='none';
        cancelBtn.style.display='none';
    });
    saveBtn.addEventListener('click', async () => {
        try {
            const formData = {
                ten: document.getElementById('ten').value,
                soDienThoai: document.getElementById('soDienThoai').value,
                diaChi: document.getElementById('diaChi').value
            };

            const response = await fetch('/api/profileUser/update', {
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



