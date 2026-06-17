const express = require('express');
const { uploadFile } = require('../controllers/upload.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadFile);

module.exports = router;
