//src/public/js/TienNghiPhong/tienNghiPhongManager.js
class tienNghiPhongManager {
    static async init() {
        await this.loadTienNghiPhong();
        this.setupEventHandlers();
        this.setupIconSelector();
    }
    static iconList = [
        // Danh sách icons phổ biến từ Font Awesome
        { name: 'Wi-Fi', class: 'fas fa-wifi', category: 'fas' },
        { name: 'Điều hòa', class: 'fas fa-snowflake', category: 'fas' },
        { name: 'TV', class: 'fas fa-tv', category: 'fas' },
        { name: 'Tủ lạnh', class: 'fas fa-box', category: 'fas' },
        { name: 'Két an toàn', class: 'fas fa-lock', category: 'fas' },
        { name: 'Bồn tắm', class: 'fas fa-bath', category: 'fas' },
        { name: 'Vòi sen', class: 'fas fa-shower', category: 'fas' },
        { name: 'Máy sấy tóc', class: 'fas fa-wind', category: 'fas' },
        { name: 'Ban công', class: 'far fa-building', category: 'far' },
        
        { name: 'Bữa sáng', class: 'fas fa-utensils', category: 'fas' },
        { name: 'Dịch vụ phòng', class: 'fas fa-concierge-bell', category: 'fas' },
        { name: 'Giặt ủi', class: 'fas fa-tshirt', category: 'fas' },
        { name: 'Giường ngủ', class: 'fas fa-bed', category: 'fas' },
        { name: 'Cà phê', class: 'fas fa-coffee', category: 'fas' },
        { name: 'Bãi đỗ xe', class: 'fas fa-parking', category: 'fas' },
        { name: 'Hồ bơi', class: 'fas fa-swimming-pool', category: 'fas' },
        { name: 'Phòng gym', class: 'fas fa-dumbbell', category: 'fas' },
        { name: 'Spa', class: 'fas fa-spa', category: 'fas' },
        { name: 'Nhà hàng', class: 'fas fa-utensils', category: 'fas' },
        { name: 'Quầy bar', class: 'fas fa-glass-martini-alt', category: 'fas' },
        { name: 'Xe lăn', class: 'fas fa-wheelchair', category: 'fas' },
        { name: 'Nôi em bé', class: 'fas fa-baby', category: 'fas' },
        { name: 'Thân thiện với thú cưng', class: 'fas fa-paw', category: 'fas' },
        { name: 'Không hút thuốc', class: 'fas fa-smoking-ban', category: 'fas' },
        { name: 'Điện thoại', class: 'fas fa-phone', category: 'fas' },
        
        { name: 'Ấm đun nước', class: 'fas fa-mug-hot', category: 'fas' },
        { name: 'Quang cảnh', class: 'fas fa-mountain', category: 'fas' },
        { name: 'An ninh', class: 'fas fa-shield-alt', category: 'fas' },
        { name: 'Thang máy', class: 'fas fa-arrow-alt-circle-up', category: 'fas' },
        { name: 'Máy lọc không khí', class: 'fas fa-fan', category: 'fas' },
        { name: 'Cổng USB', class: 'fab fa-usb', category: 'fab' },
        { name: 'Bluetooth', class: 'fab fa-bluetooth', category: 'fab' },
        { name: 'Windows', class: 'fab fa-windows', category: 'fab' },
        { name: 'Android', class: 'fab fa-android', category: 'fab' },
        { name: 'Apple', class: 'fab fa-apple', category: 'fab' },
        { name: 'Facebook', class: 'fab fa-facebook', category: 'fab' },
        { name: 'Twitter', class: 'fab fa-twitter', category: 'fab' },
        { name: 'Instagram', class: 'fab fa-instagram', category: 'fab' },
        { name: 'YouTube', class: 'fab fa-youtube', category: 'fab' },
        
        { name: 'Lễ tân 24h', class: 'fas fa-bell', category: 'fas' },
        { name: 'Dịch vụ đưa đón', class: 'fas fa-taxi', category: 'fas' },
        { name: 'Thuê xe đạp', class: 'fas fa-bicycle', category: 'fas' },
        { name: 'Cây ATM', class: 'fas fa-credit-card', category: 'fas' },
        { name: 'Hướng dẫn viên du lịch', class: 'fas fa-map-marked-alt', category: 'fas' },
        { name: 'Phòng hội nghị', class: 'fas fa-chalkboard', category: 'fas' },
        { name: 'Bãi biển riêng', class: 'fas fa-umbrella-beach', category: 'fas' },
        { name: 'Khu vui chơi trẻ em', class: 'fas fa-child', category: 'fas' },
        { name: 'Nhà bếp', class: 'fas fa-utensils', category: 'fas' },
        { name: 'Tủ an toàn', class: 'fas fa-lock', category: 'fas' },
        { name: 'Máy pha cà phê', class: 'fas fa-coffee', category: 'fas' },
        { name: 'Báo cháy', class: 'fas fa-bell-exclamation', category: 'fas' },
        { name: 'Sân golf', class: 'fas fa-golf-ball', category: 'fas' },
        { name: 'Sân tennis', class: 'fas fa-table-tennis', category: 'fas' },
        { name: 'Bể nước nóng', class: 'fas fa-hot-tub', category: 'fas' },
        { name: 'Mua sắm', class: 'fas fa-shopping-cart', category: 'fas' },
        { name: 'Hỗ trợ hành lý', class: 'fas fa-suitcase-rolling', category: 'fas' },
        { name: 'Dịch vụ y tế', class: 'fas fa-briefcase-medical', category: 'fas' }
        

        // Thêm nhiều icon khác nếu cần
    ];
    static async loadTienNghiPhong() {
        try {
            const response = await fetch('/api/tien-nghi-phong/list');
            const data = await response.json();
            
            if (data.success) {
                this.renderTienNghiPhongList(data.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách tiện nghi phòng phòng:', error);
        }
    }

    static renderTienNghiPhongList(tienNghiPhongList) {
        const tbody = document.getElementById('tienNghiPhongList');
        if (!tbody) {
            console.log('Không tìm thấy phần tử tienNghiPhongList');
            return;
        }
        tbody.innerHTML = tienNghiPhongList.map(tiennghi => `
            <tr>
                <td>${tiennghi.TienNghiID}</td>
                <td>${tiennghi.TenTienNghi}</td>
                <td>${tiennghi.MoTa}</td>
                <td><i class="${tiennghi.Icon}"></i> ${tiennghi.Icon}</td>
                <td>${new Date(tiennghi.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-btn" data-id="${tiennghi.TienNghiID}">
                        Sửa
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${tiennghi.TienNghiID}">
                        Xóa
                    </button>
                </td>
            </tr>
        `).join('');

        // Thêm event listener cho các nút Edit và Delete
        this.setupActionButtons();
    }

    static setupActionButtons() {
        // Xử lý nút Edit
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                await this.loadTienNghiForEdit(id);
            });
        });

        // Xử lý nút Delete
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('Bạn có chắc chắn muốn xóa tiện nghi này?')) {
                    await this.deleteTienNghi(id);
                }
            });
        });
    }

    static async loadTienNghiForEdit(id) {
        try {
            const response = await fetch(`/api/tien-nghi-phong/${id}`);
            const data = await response.json();
            
            if (data.success) {
                const tienNghi = data.data;
                document.getElementById('tienNghiID').value = tienNghi.TienNghiID;
                document.getElementById('tenTienNghi').value = tienNghi.TenTienNghi;
                document.getElementById('moTa').value = tienNghi.MoTa;
                document.getElementById('icon').value = tienNghi.Icon;
                
                // Hiển thị icon preview
                const iconPreview = document.getElementById('icon-preview');
                if (iconPreview) {
                    iconPreview.innerHTML = `<i class="${tienNghi.Icon}"></i>`;
                }
                
                // Đổi text của nút submit
                const submitBtn = document.getElementById('submit-btn');
                if (submitBtn) {
                    submitBtn.textContent = 'Cập Nhật Tiện Nghi';
                }
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Lỗi khi tải thông tin tiện nghi:', error);
            alert('Đã có lỗi xảy ra khi tải thông tin tiện nghi');
        }
    }

    static async deleteTienNghi(id) {
        try {
            const response = await fetch(`/api/tien-nghi-phong/delete/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                alert('Xóa tiện nghi thành công');
                await this.loadTienNghiPhong();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Lỗi khi xóa tiện nghi:', error);
            alert('Đã có lỗi xảy ra khi xóa tiện nghi');
        }
    }

    static setupEventHandlers() {
        // Xử lý form submit
        const form = document.getElementById('tienNghiPhongForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const tienNghiID = document.getElementById('tienNghiID').value;
                const tenTienNghi = document.getElementById('tenTienNghi').value;
                const moTa = document.getElementById('moTa').value;
                const icon = document.getElementById('icon').value;

                try {
                    let url = '/api/tien-nghi-phong/create';
                    let method = 'POST';

                    // Nếu có ID, thì là cập nhật
                    if (tienNghiID) {
                        url = `/api/tien-nghi-phong/update/${tienNghiID}`;
                        method = 'PUT';
                    }

                    const response = await fetch(url, {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ tenTienNghi, moTa, icon })
                    });
    
                    const data = await response.json();
                    if (data.success) {
                        alert(tienNghiID ? 'Cập nhật tiện nghi thành công' : 'Thêm tiện nghi thành công');
                        form.reset();
                        // Reset hidden field và text nút submit
                        document.getElementById('tienNghiID').value = '';
                        document.getElementById('submit-btn').textContent = 'Lưu Tiện Nghi';
                        // Reset icon preview
                        document.getElementById('icon-preview').innerHTML = '<i class=""></i>';
                        await this.loadTienNghiPhong();
                    } else {
                        alert(data.message);
                    }
                } catch (error) {
                    console.error('Lỗi khi lưu tiện nghi:', error);
                    alert('Đã có lỗi xảy ra');
                }
            });
        }

        // Xử lý nút Reset
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                const form = document.getElementById('tienNghiPhongForm');
                if (form) {
                    form.reset();
                    document.getElementById('tienNghiID').value = '';
                    document.getElementById('submit-btn').textContent = 'Lưu Tiện Nghi';
                    document.getElementById('icon-preview').innerHTML = '<i class=""></i>';
                }
            });
        }

         // Xử lý nút "Chọn Icon"
         const showIconsBtn = document.getElementById('show-icons-btn');
         if (showIconsBtn) {
             showIconsBtn.addEventListener('click', () => {
                 const modal = document.getElementById('icon-selector-modal');
                 if (modal) {
                     modal.style.display = 'block';
                 }
             });
         }
         
         // Xử lý đóng modal
         const closeModal = document.querySelector('.close-modal');
         if (closeModal) {
             closeModal.addEventListener('click', () => {
                 const modal = document.getElementById('icon-selector-modal');
                 if (modal) {
                     modal.style.display = 'none';
                 }
             });
         }
         
         // Đóng modal khi click bên ngoài
         window.addEventListener('click', (e) => {
             const modal = document.getElementById('icon-selector-modal');
             if (modal && e.target === modal) {
                 modal.style.display = 'none';
             }
         });
         
         // Xử lý tìm kiếm icon
         const iconSearch = document.getElementById('icon-search');
         if (iconSearch) {
             iconSearch.addEventListener('input', (e) => {
                 const searchTerm = e.target.value.toLowerCase();
                 this.filterIcons(searchTerm);
             });
         }
         
         // Xử lý chọn danh mục icon
         const categoryButtons = document.querySelectorAll('.icon-category');
         categoryButtons.forEach(button => {
             button.addEventListener('click', (e) => {
                 // Xóa class active từ tất cả các nút
                 categoryButtons.forEach(btn => btn.classList.remove('active'));
                 // Thêm class active cho nút được click
                 e.target.classList.add('active');
                 
                 const category = e.target.getAttribute('data-category');
                 const searchTerm = document.getElementById('icon-search').value.toLowerCase();
                 this.filterIcons(searchTerm, category);
             });
         });
     }
     static setupIconSelector() {
        const iconsContainer = document.getElementById('icons-container');
        if (!iconsContainer) return;
        
        // Render tất cả icons
        iconsContainer.innerHTML = this.iconList.map(icon => `
            <div class="icon-item" data-icon="${icon.class}" data-category="${icon.category}">
                <i class="${icon.class}"></i>
                <span>${icon.name}</span>
            </div>
        `).join('');
        
        // Thêm event listener cho việc chọn icon
        const iconItems = document.querySelectorAll('.icon-item');
        iconItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Xóa class selected từ tất cả các icon
                iconItems.forEach(icon => icon.classList.remove('selected'));
                // Thêm class selected cho icon được chọn
                e.currentTarget.classList.add('selected');
                
                // Lấy class của icon
                const iconClass = e.currentTarget.getAttribute('data-icon');
                
                // Cập nhật input và preview
                document.getElementById('icon').value = iconClass;
                document.getElementById('icon-preview').innerHTML = `<i class="${iconClass}"></i>`;
                
                // Đóng modal
                document.getElementById('icon-selector-modal').style.display = 'none';
            });
        });
    }
    
    static filterIcons(searchTerm = '', category = 'all') {
        const iconItems = document.querySelectorAll('.icon-item');
        
        iconItems.forEach(item => {
            const iconName = item.querySelector('span').textContent.toLowerCase();
            const iconCategory = item.getAttribute('data-category');
            
            const matchesSearch = iconName.includes(searchTerm);
            const matchesCategory = category === 'all' || iconCategory === category;
            
            if (matchesSearch && matchesCategory) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
}
// Khởi tạo khi trang load xong
document.addEventListener('DOMContentLoaded', () => {
    tienNghiPhongManager.init();
});