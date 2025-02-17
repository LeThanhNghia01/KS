//src/controllers/TinhTrangPhongController/TinhTrangPhongRoutes.js
const express = require('express');
const router = express.Router();
const TinhTrangPhongController = require('./tinhTrangPhongController');

router.get('/list', TinhTrangPhongController.getAllTinhTrangPhong);
router.post('/create', TinhTrangPhongController.createTinhTrangPhong);
// Thêm các routes khác: update, delete...

module.exports = router;