import React, { useMemo } from 'react';
import {
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Users,
} from 'lucide-react';
import {
  AttendanceRecord,
  Employee,
  LeaveRequest,
  WorkTask,
} from '../types/workforce';
import {
  countInclusiveDays,
  downloadCSV,
  getAvatarTone,
  getInitials,
} from '../utils/formatters';

interface ReportsViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  tasks: WorkTask[];
  leaves: LeaveRequest[];
  onNotify: (message: string) => void;
}

export function ReportsView({
  employees,
  attendance,
  tasks,
  leaves,
  onNotify,
}: ReportsViewProps) {
  const employeeAttendanceStats = useMemo(() => {
    return employees.map((emp) => {
      const records = attendance.filter((a) => a.employeeId === emp.id);
      const present = records.filter((r) => r.status === 'Present').length;
      const late = records.filter((r) => r.status === 'Late').length;
      const absent = records.filter((r) => r.status === 'Absent').length;
      const totalLogged = records.length;
      const rate =
        totalLogged > 0 ? Math.round(((present + late) / totalLogged) * 100) : 0;

      const empTasks = tasks.filter((t) => t.assigneeId === emp.id);
      const completedTasks = empTasks.filter((t) => t.status === 'Completed').length;

      return {
        employee: emp,
        present,
        late,
        absent,
        totalLogged,
        rate,
        totalTasks: empTasks.length,
        completedTasks,
      };
    });
  }, [employees, attendance, tasks]);

  const departmentStats = useMemo(() => {
    const map = new Map<
      string,
      { headcount: number; active: number; remote: number; onLeave: number; tasksTotal: number; tasksDone: number }
    >();

    employees.forEach((emp) => {
      const existing = map.get(emp.department) || {
        headcount: 0,
        active: 0,
        remote: 0,
        onLeave: 0,
        tasksTotal: 0,
        tasksDone: 0,
      };
      existing.headcount += 1;
      if (emp.status === 'Active') existing.active += 1;
      else if (emp.status === 'Remote') existing.remote += 1;
      else if (emp.status === 'On Leave') existing.onLeave += 1;

      const empTasks = tasks.filter((t) => t.assigneeId === emp.id);
      existing.tasksTotal += empTasks.length;
      existing.tasksDone += empTasks.filter((t) => t.status === 'Completed').length;

      map.set(emp.department, existing);
    });

    return Array.from(map.entries()).sort((a, b) => b[1].headcount - a[1].headcount);
  }, [employees, tasks]);

  const overallMetrics = useMemo(() => {
    const totalRecords = attendance.length;
    const attendedRecords = attendance.filter(
      (a) => a.status === 'Present' || a.status === 'Late'
    ).length;
    const overallAttendanceRate =
      totalRecords > 0 ? Math.round((attendedRecords / totalRecords) * 100) : 0;

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.status === 'Completed').length;
    const taskCompletionRate =
      totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    const approvedLeaveDays = leaves
      .filter((l) => l.status === 'Approved')
      .reduce((sum, l) => sum + countInclusiveDays(l.startDate, l.endDate), 0);

    return {
      overallAttendanceRate,
      totalRecords,
      taskCompletionRate,
      doneTasks,
      totalTasks,
      approvedLeaveDays,
    };
  }, [attendance, tasks, leaves]);

  const handleExportAttendanceCSV = () => {
    const headers = [
      'Employee Code',
      'Name',
      'Department',
      'Role',
      'Present Days',
      'Late Days',
      'Absent Days',
      'Total Logged Days',
      'Attendance Rate (%)',
    ];
    const rows = employeeAttendanceStats.map((row) => [
      row.employee.employeeCode,
      row.employee.name,
      row.employee.department,
      row.employee.role,
      row.present,
      row.late,
      row.absent,
      row.totalLogged,
      `${row.rate}%`,
    ]);
    downloadCSV('cadence-attendance-report.csv', headers, rows);
    onNotify('Downloaded attendance report CSV');
  };

  const handleExportEmployeesCSV = () => {
    const headers = [
      'Employee Code',
      'Name',
      'Email',
      'Phone',
      'Role',
      'Department',
      'Job Location',
      'Status',
      'Join Date',
    ];
    const rows = employees.map((emp) => [
      emp.employeeCode,
      emp.name,
      emp.email,
      emp.phone,
      emp.role,
      emp.department,
      emp.location,
      emp.status,
      emp.joinDate,
    ]);
    downloadCSV('cadence-employees-directory.csv', headers, rows);
    onNotify('Downloaded employee directory CSV');
  };

  return (
    <div className="space-y-8">
      {/* Top Report Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white border border-indigo-100 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              Overall Attendance
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 tabular-nums">
            {overallMetrics.overallAttendanceRate}%
          </p>
          <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
            Based on {overallMetrics.totalRecords} logged entries
          </p>
        </div>

        <div className="bg-white border border-indigo-100 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              Task Completion
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 tabular-nums">
            {overallMetrics.taskCompletionRate}%
          </p>
          <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
            {overallMetrics.doneTasks} of {overallMetrics.totalTasks} tasks completed
          </p>
        </div>

        <div className="bg-white border border-indigo-100 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              Active Workforce
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 tabular-nums">
            {employees.length}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
            Across {departmentStats.length} departments
          </p>
        </div>

        <div className="bg-white border border-indigo-100 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              Approved Leave Days
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 tabular-nums">
            {overallMetrics.approvedLeaveDays}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            Total approved days off
          </p>
        </div>
      </div>

      {/* Attendance Report Table */}
      <section className="bg-white border border-indigo-100 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Employee Attendance Summary
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Individual attendance consistency and task completion breakdown
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportAttendanceCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-indigo-700 bg-[#F3F0FF] hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Attendance CSV</span>
          </button>
        </div>

        {employeeAttendanceStats.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            No employee data available for reporting.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-[#FAF9FE] text-xs font-semibold text-slate-500">
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4 text-right">Present</th>
                  <th className="py-3.5 px-4 text-right">Late</th>
                  <th className="py-3.5 px-4 text-right">Absent</th>
                  <th className="py-3.5 px-4 text-right">Tasks Done</th>
                  <th className="py-3.5 px-6 w-48">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {employeeAttendanceStats.map((row) => (
                  <tr
                    key={row.employee.id}
                    className="hover:bg-[#FAF9FE] transition-colors"
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${getAvatarTone(
                            row.employee.name
                          )}`}
                        >
                          {getInitials(row.employee.name)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 whitespace-nowrap">
                            {row.employee.name}
                          </p>
                          <p className="text-xs font-mono tabular-nums text-slate-500">
                            {row.employee.employeeCode}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {row.employee.department}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-700 font-medium">
                      {row.present}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-amber-700 font-medium">
                      {row.late}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-rose-600 font-medium">
                      {row.absent}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                      {row.completedTasks}/{row.totalTasks}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-purple-50 rounded-full overflow-hidden min-w-[72px]">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${row.rate}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono tabular-nums font-semibold text-slate-700 w-10 text-right">
                          {row.rate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Department Headcount & Export Report */}
      <section className="bg-white border border-indigo-100 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Department Workforce Report
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Headcount status and task velocity grouped by department
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportEmployeesCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-indigo-700 bg-[#F3F0FF] hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Directory CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAF9FE] text-xs font-semibold text-slate-500">
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-4 text-right">Headcount</th>
                <th className="py-3.5 px-4 text-right">On-Site Active</th>
                <th className="py-3.5 px-4 text-right">Remote</th>
                <th className="py-3.5 px-4 text-right">On Leave</th>
                <th className="py-3.5 px-6 text-right">Task Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {departmentStats.map(([dept, stat]) => {
                const taskPct =
                  stat.tasksTotal > 0
                    ? Math.round((stat.tasksDone / stat.tasksTotal) * 100)
                    : 0;
                return (
                  <tr key={dept} className="hover:bg-[#FAF9FE] transition-colors">
                    <td className="py-3.5 px-6 font-medium text-slate-900">
                      {dept}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-800 font-semibold">
                      {stat.headcount}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-700">
                      {stat.active}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-indigo-700">
                      {stat.remote}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-amber-700">
                      {stat.onLeave}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono tabular-nums text-slate-600">
                      {stat.tasksDone}/{stat.tasksTotal} ({taskPct}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
