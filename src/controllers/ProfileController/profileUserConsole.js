//src/controllers/ProfileController/profileUserConsole.js
const db=require('../../config/database');

const profileUserConsole={
    getProfileUserInfo:async(req,res)=>{
        try{
            if(!req.session.user){
                return res.status(401).json({message:'Vui lòng đang nhập'});
            }
            const [nguoidung]=await db.query(
                'SELECT * FROM NguoiDung WHERE NguoiDungID = ?',
                [req.session.user.id]
            );
            if(nguoidung.length===0){
                return res.status(404).json({message:'Không tìm thấy thông tin'});
            }
             // Xóa dữ liệu nhạy cảm trước khi gửi
            const userInfo=nguoidung[0];
            delete userInfo.MatKhau;//// Không gửi mật khẩu đến frontend
            res.json(userInfo);
        } catch(error){
            console.error('Error:',error);
            res.status(500).json({message:'Lỗi server'});
        }
    },
    updateProfileUser:async(req,res)=>{
        try{
            if(!req.session.user){
                return res.status(401).json({message:'Vui lòng đăng nhập'});
            }
            const {ten, soDienThoai, diaChi,matKhau}=req.body;
            await db.query(
                'UPDATE NguoiDung SET TenNguoiDung = ?, SoDienThoai = ?, DiaChi = ? WHERE NguoiDungID = ?',
                [ten, soDienThoai, diaChi, req.session.user.id]
            );
            res.json({
                success:true,
                message:'Cập nhật thông tin thành công'
            });
         } catch (err){
                console.error('Error:',err);
                res.status(500).json({
                    success:false,
                    message:'Lỗi server'
                });
        }
     }
};
module.exports=profileUserConsole;

