const { run, get, all } = require('../config/db');
const { logAction, getTicketAuditLogs } = require('../services/auditService');

const generateTicketNumber = async () => {
  const currentYear = new Date().getFullYear();
  const countRow = await get(`SELECT COUNT(*) as total FROM complaints`);
  const nextNum = (countRow ? countRow.total : 0) + 1;
  const padded = String(nextNum).padStart(4, '0');
  return `UCMS-${currentYear}-${padded}`;
};

const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority = 'MEDIUM', department_id, is_anonymous = 0 } = req.body;

    if (!title || !description || !category || !department_id) {
      return res.status(400).json({ error: 'Title, description, category, and department are required.' });
    }

    const ticketNumber = await generateTicketNumber();
    const isAnon = (is_anonymous === true || is_anonymous === '1' || is_anonymous === 1 || is_anonymous === 'true') ? 1 : 0;

    // Default SLA is 48 hours from now
    const result = await run(
      `INSERT INTO complaints (
        ticket_number, title, description, category, priority,
        status, is_anonymous, student_id, department_id,
        sla_due_at, is_escalated, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        'PENDING', ?, ?, ?,
        datetime('now', '+48 hours'), 0, datetime('now'), datetime('now')
      )`,
      [
        ticketNumber,
        title.trim(),
        description.trim(),
        category.trim(),
        priority.toUpperCase(),
        isAnon,
        req.user.id,
        department_id
      ]
    );

    const complaintId = result.lastID;

    // Process file attachments if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await run(
          `INSERT INTO attachments (complaint_id, file_name, file_path, file_type, file_size)
           VALUES (?, ?, ?, ?, ?)`,
          [complaintId, file.originalname, `/uploads/${file.filename}`, file.mimetype, file.size]
        );
      }
    }

    // Audit log
    await logAction({
      complaintId,
      action: 'TICKET_CREATED',
      performedByUserId: req.user.id,
      oldValue: null,
      newValue: 'PENDING',
      details: `Complaint submitted under category "${category}" with ${priority} priority. SLA countdown initiated (48 hours).`
    });

    const newTicket = await get(
      `SELECT c.*, d.name as department_name
       FROM complaints c
       JOIN departments d ON c.department_id = d.id
       WHERE c.id = ?`,
      [complaintId]
    );

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: newTicket
    });
  } catch (err) {
    console.error('Create Complaint error:', err);
    res.status(500).json({ error: 'Failed to create complaint: ' + err.message });
  }
};

