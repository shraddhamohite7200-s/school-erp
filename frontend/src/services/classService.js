/**
 * Class Management Service
 * Communicates with GET/POST/PUT /api/classes or local mock store
 */
import api from './api';
import { localStore } from './localStore';

export const classService = {
  getClasses: async () => {
    try {
      const response = await api.get('/classes');
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 80));
      const classes = localStore.getClasses();
      const students = localStore.getStudents();

      // Recalculate live student count per class
      const classesWithCount = classes.map((c) => {
        const count = students.filter(
          (s) => (s.classId === c.id || s.className === c.name) && s.status === 'Active'
        ).length;
        return {
          ...c,
          studentCount: count || c.studentCount || 0,
        };
      });

      return {
        success: true,
        data: classesWithCount,
      };
    }
  },

  createClass: async (classData) => {
    try {
      const response = await api.post('/classes', classData);
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 120));
      const classes = localStore.getClasses();

      const fullName = `${classData.classLevel || classData.name} ${classData.section}`.trim();
      const newClass = {
        id: `cls-${Date.now()}`,
        name: fullName,
        classLevel: classData.classLevel || classData.name,
        section: classData.section || 'A',
        academicYear: classData.academicYear || '2026–27',
        teacherName: classData.teacherName || 'Assigned Teacher',
        capacity: Number(classData.capacity) || 25,
        studentCount: 0,
        status: classData.status || 'Active',
        annualFee: Number(classData.annualFee) || 30000,
      };

      classes.push(newClass);
      localStore.saveClasses(classes);

      return {
        success: true,
        data: newClass,
        message: `Class ${fullName} created successfully`,
      };
    }
  },

  updateClass: async (id, updateData) => {
    try {
      const response = await api.put(`/classes/${id}`, updateData);
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 100));
      const classes = localStore.getClasses();
      const index = classes.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error('Class not found.');
      }

      const updated = {
        ...classes[index],
        ...updateData,
      };

      if (updateData.classLevel || updateData.section) {
        updated.name = `${updated.classLevel} ${updated.section}`.trim();
      }

      classes[index] = updated;
      localStore.saveClasses(classes);

      return {
        success: true,
        data: updated,
        message: 'Class updated successfully',
      };
    }
  },

  deactivateClass: async (id) => {
    try {
      const response = await api.delete(`/classes/${id}`);
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 100));
      const classes = localStore.getClasses();
      const index = classes.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error('Class not found.');
      }

      classes[index].status = classes[index].status === 'Active' ? 'Inactive' : 'Active';
      localStore.saveClasses(classes);

      return {
        success: true,
        data: classes[index],
        message: `Class status updated to ${classes[index].status}`,
      };
    }
  },
};
