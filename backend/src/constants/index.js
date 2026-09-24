/**
 * Application-wide Constants
 */

const ROLES = Object.freeze({
  ADMIN: 'admin',
  TEACHER: 'teacher',
  ACCOUNTANT: 'accountant',
  PARENT: 'parent',
});

const STUDENT_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  GRADUATED: 'graduated',
  TRANSFERRED: 'transferred',
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  PARTIAL: 'partial',
  OVERDUE: 'overdue',
});

const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
});

module.exports = {
  ROLES,
  STUDENT_STATUS,
  PAYMENT_STATUS,
  ATTENDANCE_STATUS,
};
