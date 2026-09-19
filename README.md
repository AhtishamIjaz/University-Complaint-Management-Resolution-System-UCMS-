# University Complaint Management & Resolution System (UCMS)
### Final Year Project (FYP) | Computer Science & Software Engineering

A role-driven web application that digitises and automates the complete lifecycle of university complaints — from submission through departmental routing, SLA escalation, resolution, and data analytics.

---

## 🚀 Quick Start (Simplest Way to Run)

The system is configured to run locally on Windows with **zero external database setup required** (uses an embedded, ACID-compliant SQLite database).

### Option 1: Double-Click (Easiest)
Simply double-click the **`start_ucms.bat`** file inside the `UCMS` folder.

### Option 2: Command Line
Open a terminal in the `UCMS` directory and run:
```bash
npm start
```
*(Or `node run.js`)*

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend REST API:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Pre-Configured Demo Personas (1-Click Switcher)

For your supervisor review and viva presentation, the top bar of the application includes an interactive **1-Click Role Switcher** so you can toggle between portals without manually typing credentials:

| Role | Name & Department | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Dr. Sarah Harrison (Dean) | `admin@ucms.edu` | `Admin@123` | Full university oversight, SLA trigger, user onboarding, global audit trail, analytics |
| **IT Staff** | Marcus Vance (IT Services) | `it.staff@ucms.edu` | `Staff@123` | IT department queue, status workflow, technical resolutions |
| **Facilities Staff** | Robert Chen (Campus Maintenance) | `facility.staff@ucms.edu` | `Staff@123` | Hostels, utilities, physical infrastructure grievances |
| **Student** | Alice Johnson (CS-2022-019) | `student1@ucms.edu` | `Student@123` | Grievance submission, real-time tracking stepper, discussion thread, satisfaction rating |
| **Student (Alt)** | Bilal Khan (SE-2023-045) | `student2@ucms.edu` | `Student@123` | Secondary complainant account |

---

## 🎯 Alignment with FYP Proposal Objectives

| # | Proposal Objective | Implementation in UCMS |
| :- | :--- | :--- |
| **O1** | **Centralisation** | Single full-stack web application hosting dedicated **Student**, **Staff/Department**, and **Admin** portals with Role-Based Access Control (RBAC). |
| **O2** | **Transparency** | Real-time visual lifecycle stepper (`Submitted` ➔ `Under Review` ➔ `SLA Check` ➔ `Resolved`) with status badges and communication threads. |
| **O3** | **Efficiency** | Automatic department routing upon ticket submission based on category selection. |
| **O4** | **Accountability** | Immutable audit log table recording every ticket creation, status change, reassignment, and SLA escalation with timestamps. |
| **O5** | **Escalation Engine** | Automated 48-hour SLA engine monitoring ticket deadlines, plus an interactive **"⚡ Trigger SLA Check Now"** button in Admin view for defense presentations. |
| **O6** | **Analytics Dashboard** | Visual charts (Chart.js) reporting complaint volume by department, status distribution, average resolution time, and student satisfaction score ($\ge 80\%$ benchmark). |

---

## 🌟 Key Features

### 1. Student Portal
- **Submit Grievance:** Title, category, department routing, priority level (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and description.
- **Evidence Uploads:** Attach screenshots, documents, and PDFs (stored locally with preview/download links).
- **Anonymous Filing Mode:** Identity-masked submission for harassment and sensitive bullying complaints to prevent retaliation.
- **Interactive Discussion Thread:** Direct messaging with assigned department staff.
- **Satisfaction Survey:** 1 to 5 star rating and comment once a ticket is marked resolved.

### 2. Staff / Department Portal
- **Department Queue:** Tickets automatically routed to the staff member's department.
- **Claim & Assign:** Staff can assign unassigned complaints to themselves.
- **Status Workflow:** Transition tickets from `PENDING` ➔ `IN_PROGRESS` ➔ `RESOLVED`.
- **Resolution Remarks:** Formal notes recorded on the ticket and preserved in the audit log.

### 3. Central Admin Portal
- **Master Ticket Table:** Search, filter, inspect, and reroute tickets across all departments.
- **SLA Escalation Engine:** Automatically escalates tickets exceeding the 48-hour SLA window to central administration.
- **Department & Staff Management:** Create new departments and onboard staff members.
- **Immutable Audit Trail:** Comprehensive, tamper-evident audit history showing actor identities and state changes.
- **Analytics & BI Dashboard:** Interactive charts (Bar, Doughnut, Line) calculating complaint metrics, resolution speeds, and satisfaction scores.

---

## 🏗️ Technical Architecture

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Chart.js (`react-chartjs-2`), Axios
- **Backend:** Node.js, Express.js REST API, SQLite (`sqlite3`), Multer (file uploads), JWT authentication, `bcryptjs`
- **Database File:** Local SQLite file (`server/ucms.db`), automatically seeded upon initial start.

---

## 🐳 Docker Deployment & Distribution

A unified, multi-stage **`Dockerfile`** and **`docker-compose.yml`** are included so you can package the entire system into a single container:

```bash
# Build Docker image:
docker build -t ucms:latest .

# Run container (Single command):
docker run -d -p 5000:5000 --name ucms-app ucms:latest
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

For complete instructions on sharing your Docker image with anyone via **Docker Hub** or as an **offline `.tar` file**, see [**`DOCKER_GUIDE.md`**](./DOCKER_GUIDE.md).
