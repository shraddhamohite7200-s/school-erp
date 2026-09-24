/**
 * Student Service
 * Communicates with GET/POST/PUT/DELETE /api/students or local mock store
 */
import api from './api';
import { localStore } from './localStore';

export const studentService = {
  getStudents: async (filters = {}) => {
    try {
      const response = await api.get('/students', { params: filters });
      return response.data;
    } catch (err) {
      // Mock fallback with filtering and search
      await new Promise((r) => setTimeout(r, 120));
      let students = localStore.getStudents();

      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        students = students.filter(
          (s) =>
            s.firstName?.toLowerCase().includes(query) ||
            s.lastName?.toLowerCase().includes(query) ||
            s.studentId?.toLowerCase().includes(query) ||
            s.phone?.includes(query) ||
            s.parentName?.toLowerCase().includes(query)
        );
      }

      if (filters.classId && filters.classId !== 'all') {
        students = students.filter((s) => s.classId === filters.classId || s.className === filters.classId);
      }

      if (filters.status && filters.status !== 'all') {
        students = students.filter((s) => s.status.toLowerCase() === filters.status.toLowerCase());
      }

      if (filters.feeStatus && filters.feeStatus !== 'all') {
        students = students.filter((s) => s.feeStatus.toLowerCase() === filters.feeStatus.toLowerCase());
      }

      return {
        success: true,
        data: students,
        total: students.length,
      };
    }
  },

  getStudentById: async (id) => {
    try {
      const response = await api.get(`/students/${id}`);
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 80));
      const students = localStore.getStudents();
      const student = students.find((s) => s.id === id || s.studentId === id);
      if (!student) {
        throw new Error(`Student with ID ${id} not found.`);
      }

      // Also get linked payments for this student
      const allPayments = localStore.getPayments();
      const studentPayments = allPayments.filter((p) => p.studentId === student.id || p.studentName === `${student.firstName} ${student.lastName}`);

      return {
        success: true,
        data: {
          ...student,
          payments: studentPayments,
        },
      };
    }
  },

  createStudent: async (studentData) => {
    try {
      const response = await api.post('/students', studentData);
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 150));
      const students = localStore.getStudents();

      // Rule: Student ID must be unique
      const generatedId = studentData.studentId || `STU-2026-${String(students.length + 1).padStart(3, '0')}`;
      if (students.some((s) => s.studentId.toUpperCase() === generatedId.toUpperCase())) {
        throw new Error(`Student ID ${generatedId} already exists. Student IDs must be unique.`);
      }

      // Check class
      const classes = localStore.getClasses();
      const targetClass = classes.find((c) => c.id === studentData.classId || c.name === studentData.className);
      if (targetClass && targetClass.status === 'Inactive') {
        throw new Error(`Cannot assign student to inactive class "${targetClass.name}".`);
      }

      const totalFee = studentData.totalFee || targetClass?.annualFee || 30000;
      const paidFee = studentData.paidFee || 0;
      const pendingFee = Math.max(0, totalFee - paidFee);

      const newStudent = {
        id: `stu-${Date.now()}`,
        studentId: generatedId,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        dateOfBirth: studentData.dateOfBirth,
        gender: studentData.gender || 'Male',
        classId: targetClass?.id || studentData.classId || 'cls-1',
        className: targetClass?.name || studentData.className || 'Nursery A',
        parentId: studentData.parentId || `par-${Date.now()}`,
        parentName: studentData.parentName || studentData.guardianName || 'Guardian',
        phone: studentData.phone || '+91 98000 00000',
        email: studentData.email || '',
        address: studentData.address || '',
        admissionDate: studentData.admissionDate || new Date().toISOString().split('T')[0],
        totalFee,
        paidFee,
        pendingFee,
        feeStatus: pendingFee === 0 ? 'Clear' : 'Pending',
        status: studentData.status || 'Active',
        avatar: null,
      };

      students.unshift(newStudent);
      localStore.saveStudents(students);

      return {
        success: true,
        data: newStudent,
        message: 'Student enrolled successfully!',
      };
    }
  },

  updateStudent: async (id, updateData) => {
    try {
      const response = await api.put(`/students/${id}`, updateData);
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 120));
      const students = localStore.getStudents();
      const index = students.findIndex((s) => s.id === id || s.studentId === id);
      if (index === -1) {
        throw new Error(`Student ${id} not found.`);
      }

      // Check if student ID changed and is duplicate
      if (updateData.studentId && updateData.studentId !== students[index].studentId) {
        if (students.some((s, idx) => idx !== index && s.studentId.toUpperCase() === updateData.studentId.toUpperCase())) {
          throw new Error(`Student ID ${updateData.studentId} is already in use.`);
        }
      }

      const existing = students[index];
      const totalFee = updateData.totalFee !== undefined ? Number(updateData.totalFee) : existing.totalFee;
      const paidFee = updateData.paidFee !== undefined ? Number(updateData.paidFee) : existing.paidFee;
      const pendingFee = Math.max(0, totalFee - paidFee);

      const updated = {
        ...existing,
        ...updateData,
        totalFee,
        paidFee,
        pendingFee,
        feeStatus: pendingFee === 0 ? 'Clear' : 'Pending',
      };

      students[index] = updated;
      localStore.saveStudents(students);

      return {
        success: true,
        data: updated,
        message: 'Student record updated successfully',
      };
    }
  },

  deactivateStudent: async (id) => {
    try {
      const response = await api.delete(`/students/${id}`);
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 100));
      const students = localStore.getStudents();
      const index = students.findIndex((s) => s.id === id || s.studentId === id);
      if (index === -1) {
        throw new Error(`Student ${id} not found.`);
      }

      students[index].status = students[index].status === 'Active' ? 'Inactive' : 'Active';
      localStore.saveStudents(students);

      return {
        success: true,
        data: students[index],
        message: `Student status changed to ${students[index].status}`,
      };
    }
  },
};
