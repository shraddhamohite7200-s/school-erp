import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { settingsService } from '../../services/settingsService';
import { localStore } from '../../services/localStore';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import LoadingState from '../../components/common/LoadingState';

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [formData, setFormData] = useState({
    schoolName: '',
    address: '',
    phone: '',
    email: '',
    affiliationNumber: '',
    academicYear: '2026–27',
    currency: 'INR (₹)',
    adminName: '',
    adminEmail: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsService.getSettings();
      const s = res.data;
      setFormData({
        schoolName: s.schoolName || '',
        address: s.address || '',
        phone: s.phone || '',
        email: s.email || '',
        affiliationNumber: s.affiliationNumber || '',
        academicYear: s.academicYear || '2026–27',
        currency: s.currency || 'INR (₹)',
        adminName: user?.name || 'Rajesh Verma',
        adminEmail: user?.email || 'admin@schoolerp.in',
      });
    } catch (err) {
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updateSettings(formData);
      showToast('School settings saved successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemoData = () => {
    localStore.resetDefaults();
    showToast('Demo data restored to initial state. Reloading...', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  if (loading) {
    return <LoadingState message="Loading institutional configurations..." />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#c5c5d3]/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] tracking-wider uppercase text-[#00236f] font-bold bg-[#dce1ff] px-2 py-0.5 rounded-md">
              Administration
            </span>
            <span className="text-[#c5c5d3]">•</span>
            <span className="text-xs text-[#444651]">Institutional Metadata</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111c2d] tracking-tight">
            School Settings &amp; Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#444651] mt-0.5">
            Configure campus identity, official letterhead data, and administrative credentials.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* School Information */}
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#c5c5d3]/20">
            <span className="material-symbols-outlined text-[#1e3a8a] text-[20px]">
              account_balance
            </span>
            <h2 className="text-sm font-bold text-[#111c2d] uppercase tracking-wider">
              1. Institutional Identity &amp; Contact
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="School Name"
              required
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              helperText="Appears on official receipts and dashboard header"
            />

            <Input
              label="Affiliation / Registration ID"
              value={formData.affiliationNumber}
              onChange={(e) => setFormData({ ...formData, affiliationNumber: e.target.value })}
              helperText="Official license or state board number"
            />

            <Input
              label="Campus Phone Number"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="Official Contact Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <div className="sm:col-span-2">
              <Input
                label="Full Campus Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                helperText="Printed on fee vouchers and student dossiers"
              />
            </div>
          </div>
        </div>

        {/* Academic Settings */}
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#c5c5d3]/20">
            <span className="material-symbols-outlined text-[#1e3a8a] text-[20px]">
              calendar_month
            </span>
            <h2 className="text-sm font-bold text-[#111c2d] uppercase tracking-wider">
              2. Academic Year &amp; Currency
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Academic Session"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              helperText="Active operating year across all class cohorts"
            />

            <Input
              label="Ledger Currency"
              value={formData.currency}
              disabled
              helperText="Indian Rupee (₹) standard for micro-schools"
            />
          </div>
        </div>

        {/* Administrator Profile & Actions */}
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#c5c5d3]/20">
            <span className="material-symbols-outlined text-[#1e3a8a] text-[20px]">
              admin_panel_settings
            </span>
            <h2 className="text-sm font-bold text-[#111c2d] uppercase tracking-wider">
              3. Principal / Administrator Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Administrator Name"
              value={formData.adminName}
              onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
            />

            <Input
              label="Admin Login Email"
              type="email"
              value={formData.adminEmail}
              onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
            />
          </div>

          <div className="p-3 rounded-xl bg-[#f0f3ff] flex items-center justify-between text-xs mt-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c4a] text-[18px]">verified</span>
              <span className="font-semibold text-[#111c2d]">Super Admin Authorization Granted</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#85f8c4]/40 text-[#006c4a] font-bold text-[10px]">
              Full Privileges
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#c5c5d3]/30">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="text-xs text-[#ba1a1a] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset to Default Demo Data</span>
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-3.5 py-1.5 rounded-xl border border-[#ba1a1a]/40 text-[#ba1a1a] hover:bg-[#ffdad6]/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Sign Out Session</span>
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon="save"
            loading={saving}
          >
            Save Settings &amp; Update System
          </Button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetDemoData}
        isDanger={true}
        title="Reset All Mock Data to Factory Defaults?"
        description="This will clear locally recorded payments, new admissions, and customized attendance logs from localStorage and restore initial pristine school records."
        confirmText="Yes, Reset Data"
      />
    </div>
  );
}
