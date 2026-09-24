/**
 * Parent Management Service
 * Communicates with GET/POST/PUT /api/parents or local mock store
 */
import api from './api';
import { localStore } from './localStore';

export const parentService = {
  getParents: async (search = '') => {
    try {
      const response = await api.get('/parents', { params: { search } });
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 100));
      let parents = localStore.getParents();
      const students = localStore.getStudents();

      // Dynamically attach linked students
      const parentsWithStudents = parents.map((p) => {
        const linked = students.filter(
          (s) => s.parentId === p.id || s.parentName?.toLowerCase() === p.fullName?.toLowerCase()
        );
        return {
          ...p,
          students: linked,
          studentsCount: linked.length,
        };
      });

      if (search) {
        const query = search.toLowerCase().trim();
        return {
          success: true,
          data: parentsWithStudents.filter(
            (p) =>
              p.fullName?.toLowerCase().includes(query) ||
              p.phone?.includes(query) ||
              p.email?.toLowerCase().includes(query)
          ),
        };
      }

      return {
        success: true,
        data: parentsWithStudents,
      };
    }
  },

  getParentById: async (id) => {
    try {
      const response = await api.get(`/parents/${id}`);
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 80));
      const parents = localStore.getParents();
      const parent = parents.find((p) => p.id === id);
      if (!parent) {
        throw new Error('Parent not found.');
      }
      const students = localStore.getStudents();
      const linked = students.filter(
        (s) => s.parentId === parent.id || s.parentName?.toLowerCase() === parent.fullName?.toLowerCase()
      );
      return {
        success: true,
        data: {
          ...parent,
          students: linked,
        },
      };
    }
  },

  createParent: async (parentData) => {
    try {
      const response = await api.post('/parents', parentData);
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 120));
      const parents = localStore.getParents();

      const newParent = {
        id: `par-${Date.now()}`,
        fullName: parentData.fullName,
        phone: parentData.phone,
        email: parentData.email,
        address: parentData.address || '',
        occupation: parentData.occupation || 'Guardian',
        studentsCount: 0,
      };

      parents.unshift(newParent);
      localStore.saveParents(parents);

      return {
        success: true,
        data: newParent,
        message: 'Parent profile created successfully',
      };
    }
  },

  updateParent: async (id, updateData) => {
    try {
      const response = await api.put(`/parents/${id}`, updateData);
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 100));
      const parents = localStore.getParents();
      const index = parents.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error('Parent not found.');
      }

      parents[index] = {
        ...parents[index],
        ...updateData,
      };
      localStore.saveParents(parents);

      return {
        success: true,
        data: parents[index],
        message: 'Parent profile updated successfully',
      };
    }
  },
};
