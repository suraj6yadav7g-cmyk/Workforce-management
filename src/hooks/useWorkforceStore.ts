import { useCallback, useEffect, useState } from 'react';
import { createSeedData, getRelativeDateISO } from '../data/seedData';
import {
  AttendanceRecord,
  AttendanceStatus,
  Employee,
  LeaveRequest,
  LeaveStatus,
  SupportTicket,
  SupportTicketStatus,
  TaskStatus,
  WorkTask,
  WorkforceData,
} from '../types/workforce';

const STORAGE_KEY = 'cadence_workforce_data_v1';

function loadInitialData(): WorkforceData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = createSeedData();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as Partial<WorkforceData>;
    if (
      Array.isArray(parsed.employees) &&
      Array.isArray(parsed.attendance) &&
      Array.isArray(parsed.tasks) &&
      Array.isArray(parsed.leaves)
    ) {
      const seeded = createSeedData();
      const seededById = new Map(
        seeded.employees.map((e) => [e.id, e.location])
      );
      const migratedEmployees = parsed.employees.map((emp) => ({
        ...emp,
        location: emp.location || seededById.get(emp.id) || 'San Francisco HQ',
      }));
      const migratedTickets = Array.isArray(parsed.supportTickets)
        ? parsed.supportTickets.map((t) => {
            const emp = migratedEmployees.find((e) => e.id === t.employeeId);
            return {
              ...t,
              senderEmail: t.senderEmail || emp?.email || '',
              recipientEmail: t.recipientEmail || 'adityayadav638701@gmail.com',
            };
          })
        : seeded.supportTickets;
      return {
        ...(parsed as WorkforceData),
        employees: migratedEmployees,
        supportTickets: migratedTickets,
      };
    }
  } catch {
    // Fallback to seed data if storage is unavailable or corrupted
  }
  return createSeedData();
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function useWorkforceStore() {
  const [data, setData] = useState<WorkforceData>(loadInitialData);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota errors cleanly
    }
  }, [data]);

  const addEmployee = useCallback(
    (payload: Omit<Employee, 'id' | 'employeeCode'>) => {
      setData((prev) => {
        const nextNum =
          prev.employees.reduce((max, emp) => {
            const parsed = parseInt(emp.employeeCode.replace(/\D/g, ''), 10);
            return Number.isNaN(parsed) ? max : Math.max(max, parsed);
          }, 100) + 1;
        const newEmp: Employee = {
          ...payload,
          id: generateId('emp'),
          employeeCode: `CAD-${nextNum}`,
        };
        return {
          ...prev,
          employees: [newEmp, ...prev.employees],
        };
      });
    },
    []
  );

  const updateEmployee = useCallback(
    (id: string, updates: Omit<Employee, 'id' | 'employeeCode'>) => {
      setData((prev) => ({
        ...prev,
        employees: prev.employees.map((emp) =>
          emp.id === id ? { ...emp, ...updates } : emp
        ),
      }));
    },
    []
  );

  const deleteEmployee = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      employees: prev.employees.filter((emp) => emp.id !== id),
      attendance: prev.attendance.filter((rec) => rec.employeeId !== id),
      tasks: prev.tasks.filter((task) => task.assigneeId !== id),
      leaves: prev.leaves.filter((lv) => lv.employeeId !== id),
    }));
  }, []);

  const markAttendance = useCallback(
    (employeeId: string, date: string, status: AttendanceStatus, notes?: string) => {
      const nowTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const checkInTime = status === 'Absent' ? '—' : nowTime;

      setData((prev) => {
        const existingIndex = prev.attendance.findIndex(
          (rec) => rec.employeeId === employeeId && rec.date === date
        );
        if (existingIndex >= 0) {
          const updated = [...prev.attendance];
          updated[existingIndex] = {
            ...updated[existingIndex],
            status,
            checkInTime:
              status === 'Absent'
                ? '—'
                : updated[existingIndex].checkInTime === '—'
                  ? nowTime
                  : updated[existingIndex].checkInTime,
            notes: notes !== undefined ? notes : updated[existingIndex].notes,
          };
          return { ...prev, attendance: updated };
        }
        const newRecord: AttendanceRecord = {
          id: generateId('att'),
          employeeId,
          date,
          status,
          checkInTime,
          notes,
        };
        return { ...prev, attendance: [newRecord, ...prev.attendance] };
      });
    },
    []
  );

  const markAllPresentForDate = useCallback((date: string) => {
    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    setData((prev) => {
      const existingByEmp = new Map(
        prev.attendance
          .filter((r) => r.date === date)
          .map((r) => [r.employeeId, r])
      );
      const otherDates = prev.attendance.filter((r) => r.date !== date);
      const updatedForDate: AttendanceRecord[] = prev.employees.map((emp) => {
        const existing = existingByEmp.get(emp.id);
        if (existing) {
          return {
            ...existing,
            status: 'Present',
            checkInTime: existing.checkInTime === '—' ? nowTime : existing.checkInTime,
          };
        }
        return {
          id: generateId('att'),
          employeeId: emp.id,
          date,
          status: 'Present',
          checkInTime: nowTime,
        };
      });
      return {
        ...prev,
        attendance: [...updatedForDate, ...otherDates],
      };
    });
  }, []);

  const addTask = useCallback(
    (payload: Omit<WorkTask, 'id' | 'createdAt'>) => {
      const newTask: WorkTask = {
        ...payload,
        id: generateId('task'),
        createdAt: getRelativeDateISO(0),
      };
      setData((prev) => ({
        ...prev,
        tasks: [newTask, ...prev.tasks],
      }));
    },
    []
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Omit<WorkTask, 'id' | 'createdAt'>>) => {
      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }));
    },
    []
  );

  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  }, []);

  const addLeaveRequest = useCallback(
    (payload: Omit<LeaveRequest, 'id' | 'status' | 'submittedAt'>) => {
      const newLeave: LeaveRequest = {
        ...payload,
        id: generateId('lv'),
        status: 'Pending',
        submittedAt: getRelativeDateISO(0),
      };
      setData((prev) => ({
        ...prev,
        leaves: [newLeave, ...prev.leaves],
      }));
    },
    []
  );

  const updateLeaveStatus = useCallback((id: string, status: LeaveStatus) => {
    setData((prev) => ({
      ...prev,
      leaves: prev.leaves.map((lv) => (lv.id === id ? { ...lv, status } : lv)),
    }));
  }, []);

  const deleteLeaveRequest = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      leaves: prev.leaves.filter((lv) => lv.id !== id),
    }));
  }, []);

  const addSupportTicket = useCallback(
    (payload: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => {
      const newTicket: SupportTicket = {
        ...payload,
        id: generateId('sup'),
        status: 'Open',
        createdAt: getRelativeDateISO(0),
      };
      setData((prev) => ({
        ...prev,
        supportTickets: [newTicket, ...prev.supportTickets],
      }));
    },
    []
  );

  const updateSupportTicketStatus = useCallback(
    (id: string, status: SupportTicketStatus) => {
      setData((prev) => ({
        ...prev,
        supportTickets: prev.supportTickets.map((t) =>
          t.id === id ? { ...t, status } : t
        ),
      }));
    },
    []
  );

  const deleteSupportTicket = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      supportTickets: prev.supportTickets.filter((t) => t.id !== id),
    }));
  }, []);

  const resetDemoData = useCallback(() => {
    const fresh = createSeedData();
    setData(fresh);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // Ignore
    }
  }, []);

  return {
    employees: data.employees,
    attendance: data.attendance,
    tasks: data.tasks,
    leaves: data.leaves,
    supportTickets: data.supportTickets,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    markAttendance,
    markAllPresentForDate,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    addLeaveRequest,
    updateLeaveStatus,
    deleteLeaveRequest,
    addSupportTicket,
    updateSupportTicketStatus,
    deleteSupportTicket,
    resetDemoData,
  };
}
