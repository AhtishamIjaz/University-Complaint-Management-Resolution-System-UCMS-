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
                format_run(r, size_pt=9, color=COLOR_TEXT)

    if col_widths:
        for row in table.rows:
            for idx, width in enumerate(col_widths):
                row.cells[idx].width = Inches(width)

    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(0)
    p_sp.paragraph_format.space_after = Pt(8)
    return table

def build_chapter_1(doc):
    add_heading_1(doc, "1. Introduction", chapter_num=1)
    
    add_heading_2(doc, "1.1 Project Overview & Context")
    add_para(doc, "Higher education institutions operate as highly complex socio-technical ecosystems, catering to diverse populations comprising thousands of undergraduate and postgraduate students, faculty members, researchers, and administrative personnel. Throughout every academic semester, universities inevitably process extensive volumes of grievances. These complaints span a multi-dimensional spectrum, encompassing academic evaluation disputes, examination grading discrepancies, classroom and laboratory infrastructure failures, hostel accommodation and sanitation issues, campus connectivity outages, fee accounting anomalies, and sensitive interpersonal harassment or disciplinary concerns.")
    
    add_para(doc, "Despite their operational diversity, all grievances share an uncompromising institutional imperative: a just, equitable, transparent, and time-bound resolution workflow. In contemporary university environments, the speed and fairness with which student grievances are resolved directly dictate institutional reputation, academic accreditation standing, student retention rates, and campus psychological safety. When an institution lacks an efficient, auditable grievance mechanism, unresolved grievances accumulate, giving rise to widespread cynicism, under-reporting of critical safety incidents, and administrative paralysis.")
    
    add_para(doc, "The University Complaint Management & Resolution System (UCMS) is conceptualized and engineered to address this acute institutional challenge. UCMS is an institutional-grade, full-stack web platform that digitises, streamlines, and automates the complete lifecycle of university grievances. By establishing three purpose-built portals—the Student Portal, the Department/Staff Portal, and the Central Administration Portal—governed by Role-Based Access Control (RBAC), UCMS enforces accountability, introduces algorithmic routing, triggers automated 48-hour Service Level Agreement (SLA) escalations, and surfaces actionable intelligence through interactive analytics dashboards.")

    add_heading_2(doc, "1.2 Problem Statement & Institutional Motivation")
    add_para(doc, "Most contemporary universities still depend heavily on antiquated, informal complaint-handling methodologies. These typically comprise three primary channels: verbal complaints lodged with course lecturers or departmental clerks, ad-hoc emails dispatched to generic departmental inboxes, and physical wooden suggestion boxes installed outside administrative buildings. Empirical investigation across higher education institutions reveals four catastrophic structural failures inherent in these traditional mechanisms:")
    
    add_bullet(doc, "Severe Lack of Complainant Visibility:", "Students submitting grievances through email or suggestion boxes receive no tracking number, no automated acknowledgement, and no visibility into whether their complaint was reviewed or discarded. Complainants are forced into repeated physical visits to departmental offices, creating severe anxiety and disillusionment with institutional governance.")
    add_bullet(doc, "Excessive Response Latency & Bottlenecks:", "When an email arrives in a generic departmental inbox, it is frequently overlooked, buried beneath academic circulars, or bounced manually between departments without clear ownership. A complaint regarding laboratory air conditioning may take three weeks merely to be forwarded to Facilities Management, leaving students to endure substandard learning environments.")
    add_bullet(doc, "Complete Absence of Institutional Accountability:", "Because manual channels lack immutable logging, there is no verifiable trail identifying which specific staff member received a grievance, what diagnostic steps were performed, or why delays occurred. Administrative officers can disclaim responsibility without fear of consequence, fostering an environment where chronic departmental underperformance goes unpenalized.")
    add_bullet(doc, "Invisibility of Systemic Grievance Patterns:", "University executive management operates blind to macro-level institutional trends. When individual complaints reside in disconnected email inboxes or paper files, management cannot detect recurring patterns—such as repeated plumbing breakdowns in a specific hostel wing or recurring grading anomalies under a particular faculty. Consequently, root-cause interventions are never formulated.")

    add_para(doc, "Beyond resolving administrative dysfunction, this project is motivated by rigorous technical objectives. Designing and constructing UCMS encompasses the full breadth of software engineering competencies: stateless JSON Web Token (JWT) authentication, Role-Based Access Control (RBAC) security enforcement, relational database normalization, background daemon scheduling for SLA monitoring, multipart binary file processing, and interactive data visualization.")

    add_heading_2(doc, "1.3 Project Objectives (O1 to O6)")
    add_para(doc, "To decisively resolve the aforementioned problems, the project establishes six measurable, technically verifiable objectives. Each objective directly targets one of the institutional failure modes identified above:")

    objectives_data = [
        ("O1", "Centralisation", "Engineer a unified full-stack web application hosting three dedicated role-based portals (Student, Staff, Admin).", "All three user roles execute their respective core workflows within one cohesive web application governed by JWT RBAC."),
        ("O2", "Transparency", "Implement real-time visual status tracking (Pending -> In-Progress -> Escalated -> Resolved) accessible to the complainant at all times.", "Complainant views live visual 4-step timeline stepper with exact stage timestamps and assigned staff details."),
        ("O3", "Efficiency", "Automate complaint taxonomy categorization and sub-second rule-based routing to the responsible university department.", "System automatically assigns complaints to the correct department within under 2 seconds of submission, eliminating manual triage."),
        ("O4", "Accountability", "Construct an append-only, tamper-evident audit ledger recording every ticket transition, staff assignment, and status alteration.", "Immutable audit trail records actor identity, role, old value, new value, timestamp, and narrative rationale for every event."),
        ("O5", "Escalation Engine", "Develop an automated background daemon enforcing a configurable 48-hour Service Level Agreement (SLA) resolution window.", "Complaints not progressed to resolution within 48 hours are automatically flagged, promoted to 'ESCALATED', and alerted to Admin."),
        ("O6", "Business Intelligence", "Deploy an interactive executive analytics dashboard visualizing department volumes, resolution durations, and satisfaction scores.", "Dashboard renders dynamic Chart.js charts; empirical User Acceptance Testing achieves satisfaction quotient >= 80%.")
    ]
    
    create_styled_table(doc, 
        ["Obj #", "Dimension", "Technical Description", "Measurable Success Criterion"], 
        objectives_data, 
        [0.8, 1.3, 2.5, 2.4], 
        caption="Table 1.1: Measurable Criteria for Project Objectives (O1 to O6)"
    )

    add_heading_2(doc, "1.4 Project Scope & Delimitations")
    add_para(doc, "Defining the precise operational scope of UCMS is essential for ensuring successful delivery within the designated academic timeframe. The scope encompasses functional boundaries, user categories, and institutional interfaces:")
    
    add_heading_3(doc, "1.4.1 In-Scope Deliverables")
    add_bullet(doc, "User Authentication & RBAC:", "Stateless JWT-based registration and login system with cryptographic password hashing (bcrypt) and role authorization guards for Students, Staff, and Administrators.")
    add_bullet(doc, "Grievance Submission Engine:", "Structured complaint filing interface supporting category taxonomy, priority levels (Low, Medium, High, Urgent), rich markdown descriptions, and multi-file evidence uploads (images, PDFs, documents up to 10MB).")
    add_bullet(doc, "Anonymous Filing Mode:", "Identity masking module enabling students reporting sensitive harassment or disciplinary violations to submit complaints with full anonymity protection from departmental views.")
    add_bullet(doc, "Department Resolution Queue:", "Organized department inbox enabling authorized personnel to filter tickets by status and priority, self-claim unassigned complaints, post internal/external clarification notes, and submit formal resolution remarks.")
    add_bullet(doc, "Automated 48-Hour SLA Daemon:", "Background interval daemon that evaluates ticket deadlines every 5 minutes and executes automated state escalations to Central Administration upon breach.")
    add_bullet(doc, "Central Administration Oversight:", "Master complaints ledger, cross-department ticket rerouting modal, department management, and staff account provisioning.")
    add_bullet(doc, "Business Intelligence Analytics:", "Interactive graphical visualization suite rendering departmental workload distribution, resolution status breakdown, resolution velocity (hours), and 1-to-5 star student satisfaction survey ratings.")
    add_bullet(doc, "Containerized Deployment:", "Production-ready multi-stage Docker image and Docker Compose specification packaging frontend and backend into a single portable container.")

    add_heading_3(doc, "1.4.2 Project Delimitations")
    add_bullet(doc, "Financial Gateway Integration:", "While UCMS handles tuition fee dispute complaints, it does not process financial payments directly; refunds are resolved administratively with bank credit advice documentation.")
    add_bullet(doc, "SMS Telephony Gateways:", "The primary communication channel is the integrated web message thread; external GSM SMS dispatch is excluded to avoid telecom gateway subscription dependencies.")
    add_bullet(doc, "Hardware Biometrics:", "Authentication relies on institutional credentials; biometric physical turnstile verification is outside the current project scope.")

    add_heading_2(doc, "1.5 Significance & Expected Stakeholder Benefits")
    add_para(doc, "The implementation of UCMS delivers transformative operational and psychological value across all higher education stakeholder groups:")
    
    add_bullet(doc, "Benefits for Students:", "Eliminates anxiety and procedural distrust by providing instant ticket tracking numbers, real-time visual progress steppers, and transparent communication. Harassment victims gain psychological safety through anonymous submission modes that protect them from academic retaliation.")
    add_bullet(doc, "Benefits for Department Staff:", "Replaces chaotic email inboxes with an orderly, prioritized ticket queue. Staff can request specific evidentiary clarifications directly within the complaint context and document formal resolution justifications.")
    add_bullet(doc, "Benefits for University Management:", "Surfaces empirical, macro-level visibility into institutional bottlenecks through interactive BI charts. Administrators can identify underperforming units, audit compliance history, and formulate data-driven capital investments.")

    add_heading_2(doc, "1.6 Report Organization")
    add_para(doc, "The remainder of this dissertation is organized systematically into five subsequent chapters:")
    add_bullet(doc, "Chapter 2 (Requirements & Literature Review):", "Examines legacy university grievance workflows, presents a critical comparative literature review across six contemporary systems, establishes the gap analysis, and details comprehensive functional and non-functional requirements.")
    add_bullet(doc, "Chapter 3 (Design & Methodology):", "Presents the Agile Scrum development methodology, three-tier architectural design, comprehensive UML diagrams (Use Case, Sequence, State Machine, DFDs), relational database schema with normalization proofs, and core mathematical algorithms.")
    add_bullet(doc, "Chapter 4 (Implementation & Results):", "Details the development toolchain, backend Express REST API architecture, React 18 single-page application implementation, multi-stage Docker containerization, user interface screen walkthroughs, and realized KPI benchmarks.")
    add_bullet(doc, "Chapter 5 (Testing & Quality Assurance):", "Documents testing methodologies, unit/component tests, automated API integration suites, an exhaustive 25-case functional test log, OWASP security vulnerability assessments, and empirical User Acceptance Testing survey evaluations.")
    add_bullet(doc, "Chapter 6 (Conclusion & Future Work):", "Summarizes project achievements, compares realized deliverables against planned goals, reflects on limitations encountered, and articulates an architectural roadmap for future enhancements.")

    doc.add_page_break()

print("Chapter 1 generator built.")
