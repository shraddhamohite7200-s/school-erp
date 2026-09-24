import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { feeService } from '../../services/feeService';
import { classService } from '../../services/classService';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';

export default function Fees() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [feeStructures, setFeeStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    classId: '',
    className: '',
    academicYear: '2026–27',
    annualFee: 30000,
    status: 'Active',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feeRes, classRes] = await Promise.all([
        feeService.getFeeStructures(),
        classService.getClasses(),
      ]);
      setFeeStructures(feeRes.data || []);
      const activeClasses = (classRes.data || []).filter((c) => c.status === 'Active');
      setClasses(activeClasses);

      if (activeClasses.length > 0) {
        setFormData((prev) => ({
          ...prev,
          classId: activeClasses[0].id,
          className: activeClasses[0].name,
        }));
      }
    } catch (err) {
      showToast('Failed to load fee configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedId(null);
    if (classes.length > 0) {
      setFormData({
        classId: classes[0].id,
        className: classes[0].name,
        academicYear: '2026–27',
        annualFee: 30000,
        status: 'Active',
      });
    }
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (f) => {
    setModalMode('edit');
    setSelectedId(f.id);
    setFormData({
      classId: f.classId || '',
      className: f.className || '',
      academicYear: f.academicYear || '2026–27',
      annualFee: f.annualFee || 30000,
      status: f.status || 'Active',
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    const target = classes.find((c) => c.id === classId || c.name === classId);
    setFormData((prev) => ({
      ...prev,
      classId: target?.id || classId,
      className: target?.name || classId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.annualFee || Number(formData.annualFee) <= 0) {
      setErrors({ annualFee: 'Please enter a valid annual tuition fee' });
      return;
    }

    try {
      setSubmitting(true);
      if (modalMode === 'create') {
        await feeService.createFeeStructure(formData);
        showToast(`Fee structure for ${formData.className} added`, 'success');
      } else {
        await feeService.updateFeeStructure(selectedId, formData);
        showToast(`Fee structure updated`, 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] tracking-wider uppercase text-[#00236f] font-bold bg-[#dce1ff] px-2 py-0.5 rounded-md">
              Bursar Console
            </span>
            <span className="text-[#c5c5d3]">•</span>
            <span className="text-xs text-[#444651]">Academic Year 2026–27</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111c2d] tracking-tight">
            Fee Structure &amp; Billing Configurations
          </h1>
          <p className="text-xs sm:text-sm text-[#444651] mt-0.5">
            Define tuition dues per grade cohort and track institution-wide fee policies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon="pending_actions"
            onClick={() => navigate('/fees/pending')}
          >
            Pending Dues
          </Button>
          <Button
            variant="primary"
            size="md"
            icon="add"
            onClick={handleOpenCreate}
          >
            + Add Fee Structure
          </Button>
        </div>
      </div>

      {/* Quick Nav Pill Tabs */}
      <div className="flex items-center gap-2 border-b border-[#c5c5d3]/30 pb-2">
        <button
          className="px-4 py-2 rounded-xl bg-[#1e3a8a] text-white text-xs font-semibold shadow-xs"
        >
          Fee Structures
        </button>
        <button
          onClick={() => navigate('/fees/pending')}
          className="px-4 py-2 rounded-xl text-[#444651] hover:bg-[#f0f3ff] text-xs font-semibold transition-colors cursor-pointer"
        >
          Pending Fees Ledger
        </button>
        <button
          onClick={() => navigate('/fees/collect')}
          className="px-4 py-2 rounded-xl text-[#444651] hover:bg-[#f0f3ff] text-xs font-semibold transition-colors cursor-pointer"
        >
          Collect Fee Desk
        </button>
        <button
          onClick={() => navigate('/payments')}
          className="px-4 py-2 rounded-xl text-[#444651] hover:bg-[#f0f3ff] text-xs font-semibold transition-colors cursor-pointer"
        >
          Cleared Receipts &amp; Payments
        </button>
      </div>

      {/* Fee Structures Grid */}
      {loading ? (
        <LoadingState message="Loading tuition fee structures..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {feeStructures.map((f) => (
            <div
              key={f.id}
              className="p-5 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider text-[#757682] font-bold">
                      Grade Cohort
                    </span>
                    <h3 className="text-lg font-bold text-[#111c2d]">{f.className}</h3>
                  </div>
                  <StatusBadge status={f.status} />
                </div>

                <div className="p-3 rounded-xl bg-[#f0f3ff] flex flex-col gap-1">
                  <span className="text-[11px] text-[#757682]">Annual Tuition Fee</span>
                  <span className="text-2xl font-bold font-numeric text-[#006c4a]">
                    {formatCurrency(f.annualFee)}
                  </span>
                  <span className="text-[10px] text-[#444651]">
                    Session: {f.academicYear} • Term Installments Applicable
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#c5c5d3]/30 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate(`/fees/pending?class=${encodeURIComponent(f.className)}`)}
                  className="text-xs text-[#1e3a8a] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Cohort Dues</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(f)}
                  className="p-1.5 rounded-lg text-[#757682] hover:text-[#1e3a8a] hover:bg-[#f0f3ff] transition-colors cursor-pointer"
                  title="Edit Structure"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Fee Structure Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === 'create' ? 'Add Fee Structure' : 'Edit Fee Structure'}
        subtitle="Configure annual tuition amounts for enrolled cohorts"
        icon="receipt_long"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select
            label="Class Cohort"
            required
            value={formData.classId}
            onChange={handleClassChange}
            options={classes.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Academic Year"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
            />

            <Input
              label="Annual Tuition Fee (₹)"
              type="number"
              required
              value={formData.annualFee}
              onChange={(e) => setFormData({ ...formData, annualFee: e.target.value })}
              error={errors.annualFee}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#c5c5d3]/30">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
              icon={modalMode === 'create' ? 'add' : 'save'}
            >
              {modalMode === 'create' ? 'Create Structure' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
