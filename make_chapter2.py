import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

COLOR_NAVY = RGBColor(30, 41, 59)
COLOR_TEXT = RGBColor(15, 23, 42)
COLOR_MUTED = RGBColor(71, 85, 105)

def format_run(run, font_name="Times New Roman", size_pt=12, bold=False, italic=False, color=COLOR_TEXT):
    run.font.name = font_name
    run.font.size = Pt(size_pt)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color

def add_para(doc, text="", align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=0, space_after=6, line_spacing=1.5, bold=False, italic=False, size_pt=12, color=COLOR_TEXT):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing
    if text:
        run = p.add_run(text)
        format_run(run, size_pt=size_pt, bold=bold, italic=italic, color=color)
    return p

def add_heading_1(doc, text, chapter_num=None):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.keep_with_next = True
    if chapter_num:
        r_chap = p.add_run(f"Chapter {chapter_num}\n")
        format_run(r_chap, size_pt=16, bold=True, color=COLOR_NAVY)
    run = p.add_run(text)
    format_run(run, size_pt=16, bold=True, color=COLOR_NAVY)
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    format_run(run, size_pt=14, bold=True, color=COLOR_NAVY)
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    format_run(run, size_pt=12, bold=True, color=COLOR_NAVY)
    return p

def add_bullet(doc, bold_prefix, text):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.3
    r1 = p.add_run(bold_prefix)
    format_run(r1, bold=True, color=COLOR_TEXT)
    r2 = p.add_run(" " + text)
    format_run(r2, color=COLOR_TEXT)
    return p

