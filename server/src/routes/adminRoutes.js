const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const {
  getUsers,
  createUser,
  triggerEscalationCheck,
  getAuditLogs,
  reassignComplaint
} = require('../controllers/adminController');

// All routes require Admin authorization
router.use(authenticateToken);
router.use(authorize(['admin']));

router.get('/users', getUsers);
router.post('/users', createUser);
router.post('/escalate-now', triggerEscalationCheck);
router.get('/audit-logs', getAuditLogs);
router.patch('/reassign/:id', reassignComplaint);

module.exports = router;
