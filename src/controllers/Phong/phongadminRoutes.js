const express = require('express');
const router = express.Router();
const phongController = require('../../controllers/Phong/phongadminController');
const multer = require('multer');
const upload = multer({ dest: 'src/public/images/' });

// Routes cho API
router.get('/phong', phongController.getAllPhong);
router.post('/phong', upload.single('image'), phongController.createPhong);
router.put('/phong/:id', upload.single('image'), phongController.updatePhong);
router.delete('/phong/:id', phongController.deletePhong);
router.post('/phong/:id/confirm', phongController.confirmRoom);

module.exports = router;