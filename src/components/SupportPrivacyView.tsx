import React, { useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  LifeBuoy,
  Lock,
  Mail,
  Phone,
  Send,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react';
import {
  Employee,
  SupportCategory,
  SupportTicket,
  SupportTicketStatus,
} from '../types/workforce';
import { formatDisplayDate, getAvatarTone, getInitials } from '../utils/formatters';

interface SupportPrivacyViewProps {
  employees: Employee[];
  supportTickets: SupportTicket[];
  onAddTicket: (payload: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => void;
  onUpdateTicketStatus: (id: string, status: SupportTicketStatus) => void;
  onDeleteTicket: (id: string) => void;
  onNotify: (message: string) => void;
}

const SUPPORT_EMAIL = 'adityayadav638701@gmail.com';
const SUPPORT_PHONE = '6387016851';
const SUPPORT_PHOTO_PATH =
  '/assets/aistudio/file_00000000662c8211b14a71774b8fa41d_db8a9449.png';

const CATEGORIES: SupportCategory[] = [
  'HR & Payroll',
  'IT & Access',
  'Attendance & Leave',
  'Workplace Policy',
];

const PRIVACY_SECTIONS = [
  {
    number: '01',
    title: 'Workforce Data Collection & Purpose',
    body: 'Cadence Workforce collects only essential employment details—such as employee names, job roles, departments, job locations, contact details, daily attendance logs, assigned tasks, and leave requests—strictly for team coordination and HR administration.',
  },
  {
    number: '02',
    title: 'Local Browser Storage & Security',
    body: 'All directory records, attendance logs, tasks, leave approvals, and support tickets are stored locally inside your browser using localStorage. No employee records are transmitted to external third-party servers or tracking networks.',
  },
  {
    number: '03',
    title: 'Employee Access, Correction & Export Rights',
    body: 'Authorized workspace leads and employees can inspect, edit, or delete profile records at any time through Employee Management, and generate downloadable CSV copies of attendance and directory reports from the Reports workspace.',
  },
  {
    number: '04',
    title: 'Privacy Inquiries & Support Escalation',
    body: `Questions regarding employee data handling, record corrections, or workplace privacy policies can be sent directly to our Support & Privacy Officer at ${SUPPORT_EMAIL} or by phone at ${SUPPORT_PHONE}.`,
  },
];

interface PreparedEmail {
  mailtoHref: string;
  gmailHref: string;
  plainText: string;
  senderEmail: string;
  subject: string;
}

function buildEmailLinks(params: {
  employeeName: string;
  employeeDepartment: string;
  senderEmail: string;
  category: string;
  subject: string;
  message: string;
}): PreparedEmail {
  const fullSubject = `[${params.category}] ${params.subject}`;
  const bodyLines = [
    `Hello Aditya,`,
    ``,
    `Employee Support Request Details:`,
    `Employee: ${params.employeeName} (${params.employeeDepartment})`,
    `From Email: ${params.senderEmail}`,
    `Category: ${params.category}`,
    ``,
    `Message:`,
    params.message,
    ``,
    `— Sent via Cadence Workforce Support Desk`,
  ];
  const bodyText = bodyLines.join('\n');

  const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    fullSubject
  )}&body=${encodeURIComponent(bodyText)}`;

  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    SUPPORT_EMAIL
  )}&su=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(bodyText)}`;

  return {
    mailtoHref,
    gmailHref,
    plainText: `To: ${SUPPORT_EMAIL}\nFrom: ${params.senderEmail}\nSubject: ${fullSubject}\n\n${bodyText}`,
    senderEmail: params.senderEmail,
    subject: fullSubject,
  };
}

