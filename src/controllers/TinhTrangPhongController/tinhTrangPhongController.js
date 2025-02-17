//src/controllers/TinhTrangPhongController/tinhTrangPhongController.js
const TinhtrangPhongConsole=require('../TinhTrangPhongController/tinhTrangPhongConsole');
const db=require('../../config/database');

class TinhTrangPhongController{
    //lấy danh sách tình trạng phòng
    static async getAllTinhTrangPhong(req,res){
        try{
            const result=await TinhtrangPhongConsole.getAllTinhTrangPhong();
            res.json(result);
        }catch(error){
            res.status(500).json({ success: false, message: error.message });
        }
    }
      // Thêm loại phòng mới
      static async createTinhTrangPhong(req, res) {
        try {
            const { tenTinhTrang } = req.body;
            if (!tenTinhTrang) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Tên tình trạng phòng không được trống' 
                });
            }
            
            const result = await TinhtrangPhongConsole.createTinhTrangPhong(tenTinhTrang);
            res.json(result); // Trả về kết quả từ phương thức createTinhTrangPhong
        } catch (error) {
            console.error('Lỗi khi thêm tình trạng phòng:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Lỗi khi thêm tình trạng phòng' 
            });
        }
    }
}

module.exports = TinhTrangPhongController;
