import React, { useMemo, useState } from 'react';
import {
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { getRelativeDateISO } from '../data/seedData';
import {
  Department,
  Employee,
  EmployeeStatus,
} from '../types/workforce';
import {
  formatDisplayDate,
  getAvatarTone,
  getInitials,
} from '../utils/formatters';
import { ConfirmDialog, Modal } from './Modal';

interface EmployeesViewProps {
  employees: Employee[];
  isAddModalOpen: boolean;
  onOpenAddModal: () => void;
  onCloseAddModal: () => void;
  onAddEmployee: (payload: Omit<Employee, 'id' | 'employeeCode'>) => void;
  onUpdateEmployee: (id: string, payload: Omit<Employee, 'id' | 'employeeCode'>) => void;
  onDeleteEmployee: (id: string) => void;
  onNotify: (message: string) => void;
}

const DEPARTMENTS: Department[] = [
  'Engineering',
  'Product & Design',
  'Operations',
  'Marketing',
  'Finance',
  'Human Resources',
];

const STATUSES: EmployeeStatus[] = ['Active', 'Remote', 'On Leave'];

interface EmployeeFormState {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: Department;
  location: string;
  status: EmployeeStatus;
  joinDate: string;
}

const EMPTY_FORM: EmployeeFormState = {
  name: '',
  email: '',
  phone: '',
  role: '',
  department: 'Engineering',
  location: '',
  status: 'Active',
  joinDate: getRelativeDateISO(0),
};

export function EmployeesView({
  employees,
  isAddModalOpen,
  onOpenAddModal,
  onCloseAddModal,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onNotify,
}: EmployeesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const isModalVisible = isAddModalOpen || editingEmployee !== null;

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return employees.filter((emp) => {
      const matchesDept =
        departmentFilter === 'All' || emp.department === departmentFilter;
      if (!matchesDept) return false;
      if (!q) return true;
      return (
        emp.name.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.location.toLowerCase().includes(q) ||
        emp.employeeCode.toLowerCase().includes(q)
      );
    });
  }, [employees, searchQuery, departmentFilter]);

  const openCreateModal = () => {
    setEditingEmployee(null);
    setForm({ ...EMPTY_FORM, joinDate: getRelativeDateISO(0) });
    setFormError('');
    onOpenAddModal();
  };

  const openEditModal = (emp: Employee) => {
    onCloseAddModal();
    setEditingEmployee(emp);
    setForm({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      role: emp.role,
      department: emp.department,
      location: emp.location,
      status: emp.status,
      joinDate: emp.joinDate,
    });
    setFormError('');
  };

  const closeModal = () => {
    setEditingEmployee(null);
    setFormError('');
    onCloseAddModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.role.trim()) {
      setFormError('Please fill in Name, Email, and Job Role.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || '—',
      role: form.role.trim(),
      department: form.department,
      location: form.location.trim() || 'San Francisco HQ',
      status: form.status,
      joinDate: form.joinDate || getRelativeDateISO(0),
    };

    if (editingEmployee) {
      onUpdateEmployee(editingEmployee.id, payload);
      onNotify(`Updated ${payload.name}'s profile`);
    } else {
      onAddEmployee(payload);
      onNotify(`Added ${payload.name} to directory`);
    }
    closeModal();
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white border border-indigo-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, role, location, email, or ID..."
              aria-label="Search employees"
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#FAF9FE] border border-indigo-100 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            aria-label="Filter by department"
            className="px-3.5 py-2 text-sm bg-[#FAF9FE] border border-indigo-100 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4">
          <span className="text-xs font-mono tabular-nums text-slate-500 whitespace-nowrap">
            {filteredEmployees.length} of {employees.length} shown
          </span>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Employee Directory Table / Responsive List */}
      <div className="bg-white border border-indigo-100 rounded-xl overflow-hidden">
        {filteredEmployees.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Users className="w-9 h-9 text-indigo-300 mx-auto" />
            <p className="mt-3 text-sm font-semibold text-slate-800">
              No matching employees found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your search query or add a new team member.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              {(searchQuery || departmentFilter !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setDepartmentFilter('All');
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              )}
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Employee</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#FAF9FE] text-xs font-semibold text-slate-500">
                    <th className="py-3.5 px-6">Employee</th>
                    <th className="py-3.5 px-4">Role & Department</th>
                    <th className="py-3.5 px-4">Job Location</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Joined</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-[#FAF9FE] transition-colors"
                    >
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${getAvatarTone(
                              emp.name
                            )}`}
                          >
                            {getInitials(emp.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {emp.name}
                            </p>
                            <p className="text-xs font-mono tabular-nums text-slate-500">
                              {emp.employeeCode}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800">{emp.role}</p>
                        <p className="text-xs text-slate-500">{emp.department}</p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{emp.location}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-xs text-slate-700">{emp.email}</p>
                        <p className="text-xs font-mono tabular-nums text-slate-500 mt-0.5">
                          {emp.phone}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-medium ${
                            emp.status === 'Active'
                              ? 'text-emerald-700'
                              : emp.status === 'Remote'
                                ? 'text-indigo-700'
                                : 'text-amber-700'
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-slate-500 whitespace-nowrap">
                        {formatDisplayDate(emp.joinDate)}
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(emp)}
                            aria-label={`Edit ${emp.name}`}
                            className="p-2 text-slate-500 hover:text-indigo-700 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingEmployee(emp)}
                            aria-label={`Delete ${emp.name}`}
                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <ul className="md:hidden divide-y divide-slate-100">
              {filteredEmployees.map((emp) => (
                <li key={emp.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${getAvatarTone(
                          emp.name
                        )}`}
                      >
                        {getInitials(emp.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {emp.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {emp.role} · {emp.department}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium shrink-0 ${
                        emp.status === 'Active'
                          ? 'text-emerald-700'
                          : emp.status === 'Remote'
                            ? 'text-indigo-700'
                            : 'text-amber-700'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      {emp.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {emp.email}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {emp.phone}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs font-mono tabular-nums text-slate-500">
                      {emp.employeeCode} · Joined {formatDisplayDate(emp.joinDate)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(emp)}
                        className="px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-purple-50 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingEmployee(emp)}
                        className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isModalVisible}
        onClose={closeModal}
        title={editingEmployee ? 'Edit Employee Profile' : 'Add New Employee'}
        description={
          editingEmployee
            ? `Updating details for ${editingEmployee.employeeCode}`
            : 'Create a new team member profile in your workspace'
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <p className="text-xs font-medium text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-200">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Jordan Alvarez"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Work Email *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jordan@cadence.io"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (415) 555-0142"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Job Role *
              </label>
              <input
                type="text"
                required
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. Product Engineer"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Department
              </label>
              <select
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value as Department })
                }
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Job Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. San Francisco HQ"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Work Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as EmployeeStatus })
                }
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Join Date
              </label>
              <input
                type="date"
                value={form.joinDate}
                onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              {editingEmployee ? 'Save Changes' : 'Add Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deletingEmployee !== null}
        onClose={() => setDeletingEmployee(null)}
        onConfirm={() => {
          if (deletingEmployee) {
            onDeleteEmployee(deletingEmployee.id);
            onNotify(`Removed ${deletingEmployee.name} from directory`);
          }
        }}
        title="Remove Employee"
        message={
          deletingEmployee
            ? `Are you sure you want to remove ${deletingEmployee.name} (${deletingEmployee.employeeCode})? Their associated attendance, tasks, and leave records will also be removed.`
            : ''
        }
        confirmLabel="Remove Employee"
        tone="danger"
      />
    </div>
  );
}
