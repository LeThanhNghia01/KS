const express = require('express');
const router = express.Router();
const profileController = require('./profileController');

router.get('/info', profileController.getProfileInfo);
router.post('/update', profileController.updateProfile);

module.exports = router; 