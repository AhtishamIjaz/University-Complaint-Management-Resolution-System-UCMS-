const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { getAllDepartments, createDepartment, getDepartmentStaff } = require('../controllers/departmentController');

// All authenticated users can view list of departments
router.get('/', authenticateToken, getAllDepartments);

// Only admin can create departments
router.post('/', authenticateToken, authorize(['admin']), createDepartment);

// View staff of department
router.get('/:id/staff', authenticateToken, getDepartmentStaff);

module.exports = router;
