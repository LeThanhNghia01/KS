//src/controllers/LoaiPhongController/loaiPhongController.js
const LoaiPhongConsole = require('../LoaiPhongController/loaiPhongConsole');
const db=require('../../config/database');

class LoaiPhongController {
    // Lấy danh sách loại phòng
    static async getAllLoaiPhong(req, res) {
        try {
            const result = await LoaiPhongConsole.getAllLoaiPhong(); // Sửa tên class
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Thêm loại phòng mới
    static async createLoaiPhong(req, res) {
        try {
            const { tenLoai } = req.body;
            if (!tenLoai) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Tên loại phòng không được trống' 
                });
            }
            
            const result = await LoaiPhongConsole.createLoaiPhong(tenLoai); // Sửa tên class
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = LoaiPhongController;