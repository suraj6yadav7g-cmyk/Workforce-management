import { WorkforceData } from '../types/workforce';

export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRelativeDateISO(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDateISO(d);
}

export function createSeedData(): WorkforceData {
  const today = getRelativeDateISO(0);
  const yesterday = getRelativeDateISO(-1);
  const twoDaysAgo = getRelativeDateISO(-2);
  const threeDaysAgo = getRelativeDateISO(-3);
  const fourDaysAgo = getRelativeDateISO(-4);

  const employees = [
    {
      id: 'emp-1',
      employeeCode: 'CAD-101',
      name: 'Elena Rostova',
      email: 'elena.rostova@cadence.io',
      phone: '+1 (415) 890-2314',
      role: 'Lead Frontend Engineer',
      department: 'Engineering' as const,
      location: 'San Francisco HQ',
      status: 'Active' as const,
      joinDate: '2023-03-14',
    },
    {
      id: 'emp-2',
      employeeCode: 'CAD-102',
      name: 'Marcus Vance',
      email: 'marcus.vance@cadence.io',
      phone: '+1 (415) 890-4102',
      role: 'Product Designer',
      department: 'Product & Design' as const,
      location: 'New York Office',
      status: 'Active' as const,
      joinDate: '2023-06-01',
    },
    {
      id: 'emp-3',
      employeeCode: 'CAD-103',
      name: 'Priya Nair',
      email: 'priya.nair@cadence.io',
      phone: '+1 (415) 890-5591',
      role: 'Operations Manager',
      department: 'Operations' as const,
      location: 'San Francisco HQ',
      status: 'Active' as const,
      joinDate: '2022-11-10',
    },
    {
      id: 'emp-4',
      employeeCode: 'CAD-104',
      name: 'David Kim',
      email: 'david.kim@cadence.io',
      phone: '+1 (415) 890-7720',
      role: 'Backend Systems Engineer',
      department: 'Engineering' as const,
      location: 'Seattle (Remote)',
      status: 'Remote' as const,
      joinDate: '2024-01-15',
    },
    {
      id: 'emp-5',
      employeeCode: 'CAD-105',
      name: 'Sofia Mendoza',
      email: 'sofia.mendoza@cadence.io',
      phone: '+1 (415) 890-6138',
      role: 'Growth Marketing Lead',
      department: 'Marketing' as const,
      location: 'Austin Hub',
      status: 'On Leave' as const,
      joinDate: '2023-09-20',
    },
    {
      id: 'emp-6',
      employeeCode: 'CAD-106',
      name: 'Liam O’Connor',
      email: 'liam.oconnor@cadence.io',
      phone: '+1 (415) 890-3349',
      role: 'Financial Controller',
      department: 'Finance' as const,
      location: 'New York Office',
      status: 'Active' as const,
      joinDate: '2022-08-05',
    },
    {
      id: 'emp-7',
      employeeCode: 'CAD-107',
      name: 'Amara Okafor',
      email: 'amara.okafor@cadence.io',
      phone: '+1 (415) 890-9045',
      role: 'People Operations Partner',
      department: 'Human Resources' as const,
      location: 'Chicago Office',
      status: 'Active' as const,
      joinDate: '2024-04-02',
    },
    {
      id: 'emp-8',
      employeeCode: 'CAD-108',
      name: 'Noah Lindqvist',
      email: 'noah.lindqvist@cadence.io',
      phone: '+1 (415) 890-1827',
      role: 'QA Automation Engineer',
      department: 'Engineering' as const,
      location: 'San Francisco HQ',
      status: 'Active' as const,
      joinDate: '2024-07-18',
    },
  ];

  const attendance = [
    // Today
    { id: 'att-t1', employeeId: 'emp-1', date: today, status: 'Present' as const, checkInTime: '08:54 AM' },
    { id: 'att-t2', employeeId: 'emp-2', date: today, status: 'Present' as const, checkInTime: '09:01 AM' },
    { id: 'att-t3', employeeId: 'emp-3', date: today, status: 'Present' as const, checkInTime: '08:47 AM' },
    { id: 'att-t4', employeeId: 'emp-4', date: today, status: 'Present' as const, checkInTime: '09:05 AM', notes: 'Remote check-in' },
    { id: 'att-t5', employeeId: 'emp-5', date: today, status: 'Absent' as const, checkInTime: '—', notes: 'Approved annual leave' },
    { id: 'att-t6', employeeId: 'emp-6', date: today, status: 'Present' as const, checkInTime: '08:59 AM' },
    { id: 'att-t7', employeeId: 'emp-7', date: today, status: 'Late' as const, checkInTime: '09:34 AM', notes: 'Transit delay' },
    { id: 'att-t8', employeeId: 'emp-8', date: today, status: 'Present' as const, checkInTime: '09:00 AM' },

    // Yesterday
    { id: 'att-y1', employeeId: 'emp-1', date: yesterday, status: 'Present' as const, checkInTime: '08:58 AM' },
    { id: 'att-y2', employeeId: 'emp-2', date: yesterday, status: 'Present' as const, checkInTime: '09:04 AM' },
    { id: 'att-y3', employeeId: 'emp-3', date: yesterday, status: 'Present' as const, checkInTime: '08:50 AM' },
    { id: 'att-y4', employeeId: 'emp-4', date: yesterday, status: 'Present' as const, checkInTime: '09:02 AM' },
    { id: 'att-y5', employeeId: 'emp-5', date: yesterday, status: 'Absent' as const, checkInTime: '—', notes: 'Approved annual leave' },
    { id: 'att-y6', employeeId: 'emp-6', date: yesterday, status: 'Present' as const, checkInTime: '08:55 AM' },
    { id: 'att-y7', employeeId: 'emp-7', date: yesterday, status: 'Present' as const, checkInTime: '09:00 AM' },
    { id: 'att-y8', employeeId: 'emp-8', date: yesterday, status: 'Absent' as const, checkInTime: '—', notes: 'Sick day' },

    // Two days ago
    { id: 'att-2d1', employeeId: 'emp-1', date: twoDaysAgo, status: 'Present' as const, checkInTime: '08:52 AM' },
    { id: 'att-2d2', employeeId: 'emp-2', date: twoDaysAgo, status: 'Late' as const, checkInTime: '09:28 AM' },
    { id: 'att-2d3', employeeId: 'emp-3', date: twoDaysAgo, status: 'Present' as const, checkInTime: '08:45 AM' },
    { id: 'att-2d4', employeeId: 'emp-4', date: twoDaysAgo, status: 'Present' as const, checkInTime: '09:00 AM' },
    { id: 'att-2d5', employeeId: 'emp-5', date: twoDaysAgo, status: 'Present' as const, checkInTime: '08:59 AM' },
    { id: 'att-2d6', employeeId: 'emp-6', date: twoDaysAgo, status: 'Present' as const, checkInTime: '08:53 AM' },
    { id: 'att-2d7', employeeId: 'emp-7', date: twoDaysAgo, status: 'Present' as const, checkInTime: '09:03 AM' },
    { id: 'att-2d8', employeeId: 'emp-8', date: twoDaysAgo, status: 'Present' as const, checkInTime: '08:57 AM' },

    // Three days ago
    { id: 'att-3d1', employeeId: 'emp-1', date: threeDaysAgo, status: 'Present' as const, checkInTime: '08:56 AM' },
    { id: 'att-3d2', employeeId: 'emp-2', date: threeDaysAgo, status: 'Present' as const, checkInTime: '09:02 AM' },
    { id: 'att-3d3', employeeId: 'emp-3', date: threeDaysAgo, status: 'Present' as const, checkInTime: '08:49 AM' },
    { id: 'att-3d4', employeeId: 'emp-4', date: threeDaysAgo, status: 'Absent' as const, checkInTime: '—', notes: 'Personal day' },
    { id: 'att-3d5', employeeId: 'emp-5', date: threeDaysAgo, status: 'Present' as const, checkInTime: '09:01 AM' },
    { id: 'att-3d6', employeeId: 'emp-6', date: threeDaysAgo, status: 'Present' as const, checkInTime: '08:55 AM' },
    { id: 'att-3d7', employeeId: 'emp-7', date: threeDaysAgo, status: 'Present' as const, checkInTime: '08:59 AM' },
    { id: 'att-3d8', employeeId: 'emp-8', date: threeDaysAgo, status: 'Present' as const, checkInTime: '09:04 AM' },

    // Four days ago
    { id: 'att-4d1', employeeId: 'emp-1', date: fourDaysAgo, status: 'Present' as const, checkInTime: '08:51 AM' },
    { id: 'att-4d2', employeeId: 'emp-2', date: fourDaysAgo, status: 'Present' as const, checkInTime: '08:59 AM' },
    { id: 'att-4d3', employeeId: 'emp-3', date: fourDaysAgo, status: 'Present' as const, checkInTime: '08:48 AM' },
    { id: 'att-4d4', employeeId: 'emp-4', date: fourDaysAgo, status: 'Present' as const, checkInTime: '09:00 AM' },
    { id: 'att-4d5', employeeId: 'emp-5', date: fourDaysAgo, status: 'Present' as const, checkInTime: '09:02 AM' },
    { id: 'att-4d6', employeeId: 'emp-6', date: fourDaysAgo, status: 'Late' as const, checkInTime: '09:22 AM' },
    { id: 'att-4d7', employeeId: 'emp-7', date: fourDaysAgo, status: 'Present' as const, checkInTime: '08:57 AM' },
    { id: 'att-4d8', employeeId: 'emp-8', date: fourDaysAgo, status: 'Present' as const, checkInTime: '09:01 AM' },
  ];

  const tasks = [
    {
      id: 'task-1',
      title: 'Finalize Q4 Design System Tokens',
      description: 'Audit spacing scales, focus rings, and accessible indigo contrast tokens across core views.',
      assigneeId: 'emp-2',
      priority: 'High' as const,
      status: 'In Progress' as const,
      dueDate: getRelativeDateISO(2),
      createdAt: fourDaysAgo,
    },
    {
      id: 'task-2',
      title: 'Complete Payroll Reconciliation',
      description: 'Verify monthly contractor invoices and overtime adjustments before Friday cutoff.',
      assigneeId: 'emp-6',
      priority: 'High' as const,
      status: 'Pending' as const,
      dueDate: getRelativeDateISO(1),
      createdAt: threeDaysAgo,
    },
    {
      id: 'task-3',
      title: 'Deploy Automated Regression Suite',
      description: 'Add end-to-end coverage for employee onboarding and attendance export flows.',
      assigneeId: 'emp-8',
      priority: 'Medium' as const,
      status: 'Pending' as const,
      dueDate: getRelativeDateISO(4),
      createdAt: twoDaysAgo,
    },
    {
      id: 'task-4',
      title: 'Update Employee Handbook Policy',
      description: 'Incorporate updated hybrid attendance guidelines and parental leave benefits.',
      assigneeId: 'emp-7',
      priority: 'Medium' as const,
      status: 'In Progress' as const,
      dueDate: getRelativeDateISO(5),
      createdAt: twoDaysAgo,
    },
    {
      id: 'task-5',
      title: 'Optimize API Response Caching',
      description: 'Reduce directory query latency for large team rosters using indexed lookups.',
      assigneeId: 'emp-4',
      priority: 'High' as const,
      status: 'Completed' as const,
      dueDate: yesterday,
      createdAt: fourDaysAgo,
    },
    {
      id: 'task-6',
      title: 'Prepare Quarterly Vendor Review',
      description: 'Consolidate software seat utilization metrics and renewal proposals.',
      assigneeId: 'emp-3',
      priority: 'Low' as const,
      status: 'Completed' as const,
      dueDate: today,
      createdAt: fourDaysAgo,
    },
    {
      id: 'task-7',
      title: 'Refresh Onboarding Portal Components',
      description: 'Build responsive checklist cards and mobile navigation drawer for new hires.',
      assigneeId: 'emp-1',
      priority: 'Medium' as const,
      status: 'Pending' as const,
      dueDate: getRelativeDateISO(3),
      createdAt: yesterday,
    },
  ];

  const leaves = [
    {
      id: 'lv-1',
      employeeId: 'emp-4',
      type: 'Annual Leave' as const,
      startDate: getRelativeDateISO(5),
      endDate: getRelativeDateISO(8),
      reason: 'Family trip out of state; handoff documentation completed.',
      status: 'Pending' as const,
      submittedAt: yesterday,
    },
    {
      id: 'lv-2',
      employeeId: 'emp-2',
      type: 'Personal Leave' as const,
      startDate: getRelativeDateISO(3),
      endDate: getRelativeDateISO(3),
      reason: 'Scheduled dental procedure in the morning.',
      status: 'Pending' as const,
      submittedAt: today,
    },
    {
      id: 'lv-3',
      employeeId: 'emp-8',
      type: 'Remote Work' as const,
      startDate: getRelativeDateISO(7),
      endDate: getRelativeDateISO(11),
      reason: 'Working remotely while visiting family.',
      status: 'Pending' as const,
      submittedAt: today,
    },
    {
      id: 'lv-4',
      employeeId: 'emp-5',
      type: 'Annual Leave' as const,
      startDate: yesterday,
      endDate: getRelativeDateISO(1),
      reason: 'Scheduled vacation days.',
      status: 'Approved' as const,
      submittedAt: fourDaysAgo,
    },
    {
      id: 'lv-5',
      employeeId: 'emp-1',
      type: 'Sick Leave' as const,
      startDate: getRelativeDateISO(-10),
      endDate: getRelativeDateISO(-9),
      reason: 'Seasonal flu recovery.',
      status: 'Approved' as const,
      submittedAt: getRelativeDateISO(-10),
    },
  ];

  const supportTickets = [
    {
      id: 'sup-1',
      employeeId: 'emp-4',
      senderEmail: 'david.kim@cadence.io',
      recipientEmail: 'adityayadav638701@gmail.com',
      category: 'IT & Access' as const,
      subject: 'VPN access renewal for remote workspace',
      message: 'Need certificate renewal for the Seattle remote engineering profile before next week.',
      status: 'Open' as const,
      createdAt: yesterday,
    },
    {
      id: 'sup-2',
      employeeId: 'emp-2',
      senderEmail: 'marcus.vance@cadence.io',
      recipientEmail: 'adityayadav638701@gmail.com',
      category: 'Attendance & Leave' as const,
      subject: 'Clarification on carried-over annual leave balance',
      message: 'Checking remaining annual leave days eligible for rollover into Q1.',
      status: 'Resolved' as const,
      createdAt: threeDaysAgo,
    },
  ];

  return { employees, attendance, tasks, leaves, supportTickets };
}
