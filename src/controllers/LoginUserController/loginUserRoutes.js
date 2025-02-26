//src/controllers/LoginUserController/loginUserRoutes.js
const express = require('express');
const router = express.Router();
const loginUserController = require('./LoginUserController');

router.get('/check-auth', loginUserController.checkAuth);
router.post('/login', loginUserController.login);
router.post('/register', loginUserController.register);
router.post('/logout', loginUserController.logout);
router.post('/google-login', loginUserController.googleLogin);
router.post('/update-profile', loginUserController.updateProfile);

module.exports = router;