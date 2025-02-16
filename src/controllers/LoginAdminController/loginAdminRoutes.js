// loginAdminRoutes.js
const express = require('express');
const router = express.Router();
const loginController = require('./loginadminController');

// Chỉ sử dụng các route có phương thức tồn tại
router.post('/login', loginController.loginAdmin);
router.get('/check-auth', loginController.checkAuth);
router.post('/logout', loginController.logout);

module.exports = router;