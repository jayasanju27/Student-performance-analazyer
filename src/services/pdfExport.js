import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateMarksheetClientPdf(marksheetData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // University Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138); // #1e3a8a
  doc.text('INFO INSTITUTE OF ENGINEERING', pageWidth / 2, 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Autonomous Institution | Affiliated to Anna University, Chennai | Approved by AICTE, New Delhi', pageWidth / 2, 23, { align: 'center' });
  doc.text('Accredited by NAAC & ISO 9001:2015 | NH-209, Sathy Road, Kovilpalayam, Coimbatore - 641 107', pageWidth / 2, 27, { align: 'center' });

  // Divider
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.8);
  doc.line(14, 30, pageWidth - 14, 30);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL GRADE REPORT & STATEMENT OF GRADES', pageWidth / 2, 36, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setTextColor(37, 99, 235);
  doc.text(`Bachelor of Technology (B.Tech) - Semester ${marksheetData.semester} Examinations`, pageWidth / 2, 40, { align: 'center' });

  // Student Details Table
  autoTable(doc, {
    startY: 44,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 1.5, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 32 },
      1: { cellWidth: 58 },
      2: { fontStyle: 'bold', cellWidth: 32 },
      3: { cellWidth: 58 },
    },
    body: [
      ['Register Number:', marksheetData.register_number, 'Academic Year:', '2025-2026 (Odd Sem)'],
      ['Student Name:', marksheetData.student_name, 'Semester & Section:', `Semester ${marksheetData.semester} (Sec ${marksheetData.section || 'A'})`],
      ['Degree & Branch:', marksheetData.department_name, 'Overall Attendance:', `${marksheetData.attendance_percentage || 85}%`],
      ['Candidate Email:', marksheetData.email || 'N/A', 'Date of Issue:', marksheetData.issue_date || 'October 08, 2026'],
    ],
  });

  // Subjects Marks Table
  const tableRows = (marksheetData.subjects || []).map((sub) => [
    sub.subject_code,
    sub.subject_name,
    sub.credits,
    Math.round(sub.internal_marks),
    Math.round(sub.external_marks),
    Math.round(sub.total_marks),
    sub.grade,
    sub.grade_point.toFixed(1),
    sub.credit_points.toFixed(1),
    sub.is_passed ? 'PASS' : 'FAIL',
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 4,
    head: [
      ['Code', 'Course Title', 'Credits', 'Internal (30)', 'External (70)', 'Total (100)', 'Grade', 'Grade Pt', 'Credit Pts', 'Result']
    ],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      halign: 'center',
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'center', cellWidth: 18 },
      1: { halign: 'left', cellWidth: 58 },
      2: { halign: 'center', cellWidth: 14 },
      3: { halign: 'center', cellWidth: 18 },
      4: { halign: 'center', cellWidth: 18 },
      5: { fontStyle: 'bold', halign: 'center', cellWidth: 18 },
      6: { fontStyle: 'bold', halign: 'center', cellWidth: 14 },
      7: { halign: 'center', cellWidth: 14 },
      8: { halign: 'center', cellWidth: 16 },
      9: { fontStyle: 'bold', halign: 'center', cellWidth: 16 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 9) {
        if (data.cell.raw === 'PASS') {
          data.cell.styles.textColor = [21, 128, 61]; // green
        } else {
          data.cell.styles.textColor = [185, 28, 28]; // red
        }
      }
    },
  });

  // Summary Table
  const currentY = doc.lastAutoTable.finalY + 4;
  autoTable(doc, {
    startY: currentY,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 2.5, fontStyle: 'bold' },
    body: [
      [
        `Registered Credits: ${marksheetData.total_credits}`,
        `Earned Credits: ${marksheetData.earned_credits}`,
        `Semester SGPA: ${marksheetData.sgpa.toFixed(2)}`,
        `Cumulative CGPA: ${marksheetData.cgpa.toFixed(2)}`,
        `Result: ${marksheetData.result_status}`,
      ],
    ],
    didDrawCell: (data) => {
      doc.setDrawColor(147, 197, 253);
      doc.setFillColor(239, 246, 255);
    },
  });

  // Classification & Grading Notes
  const noteY = doc.lastAutoTable.finalY + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Academic Classification: ${marksheetData.classification || 'First Class'}`, 14, noteY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Grading Scale: O (90-100, GP 10) Outstanding | A+ (80-89, GP 9) Excellent | A (70-79, GP 8) Very Good | B+ (60-69, GP 7) Good | B (50-59, GP 6) Above Avg | C (40-49, GP 5) Pass | F (<40, GP 0) Fail',
    14,
    noteY + 5
  );

  // Signatures & Seals
  const sigY = noteY + 24;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);

  doc.line(16, sigY, 70, sigY);
  doc.line(120, sigY, 174, sigY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Academic Records Officer', 43, sigY + 4, { align: 'center' });
  doc.text('Controller of Examinations', 147, sigY + 4, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Office of the Registrar', 43, sigY + 8, { align: 'center' });
  doc.text('[Official University Seal]', 147, sigY + 8, { align: 'center' });

  // Verification Footer
  const footerY = 282;
  doc.line(14, footerY, pageWidth - 14, footerY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const docId = `IIE-${marksheetData.register_number}-${new Date().getFullYear()}`;
  doc.text(
    `Document ID: ${docId} | Verified Digital Grade Report | Info Institute of Engineering Official Record`,
    pageWidth / 2,
    footerY + 4,
    { align: 'center' }
  );

  // Trigger Save / Download
  const filename = `Marksheet_${marksheetData.register_number}_Sem${marksheetData.semester}.pdf`;
  doc.save(filename);
}
