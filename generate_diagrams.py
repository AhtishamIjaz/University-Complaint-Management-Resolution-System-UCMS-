import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

os.makedirs('report_assets', exist_ok=True)

# Helper function to style plots
def set_clean_ax(fig, w=10, h=6):
    fig.set_size_inches(w, h)
    ax = fig.add_subplot(111)
    ax.axis('off')
    return ax

# 1. System Architecture Overview
fig = plt.figure(figsize=(11, 7), dpi=300)
ax = fig.add_subplot(111)
ax.axis('off')
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)

# Title
ax.text(50, 96, "UCMS - Three-Tier System Architecture Overview", fontsize=14, fontweight='bold', ha='center', color='#1e293b')

# Presentation Tier (Client)
p_box = patches.FancyBboxPatch((5, 68), 90, 22, boxstyle="round,pad=1", ec="#4f46e5", fc="#eef2ff", lw=2)
ax.add_patch(p_box)
ax.text(8, 86, "Presentation Tier (Frontend Client - React 18 & Vite SPA)", fontsize=11, fontweight='bold', color='#3730a3')
# Subcomponents
ax.add_patch(patches.FancyBboxPatch((8, 71), 26, 12, boxstyle="round,pad=0.5", ec="#6366f1", fc="#ffffff", lw=1.5))
ax.text(21, 77, "Student Portal\n(Filing, Tracking, Thread, Rating)", fontsize=8.5, ha='center', va='center', color='#1e293b')

ax.add_patch(patches.FancyBboxPatch((37, 71), 26, 12, boxstyle="round,pad=0.5", ec="#6366f1", fc="#ffffff", lw=1.5))
ax.text(50, 77, "Department Portal\n(Queue, Claim, Status, Notes)", fontsize=8.5, ha='center', va='center', color='#1e293b')

ax.add_patch(patches.FancyBboxPatch((66, 71), 26, 12, boxstyle="round,pad=0.5", ec="#6366f1", fc="#ffffff", lw=1.5))
ax.text(79, 77, "Admin Portal\n(Oversight, SLA Engine, Analytics)", fontsize=8.5, ha='center', va='center', color='#1e293b')

# Arrows
ax.annotate('', xy=(50, 60), xytext=(50, 68), arrowprops=dict(arrowstyle="<->", color="#4f46e5", lw=2))
ax.text(52, 64, "HTTPS / REST API Requests (JWT Auth Header)", fontsize=8.5, color='#475569', va='center')

# Application Tier (Backend Server)
a_box = patches.FancyBboxPatch((5, 34), 90, 26, boxstyle="round,pad=1", ec="#059669", fc="#ecfdf5", lw=2)
ax.add_patch(a_box)
ax.text(8, 56, "Application Tier (REST API Backend - Node.js & Express 5)", fontsize=11, fontweight='bold', color='#065f46')

ax.add_patch(patches.FancyBboxPatch((8, 37), 19, 15, boxstyle="round,pad=0.5", ec="#10b981", fc="#ffffff", lw=1.5))
ax.text(17.5, 44.5, "Authentication &\nRBAC Middleware\n(JWT Guard)", fontsize=8, ha='center', va='center', color='#1e293b')

ax.add_patch(patches.FancyBboxPatch((30, 37), 19, 15, boxstyle="round,pad=0.5", ec="#10b981", fc="#ffffff", lw=1.5))
ax.text(39.5, 44.5, "Complaint Engine\n(Auto Routing &\nStatus Transition)", fontsize=8, ha='center', va='center', color='#1e293b')

ax.add_patch(patches.FancyBboxPatch((52, 37), 19, 15, boxstyle="round,pad=0.5", ec="#10b981", fc="#ffffff", lw=1.5))
ax.text(61.5, 44.5, "48-Hour SLA\nEscalation Daemon\n(Interval Check)", fontsize=8, ha='center', va='center', color='#1e293b')

ax.add_patch(patches.FancyBboxPatch((74, 37), 19, 15, boxstyle="round,pad=0.5", ec="#10b981", fc="#ffffff", lw=1.5))
ax.text(83.5, 44.5, "Audit Logger &\nAnalytics BI\n(Metrics & Charts)", fontsize=8, ha='center', va='center', color='#1e293b')

