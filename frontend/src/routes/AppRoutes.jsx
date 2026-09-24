import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

// Pages
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import Students from '../pages/students/Students';
import AddStudent from '../pages/students/AddStudent';
import EditStudent from '../pages/students/EditStudent';
import StudentDetails from '../pages/students/StudentDetails';
import Parents from '../pages/parents/Parents';
import Classes from '../pages/classes/Classes';
import Attendance from '../pages/attendance/Attendance';
import AttendanceHistory from '../pages/attendance/AttendanceHistory';
import Fees from '../pages/fees/Fees';
import PendingFees from '../pages/fees/PendingFees';
import CollectFee from '../pages/fees/CollectFee';
import Payments from '../pages/payments/Payments';
import Reports from '../pages/reports/Reports';
import Settings from '../pages/settings/Settings';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Authenticated Application Shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Student Management */}
          <Route path="/students" element={<Students />} />
          <Route path="/students/new" element={<AddStudent />} />
          <Route path="/students/:id" element={<StudentDetails />} />
          <Route path="/students/:id/edit" element={<EditStudent />} />

          {/* Parent Management */}
          <Route path="/parents" element={<Parents />} />

          {/* Class Management */}
          <Route path="/classes" element={<Classes />} />

          {/* Attendance Management */}
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/attendance/history" element={<AttendanceHistory />} />

          {/* Fee & Payment Operations */}
          <Route path="/fees" element={<Fees />} />
          <Route path="/fees/pending" element={<PendingFees />} />
          <Route path="/fees/collect" element={<CollectFee />} />
          <Route path="/payments" element={<Payments />} />

          {/* Reports & Audit */}
          <Route path="/reports" element={<Reports />} />

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
