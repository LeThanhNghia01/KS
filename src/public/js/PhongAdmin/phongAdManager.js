// File: src/public/js/PhongAdmin/phongAdManager.js
class PhongManager {
    static async init() {
        this.setupEventHandlers();
        this.setupEditRoomHandler();
        this.setupDeleteRoomHandler();
        this.setupFilterHandlers();
        await this.loadRoomTypes();
        await this.loadRoomStatuses();
        await this.loadRooms(); 
    }
    // Thêm phương thức mới để xử lý bộ lọc
    static setupFilterHandlers() {
        const applyFilterBtn = document.getElementById('applyFilter');
        const resetFilterBtn = document.getElementById('resetFilter');

        applyFilterBtn.addEventListener('click', () => this.applyFilters());
        resetFilterBtn.addEventListener('click', () => this.resetFilters());
    }

    static async applyFilters() {
        const filters = {
            roomType: document.getElementById('filterRoomType').value,
            status: document.getElementById('filterStatus').value,
            minPrice: document.getElementById('minPrice').value,
            maxPrice: document.getElementById('maxPrice').value
        };

        try {
            const response = await fetch('/api/phong-admin/list?' + new URLSearchParams({
                roomType: filters.roomType,
                status: filters.status,
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice
            }));

            const data = await response.json();
            if (data.success) {
                this.renderRooms(data.data);
            } else {
                console.error('Lỗi khi lọc danh sách phòng:', data.message);
            }
        } catch (error) {
            console.error('Lỗi khi áp dụng bộ lọc:', error);
        }
    }