# Arrows
ax.annotate('', xy=(50, 26), xytext=(50, 34), arrowprops=dict(arrowstyle="<->", color="#059669", lw=2))
ax.text(52, 30, "SQL Queries & Transactions (ACID Guarantees)", fontsize=8.5, color='#475569', va='center')

# Data Tier (Database & File Storage)
d_box = patches.FancyBboxPatch((5, 4), 90, 22, boxstyle="round,pad=1", ec="#d97706", fc="#fffbeb", lw=2)
ax.add_patch(d_box)
ax.text(8, 22, "Data Persistence Tier (SQLite Relational Database & File Storage)", fontsize=11, fontweight='bold', color='#92400e')

ax.add_patch(patches.FancyBboxPatch((8, 7), 26, 12, boxstyle="round,pad=0.5", ec="#f59e0b", fc="#ffffff", lw=1.5))
ax.text(21, 13, "Relational Database (ucms.db)\nUsers, Departments, Complaints,\nFeedbacks, Comments", fontsize=7.5, ha='center', va='center', color='#1e293b')

ax.add_patch(patches.FancyBboxPatch((37, 7), 26, 12, boxstyle="round,pad=0.5", ec="#f59e0b", fc="#ffffff", lw=1.5))
ax.text(50, 13, "Immutable Audit Trail\nAppend-only transaction ledger\nwith actor & timestamp", fontsize=7.5, ha='center', va='center', color='#1e293b')

ax.add_patch(patches.FancyBboxPatch((66, 7), 26, 12, boxstyle="round,pad=0.5", ec="#f59e0b", fc="#ffffff", lw=1.5))
ax.text(79, 13, "Physical File Storage\n(uploads/)\nDocuments, Images, PDFs", fontsize=7.5, ha='center', va='center', color='#1e293b')

plt.tight_layout()
plt.savefig('report_assets/fig_arch_overview.png', dpi=300, bbox_inches='tight')
plt.close()

# 2. Use Case Diagram
fig = plt.figure(figsize=(11, 7.5), dpi=300)
ax = fig.add_subplot(111)
ax.axis('off')
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)

ax.text(50, 97, "UCMS - Unified UML Use Case Diagram", fontsize=14, fontweight='bold', ha='center', color='#1e293b')

# Actors (Left, Bottom, Right)
# Student Actor
ax.add_patch(patches.Circle((10, 72), 3, ec="#1e293b", fc="#cbd5e1", lw=1.5))
ax.plot([10, 10], [69, 60], color="#1e293b", lw=2)
ax.plot([5, 15], [65, 65], color="#1e293b", lw=2)
ax.plot([10, 6], [60, 52], color="#1e293b", lw=2)
ax.plot([10, 14], [60, 52], color="#1e293b", lw=2)
ax.text(10, 48, "Student\n(Complainant)", fontsize=9, fontweight='bold', ha='center', color='#1e293b')

# Staff Actor
ax.add_patch(patches.Circle((10, 24), 3, ec="#1e293b", fc="#cbd5e1", lw=1.5))
ax.plot([10, 10], [21, 12], color="#1e293b", lw=2)
ax.plot([5, 15], [17, 17], color="#1e293b", lw=2)
ax.plot([10, 6], [12, 4], color="#1e293b", lw=2)
ax.plot([10, 14], [12, 4], color="#1e293b", lw=2)
ax.text(10, 0, "Department Staff", fontsize=9, fontweight='bold', ha='center', color='#1e293b')

# Admin Actor
ax.add_patch(patches.Circle((90, 50), 3, ec="#1e293b", fc="#cbd5e1", lw=1.5))
ax.plot([90, 90], [47, 38], color="#1e293b", lw=2)
ax.plot([85, 95], [43, 43], color="#1e293b", lw=2)
ax.plot([90, 86], [38, 30], color="#1e293b", lw=2)
ax.plot([90, 94], [38, 30], color="#1e293b", lw=2)
ax.text(90, 26, "Central Admin\n(Dean / Registrar)", fontsize=9, fontweight='bold', ha='center', color='#1e293b')

