import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classService } from '../../services/classService';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';

export default function Classes() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Deactivate
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const [formData, setFormData] = useState({
    classLevel: 'Nursery',
    section: 'A',
    teacherName: '',
    academicYear: '2026–27',
    capacity: 25,
    annualFee: 30000,
    status: 'Active',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const res = await classService.getClasses();
      setClasses(res.data || []);
    } catch (err) {
      showToast('Failed to load classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedClassId(null);
    setFormData({
      classLevel: 'Nursery',
      section: 'A',
      teacherName: '',
      academicYear: '2026–27',
      capacity: 25,
      annualFee: 30000,
      status: 'Active',
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setModalMode('edit');
    setSelectedClassId(c.id);
    const parts = c.name.split(' ');
    const section = parts.pop() || 'A';
    const level = parts.join(' ') || c.name;

    setFormData({
      classLevel: c.classLevel || level,
      section: c.section || section,
      teacherName: c.teacherName || '',
      academicYear: c.academicYear || '2026–27',
      capacity: c.capacity || 25,
      annualFee: c.annualFee || 30000,
      status: c.status || 'Active',
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.teacherName.trim()) errs.teacherName = 'Class teacher name is required';
    if (!formData.capacity || Number(formData.capacity) <= 0)
      errs.capacity = 'Capacity must be greater than 0';
    if (!formData.annualFee || Number(formData.annualFee) <= 0)
      errs.annualFee = 'Annual fee must be specified';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      if (modalMode === 'create') {
        await classService.createClass(formData);
        showToast(
          `Class ${formData.classLevel} ${formData.section} established successfully`,
          'success'
        );
      } else {
        await classService.updateClass(selectedClassId, formData);
        showToast(`Class details updated successfully`, 'success');
      }
      setModalOpen(false);
      loadClasses();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!deactivateTarget) return;
    try {
      setDeactivating(true);
      const res = await classService.deactivateClass(deactivateTarget.id);
      showToast(`Class ${deactivateTarget.name} is now ${res.data.status}`, 'success');
      setDeactivateTarget(null);
      loadClasses();
    } catch (err) {
      showToast(err.message || 'Failed to change class status', 'error');
    } finally {
      setDeactivating(false);
    }
  };

  const activeCount = classes.filter((c) => c.status === 'Active').length;
  const totalEnrolled = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity || 25), 0);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] tracking-wider uppercase text-[#00236f] font-bold bg-[#dce1ff] px-2 py-0.5 rounded-md">
              Academic Infrastructure
            </span>
            <span className="text-[#c5c5d3]">•</span>
            <span className="text-xs text-[#444651]">
              {activeCount} Active Cohorts • Academic Year 2026–27
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111c2d] tracking-tight">
            Classes &amp; Cohort Management
          </h1>
          <p className="text-xs sm:text-sm text-[#444651] mt-0.5">
            Configure early-childhood divisions, class teacher assignments, and classroom capacity.
          </p>
        </div>

        <Button variant="primary" size="md" icon="add" onClick={handleOpenCreate}>
          Add New Class
        </Button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#444651] uppercase font-semibold">Active Classes</span>
            <span className="text-2xl font-bold text-[#111c2d] font-numeric mt-0.5">
              {activeCount}
            </span>
            <span className="text-[11px] text-[#006c4a] font-medium">100% Operational</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] flex items-center justify-center text-[#1e3a8a]">
            <span className="material-symbols-outlined text-[22px]">meeting_room</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#444651] uppercase font-semibold">Total Scholars</span>
            <span className="text-2xl font-bold text-[#111c2d] font-numeric mt-0.5">
              {totalEnrolled}
            </span>
            <span className="text-[11px] text-[#444651]">
              Capacity: {totalCapacity} Seats
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#85f8c4]/30 flex items-center justify-center text-[#006c4a]">
            <span className="material-symbols-outlined text-[22px]">groups</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#444651] uppercase font-semibold">Occupancy Ratio</span>
            <span className="text-2xl font-bold text-[#006c4a] font-numeric mt-0.5">
              {totalCapacity > 0 ? ((totalEnrolled / totalCapacity) * 100).toFixed(1) : 0}%
            </span>
            <span className="text-[11px] text-[#444651]">Average 16 per class</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] flex items-center justify-center text-[#1e3a8a]">
            <span className="material-symbols-outlined text-[22px]">pie_chart</span>
          </div>
        </div>
      </div>

      {/* Class Cards Grid */}
      {loading ? (
        <LoadingState message="Loading class structures..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {classes.map((cls) => {
            const occupancyPct = cls.capacity
              ? Math.min(100, Math.round(((cls.studentCount || 0) / cls.capacity) * 100))
              : 0;

            return (
              <div
                key={cls.id}
                className={`p-5 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  cls.status === 'Inactive' ? 'opacity-65 bg-[#f9f9ff]' : ''
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#111c2d] tracking-tight">{cls.name}</h3>
                      <span className="text-xs text-[#757682] font-mono">
                        Sec {cls.section} • {cls.academicYear}
                      </span>
                    </div>
                    <StatusBadge status={cls.status} />
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f0f3ff] text-xs">
                    <span className="material-symbols-outlined text-[#1e3a8a] text-[18px]">
                      assignment_ind
                    </span>
                    <div className="flex flex-col truncate">
                      <span className="text-[10px] text-[#757682] uppercase font-bold">
                        Class Teacher
                      </span>
                      <span className="font-semibold text-[#111c2d] truncate">
                        {cls.teacherName}
                      </span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between text-[#444651]">
                      <span>Enrolled Scholars</span>
                      <span className="font-bold text-[#111c2d] font-numeric">
                        {cls.studentCount || 0} / {cls.capacity || 25}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#f0f3ff] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          occupancyPct > 90 ? 'bg-[#ba1a1a]' : 'bg-[#006c4a]'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-2 border-t border-[#c5c5d3]/20">
                    <span className="text-[#757682]">Annual Fee:</span>
                    <span className="font-bold font-numeric text-[#111c2d]">
                      {formatCurrency(cls.annualFee || 30000)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#c5c5d3]/30 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate(`/students?class=${encodeURIComponent(cls.name)}`)}
                    className="text-xs text-[#1e3a8a] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Roster</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1 rounded-lg text-[#757682] hover:text-[#1e3a8a] hover:bg-[#f0f3ff] transition-colors cursor-pointer"
                      title="Edit Class"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeactivateTarget(cls)}
                      className="p-1 rounded-lg text-[#757682] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors cursor-pointer"
                      title={cls.status === 'Active' ? 'Deactivate Class' : 'Activate Class'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {cls.status === 'Active' ? 'block' : 'check_circle'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === 'create' ? 'Create New Class' : 'Edit Class Configuration'}
        subtitle="Manage grade cohort, section designation, and class teacher"
        icon="meeting_room"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Class Level"
              value={formData.classLevel}
              onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
              options={[
                { value: 'Playgroup', label: 'Playgroup' },
                { value: 'Nursery', label: 'Nursery' },
                { value: 'Junior KG', label: 'Junior KG' },
                { value: 'Senior KG', label: 'Senior KG' },
              ]}
            />

            <Select
              label="Section"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              options={[
                { value: 'A', label: 'Section A' },
                { value: 'B', label: 'Section B' },
                { value: 'C', label: 'Section C' },
              ]}
            />
          </div>

          <Input
            label="Class Teacher Name"
            required
            placeholder="e.g. Sunita Rao"
            value={formData.teacherName}
            onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
            error={errors.teacherName}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Academic Year"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
            />

            <Input
              label="Student Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              error={errors.capacity}
            />

            <Input
              label="Standard Annual Fee (₹)"
              type="number"
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
              {modalMode === 'create' ? 'Create Class' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleToggleStatus}
        loading={deactivating}
        isDanger={deactivateTarget?.status === 'Active'}
        title={
          deactivateTarget?.status === 'Active'
            ? `Deactivate Class ${deactivateTarget?.name}?`
            : `Activate Class ${deactivateTarget?.name}?`
        }
        description={
          deactivateTarget?.status === 'Active'
            ? 'Deactivating this class will prevent new student enrollments into this cohort. Existing scholars will retain their current records.'
            : 'Activating this class will enable admissions into this section.'
        }
        confirmText={
          deactivateTarget?.status === 'Active' ? 'Deactivate Class' : 'Activate Class'
        }
      />
    </div>
  );
}
