const bcrypt = require('bcryptjs');
const { run, get, all, initDB } = require('./config/db');

const seedData = async () => {
  console.log('Seeding initial UCMS database...');
  await initDB();

  // Check if departments already seeded
  const deptCount = await get(`SELECT COUNT(*) as count FROM departments`);
  if (deptCount && deptCount.count > 0) {
    console.log('Database already has seeded data. Skipping initial seed.');
    return;
  }

  // 1. Seed Departments
  const departments = [
    { name: 'Information Technology Services', code: 'ITS', description: 'Network, campus Wi-Fi, LMS, portal, and hardware support', email: 'it.helpdesk@ucms.edu' },
    { name: 'Facilities & Campus Maintenance', code: 'FCM', description: 'Hostel rooms, electricity, air conditioning, plumbing, and sanitation', email: 'facilities@ucms.edu' },
    { name: 'Academic Affairs & Examinations', code: 'AAE', description: 'Course registration, grading disputes, examination schedules, transcripts', email: 'academics@ucms.edu' },
    { name: 'Finance & Student Accounts', code: 'FIN', description: 'Tuition fees, scholarship disbursement, fee challans, refunds', email: 'finance@ucms.edu' },
    { name: 'Student Affairs & Welfare', code: 'SAW', description: 'Student conduct, harassment cell, hostel allocation, disciplinary matters', email: 'student.affairs@ucms.edu' }
  ];

  for (const dept of departments) {
    await run(
      `INSERT INTO departments (name, code, description, email) VALUES (?, ?, ?, ?)`,
      [dept.name, dept.code, dept.description, dept.email]
    );
  }
  console.log('Departments seeded.');

  // Get department IDs
  const itsDept = await get(`SELECT id FROM departments WHERE code = 'ITS'`);
  const fcmDept = await get(`SELECT id FROM departments WHERE code = 'FCM'`);
  const aaeDept = await get(`SELECT id FROM departments WHERE code = 'AAE'`);
  const finDept = await get(`SELECT id FROM departments WHERE code = 'FIN'`);
  const sawDept = await get(`SELECT id FROM departments WHERE code = 'SAW'`);

  // 2. Seed Users
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@123', salt);
  const staffPassword = await bcrypt.hash('Staff@123', salt);
  const studentPassword = await bcrypt.hash('Student@123', salt);

  // Admin
  await run(
    `INSERT INTO users (name, email, password_hash, role, department_id, phone)
     VALUES (?, ?, ?, 'admin', NULL, ?)`,
    ['Dr. Sarah Harrison', 'admin@ucms.edu', adminPassword, '+1 (555) 019-2834']
  );

  // Staff
  await run(
    `INSERT INTO users (name, email, password_hash, role, department_id, phone)
     VALUES (?, ?, ?, 'staff', ?, ?)`,
    ['Marcus Vance', 'it.staff@ucms.edu', staffPassword, itsDept.id, '+1 (555) 019-5521']
  );

  await run(
    `INSERT INTO users (name, email, password_hash, role, department_id, phone)
     VALUES (?, ?, ?, 'staff', ?, ?)`,
    ['Robert Chen', 'facility.staff@ucms.edu', staffPassword, fcmDept.id, '+1 (555) 019-6632']
  );

  await run(
    `INSERT INTO users (name, email, password_hash, role, department_id, phone)
     VALUES (?, ?, ?, 'staff', ?, ?)`,
    ['Prof. Evelyn Reed', 'academic.staff@ucms.edu', staffPassword, aaeDept.id, '+1 (555) 019-7743']
  );

  await run(
    `INSERT INTO users (name, email, password_hash, role, department_id, phone)
     VALUES (?, ?, ?, 'staff', ?, ?)`,
    ['David Miller', 'finance.staff@ucms.edu', staffPassword, finDept.id, '+1 (555) 019-8854']
  );

  // Students
  await run(
    `INSERT INTO users (name, email, password_hash, role, department_id, student_id, phone)
     VALUES (?, ?, ?, 'student', ?, ?, ?)`,
    ['Alice Johnson', 'student1@ucms.edu', studentPassword, itsDept.id, 'CS-2022-019', '+1 (555) 012-3456']
  );

  await run(
    `INSERT INTO users (name, email, password_hash, role, department_id, student_id, phone)
     VALUES (?, ?, ?, 'student', ?, ?, ?)`,
    ['Bilal Khan', 'student2@ucms.edu', studentPassword, fcmDept.id, 'SE-2023-045', '+1 (555) 012-7890']
  );

  await run(
    `INSERT INTO users (name, email, password_hash, role, department_id, student_id, phone)
     VALUES (?, ?, ?, 'student', ?, ?, ?)`,
    ['Emma Watson', 'student3@ucms.edu', studentPassword, aaeDept.id, 'EE-2021-088', '+1 (555) 012-9988']
  );

  console.log('Users seeded.');

  const admin = await get(`SELECT id FROM users WHERE email = 'admin@ucms.edu'`);
  const itStaff = await get(`SELECT id FROM users WHERE email = 'it.staff@ucms.edu'`);
  const facilityStaff = await get(`SELECT id FROM users WHERE email = 'facility.staff@ucms.edu'`);
  const academicStaff = await get(`SELECT id FROM users WHERE email = 'academic.staff@ucms.edu'`);
  const financeStaff = await get(`SELECT id FROM users WHERE email = 'finance.staff@ucms.edu'`);
  const student1 = await get(`SELECT id FROM users WHERE email = 'student1@ucms.edu'`);
  const student2 = await get(`SELECT id FROM users WHERE email = 'student2@ucms.edu'`);
  const student3 = await get(`SELECT id FROM users WHERE email = 'student3@ucms.edu'`);

  // 3. Seed Realistic Complaints
  // Ticket 1: In-Progress IT issue with comments
  const t1 = await run(
    `INSERT INTO complaints (
      ticket_number, title, description, category, priority, status,
      is_anonymous, student_id, department_id, assigned_staff_id,
      sla_due_at, is_escalated, created_at, updated_at
    ) VALUES (
      'UCMS-2026-0001', 'High packet loss and intermittent disconnects in CS Lab 3',
      'During practical programming sessions in Computer Science Lab 3, workstations 12 through 24 frequently lose connection to the university gateway router. This interrupts submission uploads.',
      'IT Services', 'HIGH', 'IN_PROGRESS',
      0, ?, ?, ?,
      datetime('now', '+24 hours'), 0, datetime('now', '-18 hours'), datetime('now', '-2 hours')
    )`,
    [student1.id, itsDept.id, itStaff.id]
  );

  await run(
    `INSERT INTO audit_logs (complaint_id, action, performed_by_user_id, old_value, new_value, details, created_at)
     VALUES (?, 'TICKET_CREATED', ?, NULL, 'PENDING', 'Complaint submitted by Alice Johnson (CS-2022-019).', datetime('now', '-18 hours'))`,
    [t1.lastID, student1.id]
  );
  await run(
    `INSERT INTO audit_logs (complaint_id, action, performed_by_user_id, old_value, new_value, details, created_at)
     VALUES (?, 'STAFF_ASSIGNED', ?, 'Unassigned', 'Marcus Vance', 'Assigned to Senior Systems Engineer Marcus Vance.', datetime('now', '-12 hours'))`,
    [t1.lastID, itStaff.id]
  );
  await run(
    `INSERT INTO audit_logs (complaint_id, action, performed_by_user_id, old_value, new_value, details, created_at)
     VALUES (?, 'STATUS_UPDATED', ?, 'PENDING', 'IN_PROGRESS', 'Investigation initiated on switch switch-cs-floor2.', datetime('now', '-12 hours'))`,
    [t1.lastID, itStaff.id]
  );
  await run(
    `INSERT INTO comments (complaint_id, user_id, message, created_at)
     VALUES (?, ?, 'Hello Alice, we inspected switch rack CS-02 and detected a damaged RJ45 uplink cable. A replacement patch cable has been ordered.', datetime('now', '-10 hours'))`,
    [t1.lastID, itStaff.id]
  );
  await run(
    `INSERT INTO comments (complaint_id, user_id, message, created_at)
     VALUES (?, ?, 'Thank you Mr. Marcus! Our next lab exam is on Tuesday morning, so we really appreciate the prompt fix.', datetime('now', '-2 hours'))`,
    [t1.lastID, student1.id]
  );

  // Ticket 2: Escalated Ticket (> 48h SLA breached)
  const t2 = await run(
    `INSERT INTO complaints (
      ticket_number, title, description, category, priority, status,
      is_anonymous, student_id, department_id, assigned_staff_id,
      sla_due_at, is_escalated, escalated_at, created_at, updated_at
    ) VALUES (
      'UCMS-2026-0002', 'Hostel Block B hot water geyser failure during exam week',
      'The central boiler in Boys Hostel Block B has been offline for over 3 days. Students have no access to warm water in sub-zero morning temperatures.',
      'Facility Maintenance', 'URGENT', 'ESCALATED',
      0, ?, ?, ?,
      datetime('now', '-12 hours'), 1, datetime('now', '-12 hours'), datetime('now', '-60 hours'), datetime('now', '-12 hours')
    )`,
    [student2.id, fcmDept.id, facilityStaff.id]
  );

  await run(
    `INSERT INTO audit_logs (complaint_id, action, performed_by_user_id, old_value, new_value, details, created_at)
     VALUES (?, 'TICKET_CREATED', ?, NULL, 'PENDING', 'Urgent maintenance ticket logged.', datetime('now', '-60 hours'))`,
    [t2.lastID, student2.id]
  );
  await run(
    `INSERT INTO audit_logs (complaint_id, action, performed_by_user_id, old_value, new_value, details, created_at)
     VALUES (?, 'AUTO_ESCALATED_SLA', NULL, 'IN_PROGRESS', 'ESCALATED', 'Ticket SLA deadline exceeded 48 hours without resolution. Automatically escalated to Central Administration.', datetime('now', '-12 hours'))`,
    [t2.lastID]
  );

  // Ticket 3: Resolved ticket with 5-star student satisfaction rating
  const t3 = await run(
    `INSERT INTO complaints (
      ticket_number, title, description, category, priority, status,
      is_anonymous, student_id, department_id, assigned_staff_id,
      sla_due_at, is_escalated, resolution_notes, resolved_at, created_at, updated_at
    ) VALUES (
      'UCMS-2026-0003', 'Discrepancy in Software Engineering mid-term grade upload',
      'The portal reflected a 68/100 mark for CS301, while my marked examination sheet returned by the lecturer clearly states 86/100.',
      'Academic Affairs', 'MEDIUM', 'RESOLVED',
      0, ?, ?, ?,
      datetime('now', '+10 hours'), 0,
      'Grade sheet audited against faculty marks ledger. A clerical transposition error occurred during database import. Score has been revised to 86/100 on the official transcript portal.',
      datetime('now', '-6 hours'), datetime('now', '-30 hours'), datetime('now', '-6 hours')
    )`,
    [student1.id, aaeDept.id, academicStaff.id]
  );

  await run(
    `INSERT INTO audit_logs (complaint_id, action, performed_by_user_id, old_value, new_value, details, created_at)
     VALUES (?, 'TICKET_CREATED', ?, NULL, 'PENDING', 'Academic grade dispute ticket submitted.', datetime('now', '-30 hours'))`,
    [t3.lastID, student1.id]
  );
  await run(
    `INSERT INTO audit_logs (complaint_id, action, performed_by_user_id, old_value, new_value, details, created_at)
     VALUES (?, 'STATUS_UPDATED', ?, 'IN_PROGRESS', 'RESOLVED', 'Grade audited and corrected on student transcript.', datetime('now', '-6 hours'))`,
    [t3.lastID, academicStaff.id]
  );
  await run(
    `INSERT INTO feedbacks (complaint_id, student_id, rating, comment, created_at)
     VALUES (?, ?, 5, 'Dr. Evelyn investigated the faculty ledger and updated my transcript within hours. Truly exceptional transparency!', datetime('now', '-4 hours'))`,
    [t3.lastID, student1.id]
  );
  await run(
    `INSERT INTO audit_logs (complaint_id, action, performed_by_user_id, old_value, new_value, details, created_at)
     VALUES (?, 'FEEDBACK_SUBMITTED', ?, NULL, '5 Stars', 'Student submitted 5-star rating with positive review.', datetime('now', '-4 hours'))`,
    [t3.lastID, student1.id]
  );

  // Ticket 4: Resolved finance fee refund with 4-star review
  const t4 = await run(
    `INSERT INTO complaints (
      ticket_number, title, description, category, priority, status,
      is_anonymous, student_id, department_id, assigned_staff_id,
      sla_due_at, is_escalated, resolution_notes, resolved_at, created_at, updated_at
    ) VALUES (
      'UCMS-2026-0004', 'Semester fee challan double debit via 1Link banking gateway',
      'While paying the Spring 2026 semester dues, the portal timed out and the transaction was debited twice from my bank account ($1,250 x 2).',
      'Finance & Fees', 'HIGH', 'RESOLVED',
      0, ?, ?, ?,
      datetime('now', '+8 hours'), 0,
      'Bank reconciliation statement verified transaction TXN-882319-B as a duplicate batch capture. Reversed $1,250 back to source account. Credit advice slip generated.',
      datetime('now', '-8 hours'), datetime('now', '-36 hours'), datetime('now', '-8 hours')
    )`,
    [student2.id, finDept.id, financeStaff.id]
  );

  await run(
    `INSERT INTO feedbacks (complaint_id, student_id, rating, comment, created_at)
     VALUES (?, ?, 4, 'Refund credit took 2 working days, but the staff member kept me informed throughout.', datetime('now', '-5 hours'))`,
    [t4.lastID, student2.id]
  );

  // Ticket 5: Anonymous Harassment Grievance (Confidential)
  const t5 = await run(
    `INSERT INTO complaints (
      ticket_number, title, description, category, priority, status,
      is_anonymous, student_id, department_id, assigned_staff_id,
      sla_due_at, is_escalated, created_at, updated_at
    ) VALUES (
      'UCMS-2026-0005', 'Unwelcome behavior and verbal intimidation outside Department Cafeteria',
      'A group of senior students has been consistently harassing junior students near the evening bus stand and cafeteria exit. Filing anonymously due to fear of academic retaliation.',
      'Harassment & Disciplinary', 'URGENT', 'IN_PROGRESS',
      1, ?, ?, NULL,
      datetime('now', '+36 hours'), 0, datetime('now', '-12 hours'), datetime('now', '-4 hours')
    )`,
    [student3.id, sawDept.id]
  );

  await run(
    `INSERT INTO audit_logs (complaint_id, action, performed_by_user_id, old_value, new_value, details, created_at)
     VALUES (?, 'TICKET_CREATED', ?, NULL, 'PENDING', 'Anonymous complaint submitted under Harassment & Disciplinary category.', datetime('now', '-12 hours'))`,
    [t5.lastID, student3.id]
  );

  // Ticket 6: Pending ticket within SLA
  const t6 = await run(
    `INSERT INTO complaints (
      ticket_number, title, description, category, priority, status,
      is_anonymous, student_id, department_id, assigned_staff_id,
      sla_due_at, is_escalated, created_at, updated_at
    ) VALUES (
      'UCMS-2026-0006', 'Central Library Ground Floor AC cooling failure',
      'The split AC in the quiet study zone has been blowing warm air, making study conditions uncomfortable during afternoon study hours.',
      'Facility Maintenance', 'LOW', 'PENDING',
      0, ?, ?, NULL,
      datetime('now', '+46 hours'), 0, datetime('now', '-2 hours'), datetime('now', '-2 hours')
    )`,
    [student1.id, fcmDept.id]
  );

  await run(
    `INSERT INTO audit_logs (complaint_id, action, performed_by_user_id, old_value, new_value, details, created_at)
     VALUES (?, 'TICKET_CREATED', ?, NULL, 'PENDING', 'Complaint routed automatically to Facilities & Campus Maintenance.', datetime('now', '-2 hours'))`,
    [t6.lastID, student1.id]
  );

  console.log('UCMS database seeded successfully with comprehensive, realistic test cases!');
};

if (require.main === module) {
  seedData()
    .then(() => {
      console.log('Seeder process complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = { seedData };
