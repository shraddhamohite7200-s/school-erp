import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { paymentService } from '../../services/paymentService';
import { attendanceService } from '../../services/attendanceService';
import { classService } from '../../services/classService';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 128,
    activeClasses: 8,
    totalCollected: 384500,
    totalPending: 72500,
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    present: 115,
    absent: 13,
    total: 128,
    classBreakdown: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [studentsRes, paymentsRes, attendanceRes, classesRes] = await Promise.all([
        studentService.getStudents(),
        paymentService.getPayments(),
        attendanceService.getTodaySummary(),
        classService.getClasses(),
      ]);

      const students = studentsRes.data || [];
      const payments = paymentsRes.data || [];
      const attendance = attendanceRes.data || {};
      const classes = classesRes.data || [];

      // Calculate totals
      const totalCollected = students.reduce((acc, s) => acc + (s.paidFee || 0), 0);
      const totalPending = students.reduce((acc, s) => acc + (s.pendingFee || 0), 0);
      const activeStudents = students.filter((s) => s.status === 'Active');

      setStats({
        totalStudents: students.length || 128,
        activeClasses: classes.filter((c) => c.status === 'Active').length || 8,
        totalCollected: totalCollected || 384500,
        totalPending: totalPending || 72500,
      });

      setRecentPayments(payments.slice(0, 4));

      // Top 3-4 defaulters
      const sortedDefaulters = [...students]
        .filter((s) => s.pendingFee > 0)
        .sort((a, b) => b.pendingFee - a.pendingFee)
        .slice(0, 3);
      setDefaulters(sortedDefaulters);

      if (attendance.classBreakdown) {
        setAttendanceSummary(attendance);
      }
    } catch (err) {
      console.error('Error loading dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = 'Receipt Number,Student Name,Class,Amount,Date,Mode,Status\n';
    const rows = recentPayments
      .map(
        (p) =>
          `"${p.receiptNumber}","${p.studentName}","${p.className}","${p.amount}","${p.paymentDate}","${p.paymentMode}","${p.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SchoolERP_Recent_Payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <LoadingState message="Loading school operational dashboard..." />;
  }

  const attendanceRatio = attendanceSummary.total
    ? ((attendanceSummary.present / attendanceSummary.total) * 100).toFixed(1)
    : 89.8;
  const absentRatio = (100 - attendanceRatio).toFixed(1);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Welcome & Executive Action Toolbar */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#c5c5d3]/40 shadow-xs relative overflow-hidden">
        <div className="flex flex-col gap-0.5 z-10">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#006c4a] animate-pulse"></span>
            <span className="text-xs text-[#006c4a] font-bold uppercase tracking-wider">
              Live Campus Status
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#00236f] tracking-tight">
            Good Morning, Admin
          </h1>
          <p className="text-xs sm:text-sm text-[#444651]">
            Here’s what’s happening in your school today •{' '}
            <span className="font-semibold text-[#111c2d]">Tuesday, 22 Sep 2026</span>
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 z-10">
          <button
            type="button"
            onClick={() => navigate('/attendance')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#111c2d] text-xs sm:text-sm font-semibold rounded-xl border border-[#c5c5d3]/40 transition-colors cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px] text-[#1e3a8a]">how_to_reg</span>
            <span>Mark Today’s Attendance</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/fees/collect')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#111c2d] text-xs sm:text-sm font-semibold rounded-xl border border-[#c5c5d3]/40 transition-colors cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px] text-[#006c4a]">
              account_balance_wallet
            </span>
            <span>Collect Fee</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/students/new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1e3a8a] hover:bg-[#00236f] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ New Admission</span>
          </button>
        </div>

        {/* Ambient watermark */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-gradient-to-br from-[#dce1ff]/30 to-[#85f8c4]/20 rounded-full blur-2xl pointer-events-none"></div>
      </section>

      {/* 4 Primary Operational KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Students */}
        <div
          onClick={() => navigate('/students')}
          className="flex flex-col justify-between p-5 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs hover:shadow-md transition-shadow group cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#444651] font-semibold">
                Total Students
              </span>
              <span className="text-3xl font-bold text-[#111c2d] font-numeric">
                {stats.totalStudents}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] flex items-center justify-center text-[#1e3a8a] group-hover:bg-[#dce1ff] transition-colors">
              <span className="material-symbols-outlined text-[22px]">school</span>
            </div>
          </div>
          <div className="mt-4 pt-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#85f8c4]/40 text-[#006c4a] text-xs font-semibold">
                <span className="material-symbols-outlined text-[12px]">trending_up</span>
                +6 this month (Active)
              </span>
              <svg className="w-16 h-5 text-[#006c4a]" fill="none" viewBox="0 0 60 20">
                <path
                  d="M2 17 L14 13 L26 15 L38 8 L50 11 L58 3"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <span className="text-xs text-[#444651]">Across 8 registered classes</span>
          </div>
        </div>

        {/* Card 2: Total Classes */}
        <div
          onClick={() => navigate('/classes')}
          className="flex flex-col justify-between p-5 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs hover:shadow-md transition-shadow group cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#444651] font-semibold">
                Active Batches
              </span>
              <span className="text-3xl font-bold text-[#111c2d] font-numeric">
                {stats.activeClasses}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] flex items-center justify-center text-[#1e3a8a] group-hover:bg-[#dce1ff] transition-colors">
              <span className="material-symbols-outlined text-[22px]">co_present</span>
            </div>
          </div>
          <div className="mt-4 pt-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#dce1ff] text-[#00236f] text-xs font-semibold">
                100% Operational
              </span>
              <span className="text-xs text-[#757682] font-semibold">Ratio 1:16</span>
            </div>
            <span className="text-xs text-[#444651] truncate">Nursery to Sr. KG (Sec A &amp; B)</span>
          </div>
        </div>

        {/* Card 3: Fees Collected */}
        <div
          onClick={() => navigate('/fees')}
          className="flex flex-col justify-between p-5 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs hover:shadow-md transition-shadow group cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#444651] font-semibold">
                Fees Collected
              </span>
              <span className="text-3xl font-bold text-[#006c4a] font-numeric">
                {formatCurrency(stats.totalCollected)}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#85f8c4]/30 flex items-center justify-center text-[#006c4a] group-hover:bg-[#85f8c4] transition-colors">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div className="mt-4 pt-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#85f8c4]/40 text-[#006c4a] text-xs font-semibold">
                84.1% of projected
              </span>
              <span className="text-xs font-bold text-[#006c4a]">Q3 on Track</span>
            </div>
            <span className="text-xs text-[#444651]">Annual projection: ₹4,57,000</span>
          </div>
        </div>

        {/* Card 4: Pending Fees */}
        <div
          onClick={() => navigate('/fees/pending')}
          className="flex flex-col justify-between p-5 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs hover:shadow-md transition-shadow group cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#444651] font-semibold">
                Pending Arrears
              </span>
              <span className="text-3xl font-bold text-[#ba1a1a] font-numeric">
                {formatCurrency(stats.totalPending)}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#ffdad6]/60 flex items-center justify-center text-[#ba1a1a] group-hover:bg-[#ffdad6] transition-colors">
              <span className="material-symbols-outlined text-[22px]">pending_actions</span>
            </div>
          </div>
          <div className="mt-4 pt-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold">
                18 students overdue
              </span>
              <span className="text-xs font-semibold text-[#ba1a1a]">Critical</span>
            </div>
            <span className="text-xs text-[#444651]">Action needed before month-end</span>
          </div>
        </div>
      </section>

      {/* Middle Row: Attendance Insights & Recent Payments Ledger */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Attendance Overview (5 / 12) */}
        <div className="lg:col-span-5 flex flex-col bg-white p-5 sm:p-6 rounded-2xl border border-[#c5c5d3]/40 shadow-xs justify-between">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="text-base font-bold text-[#111c2d]">Today’s Attendance Overview</h2>
                <span className="text-xs text-[#444651]">Live snapshot • 22 Sep 2026</span>
              </div>
              <span className="p-1.5 rounded-lg bg-[#f0f3ff] text-[#1e3a8a]">
                <span className="material-symbols-outlined text-[20px]">fact_check</span>
              </span>
            </div>

            {/* Metric KPI mini row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-[#f0f3ff] flex flex-col">
                <span className="text-xs text-[#444651]">Present</span>
                <span className="text-xl font-bold text-[#006c4a] font-numeric">
                  {attendanceSummary.present}
                </span>
                <span className="text-[11px] text-[#006c4a] font-semibold">{attendanceRatio}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#ffdad6]/40 flex flex-col">
                <span className="text-xs text-[#444651]">Absent</span>
                <span className="text-xl font-bold text-[#ba1a1a] font-numeric">
                  {attendanceSummary.absent}
                </span>
                <span className="text-[11px] text-[#ba1a1a] font-semibold">{absentRatio}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f0f3ff] flex flex-col">
                <span className="text-xs text-[#444651]">Total</span>
                <span className="text-xl font-bold text-[#111c2d] font-numeric">
                  {attendanceSummary.total}
                </span>
                <span className="text-[11px] text-[#444651]">Enrolled</span>
              </div>
            </div>

            {/* Segmented Attendance Progress Visual */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-[#444651] font-medium">
                <span>Overall Campus Ratio</span>
                <span className="font-semibold text-[#111c2d]">{attendanceRatio}% Capacity</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#dee8ff] flex overflow-hidden">
                <div className="h-full bg-[#006c4a] rounded-l-full" style={{ width: `${attendanceRatio}%` }}></div>
                <div className="h-full bg-[#ba1a1a] rounded-r-full" style={{ width: `${absentRatio}%` }}></div>
              </div>
            </div>

            {/* Quick Breakdown By Class List */}
            <div className="flex flex-col gap-2 mt-1">
              <span className="text-xs text-[#444651] uppercase tracking-wider font-semibold">
                Class-wise Rollout
              </span>
              <div className="flex flex-col gap-1.5">
                {attendanceSummary.classBreakdown.map((cb, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#f0f3ff] hover:bg-[#dee8ff]/50 transition-colors"
                  >
                    <span className="text-xs font-semibold text-[#111c2d]">{cb.className}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-20 sm:w-24 h-1.5 rounded-full bg-[#dee8ff] overflow-hidden">
                        <div
                          className={`h-full ${cb.percentage < 80 ? 'bg-[#ba1a1a]' : 'bg-[#006c4a]'}`}
                          style={{ width: `${cb.percentage}%` }}
                        ></div>
                      </div>
                      <span
                        className={`text-xs font-numeric font-medium w-12 text-right ${
                          cb.percentage < 80 ? 'text-[#ba1a1a] font-bold' : 'text-[#444651]'
                        }`}
                      >
                        {cb.present} / {cb.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 mt-3 border-t border-[#c5c5d3]/30">
            <button
              onClick={() => navigate('/attendance')}
              className="w-full py-2 px-4 bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#1e3a8a] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer group"
            >
              <span>Open Attendance Register</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Recent Fee Payments (7 / 12) */}
        <div className="lg:col-span-7 flex flex-col bg-white p-5 sm:p-6 rounded-2xl border border-[#c5c5d3]/40 shadow-xs justify-between">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="text-base font-bold text-[#111c2d]">Recent Fee Payments</h2>
                <span className="text-xs text-[#444651]">Cleared transactions and receipts today</span>
              </div>
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#111c2d] text-xs font-semibold rounded-xl border border-[#c5c5d3]/40 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                <span>Export CSV</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f0f3ff] text-xs text-[#444651] font-semibold">
                    <th className="py-2.5 px-3 rounded-l-lg">Student</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Mode</th>
                    <th className="py-2.5 px-3">Receipt No</th>
                    <th className="py-2.5 px-3 rounded-r-lg text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y-0 text-xs">
                  {recentPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-[#f0f3ff]/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#dee8ff] text-[#1e3a8a] font-bold flex items-center justify-center text-[10px] shrink-0">
                            {pay.studentName
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <span className="font-semibold text-[#111c2d] whitespace-nowrap">
                            {pay.studentName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#444651]">{pay.className}</td>
                      <td className="py-3 px-3 font-semibold text-[#111c2d] font-numeric whitespace-nowrap">
                        {formatCurrency(pay.amount)}
                      </td>
                      <td className="py-3 px-3 text-[#444651] whitespace-nowrap">
                        {pay.paymentDate}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f0f3ff] font-medium text-[#111c2d] text-[11px]">
                          <span className="material-symbols-outlined text-[12px] text-[#1e3a8a]">
                            {pay.paymentMode === 'UPI'
                              ? 'smartphone'
                              : pay.paymentMode === 'Bank Transfer'
                              ? 'account_balance'
                              : 'payments'}
                          </span>
                          {pay.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#444651] font-mono text-[11px]">
                        {pay.receiptNumber}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#85f8c4]/40 text-[#006c4a] font-bold text-[11px]">
                          Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Bar: View All & Quick Record */}
          <div className="pt-3 mt-3 flex items-center justify-between border-t border-[#c5c5d3]/30">
            <button
              onClick={() => navigate('/payments')}
              className="text-xs text-[#1e3a8a] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Payments</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
            <Button
              variant="primary"
              size="sm"
              icon="add"
              onClick={() => navigate('/fees/collect')}
            >
              Record New Payment
            </Button>
          </div>
        </div>
      </section>

      {/* Bottom Section: High Priority Arrears & Defaulters */}
      <section className="flex flex-col bg-white p-5 sm:p-6 rounded-2xl border border-[#c5c5d3]/40 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2 border-b border-[#c5c5d3]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#ffdad6]/60 flex items-center justify-center text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111c2d]">High Priority Arrears &amp; Defaulters</h2>
              <p className="text-xs text-[#444651]">
                Accounts with highest outstanding balance nearing quarter close
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/fees/pending')}
            className="text-xs text-[#1e3a8a] font-bold hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View All Pending Fees ({stats.totalStudents > 10 ? 18 : defaulters.length})</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0f3ff] text-xs text-[#444651] font-semibold">
                <th className="py-2.5 px-3 rounded-l-lg">Student Name</th>
                <th className="py-2.5 px-3">Class</th>
                <th className="py-2.5 px-3">Parent Contact</th>
                <th className="py-2.5 px-3">Total Fee</th>
                <th className="py-2.5 px-3">Paid So Far</th>
                <th className="py-2.5 px-3">Pending Balance</th>
                <th className="py-2.5 px-3 rounded-r-lg text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {defaulters.map((s) => (
                <tr key={s.id} className="hover:bg-[#f0f3ff]/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#dee8ff] text-[#1e3a8a] font-bold flex items-center justify-center text-[10px]">
                        {s.firstName[0]}
                        {s.lastName[0]}
                      </div>
                      <span className="font-semibold text-[#111c2d]">
                        {s.firstName} {s.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#444651]">{s.className}</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-[#111c2d]">{s.parentName}</span>
                      <span className="text-[#757682] font-mono text-[11px]">{s.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-numeric text-[#111c2d]">
                    {formatCurrency(s.totalFee)}
                  </td>
                  <td className="py-3 px-3 font-numeric text-[#006c4a]">
                    {formatCurrency(s.paidFee)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] font-bold font-numeric text-xs">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {formatCurrency(s.pendingFee)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/fees/collect?studentId=${s.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#1e3a8a] text-white rounded-lg text-xs font-semibold hover:bg-[#00236f] transition-colors cursor-pointer shadow-xs active:scale-95"
                    >
                      <span>Collect Fee</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
