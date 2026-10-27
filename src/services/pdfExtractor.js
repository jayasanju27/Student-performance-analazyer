import * as pdfjsLib from 'pdfjs-dist';
import { api } from './api';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

const registerPattern = /\b(REG\d{4}[A-Z]{2,4}\d{3}|\d{10,15}|[A-Z]{2,5}\d{8,12})\b/i;
const subjectPattern = /\b([A-Z]{2,4}\s?-?\d{2,4}[A-Z]?)\b/i;
const gradePattern = /\b(A\+|B\+|WITHHELD|ABSENT|PASS|FAIL|RA|AB|SA|WH|W|O|A|B|C|D|E|F|U|P|S)(?![A-Z0-9])/i;

function buildPdfLines(items) {
  const positionedItems = items
    .filter((item) => item.str && item.str.trim())
    .map((item, index) => ({
      text: item.str.trim(),
      x: item.transform?.[4] ?? index,
      y: item.transform?.[5] ?? 0,
      index,
    }))
    .sort((a, b) => b.y - a.y || a.x - b.x || a.index - b.index);

  const lines = [];
  for (const item of positionedItems) {
    let line = lines.find((candidate) => Math.abs(candidate.y - item.y) <= 2);
    if (!line) {
      line = { y: item.y, items: [] };
      lines.push(line);
    }
    line.items.push(item);
  }

  return lines
    .sort((a, b) => b.y - a.y)
    .map((line) =>
      line.items
        .sort((a, b) => a.x - b.x || a.index - b.index)
        .map((item) => item.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
    );
}

export async function extractUniversityResultsFromPdf(file) {
  if (!file || (file.type !== 'application/pdf' && !file.name?.toLowerCase().endsWith('.pdf'))) {
    throw new Error('Choose a valid PDF file to extract university results.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];
  let foundText = false;

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum += 1) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const lines = buildPdfLines(textContent.items);
    if (lines.length) foundText = true;
    pages.push(...lines);
  }

  if (!foundText) {
    const fallback = await api.extractUniversityPdfText(file);
    if (!fallback.text?.trim()) {
      throw new Error('No readable text was found in this PDF, including the OCR pass.');
    }
    return {
      ...parseUniversityText(fallback.text),
      extraction_method: fallback.used_ocr ? 'OCR' : 'PDF text',
    };
  }

  return parseUniversityText(pages.join('\n'));
}

export function parseUniversityText(text) {
  const records = [];
  const unparsedLines = [];
  let currentRegisterNumber = null;

  for (const [index, rawLine] of text.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line) continue;

    const registerMatch = line.match(registerPattern);
    if (registerMatch) currentRegisterNumber = registerMatch[1].toUpperCase();

    const subjectMatch = line.match(subjectPattern);
    if (!subjectMatch) continue;

    const gradeMatch = line.match(gradePattern);
    if (!currentRegisterNumber || !gradeMatch) {
      unparsedLines.push({ line_number: index + 1, text: line });
      continue;
    }

    const grade = gradeMatch[1].toUpperCase();
    const resultStatus = ['F', 'U', 'RA', 'AB', 'FAIL', 'ABSENT'].includes(grade)
      ? 'FAIL'
      : ['SA', 'WH', 'W', 'WITHHELD'].includes(grade)
        ? 'WITHHELD'
        : 'PASS';
    const totalMatch = line.match(/\bTOTAL\s*[:=-]?\s*(\d{1,3}(?:\.\d+)?)\b/i);
    const totalMarks = totalMatch ? Number(totalMatch[1]) : null;

    records.push({
      id: records.length + 1,
      register_number: currentRegisterNumber,
      subject_code: subjectMatch[1].replace(/[\s-]/g, '').toUpperCase(),
      subject_name: '',
      total_marks: totalMarks,
      grade,
      result_status: resultStatus,
      is_arrear: resultStatus === 'FAIL',
      is_valid: true,
    });
  }

  const occurrences = new Set();
  for (const record of records) {
    const key = `${record.register_number}:${record.subject_code}`;
    if (occurrences.has(key)) {
      record.is_valid = false;
      record.validation_error = 'Duplicate student and subject row; verify the result sheet.';
    }
    occurrences.add(key);
  }

  return {
    raw_text_snippet: text.slice(0, 500),
    total_extracted: records.length,
    passed_count: records.filter((record) => record.result_status === 'PASS').length,
    arrear_count: records.filter((record) => record.is_arrear).length,
    unparsed_lines: unparsedLines,
    records,
  };
}

