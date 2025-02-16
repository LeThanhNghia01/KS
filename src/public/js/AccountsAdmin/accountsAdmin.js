//src/public/js/AccountsAdmin/accountsAdmin.js
class AccountsAdminManager {
    static async init() {
        try {
            await this.loadAdmins();
            this.setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    static async loadAdmins() {
        try {
            const response = await fetch('/api/accounts-admin', {
                credentials: 'include'
            });
            const result = await response.json();
            
            if (result.success && Array.isArray(result.data)) {
                this.updateTable(result.data);
            } else {
                throw new Error(result.message || 'Không thể tải danh sách admin');
            }
        } catch (error) {
            console.error('Error loading admins:', error);
            alert('Lỗi khi tải danh sách admin');
        }
    }

    static updateTable(admins) {
        const tbody = document.getElementById('adminTableBody');
        if (!tbody) {
            console.error('Table body element not found');
            return;
        }

        tbody.innerHTML = admins.map(admin => `
            <tr>
                <td>${admin.id}</td>
                <td>${admin.ten || ''}</td>
                <td>${admin.email || ''}</td>
                <td>${admin.created_at ? new Date(admin.created_at).toLocaleDateString('vi-VN') : ''}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-admin" data-id="${admin.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-admin" data-id="${admin.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    static setupEventListeners() {
        // Kiểm tra elements tồn tại trước khi thêm event listeners
        const addButton = document.querySelector('[data-bs-target="#adminModal"]');
        if (addButton) {
            addButton.addEventListener('click', () => {
                this.resetForm();
                document.getElementById('modalTitle').textContent = 'Thêm Admin mới';
            });
        }

        const saveButton = document.getElementById('saveAdmin');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveAdmin());
        }

        const tableBody = document.getElementById('adminTableBody');
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                const editBtn = e.target.closest('.edit-admin');
                const deleteBtn = e.target.closest('.delete-admin');
                
                if (editBtn) {
                    this.editAdmin(editBtn.dataset.id);
                } else if (deleteBtn) {
                    this.showDeleteConfirm(deleteBtn.dataset.id);
                }
            });
        }

        const confirmDeleteButton = document.getElementById('confirmDelete');
        if (confirmDeleteButton) {
            confirmDeleteButton.addEventListener('click', () => {
                const adminId = confirmDeleteButton.dataset.adminId;
                if (adminId) {
                    this.deleteAdmin(adminId);
                }
            });
        }
    }

    static resetForm() {
        document.getElementById('adminForm').reset();
        document.getElementById('adminId').value = '';
        document.getElementById('password').required = true;
        document.getElementById('confirmPassword').required = true;
    }

    static async saveAdmin() {
        const id = document.getElementById('adminId').value;
        const ten = document.getElementById('ten').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            const url = id ? `/api/accounts-admin/${id}` : '/api/accounts-admin';
            const method = id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, ten, email, password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            bootstrap.Modal.getInstance(document.getElementById('adminModal')).hide();
            this.loadAdmins();
            alert(id ? 'Cập nhật thành công' : 'Thêm mới thành công');
        } catch (error) {
            console.error('Error saving admin:', error);
            alert(error.message || 'Có lỗi xảy ra');
        }
    }

    static async editAdmin(id) {
        try {
            const response = await fetch(`/api/accounts-admin/${id}`, {
                credentials: 'include'
            });
            const admin = await response.json();

            document.getElementById('adminId').value = admin.id;
            document.getElementById('ten').value = admin.ten;
            document.getElementById('email').value = admin.email;
            document.getElementById('password').required = false;
            document.getElementById('confirmPassword').required = false;
            document.getElementById('modalTitle').textContent = 'Sửa thông tin Admin';

            new bootstrap.Modal(document.getElementById('adminModal')).show();
        } catch (error) {
            console.error('Error loading admin:', error);
            alert('Lỗi khi tải thông tin admin');
        }
    }

    static showDeleteConfirm(adminId) {
        document.getElementById('confirmDelete').dataset.adminId = adminId;
        new bootstrap.Modal(document.getElementById('deleteModal')).show();
    }

    static async deleteAdmin(id) {
        try {
            const response = await fetch(`/api/accounts-admin/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            this.loadAdmins();
            alert('Xóa thành công');
        } catch (error) {
            console.error('Error deleting admin:', error);
            alert(error.message || 'Có lỗi xảy ra khi xóa');
        }
    }
}

// Khởi tạo khi DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    AccountsAdminManager.init();
});