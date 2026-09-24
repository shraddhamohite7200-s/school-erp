import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';

export default function Reports() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('fees'); // 'fees' | 'students' | 'attendance'
  const [loading, setLoading] = useState(true);

  // Data states
  const [studentReport, setStudentReport] = useState(null);
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [feeReport, setFeeReport] = useState(null);

  const [attendanceDate, setAttendanceDate] = useState('2026-09-22');

  useEffect(() => {
    loadAllReports();
  }, []);

  useEffect(() => {
    if (activeTab === 'attendance') {
      loadAttendance(attendanceDate);
    }
  }, [attendanceDate, activeTab]);

  const loadAllReports = async () => {
    try {
      setLoading(true);
      const [stuRes, feeRes, attRes] = await Promise.all([
        reportService.getStudentReport(),
        reportService.getFeeReport(),
        reportService.getAttendanceReport(attendanceDate),
      ]);
      setStudentReport(stuRes.data);
      setFeeReport(feeRes.data);
      setAttendanceReport(attRes.data);
    } catch (err) {
      showToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async (date) => {
    try {
      const res = await reportService.getAttendanceReport(date);
      setAttendanceReport(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const exportCurrentReport = () => {
    let headers = '';
    let rows = '';
    let filename = '';

    if (activeTab === 'fees') {
      headers = 'Class,Students,Total Fee,Collected,Pending,Collection Rate\n';
      rows = (feeReport?.classBreakdown || [])
        .map(
          (c) =>
            `"${c.className}","${c.studentCount}","${c.totalFee}","${c.paidFee}","${c.pendingFee}","${c.rate}"`
        )
        .join('\n');
      filename = `SchoolERP_Fee_Report_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (activeTab === 'students') {
      headers = 'Class,Total Scholars,Boys,Girls,Teacher Name\n';
      rows = (studentReport?.byClass || [])
        .map(
          (c) =>
            `"${c.className}","${c.total}","${c.boys}","${c.girls}","${c.teacherName}"`
        )
        .join('\n');
      filename = `SchoolERP_Student_Demographics_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      headers = 'Date,Student ID,Student Name,Class,Status\n';
      rows = (attendanceReport?.records || [])
        .map(
          (r) =>
            `"${attendanceReport.date}","${r.studentId}","${r.name}","${r.className}","${r.status}"`
        )
        .join('\n');
      filename = `SchoolERP_Attendance_Summary_${attendanceReport.date}.csv`;
    }

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    showToast('Report exported to CSV', 'info');
  };

  if (loading) {
    return <LoadingState message="Compiling institutional analytics & reports..." />;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] tracking-wider uppercase text-[#00236f] font-bold bg-[#dce1ff] px-2 py-0.5 rounded-md">
              Executive Analytics
            </span>
            <span className="text-[#c5c5d3]">•</span>
            <span className="text-xs text-[#444651]">Academic Year 2026–27</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111c2d] tracking-tight">
            Institutional Reports &amp; Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#444651] mt-0.5">
            Cross-sectional performance audits for admissions, attendance, and revenue.
          </p>
        </div>

        <Button variant="outline" size="md" icon="download" onClick={exportCurrentReport}>
          Export Report CSV
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#c5c5d3]/30 pb-2">
        <button
          onClick={() => setActiveTab('fees')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'fees'
              ? 'bg-[#1e3a8a] text-white shadow-xs'
              : 'text-[#444651] hover:bg-[#f0f3ff]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          <span>Fee &amp; Revenue Report</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'bg-[#1e3a8a] text-white shadow-xs'
              : 'text-[#444651] hover:bg-[#f0f3ff]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">school</span>
          <span>Student Demographics</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-[#1e3a8a] text-white shadow-xs'
              : 'text-[#444651] hover:bg-[#f0f3ff]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">fact_check</span>
          <span>Attendance Ratios</span>
        </button>
      </div>

      {/* Tab 1: Fees Report */}
      {activeTab === 'fees' && feeReport && (
        <div className="flex flex-col gap-5">
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex flex-col justify-between">
              <span className="text-xs uppercase text-[#757682] font-bold">Total Tuition Billed</span>
              <span className="text-2xl font-bold font-numeric text-[#111c2d] mt-1">
                {formatCurrency(feeReport.totalFee)}
              </span>
              <span className="text-[11px] text-[#444651] mt-1">Across 8 active cohorts</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex flex-col justify-between">
              <span className="text-xs uppercase text-[#757682] font-bold">Total Realized</span>
              <span className="text-2xl font-bold font-numeric text-[#006c4a] mt-1">
                {formatCurrency(feeReport.totalCollected)}
              </span>
              <span className="text-[11px] text-[#006c4a] font-semibold mt-1">
                {feeReport.collectionRate} Collected
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex flex-col justify-between">
              <span className="text-xs uppercase text-[#757682] font-bold">Outstanding Dues</span>
              <span className="text-2xl font-bold font-numeric text-[#ba1a1a] mt-1">
                {formatCurrency(feeReport.totalPending)}
              </span>
              <span className="text-[11px] text-[#ba1a1a] font-semibold mt-1">Action pending</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex flex-col justify-between">
              <span className="text-xs uppercase text-[#757682] font-bold">Collection Efficiency</span>
              <span className="text-2xl font-bold font-numeric text-[#00236f] mt-1">
                {feeReport.collectionRate}
              </span>
              <div className="w-full h-2 rounded-full bg-[#f0f3ff] mt-2 overflow-hidden">
                <div
                  className="h-full bg-[#006c4a] rounded-full"
                  style={{ width: feeReport.collectionRate }}
                ></div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs overflow-hidden">
            <div className="p-4 bg-[#f0f3ff] border-b border-[#c5c5d3]/30 font-bold text-sm text-[#111c2d]">
              Cohort-wise Revenue &amp; Recovery Analysis
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[#444651] font-semibold border-b border-[#c5c5d3]/30">
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Enrolled Scholars</th>
                    <th className="py-3 px-4">Total Billed</th>
                    <th className="py-3 px-4">Realized</th>
                    <th className="py-3 px-4">Pending</th>
                    <th className="py-3 px-4 text-right pr-6">Recovery Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c5c5d3]/20">
                  {feeReport.classBreakdown.map((c, i) => (
                    <tr key={i} className="hover:bg-[#f0f3ff]/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#111c2d]">{c.className}</td>
                      <td className="py-3 px-4 font-numeric text-[#444651]">{c.studentCount}</td>
                      <td className="py-3 px-4 font-numeric text-[#111c2d]">
                        {formatCurrency(c.totalFee)}
                      </td>
                      <td className="py-3 px-4 font-numeric text-[#006c4a] font-semibold">
                        {formatCurrency(c.paidFee)}
                      </td>
                      <td className="py-3 px-4 font-numeric text-[#ba1a1a] font-semibold">
                        {formatCurrency(c.pendingFee)}
                      </td>
                      <td className="py-3 px-4 text-right pr-6">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#85f8c4]/40 text-[#006c4a] font-bold text-[11px]">
                          {c.rate}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Students Demographics */}
      {activeTab === 'students' && studentReport && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs uppercase text-[#757682] font-bold">Total Registered</span>
                <span className="text-2xl font-bold font-numeric text-[#111c2d] mt-1">
                  {studentReport.totalStudents}
                </span>
                <span className="text-[11px] text-[#444651]">In institutional register</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] flex items-center justify-center text-[#1e3a8a]">
                <span className="material-symbols-outlined text-[22px]">badge</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs uppercase text-[#757682] font-bold">Active Scholars</span>
                <span className="text-2xl font-bold font-numeric text-[#006c4a] mt-1">
                  {studentReport.activeStudents}
                </span>
                <span className="text-[11px] text-[#006c4a] font-medium">96.8% In Good Standing</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#85f8c4]/30 flex items-center justify-center text-[#006c4a]">
                <span className="material-symbols-outlined text-[22px]">how_to_reg</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs uppercase text-[#757682] font-bold">Inactive / Suspended</span>
                <span className="text-2xl font-bold font-numeric text-[#757682] mt-1">
                  {studentReport.inactiveStudents}
                </span>
                <span className="text-[11px] text-[#757682]">Archived or transferred</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] flex items-center justify-center text-[#757682]">
                <span className="material-symbols-outlined text-[22px]">person_off</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs overflow-hidden">
            <div className="p-4 bg-[#f0f3ff] border-b border-[#c5c5d3]/30 font-bold text-sm text-[#111c2d]">
              Cohort Demographics &amp; Gender Ratios
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[#444651] font-semibold border-b border-[#c5c5d3]/30">
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Class Teacher</th>
                    <th className="py-3 px-4">Total Scholars</th>
                    <th className="py-3 px-4">Boys</th>
                    <th className="py-3 px-4">Girls</th>
                    <th className="py-3 px-4 text-right pr-6">Gender Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c5c5d3]/20">
                  {studentReport.byClass.map((c, i) => {
                    const boyRatio = c.total > 0 ? Math.round((c.boys / c.total) * 100) : 50;
                    return (
                      <tr key={i} className="hover:bg-[#f0f3ff]/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#111c2d]">{c.className}</td>
                        <td className="py-3 px-4 text-[#444651]">{c.teacherName}</td>
                        <td className="py-3 px-4 font-numeric font-bold text-[#111c2d]">
                          {c.total}
                        </td>
                        <td className="py-3 px-4 font-numeric text-[#1e3a8a] font-semibold">
                          {c.boys}
                        </td>
                        <td className="py-3 px-4 font-numeric text-[#ba1a1a] font-semibold">
                          {c.girls}
                        </td>
                        <td className="py-3 px-4 text-right pr-6">
                          <div className="inline-flex items-center gap-1.5">
                            <span className="text-[11px] text-[#757682]">{boyRatio}% M</span>
                            <div className="w-16 h-2 rounded-full bg-[#dee8ff] overflow-hidden flex">
                              <div
                                className="h-full bg-[#1e3a8a]"
                                style={{ width: `${boyRatio}%` }}
                              ></div>
                              <div
                                className="h-full bg-[#ba1a1a]"
                                style={{ width: `${100 - boyRatio}%` }}
                              ></div>
                            </div>
                            <span className="text-[11px] text-[#757682]">{100 - boyRatio}% F</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Attendance Reports */}
      {activeTab === 'attendance' && attendanceReport && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-[#c5c5d3]/40">
            <span className="text-xs font-semibold text-[#111c2d]">Select Audit Date:</span>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="h-10 px-3 rounded-xl bg-[#f0f3ff] text-xs font-semibold text-[#111c2d] border border-[#c5c5d3]/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex flex-col justify-between">
              <span className="text-xs uppercase text-[#757682] font-bold">Enrolled Scholars</span>
              <span className="text-2xl font-bold font-numeric text-[#111c2d] mt-1">
                {attendanceReport.total}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex flex-col justify-between">
              <span className="text-xs uppercase text-[#757682] font-bold">Present Scholars</span>
              <span className="text-2xl font-bold font-numeric text-[#006c4a] mt-1">
                {attendanceReport.present}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex flex-col justify-between">
              <span className="text-xs uppercase text-[#757682] font-bold">Absent Scholars</span>
              <span className="text-2xl font-bold font-numeric text-[#ba1a1a] mt-1">
                {attendanceReport.absent}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex flex-col justify-between">
              <span className="text-xs uppercase text-[#757682] font-bold">Campus Attendance</span>
              <span className="text-2xl font-bold font-numeric text-[#00236f] mt-1">
                {attendanceReport.rate}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs overflow-hidden">
            <div className="p-4 bg-[#f0f3ff] border-b border-[#c5c5d3]/30 font-bold text-sm text-[#111c2d]">
              Scholar Roll-Call Audit Log ({attendanceReport.date})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[#444651] font-semibold border-b border-[#c5c5d3]/30">
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4 text-right pr-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c5c5d3]/20">
                  {attendanceReport.records.map((r, idx) => (
                    <tr key={idx} className="hover:bg-[#f0f3ff]/40">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#1e3a8a]">
                        {r.studentId}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-[#111c2d]">{r.name}</td>
                      <td className="py-2.5 px-4 text-[#444651]">{r.className}</td>
                      <td className="py-2.5 px-4 text-right pr-6">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            r.status === 'Present'
                              ? 'bg-[#85f8c4]/40 text-[#006c4a]'
                              : 'bg-[#ffdad6] text-[#ba1a1a]'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
