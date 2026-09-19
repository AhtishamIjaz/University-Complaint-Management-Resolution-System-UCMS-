const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  assignStaff,
  addComment,
  submitFeedback
} = require('../controllers/complaintController');

router.use(authenticateToken);

// Create new complaint (students only, allows up to 5 attachments)
router.post('/', authorize(['student', 'admin']), upload.array('attachments', 5), createComplaint);

// List complaints (role-scoped)
router.get('/', getComplaints);

// Get complaint details
router.get('/:id', getComplaintById);

// Update status (staff or admin)
router.patch('/:id/status', authorize(['staff', 'admin']), updateStatus);

// Assign staff (staff or admin)
router.patch('/:id/assign', authorize(['staff', 'admin']), assignStaff);

// Post comment/clarification thread message
router.post('/:id/comments', addComment);

// Submit post-resolution satisfaction feedback (student)
router.post('/:id/feedback', authorize(['student']), submitFeedback);

module.exports = router;
