import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentService } from '../../services/parentService';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

export default function Parents() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    occupation: 'Guardian',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadParents();
  }, [search]);

  const loadParents = async () => {
    try {
      setLoading(true);
      const res = await parentService.getParents(search);
      setParents(res.data || []);
      setCurrentPage(1);
    } catch (err) {
      showToast('Failed to load parents list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedParentId(null);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      address: '',
      occupation: 'Guardian',
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setModalMode('edit');
    setSelectedParentId(p.id);
    setFormData({
      fullName: p.fullName || '',
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
      occupation: p.occupation || 'Guardian',
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Please enter a valid 10-digit phone number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      if (modalMode === 'create') {
        await parentService.createParent(formData);
        showToast(`Parent ${formData.fullName} added successfully`, 'success');
      } else {
        await parentService.updateParent(selectedParentId, formData);
        showToast(`Parent profile updated successfully`, 'success');
      }
      setModalOpen(false);
      loadParents();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const paginatedParents = parents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] tracking-wider uppercase text-[#00236f] font-bold bg-[#dce1ff] px-2 py-0.5 rounded-md">
              Guardian Registry
            </span>
            <span className="text-[#c5c5d3]">•</span>
            <span className="text-xs text-[#444651]">Total: {parents.length} Guardians</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111c2d] tracking-tight">
            Parent &amp; Guardian Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#444651] mt-0.5">
            Maintain primary emergency contacts, telephone lines, and linked wards.
          </p>
        </div>

        <Button variant="primary" size="md" icon="add" onClick={handleOpenCreate}>
          Add New Parent
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#c5c5d3]/40 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#757682]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guardian by name, phone or email..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#f0f3ff] text-xs sm:text-sm text-[#111c2d] placeholder:text-[#757682] border border-[#c5c5d3]/40 focus:outline-none focus:bg-white focus:border-[#1e3a8a] transition-all"
          />
        </div>
        <span className="text-xs text-[#444651] font-semibold">
          Showing <span className="text-[#111c2d] font-bold">{paginatedParents.length}</span> of{' '}
          {parents.length} records
        </span>
      </div>

      {/* Parents Table */}
      <div className="bg-white rounded-2xl border border-[#c5c5d3]/40 shadow-xs overflow-hidden flex flex-col">
        {loading ? (
          <LoadingState message="Loading parents directory..." />
        ) : paginatedParents.length === 0 ? (
          <EmptyState
            icon="family_restroom"
            title="No parents found"
            description={
              search
                ? `No guardian record matches "${search}".`
                : 'No parents registered in the system.'
            }
            actionText="Add New Parent"
            onAction={handleOpenCreate}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f0f3ff] text-[#444651] font-semibold border-b border-[#c5c5d3]/30">
                    <th className="py-3 px-4">Guardian Name &amp; Role</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Residential Address</th>
                    <th className="py-3 px-4">Enrolled Scholar(s)</th>
                    <th className="py-3 px-4 text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c5c5d3]/20">
                  {paginatedParents.map((p) => (
                    <tr key={p.id} className="hover:bg-[#f0f3ff]/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#f0f3ff] text-[#1e3a8a] font-bold flex items-center justify-center text-xs">
                            {p.fullName
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#111c2d]">{p.fullName}</span>
                            <span className="text-[11px] text-[#757682]">{p.occupation}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-[#111c2d]">
                        <a href={`tel:${p.phone}`} className="hover:text-[#1e3a8a] hover:underline">
                          {p.phone}
                        </a>
                      </td>

                      <td className="py-3 px-4 text-[#444651]">
                        {p.email ? (
                          <a
                            href={`mailto:${p.email}`}
                            className="hover:text-[#1e3a8a] hover:underline"
                          >
                            {p.email}
                          </a>
                        ) : (
                          <span className="text-[#c5c5d3]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[#444651] max-w-xs truncate">
                        {p.address || <span className="text-[#c5c5d3]">—</span>}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {p.students && p.students.length > 0 ? (
                            p.students.map((st) => (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => navigate(`/students/${st.id}`)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#dee8ff] text-[#00236f] hover:bg-[#c5d5ff] font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[13px]">
                                  school
                                </span>
                                <span>
                                  {st.firstName} ({st.className})
                                </span>
                              </button>
                            ))
                          ) : (
                            <span className="text-[#757682] text-[11px] italic">
                              No active wards
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right pr-6">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-[#f0f3ff] text-[#444651] hover:text-[#1e3a8a] transition-colors cursor-pointer"
                          title="Edit Parent"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={parents.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Add / Edit Parent Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === 'create' ? 'Register New Guardian' : 'Edit Guardian Profile'}
        subtitle="Manage parental contact details and communication channels"
        icon="family_restroom"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Vikram Sharma"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            error={errors.fullName}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone Number"
              required
              placeholder="+91 98201 11223"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="parent@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Occupation / Relationship"
              placeholder="e.g. Software Engineer, Father"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
            />

            <Input
              label="Residential Address"
              placeholder="Flat 402, Green Valley Apartments, Mumbai"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#c5c5d3]/30">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
              icon={modalMode === 'create' ? 'add' : 'save'}
            >
              {modalMode === 'create' ? 'Save Guardian' : 'Update Record'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
