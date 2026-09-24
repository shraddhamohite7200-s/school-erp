/**
 * Attendance Management Service
 * Communicates with GET/POST /api/attendance or local mock store
 */
import api from './api';
import { localStore } from './localStore';

export const attendanceService = {
  getTodaySummary: async () => {
    try {
      const response = await api.get('/attendance/summary');
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 60));
      const attendance = localStore.getAttendance();
      return {
        success: true,
        data: attendance,
      };
    }
  },

  getAttendanceRoster: async (date, classId) => {
    try {
      const response = await api.get('/attendance', { params: { date, classId } });
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 100));
      const students = localStore.getStudents().filter((s) => s.status === 'Active');
      const attendanceStore = localStore.getAttendance();
      const existingDateRecords = attendanceStore.studentRecords?.[date] || {};

      const filtered = classId && classId !== 'all'
        ? students.filter((s) => s.classId === classId || s.className === classId)
        : students;

      const roster = filtered.map((s) => ({
        studentId: s.id,
        enrollmentId: s.studentId,
        studentName: `${s.firstName} ${s.lastName}`,
        className: s.className,
        avatar: s.avatar,
        status: existingDateRecords[s.id] || 'Present', // Default is Present
      }));

      const isAlreadySaved = Boolean(attendanceStore.studentRecords?.[date]);

      return {
        success: true,
        data: roster,
        isAlreadySaved,
        date,
      };
    }
  },

  markAttendance: async (date, records) => {
    try {
      const response = await api.post('/attendance', { date, records });
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 150));
      const attendanceStore = localStore.getAttendance();
      if (!attendanceStore.studentRecords) {
        attendanceStore.studentRecords = {};
      }

      // Convert array of { studentId, status } into map
      const recordMap = { ...(attendanceStore.studentRecords[date] || {}) };
      let presentCount = 0;
      let absentCount = 0;

      records.forEach((r) => {
        recordMap[r.studentId] = r.status;
      });

      // Calculate totals for the date
      Object.values(recordMap).forEach((st) => {
        if (st === 'Present') presentCount++;
        else absentCount++;
      });

      attendanceStore.studentRecords[date] = recordMap;
      if (date === attendanceStore.date) {
        attendanceStore.present = presentCount;
        attendanceStore.absent = absentCount;
        attendanceStore.total = presentCount + absentCount;
      }

      localStore.saveAttendance(attendanceStore);

      return {
        success: true,
        message: `Attendance marked successfully for ${date} (${presentCount} Present, ${absentCount} Absent)`,
      };
    }
  },

  getAttendanceHistory: async (filters = {}) => {
    try {
      const response = await api.get('/attendance/history', { params: filters });
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 100));
      const attendanceStore = localStore.getAttendance();
      const students = localStore.getStudents();
      const studentMap = {};
      students.forEach((s) => {
        studentMap[s.id] = s;
      });

      const historyRows = [];
      const studentRecords = attendanceStore.studentRecords || {};

      Object.entries(studentRecords).forEach(([date, records]) => {
        Object.entries(records).forEach(([studentId, status]) => {
          const student = studentMap[studentId];
          if (student) {
            historyRows.push({
              id: `${date}-${studentId}`,
              date,
              studentId: student.studentId,
              studentName: `${student.firstName} ${student.lastName}`,
              className: student.className,
              classId: student.classId,
              status,
            });
          }
        });
      });

      // Filter by date, class, or student
      let filtered = historyRows;
      if (filters.date) {
        filtered = filtered.filter((h) => h.date === filters.date);
      }
      if (filters.classId && filters.classId !== 'all') {
        filtered = filtered.filter((h) => h.classId === filters.classId || h.className === filters.classId);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        filtered = filtered.filter(
          (h) => h.studentName.toLowerCase().includes(query) || h.studentId.toLowerCase().includes(query)
        );
      }

      // Sort recent first
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        success: true,
        data: filtered,
      };
    }
  },
};
