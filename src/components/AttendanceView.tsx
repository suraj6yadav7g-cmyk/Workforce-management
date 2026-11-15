import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Check,
  CheckCheck,
  Clock,
  Search,
  X,
} from 'lucide-react';
import { getRelativeDateISO } from '../data/seedData';
import {
  AttendanceRecord,
  AttendanceStatus,
  Employee,
} from '../types/workforce';
import {
  formatDisplayDate,
  getAvatarTone,
  getInitials,
} from '../utils/formatters';

interface AttendanceViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  onMarkAttendance: (
    employeeId: string,
    date: string,
    status: AttendanceStatus
  ) => void;
  onMarkAllPresent: (date: string) => void;
  onNotify: (message: string) => void;
}

export function AttendanceView({
  employees,
  attendance,
  onMarkAttendance,
  onMarkAllPresent,
  onNotify,
}: AttendanceViewProps) {
  const [selectedDate, setSelectedDate] = useState<string>(getRelativeDateISO(0));
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'All' | AttendanceStatus>('All');

  const employeeMap = useMemo(
    () => new Map(employees.map((e) => [e.id, e])),
    [employees]
  );

  const dateRecordMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendance
      .filter((r) => r.date === selectedDate)
      .forEach((r) => map.set(r.employeeId, r));
    return map;
  }, [attendance, selectedDate]);

  const dateSummary = useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;
    employees.forEach((emp) => {
      const rec = dateRecordMap.get(emp.id);
      if (!rec) return;
      if (rec.status === 'Present') present += 1;
      else if (rec.status === 'Late') late += 1;
      else if (rec.status === 'Absent') absent += 1;
    });
    return {
      present,
      late,
      absent,
      unmarked: Math.max(0, employees.length - (present + late + absent)),
    };
  }, [employees, dateRecordMap]);

  const sortedHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    return [...attendance]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter((rec) => {
        if (historyStatusFilter !== 'All' && rec.status !== historyStatusFilter) {
          return false;
        }
        if (!q) return true;
        const emp = employeeMap.get(rec.employeeId);
        return (
          (emp?.name.toLowerCase().includes(q) ?? false) ||
          (emp?.department.toLowerCase().includes(q) ?? false) ||
          rec.date.includes(q)
        );
      });
  }, [attendance, historySearch, historyStatusFilter, employeeMap]);

  const handleMark = (
    employee: Employee,
    status: AttendanceStatus
  ) => {
    onMarkAttendance(employee.id, selectedDate, status);
    onNotify(`Marked ${employee.name} as ${status} for ${formatDisplayDate(selectedDate)}`);
  };

  return (
    <div className="space-y-8">
      {/* Daily Roll Call Section */}
      <section className="bg-white border border-indigo-100 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Daily Roll Call
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 tabular-nums">
              <span className="text-emerald-700 font-medium">
                {dateSummary.present} Present
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-700 font-medium">
                {dateSummary.late} Late
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-rose-600 font-medium">
                {dateSummary.absent} Absent
              </span>
              {dateSummary.unmarked > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{dateSummary.unmarked} Unmarked</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 bg-[#FAF9FE] border border-indigo-100 rounded-lg text-sm text-slate-700">
              <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                aria-label="Select attendance date"
                className="bg-transparent text-sm font-mono tabular-nums text-slate-800 focus:outline-none"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                onMarkAllPresent(selectedDate);
                onNotify(`Marked all employees Present for ${formatDisplayDate(selectedDate)}`);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Present</span>
            </button>
          </div>
        </div>

        {employees.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            Add employees first to start recording daily attendance.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {employees.map((emp) => {
              const rec = dateRecordMap.get(emp.id);
              const currentStatus = rec?.status;

              return (
                <li
                  key={emp.id}
                  className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF9FE] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${getAvatarTone(
                        emp.name
                      )}`}
                    >
                      {getInitials(emp.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {emp.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {emp.role} · {emp.department}
                        {rec && rec.checkInTime !== '—' && (
                          <span className="font-mono tabular-nums">
                            {' '}
                            · Checked in {rec.checkInTime}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Segmented Attendance Control */}
                  <div
                    className="inline-flex items-center gap-1 p-1 bg-[#F3F0FF] rounded-lg self-start sm:self-auto shrink-0"
                    role="group"
                    aria-label={`Attendance for ${emp.name}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleMark(emp, 'Present')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        currentStatus === 'Present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Present</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMark(emp, 'Late')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        currentStatus === 'Late'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Late</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMark(emp, 'Absent')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        currentStatus === 'Absent'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Absent</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Attendance History Section */}
      <section className="bg-white border border-indigo-100 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Attendance History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete log of recorded attendance across dates
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Filter by employee or date..."
                aria-label="Filter attendance history"
                className="w-full sm:w-56 pl-9 pr-3 py-1.5 text-xs bg-[#FAF9FE] border border-indigo-100 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            <div className="inline-flex items-center gap-1 p-1 bg-[#F3F0FF] rounded-lg self-start">
              {(['All', 'Present', 'Late', 'Absent'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setHistoryStatusFilter(status)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    historyStatusFilter === status
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {sortedHistory.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            No attendance records match your current filters.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#FAF9FE] z-10">
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500">
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-6">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {sortedHistory.map((rec) => {
                  const emp = employeeMap.get(rec.employeeId);
                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-[#FAF9FE] transition-colors"
                    >
                      <td className="py-3 px-6 font-mono text-xs tabular-nums text-slate-600 whitespace-nowrap">
                        {formatDisplayDate(rec.date)}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                        {emp?.name || 'Former Employee'}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {emp?.department || '—'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            rec.status === 'Present'
                              ? 'text-emerald-700'
                              : rec.status === 'Late'
                                ? 'text-amber-700'
                                : 'text-rose-600'
                          }`}
                        >
                          {rec.status === 'Present' && <Check className="w-3.5 h-3.5" />}
                          {rec.status === 'Late' && <Clock className="w-3.5 h-3.5" />}
                          {rec.status === 'Absent' && <X className="w-3.5 h-3.5" />}
                          <span>{rec.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs tabular-nums text-slate-600 whitespace-nowrap">
                        {rec.checkInTime}
                      </td>
                      <td className="py-3 px-6 text-xs text-slate-500">
                        {rec.notes || '—'}
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
  );
}
