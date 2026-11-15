import React from 'react';
import { Menu, Plus, Download } from 'lucide-react';
import { NavSection } from '../types/workforce';

interface HeaderProps {
  activeSection: NavSection;
  onOpenMobileMenu: () => void;
  onPrimaryAction: () => void;
}

const SECTION_META: Record<
  NavSection,
  { title: string; subtitle: string; ctaLabel?: string; ctaIcon?: 'plus' | 'download' }
> = {
  dashboard: {
    title: 'Overview',
    subtitle: 'Workforce attendance, active tasks, and pending approvals',
    ctaLabel: 'Add Employee',
    ctaIcon: 'plus',
  },
  employees: {
    title: 'Employees',
    subtitle: 'Manage team directory, roles, and department assignments',
    ctaLabel: 'Add Employee',
    ctaIcon: 'plus',
  },
  attendance: {
    title: 'Attendance',
    subtitle: 'Daily roll-call tracking and historical check-in records',
  },
  tasks: {
    title: 'Task Management',
    subtitle: 'Assign work items and track completion progress',
    ctaLabel: 'Assign Task',
    ctaIcon: 'plus',
  },
  leave: {
    title: 'Leave Management',
    subtitle: 'Review time-off requests and approve or decline leave',
    ctaLabel: 'New Leave Request',
    ctaIcon: 'plus',
  },
  reports: {
    title: 'Reports',
    subtitle: 'Attendance summaries, department metrics, and CSV exports',
    ctaLabel: 'Export Attendance CSV',
    ctaIcon: 'download',
  },
  support: {
    title: 'Support & Privacy',
    subtitle: 'Employee helpdesk, direct contact details, and data privacy policy',
    ctaLabel: 'Submit Request',
    ctaIcon: 'plus',
  },
};

export function Header({
  activeSection,
  onOpenMobileMenu,
  onPrimaryAction,
}: HeaderProps) {
  const meta = SECTION_META[activeSection];
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-sm border-b border-indigo-100/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-indigo-700 hover:bg-purple-50 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="hidden sm:inline font-medium text-indigo-700">Workspace</span>
            <span className="hidden sm:inline text-slate-300" aria-hidden="true">/</span>
            <h1 className="font-display font-semibold text-base sm:text-lg text-slate-900 truncate">
              {meta.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span className="hidden md:inline text-xs font-mono tabular-nums text-slate-500 whitespace-nowrap">
          {todayLabel}
        </span>

        {meta.ctaLabel && (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            {meta.ctaIcon === 'download' ? (
              <Download className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>{meta.ctaLabel}</span>
          </button>
        )}
      </div>
    </header>
  );
}
