const express = require('express');
const router = express.Router();
const profileUserController = require('./profileUserController');

router.get('/info', profileUserController.getProfileUserInfo);
router.post('/update', profileUserController.updateProfileUser);

module.exports = router;