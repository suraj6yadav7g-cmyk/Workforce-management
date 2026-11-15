import React from 'react';
import {
  BarChart3,
  CalendarCheck2,
  CalendarClock,
  CheckSquare,
  LayoutDashboard,
  LifeBuoy,
  RotateCcw,
  Users,
  X,
} from 'lucide-react';
import { NavSection } from '../types/workforce';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  pendingLeavesCount: number;
  pendingTasksCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onRequestReset: () => void;
}

const NAV_ITEMS: {
  id: NavSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck2 },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'leave', label: 'Leave Requests', icon: CalendarClock },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'support', label: 'Support & Privacy', icon: LifeBuoy },
];

export function Sidebar({
  activeSection,
  onSelectSection,
  pendingLeavesCount,
  pendingTasksCount,
  isMobileOpen,
  onCloseMobile,
  onRequestReset,
}: SidebarProps) {
  const handleSelect = (section: NavSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-indigo-100/90">
      {/* Brand header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-indigo-100/80 shrink-0">
        <button
          type="button"
          onClick={() => handleSelect('dashboard')}
          className="flex items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-indigo-600 rounded-lg"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-display font-bold text-sm shadow-xs">
            C
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-slate-900 whitespace-nowrap">
            Cadence
          </span>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden p-2 -mr-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-purple-50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Primary navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const count =
            item.id === 'leave'
              ? pendingLeavesCount
              : item.id === 'tasks'
                ? pendingTasksCount
                : 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-purple-50 hover:text-indigo-900'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-indigo-100' : 'text-indigo-500/80'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </span>

              {count > 0 && (
                <span
                  className={`text-xs font-mono tabular-nums ${
                    isActive ? 'text-indigo-100' : 'text-indigo-600 font-semibold'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer utility */}
      <div className="p-4 border-t border-indigo-100/80 bg-[#FAF9FE] space-y-3 shrink-0">
        <div className="px-2">
          <p className="text-xs font-medium text-slate-700">Local Workspace</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Changes save automatically in your browser.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            onRequestReset();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-indigo-700 bg-white border border-indigo-200/80 rounded-lg hover:bg-purple-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile slide-over drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] h-full z-50">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
