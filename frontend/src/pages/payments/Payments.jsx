import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingState from '../../components/common/LoadingState';
import Pagination from '../../components/common/Pagination';

export default function Payments() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedMode, setSelectedMode] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    loadPayments();
  }, [search, selectedMode, dateFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getPayments({
        search,
        paymentMode: selectedMode,
        date: dateFilter,
      });
      setPayments(res.data || []);
      setCurrentPage(1);
    } catch (err) {
      showToast('Failed to load payments ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = 'Receipt Number,Student Name,Class,Amount,Payment Date,Payment Mode,Status\n';
    const rows = payments
      .map(
        (p) =>
          `"${p.receiptNumber}","${p.studentName}","${p.className}","${p.amount}","${p.paymentDate}","${p.paymentMode}","${p.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SchoolERP_Payments_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Payment ledger exported to CSV', 'info');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const upiCount = payments.filter((p) => p.paymentMode === 'UPI').length;
  const cashCount = payments.filter((p) => p.paymentMode === 'Cash').length;
  const bankCount = payments.filter((p) => p.paymentMode === 'Bank Transfer').length;

  const paginated = payments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] tracking-wider uppercase text-[#006c4a] font-bold bg-[#85f8c4]/40 px-2 py-0.5 rounded-md">
              Collections Ledger
            </span>
            <span className="text-[#c5c5d3]">•</span>
            <span className="text-xs text-[#444651]">Total: {payments.length} Transactions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111c2d] tracking-tight">
            Fee Payments &amp; Receipts
          </h1>
          <p className="text-xs sm:text-sm text-[#444651] mt-0.5">
            Audit trail of cleared tuition transactions and official printed receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="md" icon="download" onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="md"
            icon="payments"
            onClick={() => navigate('/fees/collect')}
          >
            + Record New Payment
          </Button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#444651] uppercase font-semibold">Total Revenue</span>
            <span className="text-2xl font-bold text-[#006c4a] font-numeric mt-0.5">
              {formatCurrency(totalCollected)}
            </span>
            <span className="text-[11px] text-[#006c4a] font-medium">100% Cleared</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#85f8c4]/30 flex items-center justify-center text-[#006c4a]">
            <span className="material-symbols-outlined text-[22px]">payments</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#444651] uppercase font-semibold">UPI / Online</span>
            <span className="text-2xl font-bold text-[#111c2d] font-numeric mt-0.5">
              {upiCount}
            </span>
            <span className="text-[11px] text-[#444651]">Instant Settlement</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] flex items-center justify-center text-[#1e3a8a]">
            <span className="material-symbols-outlined text-[22px]">smartphone</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#444651] uppercase font-semibold">Cash Receipts</span>
            <span className="text-2xl font-bold text-[#111c2d] font-numeric mt-0.5">
              {cashCount}
            </span>
            <span className="text-[11px] text-[#444651]">Cashier Verified</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] flex items-center justify-center text-[#1e3a8a]">
            <span className="material-symbols-outlined text-[22px]">point_of_sale</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#444651] uppercase font-semibold">Bank Transfers</span>
            <span className="text-2xl font-bold text-[#111c2d] font-numeric mt-0.5">
              {bankCount}
            </span>
            <span className="text-[11px] text-[#444651]">NEFT / IMPS</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] flex items-center justify-center text-[#1e3a8a]">
            <span className="material-symbols-outlined text-[22px]">account_balance</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative max-w-sm flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#757682]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search receipt no, student, class..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#f0f3ff] text-xs sm:text-sm text-[#111c2d] border border-[#c5c5d3]/40 focus:outline-none focus:bg-white"
            />
          </div>

          {/* Mode */}
          <div className="relative">
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="appearance-none h-10 pl-3 pr-8 rounded-xl bg-[#f0f3ff] text-xs font-semibold text-[#111c2d] border border-[#c5c5d3]/40 focus:outline-none focus:bg-white cursor-pointer"
            >
              <option value="all">Mode: All</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank transfer">Bank Transfer</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[18px] text-[#757682] pointer-events-none">
              arrow_drop_down
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-[#f0f3ff] text-xs font-semibold text-[#111c2d] border border-[#c5c5d3]/40 focus:outline-none focus:bg-white cursor-pointer"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="text-xs text-[#1e3a8a] underline font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <span className="text-xs text-[#444651] font-semibold">
          Showing <span className="text-[#111c2d] font-bold">{paginated.length}</span> of{' '}
          {payments.length} receipts
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs overflow-hidden flex flex-col">
        {loading ? (
          <LoadingState message="Loading payment transaction records..." />
        ) : paginated.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#757682]">
            No payment records matching the selected criteria.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f0f3ff] text-[#444651] font-semibold border-b border-[#c5c5d3]/30">
                    <th className="py-3 px-4">Receipt No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right pr-6">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c5c5d3]/20">
                  {paginated.map((pay) => (
                    <tr key={pay.id} className="hover:bg-[#f0f3ff]/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#1e3a8a]">
                        {pay.receiptNumber}
                      </td>

                      <td className="py-3 px-4 font-semibold text-[#111c2d]">
                        <span
                          onClick={() =>
                            navigate(
                              pay.studentId ? `/students/${pay.studentId}` : '/students'
                            )
                          }
                          className="hover:text-[#1e3a8a] hover:underline cursor-pointer"
                        >
                          {pay.studentName}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[#444651]">{pay.className}</td>

                      <td className="py-3 px-4 font-bold font-numeric text-[#006c4a] text-sm">
                        {formatCurrency(pay.amount)}
                      </td>

                      <td className="py-3 px-4 text-[#444651]">{formatDate(pay.paymentDate)}</td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0f3ff] text-[#111c2d] text-[11px] font-semibold border border-[#c5c5d3]/30">
                          <span className="material-symbols-outlined text-[13px] text-[#1e3a8a]">
                            {pay.paymentMode === 'UPI'
                              ? 'smartphone'
                              : pay.paymentMode === 'Bank Transfer'
                              ? 'account_balance'
                              : 'point_of_sale'}
                          </span>
                          {pay.paymentMode}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#85f8c4]/40 text-[#006c4a] font-bold text-[11px] border border-[#85f8c4]">
                          Cleared
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right pr-6">
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(pay)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#1e3a8a] font-bold transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">print</span>
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={payments.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Official Printable Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          title={`Fee Receipt: ${selectedReceipt.receiptNumber}`}
          subtitle="Official electronic voucher and proof of payment"
          maxWidth="max-w-xl"
          icon="receipt"
        >
          <div id="printable-receipt" className="flex flex-col gap-4 text-xs">
            {/* Receipt Header */}
            <div className="p-4 rounded-xl bg-[#f0f3ff] border border-[#c5c5d3]/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#1e3a8a] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">school</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#00236f] text-sm">Vidya Mandir Academy</h3>
                  <p className="text-[11px] text-[#444651]">
                    Sector 4, Vashi, Navi Mumbai • Affiliation No. VM-2026-EY
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-[#1e3a8a] block">
                  {selectedReceipt.receiptNumber}
                </span>
                <span className="text-[11px] text-[#757682]">
                  Date: {selectedReceipt.paymentDate}
                </span>
              </div>
            </div>

            {/* Scholar & Fee Breakdown */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-white rounded-xl border border-[#c5c5d3]/30">
              <div>
                <span className="text-[#757682] block text-[10px] uppercase font-bold">
                  Student Name
                </span>
                <span className="font-bold text-[#111c2d] text-sm">
                  {selectedReceipt.studentName}
                </span>
              </div>
              <div>
                <span className="text-[#757682] block text-[10px] uppercase font-bold">
                  Class &amp; Section
                </span>
                <span className="font-semibold text-[#111c2d] text-sm">
                  {selectedReceipt.className}
                </span>
              </div>
              <div>
                <span className="text-[#757682] block text-[10px] uppercase font-bold">
                  Payment Mode
                </span>
                <span className="font-semibold text-[#111c2d]">
                  {selectedReceipt.paymentMode}
                </span>
              </div>
              <div>
                <span className="text-[#757682] block text-[10px] uppercase font-bold">
                  Transaction Status
                </span>
                <span className="text-[#006c4a] font-bold">Paid &amp; Realized</span>
              </div>
            </div>

            {/* Line Item */}
            <div className="p-3.5 rounded-xl bg-[#f0f3ff] flex items-center justify-between">
              <span className="font-semibold text-[#111c2d]">
                Tuition Fee Payment (Academic Session 2026–27)
              </span>
              <span className="text-lg font-bold font-numeric text-[#006c4a]">
                {formatCurrency(selectedReceipt.amount)}
              </span>
            </div>

            {/* Signature & Seal Strip */}
            <div className="flex items-end justify-between pt-6 mt-2 border-t border-[#c5c5d3]/30">
              <div className="flex flex-col">
                <div className="w-20 h-10 border border-dashed border-[#c5c5d3] rounded flex items-center justify-center text-[10px] text-[#757682]">
                  [School Seal]
                </div>
                <span className="text-[10px] text-[#757682] mt-1">Verified Digital Voucher</span>
              </div>

              <div className="flex flex-col text-right">
                <span className="font-semibold text-[#111c2d]">Rajesh Verma</span>
                <span className="text-[10px] text-[#757682]">Authorised Bursar / Administrator</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#c5c5d3]/30">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReceipt(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon="print"
                onClick={handlePrintReceipt}
              >
                Print Official Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
