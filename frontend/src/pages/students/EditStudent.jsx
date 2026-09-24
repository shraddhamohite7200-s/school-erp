import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingState from '../../components/common/LoadingState';

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    classId: '',
    className: '',
    studentId: '',
    parentName: '',
    phone: '',
    email: '',
    address: '',
    admissionDate: '',
    totalFee: 30000,
    paidFee: 0,
    status: 'Active',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentRes, classesRes] = await Promise.all([
        studentService.getStudentById(id),
        classService.getClasses(),
      ]);

      const student = studentRes.data;
      setClasses(classesRes.data || []);

      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        dateOfBirth: student.dateOfBirth || '',
        gender: student.gender || 'Male',
        classId: student.classId || '',
        className: student.className || '',
        studentId: student.studentId || '',
        parentName: student.parentName || '',
        phone: student.phone || '',
        email: student.email || '',
        address: student.address || '',
        admissionDate: student.admissionDate || '',
        totalFee: student.totalFee || 0,
        paidFee: student.paidFee || 0,
        status: student.status || 'Active',
      });
    } catch (err) {
      showToast(err.message || 'Student not found', 'error');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    const selected = classes.find((c) => c.id === classId || c.name === classId);
    setFormData((prev) => ({
      ...prev,
      classId: selected?.id || classId,
      className: selected?.name || classId,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.parentName.trim()) newErrors.parentName = 'Parent name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (Number(formData.paidFee) > Number(formData.totalFee)) {
      newErrors.paidFee = 'Paid fee cannot exceed total fee';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await studentService.updateStudent(id, {
        ...formData,
        totalFee: Number(formData.totalFee),
        paidFee: Number(formData.paidFee),
      });
      showToast(
        `Student ${formData.firstName} ${formData.lastName} record updated successfully`,
        'success'
      );
      navigate(`/students/${id}`);
    } catch (err) {
      showToast(err.message || 'Failed to update student', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading student profile for editing..." />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#c5c5d3]/30">
        <div>
          <button
            type="button"
            onClick={() => navigate(`/students/${id}`)}
            className="flex items-center gap-1 text-xs text-[#1e3a8a] font-semibold hover:underline mb-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Student Dossier</span>
          </button>
          <h1 className="text-2xl font-bold text-[#111c2d] tracking-tight">
            Edit Scholar Profile: {formData.firstName} {formData.lastName}
          </h1>
          <p className="text-xs text-[#444651] mt-0.5">
            Modify enrolled class, biographical data, or fee structure adjustments.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Biographical */}
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#c5c5d3]/20">
            <span className="text-sm font-bold text-[#111c2d] uppercase tracking-wider">
              Biographical Information
            </span>
            <span className="text-xs font-mono font-bold text-[#1e3a8a] bg-[#f0f3ff] px-2.5 py-1 rounded-md">
              {formData.studentId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="First Name"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              error={errors.firstName}
            />

            <Input
              label="Last Name"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              error={errors.lastName}
            />

            <Input
              label="Student ID"
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            />

            <Input
              label="Date of Birth"
              type="date"
              required
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              error={errors.dateOfBirth}
            />

            <Select
              label="Gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
            />

            <Select
              label="Enrollment Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive / Suspended' },
              ]}
            />
          </div>
        </div>

        {/* Academic & Fee Ledger */}
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-col gap-4">
          <span className="text-sm font-bold text-[#111c2d] uppercase tracking-wider pb-2 border-b border-[#c5c5d3]/20">
            Class &amp; Fee Ledger
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Assigned Class"
              value={formData.classId}
              onChange={handleClassChange}
              options={classes.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.teacherName})`,
              }))}
            />

            <Input
              label="Total Annual Fee (₹)"
              type="number"
              value={formData.totalFee}
              onChange={(e) => setFormData({ ...formData, totalFee: e.target.value })}
            />

            <Input
              label="Total Paid Amount (₹)"
              type="number"
              value={formData.paidFee}
              onChange={(e) => setFormData({ ...formData, paidFee: e.target.value })}
              error={errors.paidFee}
            />
          </div>
        </div>

        {/* Parent & Contact */}
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-col gap-4">
          <span className="text-sm font-bold text-[#111c2d] uppercase tracking-wider pb-2 border-b border-[#c5c5d3]/20">
            Parent / Guardian Contact
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Parent / Guardian Name"
              required
              value={formData.parentName}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              error={errors.parentName}
            />

            <Input
              label="Phone Number"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(`/students/${id}`)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon="save"
            loading={submitting}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
