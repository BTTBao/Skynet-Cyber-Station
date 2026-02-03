
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
import Dashboard from './Dashboard';
import AccountManagement from './AccountManagement';
import RoomManagement from './RoomManagement';
import BookingManagement from './BookingManagement';

export default function AdminLayout() {
  const [activeMenu, setActiveMenu] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Quản lý tài khoản', icon: Users },
    { id: 'labs', label: 'Quản lý phòng máy', icon: Monitor },
    { id: 'bookings', label: 'Quản lý book phòng', icon: Calendar },
    { id: 'incidents', label: 'Quản lý sự cố', icon: AlertCircle },
  ];

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body, html, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .admin-layout-wrapper {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          position: fixed;
          top: 0;
          left: 0;
          background-color: #f9fafb;
        }
        .sidebar {
          background-color: #1e3a8a;
          height: 100vh;
          transition: all 0.3s;
          width: ${sidebarOpen ? '260px' : '0'};
          overflow: hidden;
          flex-shrink: 0;
        }
        .sidebar-header {
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .menu-item {
          border: none;
          background: transparent;
          color: #e0e7ff;
          transition: all 0.3s;
        }
        .menu-item:hover {
          background-color: rgba(30, 64, 175, 0.5);
          color: white;
        }
        .menu-item.active {
          background-color: #1e40af;
          color: white;
        }
        .logo-circle {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        }
        .admin-badge {
          background-color: #f8f9fa;
          border-radius: 50px;
        }
        .admin-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #4ade80 0%, #3b82f6 100%);
        }
        .main-content-wrapper {
          height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .content-area {
          flex: 1;
          overflow-y: auto;
        }
        .content-card {
          height: 100%;
          border-radius: 0.5rem;
        }
        .empty-state-icon {
          width: 80px;
          height: 80px;
          background-color: #f3f4f6;
        }
      `}</style>

      <div className="admin-layout-wrapper d-flex">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="d-flex flex-column h-100">
            {/* Sidebar Header */}
            <div className="sidebar-header p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold" 
                     style={{ width: '40px', height: '40px' }}>
                  UTH
                </div>
                {sidebarOpen && (
                  <span className="fw-semibold small">Admin Portal</span>
                )}
              </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-grow-1 p-3">
              <ul className="list-unstyled">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id} className="mb-2">
                      <button
                        onClick={() => setActiveMenu(item.id)}
                        className={`menu-item w-100 d-flex align-items-center gap-3 px-3 py-2 rounded ${
                          activeMenu === item.id ? 'active' : ''
                        }`}
                      >
                        <Icon size={20} />
                        {sidebarOpen && (
                          <span className="small fw-medium">{item.label}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {/* Logout button at the bottom */}
                <ul className="list-unstyled mt-auto mb-3">
                    <li>
                        <button
                            onClick={() => alert('Đăng xuất!')}
                            className="menu-item w-100 d-flex align-items-center gap-3 px-3 py-2 rounded"
                        >
                            <LogOut size={24} />
                            {sidebarOpen && <span className="small fw-medium">Đăng xuất</span>}
                        </button>
                    </li>
                </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="main-content-wrapper flex-grow-1">
          {/* Header */}
          <header className="bg-white border-bottom shadow-sm">
            <div className="container-fluid px-4 py-3">
              <div className="d-flex align-items-center justify-content-between">
                {/* Left Section */}
                <div className="d-flex align-items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="btn btn-light rounded"
                  >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                  
                  <div className="d-flex align-items-center gap-3">
                    <div className="logo-circle rounded d-flex align-items-center justify-content-center text-white fw-bold fs-5">
                      UTC2
                    </div>
                    <div>
                      <h1 className="fs-5 fw-bold mb-0 text-dark">
                        Trường Đại học Giao thông Vận tải
                      </h1>
                      <p className="small text-secondary mb-0">Phân hiệu tại TP.HCM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className={`content-area ${(activeMenu === 'dashboard' || activeMenu === 'accounts' || activeMenu === 'labs' || activeMenu === 'bookings') ? 'p-0' : 'p-4'}`}>
            {activeMenu === 'dashboard' ? (
              <Dashboard />
            ) : activeMenu === 'accounts' ? (
              <AccountManagement />
            ) : activeMenu === 'labs' ? (
              <RoomManagement />
            ) : activeMenu === 'bookings' ? (
              <BookingManagement />
            ) : activeMenu ? (
              <div className="card border-0 shadow-sm content-card">
                <div className="card-body d-flex align-items-center justify-content-center">
                  <div className="text-center">
                    <h2 className="fs-3 fw-bold text-dark mb-2">
                      {menuItems.find(item => item.id === activeMenu)?.label}
                    </h2>
                    <p className="text-secondary">Nội dung sẽ hiển thị ở đây</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card border-0 shadow-sm content-card">
                <div className="card-body d-flex align-items-center justify-content-center">
                  <div className="text-center">
                    <div className="empty-state-icon rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                      <LayoutDashboard size={40} className="text-secondary" />
                    </div>
                    <h2 className="fs-4 fw-semibold text-secondary mb-2">
                      Chào mừng đến với Admin Portal
                    </h2>
                    <p className="text-muted">
                      Vui lòng chọn một mục từ menu bên trái
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}