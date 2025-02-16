const express = require('express');
const router = express.Router();
const accountsAdminController = require('./accountsAdminController');

// GET - Lấy danh sách admin
router.get('/', accountsAdminController.getAllAdmins);

// POST - Tạo admin mới
router.post('/', accountsAdminController.addAdmin);

// PUT - Cập nhật admin
router.put('/:id', accountsAdminController.updateAdmin);

// DELETE - Xóa admin
router.delete('/:id', accountsAdminController.deleteAdmin);

module.exports = router;