# System Boundary
sys_box = patches.FancyBboxPatch((22, 6), 56, 88, boxstyle="round,pad=1", ec="#94a3b8", fc="#f8fafc", lw=1.5, ls="--")
ax.add_patch(sys_box)
ax.text(50, 91, "University Complaint Management System (UCMS Boundary)", fontsize=9.5, fontweight='bold', ha='center', color='#475569')

# Use Case Ovals
use_cases = [
    ("Register & Login (JWT)", 83),
    ("Submit Complaint & Upload Proof", 73),
    ("File Anonymous Harassment Report", 63),
    ("Track Live Status (Timeline Stepper)", 53),
    ("Clarification Thread Messaging", 43),
    ("Submit Satisfaction Rating (1-5★)", 33),
    ("Review Department Queue", 23),
    ("Claim Ticket & Update Status (Notes)", 13),
    ("Trigger SLA Escalation Engine", 68), # Admin
    ("Reroute Misplaced Complaint", 58),    # Admin
    ("Onboard Staff & Manage Depts", 48),  # Admin
    ("View BI Analytics Dashboard", 38),   # Admin & Staff
    ("Audit Immutable Transaction Logs", 28) # Admin
]

for text, y in use_cases[:8]:
    ax.add_patch(patches.FancyBboxPatch((25, y-3), 24, 6, boxstyle="round,pad=0.5", ec="#4f46e5", fc="#e0e7ff", lw=1))
    ax.text(37, y, text, fontsize=7.5, ha='center', va='center', color='#1e293b')

for text, y in use_cases[8:]:
    ax.add_patch(patches.FancyBboxPatch((51, y-3), 25, 6, boxstyle="round,pad=0.5", ec="#059669", fc="#d1fae5", lw=1))
    ax.text(63.5, y, text, fontsize=7.5, ha='center', va='center', color='#1e293b')

# Connections from Student (10, 65)
ax.plot([14, 25], [67, 83], color="#475569", lw=1)
ax.plot([14, 25], [65, 73], color="#475569", lw=1)
ax.plot([14, 25], [63, 63], color="#475569", lw=1)
ax.plot([14, 25], [61, 53], color="#475569", lw=1)
ax.plot([14, 25], [59, 43], color="#475569", lw=1)
ax.plot([14, 25], [57, 33], color="#475569", lw=1)

# Connections from Staff (10, 18)
ax.plot([14, 25], [19, 83], color="#475569", lw=1)
ax.plot([14, 25], [18, 43], color="#475569", lw=1)
ax.plot([14, 25], [17, 23], color="#475569", lw=1)
ax.plot([14, 25], [16, 13], color="#475569", lw=1)
ax.plot([14, 51], [15, 38], color="#475569", lw=1)

# Connections from Admin (86, 45)
ax.plot([86, 76], [45, 68], color="#475569", lw=1)
ax.plot([86, 76], [45, 58], color="#475569", lw=1)
ax.plot([86, 76], [45, 48], color="#475569", lw=1)
ax.plot([86, 76], [45, 38], color="#475569", lw=1)
ax.plot([86, 76], [45, 28], color="#475569", lw=1)

plt.tight_layout()
plt.savefig('report_assets/fig_usecase_diagram.png', dpi=300, bbox_inches='tight')
plt.close()

# 3. State Machine Diagram
fig = plt.figure(figsize=(10, 5), dpi=300)
ax = fig.add_subplot(111)
ax.axis('off')
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)

ax.text(50, 94, "UCMS - Complaint Lifecycle State Machine Diagram", fontsize=13, fontweight='bold', ha='center', color='#1e293b')

# States
# Start circle
ax.add_patch(patches.Circle((8, 50), 3, ec="#1e293b", fc="#1e293b"))
ax.annotate('', xy=(18, 50), xytext=(11, 50), arrowprops=dict(arrowstyle="->", color="#1e293b", lw=1.5))
ax.text(14.5, 53, "submit()", fontsize=8, ha='center')

# PENDING
ax.add_patch(patches.FancyBboxPatch((18, 42), 16, 16, boxstyle="round,pad=0.5", ec="#d97706", fc="#fef3c7", lw=2))
ax.text(26, 50, "PENDING\n(SLA 48h active)", fontsize=8.5, fontweight='bold', ha='center', va='center', color='#92400e')