    static resetFilters() {
        // Reset các giá trị filter về mặc định
        document.getElementById('filterRoomType').value = '';
        document.getElementById('filterStatus').value = '';
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
        
        // Load lại danh sách phòng
        this.loadRooms();
    }
    // Thêm phương thức loadRooms
    static async loadRooms() {
        try {
            const response = await fetch('/api/phong-admin/list');
            const data = await response.json();
            if (data.success) {
                this.renderRooms(data.data);
            } else {
                console.error('Lỗi khi tải danh sách phòng:', data.message);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách phòng:', error);
        }
    }

    // Thêm phương thức renderRooms
    static renderRooms(rooms) {
        const tbody = document.getElementById('roomsTableBody');
        tbody.innerHTML = rooms.map(room => `
            <tr>
                <td>${room.PhongID}</td>
                <td>
                    ${room.ImagePhong ? 
                        `<img src="${room.ImagePhong}" class="room-image" alt="Ảnh phòng">` : 
                        '<span class="text-muted">Không có ảnh</span>'}
                </td>
                <td>${room.TenLoai}</td>
                <td>${room.Gia.toLocaleString()} VNĐ</td>
                <td>
                    <span class="badge ${this.getStatusClass(room.TenTinhTrang)}">
                        ${room.TenTinhTrang}
                    </span>
                </td>
                <td>${new Date(room.created_at).toLocaleDateString()}</td>
                <td>${room.TenNhanVien || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="PhongManager.editRoom(${room.PhongID})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="PhongManager.deleteRoom(${room.PhongID})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Thêm helper function để xác định class cho status
    static getStatusClass(status) {
        const statusMap = {
            'Trống': 'bg-success',
            'Đã đặt': 'bg-warning',
            'Đang sử dụng': 'bg-primary',
            'Bảo trì': 'bg-danger'
        };
        return statusMap[status] || 'bg-secondary';
    }

    static async loadRoomTypes() {
        try {
            const response = await fetch('/api/loai-phong/list');
            const data = await response.json();
            if (data.success) {
                const roomTypeSelects = document.querySelectorAll('#roomType, #editRoomType, #filterRoomType');
                roomTypeSelects.forEach(select => {
                    select.innerHTML = '<option value="">Chọn loại phòng</option>' +
                        data.data.map(type => `
                            <option value="${type.IDLoai}">${type.TenLoai}</option>
                        `).join('');
                });
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách loại phòng:', error);
        }
    }

    static async loadRoomStatuses() {
        try {
            const response = await fetch('/api/tinh-trang-phong/list');
            const data = await response.json();
            if (data.success) {
                const statusSelects = document.querySelectorAll('#roomStatus, #editRoomStatus, #filterStatus');
                statusSelects.forEach(select => {
                    select.innerHTML = '<option value="">Chọn tình trạng</option>' +
                        data.data.map(status => `
                            <option value="${status.IDTinhTrang}">${status.TenTinhTrang}</option>
                        `).join('');
                });
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách tình trạng:', error);
        }
    }

    static setupEventHandlers() {
        // Xử lý thêm phòng mới
        const saveRoomBtn = document.getElementById('saveRoom');
        const roomForm = document.getElementById('roomForm');
        
        saveRoomBtn.addEventListener('click', async () => {
            if (!roomForm.checkValidity()) {
                roomForm.reportValidity();
                return;
            }

            const formData = new FormData();
            formData.append('IDTinhTrang', document.getElementById('roomStatus').value);
            formData.append('IDLoai', document.getElementById('roomType').value);
            formData.append('Gia', document.getElementById('roomPrice').value);

            const imageInput = document.getElementById('roomImage');
            if (imageInput.files.length > 0) {
                formData.append('imagePhong', imageInput.files[0]);
            }

            try {
                const response = await fetch('/api/phong-admin/create', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                if (data.success) {
                    alert('Thêm phòng thành công');
                    // Đóng modal và reset form
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addRoomModal'));
                    modal.hide();
                    roomForm.reset();
                    document.getElementById('imagePreview').innerHTML = '';
                    // Reload danh sách phòng
                    await this.loadRooms();
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Lỗi khi thêm phòng:', error);
                alert('Đã có lỗi xảy ra khi thêm phòng');
            }
        });

        // Preview ảnh khi chọn file
        document.getElementById('roomImage').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('imagePreview').innerHTML = `
                        <img src="${e.target.result}" class="img-thumbnail" style="max-height: 200px;">
                    `;
                }
                reader.readAsDataURL(file);
            }
        });
    }
  
    static async editRoom(roomId) {
        try {
            // Fetch room details
            const response = await fetch(`/api/phong-admin/detail/${roomId}`);
            const data = await response.json();
            
            if (!data.success) {
                alert('Không thể tải thông tin phòng');
                return;
            }
            
            const room = data.data;
            
            // Fill form with room data
            document.getElementById('editRoomId').value = room.PhongID;
            document.getElementById('editRoomType').value = room.IDLoai;
            document.getElementById('editRoomStatus').value = room.IDTinhTrang;
            document.getElementById('editRoomPrice').value = room.Gia;
            
            // Show current image if exists
            const imagePreview = document.getElementById('editImagePreview');
            if (room.ImagePhong) {
                imagePreview.innerHTML = `
                    <div class="mb-2">Ảnh hiện tại:</div>
                    <img src="${room.ImagePhong}" class="img-thumbnail" style="max-height: 200px;">
                    <input type="hidden" id="currentImagePath" value="${room.ImagePhong}">
                `;
            } else {
                imagePreview.innerHTML = '<div class="text-muted">Không có ảnh</div>';
            }
            
            // Show modal
            const editModal = new bootstrap.Modal(document.getElementById('editRoomModal'));
            editModal.show();
        } catch (error) {
            console.error('Lỗi khi lấy thông tin phòng:', error);
            alert('Đã xảy ra lỗi khi tải thông tin phòng');
        }
    }

    // Xử lý sự kiện khi click nút Lưu trong modal sửa phòng
    static setupEditRoomHandler() {
        const updateRoomBtn = document.getElementById('updateRoom');
        const editRoomForm = document.getElementById('editRoomForm');
        
        // Preview ảnh khi chọn file trong form edit
        document.getElementById('editRoomImage').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('editImagePreview').innerHTML = `
                        <div class="mb-2">Ảnh mới:</div>
                        <img src="${e.target.result}" class="img-thumbnail" style="max-height: 200px;">
                    `;
                }
                reader.readAsDataURL(file);
            }
        });
        
        updateRoomBtn.addEventListener('click', async () => {
            if (!editRoomForm.checkValidity()) {
                editRoomForm.reportValidity();
                return;
            }
            
            const roomId = document.getElementById('editRoomId').value;
            const formData = new FormData();
            
            formData.append('IDTinhTrang', document.getElementById('editRoomStatus').value);
            formData.append('IDLoai', document.getElementById('editRoomType').value);
            formData.append('Gia', document.getElementById('editRoomPrice').value);
            formData.append('currentImagePath', document.getElementById('currentImagePath')?.value || '');
            
            const imageInput = document.getElementById('editRoomImage');
            if (imageInput.files.length > 0) {
                formData.append('imagePhong', imageInput.files[0]);
            }
            
            try {
                const response = await fetch(`/api/phong-admin/update/${roomId}`, {
                    method: 'PUT',
                    body: formData
                });
                
                const data = await response.json();
                if (data.success) {
                    alert('Cập nhật phòng thành công');
                    // Đóng modal và reload danh sách
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editRoomModal'));
                    modal.hide();
                    await this.loadRooms();
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Lỗi khi cập nhật phòng:', error);
                alert('Đã có lỗi xảy ra khi cập nhật phòng');
            }
        });
    }

    // Bổ sung chức năng xóa phòng
    static async deleteRoom(roomId) {
        try {
            // Hiển thị modal xác nhận
            document.getElementById('roomIdToDelete').value = roomId;
            const deleteModal = new bootstrap.Modal(document.getElementById('deleteRoomModal'));
            deleteModal.show();
        } catch (error) {
            console.error('Lỗi khi chuẩn bị xóa phòng:', error);
            alert('Đã xảy ra lỗi');
        }
    }

    // Xử lý sự kiện khi click nút Xóa trong modal xác nhận
    static setupDeleteRoomHandler() {
        const confirmDeleteBtn = document.getElementById('confirmDeleteRoom');
        
        confirmDeleteBtn.addEventListener('click', async () => {
            const roomId = document.getElementById('roomIdToDelete').value;
            
            try {
                const response = await fetch(`/api/phong-admin/delete/${roomId}`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                if (data.success) {
                    alert('Xóa phòng thành công');
                    // Đóng modal và reload danh sách
                    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteRoomModal'));
                    modal.hide();
                    await this.loadRooms();
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Lỗi khi xóa phòng:', error);
                alert('Đã có lỗi xảy ra khi xóa phòng');
            }
        });
    }
}

// Khởi tạo khi trang load xong
document.addEventListener('DOMContentLoaded', () => {
    PhongManager.init();
});