const getComplaints = async (req, res) => {
  try {
    const { role, id: userId, department_id: userDeptId } = req.user;
    const { status, priority, category, department_id, search } = req.query;

    let conditions = [];
    let params = [];

    // Role-based visibility
    if (role === 'student') {
      conditions.push('c.student_id = ?');
      params.push(userId);
    } else if (role === 'staff') {
      conditions.push('c.department_id = ?');
      params.push(userDeptId);
    }
    // Admin sees all complaints by default

    // Query filters
    if (status) {
      conditions.push('c.status = ?');
      params.push(status);
    }
    if (priority) {
      conditions.push('c.priority = ?');
      params.push(priority);
    }
    if (category) {
      conditions.push('c.category = ?');
      params.push(category);
    }
    if (department_id) {
      conditions.push('c.department_id = ?');
      params.push(department_id);
    }
    if (search) {
      conditions.push('(c.title LIKE ? OR c.ticket_number LIKE ? OR c.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT c.*,
             d.name as department_name, d.code as department_code,
             u.name as student_name, u.student_id as student_reg_no, u.email as student_email,
             s.name as assigned_staff_name, s.email as assigned_staff_email,
             (SELECT COUNT(*) FROM comments cm WHERE cm.complaint_id = c.id) as comment_count,
             (SELECT COUNT(*) FROM attachments at WHERE at.complaint_id = c.id) as attachment_count,
             f.rating as feedback_rating
      FROM complaints c
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN users u ON c.student_id = u.id
      LEFT JOIN users s ON c.assigned_staff_id = s.id
      LEFT JOIN feedbacks f ON f.complaint_id = c.id
      ${whereClause}
      ORDER BY 
        CASE c.status
          WHEN 'ESCALATED' THEN 1
          WHEN 'PENDING' THEN 2
          WHEN 'IN_PROGRESS' THEN 3
          WHEN 'RESOLVED' THEN 4
          WHEN 'CLOSED' THEN 5
          ELSE 6
        END,
        c.created_at DESC
    `;

    const complaints = await all(sql, params);

    // Apply anonymity protection if viewer is not Admin and ticket is anonymous
    const sanitized = complaints.map(c => {
      if (c.is_anonymous && role !== 'admin' && c.student_id !== userId) {
        return {
          ...c,
          student_name: 'Anonymous Student',
          student_reg_no: 'REDACTED',
          student_email: 'anonymous@ucms.edu'
        };
      }
      return c;
    });

    res.json({ complaints: sanitized });
  } catch (err) {
    console.error('Get complaints error:', err);
    res.status(500).json({ error: 'Failed to retrieve complaints: ' + err.message });
  }
};

const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId, department_id: userDeptId } = req.user;

    const complaint = await get(
      `SELECT c.*,
              d.name as department_name, d.code as department_code,
              u.name as student_name, u.student_id as student_reg_no, u.email as student_email, u.phone as student_phone,
              s.name as assigned_staff_name, s.email as assigned_staff_email,
              f.rating as feedback_rating, f.comment as feedback_comment, f.created_at as feedback_created_at
       FROM complaints c
       LEFT JOIN departments d ON c.department_id = d.id
       LEFT JOIN users u ON c.student_id = u.id
       LEFT JOIN users s ON c.assigned_staff_id = s.id
       LEFT JOIN feedbacks f ON f.complaint_id = c.id
       WHERE c.id = ?`,
      [id]
    );

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint ticket not found.' });
    }

    // Access control check
    if (role === 'student' && complaint.student_id !== userId) {
      return res.status(403).json({ error: 'Access denied to this complaint.' });
    }
    if (role === 'staff' && complaint.department_id !== userDeptId && complaint.assigned_staff_id !== userId) {
      return res.status(403).json({ error: 'Access denied: complaint is routed to another department.' });
    }

    // Anonymity sanitization
    if (complaint.is_anonymous && role !== 'admin' && complaint.student_id !== userId) {
      complaint.student_name = 'Anonymous Complainant';
      complaint.student_reg_no = 'REDACTED';
      complaint.student_email = 'anonymous@ucms.edu';
      complaint.student_phone = 'REDACTED';
    }

    // Fetch attachments
    const attachments = await all(
      `SELECT * FROM attachments WHERE complaint_id = ? ORDER BY uploaded_at ASC`,
      [id]
    );

    // Fetch comments
    const comments = await all(
      `SELECT cm.*, u.name as author_name, u.role as author_role, u.email as author_email
       FROM comments cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.complaint_id = ?
       ORDER BY cm.created_at ASC`,
      [id]
    );

    // Sanitize anonymous comments if student made them
    const sanitizedComments = comments.map(cm => {
      if (complaint.is_anonymous && cm.user_id === complaint.student_id && role !== 'admin' && userId !== complaint.student_id) {
        return {
          ...cm,
          author_name: 'Anonymous Complainant',
          author_email: 'anonymous@ucms.edu'
        };
      }
      return cm;
    });

    // Fetch audit logs
    const auditLogs = await getTicketAuditLogs(id);

    res.json({
      complaint,
      attachments,
      comments: sanitizedComments,
      auditLogs
    });
  } catch (err) {
    console.error('Get Complaint By ID error:', err);
    res.status(500).json({ error: 'Failed to retrieve complaint details: ' + err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_notes } = req.body;
    const { role, id: userId } = req.user;

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const complaint = await get(`SELECT * FROM complaints WHERE id = ?`, [id]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    // Role check: Only staff (from that department) or admin can update status
    if (role === 'student') {
      return res.status(403).json({ error: 'Students cannot alter complaint status directly.' });
    }
    if (role === 'staff' && complaint.department_id !== req.user.department_id) {
      return res.status(403).json({ error: 'Cannot update ticket from another department.' });
    }

    const oldStatus = complaint.status;
    const isResolved = status === 'RESOLVED';
    const isClosed = status === 'CLOSED';

    await run(
      `UPDATE complaints
       SET status = ?,
           resolution_notes = COALESCE(?, resolution_notes),
           resolved_at = CASE WHEN ? THEN datetime('now') ELSE resolved_at END,
           updated_at = datetime('now')
       WHERE id = ?`,
      [status, resolution_notes || null, isResolved ? 1 : 0, id]
    );

    // Audit log
    await logAction({
      complaintId: id,
      action: 'STATUS_UPDATED',
      performedByUserId: userId,
      oldValue: oldStatus,
      newValue: status,
      details: resolution_notes ? `Status changed to ${status}. Notes: "${resolution_notes}"` : `Status changed to ${status}.`
    });

    res.json({
      message: `Complaint status successfully updated to ${status}`,
      status
    });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update status: ' + err.message });
  }
};

const assignStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { staff_id } = req.body;
    const { role, id: userId, department_id: userDeptId } = req.user;

    const targetStaffId = staff_id || userId; // Default claim by current user

    const complaint = await get(`SELECT * FROM complaints WHERE id = ?`, [id]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const staffUser = await get(`SELECT id, name, email, department_id, role FROM users WHERE id = ?`, [targetStaffId]);
    if (!staffUser || (staffUser.role !== 'staff' && staffUser.role !== 'admin')) {
      return res.status(400).json({ error: 'Invalid staff member selected.' });
    }

    const oldAssigned = complaint.assigned_staff_id;
    await run(
      `UPDATE complaints
       SET assigned_staff_id = ?,
           status = CASE WHEN status = 'PENDING' THEN 'IN_PROGRESS' ELSE status END,
           updated_at = datetime('now')
       WHERE id = ?`,
      [targetStaffId, id]
    );

    await logAction({
      complaintId: id,
      action: 'STAFF_ASSIGNED',
      performedByUserId: userId,
      oldValue: oldAssigned ? `Staff ID: ${oldAssigned}` : 'Unassigned',
      newValue: `Staff: ${staffUser.name} (${staffUser.email})`,
      details: `Assigned to ${staffUser.name}. Ticket transitioned to IN_PROGRESS.`
    });

    res.json({
      message: `Ticket successfully assigned to ${staffUser.name}`,
      assigned_staff_name: staffUser.name
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign staff: ' + err.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const { id: userId, role } = req.user;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Comment message cannot be empty.' });
    }

    const complaint = await get(`SELECT * FROM complaints WHERE id = ?`, [id]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const result = await run(
      `INSERT INTO comments (complaint_id, user_id, message, created_at)
       VALUES (?, ?, ?, datetime('now'))`,
      [id, userId, message.trim()]
    );

    // Update complaint timestamp
    await run(`UPDATE complaints SET updated_at = datetime('now') WHERE id = ?`, [id]);

    await logAction({
      complaintId: id,
      action: 'COMMENT_ADDED',
      performedByUserId: userId,
      oldValue: null,
      newValue: null,
      details: `New message posted by ${req.user.name} (${req.user.role}).`
    });

    const newComment = await get(
      `SELECT cm.*, u.name as author_name, u.role as author_role, u.email as author_email
       FROM comments cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.id = ?`,
      [result.lastID]
    );

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post comment: ' + err.message });
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const { id: userId } = req.user;

    const complaint = await get(`SELECT * FROM complaints WHERE id = ?`, [id]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    if (complaint.student_id !== userId) {
      return res.status(403).json({ error: 'Only the original complainant can submit satisfaction feedback.' });
    }

    if (complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED') {
      return res.status(400).json({ error: 'Feedback can only be submitted once the complaint is resolved.' });
    }

    const numericRating = parseInt(rating, 10);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5 stars.' });
    }

    // Insert or replace feedback
    await run(
      `INSERT INTO feedbacks (complaint_id, student_id, rating, comment, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(complaint_id) DO UPDATE SET
         rating = excluded.rating,
         comment = excluded.comment,
         created_at = datetime('now')`,
      [id, userId, numericRating, comment ? comment.trim() : '']
    );

    await logAction({
      complaintId: id,
      action: 'FEEDBACK_SUBMITTED',
      performedByUserId: userId,
      oldValue: null,
      newValue: `${numericRating} Stars`,
      details: comment ? `Student submitted ${numericRating}-star satisfaction rating: "${comment}"` : `Student submitted ${numericRating}-star satisfaction rating.`
    });

    res.json({
      message: 'Thank you for your feedback! Your rating has been recorded.',
      rating: numericRating,
      comment
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit feedback: ' + err.message });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  assignStaff,
  addComment,
  submitFeedback
};
