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
    // Thiết lập cho bộ lọc
    static setupFilterHandlers() {
        const applyFilterBtn = document.getElementById('applyFilter');
        const resetFilterBtn = document.getElementById('resetFilter');

        applyFilterBtn.addEventListener('click', () => this.applyFilters());
        resetFilterBtn.addEventListener('click', () => this.resetFilters());
    }
    // Áp dụng bộ lọc
    static async applyFilters() {
        const filters = {
            roomType: document.getElementById('filterRoomType').value,
            status: document.getElementById('filterStatus').value,
            minPrice: document.getElementById('minPrice').value,
            maxPrice: document.getElementById('maxPrice').value
        };
        // Gọi API lọc danh sách phòng
        try {
            const response = await fetch('/api/phong-admin/list?' + new URLSearchParams({
                roomType: filters.roomType,
                status: filters.status,
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice
            }));
            // Xử lý kết quả trả về
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
    // Reset bộ lọc
    static resetFilters() {
        // Reset các giá trị filter về mặc định
        document.getElementById('filterRoomType').value = '';
        document.getElementById('filterStatus').value = '';
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
        
        // Load lại danh sách phòng
        this.loadRooms();
    }
    // Hiển thị tất cả ảnh của phòng
    static async showAllRoomImages(roomId) {
        try {
            // Gọi API lấy chi tiết phòng để có danh sách ảnh đầy đủ
            const response = await fetch(`/api/phong-admin/detail/${roomId}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message);
            }
    
            const modal = new bootstrap.Modal(document.getElementById('roomImagesModal'));
            const container = document.getElementById('roomImagesContainer');
            const noImagesMsg = document.getElementById('noImagesMessage');
            
            container.innerHTML = '';
            
            if (data.data.images && data.data.images.length > 0) {
                noImagesMsg.style.display = 'none';
                data.data.images.forEach(image => {
                    const col = document.createElement('div');
                    col.className = 'col-md-4 col-sm-6 mb-3';
                    
                    const img = document.createElement('img');
                    img.src = image.DuongDan;
                    img.alt = `Ảnh phòng ${roomId}`;
                    img.className = 'img-fluid rounded';
                    
                    col.appendChild(img);
                    container.appendChild(col);
                });
            } else {
                noImagesMsg.style.display = 'block';
            }
            
            modal.show();
        } catch (error) {
            console.error('Lỗi khi tải ảnh phòng:', error);
            alert('Không thể tải ảnh phòng');
        }
    }
    
    // Load danh sách phòng
    static async loadRooms(page = 1) {
        try {
            const response = await fetch(`/api/phong-admin/list?page=${page}`);
            
            // Kiểm tra status trước khi parse JSON
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.success) {
                this.renderRooms(data.data);
            } else {
                console.error('Lỗi:', data.message);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách phòng:', error);
        }
    }

    static async init() {
        // Đảm bảo DOM đã load xong
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initAfterDOMLoad());
        } else {
            this.initAfterDOMLoad();
        }
    }

    static async initAfterDOMLoad() {
        try {
            await this.loadRoomTypes();
            await this.loadRoomStatuses();
            await this.loadRooms();
            this.setupEventHandlers();
        } catch (error) {
            console.error('Lỗi khởi tạo:', error);
        }
    }

    // Hiển thị danh sách phòng lên bảng 
    static renderRooms(rooms) {
        const tbody = document.getElementById('roomsTableBody');
        tbody.innerHTML = rooms.map(room => `
            <tr>
                <td>${room.PhongID}</td>
                <td>
                    <div class="room-images-preview" onclick="PhongManager.showAllRoomImages(${room.PhongID})">
                        ${room.ImagePhong ? 
                            `<img src="${room.ImagePhong}" class="room-thumbnail" alt="Ảnh phòng">` : 
                            '<span class="text-muted">Không có ảnh</span>'
                        }
                        ${room.totalImages > 1 ? 
                            `<span class="badge bg-info ms-2">+${room.totalImages - 1}</span>` : 
                            ''
                        }
                    </div>
                </td>
                <td>${room.TenLoai}</td>
                <td>${room.Gia.toLocaleString()} VNĐ</td>
                <td>
                    <span class="badge ${PhongManager.getStatusClass(room.TenTinhTrang)}">
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
    
    // Helper function để xác định class cho status
    static getStatusClass(status) {
        const statusMap = {
            'Trống': 'bg-success',
            'Đã đặt': 'bg-warning',
            'Đang sử dụng': 'bg-primary',
            'Bảo trì': 'bg-danger'
        };
        return statusMap[status] || 'bg-secondary';
    }
    // Load danh sách loại phòng
    static async loadRoomTypes() {
        try {// Gọi API lấy danh sách loại phòng    
            const response = await fetch('/api/loai-phong/list');
            const data = await response.json();
            if (data.success) {
                const roomTypeSelects = document.querySelectorAll('#roomType, #editRoomType, #filterRoomType');// Lấy các select có id là roomType, editRoomType, filterRoomType
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
    // Load danh sách tình trạng phòng
    static async loadRoomStatuses() {
        try {//
            const response = await fetch('/api/tinh-trang-phong/list');
            const data = await response.json();
            if (data.success) {
                const statusSelects = document.querySelectorAll('#roomStatus, #editRoomStatus, #filterStatus');// Lấy các select có id là roomStatus, editRoomStatus, filterStatus
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

   // Xử lý thêm phòng mới
    static setupEventHandlers() {
        const saveRoomBtn = document.getElementById('saveRoom');
        const roomForm = document.getElementById('roomForm');
        // Xử lý sự kiện khi click nút Lưu trong modal thêm phòng
        saveRoomBtn.addEventListener('click', async () => {
            if (!roomForm.checkValidity()) {
                roomForm.reportValidity();
                return;
            }
            // Tạo form data để submit dữ liệu
            const formData = new FormData();
            formData.append('IDTinhTrang', document.getElementById('roomStatus').value);
            formData.append('IDLoai', document.getElementById('roomType').value);
            formData.append('Gia', document.getElementById('roomPrice').value);
            
            const imageInput = document.getElementById('roomImage');
            if (imageInput.files.length > 0) {// Nếu có chọn ảnh 
                for (let i = 0; i < imageInput.files.length; i++) {// Duyệt qua từng file ảnh
                    formData.append('imagePhong', imageInput.files[i]);// Thêm file vào form data
                }
            }
            // Gọi API thêm phòng mới
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
            const files = e.target.files;// Lấy danh sách file ảnh
            const imagePreview = document.getElementById('imagePreview');// Lấy thẻ div để hiển thị ảnh
            imagePreview.innerHTML = '';
            if (files.length > 0) {// Nếu có chọn ảnh
                for (let i = 0; i < files.length; i++) {// Duyệt qua từng file ảnh
                    const reader = new FileReader();// Tạo đối tượng FileReader để đọc file ảnh
                    // Xử lý khi load xong file ảnh
                    reader.onload = function(e) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.classList.add('img-thumbnail');// Thêm class img-thumbnail để hiển thị ảnh đẹp hơn
                        img.style.maxHeight = '200px';
                        imagePreview.appendChild(img);
                    }
                    reader.readAsDataURL(files[i]);
                }
            }
        });
    }
    // Xử lý sự kiện khi click nút Sửa
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
            
            // Show current images if exist
            const imagePreview = document.getElementById('editImagePreview');
            imagePreview.innerHTML = '';
            if (room.images && room.images.length > 0) {
                imagePreview.innerHTML = '<div class="mb-2">Ảnh hiện tại:</div>';
                room.images.forEach(image => {
                    imagePreview.innerHTML += `
                        <img src="${image.DuongDan}" class="img-thumbnail" style="max-height: 200px;">
                    `;
                });
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
    // Xử lý sự kiện khi click nút Sửa trong modal sửa phòng
    static setupEditRoomHandler() {
        const updateRoomBtn = document.getElementById('updateRoom');
        const editRoomForm = document.getElementById('editRoomForm');
        
        // Preview ảnh khi chọn file trong form edit
        document.getElementById('editRoomImage').addEventListener('change', (e) => {
            const files = e.target.files;
            const imagePreview = document.getElementById('editImagePreview');
            imagePreview.innerHTML = '';
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.classList.add('img-thumbnail');
                        img.style.maxHeight = '200px';
                        imagePreview.appendChild(img);
                    }
                    reader.readAsDataURL(files[i]);
                }
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
                for (let i = 0; i < imageInput.files.length; i++) {
                    formData.append('imagePhong', imageInput.files[i]);
                }
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
    static async deleteRoomImage(imageId) {
        try {
            const response = await fetch(`/api/phong-admin/delete-image/${imageId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            if (data.success) {
                alert('Xóa ảnh thành công');
                // Reload danh sách phòng
                await this.loadRooms();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Lỗi khi xóa ảnh:', error);
            alert('Đã có lỗi xảy ra khi xóa ảnh');
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