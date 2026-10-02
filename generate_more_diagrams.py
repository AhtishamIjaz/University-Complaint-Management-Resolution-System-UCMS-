import matplotlib.pyplot as plt
import matplotlib.patches as patches

# 7. Docker Multi-Stage Topology Diagram
fig = plt.figure(figsize=(10, 5), dpi=300)
ax = fig.add_subplot(111)
ax.axis('off')
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)

ax.text(50, 94, "UCMS - Multi-Stage Production Docker Build & Runtime Topology", fontsize=12, fontweight='bold', ha='center', color='#1e293b')

# Stage 1: Build Frontend
s1 = patches.FancyBboxPatch((5, 45), 40, 42, boxstyle="round,pad=0.8", ec="#4f46e5", fc="#eef2ff", lw=1.5)
ax.add_patch(s1)
ax.text(25, 82, "Stage 1: Client Builder (node:20-alpine)", fontsize=9, fontweight='bold', ha='center', color='#3730a3')
ax.text(25, 75, "1. COPY client/package*.json", fontsize=7.5, ha='center', color='#475569')
ax.text(25, 68, "2. RUN npm install", fontsize=7.5, ha='center', color='#475569')
ax.text(25, 61, "3. COPY client/ source code", fontsize=7.5, ha='center', color='#475569')
ax.text(25, 54, "4. RUN npm run build\n--> /app/client/dist (Compiled SPA)", fontsize=7.5, ha='center', color='#1e293b', fontweight='bold')

# Stage 2: Runtime Container
s2 = patches.FancyBboxPatch((55, 10), 40, 77, boxstyle="round,pad=0.8", ec="#059669", fc="#ecfdf5", lw=1.5)
ax.add_patch(s2)
ax.text(75, 82, "Stage 2: Unified Runtime Container", fontsize=9, fontweight='bold', ha='center', color='#065f46')
ax.text(75, 75, "1. FROM node:20-alpine", fontsize=7.5, ha='center', color='#475569')
ax.text(75, 68, "2. apk add python3 make g++ (SQLite)", fontsize=7.5, ha='center', color='#475569')
ax.text(75, 61, "3. COPY server/package*.json & install", fontsize=7.5, ha='center', color='#475569')
ax.text(75, 54, "4. COPY server/ source code", fontsize=7.5, ha='center', color='#475569')

# Transfer arrow
ax.annotate('', xy=(55, 46), xytext=(45, 54), arrowprops=dict(arrowstyle="->", color="#4f46e5", lw=2, connectionstyle="arc3,rad=-0.1"))
ax.text(50, 52, "COPY /dist\n--> public/", fontsize=7.5, color='#4f46e5', fontweight='bold', ha='center')

ax.text(75, 46, "5. COPY --from=client-builder\n   /app/client/dist --> /app/server/public", fontsize=7, ha='center', color='#065f46', fontweight='bold')
ax.text(75, 36, "6. EXPOSE 5000", fontsize=7.5, ha='center', color='#475569')
ax.text(75, 28, "7. VOLUME: /app/server/uploads\n   (Evidence documents & photos)", fontsize=7, ha='center', color='#475569')
ax.text(75, 18, "8. CMD [\"npm\", \"start\"]\n   Serves API + React SPA on port 5000", fontsize=7.5, ha='center', color='#065f46', fontweight='bold')

plt.tight_layout()
plt.savefig('report_assets/fig_docker_topology.png', dpi=300, bbox_inches='tight')
plt.close()

# 8. Sequence Diagram: Complaint Lifecycle & SLA Escalation
fig = plt.figure(figsize=(10, 6.5), dpi=300)
ax = fig.add_subplot(111)
ax.axis('off')
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)

ax.text(50, 96, "UML Sequence Diagram - Complaint Submission & SLA Escalation", fontsize=12, fontweight='bold', ha='center', color='#1e293b')

# Lifelines
actors = [("Student", 12), ("React Client", 35), ("Express API", 58), ("SQLite DB", 80), ("SLA Daemon", 93)]
for name, x in actors:
    ax.add_patch(patches.FancyBboxPatch((x-6, 88), 12, 5, boxstyle="round,pad=0.2", ec="#475569", fc="#f1f5f9", lw=1))
    ax.text(x, 90.5, name, fontsize=7.5, fontweight='bold', ha='center', va='center')
    ax.plot([x, x], [88, 8], color="#94a3b8", lw=1, ls="--")

# Step 1: Submit Form
ax.annotate('', xy=(35, 80), xytext=(12, 80), arrowprops=dict(arrowstyle="->", color="#1e293b", lw=1.2))
ax.text(23.5, 81.5, "1. fillGrievanceForm(data, proof)", fontsize=7, ha='center')

# Step 2: POST /api/complaints
ax.annotate('', xy=(58, 73), xytext=(35, 73), arrowprops=dict(arrowstyle="->", color="#1e293b", lw=1.2))
ax.text(46.5, 74.5, "2. POST /api/complaints (Bearer JWT)", fontsize=7, ha='center')

# Step 3: Insert DB
ax.annotate('', xy=(80, 66), xytext=(58, 66), arrowprops=dict(arrowstyle="->", color="#1e293b", lw=1.2))
ax.text(69, 67.5, "3. INSERT INTO complaints (SLA=NOW+48h)", fontsize=7, ha='center')

# Step 4: Return Ticket #
ax.annotate('', xy=(35, 59), xytext=(58, 59), arrowprops=dict(arrowstyle="->", color="#059669", lw=1, ls="--"))
ax.text(46.5, 60.5, "4. 201 Created (UCMS-2026-XXXX)", fontsize=7, ha='center', color="#059669")

