//src/controllers/LoginUserController/loginUserRoutes.js
const express = require('express');
const router = express.Router();
const loginUserController = require('./LoginUserController');

router.post('/login', loginUserController.login);
router.post('/register', loginUserController.register);
router.post('/logout', loginUserController.logout);

module.exports = router;