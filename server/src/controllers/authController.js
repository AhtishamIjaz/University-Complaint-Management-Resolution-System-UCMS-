const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get, all } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const register = async (req, res) => {
  try {
    const { name, email, password, student_id, phone, department_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // Check existing email
    const existingUser = await get(`SELECT id FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await run(
      `INSERT INTO users (name, email, password_hash, role, department_id, student_id, phone)
       VALUES (?, ?, ?, 'student', ?, ?, ?)`,
      [name.trim(), email.toLowerCase().trim(), password_hash, department_id || null, student_id || null, phone || null]
    );

    const user = await get(
      `SELECT u.id, u.name, u.email, u.role, u.department_id, u.student_id, u.phone, d.name as department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [result.lastID]
    );

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, department_id: user.department_id, student_id: user.student_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to register account: ' + err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await get(
      `SELECT u.*, d.name as department_name, d.code as department_code
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE LOWER(u.email) = ?`,
      [email.toLowerCase().trim()]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id,
        student_id: user.student_id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
      department_name: user.department_name,
      department_code: user.department_code,
      student_id: user.student_id,
      phone: user.phone
    };

    res.json({
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await get(
      `SELECT u.id, u.name, u.email, u.role, u.department_id, u.student_id, u.phone, u.created_at,
              d.name as department_name, d.code as department_code
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDemoAccounts = async (req, res) => {
  res.json({
    accounts: [
      { role: 'admin', email: 'admin@ucms.edu', password: 'Admin@123', label: 'University Administrator (Full System Access)' },
      { role: 'staff', email: 'it.staff@ucms.edu', password: 'Staff@123', label: 'IT Department Staff (Technical Complaints)' },
      { role: 'staff', email: 'facility.staff@ucms.edu', password: 'Staff@123', label: 'Facilities Staff (Hostel & Maintenance)' },
      { role: 'student', email: 'student1@ucms.edu', password: 'Student@123', label: 'Student: Alice Johnson (CS Department)' },
      { role: 'student', email: 'student2@ucms.edu', password: 'Student@123', label: 'Student: Bilal Khan (SE Department)' },
    ]
  });
};

module.exports = {
  register,
  login,
  getMe,
  getDemoAccounts
};
