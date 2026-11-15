export type NavSection =
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'tasks'
  | 'leave'
  | 'reports'
  | 'support';

export type Department =
  | 'Engineering'
  | 'Product & Design'
  | 'Operations'
  | 'Marketing'
  | 'Finance'
  | 'Human Resources';

export type EmployeeStatus = 'Active' | 'On Leave' | 'Remote';

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: Department;
  location: string;
  status: EmployeeStatus;
  joinDate: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime: string; // e.g., "09:02 AM" or "—"
  notes?: string;
}

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface WorkTask {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  createdAt: string;
}

export type LeaveType = 'Annual Leave' | 'Sick Leave' | 'Personal Leave' | 'Remote Work';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: LeaveStatus;
  submittedAt: string;
}

export type SupportCategory =
  | 'HR & Payroll'
  | 'IT & Access'
  | 'Attendance & Leave'
  | 'Workplace Policy';

export type SupportTicketStatus = 'Open' | 'Resolved';

export interface SupportTicket {
  id: string;
  employeeId: string;
  senderEmail: string;
  recipientEmail: string;
  category: SupportCategory;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  createdAt: string;
}

export interface WorkforceData {
  employees: Employee[];
  attendance: AttendanceRecord[];
  tasks: WorkTask[];
  leaves: LeaveRequest[];
  supportTickets: SupportTicket[];
}
