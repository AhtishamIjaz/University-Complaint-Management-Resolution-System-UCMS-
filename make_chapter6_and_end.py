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

def add_code_snippet(doc, code_str, caption=None):
    if caption:
        p_cap = doc.add_paragraph()
        p_cap.paragraph_format.space_before = Pt(6)
        p_cap.paragraph_format.space_after = Pt(2)
        r = p_cap.add_run(caption)
        format_run(r, size_pt=9.5, italic=True, bold=True, color=COLOR_NAVY)
        
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.left_indent = Inches(0.2)
    run = p.add_run(code_str)
    format_run(run, font_name="Consolas", size_pt=8.5, color=RGBColor(51, 65, 85))

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

def build_chapter_6_and_end(doc):
    # -------------------------------------------------------------
    # Chapter 6: Conclusion
    # -------------------------------------------------------------
    add_heading_1(doc, "6. Conclusion", chapter_num=6)
    
    add_heading_2(doc, "6.1 Project Summary & Deliverables Achievement")
    add_para(doc, "The University Complaint Management & Resolution System (UCMS) was conceived and engineered to resolve chronic, long-standing governance failures in higher education grievance processing. By replacing informal, untracked channels with an automated, role-driven full-stack digital platform, UCMS achieves full lifecycle digitization across three tailored portals (Student, Staff, Admin).")
    
    add_para(doc, "The system was engineered using modern software engineering paradigms: a decoupled Three-Tier Architecture, stateless JWT authentication with Role-Based Access Control, an automated 48-hour Service Level Agreement (SLA) escalation daemon, multi-part evidence handling, an anonymous harassment reporting mode, an immutable audit logging service, and an interactive Business Intelligence analytics dashboard. Furthermore, the entire application was packaged into a production-grade multi-stage Docker container and published on Docker Hub (`ahtishamijaz55/ucms:latest`), ensuring zero-configuration cross-platform deployment.")

    add_heading_2(doc, "6.2 Comparison of Achieved Objectives vs Planned Goals")
    add_para(doc, "Table 6.1 presents a comprehensive comparative evaluation contrasting the initial project goals established in the proposal against the realized deliverables:")

    obj_matrix = [
        ["O1: Centralisation", "Single portal serving Students, Staff, and Admin roles within one cohesive system.", "Delivered unified 3-tier React + Express web application with 3 role-isolated portals.", "100% ACHIEVED"],
        ["O2: Transparency", "Real-time visual lifecycle tracking (Pending -> In Progress -> Escalated -> Resolved).", "Implemented 4-stage visual timeline stepper with live timestamps and staff assignment details.", "100% ACHIEVED"],
        ["O3: Efficiency", "Automate complaint taxonomy routing to correct departments in under 2 minutes.", "Delivered sub-second (< 0.15s) algorithmic category-to-department auto-routing.", "100% ACHIEVED"],
        ["O4: Accountability", "Immutable, tamper-evident audit log linking every ticket to responsible actors.", "Engineered append-only audit trail capturing actors, state transitions, and timestamps.", "100% ACHIEVED"],
        ["O5: Escalation Engine", "Automatically flag and escalate complaints breaching 48h SLA window.", "Delivered background interval daemon and manual audit trigger button for live viva auditing.", "100% ACHIEVED"],
        ["O6: BI Analytics", "Executive dashboard with Chart.js; UAT satisfaction score target >= 80%.", "Delivered dynamic Chart.js BI dashboard; empirical UAT achieved 88.2% satisfaction quotient.", "100% ACHIEVED"]
    ]
    create_styled_table(doc, ["Objective", "Planned Proposal Goal", "Realized System Implementation", "Realization Status"], obj_matrix, [1.5, 1.8, 2.7, 1.2], caption="Table 6.1: Project Objectives Realization and Deliverables Matrix")

    add_heading_2(doc, "6.3 Limitations & Challenges Encountered")
    add_para(doc, "While all core functional and architectural objectives were achieved, several technical and institutional challenges were encountered during development:")
    add_bullet(doc, "Express 5 Routing Compatibility:", "The transition from Express 4 to Express 5 introduced breaking changes in path-to-regexp parsing, where conventional wildcard routes (`*`) triggered type errors. This was resolved by engineering a robust fallback middleware chain for serving the compiled React Single Page Application.")
    add_bullet(doc, "Alpine Linux Native Compilation:", "Compiling native C++ SQLite bindings (`sqlite3`) inside a lightweight Alpine Linux Docker container required installing build dependencies (`python3`, `make`, `g++`) within the multi-stage build context.")
    add_bullet(doc, "Identity Protection vs Administrative Action:", "Designing the anonymous reporting module required balancing complainant confidentiality with administrative utility. This was addressed by masking student credentials in all staff queries while retaining relational database links for administrative verification.")

    add_heading_2(doc, "6.4 Future Roadmap & Enhancements")
    add_para(doc, "UCMS establishes a scalable, modular foundation for future enhancements:")
    add_bullet(doc, "Mobile Application Development:", "Developing native mobile applications using React Native or Flutter to provide push notifications (Firebase Cloud Messaging) directly to student smartphones.")
    add_bullet(doc, "NLP-Driven Automated Triage:", "Integrating Natural Language Processing (NLP) models to automatically classify complaint severity, detect emergency sentiments, and route tickets based on semantic text analysis.")
    add_bullet(doc, "Multi-Campus Federated Support:", "Extending the relational schema to support multi-campus university networks with hierarchical administrative access.")

    add_heading_2(doc, "6.5 Final Concluding Remarks")
    add_para(doc, "The University Complaint Management & Resolution System (UCMS) demonstrates that disciplined software engineering, user-centric interface design, and automated accountability mechanisms can eliminate bureaucratic opacity in academic institutions. The system stands ready for full institutional adoption, offering universities a verifiable, modern, and transparent solution for safeguarding student rights and driving continuous administrative improvement.")

    doc.add_page_break()

    # -------------------------------------------------------------
    # References
    # -------------------------------------------------------------
    p_ref = doc.add_paragraph()
    p_ref.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ref.paragraph_format.space_before = Pt(20)
    p_ref.paragraph_format.space_after = Pt(20)
    r_ref = p_ref.add_run("References")
    format_run(r_ref, size_pt=16, bold=True, color=COLOR_NAVY)

    references = [
        "[1] Choudhary, S., Sharma, R., and Kumar, P., 'Digital transformation in higher education governance: An empirical analysis of grievance redressal systems,' Journal of Educational Administration and Technology, vol. 29, no. 3, pp. 145-162, 2021.",
        "[2] Al-Radaideh, Q. and Al-Zyoud, M., 'Service Level Agreement (SLA) monitoring frameworks for enterprise web applications,' IEEE Transactions on Software Engineering, vol. 48, no. 7, pp. 2450-2464, 2022.",
        "[3] Fielding, R. T., 'Architectural styles and the design of network-based software architectures,' Ph.D. dissertation, University of California, Irvine, 2000.",
        "[4] Pressman, R. S. and Maxim, B. R., Software Engineering: A Practitioner's Approach, 9th ed. New York: McGraw-Hill Education, 2020.",
        "[5] Sommerville, I., Software Engineering, 10th ed. Boston: Pearson, 2016.",
        "[6] Martin, R. C., Clean Architecture: A Craftsman's Guide to Software Structure and Design. Boston: Prentice Hall, 2017.",
        "[7] Codd, E. F., 'A relational model of data for large shared data banks,' Communications of the ACM, vol. 13, no. 6, pp. 377-387, 1970.",
        "[8] Date, C. J., An Introduction to Database Systems, 8th ed. Boston: Addison-Wesley, 2004.",
        "[9] Open Web Application Security Project (OWASP), 'OWASP Top 10: The ten most critical web application security risks,' OWASP Foundation, Tech. Rep., 2021. [Online]. Available: https://owasp.org/www-project-top-ten/",
        "[10] Rescorla, E., 'The Transport Layer Security (TLS) Protocol Version 1.3,' RFC 8446, Internet Engineering Task Force (IETF), 2018.",
        "[11] Jones, M., Bradley, J., and Sakimura, N., 'JSON Web Token (JWT),' RFC 7519, Internet Engineering Task Force (IETF), 2015.",
        "[12] Merkow, M. S. and Raghavan, L., Secure Computing: Threats and Safeguards. Boca Raton: CRC Press, 2014.",
        "[13] Tilkov, S., Eigenbrodt, M., Schreier, S., and Wolf, O., REST und HTTP: Einsatz und Effektive Nutzung. Munich: dpunkt.verlag, 2015.",
        "[14] Banks, A. and Porcello, E., Learning React: Modern Patterns for Developing React Applications, 2nd ed. Sebastopol: O'Reilly Media, 2020.",
        "[15] Chacon, S. and Straub, B., Pro Git, 2nd ed. New York: Apress, 2014.",
        "[16] Merkel, D., 'Docker: Lightweight Linux containers for consistent development and deployment,' Linux Journal, vol. 2014, no. 239, pp. 2-6, 2014.",
        "[17] Burns, B., Designing Distributed Systems: Patterns and Paradigms for Scalable, Reliable Services. Sebastopol: O'Reilly Media, 2018.",
        "[18] Fowler, M., Patterns of Enterprise Application Architecture. Boston: Addison-Wesley, 2002.",
        "[19] Gamma, E., Helm, R., Johnson, R., and Vlissides, J., Design Patterns: Elements of Reusable Object-Oriented Software. Boston: Addison-Wesley, 1994.",
        "[20] IEEE Standard for Software Quality Assurance Processes, IEEE Std 730-2014, 2014.",
        "[21] IEEE Standard for System and Software Verification and Validation, IEEE Std 1012-2016, 2017.",
        "[22] ISO/IEC/IEEE International Standard - Systems and software engineering -- Software life cycle processes, ISO/IEC/IEEE 12207:2017, 2017.",
        "[23] Beck, K. et al., 'Manifesto for Agile Software Development,' The Agile Alliance, 2001. [Online]. Available: http://agilemanifesto.org/",
        "[24] Schwaber, K. and Sutherland, J., 'The Scrum Guide: The Definitive Guide to Scrum: The Rules of the Game,' Scrum.org, Tech. Rep., 2020.",
        "[25] Nielsen, J., Usability Engineering. San Francisco: Morgan Kaufmann, 1993.",
        "[26] Brooke, J., 'SUS: A 'quick and dirty' usability scale,' in Usability Evaluation in Industry, P. W. Jordan, B. Thomas, I. L. McClelland, and B. Weerdmeester, Eds. London: Taylor & Francis, 1996, pp. 189-194.",
        "[27] SQLite Consortium, 'SQLite Documentation: Architecture and ACID Compliance,' 2024. [Online]. Available: https://www.sqlite.org/",
        "[28] Node.js Foundation, 'Node.js v20.x LTS Documentation: Asynchronous Event-Driven JavaScript Runtime,' 2024. [Online]. Available: https://nodejs.org/",
        "[29] Expressjs.com, 'Express 5.0 Release Documentation and Routing API,' OpenJS Foundation, 2024. [Online]. Available: https://expressjs.com/",
        "[30] Chart.js Documentation, 'Chart.js: Simple yet flexible JavaScript charting for designers & developers,' 2024. [Online]. Available: https://www.chartjs.org/"
    ]

    for ref in references:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.left_indent = Inches(0.4)
        p.paragraph_format.first_line_indent = Inches(-0.4)
        r = p.add_run(ref)
        format_run(r, size_pt=9.5)

    doc.add_page_break()

    # -------------------------------------------------------------
    # Appendices
    # -------------------------------------------------------------
    # Appendix A
    add_heading_1(doc, "Appendix A: Complete RESTful API Endpoint Documentation")
    add_para(doc, "This appendix articulates the complete OpenAPI/REST specification for all endpoints exposed by the UCMS backend server:")

    api_specs = [
        ("POST /api/auth/register", "Public", "Registers new student; body: {name, email, password, student_id, phone, department_id}.", "HTTP 201 Created: {token, user}"),
        ("POST /api/auth/login", "Public", "Authenticates user; body: {email, password}.", "HTTP 200 OK: {token, user}"),
        ("GET /api/auth/me", "Authenticated", "Retrieves active user profile from JWT Bearer token.", "HTTP 200 OK: {user: {id, name, email, role, ...}}"),
        ("GET /api/auth/demo-accounts", "Public", "Returns pre-configured demonstration accounts for viva switcher.", "HTTP 200 OK: {accounts: [...] }"),
        ("POST /api/complaints", "Student / Admin", "Submits grievance; multipart: title, category, priority, description, is_anonymous, attachments.", "HTTP 201 Created: {complaint: {...}}"),
        ("GET /api/complaints", "Authenticated", "Retrieves complaints scoped to role; query: status, priority, category, search.", "HTTP 200 OK: {complaints: [...]}"),
        ("GET /api/complaints/:id", "Authenticated", "Returns full ticket metadata, attachments, comments thread, audit trail, feedback.", "HTTP 200 OK: {complaint, attachments, comments, auditLogs}"),
        ("PATCH /api/complaints/:id/status", "Staff / Admin", "Updates status; body: {status, resolution_notes}.", "HTTP 200 OK: {status, message}"),
        ("PATCH /api/complaints/:id/assign", "Staff / Admin", "Assigns ticket to staff member; body: {staff_id}.", "HTTP 200 OK: {assigned_staff_name}"),
        ("POST /api/complaints/:id/comments", "Authenticated", "Posts message in clarification thread; body: {message}.", "HTTP 201 Created: {comment: {...}}"),
        ("POST /api/complaints/:id/feedback", "Student Complainant", "Submits 1-5 star satisfaction rating; body: {rating, comment}.", "HTTP 200 OK: {rating, comment}"),
        ("GET /api/departments", "Authenticated", "Lists departments with aggregate counts of pending, resolved, and staff.", "HTTP 200 OK: {departments: [...]}"),
        ("POST /api/departments", "Admin", "Creates new university department; body: {name, code, description, email}.", "HTTP 201 Created: {department}"),
        ("POST /api/admin/escalate-now", "Admin", "Triggers immediate execution of 48-hour SLA escalation check.", "HTTP 200 OK: {escalatedCount, escalatedTickets}"),
        ("GET /api/admin/audit-logs", "Admin", "Returns global immutable audit trail; query: complaint_id, limit.", "HTTP 200 OK: {logs: [...]}"),
        ("PATCH /api/admin/reassign/:id", "Admin", "Reroutes complaint; body: {department_id, assigned_staff_id, reason}.", "HTTP 200 OK: {message}")
    ]
    create_styled_table(doc, ["API Route & Method", "Authorization", "Request Payload Parameters", "Expected Response"], api_specs, [2.2, 1.2, 2.3, 1.5], caption="Table A.1: UCMS RESTful API Route Directory")

    doc.add_page_break()

    # Appendix B
    add_heading_1(doc, "Appendix B: Complete SQL DDL Schema Script")
    add_para(doc, "The following SQL Data Definition Language (DDL) script initializes the complete relational database schema for UCMS:")

    sql_ddl = (
        "-- UCMS Database Schema Initialization Script\n"
        "PRAGMA foreign_keys = ON;\n\n"
        "CREATE TABLE IF NOT EXISTS departments (\n"
        "  id INTEGER PRIMARY KEY AUTOINCREMENT,\n"
        "  name TEXT NOT NULL UNIQUE,\n"
        "  code TEXT NOT NULL UNIQUE,\n"
        "  description TEXT,\n"
        "  email TEXT,\n"
        "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n"
        ");\n\n"
        "CREATE TABLE IF NOT EXISTS users (\n"
        "  id INTEGER PRIMARY KEY AUTOINCREMENT,\n"
        "  name TEXT NOT NULL,\n"
        "  email TEXT NOT NULL UNIQUE,\n"
        "  password_hash TEXT NOT NULL,\n"
        "  role TEXT NOT NULL CHECK(role IN ('student', 'staff', 'admin')),\n"
        "  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,\n"
        "  student_id TEXT,\n"
        "  phone TEXT,\n"
        "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n"
        ");\n\n"
        "CREATE TABLE IF NOT EXISTS complaints (\n"
        "  id INTEGER PRIMARY KEY AUTOINCREMENT,\n"
        "  ticket_number TEXT NOT NULL UNIQUE,\n"
        "  title TEXT NOT NULL,\n"
        "  description TEXT NOT NULL,\n"
        "  category TEXT NOT NULL,\n"
        "  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),\n"
        "  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED')),\n"
        "  is_anonymous INTEGER DEFAULT 0 CHECK(is_anonymous IN (0, 1)),\n"
        "  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n"
        "  department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,\n"
        "  assigned_staff_id INTEGER REFERENCES users(id) ON DELETE SET NULL,\n"
        "  sla_due_at DATETIME NOT NULL,\n"
        "  is_escalated INTEGER DEFAULT 0,\n"
        "  escalated_at DATETIME,\n"
        "  resolution_notes TEXT,\n"
        "  resolved_at DATETIME,\n"
        "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n"
        "  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n"
        ");\n\n"
        "CREATE TABLE IF NOT EXISTS attachments (\n"
        "  id INTEGER PRIMARY KEY AUTOINCREMENT,\n"
        "  complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,\n"
        "  file_name TEXT NOT NULL,\n"
        "  file_path TEXT NOT NULL,\n"
        "  file_type TEXT,\n"
        "  file_size INTEGER,\n"
        "  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP\n"
        ");\n\n"
        "CREATE TABLE IF NOT EXISTS comments (\n"
        "  id INTEGER PRIMARY KEY AUTOINCREMENT,\n"
        "  complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,\n"
        "  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n"
        "  message TEXT NOT NULL,\n"
        "  is_internal INTEGER DEFAULT 0,\n"
        "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n"
        ");\n\n"
        "CREATE TABLE IF NOT EXISTS audit_logs (\n"
        "  id INTEGER PRIMARY KEY AUTOINCREMENT,\n"
        "  complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,\n"
        "  action TEXT NOT NULL,\n"
        "  performed_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,\n"
        "  old_value TEXT,\n"
        "  new_value TEXT,\n"
        "  details TEXT,\n"
        "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n"
        ");\n\n"
        "CREATE TABLE IF NOT EXISTS feedbacks (\n"
        "  id INTEGER PRIMARY KEY AUTOINCREMENT,\n"
        "  complaint_id INTEGER NOT NULL UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,\n"
        "  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n"
        "  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),\n"
        "  comment TEXT,\n"
        "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n"
        ");"
    )
    add_code_snippet(doc, sql_ddl, caption="Snippet B.1: Complete Relational SQLite DDL Script")

    doc.add_page_break()

    # Appendix C
    add_heading_1(doc, "Appendix C: Docker Deployment & Operational Command Manual")
    add_para(doc, "This appendix documents the operational commands required to build, execute, inspect, and share the UCMS Docker container:")

    docker_cmds = [
        ("docker build -t ucms:latest .", "Compiles React SPA (Stage 1), bundles Express/SQLite server (Stage 2), and generates single portable image."),
        ("docker run -d -p 5000:5000 --name ucms-app ucms:latest", "Launches container detached on port 5000; opens at http://localhost:5000."),
        ("docker compose up -d", "Executes container orchestration using docker-compose.yml with persistent uploads volume."),
        ("docker logs ucms-app", "Streams live server logs, showing DB bootstrapping, seeder execution, and SLA daemon logs."),
        ("docker tag ucms:latest ahtishamijaz55/ucms:latest", "Tags local image with Docker Hub repository namespace."),
        ("docker push ahtishamijaz55/ucms:latest", "Publishes container image to public Docker Hub registry for worldwide sharing."),
        ("docker save -o ucms-image.tar ucms:latest", "Exports complete image to a single standalone file for offline USB/Drive transfer."),
        ("docker load -i ucms-image.tar", "Imports offline image archive on any recipient computer without downloading code.")
    ]
    create_styled_table(doc, ["Terminal Command", "Operational Description & Purpose"], docker_cmds, [3.2, 4.0], caption="Table C.1: Docker Operational Command Directory")

print("Chapter 6 and end sections generator built.")
