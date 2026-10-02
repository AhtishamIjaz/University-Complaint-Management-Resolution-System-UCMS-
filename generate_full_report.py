import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

from make_front_matter import build_front_matter
from make_preliminary import build_preliminary_pages
from make_chapter1 import build_chapter_1
from make_chapter2 import build_chapter_2
from make_chapter3 import build_chapter_3
from make_chapter4 import build_chapter_4
from make_chapter5 import build_chapter_5
from make_chapter6_and_end import build_chapter_6_and_end

print("=" * 70)
print("  COMPILING COMPREHENSIVE 60-70 PAGE UCMS DISSERTATION DOCUMENT")
print("=" * 70)

doc = Document()

# Base Section: Margins
# Left 1.25" (for binding), Right 1.0", Top 1.0", Bottom 1.0"
s1 = doc.sections[0]
s1.top_margin = Inches(1.0)
s1.bottom_margin = Inches(1.0)
s1.left_margin = Inches(1.25)
s1.right_margin = Inches(1.0)
s1.different_first_page_header_footer = True

# Helper to add dynamic page number field in footer
def add_footer_page_number(section, fmt="decimal", start=1):
    footer = section.footer
    footer.is_linked_to_previous = False
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Configure section page number type
    sectPr = section._sectPr
    pgNumType = parse_xml(f'<w:pgNumType {nsdecls("w")} w:fmt="{fmt}" w:start="{start}"/>')
    sectPr.append(pgNumType)
    
    run = p.add_run()
    run.font.name = "Times New Roman"
    run.font.size = Pt(10)
    
    fld1 = parse_xml(r'<w:fldChar %s w:fldCharType="begin"/>' % nsdecls('w'))
    instr = parse_xml(r'<w:instrText %s xml:space="preserve"> PAGE </w:instrText>' % nsdecls('w'))
    fld2 = parse_xml(r'<w:fldChar %s w:fldCharType="separate"/>' % nsdecls('w'))
    fld3 = parse_xml(r'<w:fldChar %s w:fldCharType="end"/>' % nsdecls('w'))
    run._r.append(fld1)
    run._r.append(instr)
    run._r.append(fld2)
    run._r.append(fld3)

# 1. FRONT MATTER (Pages 1 to 7 - No page numbers in footer)
print("[1/4] Building Front Matter (Cover, Certificate, Declaration, Dedication)...")
build_front_matter(doc)

# 2. PRELIMINARY PAGES (Pages 8 to 12 - Roman Numerals i to v)
print("[2/4] Building Preliminary Pages (Abstract, TOC, Figures, Tables, Abbreviations)...")
s2 = doc.add_section()
s2.top_margin = Inches(1.0)
s2.bottom_margin = Inches(1.0)
s2.left_margin = Inches(1.25)
s2.right_margin = Inches(1.0)
add_footer_page_number(s2, fmt="roman", start=1)
build_preliminary_pages(doc)

# 3. CHAPTERS & MAIN CONTENT (Arabic Numerals 1, 2, 3...)
print("[3/4] Building Chapters 1 through 6, References, and Appendices...")
s3 = doc.add_section()
s3.top_margin = Inches(1.0)
s3.bottom_margin = Inches(1.0)
s3.left_margin = Inches(1.25)
s3.right_margin = Inches(1.0)
add_footer_page_number(s3, fmt="decimal", start=1)

print("  -> Adding Chapter 1 (Introduction)...")
build_chapter_1(doc)

print("  -> Adding Chapter 2 (Literature Review & Requirements)...")
build_chapter_2(doc)

print("  -> Adding Chapter 3 (Design & Methodology)...")
build_chapter_3(doc)

print("  -> Adding Chapter 4 (Implementation & Results)...")
build_chapter_4(doc)

print("  -> Adding Chapter 5 (Testing & Quality Assurance)...")
build_chapter_5(doc)

print("  -> Adding Chapter 6 (Conclusion), References, and Appendices...")
build_chapter_6_and_end(doc)

# Save Document
out_docx = os.path.abspath("c:/Users/NexGen/Desktop/UCMS/UCMS_Final_Project_Report.docx")
desktop_docx = os.path.abspath("c:/Users/NexGen/Desktop/UCMS_Final_Project_Report.docx")
doc.save(out_docx)
print(f"[4/4] DOCX saved successfully at: {out_docx}")

# Copy to Desktop as well
import shutil
shutil.copy(out_docx, desktop_docx)
print(f"Copied to Desktop at: {desktop_docx}")

# PDF Export via Word COM Automation
print("\nExporting to PDF using Microsoft Word Native Engine...")
out_pdf = os.path.abspath("c:/Users/NexGen/Desktop/UCMS/UCMS_Final_Project_Report.pdf")
desktop_pdf = os.path.abspath("c:/Users/NexGen/Desktop/UCMS_Final_Project_Report.pdf")

try:
    import win32com.client
    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False
    word.DisplayAlerts = False
    
    doc_word = word.Documents.Open(out_docx)
    
    # Update fields to compute exact page numbers in TOC
    try:
        doc_word.Fields.Update()
    except Exception as e:
        print("Note: Fields update skipped:", e)
        
    page_count = doc_word.ComputeStatistics(2) # 2 = wdStatisticPages
    print(f"\n=======================================================")
    print(f"  TOTAL DOCUMENT PAGES GENERATED: {page_count} PAGES!")
    print(f"=======================================================\n")
    
    # Export as PDF (17 = wdFormatPDF)
    doc_word.SaveAs(out_pdf, FileFormat=17)
    doc_word.Close(False)
    word.Quit()
    
    shutil.copy(out_pdf, desktop_pdf)
    print(f"PDF exported successfully to: {out_pdf}")
    print(f"PDF copied to Desktop at: {desktop_pdf}")
except Exception as err:
    print("Word COM Export encountered notice:", err)
    print("DOCX is fully intact and ready to open in Microsoft Word.")

print("\nAll documentation generation tasks completed successfully!")
