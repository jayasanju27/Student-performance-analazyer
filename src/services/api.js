// Academic ERP API Client with Real Backend Persistence & Role-Based Security

const resolveApiBase = () => {
  let envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (!envUrl) return '/api';
  // If user entered http:// for a remote host, upgrade to https to prevent 301 POST->GET downgrade
  if (envUrl.startsWith('http://') && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    envUrl = envUrl.replace(/^http:\/\//, 'https://');
  }
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const API_BASE = resolveApiBase();

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
};

export const getStoredUser = () => {
  try {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) localStorage.setItem('user', JSON.stringify(user));
  else localStorage.removeItem('user');
};

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = { ...options.headers };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    setAuthToken(null);
    setStoredUser(null);
    window.dispatchEvent(new Event('academiq:session-expired'));
  }

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      if (response.status === 405) {
        errorDetail = 'HTTP 405 (Method Not Allowed): The API endpoint rejected the request method. If deployed on Vercel, ensure VITE_API_URL is configured in your project settings pointing to your live backend server (static frontend hosts cannot process POST requests).';
      }
    }
    throw new Error(errorDetail);
  }

  // Handle file blob downloads
  const contentType = response.headers.get('content-type') || '';
  if (
    contentType.includes('application/pdf') ||
    contentType.includes('text/csv') ||
    contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  ) {
    return response.blob();
  }

  return response.json();
}

export const api = {
  // Authentication & Verification
  login: async (username, password, expected_role = null) => {
    const payload = { username, password };
    if (expected_role) payload.expected_role = expected_role;
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMe: async () => request('/auth/me'),

  refreshSession: async () => request('/auth/refresh', { method: 'POST' }),

  logoutSession: async () => request('/auth/logout', { method: 'POST' }),

  changePassword: async (current_password, new_password) =>
    request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    }),

  resetDemoData: async () => request('/auth/reset-demo', { method: 'POST' }),

  // Audit Logs (Admin only)
  getAuditLogs: async (limit = 50, action = null) => {
    const query = new URLSearchParams();
    if (limit) query.append('limit', limit);
    if (action) query.append('action', action);
    const qs = query.toString();
    return request(`/audit-logs${qs ? `?${qs}` : ''}`);
  },

  // Students
  getStudents: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'All') {
        query.append(k, v);
      }
    });
    const qs = query.toString();
    return request(`/students${qs ? `?${qs}` : ''}`);
  },

  getStudentById: async (id) => request(`/students/${id}`),

  createStudent: async (data) =>
    request('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  bulkCreateStudentAccounts: async (file) => {
    const formData = new FormData();
    formData.append('student_file', file);
    return request('/students/accounts/bulk', {
      method: 'POST',
      body: formData,
    });
  },

  updateStudent: async (id, data) =>
    request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteStudent: async (id) =>
    request(`/students/${id}`, {
      method: 'DELETE',
    }),

  // Academic Master
  getDepartments: async () => request('/academic/departments'),

  createDepartment: async (data) =>
    request('/academic/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSubjects: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.department_id) query.append('department_id', params.department_id);
    if (params.semester) query.append('semester', params.semester);
    const qs = query.toString();
    return request(`/academic/subjects${qs ? `?${qs}` : ''}`);
  },

  createSubject: async (data) =>
    request('/academic/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSemesters: async () => request('/academic/semesters'),

  getFaculty: async () => request('/academic/faculty'),

  getFacultyAssignedSubjects: async () => request('/academic/faculty/assigned'),

  createFaculty: async (data) =>
    request('/academic/faculty', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getGradingRules: async () => request('/academic/grading-rules'),

  updateGradingRule: async (ruleId, data) =>
    request(`/academic/grading-rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Marks & Internal Assessments
  getStudentMarks: async (studentId, semester) => {
    const qs = semester ? `?semester=${semester}` : '';
    return request(`/marks/student/${studentId}${qs}`);
  },

  getSubjectMarks: async (subjectId, semester) => {
    const qs = semester ? `?semester=${semester}` : '';
    return request(`/marks/subject/${subjectId}${qs}`);
  },

  recordMarks: async (data) =>
    request('/marks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getIaMarks: async (subjectId, semester) =>
    request(`/marks/ia/${subjectId}/${semester}`),

  recordIaMark: async (data) =>
    request('/marks/ia', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  importIaMarks: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/marks/ia/import', { method: 'POST', body: formData });
  },

  downloadIaTemplate: async () => {
    const blob = await request('/marks/ia/template');
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'academiq_ia_template.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Standing Arrears Management
  getArrears: async (filter = 'All') => {
    const qs = filter && filter !== 'All' ? `?filter=${filter}` : '';
    return request(`/marks/arrears${qs}`);
  },

  clearArrear: async (markId) =>
    request(`/marks/arrears/${markId}/clear`, {
      method: 'POST',
    }),

  // Attendance
  getStudentAttendance: async (studentId, semester) => {
    const qs = semester ? `?semester=${semester}` : '';
    return request(`/attendance/student/${studentId}${qs}`);
  },

  recordAttendance: async (data) =>
    request('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Results & Marksheets
  getMarksheet: async (studentId, semester) =>
    request(`/results/marksheet/${studentId}/${semester}`),

  downloadMarksheetPdf: async (studentId, semester, registerNumber) => {
    const blob = await request(`/results/marksheet/${studentId}/${semester}/pdf`);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Official_Marksheet_${registerNumber || 'Student'}_Sem${semester}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  getStudentResults: async (studentId) =>
    request(`/results/student/${studentId}`),

  // Academic Risk Radar
  getStudentRisk: async (studentId) =>
    request(`/risk-analysis/${studentId}`),

  getFlaggedStudents: async (riskFilter = 'All') =>
    request(`/risk-analysis/students/flagged?risk_filter=${riskFilter}`),

  // Analytics
  getDashboardAnalytics: async () =>
    request('/analytics/dashboard'),

  getClassAnalytics: async (deptId, sem) => {
    const query = new URLSearchParams();
    if (deptId) query.append('department_id', deptId);
    if (sem) query.append('semester', sem);
    const qs = query.toString();
    return request(`/analytics/class${qs ? `?${qs}` : ''}`);
  },

  // CSV / Excel File Upload & Ingestion
  previewUpload: async (formData) =>
    request('/upload/preview', {
      method: 'POST',
      body: formData,
    }),

  commitUpload: async (records) =>
    request('/upload/commit', {
      method: 'POST',
      body: JSON.stringify({ records }),
    }),

  downloadTemplate: async () => {
    const blob = await request('/upload/template');
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_marks_template.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // University PDF Result Ingestion
  exportExcel: async (title, columns, rows) =>
    request('/results/export-excel', {
      method: 'POST',
      body: JSON.stringify({ title, columns, rows }),
    }),

  commitExtractedPdfResults: async (records, semester, examSession) => {
    return request('/results/university/import', {
      method: 'POST',
      body: JSON.stringify({
        records: records.map((record) => ({
          register_number: record.register_number,
          subject_code: record.subject_code,
          semester,
          exam_session: examSession,
          grade: record.grade,
          result_status: record.result_status,
          total_marks: record.total_marks,
        })),
      }),
    });
  },

  getUniversityResultHistory: async (studentId) =>
    request(`/results/university/student/${studentId}`),

  getUniversityResultAnalytics: async (highRiskArrearCount = 3) =>
    request(`/results/university/analytics?high_risk_arrear_count=${highRiskArrearCount}`),

  extractUniversityPdfText: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/results/extract-pdf-text', { method: 'POST', body: formData });
  },
};
