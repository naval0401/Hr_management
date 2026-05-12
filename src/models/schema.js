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
    role: "text"
  }
};
