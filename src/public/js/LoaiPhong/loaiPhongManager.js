//src/public/js/LoaiPhong/loaiPhongManager.js
class LoaiPhongManager {
    static async init() {
        await this.loadLoaiPhong();
        this.setupEventHandlers();
    }

    static async loadLoaiPhong() {
        try {
            const response = await fetch('/api/loai-phong/list');
            const data = await response.json();
            
            if (data.success) {
                this.renderLoaiPhongList(data.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách loại phòng:', error);
        }
    }

    static renderLoaiPhongList(loaiPhongList) {
        const tbody = document.getElementById('loaiPhongList');
        tbody.innerHTML = loaiPhongList.map(loai => `
            <tr>
                <td>${loai.IDLoai}</td>
                <td>${loai.TenLoai}</td>
                <td>${new Date(loai.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-btn" data-id="${loai.IDLoai}">
                        Sửa
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${loai.IDLoai}">
                        Xóa
                    </button>
                </td>
            </tr>
        `).join('');
    }

    static setupEventHandlers() {
        const form = document.getElementById('loaiPhongForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const tenLoai = document.getElementById('tenLoai').value;
            try {
                const response = await fetch('/api/loai-phong/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ tenLoai })
                });

                const data = await response.json();
                if (data.success) {
                    alert('Thêm loại phòng thành công');
                    form.reset();
                    await this.loadLoaiPhong();
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Lỗi khi thêm loại phòng:', error);
                alert('Đã có lỗi xảy ra');
            }
        });
    }
}

// Khởi tạo khi trang load xong
document.addEventListener('DOMContentLoaded', () => {
    LoaiPhongManager.init();
});