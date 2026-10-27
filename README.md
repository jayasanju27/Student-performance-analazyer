# AcademIQ — Student Academic Performance & University Result Analyzer

> **Info Institute of Engineering (Autonomous) • Academic Management, Result Analytics & Risk Advisory System**

A responsive role-based academic analytics application built with React, Tailwind CSS, Recharts, FastAPI, and SQLAlchemy. Faculty, administrators, and students use one login and one API; access is authorized from the account role stored in the database. SQLite is the default database and PostgreSQL can be configured through `DATABASE_URL`.

---

## 🚀 Quick Start

Install the backend requirements once, then start the frontend and API together from the project root:

```bash
python -m pip install -r backend/requirements.txt
npm run dev
```

Then open the Vite URL shown in the terminal (normally **[http://localhost:5173/](http://localhost:5173/)**). `npm run dev` starts both the frontend and the API required for sign-in. The root route presents one sign-in form with Faculty / Admin and Student choices; this app is the academic portal only.

Choose Faculty / Admin for institutional email sign-in or Student for register-number sign-in. The login page displays the demo credentials below.

```text
Faculty: faculty@academiq.demo / Faculty@123
Student A (improving, no arrears): 22AD001 / 22AD001
Student B (declining, current arrears): 22AD002 / 22AD002
Student C (recovered, earlier arrear cleared): 22AD003 / 22AD003
```

Faculty and administrators have role-protected dashboards for Dashboard, IA Analyzer, University Results, Students, Reports, and Settings. The student portal provides My Overview, My Internal Marks, My University Results, My Arrears, and a personal PDF progress report. Students can access only their own records; class comparison is limited to class averages.

Student passwords are stored as bcrypt hashes. Student accounts can sign in with their current password without a forced first-login password change. Students can optionally change their password after sign-in; new passwords must be at least 8 characters. Sessions expire after 30 minutes without activity and refresh while actively used. Invalid sign-in attempts report **Invalid credentials**.

Set `SECRET_KEY` to a long, persistent random value when deploying, and set `ENVIRONMENT=production`. In local development, a cryptographically random process-local secret is generated automatically; restarting the API invalidates existing tokens.

Faculty and administrators can bulk-create student records or reset existing student accounts from the Students page by uploading a CSV. Use [`sample_data/student_accounts_sample.csv`](./sample_data/student_accounts_sample.csv) as a template. Required headers are `register_number`, `full_name`, and `department_code` (or `department_id`); optional columns are `year`, `semester`, `section`, `email`, `phone`, and `admission_year`. New and reset accounts use the register number as the initial password; students can change it after signing in. Faculty uploads are restricted to their assigned department.

The administrator Settings page contains **Load sample data** for a demo dataset of 60 students, five current-semester subjects per department, and three university examination sessions (Apr/May 2025, Nov/Dec 2025, and Apr/May 2026). Loading sample data replaces the existing database contents. Sample IA import data is in [`sample_data/ia_marks_sample.csv`](./sample_data/ia_marks_sample.csv); the IA Analyzer also provides an import template.

For scanned university-result PDFs, install the Tesseract OCR engine on the host in addition to the Python dependencies. The API first extracts embedded PDF text and invokes OCR only when no text is available. If Tesseract is not installed, the import reports that explicitly and does not create records.

To use PostgreSQL, set `DATABASE_URL` to a SQLAlchemy-compatible PostgreSQL URL before starting the API (for example, `postgresql+psycopg://user:password@localhost/academiq`) and install the corresponding PostgreSQL driver.

---

### Core API endpoints

- `POST /api/auth/login` — role-checked login and access token.
- `POST /api/auth/refresh`, `POST /api/auth/change-password`, and `POST /api/auth/logout` — inactivity-aware session renewal, authenticated password changes, and session revocation.
- `GET /api/analytics/dashboard` — staff dashboard metrics and class insights (admin/faculty).
- `GET /api/marks/ia/{subject_id}/{semester}` — IA marks for a subject and semester.
- `GET /api/marks/ia/template` and `POST /api/marks/ia/import` — download the IA CSV template or import CSV/Excel marks.
- `POST /api/results/extract-pdf-text` — extract embedded PDF text, with optional Tesseract OCR fallback.
- `POST /api/results/university/import` — save reviewed university examination attempts.
- `GET /api/results/university/analytics` — department-scoped pass, arrear, and session analytics (admin/faculty).
- `GET /api/results/university/student/{student_id}` — authorized student university-result history.
- `POST /api/results/export-excel` — generate a protected `.xlsx` workbook for report rows (maximum 10,000 rows).
- `GET /api/students` and `GET /api/students/{student_id}` — student search and profile details.
- `POST /api/students/accounts/bulk` — faculty/admin CSV student and account creation/reset.

FastAPI also provides interactive documentation at `http://localhost:8000/docs` while the development server is running.
University analytics use each student's latest attempt per subject for current pass and arrear totals; earlier failed attempts remain available for recurring-arrear analysis. The administrator can configure the high-risk arrear threshold and IA improvement, decline, and pass thresholds in Settings.
Faculty reports, student directories, IA results, import previews, and arrear reports can be downloaded as CSV, PDF, or true `.xlsx` workbooks. Students can download a PDF containing only their own progress data.

## 🔑 Demo Login Accounts

Use the role selector on the single login page with these pre-configured credentials:

| Role | Username / Identifier | Password | Description |
|---|---|---|---|
| **Faculty** | `faculty@123.in` | `Faculty@123` | Faculty (Professor & HOD, CSE) |
| **Student A** | `22AD001` | `22AD001` | Improving, no arrears |
| **Student B** | `22AD002` | `22AD002` | Declining, current arrears |
| **Student C** | `22AD003` | `22AD003` | Strong recovery, earlier arrear cleared |

For an existing database, use the admin **Load sample data** action to replace its contents with the current demo roster and credentials. This action is destructive and requires confirmation.
---

## 🌟 Complete Features Included

### 1. Multi-Role Institutional Dashboard
- **Executive KPIs**: Total students, class average, overall pass percentage, students at risk, current arrears, and class topper.
- **Interactive Recharts Visualizations**:
  - *Semester SGPA & Pass Progression*: Historical cohort line chart.
  - *Subject-wise Average Marks*: Horizontal benchmark bar chart.
  - *Grade Category Distribution*: Distribution across O, A+, A, B+, B, C, and F.
  - *Attendance Distribution Bands*: Compliance against the mandatory 75% cutoff.
  - *Department Performance Comparison*: Comparative metrics across CSE, ECE, and Mechanical Engineering.
  - *Top Performers Leaderboard* and *Academic Attention Required* widgets.

### 2. Student Directory & Profile Management
- Multi-criteria real-time filtering:
  - Department (CSE, ECE, MECH)
  - Year (1 to 4)
  - Semester (1 to 8)
  - Section (A, B)
  - Risk Level (Low, Medium, High)
  - Pass / Fail Status
- Live search by Name or Register Number.
- Add Student modal, Edit Student modal, and Delete confirmation.
- **Student Profile Drawer**: Avatar, personal metadata, course score cards, attendance progress, risk rating, and study advice.

### 3. Academic Risk Detection & Advisory Intelligence
- Evaluates attendance percentage, current average score, failed course count, previous CGPA, and semester-by-semester SGPA progression trend.
- Classifies scholars into **🟢 Low Risk**, **🟡 Medium Risk**, and **🔴 High Risk**.
- **Explainable Contributing Factors**: Pinpoints specific root causes (e.g. attendance shortage in specific subjects, backlogs, percentage drops).
- **Targeted Recommendations**: Constructive academic guidance.
- **Official University Disclaimer**: Clearly noted as formative academic-support indicator only.

### 4. Official University Marksheet & PDF Generator
- Formatted in official autonomous college transcript layout:
  - University Emblem, NAAC 'A++' Accreditation Header, Candidate details grid.
  - Tabular breakdown: Course Code, Course Title, Credits, Internal Marks (Max 30), External Marks (Max 70), Total Marks (100), Letter Grade, Grade Points, Credit Points, and Result (PASS/FAIL).
  - Summary: Registered Credits, Earned Credits, Semester SGPA, Cumulative CGPA, Academic Classification.
  - **"Download Official PDF"** button: Generates clean, high-resolution vector PDF using `jsPDF` and `jspdf-autotable`.
  - **Print Marksheet** button: Tailored `@media print` rules for paper and browser printing.

### 5. Faculty Grading & Continuous Evaluation Portal
- Select assigned courses (e.g. Database Management Systems, Operating Systems, etc.).
- Continuous Internal Assessment (CIA) marks and semester external exam entry.
- Subject lecture attendance logger with eligibility status calculation.
- Live GPA recalculation upon mark saving.
- IA-1 and IA-2 scores are stored as assessment records and are not inferred from university or semester marks.

### University Result Import Notes
- Text-based university PDFs are parsed into student, subject, grade, and result-status rows for faculty review; scanned PDFs use the optional Tesseract OCR fallback.
- Unparsed lines and duplicate rows are flagged; extraction failures never substitute demo results.
- University examination attempts are stored separately from IA and semester marks, with examination session history and arrear status derived from subsequent attempts.
- Scanned PDFs use the backend OCR fallback; install the Tesseract executable on the API host to enable it.

### 6. CSV / Excel Ingestion Hub
- Bulk upload center supporting `.csv`, `.xlsx`, and `.xls` files.
- **"Download Sample CSV Template"** button.
- Real-time schema validation with valid vs. invalid error count.
- **In-Line Error Correction Grid**: Modify invalid fields directly in the table before committing to the database.

### 7. Institutional Settings & Configurable Grading System
- **Configurable Grading System**: Customize minimum percentage cutoffs, maximum percentage boundaries, and grade points for O, A+, A, B+, B, C, and F.
- **"Load sample data"** action to replace the database with 60 students, five current-semester subjects per department, and three university result sessions.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Plus Jakarta Sans / Inter typography
- **Charts**: Recharts
- **Icons**: Lucide React
- **PDF Export**: jsPDF + jspdf-autotable
- **Backend & Data**: FastAPI, SQLAlchemy, and SQLite (portable through `DATABASE_URL`)
