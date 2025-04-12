const express = require('express');
const router = express.Router();
const profileUserController = require('./profileUserController');
const { checkUserAuth } = require('../../middleware/authMiddleware'); // Fix path to middleware folder

// Get user profile information
router.get('/info', checkUserAuth, profileUserController.getProfileUserInfo);

// Update user profile
router.post('/update', 
    checkUserAuth,
    express.json(), 
    profileUserController.uploadMiddleware, 
    profileUserController.updateProfileUser
);

module.exports = router;