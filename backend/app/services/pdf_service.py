import io
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_marksheet_pdf(marksheet_data: dict) -> io.BytesIO:
    """
    Generates a high-quality, professional university transcript/marksheet PDF
    matching standard academic university grade sheets.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'UnivTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=colors.HexColor('#1e3a8a'),
        alignment=1  # Center
    )

    subtitle_style = ParagraphStyle(
        'UnivSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#475569'),
        alignment=1
    )

    doc_header_style = ParagraphStyle(
        'DocHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0f172a'),
        alignment=1
    )

    label_style = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        textColor=colors.HexColor('#334155')
    )

    val_style = ParagraphStyle(
        'MetaVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        textColor=colors.HexColor('#0f172a')
    )

    tbl_head_style = ParagraphStyle(
        'TblHead',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        textColor=colors.white,
        alignment=1
    )

    tbl_cell_style = ParagraphStyle(
        'TblCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        alignment=0
    )

    tbl_cell_center = ParagraphStyle(
        'TblCellCenter',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        alignment=1
    )

    story = []

    # University Header
    story.append(Paragraph("INFO INSTITUTE OF ENGINEERING", title_style))
    story.append(Spacer(1, 3))
    story.append(Paragraph("An Autonomous Institution | Affiliated to Anna University, Chennai | Approved by AICTE, New Delhi", subtitle_style))
    story.append(Paragraph("Accredited by NAAC & ISO 9001:2015 | NH-209, Sathy Road, Kovilpalayam, Coimbatore - 641 107", subtitle_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#1e3a8a'), spaceAfter=8))
    
    # Document Title
    story.append(Paragraph("OFFICIAL GRADE REPORT & STATEMENT OF GRADES", doc_header_style))
    story.append(Spacer(1, 6))

    # Student Details Table
    stud_info = [
        [
            Paragraph("<b>Register Number:</b>", label_style),
            Paragraph(marksheet_data.get('register_number', 'N/A'), val_style),
            Paragraph("<b>Academic Year:</b>", label_style),
            Paragraph("2025-2026", val_style)
        ],
        [
            Paragraph("<b>Student Name:</b>", label_style),
            Paragraph(marksheet_data.get('student_name', 'N/A'), val_style),
            Paragraph("<b>Semester:</b>", label_style),
            Paragraph(f"Semester {marksheet_data.get('semester', 1)}", val_style)
        ],
        [
            Paragraph("<b>Degree & Branch:</b>", label_style),
            Paragraph(f"B.Tech - {marksheet_data.get('department_name', 'Engineering')}", val_style),
            Paragraph("<b>Section:</b>", label_style),
            Paragraph(f"Section {marksheet_data.get('section', 'A')}", val_style)
        ],
        [
            Paragraph("<b>Email:</b>", label_style),
            Paragraph(marksheet_data.get('email', 'N/A'), val_style),
            Paragraph("<b>Attendance:</b>", label_style),
            Paragraph(f"{marksheet_data.get('attendance_percentage', 0.0)}%", val_style)
        ]
    ]

    info_table = Table(stud_info, colWidths=[1.4*inch, 2.5*inch, 1.4*inch, 1.8*inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 10))

    # Subjects Table
    headings = [
        Paragraph("Code", tbl_head_style),
        Paragraph("Course Title", tbl_head_style),
        Paragraph("Credits", tbl_head_style),
        Paragraph("Internal", tbl_head_style),
        Paragraph("External", tbl_head_style),
        Paragraph("Total", tbl_head_style),
        Paragraph("Grade", tbl_head_style),
        Paragraph("Grade Pt", tbl_head_style),
        Paragraph("Credit Pts", tbl_head_style),
        Paragraph("Result", tbl_head_style),
    ]

    table_data = [headings]
    
    for sub in marksheet_data.get('subjects', []):
        table_data.append([
            Paragraph(sub.get('subject_code', ''), tbl_cell_center),
            Paragraph(sub.get('subject_name', ''), tbl_cell_style),
            Paragraph(str(sub.get('credits', 4)), tbl_cell_center),
            Paragraph(f"{sub.get('internal_marks', 0):.0f}", tbl_cell_center),
            Paragraph(f"{sub.get('external_marks', 0):.0f}", tbl_cell_center),
            Paragraph(f"{sub.get('total_marks', 0):.0f}", tbl_cell_center),
            Paragraph(f"<b>{sub.get('grade', 'F')}</b>", tbl_cell_center),
            Paragraph(f"{sub.get('grade_point', 0):.1f}", tbl_cell_center),
            Paragraph(f"{sub.get('credit_points', 0):.1f}", tbl_cell_center),
            Paragraph(f"<font color='{'#15803d' if sub.get('is_passed') else '#b91c1c'}'><b>{sub.get('result', 'PASS')}</b></font>", tbl_cell_center)
        ])

    grades_table = Table(
        table_data,
        colWidths=[0.8*inch, 2.3*inch, 0.5*inch, 0.6*inch, 0.6*inch, 0.5*inch, 0.5*inch, 0.6*inch, 0.7*inch, 0.6*inch]
    )
    
    grades_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a8a')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#94a3b8')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))

    story.append(grades_table)
    story.append(Spacer(1, 10))

    # Summary Row
    summary_data = [
        [
            Paragraph(f"<b>Registered Credits:</b> {marksheet_data.get('total_credits', 0)}", val_style),
            Paragraph(f"<b>Earned Credits:</b> {marksheet_data.get('earned_credits', 0)}", val_style),
            Paragraph(f"<b>SGPA:</b> <font color='#1e3a8a'><b>{marksheet_data.get('sgpa', 0.0):.2f}</b></font>", val_style),
            Paragraph(f"<b>CGPA:</b> <font color='#1e3a8a'><b>{marksheet_data.get('cgpa', 0.0):.2f}</b></font>", val_style),
            Paragraph(f"<b>Result:</b> <font color='{'#15803d' if marksheet_data.get('result_status') == 'PASS' else '#b91c1c'}'><b>{marksheet_data.get('result_status', 'PASS')}</b></font>", val_style),
        ]
    ]
    summary_table = Table(summary_data, colWidths=[1.5*inch, 1.4*inch, 1.3*inch, 1.3*inch, 1.6*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#eff6ff')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#93c5fd')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 8))

    # Classification Note
    class_text = f"<b>Classification:</b> {marksheet_data.get('classification', 'First Class')}"
    story.append(Paragraph(class_text, ParagraphStyle('ClassStyle', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#1e293b'))))
    story.append(Spacer(1, 20))

    # Signatures Table
    sig_data = [
        [
            Paragraph("Prepared by:<br/><b>Academic Records Office</b>", val_style),
            Paragraph("Verified by:<br/><b>Head of Department</b>", val_style),
            Paragraph("Authorized by:<br/><b>Controller of Examinations</b><br/><i>[Official University Seal]</i>", val_style)
        ]
    ]
    sig_table = Table(sig_data, colWidths=[2.3*inch, 2.3*inch, 2.5*inch])
    sig_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(sig_table)
    story.append(Spacer(1, 15))

    # Security / Date footer
    issue_date = marksheet_data.get('issue_date', datetime.utcnow().strftime("%B %d, %Y"))
    footer_text = f"Date of Issue: {issue_date} | Document ID: IIE-{marksheet_data.get('register_number', '000')}-{datetime.utcnow().strftime('%Y%m%d')} | This is an officially generated digital transcript."
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cbd5e1'), spaceAfter=5))
    story.append(Paragraph(footer_text, ParagraphStyle('Foot', parent=styles['Normal'], fontSize=7, textColor=colors.HexColor('#64748b'), alignment=1)))

    doc.build(story)
    buffer.seek(0)
    return buffer
