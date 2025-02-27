//src/routes/ProfileRoutes/profileUserRoutes.js
const express = require('express');
const router = express.Router();
const profileUserController = require('../../controllers/ProfileController/profileUserController');
const authMiddleware = require('../../middlewares/authMiddleware'); // Assuming you have auth middleware

// Get user profile information
router.get('/info', authMiddleware.isLoggedIn, profileUserController.getProfileUserInfo);

// Update user profile
router.post('/update', 
    authMiddleware.isLoggedIn, 
    profileUserController.uploadMiddleware,
    profileUserController.updateProfileUser
);

module.exports = router;