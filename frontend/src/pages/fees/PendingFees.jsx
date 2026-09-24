import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { feeService } from '../../services/feeService';
import { classService } from '../../services/classService';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import Pagination from '../../components/common/Pagination';

export default function PendingFees() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [pendingList, setPendingList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [summary, setSummary] = useState({ totalPendingAmount: 0, studentCount: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState(searchParams.get('class') || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadPendingFees();
  }, [search, selectedClass]);

  const loadClasses = async () => {
    try {
      const res = await classService.getClasses();
      setClasses(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPendingFees = async () => {
    try {
      setLoading(true);
      const res = await feeService.getPendingFees({
        search,
        classId: selectedClass,
      });
      setPendingList(res.data || []);
      setSummary(res.summary || { totalPendingAmount: 0, studentCount: 0 });
      setCurrentPage(1);
    } catch (err) {
      showToast('Failed to load pending fees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers =
      'Student ID,Student Name,Class,Parent Contact,Total Fee,Paid Fee,Pending Balance\n';
    const rows = pendingList
      .map(
        (s) =>
          `"${s.studentId}","${s.firstName} ${s.lastName}","${s.className}","${s.parentName} (${s.phone})","${s.totalFee}","${s.paidFee}","${s.pendingFee}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SchoolERP_Pending_Fees_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Pending fees report exported', 'info');
  };

  const paginated = pendingList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] tracking-wider uppercase text-[#ba1a1a] font-bold bg-[#ffdad6] px-2 py-0.5 rounded-md">
              Accounts Receivable
            </span>
            <span className="text-[#c5c5d3]">•</span>
            <span className="text-xs text-[#444651]">Session 2026–27</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111c2d] tracking-tight">
            Pending Dues &amp; Outstanding Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#444651] mt-0.5">
            Monitor accounts requiring follow-up and collect outstanding balances.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="md" icon="download" onClick={handleExportCSV}>
            Export Arrears CSV
          </Button>
          <Button
            variant="primary"
            size="md"
            icon="payments"
            onClick={() => navigate('/fees/collect')}
          >
            Open Collect Fee Desk
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#444651] uppercase font-semibold">
              Scholars with Dues
            </span>
            <span className="text-2xl font-bold text-[#ba1a1a] font-numeric mt-0.5">
              {summary.studentCount}
            </span>
            <span className="text-[11px] text-[#ba1a1a] font-medium">Overdue accounts</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#ffdad6]/60 flex items-center justify-center text-[#ba1a1a]">
            <span className="material-symbols-outlined text-[22px]">pending_actions</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#444651] uppercase font-semibold">
              Total Outstanding Balance
            </span>
            <span className="text-2xl font-bold text-[#ba1a1a] font-numeric mt-0.5">
              {formatCurrency(summary.totalPendingAmount)}
            </span>
            <span className="text-[11px] text-[#444651]">Q3 Target Closure</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#ffdad6]/60 flex items-center justify-center text-[#ba1a1a]">
            <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#444651] uppercase font-semibold">
              Action Plan
            </span>
            <span className="text-base font-bold text-[#111c2d] mt-1">
              Active Reminder Campaign
            </span>
            <span className="text-[11px] text-[#006c4a]">SMS / WhatsApp Notifications</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#85f8c4]/30 flex items-center justify-center text-[#006c4a]">
            <span className="material-symbols-outlined text-[22px]">send</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative max-w-sm flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#757682]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scholar or guardian..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#f0f3ff] text-xs sm:text-sm text-[#111c2d] border border-[#c5c5d3]/40 focus:outline-none focus:bg-white"
            />
          </div>

          {/* Class Filter */}
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="appearance-none h-10 pl-3 pr-8 rounded-xl bg-[#f0f3ff] text-xs font-semibold text-[#111c2d] border border-[#c5c5d3]/40 focus:outline-none focus:bg-white cursor-pointer"
            >
              <option value="all">Class: All Cohorts</option>
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
        </div>

        <span className="text-xs text-[#444651] font-semibold">
          Showing <span className="text-[#111c2d] font-bold">{paginated.length}</span> of{' '}
          {pendingList.length} defaulters
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs overflow-hidden flex flex-col">
        {loading ? (
          <LoadingState message="Loading pending dues ledger..." />
        ) : paginated.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#757682]">
            🎉 Great job! No students with pending dues in this category.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f0f3ff] text-[#444651] font-semibold border-b border-[#c5c5d3]/30">
                    <th className="py-3 px-4">Student Name &amp; ID</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Guardian Contact</th>
                    <th className="py-3 px-4">Total Tuition</th>
                    <th className="py-3 px-4">Paid Amount</th>
                    <th className="py-3 px-4">Pending Balance</th>
                    <th className="py-3 px-4 text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c5c5d3]/20">
                  {paginated.map((student) => (
                    <tr key={student.id} className="hover:bg-[#f0f3ff]/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#dee8ff] text-[#1e3a8a] font-bold flex items-center justify-center text-xs">
                            {student.firstName[0]}
                            {student.lastName[0]}
                          </div>
                          <div className="flex flex-col">
                            <span
                              onClick={() => navigate(`/students/${student.id}`)}
                              className="font-semibold text-[#111c2d] hover:text-[#1e3a8a] cursor-pointer"
                            >
                              {student.firstName} {student.lastName}
                            </span>
                            <span className="font-mono text-[11px] text-[#757682]">
                              {student.studentId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-[#444651]">
                        <span className="px-2 py-0.5 rounded bg-[#f0f3ff] font-semibold text-[#111c2d]">
                          {student.className}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-[#111c2d]">{student.parentName}</span>
                          <a
                            href={`tel:${student.phone}`}
                            className="font-mono text-[11px] text-[#1e3a8a] hover:underline"
                          >
                            {student.phone}
                          </a>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-numeric text-[#111c2d]">
                        {formatCurrency(student.totalFee)}
                      </td>

                      <td className="py-3 px-4 font-numeric text-[#006c4a]">
                        {formatCurrency(student.paidFee)}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] font-bold font-numeric text-xs border border-[#ba1a1a]/20">
                          <span className="material-symbols-outlined text-[13px]">error</span>
                          {formatCurrency(student.pendingFee)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right pr-6">
                        <button
                          type="button"
                          onClick={() => navigate(`/fees/collect?studentId=${student.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#1e3a8a] text-white rounded-lg text-xs font-semibold hover:bg-[#00236f] transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[14px]">payments</span>
                          <span>Collect Fee</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={pendingList.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
