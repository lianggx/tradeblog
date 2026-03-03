const express = require('express');
const router = express.Router();

// 导入路由
router.use('/articles', require('./articles'));
router.use('/categories', require('./categories'));
router.use('/tags', require('./tags'));
router.use('/stats', require('./stats'));
router.use('/login', require('./login'));

module.exports = router;