export function generateSimulatedExtractedResults() {
  const sampleRecords = [
    { id: 1, register_number: 'REG2026CSE001', student_name: 'Aditya Verma', subject_code: 'CS301', subject_name: 'Database Management Systems', semester: 3, internal_marks: 28, external_marks: 62, total_marks: 90, grade: 'O', result_status: 'PASS', is_arrear: false, is_valid: true },
    { id: 2, register_number: 'REG2026CSE001', student_name: 'Aditya Verma', subject_code: 'CS302', subject_name: 'Operating Systems & System Programming', semester: 3, internal_marks: 27, external_marks: 58, total_marks: 85, grade: 'A+', result_status: 'PASS', is_arrear: false, is_valid: true },
    { id: 3, register_number: 'REG2026CSE002', student_name: 'Ananya Krishnan', subject_code: 'CS301', subject_name: 'Database Management Systems', semester: 3, internal_marks: 29, external_marks: 66, total_marks: 95, grade: 'O', result_status: 'PASS', is_arrear: false, is_valid: true },
    { id: 4, register_number: 'REG2026CSE003', student_name: 'Rohan Deshpande', subject_code: 'CS301', subject_name: 'Database Management Systems', semester: 3, internal_marks: 24, external_marks: 52, total_marks: 76, grade: 'A', result_status: 'PASS', is_arrear: false, is_valid: true },
    { id: 5, register_number: 'REG2026CSE004', student_name: 'Pooja Hegde', subject_code: 'CS301', subject_name: 'Database Management Systems', semester: 3, internal_marks: 14, external_marks: 24, total_marks: 38, grade: 'F', result_status: 'FAIL', is_arrear: true, is_valid: true },
    { id: 6, register_number: 'REG2026CSE005', student_name: 'Kabir Mehta', subject_code: 'CS301', subject_name: 'Database Management Systems', semester: 3, internal_marks: 11, external_marks: 21, total_marks: 32, grade: 'F', result_status: 'FAIL', is_arrear: true, is_valid: true },
    { id: 7, register_number: 'REG2026CSE005', student_name: 'Kabir Mehta', subject_code: 'CS302', subject_name: 'Operating Systems & System Programming', semester: 3, internal_marks: 12, external_marks: 22, total_marks: 34, grade: 'F', result_status: 'FAIL', is_arrear: true, is_valid: true },
    { id: 8, register_number: 'REG2026ECE001', student_name: 'Siddharth Sen', subject_code: 'EC301', subject_name: 'Microprocessors & Microcontrollers', semester: 3, internal_marks: 28, external_marks: 64, total_marks: 92, grade: 'O', result_status: 'PASS', is_arrear: false, is_valid: true },
    { id: 9, register_number: 'REG2026ECE003', student_name: 'Gaurav Bansal', subject_code: 'EC301', subject_name: 'Microprocessors & Microcontrollers', semester: 3, internal_marks: 18, external_marks: 34, total_marks: 52, grade: 'B', result_status: 'PASS', is_arrear: false, is_valid: true },
    { id: 10, register_number: 'REG2026ECE005', student_name: 'Nikhil Kapoor', subject_code: 'EC301', subject_name: 'Microprocessors & Microcontrollers', semester: 3, internal_marks: 11, external_marks: 21, total_marks: 32, grade: 'F', result_status: 'FAIL', is_arrear: true, is_valid: true },
    { id: 11, register_number: 'REG2026ME001', student_name: 'Varun Choudhary', subject_code: 'ME301', subject_name: 'Applied Thermodynamics & Heat Transfer', semester: 3, internal_marks: 28, external_marks: 63, total_marks: 91, grade: 'O', result_status: 'PASS', is_arrear: false, is_valid: true },
    { id: 12, register_number: 'REG2026ME003', student_name: 'Manish Tiwari', subject_code: 'ME301', subject_name: 'Applied Thermodynamics & Heat Transfer', semester: 3, internal_marks: 12, external_marks: 23, total_marks: 35, grade: 'F', result_status: 'FAIL', is_arrear: true, is_valid: true },
  ];

  return {
    raw_text_snippet: 'DEMO DATA — not extracted from an uploaded university result PDF.',
    total_extracted: sampleRecords.length,
    passed_count: sampleRecords.filter((record) => record.result_status === 'PASS').length,
    arrear_count: sampleRecords.filter((record) => record.is_arrear).length,
    unparsed_lines: [],
    records: sampleRecords,
    is_demo: true,
  };
}
