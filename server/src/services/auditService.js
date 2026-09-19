const { run, all } = require('../config/db');

const logAction = async ({ complaintId, action, performedByUserId, oldValue = null, newValue = null, details = '' }) => {
  try {
    await run(
      `INSERT INTO audit_logs (complaint_id, action, performed_by_user_id, old_value, new_value, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [complaintId, action, performedByUserId, oldValue, newValue, details]
    );
  } catch (err) {
    console.error('Audit Log recording error:', err.message);
  }
};

const getTicketAuditLogs = async (complaintId) => {
  return await all(
    `SELECT a.*, u.name as performed_by_name, u.role as performed_by_role, u.email as performed_by_email
     FROM audit_logs a
     LEFT JOIN users u ON a.performed_by_user_id = u.id
     WHERE a.complaint_id = ?
     ORDER BY a.created_at ASC`,
    [complaintId]
  );
};

module.exports = {
  logAction,
  getTicketAuditLogs
};
