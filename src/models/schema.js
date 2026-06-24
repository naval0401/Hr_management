export const Schema = {
  leave_request: {
    id: "int8",
    created_at: "timestamptz",
    employee_id: "int8",
    leave_type: "text",
    start_date: "date",
    end_date: "date",
    reason: "text",
    status: "text"
  },

  advance_salary_request: {
    id: "int8",
    created_at: "timestamptz",
    month: "date",
    total_salary: "numeric",
    employee_id: "numeric",
    advance_amount: "numeric",
    remaining_salary: "numeric",
    reason: "text",
    status: "text"
  },

  attendance: {
    id: "uuid",
    employee_id: "text",
    employee_name: "text",
    date: "date",
    check_in: "timestamptz",
    check_out: "timestamptz",
    status: "text",
    created_at: "timestamptz"
  },

  document_request: {
    id: "int8",
    created_at: "timestamptz",
    employee_id: "int8",
    document_type: "text",
    reason: "text",
    status: "text"
  },

employees: {
  id: "uuid",
  email: "text",
  phone: "text",
  employee_id: "text",
  employee_name: "text",
  designation: "text",
  department: "text",
  date_of_joining: "date",
  status: "bool",
  created_at: "timestamptz",
  role: "text",
  date_of_birth: "date",
  address: "text",
  emergency_contact_name: "text",
  emergency_contact_phone: "text",
  blood_group: "text",
  employment_type: "text",
  skills: "text",
  documents_notes: "text"
},

notifications: {
  id: "uuid",
  employee_id: "uuid",   // foreign key -> employees.id
  role: "text",
  type: "text",
  title: "text",
  message: "text",
  is_read: "bool",
  created_at: "timestamptz"
},

departments: {
  id: "uuid",
  name: "text",
  description: "text",
  created_at: "timestamptz"
},

designations: {
  id: "uuid",
  title: "text",
  department_id: "uuid",   // foreign key -> departments.id
  created_at: "timestamptz"
},

announcements: {
  id: "uuid",
  title: "text",
  message: "text",
  category: "text",
  emoji: "text",
  target_audience: "text",
  event_date: "date",
  is_pinned: "bool",
  created_by: "text",
  created_at: "timestamptz",
  updated_at: "timestamptz"
}

};
