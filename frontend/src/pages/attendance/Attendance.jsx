import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceService } from '../../services/attendanceService';
import { classService } from '../../services/classService';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';

export default function Attendance() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [date, setDate] = useState('2026-09-22');
  const [selectedClass, setSelectedClass] = useState('all');
  const [search, setSearch] = useState('');
  const [classes, setClasses] = useState([]);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadRoster();
  }, [date, selectedClass]);

  const loadClasses = async () => {
    try {
      const res = await classService.getClasses();
      setClasses(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadRoster = async () => {
    try {
      setLoading(true);
      const res = await attendanceService.getAttendanceRoster(date, selectedClass);
      setRoster(res.data || []);
      setIsSaved(res.isAlreadySaved || false);
    } catch (err) {
      showToast('Failed to load roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentStatus = (studentId) => {
    setRoster((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? { ...s, status: s.status === 'Present' ? 'Absent' : 'Present' }
          : s
      )
    );
  };

  const setStatus = (studentId, status) => {
    setRoster((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s))
    );
  };

  const markAll = (status) => {
    setRoster((prev) => prev.map((s) => ({ ...s, status })));
    showToast(`Marked all ${roster.length} students as ${status}`, 'info');
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      const records = roster.map((r) => ({
        studentId: r.studentId,
        status: r.status,
      }));
      await attendanceService.markAttendance(date, records);
      setIsSaved(true);
      showToast(
        `Attendance recorded successfully for ${date} (${presentCount} Present, ${absentCount} Absent)`,
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Failed to save attendance', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filter roster by local search
  const filteredRoster = roster.filter(
    (s) =>
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.enrollmentId.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = roster.filter((s) => s.status === 'Present').length;
  const absentCount = roster.filter((s) => s.status === 'Absent').length;
  const totalCount = roster.length;
  const rate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] tracking-wider uppercase text-[#00236f] font-bold bg-[#dce1ff] px-2 py-0.5 rounded-md">
              Daily Operations
            </span>
            <span className="text-[#c5c5d3]">•</span>
            <span className="text-xs text-[#444651]">Academic Year 2026–27</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111c2d] tracking-tight">
            Mark Daily Attendance
          </h1>
          <p className="text-xs sm:text-sm text-[#444651] mt-0.5">
            Single-click roll call verification for micro-school cohorts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon="history"
            onClick={() => navigate('/attendance/history')}
          >
            Attendance History
          </Button>
          <Button
            variant="primary"
            size="md"
            icon="save"
            loading={saving}
            onClick={handleSaveAttendance}
          >
            Save Attendance
          </Button>
        </div>
      </div>

      {/* Roster Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#444651] uppercase font-semibold">Total Scholars</span>
            <span className="text-2xl font-bold text-[#111c2d] font-numeric mt-0.5">
              {totalCount}
            </span>
            <span className="text-[11px] text-[#444651]">Active in roster</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] flex items-center justify-center text-[#1e3a8a]">
            <span className="material-symbols-outlined text-[22px]">groups</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#444651] uppercase font-semibold">Present</span>
            <span className="text-2xl font-bold text-[#006c4a] font-numeric mt-0.5">
              {presentCount}
            </span>
            <span className="text-[11px] text-[#006c4a] font-medium">{rate}% Present</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#85f8c4]/30 flex items-center justify-center text-[#006c4a]">
            <span className="material-symbols-outlined text-[22px]">how_to_reg</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#444651] uppercase font-semibold">Absent</span>
            <span className="text-2xl font-bold text-[#ba1a1a] font-numeric mt-0.5">
              {absentCount}
            </span>
            <span className="text-[11px] text-[#ba1a1a] font-medium">
              {totalCount > 0 ? ((absentCount / totalCount) * 100).toFixed(1) : 0}% Absent
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#ffdad6]/50 flex items-center justify-center text-[#ba1a1a]">
            <span className="material-symbols-outlined text-[22px]">person_off</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#444651] uppercase font-semibold">Status</span>
            <span
              className={`text-base font-bold mt-1.5 inline-flex items-center gap-1 ${
                isSaved ? 'text-[#006c4a]' : 'text-[#ba1a1a]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSaved ? 'check_circle' : 'pending'}
              </span>
              <span>{isSaved ? 'Saved' : 'Draft / Unsaved'}</span>
            </span>
            <span className="text-[11px] text-[#757682]">{date}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] flex items-center justify-center text-[#1e3a8a]">
            <span className="material-symbols-outlined text-[22px]">fact_check</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#111c2d] whitespace-nowrap">Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 px-3 rounded-xl bg-[#f0f3ff] text-xs font-semibold text-[#111c2d] border border-[#c5c5d3]/40 focus:outline-none focus:bg-white cursor-pointer shadow-2xs"
            />
          </div>

          {/* Class Filter */}
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="appearance-none h-10 pl-3 pr-8 rounded-xl bg-[#f0f3ff] text-xs font-semibold text-[#111c2d] border border-[#c5c5d3]/40 cursor-pointer focus:outline-none focus:bg-white"
            >
              <option value="all">Cohort: All Classes</option>
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

          {/* Quick Mark Batch Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => markAll('Present')}
              className="h-10 px-3 rounded-xl bg-[#85f8c4]/30 hover:bg-[#85f8c4]/50 text-[#006c4a] text-xs font-semibold border border-[#006c4a]/20 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">done_all</span>
              <span>All Present</span>
            </button>
            <button
              type="button"
              onClick={() => markAll('Absent')}
              className="h-10 px-3 rounded-xl bg-[#ffdad6]/40 hover:bg-[#ffdad6]/70 text-[#ba1a1a] text-xs font-semibold border border-[#ba1a1a]/20 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              <span>All Absent</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-64">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#757682]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#f0f3ff] text-xs sm:text-sm text-[#111c2d] border border-[#c5c5d3]/40 focus:outline-none focus:bg-white"
          />
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingState message="Loading daily attendance roster..." />
        ) : filteredRoster.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#757682]">
            No scholars enrolled for the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f0f3ff] text-[#444651] font-semibold border-b border-[#c5c5d3]/30">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Student Name &amp; ID</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4 text-center">Current Status</th>
                  <th className="py-3 px-4 text-right pr-6">Quick Status Switch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c5d3]/20">
                {filteredRoster.map((student, idx) => {
                  const isPresent = student.status === 'Present';
                  return (
                    <tr
                      key={student.studentId}
                      className={`hover:bg-[#f0f3ff]/40 transition-colors ${
                        !isPresent ? 'bg-[#ffdad6]/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-mono text-[#757682]">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                              isPresent
                                ? 'bg-[#dee8ff] text-[#1e3a8a]'
                                : 'bg-[#ffdad6] text-[#ba1a1a]'
                            }`}
                          >
                            {student.studentName
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#111c2d] text-sm">
                              {student.studentName}
                            </span>
                            <span className="font-mono text-[11px] text-[#757682]">
                              {student.enrollmentId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-[#444651]">
                        <span className="px-2 py-0.5 rounded-md bg-[#f0f3ff] font-semibold text-[#111c2d]">
                          {student.className}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleStudentStatus(student.studentId)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all shadow-2xs select-none active:scale-95 ${
                            isPresent
                              ? 'bg-[#85f8c4]/40 text-[#006c4a] border border-[#85f8c4]'
                              : 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/30'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            {isPresent ? 'check_circle' : 'cancel'}
                          </span>
                          <span>{student.status}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right pr-6">
                        <div className="inline-flex items-center rounded-xl bg-[#f0f3ff] p-0.5 border border-[#c5c5d3]/40">
                          <button
                            type="button"
                            onClick={() => setStatus(student.studentId, 'Present')}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              isPresent
                                ? 'bg-[#006c4a] text-white shadow-xs'
                                : 'text-[#444651] hover:text-[#111c2d]'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus(student.studentId, 'Absent')}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              !isPresent
                                ? 'bg-[#ba1a1a] text-white shadow-xs'
                                : 'text-[#444651] hover:text-[#ba1a1a]'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Save Bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#c5c5d3]/40 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-[#111c2d]">Summary for {date}:</span>
          <span className="text-[#006c4a] font-bold">{presentCount} Present</span>
          <span className="text-[#c5c5d3]">•</span>
          <span className="text-[#ba1a1a] font-bold">{absentCount} Absent</span>
          <span className="text-[#c5c5d3]">•</span>
          <span className="text-[#444651]">{rate}% Rate</span>
        </div>

        <Button
          variant="primary"
          size="md"
          icon="save"
          loading={saving}
          onClick={handleSaveAttendance}
        >
          Save &amp; Finalize Attendance
        </Button>
      </div>
    </div>
  );
}
