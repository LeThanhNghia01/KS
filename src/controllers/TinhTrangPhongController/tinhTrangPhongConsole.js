//src/controllers/TinhTrangPhongController/tinhtrangPhongConsole.js
const db=require('../../config/database');

class TinhtrangPhongConsole{
    //lay tat cat tinh trang phong
    static async getAllTinhTrangPhong(){
        try{
            const query= "SELECT * FROM TinhTrangPhong ORDER BY IDTinhTrang DESC";
            const [rows]=await db.query(query);
            return{
                success:true,
                data:rows
            };
        }catch(error){
            console.error('Lỗi khi tải danh sách tình trạng phòng:',error);
            return{
                success:false,
                message:'Không thể lấy danh sách loại phòng'
            };
        }
    }
    //them tinh trang phong mới
    static async createTinhTrangPhong(tenTinhTrang) {
        try {
            // Kiểm tra tên tình trạng đã tồn tại chưa
            const [existing] = await db.query(
                "SELECT * FROM TinhTrangPhong WHERE TenTinhTrang = ?",
                [tenTinhTrang]
            );
            if (existing.length > 0) {
                return {
                    success: false,
                    message: 'Tên tình trạng phòng đã tồn tại'
                };
            }
    
            // Thêm tình trạng phòng mới
            const query = "INSERT INTO TinhTrangPhong (TenTinhTrang) VALUES (?)";
            const [result] = await db.query(query, [tenTinhTrang]);
    
            return {
                success: true,
                message: 'Thêm tình trạng phòng thành công',
                data: {
                    id: result.insertId,
                    tenTinhTrang: tenTinhTrang
                }
            };
        } catch (error) {
            console.error('Lỗi khi thêm tình trạng phòng:', error);
            return {
                success: false,
                message: 'Không thể thêm tình trạng phòng'
            };
        }
    }
    //cập nhật tình trạng phòng
    static async updateTinhTrangPhong(){
        try{
            //Kiểm tra têm cập nhật có bị trùng với tên tình trạng khác không
            const [existing]=await db.query(
                "SELECT * FROM TinhTrangPhong WHERE TenTinhTrang =? AND IDTinhTrang != ?",
                [tenTinhTrang,id]
            );
            if(existing.length>0){
                return{
                    success:false,
                    message:'Tình trạng phòng đã tồn tại'
                };
            }
            const query="UPDATE TinhTrangPhong SET TenTinhTrang = ? WHERE IDTinhTrang =? ";
            const [result]=await db.query(query,[tenTinhTrang,id]);
            if(result.affectedRows===0){
                return{
                    success:false,
                    message:'Không tình thấy tình trạng phòng để cập nhật'
                };
            }
            return {
                success: true,
                message:'Cập nhật tình trạng phòng thành công '
            };
        }catch(error){
            console.error('Lỗi khi cập nhật tình trạng phòng: ',error);
            return{
                success:false,
                message:'Không thể cập nhật tình trạng phòng'
            };
        }
    }
    //xoá tình trạng phòng
    static async deleteTinhTrangPhong(){
        try{
            //Kiểm tra xem tình trạng phòng có đang được sử dụng không?
            const [phongUsing]=await db.query(
                "SELECT*FROM Phong WHERE IDTinhTrang=?",[id]
            );
            if(phongUsing.length>0){
                return {
                    success:false,
                    message:'Không thể xoá vì tình trạng phòng đang được sử dụng'
                };
            }
            const query="DELETE FROM TinhTrangPhong WHERE IDTinhTrang =?";
            const [result]=await db.query(query,[id]);
            if(result.affectedRows===0){
                return{
                    success:false,
                    message:'Không tìm thấy tình trạng phòng để xoá'
                };
            }
            return{
                success:true,
                message:'Xoá tình trạng phòng thành công'
            };
        }catch(error){
            console.error('Lỗi khi xoá tình trạng phòng:',error);
            return{
                success:flase,
                message:'Không thể xoá thì trạng phòng'
            }
        }
    }
    //lấy thông tin chi tiết 1 tình trạng phòng
    static async getTinhTrangPhong(id) {
        try {
            const query = "SELECT * FROM TinhTrangPhong WHERE IDTinhTrang = ?";
            const [rows] = await db.query(query, [id]);

            if (rows.length === 0) {
                return {
                    success: false,
                    message: 'Không tìm thấy tình trạng phòng'
                };
            }

            return {
                success: true,
                data: rows[0]
            };
        } catch (error) {
            console.error('Lỗi khi lấy thông tin tình trạng phòng:', error);
            return {
                success: false,
                message: 'Không thể lấy thông tin tình trạng phòng'
            };
        }
    }
}
module.exports=TinhtrangPhongConsole;
