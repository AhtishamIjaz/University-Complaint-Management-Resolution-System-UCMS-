import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
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

def add_heading_centered(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(20)
    p.paragraph_format.space_after = Pt(18)
    run = p.add_run(text)
    format_run(run, size_pt=16, bold=True, color=COLOR_NAVY)
    return p

def add_toc_line(doc, title, page_str, bold=False, indent=0):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(1.5)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.left_indent = Inches(indent)
    
    # Title
    r_title = p.add_run(title)
    format_run(r_title, size_pt=10.5, bold=bold, color=COLOR_TEXT)
    
    # Leader dots
    dots_count = max(4, 90 - len(title) - int(indent*12))
    dots_str = " " + ("." * dots_count) + " "
    r_dots = p.add_run(dots_str)
    format_run(r_dots, size_pt=9, color=RGBColor(148, 163, 184))
    
    # Page
    r_page = p.add_run(page_str)
    format_run(r_page, size_pt=10, bold=bold, color=COLOR_NAVY)
    return p

def build_preliminary_pages(doc):
    # -------------------------------------------------------------
    # PAGE 8: Abstract (Template Page 8, Roman 'i')
    # -------------------------------------------------------------
    add_heading_centered(doc, "Abstract")
    
    abstract_paras = [
        "Higher education institutions handle hundreds of student and administrative grievances each semester, spanning academic disputes, campus facility maintenance breakdowns, fee accounting discrepancies, information technology failures, and sensitive interpersonal harassment concerns. Despite their operational diversity, these grievances share an imperative requirement: an equitable, transparent, traceable, and time-bound resolution mechanism. Conventional university complaint handling depends on fragmented manual channels—including informal verbal reports, ad-hoc emails directed to shared departmental mailboxes, and physical paper suggestion boxes. These legacy mechanisms suffer from severe visibility deficits, zero auditability, inter-departmental forwarding bottlenecks, unmonitored resolution delays, and a total absence of closed-loop feedback, fostering a culture of under-reporting and unresolved systemic failure.",
        "The University Complaint Management & Resolution System (UCMS) addresses these critical governance deficits through a role-driven, full-stack digital platform engineered for higher education institutions. UCMS establishes three tailored portals governed by strict Role-Based Access Control (RBAC): the Student Portal, the Department/Staff Portal, and the Central Administration Portal. The platform automates the complete lifecycle of a grievance: (1) multi-category submission with evidence uploads and an anonymous reporting mode for harassment complaints; (2) automated sub-second rule-based routing to responsible departments; (3) real-time 4-stage visual progress tracking (Pending -> In-Progress -> Escalated -> Resolved) with interactive clarification message threads; (4) an automated 48-hour Service Level Agreement (SLA) escalation daemon that programmatically flags overdue grievances to central management; (5) an append-only, tamper-evident audit ledger; and (6) a Business Intelligence (BI) analytics dashboard computing departmental workloads, mean time to resolution, and student satisfaction quotients.",
        "The system was engineered using a decoupled architecture comprising a responsive React 18 and Vite frontend styled with Tailwind CSS, an asynchronous Node.js and Express RESTful API, and an embedded ACID-compliant SQLite relational database. To ensure portable, zero-configuration cross-platform deployment, the entire ecosystem was containerized into a multi-stage Docker image and verified across all roles. Empirical User Acceptance Testing (UAT) conducted across diverse student and administrative cohorts achieved an overall satisfaction quotient of 88.2%, surpassing the institutional benchmark of >= 80%. This dissertation documents the comprehensive analysis, requirements specification, architectural design, implementation, and empirical verification of the UCMS platform."
    ]
    
    for text in abstract_paras:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(12)
        r = p.add_run(text)
        format_run(r, size_pt=11.5)
        
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # PAGE 9: Contents (Table of Contents) (Template Page 9, Roman 'ii')
    # -------------------------------------------------------------
    add_heading_centered(doc, "Contents")
    
    toc_data = [
        ("Declaration", "v", False, 0),
        ("Certificate of Approval", "iv", False, 0),
        ("Acknowledgments", "vi", False, 0),
        ("Dedication", "vii", False, 0),
        ("Abstract", "i", False, 0),
        ("List of Figures", "iii", False, 0),
        ("List of Tables", "iv", False, 0),
        ("List of Abbreviations and Symbols", "v", False, 0),
        ("Chapter 1: Introduction", "1", True, 0),
        ("1.1 Project Overview & Context", "1", False, 0.2),
        ("1.2 Problem Statement & Institutional Motivation", "2", False, 0.2),
        ("1.3 Project Objectives (O1 to O6)", "4", False, 0.2),
        ("1.4 Project Scope & Delimitations", "6", False, 0.2),
        ("1.5 Significance & Expected Stakeholder Benefits", "7", False, 0.2),
        ("1.6 Report Organization", "8", False, 0.2),
        ("Chapter 2: Requirements & Literature Review", "9", True, 0),
        ("2.1 Existing University Grievance Mechanisms", "9", False, 0.2),
        ("2.2 Critical Literature & Comparative Analysis", "11", False, 0.2),
        ("2.3 Gap Analysis in Current Systems", "13", False, 0.2),
        ("2.4 User Requirements Specification", "15", False, 0.2),
        ("2.5 Functional Requirements (FR1 to FR15)", "17", False, 0.2),
        ("2.6 Non-Functional Requirements (NFR1 to NFR8)", "20", False, 0.2),
        ("2.7 Hardware & Software Requirements Specification", "22", False, 0.2),
        ("Chapter 3: Design & Methodology", "24", True, 0),
        ("3.1 Software Development Methodology (Agile Scrum)", "24", False, 0.2),
        ("3.2 System Architecture Design (Three-Tier Topology)", "26", False, 0.2),
        ("3.3 Unified Modeling Language (UML) Diagrams", "28", False, 0.2),
        ("    3.3.1 UML Use Case Diagram & Actor Profiles", "28", False, 0.4),
        ("    3.3.2 Detailed Use Case Scenario Specifications", "30", False, 0.4),
        ("    3.3.3 Sequence Diagrams (Submission & Escalation)", "33", False, 0.4),
        ("    3.3.4 Data Flow Diagrams (Context Level 0 & Level 1)", "36", False, 0.4),
        ("    3.3.5 State Machine Diagram (Ticket State Machine)", "39", False, 0.4),
        ("3.4 Database Design & Data Architecture", "41", False, 0.2),
        ("    3.4.1 Entity-Relationship (ER) Relational Schema", "41", False, 0.4),
        ("    3.4.2 Comprehensive Data Dictionary (All 7 Tables)", "43", False, 0.4),
        ("    3.4.3 Database Normalization Proofs (1NF to BCNF)", "46", False, 0.4),
        ("3.5 Core Engine Mathematical & Algorithmic Designs", "48", False, 0.2),
        ("    3.5.1 Automated 48-Hour SLA Escalation Daemon Algorithm", "48", False, 0.4),
        ("    3.5.2 Role-Based Access Control (RBAC) Security Architecture", "50", False, 0.4),
        ("    3.5.3 Anonymous Grievance & Complainant Identity Masking", "51", False, 0.4),
        ("    3.5.4 Immutable Audit Logging Ledger Model", "52", False, 0.4),
        ("    3.5.5 Business Intelligence & Satisfaction Scoring Formulas", "53", False, 0.4),
        ("Chapter 4: Implementation & System Results", "55", True, 0),
        ("4.1 Development Toolchain & Execution Environment", "55", False, 0.2),
        ("4.2 Backend REST API Implementation", "57", False, 0.2),
        ("4.3 Frontend Single-Page Application Implementation", "60", False, 0.2),
        ("4.4 Multi-Stage Docker Containerization Engineering", "63", False, 0.2),
        ("4.5 User Interface Walkthrough & Operational Portals", "66", False, 0.2),
        ("4.6 Implementation Results & KPI Target Evaluation", "71", False, 0.2),
        ("Chapter 5: Testing & Quality Assurance", "73", True, 0),
        ("5.1 Testing Strategy & Quality Philosophy", "73", False, 0.2),
        ("5.2 Unit & Component Testing", "74", False, 0.2),
        ("5.3 Automated Integration API Verification Suite", "75", False, 0.2),
        ("5.4 Comprehensive Functional Test Cases (TC01 to TC25)", "77", False, 0.2),
        ("5.5 Security & Vulnerability Assessment (OWASP Top 10)", "82", False, 0.2),
        ("5.6 User Acceptance Testing (UAT) & Survey Analysis", "84", False, 0.2),
        ("Chapter 6: Conclusion & Future Scope", "87", True, 0),
        ("6.1 Project Summary & Deliverables Achievement", "87", False, 0.2),
        ("6.2 Comparison of Achieved Deliverables vs Planned Goals", "88", False, 0.2),
        ("6.3 Technical Challenges & Practical Limitations", "89", False, 0.2),
        ("6.4 Future Roadmap & Enhancements", "90", False, 0.2),
        ("6.5 Final Concluding Remarks", "91", False, 0.2),
        ("References", "92", True, 0),
        ("Appendix A: Complete RESTful API Endpoint Documentation", "95", True, 0),
        ("Appendix B: Complete SQL DDL Schema Script", "98", True, 0),
        ("Appendix C: Docker Deployment & Operational Command Manual", "101", True, 0)
    ]
    
    for item, pg, bld, ind in toc_data:
        add_toc_line(doc, item, pg, bold=bld, indent=ind)
        
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # PAGE 10: List of Figures (Template Page 10, Roman 'iii')
    # -------------------------------------------------------------
    add_heading_centered(doc, "List of Figures")
    
    figures_data = [
        ("Figure 1.1: High-Level Grievance Lifecycle Progression Flow", "3"),
        ("Figure 2.1: Architectural Deficits in Legacy University Complaint Channels", "10"),
        ("Figure 3.1: UCMS Three-Tier Decoupled System Architecture Overview", "27"),
        ("Figure 3.2: Unified UML Use Case Diagram for Student, Staff, and Admin", "29"),
        ("Figure 3.3: UML Sequence Diagram - Complaint Submission & SLA Escalation", "34"),
        ("Figure 3.4: Context-Level Data Flow Diagram (Level 0 DFD)", "37"),
        ("Figure 3.5: Detailed Level 1 Data Flow Diagram of UCMS Engine", "38"),
        ("Figure 3.6: Complaint Lifecycle State Machine Diagram", "40"),
        ("Figure 3.7: Entity-Relationship (ER) Relational Schema Diagram", "42"),
        ("Figure 3.8: Automated 48-Hour SLA Escalation Daemon Logic Flowchart", "49"),
        ("Figure 3.9: Cryptographic Immutable Audit Logging Model", "52"),
        ("Figure 4.1: Multi-Stage Production Docker Build & Runtime Topology", "64"),
        ("Figure 4.2: Student Grievance Filing Interface with Anonymous Toggle", "67"),
        ("Figure 4.3: Real-Time Timeline Stepper & Complaint Details Thread", "68"),
        ("Figure 4.4: Department Staff Queue Inbox & Resolution Controls", "69"),
        ("Figure 4.5: Central Administration Oversight Portal & SLA Trigger", "70"),
        ("Figure 4.6: Institutional Analytics Dashboard & Satisfaction Distribution", "72"),
        ("Figure 5.1: Automated Integration Test Execution Suite Verification", "76"),
        ("Figure 5.2: Empirical Student Satisfaction Distribution Chart (UAT)", "85")
    ]
    
    for cap, pg in figures_data:
        add_toc_line(doc, cap, pg, bold=False, indent=0)
        
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # PAGE 11: List of Tables (Template Page 11, Roman 'iv')
    # -------------------------------------------------------------
    add_heading_centered(doc, "List of Tables")
    
    tables_data = [
        ("Table 1.1: Measurable Criteria for Project Objectives (O1 to O6)", "5"),
        ("Table 2.1: Comparative Matrix of University Complaint Systems", "12"),
        ("Table 2.2: User Stakeholder Requirements Summary Matrix", "16"),
        ("Table 2.3: Detailed Functional Requirements Specification (FR1 - FR15)", "18"),
        ("Table 2.4: Non-Functional Requirements & Performance Benchmarks", "21"),
        ("Table 2.5: Hardware and Software Specification Requirements", "23"),
        ("Table 3.1: Agile Scrum Sprint Schedule and Incremental Deliverables", "25"),
        ("Table 3.2: Use Case Scenario UC-01 - Student Complaint Submission", "30"),
        ("Table 3.3: Use Case Scenario UC-04 - Department Ticket Resolution", "31"),
        ("Table 3.4: Use Case Scenario UC-06 - Automated SLA Escalation", "32"),
        ("Table 3.5: Data Dictionary - Users Table Definition", "43"),
        ("Table 3.6: Data Dictionary - Departments Table Definition", "44"),
        ("Table 3.7: Data Dictionary - Complaints Table Definition", "44"),
        ("Table 3.8: Data Dictionary - Attachments Table Definition", "45"),
        ("Table 3.9: Data Dictionary - Comments Table Definition", "45"),
        ("Table 3.10: Data Dictionary - Audit Logs Table Definition", "45"),
        ("Table 3.11: Data Dictionary - Feedbacks Table Definition", "46"),
        ("Table 4.1: Technical Stack Specifications and Framework Versions", "56"),
        ("Table 4.2: Pre-Configured Demonstration Personas for Viva Evaluation", "66"),
        ("Table 4.3: Realized Key Performance Indicators vs Target Benchmarks", "71"),
        ("Table 5.1: Comprehensive Functional Test Execution Matrix (TC01 - TC25)", "78"),
        ("Table 5.2: Security Vulnerability Assessment & Mitigation Matrix (OWASP)", "83"),
        ("Table 5.3: User Acceptance Testing (UAT) Demographic Profile", "84"),
        ("Table 5.4: Empirical Satisfaction Survey Score Breakdown", "86"),
        ("Table 6.1: Project Objectives Realization and Deliverables Matrix", "88")
    ]
    
    for cap, pg in tables_data:
        add_toc_line(doc, cap, pg, bold=False, indent=0)
        
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # PAGE 12: List of Abbreviations and Symbols (Template Page 12, Roman 'v')
    # -------------------------------------------------------------
    add_heading_centered(doc, "List of Abbreviations and Symbols")
    
    abbreviations = [
        ("UCMS", "University Complaint Management & Resolution System"),
        ("SLA", "Service Level Agreement (Institutional 48-Hour Threshold)"),
        ("RBAC", "Role-Based Access Control"),
        ("JWT", "JSON Web Token"),
        ("API", "Application Programming Interface"),
        ("REST", "Representational State Transfer"),
        ("SPA", "Single Page Application"),
        ("BI", "Business Intelligence"),
        ("UAT", "User Acceptance Testing"),
        ("UI/UX", "User Interface / User Experience"),
        ("DOM", "Document Object Model"),
        ("CRUD", "Create, Read, Update, Delete"),
        ("DFD", "Data Flow Diagram"),
        ("ERD", "Entity-Relationship Diagram"),
        ("UML", "Unified Modeling Language"),
        ("SQL", "Structured Query Language"),
        ("ACID", "Atomicity, Consistency, Isolation, Durability"),
        ("OWASP", "Open Web Application Security Project"),
        ("XSS", "Cross-Site Scripting"),
        ("CSRF", "Cross-Site Request Forgery"),
        ("HMR", "Hot Module Replacement"),
        ("JSON", "JavaScript Object Notation"),
        ("MIME", "Multipurpose Internet Mail Extensions"),
        ("SHA", "Secure Hash Algorithm"),
        ("NFR", "Non-Functional Requirement"),
        ("FR", "Functional Requirement"),
        ("MTTR", "Mean Time to Resolution"),
        ("ITS", "Information Technology Services"),
        ("FCM", "Facilities & Campus Maintenance"),
        ("AAE", "Academic Affairs & Examinations"),
        ("FIN", "Finance & Student Accounts"),
        ("SAW", "Student Affairs & Welfare")
    ]
    
    # Table of abbreviations
    table = doc.add_table(rows=len(abbreviations) + 1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    # Header
    hdr = table.rows[0].cells
    hdr[0].text = "Abbreviation / Symbol"
    hdr[1].text = "Expanded Definition / Meaning"
    hdr[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.LEFT
    hdr[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.LEFT
    
    for cell in hdr:
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="1E293B"/>')
        cell._tc.get_or_add_tcPr().append(shd)
        for r in cell.paragraphs[0].runs:
            format_run(r, size_pt=10, bold=True, color=RGBColor(255, 255, 255))
            
    for idx, (abbr, full) in enumerate(abbreviations):
        row = table.rows[idx + 1].cells
        row[0].text = abbr
        row[1].text = full
        bg = "F8FAFC" if idx % 2 == 1 else "FFFFFF"
        for c in row:
            shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{bg}"/>')
            c._tc.get_or_add_tcPr().append(shd)
            p = c.paragraphs[0]
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            format_run(p.runs[0], size_pt=9.5)
        format_run(row[0].paragraphs[0].runs[0], size_pt=9.5, bold=True, color=COLOR_NAVY)
        
    for row in table.rows:
        row.cells[0].width = Inches(2.2)
        row.cells[1].width = Inches(4.5)
        
    doc.add_page_break()

print("Preliminary pages generator built.")
