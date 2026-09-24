import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { parentService } from '../../services/parentService';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

export default function AddStudent() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [classes, setClasses] = useState([]);
  const [existingParents, setExistingParents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
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
    admissionDate: new Date().toISOString().split('T')[0],
    totalFee: 30000,
    paidFee: 0,
    status: 'Active',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const loadPrerequisites = async () => {
    try {
      const [classesRes, parentsRes, studentsRes] = await Promise.all([
        classService.getClasses(),
        parentService.getParents(),
        studentService.getStudents(),
      ]);

      const activeClasses = (classesRes.data || []).filter((c) => c.status === 'Active');
      setClasses(activeClasses);
      setExistingParents(parentsRes.data || []);

      // Auto-generate next Student ID
      const count = (studentsRes.data || []).length;
      const nextId = `STU-2026-${String(count + 1).padStart(3, '0')}`;

      if (activeClasses.length > 0) {
        setFormData((prev) => ({
          ...prev,
          studentId: nextId,
          classId: activeClasses[0].id,
          className: activeClasses[0].name,
          totalFee: activeClasses[0].annualFee || 30000,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    const selected = classes.find((c) => c.id === classId || c.name === classId);
    setFormData((prev) => ({
      ...prev,
      classId: selected?.id || classId,
      className: selected?.name || classId,
      totalFee: selected?.annualFee || prev.totalFee,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.parentName.trim()) newErrors.parentName = 'Parent / Guardian name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.classId) newErrors.classId = 'Please select a class';
    if (Number(formData.paidFee) > Number(formData.totalFee)) {
      newErrors.paidFee = 'Paid fee cannot exceed total annual fee';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await studentService.createStudent({
        ...formData,
        totalFee: Number(formData.totalFee),
        paidFee: Number(formData.paidFee || 0),
      });
      showToast(
        `Student ${formData.firstName} ${formData.lastName} enrolled successfully!`,
        'success'
      );
      navigate('/students');
    } catch (err) {
      showToast(err.message || 'Failed to enroll student', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#c5c5d3]/30">
        <div>
          <button
            type="button"
            onClick={() => navigate('/students')}
            className="flex items-center gap-1 text-xs text-[#1e3a8a] font-semibold hover:underline mb-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Students Directory</span>
          </button>
          <h1 className="text-2xl font-bold text-[#111c2d] tracking-tight">New Student Admission</h1>
          <p className="text-xs text-[#444651] mt-0.5">
            Register a new scholar into the school ledger and generate institutional ID.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Section 1: Biographical Details */}
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#c5c5d3]/20">
            <span className="material-symbols-outlined text-[#1e3a8a] text-[20px]">person</span>
            <h2 className="text-sm font-bold text-[#111c2d] uppercase tracking-wider">
              1. Student Biographical Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="First Name"
              required
              placeholder="e.g. Aarav"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              error={errors.firstName}
            />

            <Input
              label="Last Name"
              required
              placeholder="e.g. Sharma"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              error={errors.lastName}
            />

            <Input
              label="Student ID (Roll No)"
              required
              placeholder="STU-2026-001"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              helperText="Auto-generated institutional format"
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
              required
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
            />

            <Input
              label="Admission Date"
              type="date"
              required
              value={formData.admissionDate}
              onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Academic Assignment & Fee Structure */}
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#c5c5d3]/20">
            <span className="material-symbols-outlined text-[#1e3a8a] text-[20px]">meeting_room</span>
            <h2 className="text-sm font-bold text-[#111c2d] uppercase tracking-wider">
              2. Academic Assignment &amp; Fee Structure
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Select Class"
              required
              value={formData.classId}
              onChange={handleClassChange}
              options={classes.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.teacherName})`,
              }))}
              error={errors.classId}
            />

            <Input
              label="Total Annual Fee (₹)"
              type="number"
              required
              value={formData.totalFee}
              onChange={(e) => setFormData({ ...formData, totalFee: e.target.value })}
              helperText="Auto-populated from class default"
            />

            <Input
              label="Initial Paid Amount (₹)"
              type="number"
              value={formData.paidFee}
              onChange={(e) => setFormData({ ...formData, paidFee: e.target.value })}
              error={errors.paidFee}
              helperText="Enter if paid at admission time"
            />
          </div>

          {/* Fee preview card */}
          <div className="p-3.5 rounded-xl bg-[#f0f3ff] border border-[#c5c5d3]/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1e3a8a] text-[18px]">info</span>
              <span className="text-[#444651]">
                Net initial pending balance for this scholar:
              </span>
            </div>
            <span className="font-bold font-numeric text-sm text-[#ba1a1a]">
              ₹{Math.max(0, Number(formData.totalFee || 0) - Number(formData.paidFee || 0)).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Section 3: Parent & Guardian Contact Information */}
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#c5c5d3]/20">
            <span className="material-symbols-outlined text-[#1e3a8a] text-[20px]">family_restroom</span>
            <h2 className="text-sm font-bold text-[#111c2d] uppercase tracking-wider">
              3. Parent &amp; Guardian Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Guardian / Father Name"
              required
              placeholder="e.g. Vikram Sharma"
              value={formData.parentName}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              error={errors.parentName}
            />

            <Input
              label="Primary Phone Number"
              required
              placeholder="+91 98201 11223"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
              helperText="10-digit mobile for SMS alerts"
            />

            <Input
              label="Guardian Email"
              type="email"
              placeholder="guardian@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Residential Address"
              placeholder="Apartment, Street, Locality, City"
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
            onClick={() => navigate('/students')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon="how_to_reg"
            loading={loading}
          >
            Confirm &amp; Enrol Student
          </Button>
        </div>
      </form>
    </div>
  );
}
