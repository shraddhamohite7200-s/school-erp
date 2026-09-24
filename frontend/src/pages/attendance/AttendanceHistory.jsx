import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceService } from '../../services/attendanceService';
import { classService } from '../../services/classService';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import Pagination from '../../components/common/Pagination';

export default function AttendanceHistory() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [history, setHistory] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadHistory();
  }, [dateFilter, classFilter, search]);

  const loadClasses = async () => {
    try {
      const res = await classService.getClasses();
      setClasses(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await attendanceService.getAttendanceHistory({
        date: dateFilter,
        classId: classFilter,
        search,
      });
      setHistory(res.data || []);
      setCurrentPage(1);
    } catch (err) {
      showToast('Failed to load attendance logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = 'Date,Student ID,Student Name,Class,Status\n';
    const rows = history
      .map(
        (h) => `"${h.date}","${h.studentId}","${h.studentName}","${h.className}","${h.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SchoolERP_Attendance_Log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Attendance log exported to CSV', 'info');
  };

  const paginated = history.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('/attendance')}
            className="flex items-center gap-1 text-xs text-[#1e3a8a] font-semibold hover:underline mb-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Daily Attendance Marking</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111c2d] tracking-tight">
            Attendance Log &amp; Register History
          </h1>
          <p className="text-xs sm:text-sm text-[#444651] mt-0.5">
            Audit trail of roll call entries recorded across sessions.
          </p>
        </div>

        <Button variant="outline" size="md" icon="download" onClick={handleExportCSV}>
          Export CSV Log
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Date */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#111c2d]">Date:</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-[#f0f3ff] text-xs font-semibold text-[#111c2d] border border-[#c5c5d3]/40 focus:outline-none focus:bg-white"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="text-xs text-[#1e3a8a] underline font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Class */}
          <div className="relative">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="appearance-none h-10 pl-3 pr-8 rounded-xl bg-[#f0f3ff] text-xs font-semibold text-[#111c2d] border border-[#c5c5d3]/40 focus:outline-none focus:bg-white cursor-pointer"
            >
              <option value="all">Class: All</option>
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[18px] text-[#757682] pointer-events-none">
              arrow_drop_down
            </span>
          </div>

          {/* Search */}
          <div className="relative max-w-xs flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#757682]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scholar..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#f0f3ff] text-xs text-[#111c2d] border border-[#c5c5d3]/40 focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        <span className="text-xs text-[#444651] font-semibold">
          Total logs: <span className="text-[#111c2d] font-bold">{history.length}</span>
        </span>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs overflow-hidden flex flex-col">
        {loading ? (
          <LoadingState message="Loading attendance logs..." />
        ) : paginated.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#757682]">
            No attendance records matching the selected parameters.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f0f3ff] text-[#444651] font-semibold border-b border-[#c5c5d3]/30">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Scholar Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4 text-right pr-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c5c5d3]/20">
                  {paginated.map((item) => (
                    <tr key={item.id} className="hover:bg-[#f0f3ff]/40 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-[#111c2d]">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-[#1e3a8a]">
                        {item.studentId}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-[#111c2d]">
                        {item.studentName}
                      </td>
                      <td className="py-2.5 px-4 text-[#444651]">{item.className}</td>
                      <td className="py-2.5 px-4 text-right pr-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            item.status === 'Present'
                              ? 'bg-[#85f8c4]/40 text-[#006c4a] border border-[#85f8c4]'
                              : 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === 'Present' ? 'bg-[#006c4a]' : 'bg-[#ba1a1a]'
                            }`}
                          ></span>
                          <span>{item.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={history.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
