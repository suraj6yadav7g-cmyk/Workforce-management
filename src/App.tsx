import React, { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { AttendanceView } from './components/AttendanceView';
import { DashboardView } from './components/DashboardView';
import { EmployeesView } from './components/EmployeesView';
import { Header } from './components/Header';
import { LeaveView } from './components/LeaveView';
import { ConfirmDialog } from './components/Modal';
import { ReportsView } from './components/ReportsView';
import { Sidebar } from './components/Sidebar';
import { SupportPrivacyView } from './components/SupportPrivacyView';
import { TasksView } from './components/TasksView';
import { useWorkforceStore } from './hooks/useWorkforceStore';
import { NavSection } from './types/workforce';
import { downloadCSV } from './utils/formatters';

export default function App() {
  const store = useWorkforceStore();
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal triggers controlled from header CTA or section buttons
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddLeaveOpen, setIsAddLeaveOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  // Subtle toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const notify = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  const handleSelectSection = useCallback((section: NavSection) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleHeaderPrimaryAction = () => {
    if (activeSection === 'dashboard') {
      handleSelectSection('employees');
      setIsAddEmployeeOpen(true);
    } else if (activeSection === 'employees') {
      setIsAddEmployeeOpen(true);
    } else if (activeSection === 'tasks') {
      setIsAddTaskOpen(true);
    } else if (activeSection === 'leave') {
      setIsAddLeaveOpen(true);
    } else if (activeSection === 'support') {
      document
        .getElementById('employee-support-section')
        ?.scrollIntoView({ behavior: 'smooth' });
    } else if (activeSection === 'reports') {
      const headers = [
        'Employee Code',
        'Name',
        'Department',
        'Present Days',
        'Late Days',
        'Absent Days',
        'Attendance Rate (%)',
      ];
      const rows = store.employees.map((emp) => {
        const records = store.attendance.filter((a) => a.employeeId === emp.id);
        const present = records.filter((r) => r.status === 'Present').length;
        const late = records.filter((r) => r.status === 'Late').length;
        const absent = records.filter((r) => r.status === 'Absent').length;
        const rate =
          records.length > 0
            ? Math.round(((present + late) / records.length) * 100)
            : 0;
        return [
          emp.employeeCode,
          emp.name,
          emp.department,
          present,
          late,
          absent,
          `${rate}%`,
        ];
      });
      downloadCSV('cadence-attendance-report.csv', headers, rows);
      notify('Downloaded attendance report CSV');
    }
  };

  const pendingLeavesCount = store.leaves.filter(
    (l) => l.status === 'Pending'
  ).length;
  const pendingTasksCount = store.tasks.filter(
    (t) => t.status !== 'Completed'
  ).length;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex bg-[#F8F7FC] text-slate-900">
        <Sidebar
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
          pendingLeavesCount={pendingLeavesCount}
          pendingTasksCount={pendingTasksCount}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onRequestReset={() => setIsResetDialogOpen(true)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            activeSection={activeSection}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onPrimaryAction={handleHeaderPrimaryAction}
          />

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeSection === 'dashboard' && (
                  <DashboardView
                    employees={store.employees}
                    attendance={store.attendance}
                    tasks={store.tasks}
                    leaves={store.leaves}
                    onNavigate={handleSelectSection}
                    onUpdateLeaveStatus={(id, status) => {
                      store.updateLeaveStatus(id, status);
                      notify(`Leave request ${status.toLowerCase()}`);
                    }}
                    onCompleteTask={(id) => {
                      store.updateTaskStatus(id, 'Completed');
                      notify('Task marked as completed');
                    }}
                  />
                )}

                {activeSection === 'employees' && (
                  <EmployeesView
                    employees={store.employees}
                    isAddModalOpen={isAddEmployeeOpen}
                    onOpenAddModal={() => setIsAddEmployeeOpen(true)}
                    onCloseAddModal={() => setIsAddEmployeeOpen(false)}
                    onAddEmployee={store.addEmployee}
                    onUpdateEmployee={store.updateEmployee}
                    onDeleteEmployee={store.deleteEmployee}
                    onNotify={notify}
                  />
                )}

                {activeSection === 'attendance' && (
                  <AttendanceView
                    employees={store.employees}
                    attendance={store.attendance}
                    onMarkAttendance={store.markAttendance}
                    onMarkAllPresent={store.markAllPresentForDate}
                    onNotify={notify}
                  />
                )}

                {activeSection === 'tasks' && (
                  <TasksView
                    tasks={store.tasks}
                    employees={store.employees}
                    isAddModalOpen={isAddTaskOpen}
                    onOpenAddModal={() => setIsAddTaskOpen(true)}
                    onCloseAddModal={() => setIsAddTaskOpen(false)}
                    onAddTask={store.addTask}
                    onUpdateTask={store.updateTask}
                    onUpdateTaskStatus={store.updateTaskStatus}
                    onDeleteTask={store.deleteTask}
                    onNotify={notify}
                  />
                )}

                {activeSection === 'leave' && (
                  <LeaveView
                    leaves={store.leaves}
                    employees={store.employees}
                    isAddModalOpen={isAddLeaveOpen}
                    onOpenAddModal={() => setIsAddLeaveOpen(true)}
                    onCloseAddModal={() => setIsAddLeaveOpen(false)}
                    onAddLeave={store.addLeaveRequest}
                    onUpdateLeaveStatus={store.updateLeaveStatus}
                    onDeleteLeave={store.deleteLeaveRequest}
                    onNotify={notify}
                  />
                )}

                {activeSection === 'reports' && (
                  <ReportsView
                    employees={store.employees}
                    attendance={store.attendance}
                    tasks={store.tasks}
                    leaves={store.leaves}
                    onNotify={notify}
                  />
                )}

                {activeSection === 'support' && (
                  <SupportPrivacyView
                    employees={store.employees}
                    supportTickets={store.supportTickets}
                    onAddTicket={store.addSupportTicket}
                    onUpdateTicketStatus={store.updateSupportTicketStatus}
                    onDeleteTicket={store.deleteSupportTicket}
                    onNotify={notify}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Reset Demo Data Confirmation */}
        <ConfirmDialog
          isOpen={isResetDialogOpen}
          onClose={() => setIsResetDialogOpen(false)}
          onConfirm={() => {
            store.resetDemoData();
            notify('Workspace restored to sample demo data');
          }}
          title="Reset Demo Data"
          message="This will restore all employees, attendance logs, tasks, and leave requests back to the initial sample demo dataset. Any custom changes will be replaced."
          confirmLabel="Reset Data"
          tone="indigo"
        />

        {/* Subtle action feedback toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.16 }}
              role="status"
              aria-live="polite"
              className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-indigo-950 text-white text-sm font-medium rounded-xl shadow-lg border border-indigo-800"
            >
              <CheckCircle2 className="w-4 h-4 text-purple-300 shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
