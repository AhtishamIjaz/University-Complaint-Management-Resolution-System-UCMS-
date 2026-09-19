require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./config/db');
const { seedData } = require('./seed');
const { checkAndEscalateTickets } = require('./services/escalationService');

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded attachments statically
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    system: 'University Complaint Management & Resolution System (UCMS)',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);

// Serve production frontend bundle (in Docker or when built)
const fs = require('fs');
const clientDistCandidates = [
  path.join(__dirname, '..', 'public'), // Docker container layout
  path.join(__dirname, '..', '..', 'client', 'dist') // Local workspace layout
];

for (const candidate of clientDistCandidates) {
  if (fs.existsSync(candidate)) {
    app.use(express.static(candidate));
    // Fallback for Single Page Application routing (Express 5 compatible)
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
        return res.sendFile(path.join(candidate, 'index.html'));
      }
      next();
    });
    console.log(`Serving static client bundle from: ${candidate}`);
    break;
  }
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server and initialize DB
const startServer = async () => {
  try {
    await initDB();
    await seedData();

    // Start automated SLA Escalation checker (runs every 5 minutes)
    setInterval(() => {
      checkAndEscalateTickets().catch(err => console.error('Automated SLA check error:', err.message));
    }, 5 * 60 * 1000);

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  UCMS Backend Server running on http://localhost:${PORT}`);
      console.log(`  API Health: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
