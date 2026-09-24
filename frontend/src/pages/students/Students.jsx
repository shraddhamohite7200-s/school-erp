import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate, calculateAge } from '../../utils/formatters';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Pagination from '../../components/common/Pagination';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';

export default function Students() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFeeStatus, setSelectedFeeStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Deactivate Modal state
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [search, selectedClass, selectedStatus, selectedFeeStatus]);

  // Sync search param if URL updates
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null && urlSearch !== search) {
      setSearch(urlSearch);
    }
  }, [searchParams]);

  const loadClasses = async () => {
    try {
      const res = await classService.getClasses();
      setClasses(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await studentService.getStudents({
        search,
        classId: selectedClass,
        status: selectedStatus,
        feeStatus: selectedFeeStatus,
      });
      setStudents(res.data || []);
      setCurrentPage(1);
    } catch (err) {
      showToast('Failed to load students list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      setDeactivating(true);
      const res = await studentService.deactivateStudent(deactivateTarget.id);
      showToast(
        `Student ${deactivateTarget.firstName} ${deactivateTarget.lastName} is now ${res.data.status}`,
        'success'
      );
      setDeactivateTarget(null);
      loadStudents();
    } catch (err) {
      showToast(err.message || 'Failed to update student status', 'error');
    } finally {
      setDeactivating(false);
    }
  };

  const handleExportCSV = () => {
    const headers =
      'Student ID,Name,Gender,DOB,Class,Parent,Phone,Admission Date,Fee Status,Status\n';
    const rows = students
      .map(
        (s) =>
          `"${s.studentId}","${s.firstName} ${s.lastName}","${s.gender}","${s.dateOfBirth}","${s.className}","${s.parentName}","${s.phone}","${s.admissionDate}","${s.feeStatus}","${s.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SchoolERP_Students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Students directory exported to CSV', 'info');
  };

  // Metrics
  const totalRoster = students.length;
  const activeScholars = students.filter((s) => s.status === 'Active').length;
  const feeCleared = students.filter((s) => s.feeStatus === 'Clear').length;
  const pendingLedgerCount = students.filter((s) => s.feeStatus === 'Pending').length;
  const pendingTotalAmount = students.reduce((acc, s) => acc + (s.pendingFee || 0), 0);

  // Pagination Slice
  const paginatedStudents = students.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex flex-col w-full relative gap-5">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] tracking-wider uppercase text-[#00236f] font-bold bg-[#dce1ff] px-2 py-0.5 rounded-md">
              Enrollment &amp; Roster
            </span>
            <span className="text-[#c5c5d3]">•</span>
            <span className="text-xs text-[#444651] font-medium">Session 2026–27</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111c2d] tracking-tight">
            Students Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#444651] mt-0.5 max-w-2xl">
            Manage student admissions, biographical profiles, and linked parent records with real-time
            fee compliance status.
          </p>
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-xl bg-[#f0f3ff] text-[#111c2d] text-xs font-semibold hover:bg-[#dee8ff] border border-[#c5c5d3]/40 transition-all shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#444651]">download</span>
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/students/new')}
            className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-[#1e3a8a] text-white text-xs font-semibold hover:bg-[#00236f] transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Add New Student</span>
          </button>
        </div>
      </div>

      {/* Key Highlight KPI Badges Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#444651] uppercase font-semibold">Total Roster</span>
            <span className="text-2xl font-bold text-[#111c2d] font-numeric mt-0.5">
              {totalRoster}
            </span>
            <span className="text-[11px] text-[#006c4a] font-medium">Full Capacity: 140</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] flex items-center justify-center text-[#1e3a8a]">
            <span className="material-symbols-outlined text-[22px]">badge</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#444651] uppercase font-semibold">Active Scholars</span>
            <span className="text-2xl font-bold text-[#006c4a] font-numeric mt-0.5">
              {activeScholars}
            </span>
            <span className="text-[11px] text-[#444651]">
              {totalRoster - activeScholars} Inactive
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#85f8c4]/30 flex items-center justify-center text-[#006c4a]">
            <span className="material-symbols-outlined text-[22px]">how_to_reg</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#444651] uppercase font-semibold">Fee Cleared</span>
            <span className="text-2xl font-bold text-[#111c2d] font-numeric mt-0.5">
              {feeCleared}
            </span>
            <span className="text-[11px] text-[#006c4a] font-semibold">
              {totalRoster > 0 ? ((feeCleared / totalRoster) * 100).toFixed(1) : 0}% Compliance
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] flex items-center justify-center text-[#1e3a8a]">
            <span className="material-symbols-outlined text-[22px]">price_check</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#444651] uppercase font-semibold">Pending Ledger</span>
            <span className="text-2xl font-bold text-[#442100] font-numeric mt-0.5">
              {pendingLedgerCount}
            </span>
            <span className="text-[11px] text-[#442100] bg-[#ffdcc3] px-1 rounded font-medium">
              {formatCurrency(pendingTotalAmount)} Dues
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#ffdcc3]/50 flex items-center justify-center text-[#442100]">
            <span className="material-symbols-outlined text-[22px]">pending_actions</span>
          </div>
        </div>
      </div>

      {/* Filter & Control Toolbar Panel */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#757682]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name, ID, or phone..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#f0f3ff] text-xs sm:text-sm text-[#111c2d] placeholder:text-[#757682] border border-[#c5c5d3]/40 focus:outline-none focus:bg-white focus:border-[#1e3a8a] shadow-2xs transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter */}
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="appearance-none h-10 pl-3 pr-8 rounded-xl bg-[#f0f3ff] text-xs font-semibold text-[#111c2d] border border-[#c5c5d3]/40 cursor-pointer focus:outline-none focus:bg-white"
            >
              <option value="all">Class: All Classes</option>
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

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none h-10 pl-3 pr-8 rounded-xl bg-[#f0f3ff] text-xs font-semibold text-[#111c2d] border border-[#c5c5d3]/40 cursor-pointer focus:outline-none focus:bg-white"
            >
              <option value="all">Status: All</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive / Suspended</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[18px] text-[#757682] pointer-events-none">
              arrow_drop_down
            </span>
          </div>

          {/* Fee Status Filter */}
          <div className="relative">
            <select
              value={selectedFeeStatus}
              onChange={(e) => setSelectedFeeStatus(e.target.value)}
              className="appearance-none h-10 pl-3 pr-8 rounded-xl bg-[#f0f3ff] text-xs font-semibold text-[#111c2d] border border-[#c5c5d3]/40 cursor-pointer focus:outline-none focus:bg-white"
            >
              <option value="all">Fee: All Statuses</option>
              <option value="clear">Fee Cleared</option>
              <option value="pending">Pending Dues</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[18px] text-[#757682] pointer-events-none">
              arrow_drop_down
            </span>
          </div>

          <div className="h-6 w-[1px] bg-[#c5c5d3]/40 mx-1 hidden sm:block"></div>

          <span className="text-xs font-semibold text-[#444651] px-1">
            Showing <span className="text-[#111c2d] font-bold">{paginatedStudents.length}</span> of{' '}
            {students.length}
          </span>
        </div>
      </div>

      {/* Main Student Table */}
      <div className="bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs overflow-hidden flex flex-col">
        {loading ? (
          <LoadingState message="Fetching student rosters..." />
        ) : paginatedStudents.length === 0 ? (
          <EmptyState
            icon="school"
            title="No students found"
            description={
              search
                ? `No students matching "${search}". Try adjusting your search or filters.`
                : 'No students enrolled in this category yet.'
            }
            actionText="+ Add New Student"
            onAction={() => navigate('/students/new')}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f0f3ff] text-[#444651] text-xs font-semibold select-none border-b border-[#c5c5d3]/30">
                    <th className="py-3 px-4 w-72">Student Name &amp; Biographical</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Class &amp; Section</th>
                    <th className="py-3 px-4">Parent / Guardian &amp; Phone</th>
                    <th className="py-3 px-4">Admission Date</th>
                    <th className="py-3 px-4">Fee Status</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-[#111c2d] divide-y divide-[#c5c5d3]/20">
                  {paginatedStudents.map((s) => (
                    <tr
                      key={s.id}
                      className={`hover:bg-[#f0f3ff]/50 transition-colors group ${
                        s.status === 'Inactive' ? 'opacity-70 bg-[#f9f9ff]' : ''
                      }`}
                    >
                      {/* Name & Bio */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {s.avatar ? (
                            <img
                              src={s.avatar}
                              alt={s.firstName}
                              className="w-10 h-10 rounded-xl object-cover shadow-2xs shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#d8e3fb] text-[#1e3a8a] font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                              {s.firstName[0]}
                              {s.lastName[0]}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                onClick={() => navigate(`/students/${s.id}`)}
                                className="font-semibold text-[#111c2d] hover:text-[#1e3a8a] cursor-pointer truncate"
                              >
                                {s.firstName} {s.lastName}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                  s.gender === 'Female'
                                    ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                    : 'bg-[#dce1ff] text-[#00236f]'
                                }`}
                              >
                                {s.gender === 'Female' ? 'F' : 'M'}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#444651] flex items-center gap-1">
                              DOB: {formatDate(s.dateOfBirth)}{' '}
                              {s.dateOfBirth && (
                                <>
                                  <span className="text-[#c5c5d3]">•</span>
                                  <span>{calculateAge(s.dateOfBirth)}</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* ID */}
                      <td className="py-3 px-4 font-mono text-xs font-bold text-[#1e3a8a]">
                        {s.studentId}
                      </td>

                      {/* Class */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#f0f3ff] text-xs font-semibold text-[#111c2d] border border-[#c5c5d3]/30">
                          {s.className}
                        </span>
                      </td>

                      {/* Parent */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-[#111c2d]">{s.parentName}</span>
                          <span className="text-[#757682] font-mono text-[11px]">{s.phone}</span>
                        </div>
                      </td>

                      {/* Admission Date */}
                      <td className="py-3 px-4 text-[#444651] font-medium">
                        {formatDate(s.admissionDate)}
                      </td>

                      {/* Fee Status */}
                      <td className="py-3 px-4">
                        {s.feeStatus === 'Pending' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffdcc3] text-[#442100] text-[11px] font-bold border border-[#fc922b]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#442100]"></span>
                            Pending {formatCurrency(s.pendingFee)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#85f8c4]/40 text-[#006c4a] text-[11px] font-bold border border-[#85f8c4]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a]"></span>
                            Clear
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {s.status === 'Active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#85f8c4]/40 text-[#006c4a] text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a]"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0f3ff] text-[#757682] text-[11px] font-semibold border border-[#c5c5d3]/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#757682]"></span>
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => navigate(`/students/${s.id}`)}
                            className="p-1.5 rounded-lg hover:bg-[#f0f3ff] text-[#444651] hover:text-[#1e3a8a] transition-colors cursor-pointer"
                            title="View Dossier"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/students/${s.id}/edit`)}
                            className="p-1.5 rounded-lg hover:bg-[#f0f3ff] text-[#444651] hover:text-[#1e3a8a] transition-colors cursor-pointer"
                            title="Edit Record"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeactivateTarget(s)}
                            className={`p-1.5 rounded-lg hover:bg-[#ffdad6]/40 transition-colors cursor-pointer ${
                              s.status === 'Active'
                                ? 'text-[#757682] hover:text-[#ba1a1a]'
                                : 'text-[#006c4a] hover:bg-[#85f8c4]/30'
                            }`}
                            title={s.status === 'Active' ? 'Deactivate Student' : 'Activate Student'}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {s.status === 'Active' ? 'person_off' : 'how_to_reg'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalItems={students.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Confirmation Modal for Student Deactivation / Activation */}
      <ConfirmationModal
        isOpen={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
        loading={deactivating}
        isDanger={deactivateTarget?.status === 'Active'}
        title={
          deactivateTarget?.status === 'Active'
            ? `Deactivate Student: ${deactivateTarget?.firstName} ${deactivateTarget?.lastName}?`
            : `Reactivate Student: ${deactivateTarget?.firstName} ${deactivateTarget?.lastName}?`
        }
        description={
          deactivateTarget?.status === 'Active'
            ? 'Deactivating this student will remove them from daily active attendance rosters and mark them inactive in class reports. Historical payment receipts will remain intact.'
            : 'Reactivating this student will restore their status to Active and include them in class rosters.'
        }
        confirmText={
          deactivateTarget?.status === 'Active' ? 'Yes, Deactivate' : 'Yes, Activate'
        }
      />
    </div>
  );
}
