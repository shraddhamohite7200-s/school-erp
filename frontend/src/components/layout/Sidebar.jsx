import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Students', path: '/students', icon: 'school' },
    { label: 'Parents', path: '/parents', icon: 'family_restroom' },
    { label: 'Classes', path: '/classes', icon: 'meeting_room' },
    { label: 'Attendance', path: '/attendance', icon: 'fact_check' },
    { label: 'Fees', path: '/fees', icon: 'receipt_long' },
    { label: 'Payments', path: '/payments', icon: 'payments' },
    { label: 'Reports', path: '/reports', icon: 'analytics' },
    { label: 'Settings', path: '/settings', icon: 'settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#111c2d]/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-[#c5c5d3]/40 z-50 flex flex-col justify-between select-none transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* Top Brand */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#c5c5d3]/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1e3a8a] text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base font-bold text-[#00236f] tracking-tight">
                  SchoolERP
                </span>
                <span className="text-[11px] text-[#444651] font-medium">Admin Portal</span>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#757682] hover:bg-[#f0f3ff] lg:hidden"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* School Badge Strip */}
          <div className="px-4 py-3">
            <div className="px-3 py-2 bg-[#f0f3ff] rounded-xl flex items-center justify-between border border-[#c5c5d3]/30">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-[16px] text-[#006c4a] shrink-0">
                  account_balance
                </span>
                <span className="text-xs font-semibold text-[#111c2d] truncate max-w-[130px]">
                  {user?.schoolName || 'Vidya Mandir Academy'}
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-[#d8e3fb] text-[10px] font-bold text-[#00236f]">
                {user?.academicYear || '2026–27'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col px-2.5 gap-0.5 mt-1 overflow-y-auto max-h-[calc(100vh-230px)]">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium ${
                    isActive
                      ? 'bg-[#1e3a8a] text-white font-semibold shadow-xs'
                      : 'text-[#444651] hover:bg-[#f0f3ff] hover:text-[#111c2d]'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Profile Footer */}
        <div className="p-3 border-t border-[#c5c5d3]/30 flex flex-col gap-1 bg-white">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-[#f0f3ff] transition-colors border border-transparent hover:border-[#c5c5d3]/30">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={
                  user?.avatar ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ5ukJXdWj_VS8soatiNs2rFXpWuFevt9bsL0d2P70LwJlP64wMiKOx-hgAlc8BaoWOLwQEkiifz53boIPJyku7Yqg-N8oZrCaLpiXhTar7uSJUlQO3_E8Ow7NwNeGRii5v1pTyDEUf7FJZXGsbg15kWMYImJxBwAEUAw1e1-lIo-TPW9d1fweU2IZvFs-7QfNnOj1uupY6A_hGCZ7d3OFd00pvUq8ErbDdnMVt6S78ITFlIisZMXa'
                }
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-[#c5c5d3]/50"
              />
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-xs font-semibold text-[#111c2d] truncate">
                  {user?.name || 'Rajesh Verma'}
                </span>
                <span className="text-[11px] text-[#444651] truncate">
                  {user?.email || 'admin@schoolerp.in'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-[#757682] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Logout"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