# Step 5: Render Stepper
ax.annotate('', xy=(12, 52), xytext=(35, 52), arrowprops=dict(arrowstyle="->", color="#059669", lw=1, ls="--"))
ax.text(23.5, 53.5, "5. displayTimelineStepper(PENDING)", fontsize=7, ha='center', color="#059669")

# Step 6: 48h Passes & Daemon Checks
ax.plot([5, 95], [45, 45], color="#e2e8f0", lw=1)
ax.text(50, 46, "--- 48 Hours Elapses Without Department Resolution ---", fontsize=7.5, color="#dc2626", fontstyle="italic", ha="center")

ax.annotate('', xy=(80, 38), xytext=(93, 38), arrowprops=dict(arrowstyle="->", color="#dc2626", lw=1.2))
ax.text(86.5, 39.5, "6. checkAndEscalateTickets()", fontsize=6.5, ha='center', color="#dc2626")

ax.annotate('', xy=(80, 30), xytext=(93, 30), arrowprops=dict(arrowstyle="->", color="#dc2626", lw=1.2))
ax.text(86.5, 31.5, "7. UPDATE status='ESCALATED'", fontsize=6.5, ha='center', color="#dc2626")

ax.annotate('', xy=(80, 22), xytext=(93, 22), arrowprops=dict(arrowstyle="->", color="#dc2626", lw=1.2))
ax.text(86.5, 23.5, "8. INSERT INTO audit_logs", fontsize=6.5, ha='center', color="#dc2626")

ax.annotate('', xy=(35, 14), xytext=(58, 14), arrowprops=dict(arrowstyle="->", color="#dc2626", lw=1, ls="--"))
ax.text(46.5, 15.5, "9. broadcastSLAAlert(ticket_id)", fontsize=7, ha='center', color="#dc2626")

plt.tight_layout()
plt.savefig('report_assets/fig_sequence_complaint.png', dpi=300, bbox_inches='tight')
plt.close()

# 9. Context Level DFD (Level 0 DFD)
fig = plt.figure(figsize=(10, 5), dpi=300)
ax = fig.add_subplot(111)
ax.axis('off')
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)

ax.text(50, 94, "UCMS - Context-Level Data Flow Diagram (Level 0 DFD)", fontsize=13, fontweight='bold', ha='center', color='#1e293b')

# Central Process (Circle)
circle = patches.Circle((50, 50), 16, ec="#2563eb", fc="#eff6ff", lw=2)
ax.add_patch(circle)
ax.text(50, 52, "0.0\nUniversity Complaint\nManagement System\n(UCMS)", fontsize=8.5, fontweight='bold', ha='center', va='center', color='#1e40af')

# External Entities (Rectangles)
# Student
ax.add_patch(patches.Rectangle((5, 42), 16, 16, ec="#4f46e5", fc="#f8fafc", lw=1.5))
ax.text(13, 50, "Student\nComplainant", fontsize=8.5, fontweight='bold', ha='center', va='center', color='#1e293b')

# Staff
ax.add_patch(patches.Rectangle((79, 65), 16, 16, ec="#059669", fc="#f8fafc", lw=1.5))
ax.text(87, 73, "Department\nStaff Officer", fontsize=8.5, fontweight='bold', ha='center', va='center', color='#1e293b')

# Admin
ax.add_patch(patches.Rectangle((79, 19), 16, 16, ec="#d97706", fc="#f8fafc", lw=1.5))
ax.text(87, 27, "Central University\nAdministration", fontsize=8.5, fontweight='bold', ha='center', va='center', color='#1e293b')

# Data Flows
# Student to System
ax.annotate('', xy=(34, 54), xytext=(21, 54), arrowprops=dict(arrowstyle="->", color="#4f46e5", lw=1.2))
ax.text(27.5, 57, "Grievances, Proofs,\nFeedback Ratings", fontsize=6.5, ha='center', color="#4f46e5")

# System to Student
ax.annotate('', xy=(21, 46), xytext=(34, 46), arrowprops=dict(arrowstyle="->", color="#4f46e5", lw=1.2))
ax.text(27.5, 41, "Ticket Receipts,\nLive Status Alerts", fontsize=6.5, ha='center', color="#4f46e5")

# Staff to System
ax.annotate('', xy=(66, 68), xytext=(79, 68), arrowprops=dict(arrowstyle="->", color="#059669", lw=1.2))
ax.text(72.5, 71, "Status Updates,\nResolution Notes", fontsize=6.5, ha='center', color="#059669")

# System to Staff
ax.annotate('', xy=(79, 61), xytext=(66, 61), arrowprops=dict(arrowstyle="->", color="#059669", lw=1.2))
ax.text(72.5, 56, "Routed Queue,\nClarification Queries", fontsize=6.5, ha='center', color="#059669")

# System to Admin
ax.annotate('', xy=(79, 33), xytext=(66, 33), arrowprops=dict(arrowstyle="->", color="#d97706", lw=1.2))
ax.text(72.5, 36, "SLA Escalation Alerts,\nBI Analytics Metrics", fontsize=6.5, ha='center', color="#d97706")

# Admin to System
ax.annotate('', xy=(66, 25), xytext=(79, 25), arrowprops=dict(arrowstyle="->", color="#d97706", lw=1.2))
ax.text(72.5, 20, "Reassignment Orders,\nPolicy & User Controls", fontsize=6.5, ha='center', color="#d97706")

plt.tight_layout()
plt.savefig('report_assets/fig_dfd_level0.png', dpi=300, bbox_inches='tight')
plt.close()

print("Secondary diagrams generated successfully!")
