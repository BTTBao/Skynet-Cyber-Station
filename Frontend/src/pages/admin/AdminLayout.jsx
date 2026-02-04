import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  LayoutDashboard,
  Users,
  Monitor,
  Calendar,
  AlertCircle,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const menuItems = [
    { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: 'accounts', label: 'Quản lý tài khoản', icon: Users },
    { path: 'labs', label: 'Quản lý phòng máy', icon: Monitor },
    { path: 'bookings', label: 'Quản lý book phòng', icon: Calendar },
    { path: 'incidents', label: 'Quản lý sự cố', icon: AlertCircle },
    { path: 'invoices', label: 'Quản lý hóa đơn', icon: Menu },
  ];

  return (
    <>
      <style>{`
        body, html, #root { width: 100%; height: 100%; overflow: hidden; }
        .admin-layout-wrapper { width: 100vw; height: 100vh; display: flex; }
        .sidebar {
          background-color: #1e3a8a;
          height: 100vh;
          width: ${sidebarOpen ? '260px' : '0'};
          transition: 0.3s;
          overflow: hidden;
        }
        .menu-item {
          color: #e0e7ff;
          text-decoration: none;
          border-radius: 6px;
        }
        .menu-item:hover { background: rgba(30,64,175,.5); color: white; }
        .menu-item.active { background: #1e40af; color: white; }
        .content-area { flex: 1; overflow-y: auto; }
      `}</style>

      <div className="admin-layout-wrapper">
        {/* Sidebar */}
        <aside className="sidebar p-3 d-flex flex-column">
          <div className="text-white fw-bold mb-4">UTC2 Admin</div>

          <nav className="flex-grow-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `menu-item d-flex align-items-center gap-3 px-3 py-2 mb-2 ${
                      isActive ? 'active' : ''
                    }`
                  }
                >
                  <Icon size={20} />
                  {sidebarOpen && item.label}
                </NavLink>
              );
            })}
          </nav>

          <button
            onClick={() => {
              alert('Đăng xuất!');
              navigate('/login');
            }}
            className="menu-item d-flex align-items-center gap-3 px-3 py-2"
          >
            <LogOut size={20} />
            {sidebarOpen && 'Đăng xuất'}
          </button>
        </aside>

        {/* Main */}
        <div className="flex-grow-1 d-flex flex-column">
          {/* Header */}
          <header className="bg-white border-bottom p-3 d-flex align-items-center gap-3">
            <button
              className="btn btn-light"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X /> : <Menu />}
            </button>

            <div>
              <strong>Trường ĐH GTVT</strong>
              <div className="text-muted small">Phân hiệu TP.HCM</div>
            </div>
          </header>

          {/* Content */}
          <main className="content-area p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
