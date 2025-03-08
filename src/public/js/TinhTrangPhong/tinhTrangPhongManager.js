//src/public/js/TinhTrangPhong/tinhTrangPhongManager.js
class TinhTrangPhongManager {
    static async init() {
        await this.loadTinhTrangPhong();
        this.setupEventHandlers();
    }

    static async loadTinhTrangPhong() {
        try {
            const response = await fetch('/api/tinh-trang-phong/list');
            const data = await response.json();
            
            if (data.success) {
                this.renderTinhTrangPhongList(data.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh tình trạng phòng:', error);
        }
    }

    static renderTinhTrangPhongList(tinhTrangPhongList) {
        const tbody = document.getElementById('tinhTrangPhongList');
        if (!tbody) {
            console.log('Không tìm thấy phần tử tinhTrangPhongList');
            return;
        }
        tbody.innerHTML = tinhTrangPhongList.map(tinhtrangphong => `
        <tr>
            <td>${tinhtrangphong.IDTinhTrang}</td>
            <td>${tinhtrangphong.TenTinhTrang}</td>
            <td>
                <button class="btn btn-sm btn-warning edit-btn" data-id="${tinhtrangphong.IDTinhTrang}">
                    Sửa
                </button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${tinhtrangphong.IDTinhTrang}">
                    Xóa
                </button>
            </td>
        </tr>
    `).join('');
     
    }

    static setupEventHandlers() {
        const form = document.getElementById('tinhTrangPhongForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const tenTinhTrang = document.getElementById('tenTinhTrang').value; // Đảm bảo id đúng
                if (!tenTinhTrang) {
                    alert('Vui lòng nhập tên tình trạng phòng');
                    return;
                }
        
                try {
                    const response = await fetch('/api/tinh-trang-phong/create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ tenTinhTrang })
                    });
        
                    const data = await response.json();
                    if (data.success) {
                        alert('Thêm tình trạng phòng thành công');
                        form.reset();
                        await this.loadTinhTrangPhong();
                    } else {
                        alert(data.message);
                    }
                } catch (error) {
                    console.error('Lỗi khi thêm tình trạng phòng:', error);
                    alert('Đã có lỗi xảy ra');
                }
            });
        }
      
    }
}

// Khởi tạo khi trang load xong
document.addEventListener('DOMContentLoaded', () => {
    TinhTrangPhongManager.init();
});