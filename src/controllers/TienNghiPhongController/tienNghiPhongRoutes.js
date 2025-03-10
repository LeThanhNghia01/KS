// src/controllers/TienNghiPhongController/tienNghiPhongRoutes.js
const express = require('express');
const router = express.Router();


router.get('/list', async (req, res) => {
    const result = await TienNghiPhongController.getAllTienNghi();
    res.json(result);
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const result = await TienNghiPhongController.getTienNghiById(id);
    res.json(result);
});

router.post('/create', async (req, res) => {
    const { tenTienNghi, moTa, icon } = req.body;
    const result = await TienNghiPhongController.createTienNghi(tenTienNghi, moTa, icon);
    res.json(result);
});

router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { tenTienNghi, moTa, icon } = req.body;
    const result = await TienNghiPhongController.updateTienNghi(id, tenTienNghi, moTa, icon);
    res.json(result);
});

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const result = await TienNghiPhongController.deleteTienNghi(id);
    res.json(result);
});

module.exports = router;