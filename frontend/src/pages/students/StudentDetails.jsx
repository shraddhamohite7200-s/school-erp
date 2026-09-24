import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate, calculateAge } from '../../utils/formatters';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import LoadingState from '../../components/common/LoadingState';

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    loadStudent();
  }, [id]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      const res = await studentService.getStudentById(id);
      setStudent(res.data);
    } catch (err) {
      showToast(err.message || 'Student not found', 'error');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setDeactivating(true);
      const res = await studentService.deactivateStudent(student.id);
      setStudent({ ...student, status: res.data.status });
      showToast(`Student status changed to ${res.data.status}`, 'success');
      setShowDeactivateModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to update student status', 'error');
    } finally {
      setDeactivating(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading scholar dossier..." />;
  }

  if (!student) return null;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#c5c5d3]/30">
        <div>
          <button
            type="button"
            onClick={() => navigate('/students')}
            className="flex items-center gap-1 text-xs text-[#1e3a8a] font-semibold hover:underline mb-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Students Directory</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111c2d] tracking-tight">
              {student.firstName} {student.lastName}
            </h1>
            <StatusBadge status={student.status} />
            <span className="font-mono text-xs font-bold text-[#1e3a8a] bg-[#f0f3ff] px-2.5 py-1 rounded-md border border-[#c5c5d3]/30">
              {student.studentId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {student.pendingFee > 0 && (
            <Button
              variant="success"
              size="sm"
              icon="payments"
              onClick={() => navigate(`/fees/collect?studentId=${student.id}`)}
            >
              Collect Fee
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            icon="edit"
            onClick={() => navigate(`/students/${student.id}/edit`)}
          >
            Edit Profile
          </Button>
          <Button
            variant={student.status === 'Active' ? 'danger' : 'secondary'}
            size="sm"
            icon={student.status === 'Active' ? 'person_off' : 'how_to_reg'}
            onClick={() => setShowDeactivateModal(true)}
          >
            {student.status === 'Active' ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Biographical & Parent Dossier */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Bio Card */}
          <div className="p-5 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-col items-center text-center">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={student.firstName}
                className="w-24 h-24 rounded-2xl object-cover ring-2 ring-[#c5c5d3]/50 shadow-sm mb-3"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-[#dee8ff] text-[#1e3a8a] font-bold text-2xl flex items-center justify-center mb-3 shadow-xs">
                {student.firstName[0]}
                {student.lastName[0]}
              </div>
            )}
            <h2 className="text-lg font-bold text-[#111c2d]">
              {student.firstName} {student.lastName}
            </h2>
            <span className="text-xs font-semibold text-[#1e3a8a] bg-[#f0f3ff] px-2.5 py-0.5 rounded-full mt-1">
              Class: {student.className}
            </span>

            <div className="w-full mt-4 pt-4 border-t border-[#c5c5d3]/20 flex flex-col gap-2.5 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-[#444651]">Gender:</span>
                <span className="font-semibold text-[#111c2d]">{student.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#444651]">Date of Birth:</span>
                <span className="font-semibold text-[#111c2d]">
                  {formatDate(student.dateOfBirth)} ({calculateAge(student.dateOfBirth)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#444651]">Admission Date:</span>
                <span className="font-semibold text-[#111c2d]">
                  {formatDate(student.admissionDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#444651]">Academic Year:</span>
                <span className="font-semibold text-[#111c2d]">2026–27</span>
              </div>
            </div>
          </div>

          {/* Parent Information Card */}
          <div className="p-5 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#c5c5d3]/20">
              <span className="material-symbols-outlined text-[#1e3a8a] text-[20px]">
                family_restroom
              </span>
              <h3 className="text-xs font-bold text-[#111c2d] uppercase tracking-wider">
                Guardian Details
              </h3>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <div>
                <span className="text-[#757682] block text-[11px]">Primary Guardian</span>
                <span className="font-semibold text-[#111c2d] text-sm">{student.parentName}</span>
              </div>
              <div>
                <span className="text-[#757682] block text-[11px]">Phone Number</span>
                <a
                  href={`tel:${student.phone}`}
                  className="font-mono font-semibold text-[#1e3a8a] hover:underline"
                >
                  {student.phone}
                </a>
              </div>
              {student.email && (
                <div>
                  <span className="text-[#757682] block text-[11px]">Email Address</span>
                  <a
                    href={`mailto:${student.email}`}
                    className="font-medium text-[#111c2d] hover:underline"
                  >
                    {student.email}
                  </a>
                </div>
              )}
              {student.address && (
                <div>
                  <span className="text-[#757682] block text-[11px]">Residential Address</span>
                  <span className="text-[#444651]">{student.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Attendance & Fee Financial Dossier */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Fee Balance Summary Strip */}
          <div className="p-5 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#c5c5d3]/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1e3a8a] text-[20px]">
                  account_balance_wallet
                </span>
                <h3 className="text-sm font-bold text-[#111c2d] uppercase tracking-wider">
                  Fee Compliance Ledger
                </h3>
              </div>
              <StatusBadge status={student.feeStatus} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#f0f3ff] flex flex-col">
                <span className="text-[11px] text-[#444651] font-medium">Total Annual Fee</span>
                <span className="text-lg sm:text-xl font-bold text-[#111c2d] font-numeric mt-0.5">
                  {formatCurrency(student.totalFee)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#85f8c4]/30 flex flex-col">
                <span className="text-[11px] text-[#006c4a] font-medium">Paid So Far</span>
                <span className="text-lg sm:text-xl font-bold text-[#006c4a] font-numeric mt-0.5">
                  {formatCurrency(student.paidFee)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#ffdad6]/40 flex flex-col">
                <span className="text-[11px] text-[#ba1a1a] font-medium">Pending Dues</span>
                <span className="text-lg sm:text-xl font-bold text-[#ba1a1a] font-numeric mt-0.5">
                  {formatCurrency(student.pendingFee)}
                </span>
              </div>
            </div>

            {/* Fee Progress Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-[#444651]">
                <span>Payment Progress</span>
                <span className="font-semibold text-[#111c2d]">
                  {student.totalFee > 0
                    ? ((student.paidFee / student.totalFee) * 100).toFixed(1)
                    : 100}
                  %
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#f0f3ff] overflow-hidden">
                <div
                  className="h-full bg-[#006c4a] rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      student.totalFee > 0 ? (student.paidFee / student.totalFee) * 100 : 100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="p-5 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#c5c5d3]/20">
              <h3 className="text-sm font-bold text-[#111c2d] uppercase tracking-wider">
                Payment History &amp; Receipts
              </h3>
              <span className="text-xs text-[#757682]">
                {student.payments?.length || 0} Transactions
              </span>
            </div>

            {!student.payments || student.payments.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#757682]">
                No payment receipts recorded for this student yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f0f3ff] text-[#444651] font-semibold">
                      <th className="py-2 px-3 rounded-l-lg">Receipt No</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Amount</th>
                      <th className="py-2 px-3">Mode</th>
                      <th className="py-2 px-3 rounded-r-lg text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c5c5d3]/20">
                    {student.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-[#f0f3ff]/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a8a]">
                          {p.receiptNumber}
                        </td>
                        <td className="py-2.5 px-3 text-[#444651]">{p.paymentDate}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#111c2d] font-numeric">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-2.5 px-3 text-[#444651]">{p.paymentMode}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="px-2 py-0.5 rounded-full bg-[#85f8c4]/40 text-[#006c4a] font-bold text-[10px]">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Attendance Overview Card */}
          <div className="p-5 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#c5c5d3]/20">
              <h3 className="text-sm font-bold text-[#111c2d] uppercase tracking-wider">
                Attendance Record
              </h3>
              <span className="text-xs font-semibold text-[#006c4a]">
                94.2% Attendance Rate
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#f0f3ff] flex flex-col">
                <span className="text-[#757682]">Working Days</span>
                <span className="text-lg font-bold text-[#111c2d] mt-0.5">52 Days</span>
              </div>
              <div className="p-3 rounded-xl bg-[#85f8c4]/30 flex flex-col">
                <span className="text-[#006c4a]">Present</span>
                <span className="text-lg font-bold text-[#006c4a] mt-0.5">49 Days</span>
              </div>
              <div className="p-3 rounded-xl bg-[#ffdad6]/40 flex flex-col">
                <span className="text-[#ba1a1a]">Absent</span>
                <span className="text-lg font-bold text-[#ba1a1a] mt-0.5">3 Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Student Deactivation / Activation */}
      <ConfirmationModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleToggleStatus}
        loading={deactivating}
        isDanger={student.status === 'Active'}
        title={
          student.status === 'Active'
            ? `Deactivate ${student.firstName} ${student.lastName}?`
            : `Reactivate ${student.firstName} ${student.lastName}?`
        }
        description={
          student.status === 'Active'
            ? 'Deactivating will mark this student inactive on daily attendance rosters. Historical fee receipts and logs will be preserved.'
            : 'Reactivating will restore this student as Active in class rosters.'
        }
        confirmText={student.status === 'Active' ? 'Deactivate Scholar' : 'Activate Scholar'}
      />
    </div>
  );
}
