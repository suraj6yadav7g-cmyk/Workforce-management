import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { getRelativeDateISO } from '../data/seedData';
import {
  Employee,
  TaskPriority,
  TaskStatus,
  WorkTask,
} from '../types/workforce';
import {
  formatDisplayDate,
  getAvatarTone,
  getInitials,
} from '../utils/formatters';
import { ConfirmDialog, Modal } from './Modal';

interface TasksViewProps {
  tasks: WorkTask[];
  employees: Employee[];
  isAddModalOpen: boolean;
  onOpenAddModal: () => void;
  onCloseAddModal: () => void;
  onAddTask: (payload: Omit<WorkTask, 'id' | 'createdAt'>) => void;
  onUpdateTask: (
    id: string,
    updates: Partial<Omit<WorkTask, 'id' | 'createdAt'>>
  ) => void;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => void;
  onDeleteTask: (id: string) => void;
  onNotify: (message: string) => void;
}

const PRIORITIES: TaskPriority[] = ['High', 'Medium', 'Low'];
const STATUSES: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];

export function TasksView({
  tasks,
  employees,
  isAddModalOpen,
  onOpenAddModal,
  onCloseAddModal,
  onAddTask,
  onUpdateTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onNotify,
}: TasksViewProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState<WorkTask | null>(null);
  const [deletingTask, setDeletingTask] = useState<WorkTask | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [dueDate, setDueDate] = useState(getRelativeDateISO(3));
  const [formError, setFormError] = useState('');

  const employeeMap = useMemo(
    () => new Map(employees.map((e) => [e.id, e])),
    [employees]
  );

  const counts = useMemo(
    () => ({
      All: tasks.length,
      Pending: tasks.filter((t) => t.status === 'Pending').length,
      'In Progress': tasks.filter((t) => t.status === 'In Progress').length,
      Completed: tasks.filter((t) => t.status === 'Completed').length,
    }),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks.filter((task) => {
      if (statusFilter !== 'All' && task.status !== statusFilter) return false;
      if (!q) return true;
      const assignee = employeeMap.get(task.assigneeId);
      return (
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        (assignee?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [tasks, statusFilter, searchQuery, employeeMap]);

  const isModalVisible = isAddModalOpen || editingTask !== null;

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setAssigneeId(employees[0]?.id || '');
    setPriority('Medium');
    setStatus('Pending');
    setDueDate(getRelativeDateISO(3));
    setFormError('');
    onOpenAddModal();
  };

  const openEditModal = (task: WorkTask) => {
    onCloseAddModal();
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setAssigneeId(task.assigneeId);
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.dueDate);
    setFormError('');
  };

  const closeModal = () => {
    setEditingTask(null);
    setFormError('');
    onCloseAddModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assigneeId) {
      setFormError('Please provide a task title and select an assignee.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      assigneeId,
      priority,
      status,
      dueDate: dueDate || getRelativeDateISO(3),
    };

    if (editingTask) {
      onUpdateTask(editingTask.id, payload);
      onNotify(`Updated task "${payload.title}"`);
    } else {
      onAddTask(payload);
      onNotify(`Assigned task "${payload.title}"`);
    }
    closeModal();
  };

  return (
    <div className="space-y-6">
      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-indigo-100 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#F3F0FF] rounded-lg self-start">
          {(['All', 'Pending', 'In Progress', 'Completed'] as const).map((tab) => (
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

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks or assignees..."
              aria-label="Search tasks"
              className="w-full sm:w-64 pl-9 pr-3 py-2 text-sm bg-[#FAF9FE] border border-indigo-100 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Task</span>
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white border border-indigo-100 rounded-xl overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <CheckCircle2 className="w-9 h-9 text-indigo-300 mx-auto" />
            <p className="mt-3 text-sm font-semibold text-slate-800">
              No tasks found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Assign a new task to get your team moving.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredTasks.map((task) => {
              const assignee = employeeMap.get(task.assigneeId);
              return (
                <li
                  key={task.id}
                  className="px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#FAF9FE] transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        const next: TaskStatus =
                          task.status === 'Completed' ? 'Pending' : 'Completed';
                        onUpdateTaskStatus(task.id, next);
                        onNotify(
                          next === 'Completed'
                            ? `Completed "${task.title}"`
                            : `Reopened "${task.title}"`
                        );
                      }}
                      aria-label={
                        task.status === 'Completed'
                          ? `Reopen ${task.title}`
                          : `Mark ${task.title} completed`
                      }
                      className="mt-0.5 text-indigo-600 hover:text-indigo-800 shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600 rounded-full"
                    >
                      {task.status === 'Completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : task.status === 'In Progress' ? (
                        <Clock className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-500" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold ${
                          task.status === 'Completed'
                            ? 'text-slate-400 line-through'
                            : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                          <span
                            className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-semibold ${getAvatarTone(
                              assignee?.name || task.assigneeId
                            )}`}
                          >
                            {getInitials(assignee?.name || '?')}
                          </span>
                          {assignee?.name || 'Unassigned'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-medium ${
                            task.priority === 'High'
                              ? 'text-rose-600'
                              : task.priority === 'Medium'
                                ? 'text-amber-600'
                                : 'text-slate-600'
                          }`}
                        >
                          {task.priority} priority
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          Due {formatDisplayDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status selector & Edit/Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-8 lg:pl-0">
                    <select
                      value={task.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as TaskStatus;
                        onUpdateTaskStatus(task.id, newStatus);
                        onNotify(`Task moved to ${newStatus}`);
                      }}
                      aria-label={`Change status for ${task.title}`}
                      className="px-3 py-1.5 text-xs font-medium bg-[#FAF9FE] border border-indigo-100 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    >
                      {STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(task)}
                        aria-label={`Edit ${task.title}`}
                        className="p-2 text-slate-500 hover:text-indigo-700 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingTask(task)}
                        aria-label={`Delete ${task.title}`}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={isModalVisible}
        onClose={closeModal}
        title={editingTask ? 'Edit Task' : 'Assign New Task'}
        description="Assign deliverables and track completion across your workforce"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <p className="text-xs font-medium text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-200">
              {formError}
            </p>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Review Q4 security checklist"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add clear instructions or deliverables..."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Assign To *
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                {employees.length === 0 && <option value="">No employees available</option>}
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              {editingTask ? 'Save Changes' : 'Assign Task'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deletingTask !== null}
        onClose={() => setDeletingTask(null)}
        onConfirm={() => {
          if (deletingTask) {
            onDeleteTask(deletingTask.id);
            onNotify(`Deleted task "${deletingTask.title}"`);
          }
        }}
        title="Delete Task"
        message={
          deletingTask
            ? `Are you sure you want to permanently delete "${deletingTask.title}"?`
            : ''
        }
        confirmLabel="Delete Task"
        tone="danger"
      />
    </div>
  );
}
