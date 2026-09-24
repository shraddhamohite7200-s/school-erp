import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingState from '../../components/common/LoadingState';

export default function CollectFee() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Cash',
    receiptNumber: `REC-${Math.floor(1050 + Math.random() * 50)}`,
    notes: 'Q2 Tuition Installment',
  });

  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await studentService.getStudents();
      const allStudents = res.data || [];
      setStudents(allStudents);

      const targetId = searchParams.get('studentId');
      if (targetId) {
        const found = allStudents.find((s) => s.id === targetId || s.studentId === targetId);
        if (found) {
          selectStudent(found);
          return;
        }
      }

      // Default: select first student with pending dues
      const withDues = allStudents.find((s) => s.pendingFee > 0);
      if (withDues) {
        selectStudent(withDues);
      } else if (allStudents.length > 0) {
        selectStudent(allStudents[0]);
      }
    } catch (err) {
      showToast('Failed to load students roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectStudent = (student) => {
    setSelectedStudent(student);
    const suggestedAmount = student.pendingFee > 0 ? String(student.pendingFee) : '0';
    setFormData((prev) => ({
      ...prev,
      studentId: student.id,
      amount: suggestedAmount,
    }));
    setAmountError('');
  };

  const handleStudentDropdownChange = (e) => {
    const sId = e.target.value;
    const found = students.find((s) => s.id === sId);
    if (found) {
      selectStudent(found);
    }
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, amount: val }));

    const numVal = Number(val);
    if (!numVal || numVal <= 0) {
      setAmountError('Amount must be greater than ₹0');
    } else if (selectedStudent && numVal > selectedStudent.pendingFee) {
      setAmountError(
        `Payment amount (₹${numVal.toLocaleString('en-IN')}) cannot exceed pending fee of ₹${selectedStudent.pendingFee.toLocaleString('en-IN')}`
      );
    } else {
      setAmountError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      showToast('Please select a student', 'error');
      return;
    }

    const numAmount = Number(formData.amount);
    if (!numAmount || numAmount <= 0) {
      setAmountError('Please enter a valid amount');
      return;
    }

    if (numAmount > selectedStudent.pendingFee) {
      setAmountError(
        `Payment amount cannot exceed pending fee of ₹${selectedStudent.pendingFee.toLocaleString('en-IN')}`
      );
      return;
    }

    try {
      setSubmitting(true);
      const res = await paymentService.createPayment({
        ...formData,
        amount: numAmount,
      });

      showToast(res.message || 'Payment recorded successfully!', 'success');
      navigate('/payments');
    } catch (err) {
      showToast(err.message || 'Payment recording failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Initializing payment collection desk..." />;
  }

  const numAmount = Number(formData.amount) || 0;
  const currentPending = selectedStudent?.pendingFee || 0;
  const newPending = Math.max(0, currentPending - numAmount);
  const isOverpaying = numAmount > currentPending;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#c5c5d3]/30">
        <div>
          <button
            type="button"
            onClick={() => navigate('/fees/pending')}
            className="flex items-center gap-1 text-xs text-[#1e3a8a] font-semibold hover:underline mb-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Pending Fees</span>
          </button>
          <h1 className="text-2xl font-bold text-[#111c2d] tracking-tight">
            Fee Collection Desk
          </h1>
          <p className="text-xs text-[#444651] mt-0.5">
            Record tuition collections, generate verified receipts, and settle scholar ledger dues.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Selection & Live Balance Card */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-col gap-4">
            <h2 className="text-xs font-bold text-[#111c2d] uppercase tracking-wider pb-2 border-b border-[#c5c5d3]/20">
              Select Enrolled Scholar
            </h2>

            <Select
              label="Choose Student"
              value={selectedStudent?.id || ''}
              onChange={handleStudentDropdownChange}
              options={students.map((s) => ({
                value: s.id,
                label: `${s.firstName} ${s.lastName} (${s.className}) — Due: ₹${(s.pendingFee || 0).toLocaleString('en-IN')}`,
              }))}
            />

            {selectedStudent && (
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#dee8ff] text-[#1e3a8a] font-bold text-base flex items-center justify-center shrink-0">
                    {selectedStudent.firstName[0]}
                    {selectedStudent.lastName[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-[#111c2d]">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </span>
                    <span className="font-mono text-xs text-[#1e3a8a]">
                      {selectedStudent.studentId}
                    </span>
                    <span className="text-[11px] text-[#444651]">
                      Class: {selectedStudent.className}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f0f3ff] flex flex-col gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#444651]">Total Annual Fee:</span>
                    <span className="font-semibold text-[#111c2d]">
                      {formatCurrency(selectedStudent.totalFee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#444651]">Total Paid So Far:</span>
                    <span className="font-semibold text-[#006c4a]">
                      {formatCurrency(selectedStudent.paidFee)}
                    </span>
                  </div>
                  <div className="h-[1px] bg-[#c5c5d3]/30"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#111c2d]">Current Pending:</span>
                    <span className="text-base font-bold font-numeric text-[#ba1a1a]">
                      {formatCurrency(selectedStudent.pendingFee)}
                    </span>
                  </div>
                </div>

                {/* Guardian snippet */}
                <div className="flex flex-col text-xs text-[#444651] px-1">
                  <span>
                    Guardian: <strong className="text-[#111c2d]">{selectedStudent.parentName}</strong>
                  </span>
                  <span>
                    Phone: <strong className="text-[#111c2d]">{selectedStudent.phone}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Live Remaining Balance Calculation Preview */}
          {selectedStudent && (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isOverpaying
                  ? 'bg-[#ffdad6] border-[#ba1a1a]/40 text-[#ba1a1a]'
                  : newPending === 0
                  ? 'bg-[#85f8c4]/30 border-[#006c4a]/30 text-[#006c4a]'
                  : 'bg-white border-[#c5c5d3]/40 text-[#111c2d]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[18px]">
                  {isOverpaying ? 'error' : newPending === 0 ? 'verified' : 'calculate'}
                </span>
                <span className="text-xs uppercase font-bold tracking-wider">
                  Post-Payment Projection
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-xs">Projected Remaining Dues:</span>
                <span className="text-xl font-bold font-numeric">
                  {isOverpaying ? 'Invalid Overpayment' : formatCurrency(newPending)}
                </span>
              </div>
              {newPending === 0 && !isOverpaying && (
                <span className="text-[11px] font-semibold block mt-1">
                  ✨ This payment will clear this student’s balance in full.
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Payment Entry Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-6 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-col gap-4"
          >
            <h2 className="text-xs font-bold text-[#111c2d] uppercase tracking-wider pb-2 border-b border-[#c5c5d3]/20">
              Receipt &amp; Payment Details
            </h2>

            {/* Amount */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#111c2d]">
                Amount to Collect (₹) <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#757682] pointer-events-none">
                  currency_rupee
                </span>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={handleAmountChange}
                  placeholder="Enter amount"
                  className={`w-full h-11 pl-9 pr-3 rounded-xl bg-[#f0f3ff] text-base font-bold font-numeric text-[#111c2d] border transition-all focus:outline-none focus:bg-white ${
                    amountError
                      ? 'border-[#ba1a1a] bg-[#ffdad6]/20 text-[#ba1a1a]'
                      : 'border-[#c5c5d3]/40'
                  }`}
                />
              </div>
              {amountError && (
                <span className="text-xs text-[#ba1a1a] font-medium flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {amountError}
                </span>
              )}
            </div>

            {/* Date & Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Payment Date"
                type="date"
                required
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              />

              <Select
                label="Payment Mode"
                required
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                options={[
                  { value: 'Cash', label: 'Cash' },
                  { value: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)' },
                  { value: 'Bank Transfer', label: 'Bank Transfer / NEFT / IMPS' },
                  { value: 'Cheque', label: 'Cheque' },
                ]}
              />
            </div>

            {/* Receipt No */}
            <Input
              label="Receipt Number"
              required
              value={formData.receiptNumber}
              onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
              helperText="Official sequentially generated receipt index"
            />

            {/* Notes */}
            <Input
              label="Remarks / Notes (Optional)"
              placeholder="e.g. Q2 Tuition installment received by cashier"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />

            {/* Submit Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#c5c5d3]/30">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/fees/pending')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon="receipt"
                loading={submitting}
                disabled={Boolean(amountError) || !numAmount || numAmount <= 0}
              >
                Record Payment &amp; Issue Receipt
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
