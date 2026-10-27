const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

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
    // If token expired, clear and optionally trigger event
    setAuthToken(null);
    setStoredUser(null);
  }

  if (!response.ok) {
    let errorDetail = `Request failed (${response.status})`;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      // not json
    }
    throw new Error(errorDetail);
  }

  // Handle blob responses (e.g. PDF or CSV downloads)
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/pdf') || contentType.includes('text/csv')) {
    return response.blob();
  }

  return response.json();
}

export const api = {
  // Auth
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  getMe: () => request('/auth/me'),
  resetDemoData: () => request('/auth/reset-demo', { method: 'POST' }),

  // Students
  getStudents: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'All') {
        query.append(k, v);
      }
    });
    const qs = query.toString();
    return request(`/students${qs ? `?${qs}` : ''}`);
  },
  getStudentById: (id) => request(`/students/${id}`),
  createStudent: (data) =>
    request('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStudent: (id, data) =>
    request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteStudent: (id) =>
    request(`/students/${id}`, {
      method: 'DELETE',
    }),

  // Academic Master
  getDepartments: () => request('/academic/departments'),
  createDepartment: (data) =>
    request('/academic/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSubjects: (params = {}) => {
    const query = new URLSearchParams();
    if (params.department_id) query.append('department_id', params.department_id);
    if (params.semester) query.append('semester', params.semester);
    const qs = query.toString();
    return request(`/academic/subjects${qs ? `?${qs}` : ''}`);
  },
  createSubject: (data) =>
    request('/academic/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getFaculty: () => request('/academic/faculty'),
  createFaculty: (data) =>
    request('/academic/faculty', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getGradingRules: () => request('/academic/grading-rules'),
  updateGradingRule: (ruleId, data) =>
    request(`/academic/grading-rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Marks & Attendance
  getStudentMarks: (studentId, semester) => {
    const qs = semester ? `?semester=${semester}` : '';
    return request(`/marks/student/${studentId}${qs}`);
  },
  recordMarks: (data) =>
    request('/marks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getStudentAttendance: (studentId, semester) => {
    const qs = semester ? `?semester=${semester}` : '';
    return request(`/attendance/student/${studentId}${qs}`);
  },
  recordAttendance: (data) =>
    request('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Results & Marksheet
  getMarksheet: (studentId, semester) =>
    request(`/results/marksheet/${studentId}/${semester}`),
  downloadMarksheetPdf: async (studentId, semester, registerNumber) => {
    const blob = await request(`/results/marksheet/${studentId}/${semester}/pdf`);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Marksheet_${registerNumber || 'Student'}_Sem${semester}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // Risk & Recommendations
  getStudentRisk: (studentId) => request(`/risk-analysis/${studentId}`),
  getFlaggedStudents: (riskFilter = 'All') =>
    request(`/risk-analysis/students/flagged?risk_filter=${riskFilter}`),

  // Analytics
  getDashboardAnalytics: () => request('/analytics/dashboard'),
  getClassAnalytics: (deptId, sem) => {
    const query = new URLSearchParams();
    if (deptId) query.append('department_id', deptId);
    if (sem) query.append('semester', sem);
    const qs = query.toString();
    return request(`/analytics/class${qs ? `?${qs}` : ''}`);
  },

  // CSV / Excel Upload
  previewUpload: (formData) =>
    request('/upload/preview', {
      method: 'POST',
      body: formData,
    }),
  commitUpload: (records) =>
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
};