def create_styled_table(doc, headers, rows, col_widths=None, caption=None):
    if caption:
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p_cap.paragraph_format.space_before = Pt(10)
        p_cap.paragraph_format.space_after = Pt(4)
        r_cap = p_cap.add_run(caption)
        format_run(r_cap, size_pt=10, bold=True, italic=True, color=COLOR_NAVY)

    table = doc.add_table(rows=len(rows) + 1, cols=len(headers))
    table.alignment = docx.enum.table.WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    hdr_cells = table.rows[0].cells
    for i, h_text in enumerate(headers):
        hdr_cells[i].text = h_text
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="1E293B"/>')
        hdr_cells[i]._tc.get_or_add_tcPr().append(shd)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(4)
        for r in p.runs:
            format_run(r, size_pt=9.5, bold=True, color=RGBColor(255, 255, 255))
    
    for r_idx, row_data in enumerate(rows):
        row_cells = table.rows[r_idx + 1].cells
        bg_col = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            row_cells[c_idx].text = str(val)
            shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{bg_col}"/>')
            row_cells[c_idx]._tc.get_or_add_tcPr().append(shd)
            p = row_cells[c_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.line_spacing = 1.15
            for r in p.runs:
                format_run(r, size_pt=8.5, color=COLOR_TEXT)

    if col_widths:
        for row in table.rows:
            for idx, width in enumerate(col_widths):
                row.cells[idx].width = Inches(width)

    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(0)
    p_sp.paragraph_format.space_after = Pt(8)
    return table

def build_chapter_2(doc):
    add_heading_1(doc, "2. Requirements/Literature Review", chapter_num=2)
    
    add_heading_2(doc, "2.1 Existing University Grievance Mechanisms")
    add_para(doc, "Higher education institutions across developing and developed nations have historically relied upon an assortment of ad-hoc, informal mechanisms to capture student and staff grievances. An empirical examination of institutional administrative workflows highlights four prevailing traditional approaches:")
    
    add_bullet(doc, "Physical Suggestion & Grievance Boxes:", "Wooden or metal boxes stationed in central academic corridors into which students drop handwritten notes. In practice, these boxes are opened erratically (often once per month or quarter), notes are frequently anonymous without return contact information, paper slips are susceptible to physical damage or disposal, and there exists zero mechanism to provide updates to the author.")
    add_bullet(doc, "Generic Departmental Email Inboxes:", "Departments publish general email addresses (e.g., info@university.edu or cs.dept@university.edu). While digital, these mailboxes are swamped with administrative announcements, vendor solicitations, and course queries. Grievance emails lack structured metadata (such as category, priority, or student registration numbers), cannot be programmatically tracked, and frequently remain unread for weeks.")
    add_bullet(doc, "Verbal Reporting to Academic Staff:", "Students raise concerns verbally with course lecturers or department chairpersons during office hours. While personal, this channel creates no institutional record. Staff members frequently forget verbal commitments amid heavy academic workloads, and there is no auditable paper trail should disputes escalate.")
    add_bullet(doc, "Commercial IT Service Desks (e.g., Jira, Zendesk, Freshdesk):", "Some institutions adapt corporate IT helpdesks for student complaints. However, these systems are fundamentally designed for enterprise customer support rather than academic governance. They lack role-based academic hierarchy modeling, do not provide anonymous reporting safeguards for harassment incidents, impose prohibitive recurring per-seat licensing fees, and require complex configuration that administrative staff cannot maintain.")

    add_heading_2(doc, "2.2 Critical Literature & Comparative Analysis")
    add_para(doc, "Recent scholarship in higher education management and software engineering highlights the urgent necessity of institutional digital transformation in grievance handling. Researchers (Choudhary et al., 2021; Al-Radaideh & Al-Zyoud, 2022) argue that student satisfaction is inextricably linked to the procedural transparency of institutional grievance mechanisms. When complaint resolution is perceived as opaque or biased, student trust collapses, resulting in high attrition and diminished academic performance.")
    
    add_para(doc, "To critically evaluate the state of the art, Table 2.1 presents a comprehensive comparative evaluation benchmark contrasting traditional academic channels and commercial helpdesk solutions against the University Complaint Management & Resolution System (UCMS) across ten technical dimensions:")

    matrix_headers = ["Evaluation Criteria / Dimension", "Manual Box", "Dept Email", "Jira Service", "Zendesk", "UCMS (Proposed)"]
    matrix_rows = [
        ["Centralized Web Portal (O1)", "No", "Partial", "Yes", "Yes", "Yes (Unified 3 Portals)"],
        ["Role-Based Access Control (RBAC)", "No", "No", "Yes", "Yes", "Yes (Student, Staff, Admin)"],
        ["Real-Time Timeline Stepper (O2)", "No", "No", "Partial", "Partial", "Yes (Visual 4-Stage Stepper)"],
        ["Automated Category Auto-Routing (O3)", "No", "No", "Configurable", "Configurable", "Yes (Sub-second Algorithmic)"],
        ["Automated 48h SLA Escalation (O5)", "No", "No", "Complex rule", "Complex rule", "Yes (Native Background Daemon)"],
        ["Anonymous Harassment Filing Mode", "Untracked", "No", "No", "No", "Yes (Cryptographic Masking)"],
        ["Immutable Audit Trail (O4)", "No", "No", "Partial", "Partial", "Yes (Tamper-evident SQL log)"],
        ["Contextual Clarification Chat Thread", "No", "Threaded mail", "Comment feed", "Comment feed", "Yes (Real-time Integrated)"],
        ["Integrated Satisfaction Rating (O6)", "No", "No", "Separate survey", "Separate survey", "Yes (Native 1-5★ & BI Metric)"],
        ["Zero-Config Docker Deployment", "N/A", "N/A", "No (SaaS/Cloud)", "No (SaaS/Cloud)", "Yes (Single-Command Docker)"]
    ]
    
    create_styled_table(doc, matrix_headers, matrix_rows, [1.8, 0.9, 0.9, 1.1, 1.1, 1.4], caption="Table 2.1: Comparative Matrix of University Complaint Systems")

    add_heading_2(doc, "2.3 Gap Analysis in Current Systems")
    add_para(doc, "The comparative evaluation in Table 2.1 crystallizes four pivotal architectural and functional gaps that existing academic and commercial solutions fail to bridge:")
    
    add_bullet(doc, "The Safety Gap (Absence of Anonymous Protection):", "Existing systems enforce rigid identity binding. When reporting sensitive harassment, bullying, or faculty misconduct, students fear academic retaliation (e.g., deliberate grade penalties). Existing ticketing systems either require full identity disclosure or relegate anonymous inputs to untracked suggestion boxes, leaving victims unprotected.")
    add_bullet(doc, "The Accountability Gap (Lack of SLA Escalation):", "Commercial systems treat Service Level Agreements as passive reporting metrics rather than active enforcement mechanisms. When a department ignores a student grievance, standard systems merely generate an end-of-month report. UCMS bridges this gap through an active background daemon that programmatically escalates overdue complaints directly to executive management.")
    add_bullet(doc, "The Usability & Cost Gap in Higher Education:", "Enterprise solutions (Jira, Zendesk) cost tens of thousands of dollars annually in licensing fees and require dedicated DevOps teams. Higher education institutions in developing regions require lightweight, open-source, zero-configuration architectures that can be deployed instantly on local university servers without recurring financial overhead.")
    add_bullet(doc, "The Closed-Loop Feedback Gap:", "Traditional academic channels terminate when staff decide a complaint is finished. Complainants have no formal mechanism to contest inadequate resolutions or submit satisfaction scores. UCMS introduces an mandatory satisfaction survey module that feeds institutional BI dashboards.")

    add_heading_2(doc, "2.4 User Requirements Specification")
    add_para(doc, "User requirements represent the operational expectations expressed by institutional stakeholders. Stakeholder interviews and requirements engineering workshops conducted at the outset of this project established the stakeholder matrix summarized in Table 2.2:")

    stakeholder_rows = [
        ["Complainant (Student / Faculty)", "UR-01", "Must be able to register and log in securely with university credentials."],
        ["Complainant", "UR-02", "Must be able to submit grievances with structured categories, priorities, and evidence documents."],
        ["Complainant", "UR-03", "Must be able to toggle anonymous submission mode for sensitive harassment grievances."],
        ["Complainant", "UR-04", "Must be able to track live ticket status on a visual progress stepper at all times."],
        ["Complainant", "UR-05", "Must be able to message assigned staff directly within the ticket context for clarifications."],
        ["Complainant", "UR-06", "Must be able to rate resolution quality (1 to 5 stars) once a ticket is resolved."],
        ["Department Staff Officer", "UR-07", "Must have a prioritized queue displaying only complaints routed to their department."],
        ["Department Staff Officer", "UR-08", "Must be able to claim unassigned tickets and transition status with resolution remarks."],
        ["Department Staff Officer", "UR-09", "Must receive visual warnings for complaints approaching their 48-hour SLA deadline."],
        ["Central Administrator (Dean)", "UR-10", "Must have comprehensive oversight of all grievances across all university departments."],
        ["Central Administrator", "UR-11", "Must be alerted to all tickets that breach the 48-hour SLA resolution window."],
        ["Central Administrator", "UR-12", "Must be able to reroute misassigned complaints to the appropriate department."],
        ["Central Administrator", "UR-13", "Must be able to onboard staff accounts and configure academic/operational departments."],
        ["Central Administrator", "UR-14", "Must access dynamic BI analytics visualizing volumes, MTTR, and satisfaction scores."],
        ["Institutional Auditor", "UR-15", "Must be able to inspect an immutable, append-only audit trail of all platform events."]
    ]
    
    create_styled_table(doc, ["Stakeholder Role", "Req ID", "User Requirement Statement"], stakeholder_rows, [1.8, 0.9, 4.5], caption="Table 2.2: User Stakeholder Requirements Summary Matrix")

    add_heading_2(doc, "2.5 Functional Requirements (FR1 to FR15)")
    add_para(doc, "Functional requirements define the precise algorithmic operations, input transformations, database transactions, and outputs that the UCMS software system must execute. Table 2.3 articulates the fifteen core functional requirements with rigorous technical specifications:")

    fr_data = [
        ("FR-01", "User Authentication", "System shall authenticate users using email/password, verify bcrypt hash, and issue signed JWT containing user ID, role, and department claims.", "Credentials", "JWT Bearer Token"),
        ("FR-02", "Ticket Generation", "System shall auto-generate sequential unique ticket IDs formatted as 'UCMS-YYYY-XXXX' upon successful grievance submission.", "Grievance Form", "Ticket Identifier"),
        ("FR-03", "Automated Routing", "System shall automatically map complaint category to responsible department foreign key ID within under 2 seconds.", "Category Selection", "Assigned Department"),
        ("FR-04", "Evidence Upload", "System shall validate, sanitize, and persist multi-part binary attachments (PNG, JPG, PDF, DOCX up to 10MB) in local uploads directory.", "Binary Files", "Saved File Records"),
        ("FR-05", "Anonymous Masking", "When is_anonymous=1, system shall sanitize student name/ID/email to 'Anonymous' in all staff views and audit logs while preserving DB FK.", "Anonymous Flag", "Sanitized Serializer"),
        ("FR-06", "SLA Timer Trigger", "System shall set sla_due_at timestamp to exactly 48 hours from created_at upon ticket insertion.", "Ticket Creation", "Active SLA Timestamp"),
        ("FR-07", "Role-Based Query", "System shall filter ticket queries by user role: students see own tickets, staff see department queue, admin sees all.", "User JWT Role", "Filtered Ticket Set"),
        ("FR-08", "Ticket Assignment", "System shall allow staff to claim unassigned tickets or admin to reassign, updating status to IN_PROGRESS and logging audit entry.", "Staff ID", "Assigned Staff FK"),
        ("FR-09", "Status Workflow", "System shall transition status (PENDING -> IN_PROGRESS -> RESOLVED -> CLOSED) and mandate resolution_notes upon resolution.", "Status Change Request", "Updated State Machine"),
        ("FR-10", "SLA Escalation Daemon", "Background daemon shall query overdue tickets every 5 mins; if overdue, update status='ESCALATED', is_escalated=1, and log audit event.", "Current Timestamp", "Escalated Status & Log"),
        ("FR-11", "Manual SLA Trigger", "System shall provide admin endpoint to force immediate execution of escalation check for live auditing.", "Admin Trigger", "Escalation Execution Count"),
        ("FR-12", "Clarification Messaging", "System shall support bidirectional message exchange between complainant and staff linked to complaint ID.", "Comment Payload", "Threaded Message"),
        ("FR-13", "Satisfaction Survey", "System shall accept 1-5 star rating and comment from complainant on resolved tickets, storing feedback record.", "Rating & Review", "Persisted Feedback"),
        ("FR-14", "Immutable Audit Log", "System shall append unalterable audit log entry capturing action, actor ID, old state, new state, and narrative on every event.", "Event Trigger", "Append-Only Audit Row"),
        ("FR-15", "BI Analytics Engine", "System shall aggregate complaint metrics: total, resolved, SLA compliance, MTTR hours, and satisfaction quotient.", "DB Aggregation Query", "JSON BI Dataset")
    ]
    
    create_styled_table(doc, ["FR ID", "Function Name", "Technical Processing Logic", "Input", "Output"], fr_data, [0.8, 1.4, 2.8, 1.1, 1.1], caption="Table 2.3: Detailed Functional Requirements Specification (FR1 - FR15)")

    add_heading_2(doc, "2.6 Non-Functional Requirements (NFR1 to NFR8)")
    add_para(doc, "Non-functional requirements specify the architectural qualities, security constraints, operational benchmarks, and systemic criteria that govern UCMS:")

    nfr_data = [
        ("NFR-01", "Security & Encryption", "Passcodes hashed with bcrypt (salt rounds=10); API endpoints guarded by signed JWT tokens; file uploads restricted to safe MIME types; SQL queries parameterized to eliminate SQL injection."),
        ("NFR-02", "Response Latency", "API endpoints shall respond within < 200ms under standard operational load; static frontend assets load within < 1.5 seconds."),
        ("NFR-03", "Availability & Uptime", "System designed for 99.5% uptime; background SLA daemon recovers gracefully from database locks using asynchronous SQLite retry logic."),
        ("NFR-04", "Data Integrity (ACID)", "All ticket status transitions and corresponding audit log writes execute within atomic database transactions to prevent desynchronization."),
        ("NFR-05", "Portability & Containerization", "Application shall execute identically on Windows, Linux, and macOS via multi-stage Docker container with zero host dependencies."),
        ("NFR-06", "Usability & Accessibility", "Clean responsive interface compliant with WCAG 2.1 accessibility standards; 1-click persona switcher for zero-friction evaluation."),
        ("NFR-07", "Audit Immutability", "Audit log table contains no SQL UPDATE or DELETE triggers or endpoints; records are cryptographically permanent."),
        ("NFR-08", "Scalability", "Relational schema indexed on ticket_number, status, department_id, and created_at to support up to 50,000 complaints without latency degradation.")
    ]
    
    create_styled_table(doc, ["NFR ID", "Quality Dimension", "Specification & Benchmark Target"], nfr_data, [1.0, 1.8, 4.4], caption="Table 2.4: Non-Functional Requirements & Performance Benchmarks")

    add_heading_2(doc, "2.7 Hardware & Software Requirements Specification")
    add_para(doc, "To ensure unambiguous operational readiness, Table 2.5 details the minimal and recommended technical environments required for developing, hosting, and accessing UCMS:")

    spec_data = [
        ("Client Hardware (End-User)", "Intel Core i3 / AMD Ryzen 3 or higher; 4GB RAM; Standard 1080p display; Modern web browser (Chrome, Edge, Firefox, Safari)."),
        ("Server Hardware (Host)", "Dual-Core 2.0 GHz CPU (x86_64); 4GB RAM (8GB recommended for concurrent Docker builds); 10GB available SSD storage."),
        ("Server Operating System", "Windows 10/11 (64-bit), Ubuntu Linux 22.04 LTS, or macOS Sonoma; Docker Desktop / Docker Engine installed."),
        ("Runtime & Compilers", "Node.js v20.x or v24.x LTS; npm v10.x or v11.x; Python 3.10+ (for administrative reporting utilities)."),
        ("Database Engine", "SQLite v3.45+ (embedded via sqlite3 package); ACID transaction support with Write-Ahead Logging (WAL)."),
        ("Containerization Stack", "Docker Engine v29.x+; Docker Compose v2.x+; Multi-stage Alpine Linux base image (`node:20-alpine`).")
    ]
    
    create_styled_table(doc, ["Component Tier", "Technical Specification & Requirements"], spec_data, [2.2, 5.0], caption="Table 2.5: Hardware and Software Specification Requirements")

    doc.add_page_break()

print("Chapter 2 generator built.")
