class BaseController {
    static async handleRequest(action) {
        try {
            const result = await action();
            return { success: true, data: result };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                message: 'Đã xảy ra lỗi',
                error: error.message
            };
        }
    }
}