# IN_PROGRESS
ax.add_patch(patches.FancyBboxPatch((46, 42), 18, 16, boxstyle="round,pad=0.5", ec="#2563eb", fc="#dbeafe", lw=2))
ax.text(55, 50, "IN_PROGRESS\n(Staff Assigned)", fontsize=8.5, fontweight='bold', ha='center', va='center', color='#1e40af')

# ESCALATED
ax.add_patch(patches.FancyBboxPatch((46, 10), 18, 16, boxstyle="round,pad=0.5", ec="#dc2626", fc="#fee2e2", lw=2))
ax.text(55, 18, "ESCALATED\n(SLA Breached)", fontsize=8.5, fontweight='bold', ha='center', va='center', color='#991b1b')

# RESOLVED
ax.add_patch(patches.FancyBboxPatch((76, 42), 16, 16, boxstyle="round,pad=0.5", ec="#059669", fc="#d1fae5", lw=2))
ax.text(84, 50, "RESOLVED\n(Feedback Open)", fontsize=8.5, fontweight='bold', ha='center', va='center', color='#065f46')

# Transitions
# Pending -> In Progress
ax.annotate('', xy=(46, 50), xytext=(34, 50), arrowprops=dict(arrowstyle="->", color="#1e293b", lw=1.5))
ax.text(40, 53, "claim() / assign()", fontsize=7.5, ha='center')

# Pending -> Escalated
ax.annotate('', xy=(46, 18), xytext=(26, 42), arrowprops=dict(arrowstyle="->", color="#dc2626", lw=1.5, connectionstyle="arc3,rad=-0.2"))
ax.text(30, 26, "sla_expired() [48h]", fontsize=7.5, color="#dc2626")

# In Progress -> Escalated
ax.annotate('', xy=(55, 26), xytext=(55, 42), arrowprops=dict(arrowstyle="->", color="#dc2626", lw=1.5))
ax.text(57, 34, "sla_expired()", fontsize=7.5, color="#dc2626")

# In Progress -> Resolved
ax.annotate('', xy=(76, 50), xytext=(64, 50), arrowprops=dict(arrowstyle="->", color="#059669", lw=1.5))
ax.text(70, 53, "resolve(notes)", fontsize=7.5, color="#059669", ha='center')

# Escalated -> Resolved
ax.annotate('', xy=(84, 42), xytext=(64, 18), arrowprops=dict(arrowstyle="->", color="#059669", lw=1.5, connectionstyle="arc3,rad=-0.2"))
ax.text(76, 26, "admin_resolve()", fontsize=7.5, color="#059669")

# Resolved -> End circle
ax.add_patch(patches.Circle((95, 50), 2.5, ec="#1e293b", fc="#ffffff", lw=1.5))
ax.add_patch(patches.Circle((95, 50), 1.5, ec="#1e293b", fc="#1e293b"))
ax.annotate('', xy=(92.5, 50), xytext=(90, 50), arrowprops=dict(arrowstyle="->", color="#1e293b", lw=1.5))

plt.tight_layout()
plt.savefig('report_assets/fig_state_machine.png', dpi=300, bbox_inches='tight')
plt.close()

# 4. Entity-Relationship (ER) Diagram
fig = plt.figure(figsize=(11, 7.5), dpi=300)
ax = fig.add_subplot(111)
ax.axis('off')
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)

ax.text(50, 97, "UCMS - Entity-Relationship (ER) Relational Schema", fontsize=14, fontweight='bold', ha='center', color='#1e293b')

