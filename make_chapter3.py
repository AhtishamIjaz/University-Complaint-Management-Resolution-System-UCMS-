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

def add_image_figure(doc, img_path, caption_text, width=Inches(5.5)):
    import os
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(10)
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture(img_path, width=width)
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(2)
        p_cap.paragraph_format.space_after = Pt(12)
        p_cap.paragraph_format.keep_with_next = False
        r_cap = p_cap.add_run(caption_text)
        format_run(r_cap, size_pt=10, italic=True, bold=True, color=COLOR_MUTED)

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

def build_chapter_3(doc):
    add_heading_1(doc, "3. Design/Methodology", chapter_num=3)
    
    add_heading_2(doc, "3.1 Software Development Methodology (Agile Scrum)")
    add_para(doc, "The development of UCMS followed the Agile Scrum methodology, chosen for its iterative flexibility, rapid feedback incorporation, and structured milestone discipline. The 14-week lifecycle was structured into four distinct sprints, each culminating in a working, testable software increment reviewed by the academic supervisor:")

    sprint_rows = [
        ["Phase 1: Requirements & Architectural Design", "Weeks 1 - 3", "System architecture diagram, relational database ER design, complete UML specifications, UI wireframes, and supervisor sign-off."],
        ["Phase 2: Core Development & Student Portal", "Weeks 4 - 7", "JWT authentication service, grievance submission form with Multer file uploads, anonymous reporting toggle, and real-time visual tracking stepper."],
        ["Phase 3: Staff Portal & SLA Escalation Engine", "Weeks 8 - 11", "Department queue inbox, status update state machine, clarification chat thread, 48-hour automated SLA escalation daemon, and immutable audit logging service."],
        ["Phase 4: Analytics BI, Testing & Containerization", "Weeks 12 - 14", "Chart.js analytics dashboard, satisfaction rating survey, automated integration test suite, multi-stage Docker containerization, and final dissertation documentation."]
    ]
    
    create_styled_table(doc, ["Development Phase / Sprint", "Timeline", "Key Engineering Deliverables & Milestones"], sprint_rows, [2.3, 1.2, 3.7], caption="Table 3.1: Agile Scrum Sprint Schedule and Incremental Deliverables")

    add_heading_2(doc, "3.2 System Architecture Design (Three-Tier Topology)")
    add_para(doc, "UCMS implements a classical, decoupled Three-Tier Architecture comprising the Presentation Tier, Application Logic Tier, and Data Persistence Tier. Figure 3.1 illustrates the architectural topology and inter-tier communication protocols:")

    add_image_figure(doc, 'report_assets/fig_arch_overview.png', "Figure 3.1: UCMS Three-Tier Decoupled System Architecture Overview", width=Inches(6.2))

    add_para(doc, "The Presentation Tier is constructed as a modern Single Page Application (SPA) utilizing React 18, Vite, and Tailwind CSS. The client communicates with the server strictly via asynchronous HTTP REST calls carrying JSON payloads and Bearer JWT authorization headers. The Application Logic Tier, implemented in Node.js and Express 5, encapsulates business rules, role-based authorization guards, file upload filters, the automated SLA escalation daemon, and the audit logging engine. The Data Persistence Tier leverages an embedded SQLite relational database, providing full ACID transactional guarantees without the operational complexity or connection failure points of external database servers.")

    add_heading_2(doc, "3.3 Unified Modeling Language (UML) Diagrams")
    add_para(doc, "To provide formal object-oriented and behavioral design specifications, comprehensive UML models were constructed covering system use cases, dynamic sequence interactions, data flows, and state machine lifecycles.")

    add_heading_3(doc, "3.3.1 UML Use Case Diagram & Actor Profiles")
    add_para(doc, "Figure 3.2 depicts the unified UML Use Case Diagram illustrating the interactions between the three primary actors—Student, Department Staff, and Central Administrator—and the system boundary:")

    add_image_figure(doc, 'report_assets/fig_usecase_diagram.png', "Figure 3.2: Unified UML Use Case Diagram for Student, Staff, and Admin", width=Inches(6.2))

    add_bullet(doc, "Student Actor (Complainant):", "Initiates grievances, uploads evidentiary attachments, toggles anonymous filing, monitors resolution progress on the timeline stepper, exchanges clarification messages with staff, and submits post-resolution satisfaction ratings.")
    add_bullet(doc, "Department Staff Actor:", "Reviews department-filtered ticket queues, self-claims unassigned complaints, sends clarification inquiries to complainants, and records official resolution remarks.")
    add_bullet(doc, "Central Administrator Actor:", "Oversees university-wide grievance metrics, triggers manual SLA escalation audits, reroutes misassigned tickets, onboards departmental staff accounts, and reviews the immutable audit trail.")

    add_heading_3(doc, "3.3.2 Detailed Use Case Scenario Specifications")
    add_para(doc, "Tables 3.2 through 3.4 present formal tabular specifications for three critical use cases governing the core operational workflows of the system:")

    uc1_data = [
        ["Use Case ID / Name", "UC-01: Submit Grievance with Evidence & Anonymity"],
        ["Primary Actor", "Registered Student (Complainant)"],
        ["Preconditions", "Student must be authenticated with an active session token (JWT)."],
        ["Trigger", "Student navigates to 'File Complaint' tab and clicks submit."],
        ["Main Success Scenario", "1. Student inputs title, category, priority, and rich description.\n2. Student optionally attaches up to 5 evidence files (images/PDFs).\n3. Student optionally checks 'File anonymously' toggle.\n4. System validates form fields and validates attachment MIME types.\n5. System automatically maps category to responsible department ID.\n6. System calculates 48-hour SLA deadline (NOW + 48 hours).\n7. System persists complaint, generates unique ticket number (UCMS-YYYY-XXXX), saves files, and appends audit log.\n8. System displays confirmation receipt with direct link to tracker."],
        ["Extensions / Exceptions", "4a. File exceeds 10MB or invalid format -> Display error toast, reject upload.\n4b. Required fields empty -> Highlight missing inputs, prevent submission."]
    ]
    create_styled_table(doc, ["Specification Attribute", "Use Case Details"], uc1_data, [2.0, 5.2], caption="Table 3.2: Use Case Scenario UC-01 - Student Complaint Submission")

    uc4_data = [
        ["Use Case ID / Name", "UC-04: Department Staff Complaint Resolution"],
        ["Primary Actor", "Authorized Department Staff Officer"],
        ["Preconditions", "Staff member must be authenticated and assigned to the routed department."],
        ["Trigger", "Staff member selects ticket from department queue and changes status to 'RESOLVED'."],
        ["Main Success Scenario", "1. Staff opens complaint detail view and reviews student description & evidence.\n2. Staff clicks status dropdown and selects 'RESOLVED'.\n3. System renders required 'Resolution Remarks' textarea.\n4. Staff enters detailed corrective action narrative and submits.\n5. System updates complaints record: status='RESOLVED', resolution_notes=text, resolved_at=NOW.\n6. System appends STATUS_UPDATED event into immutable audit trail.\n7. System unlocks 1-to-5 star satisfaction survey for the student."],
        ["Extensions / Exceptions", "4a. Resolution remarks left empty -> System halts update with validation alert."]
    ]
    create_styled_table(doc, ["Specification Attribute", "Use Case Details"], uc4_data, [2.0, 5.2], caption="Table 3.3: Use Case Scenario UC-04 - Department Ticket Resolution")

    uc6_data = [
        ["Use Case ID / Name", "UC-06: Automated 48-Hour SLA Escalation Trigger"],
        ["Primary Actor", "Automated Background Daemon (or Central Administrator)"],
        ["Preconditions", "Complaint must be in PENDING or IN_PROGRESS state with sla_due_at <= NOW and is_escalated=0."],
        ["Trigger", "Background timer fires (every 5 mins) or Admin clicks '⚡ Trigger SLA Check Now'."],
        ["Main Success Scenario", "1. Escalation daemon executes SQL query for overdue unresolved tickets.\n2. System identifies matching complaints that breached 48h SLA window.\n3. For each ticket: UPDATE complaints SET status='ESCALATED', is_escalated=1, escalated_at=NOW.\n4. System appends AUTO_ESCALATED_SLA record into immutable audit log.\n5. System broadcasts real-time alert to Central Administration dashboard."],
        ["Extensions / Exceptions", "2a. Zero overdue tickets found -> Daemon logs zero-count and sleeps for 5 mins."]
    ]
    create_styled_table(doc, ["Specification Attribute", "Use Case Details"], uc6_data, [2.0, 5.2], caption="Table 3.4: Use Case Scenario UC-06 - Automated SLA Escalation")

    add_heading_3(doc, "3.3.3 Sequence Diagrams (Submission & Escalation)")
    add_para(doc, "Figure 3.3 illustrates the dynamic sequence of asynchronous message exchanges occurring between the Complainant, React SPA Client, Express REST API, SQLite Database, and Background SLA Daemon across the complaint lifecycle:")

    add_image_figure(doc, 'report_assets/fig_sequence_complaint.png', "Figure 3.3: UML Sequence Diagram - Complaint Submission & SLA Escalation", width=Inches(6.0))

    add_heading_3(doc, "3.3.4 Data Flow Diagrams (Context Level 0 & Level 1)")
    add_para(doc, "To model information flow across system boundaries, Figure 3.4 illustrates the Context-Level (Level 0) Data Flow Diagram, highlighting external entities and primary data transformations:")

    add_image_figure(doc, 'report_assets/fig_dfd_level0.png', "Figure 3.4: Context-Level Data Flow Diagram (Level 0 DFD)", width=Inches(6.0))

    add_heading_3(doc, "3.3.5 State Machine Diagram (Ticket State Machine)")
    add_para(doc, "A complaint operates as a strictly bounded finite state machine. Figure 3.5 formalizes the permissible state transitions and trigger events governing ticket lifecycles:")

    add_image_figure(doc, 'report_assets/fig_state_machine.png', "Figure 3.5: Complaint Lifecycle State Machine Diagram", width=Inches(6.0))

    add_para(doc, "A newly filed grievance enters the PENDING state with an active 48-hour SLA countdown. When a department staff officer claims the ticket, it transitions to IN_PROGRESS. If the 48-hour SLA deadline elapses while the ticket remains in PENDING or IN_PROGRESS, the background daemon forces a transition to ESCALATED. From either IN_PROGRESS or ESCALATED, authorized staff or administrators transition the ticket to RESOLVED upon providing mandatory resolution remarks. Once resolved, the complainant can submit satisfaction feedback, after which the ticket is formally marked CLOSED.")

    add_heading_2(doc, "3.4 Database Design & Data Architecture")
    add_para(doc, "The persistence tier is architected as a relational database enforcing strict third-normal-form (3NF) compliance and referential integrity via cascade delete and foreign key constraints. Figure 3.6 presents the Entity-Relationship (ER) schema diagram:")

    add_image_figure(doc, 'report_assets/fig_er_diagram.png', "Figure 3.6: Entity-Relationship (ER) Relational Schema Diagram", width=Inches(6.2))

    add_heading_3(doc, "3.4.1 Comprehensive Data Dictionary")
    add_para(doc, "Tables 3.5 through 3.11 document the data dictionary defining the seven relational tables comprising the UCMS database:")

    # Table 3.5: Users
    u_data = [
        ["id", "INTEGER", "PRIMARY KEY, AUTOINCREMENT", "Unique internal user identifier"],
        ["name", "TEXT", "NOT NULL", "Full name of student, staff, or admin"],
        ["email", "TEXT", "NOT NULL, UNIQUE", "Institutional email address (login credential)"],
        ["password_hash", "TEXT", "NOT NULL", "One-way cryptographic bcrypt salted hash"],
        ["role", "TEXT", "NOT NULL, CHECK(role IN ('student','staff','admin'))", "Role-Based Access Control tier"],
        ["department_id", "INTEGER", "FOREIGN KEY -> departments(id) ON DELETE SET NULL", "Assigned department (for staff users)"],
        ["student_id", "TEXT", "NULLABLE", "University student registration number"],
        ["phone", "TEXT", "NULLABLE", "Contact telephone number"],
        ["created_at", "DATETIME", "DEFAULT CURRENT_TIMESTAMP", "Account provisioning timestamp"]
    ]
    create_styled_table(doc, ["Column Name", "Data Type", "Constraints", "Description"], u_data, [1.3, 1.1, 2.3, 2.5], caption="Table 3.5: Data Dictionary - Users Table Definition")

    # Table 3.6: Departments
    d_data = [
        ["id", "INTEGER", "PRIMARY KEY, AUTOINCREMENT", "Unique departmental identifier"],
        ["name", "TEXT", "NOT NULL, UNIQUE", "Official faculty or department title"],
        ["code", "TEXT", "NOT NULL, UNIQUE", "Short taxonomy code (e.g. ITS, FCM, AAE)"],
        ["description", "TEXT", "NULLABLE", "Functional scope and operational mandate"],
        ["email", "TEXT", "NULLABLE", "Official departmental contact email"],
        ["created_at", "DATETIME", "DEFAULT CURRENT_TIMESTAMP", "Department registration timestamp"]
    ]
    create_styled_table(doc, ["Column Name", "Data Type", "Constraints", "Description"], d_data, [1.3, 1.1, 2.3, 2.5], caption="Table 3.6: Data Dictionary - Departments Table Definition")

    # Table 3.7: Complaints
    c_data = [
        ["id", "INTEGER", "PRIMARY KEY, AUTOINCREMENT", "Unique complaint internal identifier"],
        ["ticket_number", "TEXT", "NOT NULL, UNIQUE", "Public formatted ticket ID ('UCMS-YYYY-XXXX')"],
        ["title", "TEXT", "NOT NULL", "Grievance subject headline"],
        ["description", "TEXT", "NOT NULL", "Comprehensive narrative problem description"],
        ["category", "TEXT", "NOT NULL", "Issue taxonomy category classification"],
        ["priority", "TEXT", "DEFAULT 'MEDIUM', CHECK(IN ('LOW','MEDIUM','HIGH','URGENT'))", "Urgency level governing resolution priority"],
        ["status", "TEXT", "DEFAULT 'PENDING', CHECK(IN ('PENDING','IN_PROGRESS',...))", "Current state machine lifecycle status"],
        ["is_anonymous", "INTEGER", "DEFAULT 0, CHECK(is_anonymous IN (0,1))", "Privacy flag masking complainant identity"],
        ["student_id", "INTEGER", "FOREIGN KEY -> users(id) ON DELETE CASCADE", "Complainant user foreign key link"],
        ["department_id", "INTEGER", "FOREIGN KEY -> departments(id) ON DELETE RESTRICT", "Responsible department foreign key link"],
        ["assigned_staff_id", "INTEGER", "FOREIGN KEY -> users(id) ON DELETE SET NULL", "Responsible staff officer handling ticket"],
        ["sla_due_at", "DATETIME", "NOT NULL", "48-Hour SLA expiration deadline timestamp"],
        ["is_escalated", "INTEGER", "DEFAULT 0", "Boolean flag indicating SLA breach escalation"],
        ["escalated_at", "DATETIME", "NULLABLE", "Timestamp when SLA daemon triggered escalation"],
        ["resolution_notes", "TEXT", "NULLABLE", "Official corrective action remarks from staff"],
        ["resolved_at", "DATETIME", "NULLABLE", "Formal ticket resolution timestamp"],
        ["created_at", "DATETIME", "DEFAULT CURRENT_TIMESTAMP", "Submission timestamp"],
        ["updated_at", "DATETIME", "DEFAULT CURRENT_TIMESTAMP", "Last modification timestamp"]
    ]
    create_styled_table(doc, ["Column Name", "Data Type", "Constraints", "Description"], c_data, [1.3, 1.1, 2.3, 2.5], caption="Table 3.7: Data Dictionary - Complaints Table Definition")

    # Table 3.8: Attachments
    at_data = [
        ["id", "INTEGER", "PRIMARY KEY, AUTOINCREMENT", "Unique attachment record identifier"],
        ["complaint_id", "INTEGER", "FOREIGN KEY -> complaints(id) ON DELETE CASCADE", "Parent complaint foreign key link"],
        ["file_name", "TEXT", "NOT NULL", "Original uploaded filename"],
        ["file_path", "TEXT", "NOT NULL", "Static relative URL path on server disk"],
        ["file_type", "TEXT", "NULLABLE", "MIME type (image/png, application/pdf)"],
        ["file_size", "INTEGER", "NULLABLE", "File magnitude in bytes"],
        ["uploaded_at", "DATETIME", "DEFAULT CURRENT_TIMESTAMP", "Upload timestamp"]
    ]
    create_styled_table(doc, ["Column Name", "Data Type", "Constraints", "Description"], at_data, [1.3, 1.1, 2.3, 2.5], caption="Table 3.8: Data Dictionary - Attachments Table Definition")

    # Table 3.9: Comments
    cm_data = [
        ["id", "INTEGER", "PRIMARY KEY, AUTOINCREMENT", "Unique comment record identifier"],
        ["complaint_id", "INTEGER", "FOREIGN KEY -> complaints(id) ON DELETE CASCADE", "Parent complaint foreign key link"],
        ["user_id", "INTEGER", "FOREIGN KEY -> users(id) ON DELETE CASCADE", "Author user foreign key link"],
        ["message", "TEXT", "NOT NULL", "Clarification message body text"],
        ["is_internal", "INTEGER", "DEFAULT 0", "Flag for internal staff-only notes"],
        ["created_at", "DATETIME", "DEFAULT CURRENT_TIMESTAMP", "Message posting timestamp"]
    ]
    create_styled_table(doc, ["Column Name", "Data Type", "Constraints", "Description"], cm_data, [1.3, 1.1, 2.3, 2.5], caption="Table 3.9: Data Dictionary - Comments Table Definition")

    # Table 3.10: Audit Logs
    au_data = [
        ["id", "INTEGER", "PRIMARY KEY, AUTOINCREMENT", "Unique immutable audit row identifier"],
        ["complaint_id", "INTEGER", "FOREIGN KEY -> complaints(id) ON DELETE CASCADE", "Associated complaint foreign key link"],
        ["action", "TEXT", "NOT NULL", "Event code (e.g. TICKET_CREATED, STATUS_UPDATED)"],
        ["performed_by_user_id", "INTEGER", "FOREIGN KEY -> users(id) ON DELETE SET NULL", "Actor ID (NULL if system automated)"],
        ["old_value", "TEXT", "NULLABLE", "Pre-transition entity state"],
        ["new_value", "TEXT", "NULLABLE", "Post-transition entity state"],
        ["details", "TEXT", "NULLABLE", "Narrative explanation of the operational event"],
        ["created_at", "DATETIME", "DEFAULT CURRENT_TIMESTAMP", "Authoritative event timestamp"]
    ]
    create_styled_table(doc, ["Column Name", "Data Type", "Constraints", "Description"], au_data, [1.3, 1.1, 2.3, 2.5], caption="Table 3.10: Data Dictionary - Audit Logs Table Definition")

    # Table 3.11: Feedbacks
    fb_data = [
        ["id", "INTEGER", "PRIMARY KEY, AUTOINCREMENT", "Unique satisfaction feedback identifier"],
        ["complaint_id", "INTEGER", "FOREIGN KEY -> complaints(id) ON DELETE CASCADE, UNIQUE", "Resolved complaint (1-to-1 link)"],
        ["student_id", "INTEGER", "FOREIGN KEY -> users(id) ON DELETE CASCADE", "Evaluating student foreign key link"],
        ["rating", "INTEGER", "NOT NULL, CHECK(rating >= 1 AND rating <= 5)", "Numerical satisfaction score (1 to 5 stars)"],
        ["comment", "TEXT", "NULLABLE", "Qualitative student assessment remarks"],
        ["created_at", "DATETIME", "DEFAULT CURRENT_TIMESTAMP", "Survey submission timestamp"]
    ]
    create_styled_table(doc, ["Column Name", "Data Type", "Constraints", "Description"], fb_data, [1.3, 1.1, 2.3, 2.5], caption="Table 3.11: Data Dictionary - Feedbacks Table Definition")

    add_heading_3(doc, "3.4.2 Database Normalization Proofs (1NF to BCNF)")
    add_para(doc, "The relational schema was subjected to formal normalization analysis to guarantee the elimination of update, insertion, and deletion anomalies:")
    
    add_bullet(doc, "First Normal Form (1NF):", "All table attributes contain only atomic, indivisible values. Multi-valued repeating groups (such as file attachments and clarification comments) are decoupled into dedicated independent relations (`attachments` and `comments`) linked via foreign keys.")
    add_bullet(doc, "Second Normal Form (2NF):", "All tables are in 1NF and every non-prime attribute is fully functionally dependent on the entire primary key. In all entities, the primary key is a single surrogate integer (`id`), eliminating any possibility of partial functional dependency.")
    add_bullet(doc, "Third Normal Form (3NF) & Boyce-Codd Normal Form (BCNF):", "All tables are in 2NF and contain zero transitive functional dependencies ($X \rightarrow Y \rightarrow Z$). Department titles and metadata are not duplicated inside the `complaints` or `users` tables; instead, normalized foreign keys (`department_id`) point to the master `departments` relation. Every functional dependency determinant is a superkey, satisfying BCNF.")

    add_heading_2(doc, "3.5 Core Engine Mathematical & Algorithmic Designs")
    add_para(doc, "UCMS incorporates five specialized algorithmic engines designed to enforce institutional governance, data security, and operational reliability:")

    add_heading_3(doc, "3.5.1 Automated 48-Hour SLA Escalation Daemon Algorithm")
    add_para(doc, "Figure 3.7 diagrams the mathematical evaluation logic executed by the background SLA escalation daemon:")

    add_image_figure(doc, 'report_assets/fig_sla_flowchart.png', "Figure 3.7: Automated 48-Hour SLA Escalation Daemon Logic Flowchart", width=Inches(5.8))

    add_para(doc, "The mathematical escalation condition evaluated every 300 seconds is formalized as:")
    add_para(doc, r"Condition: (status \in {'PENDING', 'IN_PROGRESS'}) \land (sla_due_at \le NOW) \land (is_escalated = 0)", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_para(doc, "When this predicate evaluates to true, the engine executes an atomic state transition updating the ticket status to 'ESCALATED', setting the escalation timestamp, appending an immutable audit record, and alerting Central Administration.")

    add_heading_3(doc, "3.5.2 Role-Based Access Control (RBAC) Security Architecture")
    add_para(doc, "The security subsystem operates through three synchronized authorization rings: (1) Database CHECK constraints on `users.role`; (2) Express RBAC middleware verifying JWT signatures and role claims; and (3) Dynamic React UI component rendering that removes unprivileged views from the DOM. This multi-layered defense guarantees that students cannot access staff resolution queues or alter complaint statuses.")

    add_heading_3(doc, "3.5.3 Anonymous Grievance & Complainant Identity Masking")
    add_para(doc, "To safeguard victims of harassment from academic or administrative retaliation, UCMS implements an algorithmic data sanitization serializer. While the database retains the relational foreign key linking the complaint to the student's user account (enabling the student to view their own ticket), any query executed by a staff officer or peer student intercepts the record and applies identity masking:")
    add_para(doc, r"Serializer: student_name \leftarrow 'Anonymous Complainant', student_reg_no \leftarrow 'REDACTED', student_email \leftarrow 'anonymous@ucms.edu'", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER)

    add_heading_3(doc, "3.5.4 Immutable Audit Logging Ledger Model")
    add_para(doc, "Every state modification triggers an append-only write into `audit_logs`. The database schema contains zero SQL UPDATE or DELETE routes for this table, ensuring that the chronological record of status changes, staff assignments, and SLA escalations remains cryptographically permanent and verifiable during institutional accreditation audits.")

    add_heading_3(doc, "3.5.5 Business Intelligence & Satisfaction Scoring Formulas")
    add_para(doc, "The analytics subsystem computes three primary performance quotients:")
    add_bullet(doc, "Institutional Resolution Rate (%):", r"Resolution Rate = ((N_Resolved + N_Closed) / N_Total) * 100")
    add_bullet(doc, "Mean Time to Resolution (MTTR in Hours):", r"MTTR = (1 / N_Resolved) * \sum (epoch(resolved_at_i) - epoch(created_at_i)) / 3600")
    add_bullet(doc, "Student Satisfaction Quotient (% - Target >= 80%):", r"Satisfaction Score = (N_Rating >= 4 / N_Total Feedbacks) * 100")

    doc.add_page_break()

print("Chapter 3 generator built.")
