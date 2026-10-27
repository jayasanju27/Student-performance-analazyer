import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api } from './api';

export async function exportReportToExcel(reportTitle, columns, rows) {
  const blob = await api.exportExcel(reportTitle, columns, rows);
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Exports any university report to a formatted, printable PDF.
 */
export function exportReportToPdf(reportTitle, subtitle, columns, rows) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138); // blue-900
  doc.text('INFO INSTITUTE OF ENGINEERING', pageWidth / 2, 14, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Autonomous Institution | Affiliated to Anna University | Accredited by NAAC & ISO 9001:2015', pageWidth / 2, 19, { align: 'center' });

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.6);
  doc.line(14, 22, pageWidth - 14, 22);

  // Report Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(reportTitle.toUpperCase(), pageWidth / 2, 28, { align: 'center' });

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, pageWidth / 2, 33, { align: 'center' });
  }

  const startY = subtitle ? 37 : 32;

  // Table
  autoTable(doc, {
    startY,
    head: [columns.map((c) => c.header)],
    body: rows.map((r) => columns.map((c) => (r[c.key] !== undefined ? r[c.key] : ''))),
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
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | Page ${i} of ${pageCount} | Official University Academic Audit Document`,
      pageWidth / 2,
      200,
      { align: 'center' }
    );
  }

  const filename = `${reportTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * Exports data as a spreadsheet-compatible CSV file.
 */
export function exportReportToCsv(reportTitle, columns, rows) {
  const headers = columns.map((c) => `"${c.header}"`).join(',');
  const rowStrings = rows.map((r) =>
    columns
      .map((c) => {
        let val = r[c.key];
        if (val === undefined || val === null) val = '';
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(',')
  );

  const csvContent = [headers, ...rowStrings].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = `${reportTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