# Boxes for Entities
def draw_entity(ax, x, y, w, h, title, fields, border_col="#3b82f6", bg_col="#eff6ff"):
    ax.add_patch(patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.3", ec=border_col, fc=bg_col, lw=1.5))
    ax.text(x + w/2, y + h - 3, title, fontsize=8.5, fontweight='bold', ha='center', color='#1e293b')
    ax.plot([x, x+w], [y + h - 5, y + h - 5], color=border_col, lw=1)
    for idx, f in enumerate(fields):
        ax.text(x + 1.5, y + h - 7.5 - (idx * 2.5), f, fontsize=7, color='#334155')

draw_entity(ax, 5, 62, 25, 28, "DEPARTMENTS", [
    "PK id (INTEGER)",
    "name (VARCHAR, UNIQUE)",
    "code (VARCHAR, UNIQUE)",
    "description (TEXT)",
    "email (VARCHAR)",
    "created_at (DATETIME)"
], "#4f46e5", "#e0e7ff")

draw_entity(ax, 37, 60, 26, 32, "USERS", [
    "PK id (INTEGER)",
    "name (VARCHAR)",
    "email (VARCHAR, UNIQUE)",
    "password_hash (VARCHAR)",
    "role ('student','staff','admin')",
    "FK department_id -> DEPT.id",
    "student_id (VARCHAR)",
    "phone (VARCHAR)",
    "created_at (DATETIME)"
], "#0284c7", "#e0f2fe")

draw_entity(ax, 70, 62, 25, 26, "FEEDBACKS", [
    "PK id (INTEGER)",
    "FK complaint_id -> COMPL.id",
    "FK student_id -> USERS.id",
    "rating (INT 1 to 5)",
    "comment (TEXT)",
    "created_at (DATETIME)"
], "#d97706", "#fef3c7")

draw_entity(ax, 37, 10, 26, 42, "COMPLAINTS", [
    "PK id (INTEGER)",
    "ticket_number (VARCHAR, UQ)",
    "title (VARCHAR)",
    "description (TEXT)",
    "category (VARCHAR)",
    "priority ('LOW','MED','HIGH','URG')",
    "status ('PENDING','IN_PROG',...)",
    "is_anonymous (BOOLEAN 0/1)",
    "FK student_id -> USERS.id",
    "FK department_id -> DEPT.id",
    "FK assigned_staff_id -> USERS.id",
    "sla_due_at (DATETIME)",
    "is_escalated (BOOLEAN)",
    "resolution_notes (TEXT)",
    "resolved_at (DATETIME)"
], "#059669", "#d1fae5")

draw_entity(ax, 5, 12, 25, 24, "ATTACHMENTS", [
    "PK id (INTEGER)",
    "FK complaint_id -> COMPL.id",
    "file_name (VARCHAR)",
    "file_path (VARCHAR)",
    "file_type (VARCHAR)",
    "file_size (INTEGER)",
    "uploaded_at (DATETIME)"
], "#7c3aed", "#ede9fe")

draw_entity(ax, 70, 14, 25, 22, "COMMENTS", [
    "PK id (INTEGER)",
    "FK complaint_id -> COMPL.id",
    "FK user_id -> USERS.id",
    "message (TEXT)",
    "is_internal (BOOLEAN)",
    "created_at (DATETIME)"
], "#db2777", "#fce7f3")

# Connectors
# Departments to Users
ax.plot([30, 37], [75, 75], color="#64748b", lw=1.5, ls=":")
# Users to Complaints
ax.plot([50, 50], [60, 52], color="#64748b", lw=1.5)
# Complaints to Attachments
ax.plot([37, 30], [25, 25], color="#64748b", lw=1.5)
# Complaints to Comments
ax.plot([63, 70], [25, 25], color="#64748b", lw=1.5)
# Complaints to Feedbacks
ax.plot([63, 70], [48, 62], color="#64748b", lw=1.5, ls="--")

plt.tight_layout()
plt.savefig('report_assets/fig_er_diagram.png', dpi=300, bbox_inches='tight')
plt.close()

# 5. SLA Engine Flowchart
fig = plt.figure(figsize=(9, 6.5), dpi=300)
ax = fig.add_subplot(111)
ax.axis('off')
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)

ax.text(50, 96, "Automated 48-Hour SLA Escalation Daemon Logic", fontsize=13, fontweight='bold', ha='center', color='#1e293b')

