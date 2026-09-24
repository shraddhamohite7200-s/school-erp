/**
 * Report Service
 * Generates structured summaries for Student, Attendance, and Fee Reports
 */
import api from './api';
import { localStore } from './localStore';

export const reportService = {
  getStudentReport: async () => {
    try {
      const response = await api.get('/reports/students');
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 80));
      const students = localStore.getStudents();
      const classes = localStore.getClasses();

      const totalStudents = students.length;
      const activeStudents = students.filter((s) => s.status === 'Active').length;
      const inactiveStudents = totalStudents - activeStudents;

      // Group by class
      const byClass = classes.map((c) => {
        const classStudents = students.filter((s) => s.classId === c.id || s.className === c.name);
        const boys = classStudents.filter((s) => s.gender === 'Male').length;
        const girls = classStudents.filter((s) => s.gender === 'Female').length;
        return {
          classId: c.id,
          className: c.name,
          total: classStudents.length,
          boys,
          girls,
          teacherName: c.teacherName,
        };
      });

      return {
        success: true,
        data: {
          totalStudents,
          activeStudents,
          inactiveStudents,
          byClass,
        },
      };
    }
  },

  getAttendanceReport: async (date = '2026-09-22') => {
    try {
      const response = await api.get('/reports/attendance', { params: { date } });
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 80));
      const attendanceStore = localStore.getAttendance();
      const students = localStore.getStudents().filter((s) => s.status === 'Active');
      const dateRecords = attendanceStore.studentRecords?.[date] || {};

      let present = 0;
      let absent = 0;
      const studentBreakdown = [];

      students.forEach((s) => {
        const status = dateRecords[s.id] || 'Present';
        if (status === 'Present') present++;
        else absent++;
        studentBreakdown.push({
          studentId: s.studentId,
          name: `${s.firstName} ${s.lastName}`,
          className: s.className,
          status,
        });
      });

      const total = present + absent || students.length;
      const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

      return {
        success: true,
        data: {
          date,
          total,
          present,
          absent,
          rate: `${rate}%`,
          records: studentBreakdown,
        },
      };
    }
  },

  getFeeReport: async () => {
    try {
      const response = await api.get('/reports/fees');
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 80));
      const students = localStore.getStudents();
      const classes = localStore.getClasses();

      const totalFee = students.reduce((acc, s) => acc + (s.totalFee || 0), 0);
      const totalCollected = students.reduce((acc, s) => acc + (s.paidFee || 0), 0);
      const totalPending = students.reduce((acc, s) => acc + (s.pendingFee || 0), 0);
      const collectionRate = totalFee > 0 ? ((totalCollected / totalFee) * 100).toFixed(1) : 0;

      const classBreakdown = classes.map((c) => {
        const classStudents = students.filter((s) => s.classId === c.id || s.className === c.name);
        const classTotal = classStudents.reduce((sum, s) => sum + (s.totalFee || 0), 0);
        const classPaid = classStudents.reduce((sum, s) => sum + (s.paidFee || 0), 0);
        const classPending = classStudents.reduce((sum, s) => sum + (s.pendingFee || 0), 0);
        return {
          className: c.name,
          studentCount: classStudents.length,
          totalFee: classTotal,
          paidFee: classPaid,
          pendingFee: classPending,
          rate: classTotal > 0 ? `${((classPaid / classTotal) * 100).toFixed(1)}%` : '0%',
        };
      });

      return {
        success: true,
        data: {
          totalFee,
          totalCollected,
          totalPending,
          collectionRate: `${collectionRate}%`,
          classBreakdown,
        },
      };
    }
  },
};
