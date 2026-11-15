import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  Check,
  CheckCircle2,
  Clock,
  LifeBuoy,
  ListTodo,
  Mail,
  MapPin,
  Phone,
  Plus,
  UserCheck,
  UserMinus,
  Users,
  X,
} from 'lucide-react';
import { getRelativeDateISO } from '../data/seedData';
import {
  AttendanceRecord,
  Employee,
  LeaveRequest,
  NavSection,
  WorkTask,
} from '../types/workforce';
import {
  countInclusiveDays,
  formatDisplayDate,
  getAvatarTone,
  getInitials,
} from '../utils/formatters';

interface DashboardViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  tasks: WorkTask[];
  leaves: LeaveRequest[];
  onNavigate: (section: NavSection) => void;
  onUpdateLeaveStatus: (id: string, status: 'Approved' | 'Rejected') => void;
  onCompleteTask: (id: string) => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardView({
  employees,
  attendance,
  tasks,
  leaves,
  onNavigate,
  onUpdateLeaveStatus,
  onCompleteTask,
}: DashboardViewProps) {
  const [breakdownMode, setBreakdownMode] = useState<'department' | 'location'>(
    'department'
  );
  const [selectedTrendDate, setSelectedTrendDate] = useState<string>(
    getRelativeDateISO(0)
  );

  const today = getRelativeDateISO(0);
  const todayAttendance = attendance.filter((a) => a.date === today);

  const totalEmployees = employees.length;
  const onTimeToday = todayAttendance.filter((a) => a.status === 'Present').length;
  const lateToday = todayAttendance.filter((a) => a.status === 'Late').length;
  const presentToday = onTimeToday + lateToday;
  const absentToday = todayAttendance.filter((a) => a.status === 'Absent').length;
  const unmarkedToday = Math.max(0, totalEmployees - todayAttendance.length);

  const pendingTasks = tasks.filter((t) => t.status !== 'Completed');
  const completedTasksCount = tasks.length - pendingTasks.length;
  const highPriorityTasksCount = pendingTasks.filter(
    (t) => t.priority === 'High'
  ).length;
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');

  const employeeMap = useMemo(
    () => new Map(employees.map((e) => [e.id, e])),
    [employees]
  );

  const activeCount = employees.filter((e) => e.status === 'Active').length;
  const remoteCount = employees.filter((e) => e.status === 'Remote').length;

  const attendanceRateToday =
    totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

  // Department & Location headcount breakdowns
  const departmentEntries = useMemo(() => {
    const counts = employees.reduce<Record<string, number>>((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [employees]);

  const locationEntries = useMemo(() => {
    const counts = employees.reduce<Record<string, number>>((acc, emp) => {
      const loc = emp.location || 'San Francisco HQ';
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [employees]);

  // 5-day attendance trend data
  const fiveDayTrend = useMemo(() => {
    return [-4, -3, -2, -1, 0].map((offset) => {
      const dateISO = getRelativeDateISO(offset);
      const dayRecords = attendance.filter((a) => a.date === dateISO);
      const present = dayRecords.filter((r) => r.status === 'Present').length;
      const late = dayRecords.filter((r) => r.status === 'Late').length;
      const absent = dayRecords.filter((r) => r.status === 'Absent').length;

      const d = new Date();
      d.setDate(d.getDate() + offset);
      const shortDay =
        offset === 0
          ? 'Today'
          : d.toLocaleDateString('en-US', { weekday: 'short' });
      const shortDate = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      return {
        dateISO,
        shortDay,
        shortDate,
        present,
        late,
        absent,
        total: present + late + absent,
      };
    });
  }, [attendance]);

  const activeTrendDay =
    fiveDayTrend.find((d) => d.dateISO === selectedTrendDate) ||
    fiveDayTrend[fiveDayTrend.length - 1];

  const maxTrendBar = Math.max(
    totalEmployees,
    ...fiveDayTrend.map((d) => d.total),
    1
  );

  // SVG Ring math
  const ringRadius = 38;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    ringCircumference - (attendanceRateToday / 100) * ringCircumference;

  const activeDistribution =
    breakdownMode === 'department' ? departmentEntries : locationEntries;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Executive Welcome & Daily Pulse Hero */}
      <section
        aria-label="Daily workforce summary"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#4338CA] text-white p-6 sm:p-8 shadow-sm"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-16 w-72 h-72 rounded-full bg-purple-400/15 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 w-64 h-64 rounded-full bg-indigo-400/15 blur-2xl"
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-indigo-100">
              {getGreeting()} · {formatDisplayDate(today)}
            </p>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white [text-wrap:balance]">
              Your workforce operations at a glance
            </h2>
            <p className="mt-2 text-sm text-indigo-100/95 leading-relaxed">
              <span className="font-semibold text-white tabular-nums">
                {presentToday} of {totalEmployees}
              </span>{' '}
              team members checked in today, with{' '}
              <span className="font-semibold text-white tabular-nums">
                {pendingLeaves.length}
              </span>{' '}
              pending leave {pendingLeaves.length === 1 ? 'request' : 'requests'} and{' '}
              <span className="font-semibold text-white tabular-nums">
                {pendingTasks.length}
              </span>{' '}
              open tasks.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('attendance')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-indigo-700 bg-white hover:bg-indigo-50 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
              >
                <CalendarCheck2 className="w-4 h-4" />
                <span>Mark Attendance</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('tasks')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-white/15 hover:bg-white/25 border border-white/20 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
              >
                <Plus className="w-4 h-4" />
                <span>Manage Tasks</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('reports')}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-indigo-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Reports</span>
              </button>
            </div>
          </div>

          {/* Daily Attendance Gauge Card */}
          <div className="flex items-center gap-5 bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl px-5 py-4 self-start lg:self-auto shrink-0">
            <div className="relative w-24 h-24 shrink-0">
              <svg
                className="w-24 h-24 -rotate-90"
                viewBox="0 0 96 96"
                aria-hidden="true"
              >
                <circle
                  cx="48"
                  cy="48"
                  r={ringRadius}
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={ringRadius}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-xl font-bold tabular-nums text-white">
                  {attendanceRateToday}%
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <p className="font-display font-semibold text-sm text-white">
                Today’s Check-In
              </p>
              <div className="space-y-1 text-indigo-100 tabular-nums">
                <p>{onTimeToday} On Time</p>
                <p>{lateToday} Late Arrival</p>
                <p>{absentToday} Absent</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Summary Strip */}
      <section aria-label="Key metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          <button
            type="button"
            onClick={() => onNavigate('employees')}
            className="text-left bg-white border border-indigo-100 rounded-xl p-5 hover:border-indigo-300 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-150 focus-visible:outline-2 focus-visible:outline-indigo-600 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Total Employees</span>
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-slate-900 tabular-nums">
              {totalEmployees}
            </p>
            <p className="mt-2 text-xs text-slate-500 tabular-nums">
              {activeCount} on-site · {remoteCount} remote
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('attendance')}
            className="text-left bg-white border border-indigo-100 rounded-xl p-5 hover:border-indigo-300 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-150 focus-visible:outline-2 focus-visible:outline-indigo-600 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Present Today</span>
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-slate-900 tabular-nums">
              {presentToday}
            </p>
            <div className="mt-2.5 flex items-center gap-2.5">
              <div className="flex-1 h-1.5 bg-purple-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${attendanceRateToday}%` }}
                />
              </div>
              <span className="text-xs font-mono tabular-nums text-indigo-700 font-medium">
                {attendanceRateToday}%
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('attendance')}
            className="text-left bg-white border border-indigo-100 rounded-xl p-5 hover:border-indigo-300 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-150 focus-visible:outline-2 focus-visible:outline-indigo-600 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Absent Today</span>
              <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <UserMinus className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-slate-900 tabular-nums">
              {absentToday}
            </p>
            <p className="mt-2 text-xs text-slate-500 tabular-nums">
              {unmarkedToday > 0
                ? `${unmarkedToday} not yet marked`
                : 'All attendance recorded'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('tasks')}
            className="text-left bg-white border border-indigo-100 rounded-xl p-5 hover:border-indigo-300 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-150 focus-visible:outline-2 focus-visible:outline-indigo-600 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Pending Tasks</span>
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <ListTodo className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-slate-900 tabular-nums">
              {pendingTasks.length}
            </p>
            <p className="mt-2 text-xs text-slate-500 tabular-nums">
              {highPriorityTasksCount} high priority · {completedTasksCount} done
            </p>
          </button>
        </div>
      </section>

      {/* Analytics Row: 5-Day Attendance Trend + Workforce Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 5-Day Attendance Trend (7 cols) */}
        <section className="lg:col-span-7 bg-white border border-indigo-100 rounded-xl p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                5-Day Attendance Trend
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any day to inspect daily check-in breakdown
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('attendance')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <span>Full log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Bar Chart */}
          <div className="mt-6 grid grid-cols-5 gap-3 sm:gap-5 items-end h-44 pt-4 border-b border-slate-100 pb-3">
            {fiveDayTrend.map((day) => {
              const isSelected = activeTrendDay?.dateISO === day.dateISO;
              const presentPct = (day.present / maxTrendBar) * 100;
              const latePct = (day.late / maxTrendBar) * 100;
              const absentPct = (day.absent / maxTrendBar) * 100;

              return (
                <button
                  key={day.dateISO}
                  type="button"
                  onClick={() => setSelectedTrendDate(day.dateISO)}
                  className={`group flex flex-col items-center h-full justify-end rounded-lg px-2 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                    isSelected ? 'bg-[#F3F0FF]' : 'hover:bg-[#FAF9FE]'
                  }`}
                >
                  <div className="w-full max-w-[40px] flex-1 flex flex-col justify-end gap-0.5 pb-2">
                    {day.absent > 0 && (
                      <div
                        className="w-full bg-rose-400 rounded-t-sm transition-all duration-300"
                        style={{ height: `${Math.max(absentPct, 6)}%` }}
                        title={`${day.absent} Absent`}
                      />
                    )}
                    {day.late > 0 && (
                      <div
                        className="w-full bg-purple-400 rounded-xs transition-all duration-300"
                        style={{ height: `${Math.max(latePct, 6)}%` }}
                        title={`${day.late} Late`}
                      />
                    )}
                    {day.present > 0 && (
                      <div
                        className="w-full bg-indigo-600 rounded-b-sm rounded-t-sm transition-all duration-300"
                        style={{ height: `${Math.max(presentPct, 8)}%` }}
                        title={`${day.present} Present`}
                      />
                    )}
                    {day.total === 0 && (
                      <div className="w-full h-1.5 bg-slate-200 rounded-full" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      isSelected ? 'text-indigo-700 font-semibold' : 'text-slate-600'
                    }`}
                  >
                    {day.shortDay}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Day Summary Strip */}
          {activeTrendDay && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600 tabular-nums">
                <span className="font-semibold text-slate-900">
                  {activeTrendDay.shortDate}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600 inline-block" />
                  <span>{activeTrendDay.present} Present</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-purple-400 inline-block" />
                  <span>{activeTrendDay.late} Late</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-400 inline-block" />
                  <span>{activeTrendDay.absent} Absent</span>
                </span>
              </div>
              <span className="font-mono tabular-nums text-slate-500">
                {activeTrendDay.total} logged
              </span>
            </div>
          )}
        </section>

        {/* Workforce Breakdown (5 cols) */}
        <section className="lg:col-span-5 bg-white border border-indigo-100 rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Team Distribution
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Headcount by {breakdownMode}
              </p>
            </div>

            <div className="inline-flex items-center gap-1 p-1 bg-[#F3F0FF] rounded-lg shrink-0">
              <button
                type="button"
                onClick={() => setBreakdownMode('department')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  breakdownMode === 'department'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Department
              </button>
              <button
                type="button"
                onClick={() => setBreakdownMode('location')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  breakdownMode === 'location'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Location
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4 flex-1">
            {activeDistribution.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                No employees available yet.
              </p>
            ) : (
              activeDistribution.map(([label, count], idx) => {
                const pct =
                  totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0;
                return (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm gap-2">
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-800 truncate">
                        {breakdownMode === 'location' && (
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        )}
                        <span className="truncate">{label}</span>
                      </span>
                      <span className="text-xs font-mono tabular-nums text-slate-500 shrink-0">
                        {count} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-purple-50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          idx % 2 === 0 ? 'bg-indigo-600' : 'bg-purple-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Actionable Queues: Pending Leaves + Active Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Pending Leave Approvals (5 cols) */}
        <section className="lg:col-span-5 bg-white border border-indigo-100 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Leave Approvals
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                {pendingLeaves.length} awaiting your decision
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('leave')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600 rounded"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingLeaves.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircle2 className="w-8 h-8 text-indigo-300 mx-auto" />
              <p className="mt-2 text-sm font-medium text-slate-700">
                All leave requests are reviewed
              </p>
              <p className="mt-1 text-xs text-slate-500">
                New employee time-off requests will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              <AnimatePresence initial={false}>
                {pendingLeaves.slice(0, 4).map((lv) => {
                  const emp = employeeMap.get(lv.employeeId);
                  const days = countInclusiveDays(lv.startDate, lv.endDate);
                  return (
                    <motion.li
                      key={lv.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.16 }}
                      className="px-6 py-4 space-y-3 hover:bg-[#FAF9FE] transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${getAvatarTone(
                            emp?.name || lv.employeeId
                          )}`}
                        >
                          {getInitials(emp?.name || 'Employee')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {emp?.name || 'Unknown Employee'}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                            <span className="font-medium text-indigo-700">{lv.type}</span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">
                              {formatDisplayDate(lv.startDate)}
                              {lv.endDate !== lv.startDate
                                ? ` – ${formatDisplayDate(lv.endDate)}`
                                : ''}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">
                              {days} {days === 1 ? 'day' : 'days'}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600 line-clamp-1">
                            {lv.reason}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-12">
                        <button
                          type="button"
                          onClick={() => onUpdateLeaveStatus(lv.id, 'Approved')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateLeaveStatus(lv.id, 'Rejected')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </section>

        {/* Active Tasks Queue (7 cols) */}
        <section className="lg:col-span-7 bg-white border border-indigo-100 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Active Tasks Queue
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                {completedTasksCount} of {tasks.length} deliverables completed
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('tasks')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600 rounded"
            >
              <span>Manage tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircle2 className="w-8 h-8 text-indigo-300 mx-auto" />
              <p className="mt-2 text-sm font-medium text-slate-700">
                No pending tasks remaining
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#FAF9FE] text-xs font-semibold text-slate-500">
                    <th className="py-3 px-6">Task</th>
                    <th className="py-3 px-4">Assignee</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Due</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {pendingTasks.slice(0, 5).map((task) => {
                    const assignee = employeeMap.get(task.assigneeId);
                    return (
                      <tr key={task.id} className="hover:bg-[#FAF9FE] transition-colors">
                        <td className="py-3.5 px-6">
                          <p className="font-medium text-slate-900">{task.title}</p>
                          <p
                            className={`text-xs mt-0.5 font-medium ${
                              task.priority === 'High'
                                ? 'text-rose-600'
                                : task.priority === 'Medium'
                                  ? 'text-amber-600'
                                  : 'text-slate-500'
                            }`}
                          >
                            {task.priority} priority
                          </p>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-semibold shrink-0 ${getAvatarTone(
                                assignee?.name || task.assigneeId
                              )}`}
                            >
                              {getInitials(assignee?.name || '?')}
                            </span>
                            <span className="text-xs font-medium text-slate-700">
                              {assignee?.name || 'Unassigned'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{task.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-slate-500 whitespace-nowrap">
                          {formatDisplayDate(task.dueDate)}
                        </td>
                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onCompleteTask(task.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-white hover:bg-indigo-600 px-2.5 py-1.5 rounded-md bg-purple-50 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Employee Support & Privacy Quick Access Strip */}
      <section className="bg-white border border-indigo-100 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <img
            src="/assets/aistudio/file_00000000662c8211b14a71774b8fa41d_db8a9449.png"
            alt="Aditya Yadav — Employee Support"
            referrerPolicy="no-referrer"
            className="w-12 h-14 rounded-xl object-cover object-top border border-indigo-100 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-indigo-600 shrink-0" />
              <h2 className="font-display text-sm sm:text-base font-semibold text-slate-900">
                Employee Support & Privacy Policy
              </h2>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
              <span className="font-medium text-slate-800">Aditya Yadav</span>
              <span aria-hidden="true">·</span>
              <a
                href="mailto:adityayadav638701@gmail.com"
                className="inline-flex items-center gap-1 hover:text-indigo-700"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                <span>adityayadav638701@gmail.com</span>
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="tel:6387016851"
                className="inline-flex items-center gap-1 font-mono tabular-nums hover:text-indigo-700"
              >
                <Phone className="w-3.5 h-3.5 text-purple-500" />
                <span>6387016851</span>
              </a>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('support')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-indigo-700 bg-[#F3F0FF] hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start md:self-auto"
        >
          <span>Open Support & Privacy</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
}