def draw_step(ax, x, y, w, h, text, col="#4f46e5", bg="#eef2ff"):
    ax.add_patch(patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5", ec=col, fc=bg, lw=1.5))
    ax.text(x+w/2, y+h/2, text, fontsize=8, ha='center', va='center', color='#1e293b')

draw_step(ax, 35, 84, 30, 7, "Start SLA Daemon (Interval: 5 min)", "#059669", "#d1fae5")
ax.annotate('', xy=(50, 77), xytext=(50, 84), arrowprops=dict(arrowstyle="->", color="#1e293b", lw=1.5))

draw_step(ax, 28, 68, 44, 9, "Query DB for Complaints WHERE\nstatus IN ('PENDING', 'IN_PROGRESS')\nAND sla_due_at <= NOW() AND is_escalated = 0", "#2563eb", "#dbeafe")
ax.annotate('', xy=(50, 58), xytext=(50, 68), arrowprops=dict(arrowstyle="->", color="#1e293b", lw=1.5))

# Diamond Decision
diamond = patches.Polygon([[50, 58], [72, 48], [50, 38], [28, 48]], closed=True, ec="#d97706", fc="#fef3c7", lw=1.5)
ax.add_patch(diamond)
ax.text(50, 48, "Overdue Complaints\nFound (Count > 0)?", fontsize=8, fontweight='bold', ha='center', va='center', color='#92400e')

# No branch
ax.plot([28, 15, 15, 35], [48, 48, 87, 87], color="#64748b", lw=1.5)
ax.annotate('', xy=(35, 87), xytext=(15, 87), arrowprops=dict(arrowstyle="->", color="#64748b", lw=1.5))
ax.text(18, 51, "NO (Sleep 5 min)", fontsize=7.5, color="#64748b")

# Yes branch
ax.annotate('', xy=(50, 28), xytext=(50, 38), arrowprops=dict(arrowstyle="->", color="#dc2626", lw=1.5))
ax.text(52, 33, "YES (Iterate Tickets)", fontsize=7.5, color="#dc2626", fontweight='bold')

draw_step(ax, 25, 17, 50, 11, "For Each Ticket:\n1. UPDATE complaints SET status='ESCALATED', is_escalated=1\n2. INSERT INTO audit_logs (AUTO_ESCALATED_SLA)\n3. Trigger Real-Time Notification to Admin Portal", "#dc2626", "#fee2e2")
ax.annotate('', xy=(50, 8), xytext=(50, 17), arrowprops=dict(arrowstyle="->", color="#1e293b", lw=1.5))

draw_step(ax, 35, 2, 30, 6, "Log Results & Await Next Iteration", "#059669", "#d1fae5")

plt.tight_layout()
plt.savefig('report_assets/fig_sla_flowchart.png', dpi=300, bbox_inches='tight')
plt.close()

# 6. Analytics Visual Chart
fig = plt.figure(figsize=(10, 5), dpi=300)
# Subplot 1: Department Volume
ax1 = fig.add_subplot(121)
depts = ['ITS', 'Facilities', 'Academic', 'Finance', 'Student Aff.']
resolved = [12, 18, 14, 9, 7]
in_prog = [4, 5, 2, 3, 2]
escalated = [1, 2, 0, 1, 0]

ax1.bar(depts, resolved, label='Resolved', color='#10b981')
ax1.bar(depts, in_prog, bottom=resolved, label='In Progress', color='#6366f1')
bottom_esc = [r + p for r, p in zip(resolved, in_prog)]
ax1.bar(depts, escalated, bottom=bottom_esc, label='Escalated (SLA)', color='#f43f5e')
ax1.set_title("Complaint Volume by Department", fontsize=10, fontweight='bold')
ax1.set_ylabel("Ticket Count", fontsize=9)
ax1.legend(loc='upper right', fontsize=8)
ax1.tick_params(axis='x', rotation=30, labelsize=8)

# Subplot 2: Satisfaction Score
ax2 = fig.add_subplot(122)
labels = ['5 Stars (Exceptional)', '4 Stars (Satisfied)', '3 Stars (Neutral)', '2 Stars (Slow)', '1 Star (Unresolved)']
counts = [38, 22, 5, 2, 1]
colors = ['#10b981', '#34d399', '#fbbf24', '#f87171', '#ef4444']
ax2.pie(counts, labels=labels, autopct='%1.1f%%', colors=colors, startangle=140, textprops={'fontsize': 8})
ax2.set_title("Student Satisfaction Distribution\n(Benchmark: 88.2% Positive >= 80% Target)", fontsize=10, fontweight='bold')

plt.tight_layout()
plt.savefig('report_assets/fig_analytics_charts.png', dpi=300, bbox_inches='tight')
plt.close()

print("All technical diagram figures successfully generated in report_assets/!")