export function SupportPrivacyView({
  employees,
  supportTickets,
  onAddTicket,
  onUpdateTicketStatus,
  onDeleteTicket,
  onNotify,
}: SupportPrivacyViewProps) {
  const [imageError, setImageError] = useState(false);
  const [copiedField, setCopiedField] = useState<'email' | 'phone' | 'draft' | null>(
    null
  );

  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [senderEmail, setSenderEmail] = useState(employees[0]?.email || '');
  const [category, setCategory] = useState<SupportCategory>('HR & Payroll');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [lastPreparedEmail, setLastPreparedEmail] = useState<PreparedEmail | null>(
    null
  );

  const employeeMap = useMemo(
    () => new Map(employees.map((e) => [e.id, e])),
    [employees]
  );

  const handleEmployeeChange = (newId: string) => {
    setEmployeeId(newId);
    const matched = employeeMap.get(newId);
    if (matched?.email) {
      setSenderEmail(matched.email);
    }
  };

  const handleCopy = async (
    value: string,
    field: 'email' | 'phone' | 'draft',
    toastText: string
  ) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      onNotify(toastText);
      window.setTimeout(() => {
        setCopiedField((prev) => (prev === field ? null : prev));
      }, 2200);
    } catch {
      onNotify(toastText);
    }
  };

  const triggerMailto = (href: string) => {
    const link = document.createElement('a');
    link.href = href;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !senderEmail.trim() || !subject.trim() || !message.trim()) {
      setFormError(
        'Please select an employee, enter your sender email, subject, and message.'
      );
      return;
    }
    setFormError('');

    const selectedEmp = employeeMap.get(employeeId);
    const trimmedSender = senderEmail.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    onAddTicket({
      employeeId,
      senderEmail: trimmedSender,
      recipientEmail: SUPPORT_EMAIL,
      category,
      subject: trimmedSubject,
      message: trimmedMessage,
    });

    const prepared = buildEmailLinks({
      employeeName: selectedEmp?.name || 'Employee',
      employeeDepartment: selectedEmp?.department || 'Team',
      senderEmail: trimmedSender,
      category,
      subject: trimmedSubject,
      message: trimmedMessage,
    });

    setLastPreparedEmail(prepared);
    triggerMailto(prepared.mailtoHref);

    setSubject('');
    setMessage('');
    onNotify(`Prepared direct email to ${SUPPORT_EMAIL}`);
  };

  return (
    <div className="space-y-8">
      {/* Top Featured Contact & Support Officer Showcase */}
      <section
        aria-label="Employee Support Contact"
        className="bg-white border border-indigo-100 rounded-2xl overflow-hidden shadow-xs"
      >
        <div className="h-24 sm:h-28 bg-gradient-to-r from-[#1E1B4B] via-[#312E81] to-[#3B2F7F] relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 right-12 w-60 h-60 rounded-full bg-indigo-400/15 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-12 left-12 w-48 h-48 rounded-full bg-purple-400/15 blur-2xl"
          />
        </div>

        <div className="px-5 sm:px-8 pb-8 -mt-14 sm:-mt-16 relative flex flex-col items-center text-center">
          {/* Portrait Frame */}
          <div className="p-1.5 rounded-2xl bg-white shadow-lg ring-1 ring-indigo-100">
            <div className="w-48 sm:w-56 aspect-[4/5] rounded-xl overflow-hidden bg-indigo-50 flex items-center justify-center">
              {!imageError ? (
                <img
                  src={SUPPORT_PHOTO_PATH}
                  alt="Aditya Yadav — Employee Support & Privacy Contact"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col items-center justify-center p-4 text-indigo-800">
                  <User className="w-10 h-10 mb-2" />
                  <span className="font-display font-semibold text-sm">
                    Aditya Yadav
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 max-w-xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Aditya Yadav
            </h2>
            <p className="mt-1 text-sm text-indigo-700 font-semibold">
              Employee Support Lead & Privacy Officer
            </p>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Direct contact for employee support, HR & IT escalation, and workforce
              data privacy inquiries.
            </p>
          </div>

          {/* Non-Truncated Email & Contact Number UI Cards Directly Below Photo */}
          <div className="mt-6 w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {/* Support Email Card */}
            <div className="p-4 rounded-xl bg-[#F8F7FC] border border-indigo-100 hover:border-indigo-300 transition-colors flex flex-col justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#312E81] text-white flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500">
                    Direct Support Email
                  </p>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="mt-0.5 block text-sm font-semibold text-slate-900 hover:text-indigo-700 break-all"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-indigo-100/70">
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </a>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(SUPPORT_EMAIL, 'email', 'Support email copied')
                  }
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-white border border-indigo-100 hover:bg-purple-50 rounded-lg transition-colors whitespace-nowrap"
                >
                  {copiedField === 'email' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Contact Number Card */}
            <div className="p-4 rounded-xl bg-[#F8F7FC] border border-indigo-100 hover:border-indigo-300 transition-colors flex flex-col justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500">
                    Direct Contact Number
                  </p>
                  <a
                    href={`tel:${SUPPORT_PHONE}`}
                    className="mt-0.5 block text-base font-mono tabular-nums font-semibold text-slate-900 hover:text-indigo-700"
                  >
                    {SUPPORT_PHONE}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-indigo-100/70">
                <a
                  href={`tel:${SUPPORT_PHONE}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(SUPPORT_PHONE, 'phone', 'Contact number copied')
                  }
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-white border border-indigo-100 hover:bg-purple-50 rounded-lg transition-colors whitespace-nowrap"
                >
                  {copiedField === 'phone' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Employee Support Section */}
      <section
        id="employee-support-section"
        aria-label="Employee Support"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* Direct Email & Support Request Form (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-indigo-100 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-[#FAF9FE]">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900">
                Employee Support Desk
              </h3>
              <p className="text-xs text-slate-500">
                Direct email delivery to {SUPPORT_EMAIL}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitTicket} className="p-6 space-y-4">
            {formError && (
              <p className="text-xs font-medium text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-200">
                {formError}
              </p>
            )}

            {/* Pre-filled Recipient Support Email */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  To (Support Email)
                </label>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700">
                  <Lock className="w-3 h-3" />
                  <span>Pre-filled</span>
                </span>
              </div>
              <input
                type="email"
                value={SUPPORT_EMAIL}
                readOnly
                aria-label="Recipient support email"
                className="w-full px-3.5 py-2 text-sm font-medium text-indigo-900 bg-[#F3F0FF] border border-indigo-200/80 rounded-lg cursor-default focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Employee *
              </label>
              <select
                value={employeeId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Sender Email (Employee enters or confirms their own email) */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                From (Your Email Address) *
              </label>
              <input
                type="email"
                required
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Support Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SupportCategory)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Subject *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Update bank details or VPN access"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Message *
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe how Aditya & the support team can help..."
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#312E81] hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Send Direct Email & Submit</span>
            </button>

            {/* Fallback / Direct Mail Actions after submitting */}
            {lastPreparedEmail && (
              <div className="p-4 rounded-xl bg-[#F3F0FF] border border-indigo-200 space-y-2.5">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-700 mt-0.5 shrink-0" />
                  <div className="text-xs text-slate-700">
                    <p className="font-semibold text-indigo-950">
                      Direct Email Ready
                    </p>
                    <p className="mt-0.5">
                      Prepared from <span className="font-medium">{lastPreparedEmail.senderEmail}</span> to{' '}
                      <span className="font-medium break-all">{SUPPORT_EMAIL}</span>.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={lastPreparedEmail.mailtoHref}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open Mail App</span>
                  </a>
                  <a
                    href={lastPreparedEmail.gmailHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-800 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Gmail Web</span>
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        lastPreparedEmail.plainText,
                        'draft',
                        'Email draft copied to clipboard'
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {copiedField === 'draft' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Draft</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Active Support Requests Queue (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-indigo-100 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FAF9FE]">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900">
                Recent Support Requests
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                {supportTickets.filter((t) => t.status === 'Open').length} open ·{' '}
                {supportTickets.filter((t) => t.status === 'Resolved').length} resolved
              </p>
            </div>
            <span className="text-xs font-medium text-indigo-700">
              Mon–Fri · 9 AM – 6 PM
            </span>
          </div>

          {supportTickets.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircle2 className="w-8 h-8 text-indigo-300 mx-auto" />
              <p className="mt-2 text-sm font-medium text-slate-700">
                No support tickets yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Submit a request using the form to send an email to {SUPPORT_EMAIL}.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {supportTickets.map((ticket) => {
                const emp = employeeMap.get(ticket.employeeId);
                return (
                  <li
                    key={ticket.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF9FE] transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${getAvatarTone(
                          emp?.name || ticket.employeeId
                        )}`}
                      >
                        {getInitials(emp?.name || 'Employee')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {ticket.subject}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                          <span className="font-medium text-slate-700">
                            {emp?.name || 'Team Member'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="text-indigo-700 font-medium">
                            {ticket.category}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {formatDisplayDate(ticket.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 break-all">
                          From: <span className="text-slate-700">{ticket.senderEmail || emp?.email || '—'}</span>{' '}
                          <span aria-hidden="true">→</span>{' '}
                          To: <span className="text-indigo-700 font-medium">{ticket.recipientEmail || SUPPORT_EMAIL}</span>
                        </p>
                        <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                          {ticket.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pl-12 sm:pl-0">
                      <button
                        type="button"
                        onClick={() => {
                          const nextStatus: SupportTicketStatus =
                            ticket.status === 'Open' ? 'Resolved' : 'Open';
                          onUpdateTicketStatus(ticket.id, nextStatus);
                          onNotify(`Ticket marked as ${nextStatus}`);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                          ticket.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-[#F3F0FF] text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        {ticket.status === 'Resolved' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        <span>{ticket.status}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onDeleteTicket(ticket.id);
                          onNotify('Support ticket removed');
                        }}
                        aria-label={`Delete ${ticket.subject}`}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Privacy Policy Section */}
      <section
        aria-label="Privacy Policy"
        className="bg-white border border-indigo-100 rounded-xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF9FE]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#312E81] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900">
                Workforce Privacy Policy
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                How employee data, attendance records, and contact information are handled
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-800">
            <Lock className="w-3.5 h-3.5" />
            <span>Private Local Workspace</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {PRIVACY_SECTIONS.map((item) => (
            <div
              key={item.number}
              className="px-6 py-5 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6"
            >
              <div className="md:col-span-4">
                <h4 className="font-display text-sm font-semibold text-slate-900">
                  {item.number}. {item.title}
                </h4>
              </div>
              <div className="md:col-span-8">
                <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
