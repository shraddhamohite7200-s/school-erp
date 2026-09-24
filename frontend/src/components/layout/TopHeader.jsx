import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function TopHeader({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/students?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-[#c5c5d3]/40 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-[#444651] hover:bg-[#f0f3ff] lg:hidden cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#757682] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, roll no, father name..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#f0f3ff] border border-[#c5c5d3]/40 text-xs sm:text-sm text-[#111c2d] placeholder:text-[#757682] focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-all shadow-2xs"
          />
        </form>
      </div>

      {/* Right: Academic Status, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-4 ml-2">
        {/* Academic Year Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f3ff] border border-[#c5c5d3]/40">
          <span className="w-2 h-2 rounded-full bg-[#006c4a] animate-pulse"></span>
          <span className="text-xs font-semibold text-[#444651]">
            Academic Year:{' '}
            <span className="text-[#111c2d] font-bold">
              {user?.academicYear || '2026–27'}
            </span>
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationToast(!showNotificationToast)}
            className="relative p-2 rounded-xl text-[#444651] hover:bg-[#f0f3ff] hover:text-[#111c2d] transition-colors cursor-pointer"
            aria-label="Notifications"
            title="School alerts"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-white"></span>
          </button>

          {showNotificationToast && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#c5c5d3]/40 p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-[#c5c5d3]/30">
                <span className="text-xs font-bold text-[#111c2d]">Campus Notifications</span>
                <span className="text-[10px] font-semibold bg-[#ffdad6] text-[#ba1a1a] px-1.5 py-0.5 rounded">
                  2 New
                </span>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <div className="p-2 rounded-xl bg-[#f0f3ff] text-xs">
                  <span className="font-semibold text-[#111c2d] block">
                    Q2 Fee Collection Drive
                  </span>
                  <span className="text-[#444651] text-[11px]">
                    18 students have outstanding fee balances nearing quarter end.
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-[#85f8c4]/20 text-xs">
                  <span className="font-semibold text-[#006c4a] block">
                    Attendance 89.8% Today
                  </span>
                  <span className="text-[#444651] text-[11px]">
                    115 out of 128 registered students marked present.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-[1px] bg-[#c5c5d3]/50 hidden sm:block"></div>

        {/* Admin Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-[#f0f3ff] transition-colors cursor-pointer select-none"
          >
            <img
              src={
                user?.avatar ||
                'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ5ukJXdWj_VS8soatiNs2rFXpWuFevt9bsL0d2P70LwJlP64wMiKOx-hgAlc8BaoWOLwQEkiifz53boIPJyku7Yqg-N8oZrCaLpiXhTar7uSJUlQO3_E8Ow7NwNeGRii5v1pTyDEUf7FJZXGsbg15kWMYImJxBwAEUAw1e1-lIo-TPW9d1fweU2IZvFs-7QfNnOj1uupY6A_hGCZ7d3OFd00pvUq8ErbDdnMVt6S78ITFlIisZMXa'
              }
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-[#c5c5d3]/60"
            />
            <div className="hidden md:flex flex-col text-left leading-none">
              <span className="text-xs font-semibold text-[#111c2d]">
                {user?.name || 'Rajesh V.'}
              </span>
              <span className="text-[11px] text-[#444651]">
                {user?.role || 'Super Admin'}
              </span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-[#757682]">
              expand_more
            </span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#c5c5d3]/40 py-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3.5 py-2 border-b border-[#c5c5d3]/30 md:hidden">
                <div className="text-xs font-semibold text-[#111c2d]">{user?.name}</div>
                <div className="text-[11px] text-[#444651]">{user?.email}</div>
              </div>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-[#111c2d] hover:bg-[#f0f3ff] text-left"
              >
                <span className="material-symbols-outlined text-[16px]">settings</span>
                <span>School Settings</span>
              </button>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/reports');
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-[#111c2d] hover:bg-[#f0f3ff] text-left"
              >
                <span className="material-symbols-outlined text-[16px]">analytics</span>
                <span>Audit & Reports</span>
              </button>
              <div className="h-[1px] bg-[#c5c5d3]/30 my-1"></div>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-[#ba1a1a] hover:bg-[#ffdad6]/40 text-left"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
