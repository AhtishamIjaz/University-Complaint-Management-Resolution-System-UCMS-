const { run, all } = require('../config/db');
const { logAction } = require('./auditService');

const checkAndEscalateTickets = async () => {
  try {
    // Find tickets in PENDING or IN_PROGRESS where sla_due_at <= now and is_escalated = 0
    const overdueComplaints = await all(
      `SELECT id, ticket_number, title, department_id, status, sla_due_at
       FROM complaints
       WHERE status IN ('PENDING', 'IN_PROGRESS')
         AND sla_due_at <= datetime('now')
         AND is_escalated = 0`
    );

    if (overdueComplaints.length === 0) {
      return { count: 0, escalated: [] };
    }

    const escalated = [];

    for (const ticket of overdueComplaints) {
      const oldStatus = ticket.status;
      await run(
        `UPDATE complaints
         SET status = 'ESCALATED',
             is_escalated = 1,
             escalated_at = datetime('now'),
             updated_at = datetime('now')
         WHERE id = ?`,
        [ticket.id]
      );

      await logAction({
        complaintId: ticket.id,
        action: 'AUTO_ESCALATED_SLA',
        performedByUserId: null, // System automated
        oldValue: oldStatus,
        newValue: 'ESCALATED',
        details: `Ticket SLA deadline (${ticket.sla_due_at}) passed without resolution. Escalated to central administration.`
      });

      escalated.push({
        id: ticket.id,
        ticketNumber: ticket.ticket_number,
        title: ticket.title,
        oldStatus
      });
    }

    console.log(`[SLA Escalation Engine] Automated check executed. ${escalated.length} complaint(s) escalated.`);
    return { count: escalated.length, escalated };
  } catch (err) {
    console.error('[SLA Escalation Engine] Error running escalation check:', err.message);
    throw err;
  }
};

module.exports = {
  checkAndEscalateTickets
};
