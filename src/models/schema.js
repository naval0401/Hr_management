
export const Schema = {
  employees: {
    id: "int8",
    name: "text",
    email: "text",
    phone: "text",
    designation: "text",
    department: "text",
    date_of_joining: "date",
    status: "boolean",
    created_at: "timestamptz"
  },

  leave_request: {
    id: "int8",
    employee_id: "int8",
    leave_type: "text",
    start_date: "date",
    end_date: "date",
    reason: "text",
    status: "text",
    requested_at: "timestamptz",
    approved_at: "timestamptz"
  },

  document_request: {
    id: "int8",
    employee_id: "int8",
    document_type: "text",
    reason: "text",
    status: "text",
    requested_at: "timestamptz",
    approved_at: "timestamptz",
    delivered_at: "timestamptz"
  },

  advance_salary_request: {
    id: "int8",
    employee_id: "int8",
    month: "date",
    total_salary: "numeric(10,2)",
    advance_amount: "numeric(10,2)",
    remaining_salary: "numeric(10,2)",
    reason: "text",
    status: "text",
    requested_at: "timestamptz",
    approved_at: "timestamptz"
  },

  attendance: {
    id: "int8",
    employee_id: "int8",
    date: "date",
    check_in: "timestamptz",
    check_out: "timestamptz",
    status: "text",
    created_at: "timestamptz"
  }
};
