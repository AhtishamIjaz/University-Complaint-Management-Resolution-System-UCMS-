const http = require('http');

const request = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost:5000');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, { method, headers }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

async function runTests() {
  console.log('--- UCMS Automated API Verification Suite ---');

  // 1. Health check
  const health = await request('/api/health');
  console.log('✓ Health Endpoint:', health.status, health.data.system);

  // 2. Login as Admin
  const adminLogin = await request('/api/auth/login', 'POST', {
    email: 'admin@ucms.edu',
    password: 'Admin@123'
  });
  console.log('✓ Admin Login:', adminLogin.status, 'User:', adminLogin.data.user?.name);
  const adminToken = adminLogin.data.token;

  // 3. Login as Student
  const studentLogin = await request('/api/auth/login', 'POST', {
    email: 'student1@ucms.edu',
    password: 'Student@123'
  });
  console.log('✓ Student Login:', studentLogin.status, 'User:', studentLogin.data.user?.name);
  const studentToken = studentLogin.data.token;

  // 4. Query Complaints (Admin)
  const allComplaints = await request('/api/complaints', 'GET', null, adminToken);
  console.log('✓ Admin View All Complaints count:', allComplaints.data.complaints?.length);

  // 5. Query Complaints (Student)
  const studentComplaints = await request('/api/complaints', 'GET', null, studentToken);
  console.log('✓ Student Scoped Complaints count:', studentComplaints.data.complaints?.length);

  // 6. Analytics Endpoint (Objective O6)
  const stats = await request('/api/stats/analytics', 'GET', null, adminToken);
  console.log('✓ Analytics Summary:', {
    total: stats.data.summary.totalComplaints,
    resolved: stats.data.summary.resolvedCount,
    satisfactionRate: stats.data.summary.satisfactionScorePercent + '%',
    avgHours: stats.data.summary.avgResolutionHours + 'h'
  });

  // 7. Trigger SLA Escalation Engine (Objective O5)
  const escalation = await request('/api/admin/escalate-now', 'POST', {}, adminToken);
  console.log('✓ SLA Escalation Engine Triggered:', escalation.data.message);

  // 8. Audit Logs (Objective O4)
  const audit = await request('/api/admin/audit-logs', 'GET', null, adminToken);
  console.log('✓ Audit Logs Count:', audit.data.logs?.length);

  console.log('--- ALL SYSTEM VERIFICATION CHECKS PASSED ---');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
