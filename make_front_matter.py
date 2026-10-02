import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

COLOR_NAVY = RGBColor(30, 41, 59)
COLOR_TEXT = RGBColor(15, 23, 42)

def format_run(run, font_name="Times New Roman", size_pt=12, bold=False, italic=False, color=COLOR_TEXT):
    run.font.name = font_name
    run.font.size = Pt(size_pt)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color

def add_centered_para(doc, text="", size_pt=12, bold=False, italic=False, space_before=0, space_after=0, color=COLOR_TEXT):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if text:
        run = p.add_run(text)
        format_run(run, size_pt=size_pt, bold=bold, italic=italic, color=color)
    return p

def build_front_matter(doc):
    logo_path = 'report_assets/university_logo.jpg'
    
    # -------------------------------------------------------------
    # PAGE 1: Outer Cover Page (Template Page 1)
    # -------------------------------------------------------------
    add_centered_para(doc, "", space_before=12)
    add_centered_para(doc, "University Complaint Management &\nResolution System (UCMS)", size_pt=20, bold=True, space_before=20, space_after=40, color=COLOR_NAVY)
    
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(10)
        p_logo.paragraph_format.space_after = Pt(30)
        p_logo.add_run().add_picture(logo_path, width=Inches(1.8))
        
    add_centered_para(doc, "BY", size_pt=14, bold=True, space_before=20, space_after=20)
    add_centered_para(doc, "Ahtisham Ijaz", size_pt=13, italic=True, space_after=6)
    add_centered_para(doc, "Co-Author / Partner Name", size_pt=13, italic=True, space_after=40)
    
    add_centered_para(doc, "Department of Computer Science & Information Technology", size_pt=13, bold=True, space_before=40, space_after=4)
    add_centered_para(doc, "Women University of Azad Kashmir", size_pt=13, bold=True, space_after=4)
    add_centered_para(doc, "Bagh, Pakistan", size_pt=12, space_after=4)
    add_centered_para(doc, "November, 2025", size_pt=12, bold=True, space_after=0)
    
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # PAGE 2: Inner Cover Page (Template Page 2)
    # -------------------------------------------------------------
    add_centered_para(doc, "", space_before=12)
    add_centered_para(doc, "University Complaint Management &\nResolution System (UCMS)", size_pt=18, bold=True, space_before=20, space_after=35, color=COLOR_NAVY)
    
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(10)
        p_logo.paragraph_format.space_after = Pt(25)
        p_logo.add_run().add_picture(logo_path, width=Inches(1.7))
        
    add_centered_para(doc, "BY", size_pt=13, bold=True, space_before=15, space_after=15)
    add_centered_para(doc, "Ahtisham Ijaz", size_pt=12, italic=True, space_after=4)
    add_centered_para(doc, "Co-Author / Partner Name", size_pt=12, italic=True, space_after=30)
    
    add_centered_para(doc, "SUPERVISED BY", size_pt=13, bold=True, space_before=15, space_after=12)
    add_centered_para(doc, "Supervisor Name", size_pt=12, italic=True, space_after=40)
    
    add_centered_para(doc, "Department of Computer Science & Information Technology", size_pt=12, bold=True, space_before=30, space_after=4)
    add_centered_para(doc, "Women University of Azad Kashmir", size_pt=12, bold=True, space_after=4)
    add_centered_para(doc, "Bagh, Pakistan", size_pt=12, space_after=4)
    add_centered_para(doc, "November, 2025", size_pt=12, bold=True, space_after=0)
    
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # PAGE 3: Submission / Title Page (Template Page 3)
    # -------------------------------------------------------------
    add_centered_para(doc, "", space_before=10)
    add_centered_para(doc, "University Complaint Management &\nResolution System (UCMS)", size_pt=18, bold=True, space_before=15, space_after=30, color=COLOR_NAVY)
    
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(5)
        p_logo.paragraph_format.space_after = Pt(20)
        p_logo.add_run().add_picture(logo_path, width=Inches(1.6))
        
    add_centered_para(doc, "BY", size_pt=13, bold=True, space_before=10, space_after=15)
    add_centered_para(doc, "Ahtisham Ijaz", size_pt=12, italic=True, space_after=2)
    add_centered_para(doc, "(Roll No: CS-2022-019 / Reg. No: WUAJK-CS-2022-019)", size_pt=10, italic=True, space_after=10)
    add_centered_para(doc, "Student 2", size_pt=12, italic=True, space_after=2)
    add_centered_para(doc, "(Registration number)", size_pt=10, italic=True, space_after=25)
    
    add_centered_para(doc, "A Dissertation Submitted in Partial Fulfillment of the Requirement for the Degree of", size_pt=11.5, italic=True, space_after=6)
    add_centered_para(doc, "Bachelors", size_pt=13, bold=True, space_after=4)
    add_centered_para(doc, "IN", size_pt=11, bold=True, space_after=4)
    add_centered_para(doc, "Computer Sciences", size_pt=13, bold=True, space_after=25)
    
    add_centered_para(doc, "Supervised By", size_pt=12, bold=True, space_after=4)
    add_centered_para(doc, "Supervisor Name", size_pt=12, italic=True, space_after=30)
    
    add_centered_para(doc, "Department of Computer Sciences & Information Technology", size_pt=12, bold=True, space_before=20, space_after=4)
    add_centered_para(doc, "Women University of Azad Kashmir", size_pt=12, bold=True, space_after=4)
    add_centered_para(doc, "Bagh, Pakistan", size_pt=12, space_after=4)
    add_centered_para(doc, "November, 2025", size_pt=12, bold=True, space_after=0)
    
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # PAGE 4: Certificate of Approval (Template Page 4)
    # -------------------------------------------------------------
    add_centered_para(doc, "University Complaint Management &\nResolution System (UCMS)", size_pt=16, bold=True, space_before=15, space_after=20, color=COLOR_NAVY)
    add_centered_para(doc, "BY", size_pt=12, bold=True, space_after=10)
    add_centered_para(doc, "Ahtisham Ijaz", size_pt=11.5, italic=True, space_after=4)
    add_centered_para(doc, "Student 2", size_pt=11.5, italic=True, space_after=25)
    
    add_centered_para(doc, "CERTIFICATE", size_pt=14, bold=True, space_after=20)
    add_centered_para(doc, "A DOCUMENTATION SUBMITTED IN THE PARTIAL FULFILLMENT\nOF THE REQUIREMENTS FOR THE DEGREE OF THE MASTERS/\nBECHELORS", size_pt=11, bold=True, space_after=25)
    add_centered_para(doc, "We accept this dissertation as conforming to the required standards", size_pt=12, bold=True, space_after=50)
    
    # Signatures layout table
    sig_table = doc.add_table(rows=2, cols=2)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    c1, c2 = sig_table.rows[0].cells
    c1.text = "_______________________________"
    c2.text = "_______________________________"
    c1.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.LEFT
    c2.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    
    c1_b, c2_b = sig_table.rows[1].cells
    c1_b.text = "1. Name of Supervisor\n    (Supervisor)"
    c2_b.text = "2. Name of External Examiner\n    (External Examiner)"
    c1_b.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.LEFT
    c2_b.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    
    p_lead = doc.add_paragraph()
    p_lead.paragraph_format.space_before = Pt(45)
    p_lead.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_lead.add_run("_______________________________\n3. Dr. Gohar Rehman Chughtai\n(Coordinator CS&IT, Women University AJK)")
    
    add_centered_para(doc, "Department of Computer Sciences & Information Technology", size_pt=12, bold=True, space_before=45, space_after=4)
    add_centered_para(doc, "Women University of Azad Kashmir", size_pt=12, bold=True, space_after=4)
    add_centered_para(doc, "Bagh, Pakistan", size_pt=12, space_after=4)
    add_centered_para(doc, "November, 2025", size_pt=12, bold=True, space_after=0)
    
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # PAGE 5: Declaration (Template Page 5)
    # -------------------------------------------------------------
    add_centered_para(doc, "Declaration", size_pt=16, bold=True, space_before=20, space_after=30, color=COLOR_NAVY)
    
    p_dec = doc.add_paragraph()
    p_dec.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_dec.paragraph_format.line_spacing = 1.5
    p_dec.paragraph_format.space_after = Pt(14)
    format_run(p_dec.add_run("I hereby declare that this dissertation is the presentation of our original research work. Wherever contributions of others are involved, every effort is made to indicate this clearly, with due reference to the literature and acknowledgement of collaborative research and discussions."))
    
    p_dec2 = doc.add_paragraph()
    p_dec2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_dec2.paragraph_format.line_spacing = 1.5
    p_dec2.paragraph_format.space_after = Pt(50)
    format_run(p_dec2.add_run("This work was done under the guidance of "))
    r_sup = p_dec2.add_run("Supervisor Name, Supervisor Designation, ")
    format_run(r_sup, bold=True)
    format_run(p_dec2.add_run("Department of Computer Sciences & Information Technology, Women University of Azad Kashmir, Bagh."))
    
    # Signatures
    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_before = Pt(30)
    p_sig.add_run("Date: __________________________        __________________________\n                                                            Ahtisham Ijaz\n\n                                                            __________________________\n                                                            Student 2")
    
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # PAGE 6: Acknowledgments (Template Page 6)
    # -------------------------------------------------------------
    add_centered_para(doc, "Acknowledgments", size_pt=16, bold=True, space_before=20, space_after=25, color=COLOR_NAVY)
    
    p_ack1 = doc.add_paragraph()
    p_ack1.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_ack1.paragraph_format.line_spacing = 1.5
    p_ack1.paragraph_format.space_after = Pt(12)
    format_run(p_ack1.add_run("First and foremost, all praises and gratitude are due to Almighty Allah, the Most Gracious, the Most Merciful, who bestowed upon us the intellect, resilience, and perseverance to accomplish this Final Year Project and complete this dissertation successfully."))
    
    p_ack2 = doc.add_paragraph()
    p_ack2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_ack2.paragraph_format.line_spacing = 1.5
    p_ack2.paragraph_format.space_after = Pt(12)
    format_run(p_ack2.add_run("We extend our profound appreciation and sincere gratitude to our esteemed supervisor, for invaluable mentorship, constructive critique, and continuous technical direction throughout the research and engineering phases of the University Complaint Management & Resolution System (UCMS)."))
    
    p_ack3 = doc.add_paragraph()
    p_ack3.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_ack3.paragraph_format.line_spacing = 1.5
    p_ack3.paragraph_format.space_after = Pt(12)
    format_run(p_ack3.add_run("We are exceptionally grateful to Dr. Gohar Rehman Chughtai, Coordinator of the Department of Computer Science & Information Technology, and the entire departmental faculty at Women University of Azad Kashmir, Bagh, for providing a stimulating academic environment, modern laboratory facilities, and institutional encouragement."))
    
    p_ack4 = doc.add_paragraph()
    p_ack4.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_ack4.paragraph_format.line_spacing = 1.5
    p_ack4.paragraph_format.space_after = Pt(12)
    format_run(p_ack4.add_run("Finally, heartfelt appreciation goes to our fellow student peers who participated in our User Acceptance Testing (UAT) sessions, providing crucial usability feedback and satisfaction assessments that verified the practical institutional impact of our project."))
    
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # PAGE 7: Dedication (Template Page 7)
    # -------------------------------------------------------------
    add_centered_para(doc, "Dedication", size_pt=18, bold=True, italic=True, space_before=140, space_after=20, color=COLOR_NAVY)
    add_centered_para(doc, "This work is dedicated to", size_pt=13, italic=True, space_after=10)
    add_centered_para(doc, "My Parents", size_pt=15, bold=True, italic=True, space_after=10)
    add_centered_para(doc, "Whose continuous prayers, sacrifices, and unconditional belief\nhave been the guiding beacon throughout my academic journey.", size_pt=11, italic=True, space_after=0)
    
    doc.add_page_break()

print("Front matter generator built.")
