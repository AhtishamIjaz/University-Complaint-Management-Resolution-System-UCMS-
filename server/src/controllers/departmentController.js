const { run, get, all } = require('../config/db');

const getAllDepartments = async (req, res) => {
  try {
    const departments = await all(`
      SELECT d.*,
             COUNT(c.id) as total_complaints,
             SUM(CASE WHEN c.status = 'PENDING' THEN 1 ELSE 0 END) as pending_count,
             SUM(CASE WHEN c.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_count,
             SUM(CASE WHEN c.status = 'ESCALATED' THEN 1 ELSE 0 END) as escalated_count,
             SUM(CASE WHEN c.status IN ('RESOLVED', 'CLOSED') THEN 1 ELSE 0 END) as resolved_count,
             (SELECT COUNT(*) FROM users u WHERE u.department_id = d.id AND u.role = 'staff') as staff_count
      FROM departments d
      LEFT JOIN complaints c ON c.department_id = d.id
      GROUP BY d.id
      ORDER BY d.name ASC
    `);

    res.json({ departments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch departments: ' + err.message });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, code, description, email } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'Department name and code are required.' });
    }

    const existing = await get(`SELECT id FROM departments WHERE code = ? OR name = ?`, [code.toUpperCase().trim(), name.trim()]);
    if (existing) {
      return res.status(400).json({ error: 'A department with this name or code already exists.' });
    }

    const result = await run(
      `INSERT INTO departments (name, code, description, email, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [name.trim(), code.toUpperCase().trim(), description || '', email || '']
    );

    const newDept = await get(`SELECT * FROM departments WHERE id = ?`, [result.lastID]);

    res.status(201).json({
      message: 'Department created successfully',
      department: newDept
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create department: ' + err.message });
  }
};

const getDepartmentStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await all(
      `SELECT id, name, email, role, phone, created_at
       FROM users
       WHERE department_id = ? AND role = 'staff'
       ORDER BY name ASC`,
      [id]
    );

    res.json({ staff });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch department staff: ' + err.message });
  }
};

module.exports = {
  getAllDepartments,
  createDepartment,
  getDepartmentStaff
};
