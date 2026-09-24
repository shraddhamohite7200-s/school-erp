/**
 * Fee Service
 * Manages Fee Structure and Pending Fees
 */
import api from './api';
import { localStore } from './localStore';

export const feeService = {
  getFeeStructures: async () => {
    try {
      const response = await api.get('/fees');
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 80));
      const structures = localStore.getFeeStructures();
      return {
        success: true,
        data: structures,
      };
    }
  },

  createFeeStructure: async (data) => {
    try {
      const response = await api.post('/fees', data);
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 120));
      const structures = localStore.getFeeStructures();

      const newStructure = {
        id: `fs-${Date.now()}`,
        classId: data.classId,
        className: data.className,
        academicYear: data.academicYear || '2026–27',
        annualFee: Number(data.annualFee),
        status: data.status || 'Active',
      };

      structures.push(newStructure);
      localStore.saveFeeStructures(structures);

      return {
        success: true,
        data: newStructure,
        message: 'Fee structure added successfully',
      };
    }
  },

  updateFeeStructure: async (id, data) => {
    try {
      const response = await api.put(`/fees/${id}`, data);
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 100));
      const structures = localStore.getFeeStructures();
      const index = structures.findIndex((f) => f.id === id);
      if (index === -1) throw new Error('Fee structure not found.');

      structures[index] = {
        ...structures[index],
        ...data,
        annualFee: Number(data.annualFee || structures[index].annualFee),
      };

      localStore.saveFeeStructures(structures);

      return {
        success: true,
        data: structures[index],
        message: 'Fee structure updated successfully',
      };
    }
  },

  getPendingFees: async (filters = {}) => {
    try {
      const response = await api.get('/fees/pending', { params: filters });
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 90));
      const students = localStore.getStudents();
      let pendingList = students.filter((s) => s.pendingFee > 0);

      if (filters.classId && filters.classId !== 'all') {
        pendingList = pendingList.filter((s) => s.classId === filters.classId || s.className === filters.classId);
      }

      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        pendingList = pendingList.filter(
          (s) =>
            s.firstName?.toLowerCase().includes(query) ||
            s.lastName?.toLowerCase().includes(query) ||
            s.studentId?.toLowerCase().includes(query) ||
            s.parentName?.toLowerCase().includes(query)
        );
      }

      const totalPendingAmount = pendingList.reduce((sum, s) => sum + (s.pendingFee || 0), 0);
      const studentCount = pendingList.length;

      return {
        success: true,
        data: pendingList,
        summary: {
          totalPendingAmount,
          studentCount,
        },
      };
    }
  },
};
