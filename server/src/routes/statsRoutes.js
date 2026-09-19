const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { getAnalytics } = require('../controllers/statsController');

router.get('/analytics', authenticateToken, authorize(['admin', 'staff']), getAnalytics);

module.exports = router;
