//src/routes/ProfileRoutes/profileUserRoutes.js
const express = require('express');
const router = express.Router();
const profileUserController = require('./profileUserController');
const { checkUserAuth } = require('../../middleware/authMiddleware');
router.use(checkUserAuth);
router.get('/info', checkUserAuth, profileUserController.getProfileUserInfo);
router.post('/update', checkUserAuth, profileUserController.updateProfileUser);

module.exports = router;