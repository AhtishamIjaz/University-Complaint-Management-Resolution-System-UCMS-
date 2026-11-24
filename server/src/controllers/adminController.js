const bcrypt = require('bcryptjs');
const { run, get, all } = require('../config/db');
const { checkAndEscalateTickets } = require('../services/escalationService');
const { logAction } = require('../services/auditService');

const getUsers = async (req, res) => {
  try {
    const { role, department_id } = req.query;
    let conditions = [];
    let params = [];

    if (role) {
      conditions.push('u.role = ?');
      params.push(role);
    }
    if (department_id) {
      conditions.push('u.department_id = ?');
      params.push(department_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const users = await all(`
      SELECT u.id, u.name, u.email, u.role, u.department_id, u.student_id, u.phone, u.created_at,
             d.name as department_name, d.code as department_code
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      ${whereClause}
      ORDER BY u.created_at DESC
    `, params);

    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users: ' + err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department_id, student_id, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required.' });
    }

    const existing = await get(`SELECT id FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await run(
      `INSERT INTO users (name, email, password_hash, role, department_id, student_id, phone, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [name.trim(), email.toLowerCase().trim(), password_hash, role, department_id || null, student_id || null, phone || null]
    );

    const newUser = await get(
      `SELECT u.id, u.name, u.email, u.role, u.department_id, u.student_id, u.phone, d.name as department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [result.lastID]
    );

    res.status(201).json({
      message: `${role.toUpperCase()} user created successfully`,
      user: newUser
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user: ' + err.message });
  }
};

const triggerEscalationCheck = async (req, res) => {
  try {
    const result = await checkAndEscalateTickets();
    res.json({
      message: `Escalation check completed. ${result.count} ticket(s) escalated due to SLA violation.`,
      escalatedCount: result.count,
      escalatedTickets: result.escalated
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to execute escalation check: ' + err.message });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const { complaint_id, limit = 100 } = req.query;
    let sql = `
      SELECT a.*,
             c.ticket_number, c.title as complaint_title,
             u.name as performed_by_name, u.email as performed_by_email, u.role as performed_by_role
      FROM audit_logs a
      JOIN complaints c ON a.complaint_id = c.id
      LEFT JOIN users u ON a.performed_by_user_id = u.id
    `;
    let params = [];

    if (complaint_id) {
      sql += ` WHERE a.complaint_id = ? `;
      params.push(complaint_id);
    }

    sql += ` ORDER BY a.created_at DESC LIMIT ? `;
    params.push(parseInt(limit, 10));

    const logs = await all(sql, params);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs: ' + err.message });
  }
};

const reassignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { department_id, assigned_staff_id, reason } = req.body;

    const complaint = await get(`SELECT * FROM complaints WHERE id = ?`, [id]);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const oldDept = await get(`SELECT name FROM departments WHERE id = ?`, [complaint.department_id]);
    const newDept = department_id ? await get(`SELECT name FROM departments WHERE id = ?`, [department_id]) : oldDept;

    // Automatically transition to IN_PROGRESS upon administrative rerouting/reassignment
    const newStatus = 'IN_PROGRESS';

    await run(
      `UPDATE complaints
       SET department_id = COALESCE(?, department_id),
           assigned_staff_id = ?,
           status = ?,
           updated_at = datetime('now')
       WHERE id = ?`,
      [department_id || null, assigned_staff_id || null, newStatus, id]
    );

    await logAction({
      complaintId: id,
      action: 'ADMIN_REASSIGNED',
      performedByUserId: req.user.id,
      oldValue: `${oldDept ? oldDept.name : 'Unknown'} (${complaint.status})`,
      newValue: `${newDept ? newDept.name : 'Unknown'} (${newStatus})`,
      details: reason 
        ? `Admin rerouted complaint to ${newDept ? newDept.name : 'new department'} and automatically updated status to ${newStatus}. Reason: ${reason}` 
        : `Admin rerouted complaint to ${newDept ? newDept.name : 'new department'} and automatically updated status to ${newStatus}.`
    });

    res.json({
      message: 'Complaint successfully reassigned and set to IN_PROGRESS.',
      status: newStatus,
      department_name: newDept ? newDept.name : undefined
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reassign complaint: ' + err.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  triggerEscalationCheck,
  getAuditLogs,
  reassignComplaint
};
