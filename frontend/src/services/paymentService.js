/**
 * Payment Service
 * Communicates with GET/POST /api/payments or local mock store
 * Strict validation: Never allows Pending < 0 or Amount > Pending
 */
import api from './api';
import { localStore } from './localStore';

export const paymentService = {
  getPayments: async (filters = {}) => {
    try {
      const response = await api.get('/payments', { params: filters });
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 90));
      let payments = localStore.getPayments();

      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        payments = payments.filter(
          (p) =>
            p.studentName?.toLowerCase().includes(query) ||
            p.receiptNumber?.toLowerCase().includes(query) ||
            p.className?.toLowerCase().includes(query)
        );
      }

      if (filters.paymentMode && filters.paymentMode !== 'all') {
        payments = payments.filter((p) => p.paymentMode.toLowerCase() === filters.paymentMode.toLowerCase());
      }

      if (filters.studentId && filters.studentId !== 'all') {
        payments = payments.filter((p) => p.studentId === filters.studentId);
      }

      if (filters.date) {
        payments = payments.filter((p) => p.paymentDate === filters.date);
      }

      return {
        success: true,
        data: payments,
      };
    }
  },

  createPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 150));
      const amount = Number(paymentData.amount);

      if (!amount || amount <= 0) {
        throw new Error('Please enter a valid payment amount greater than ₹0.');
      }

      const students = localStore.getStudents();
      const studentIndex = students.findIndex((s) => s.id === paymentData.studentId);

      if (studentIndex === -1) {
        throw new Error('Selected student could not be found.');
      }

      const student = students[studentIndex];

      // PRD Rule: If Amount > Pending, prevent submission
      if (amount > student.pendingFee) {
        throw new Error(
          `Payment amount (₹${amount.toLocaleString('en-IN')}) cannot exceed the pending balance of ₹${student.pendingFee.toLocaleString('en-IN')}.`
        );
      }

      // Generate Receipt Number
      const payments = localStore.getPayments();
      const receiptNumber = paymentData.receiptNumber || `REC-${1049 + payments.length}`;

      const newPayment = {
        id: `pay-${Date.now()}`,
        receiptNumber,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        className: student.className,
        amount,
        paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
        paymentMode: paymentData.paymentMode || 'Cash',
        status: 'Paid',
        notes: paymentData.notes || 'Fee payment',
      };

      // Update student balance
      student.paidFee += amount;
      student.pendingFee = Math.max(0, student.totalFee - student.paidFee);
      student.feeStatus = student.pendingFee === 0 ? 'Clear' : 'Pending';

      students[studentIndex] = student;
      payments.unshift(newPayment);

      localStore.saveStudents(students);
      localStore.savePayments(payments);

      return {
        success: true,
        data: newPayment,
        message: `Payment of ₹${amount.toLocaleString('en-IN')} recorded successfully. Receipt ${receiptNumber} generated.`,
      };
    }
  },
};
