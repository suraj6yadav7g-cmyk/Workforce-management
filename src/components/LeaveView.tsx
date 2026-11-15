import React, { useMemo, useState } from 'react';
import {
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { getRelativeDateISO } from '../data/seedData';
import {
  Employee,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
} from '../types/workforce';
import {
  countInclusiveDays,
  formatDisplayDate,
  getAvatarTone,
  getInitials,
} from '../utils/formatters';
import { Modal } from './Modal';

interface LeaveViewProps {
  leaves: LeaveRequest[];
  employees: Employee[];
  isAddModalOpen: boolean;
  onOpenAddModal: () => void;
  onCloseAddModal: () => void;
  onAddLeave: (
    payload: Omit<LeaveRequest, 'id' | 'status' | 'submittedAt'>
  ) => void;
  onUpdateLeaveStatus: (id: string, status: LeaveStatus) => void;
  onDeleteLeave: (id: string) => void;
  onNotify: (message: string) => void;
}

const LEAVE_TYPES: LeaveType[] = [
  'Annual Leave',
  'Sick Leave',
  'Personal Leave',
  'Remote Work',
];

export function LeaveView({
  leaves,
  employees,
  isAddModalOpen,
  onOpenAddModal,
  onCloseAddModal,
  onAddLeave,
  onUpdateLeaveStatus,
  onDeleteLeave,
  onNotify,
}: LeaveViewProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | LeaveStatus>('All');
  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual Leave');
  const [startDate, setStartDate] = useState(getRelativeDateISO(2));
  const [endDate, setEndDate] = useState(getRelativeDateISO(3));
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');

  const employeeMap = useMemo(
    () => new Map(employees.map((e) => [e.id, e])),
    [employees]
  );

  const counts = useMemo(
    () => ({
      All: leaves.length,
      Pending: leaves.filter((l) => l.status === 'Pending').length,
      Approved: leaves.filter((l) => l.status === 'Approved').length,
      Rejected: leaves.filter((l) => l.status === 'Rejected').length,
    }),
    [leaves]
  );

  const filteredLeaves = useMemo(() => {
    return leaves.filter((lv) =>
      statusFilter === 'All' ? true : lv.status === statusFilter
    );
  }, [leaves, statusFilter]);

  const openModal = () => {
    setEmployeeId(employees[0]?.id || '');
    setLeaveType('Annual Leave');
    setStartDate(getRelativeDateISO(2));
    setEndDate(getRelativeDateISO(3));
    setReason('');
    setFormError('');
    onOpenAddModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !startDate || !endDate || !reason.trim()) {
      setFormError('Please fill in all required leave details.');
      return;
    }
    if (endDate < startDate) {
      setFormError('End date cannot be earlier than start date.');
      return;
    }
    onAddLeave({
      employeeId,
      type: leaveType,
      startDate,
      endDate,
      reason: reason.trim(),
    });
    const emp = employeeMap.get(employeeId);
    onNotify(`Submitted leave request for ${emp?.name || 'employee'}`);
    onCloseAddModal();
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#F3F0FF] rounded-lg self-start">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap tabular-nums ${
                statusFilter === tab
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <Plus className="w-4 h-4" />
          <span>New Leave Request</span>
        </button>
      </div>

      {/* Leave Requests List */}
      <div className="bg-white border border-indigo-100 rounded-xl overflow-hidden">
        {filteredLeaves.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <CalendarClock className="w-9 h-9 text-indigo-300 mx-auto" />
            <p className="mt-3 text-sm font-semibold text-slate-800">
              No leave requests in this view
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Submit a new time-off request or switch status filters.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredLeaves.map((lv) => {
              const emp = employeeMap.get(lv.employeeId);
              const days = countInclusiveDays(lv.startDate, lv.endDate);
              return (
                <li
                  key={lv.id}
                  className="px-6 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#FAF9FE] transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${getAvatarTone(
                        emp?.name || lv.employeeId
                      )}`}
                    >
                      {getInitials(emp?.name || '?')}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <p className="text-sm font-semibold text-slate-900">
                          {emp?.name || 'Unknown Employee'}
                        </p>
                        <span className="text-xs text-slate-400" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-xs text-slate-500">
                          {emp?.department || 'Team'}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600">
                        <span className="font-medium text-indigo-700">{lv.type}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {formatDisplayDate(lv.startDate)}
                          {lv.endDate !== lv.startDate
                            ? ` to ${formatDisplayDate(lv.endDate)}`
                            : ''}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums text-slate-500">
                          {days} {days === 1 ? 'day' : 'days'}
                        </span>
                      </div>

                      <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                        {lv.reason}
                      </p>
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 shrink-0 pl-13 lg:pl-0">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                        lv.status === 'Approved'
                          ? 'text-emerald-700'
                          : lv.status === 'Rejected'
                            ? 'text-rose-600'
                            : 'text-amber-700'
                      }`}
                    >
                      {lv.status === 'Approved' && <CheckCircle2 className="w-4 h-4" />}
                      {lv.status === 'Rejected' && <XCircle className="w-4 h-4" />}
                      {lv.status === 'Pending' && <Clock className="w-4 h-4" />}
                      <span>{lv.status}</span>
                    </span>

                    {lv.status === 'Pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateLeaveStatus(lv.id, 'Approved');
                            onNotify(`Approved leave for ${emp?.name || 'employee'}`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateLeaveStatus(lv.id, 'Rejected');
                            onNotify(`Rejected leave for ${emp?.name || 'employee'}`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateLeaveStatus(lv.id, 'Pending');
                            onNotify(`Reopened leave request for ${emp?.name || 'employee'}`);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-purple-50 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Reopen
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteLeave(lv.id);
                            onNotify('Leave request removed');
                          }}
                          aria-label="Delete leave request"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* New Leave Request Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        title="Submit Leave Request"
        description="Log a new employee time-off or remote work request"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <p className="text-xs font-medium text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-200">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Employee *
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Leave Type
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                {LEAVE_TYPES.map((lt) => (
                  <option key={lt} value={lt}>
                    {lt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                End Date *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Reason *
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe the reason for leave..."
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCloseAddModal}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
