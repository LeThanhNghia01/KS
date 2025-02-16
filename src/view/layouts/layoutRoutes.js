// layoutRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');

// Route để serve header.html
router.get('/layouts/header.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'header.html'));
});

module.exports = router;