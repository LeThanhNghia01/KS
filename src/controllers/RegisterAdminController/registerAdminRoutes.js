const express = require('express');
const router = express.Router();
const registerController = require('./registeradminController');

router.get('/roles', registerController.getRoles);
router.post('/register', registerController.registerAdmin);

module.exports = router;