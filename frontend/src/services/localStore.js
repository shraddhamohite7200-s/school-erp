/**
 * Local Data Store for Mock / Development Mode
 * Persists in localStorage so the user can interactively create, edit,
 * collect fees, mark attendance, and see live UI updates without a live database.
 */
import {
  INITIAL_SCHOOL_SETTINGS,
  INITIAL_CLASSES,
  INITIAL_PARENTS,
  INITIAL_STUDENTS,
  INITIAL_PAYMENTS,
  INITIAL_FEE_STRUCTURES,
  INITIAL_ATTENDANCE_SNAPSHOT,
} from './mockData';

const STORAGE_KEYS = {
  SETTINGS: 'schoolerp_data_settings',
  CLASSES: 'schoolerp_data_classes',
  PARENTS: 'schoolerp_data_parents',
  STUDENTS: 'schoolerp_data_students',
  PAYMENTS: 'schoolerp_data_payments',
  FEE_STRUCTURES: 'schoolerp_data_fee_structures',
  ATTENDANCE: 'schoolerp_data_attendance',
  AUDIT_LOG: 'schoolerp_data_audit_log',
};

const getFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write error', e);
  }
};

export const localStore = {
  getSettings: () => getFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_SCHOOL_SETTINGS),
  saveSettings: (settings) => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
    return settings;
  },

  getClasses: () => getFromStorage(STORAGE_KEYS.CLASSES, INITIAL_CLASSES),
  saveClasses: (classes) => {
    saveToStorage(STORAGE_KEYS.CLASSES, classes);
    return classes;
  },

  getParents: () => getFromStorage(STORAGE_KEYS.PARENTS, INITIAL_PARENTS),
  saveParents: (parents) => {
    saveToStorage(STORAGE_KEYS.PARENTS, parents);
    return parents;
  },

  getStudents: () => getFromStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS),
  saveStudents: (students) => {
    saveToStorage(STORAGE_KEYS.STUDENTS, students);
    return students;
  },

  getPayments: () => getFromStorage(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS),
  savePayments: (payments) => {
    saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
    return payments;
  },

  getFeeStructures: () => getFromStorage(STORAGE_KEYS.FEE_STRUCTURES, INITIAL_FEE_STRUCTURES),
  saveFeeStructures: (structures) => {
    saveToStorage(STORAGE_KEYS.FEE_STRUCTURES, structures);
    return structures;
  },

  getAttendance: () => getFromStorage(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE_SNAPSHOT),
  saveAttendance: (attendance) => {
    saveToStorage(STORAGE_KEYS.ATTENDANCE, attendance);
    return attendance;
  },

  resetDefaults: () => {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CLASSES);
    localStorage.removeItem(STORAGE_KEYS.PARENTS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.FEE_STRUCTURES);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
  }
};
