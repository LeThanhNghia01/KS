//src/routes/ProfileRoutes/profileUserRoutes.js
const express = require('express');
const router = express.Router();
const ProfileUserController = require('../../controllers/ProfileController/profileUserController');
const { checkUserAuth } = require('../../middleware/authMiddleware');

router.use(checkUserAuth);

// Define routes
router.get('/info', ProfileUserController.getProfileUserInfo);
router.post('/update', ProfileUserController.updateProfileUser);

module.exports = router;