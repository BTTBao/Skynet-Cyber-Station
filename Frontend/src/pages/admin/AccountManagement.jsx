import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Lock, Unlock, Users, UserCheck, UserX, Shield, Mail, Phone, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'https://localhost:7140/api';

export default function AccountManagement() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    roleId: '',
    email: '',
    phone: '',
    department: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchAccounts();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles`);
      const result = await response.json();

      if (result.success) {
        setRoles(result.data);
        if (result.data.length > 0) {
          setFormData(prev => ({ ...prev, roleId: result.data[0].roleId }));
        }
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      const fallbackRoles = [
        { roleId: 1, roleName: 'Admin', roleCode: 'admin' },
        { roleId: 2, roleName: 'Quản lý', roleCode: 'manager' },
        { roleId: 3, roleName: 'Giảng viên', roleCode: 'teacher' },
        { roleId: 4, roleName: 'Sinh viên', roleCode: 'student' }
      ];
      setRoles(fallbackRoles);
      setFormData(prev => ({ ...prev, roleId: fallbackRoles[0].roleId }));
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, { method: 'GET' });
      const result = await res.json();
      setAccounts(result.data || []);
    } catch (err) {
      console.error('Lỗi fetch tài khoản:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên';
    } else if (formData.fullName.trim().length < 3) {
      errors.fullName = 'Họ tên phải có ít nhất 3 ký tự';
    }

    if (!formData.username.trim()) {
      errors.username = 'Vui lòng nhập username';
    } else if (formData.username.trim().length < 4) {
      errors.username = 'Username phải có ít nhất 4 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username chỉ được chứa chữ cái, số và dấu gạch dưới';
    }

    if (!formData.password) {
      errors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Mật khẩu phải chứa cả chữ và số';
    }

    if (!formData.roleId) {
      errors.roleId = 'Vui lòng chọn vai trò';
    }

    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      errors.phone = 'Số điện thoại phải có đúng 10 chữ số';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const payload = {
      fullName: formData.fullName,
      username: formData.username,
      password: formData.password,
      role: parseInt(formData.roleId),
      email: formData.email,
      phone: formData.phone,
      department: formData.department || ''
    };

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        await fetchAccounts();
        setFormData({
          fullName: '',
          username: '',
          password: '',
          roleId: roles.length > 0 ? roles[0].roleId : '',
          email: '',
          phone: '',
          department: ''
        });
        setFormErrors({});
        setShowCreateForm(false);
        alert('Tạo tài khoản thành công!');
      } else {
        alert(result.message || 'Có lỗi xảy ra khi tạo tài khoản');
      }
    } catch (err) {
      alert('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const toggleAccountStatus = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/toggle-status`, {
        method: 'PATCH'
      });
      const result = await response.json();
      if (result.success) {
        setAccounts(accounts.map(acc =>
          acc.id === id ? { ...acc, status: acc.status === 'active' ? 'locked' : 'active' } : acc
        ));
      }
    } catch (err) {
      alert('Lỗi kết nối đến server');
    }
  };

  const handleCloseModal = () => {
    setShowCreateForm(false);
    setFormErrors({});
    setFormData({
      fullName: '',
      username: '',
      password: '',
      roleId: roles.length > 0 ? roles[0].roleId : '',
      email: '',
      phone: '',
      department: ''
    });
  };

  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'active', label: 'Hoạt động' },
    { value: 'locked', label: 'Đã khóa' }
  ];

  const filteredAccounts = accounts.filter(acc => {
    const matchSearch =
      acc.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === 'all' || acc.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: accounts.length,
    active: accounts.filter(acc => acc.status === 'active').length,
    locked: accounts.filter(acc => acc.status === 'locked').length,
    highCredit: accounts.filter(acc => acc.creditScore >= 80).length
  };

  const getRoleBadgeColor = (roleName) => {
    const colors = {
      'Admin': '#ef4444',
      'Quản lý': '#3b82f6',
      'Giảng viên': '#06b6d4',
      'Sinh viên': '#6b7280'
    };
    return colors[roleName] || '#6b7280';
  };

  const getCreditScoreBadge = (score) => {
    if (score >= 80) return { bg: '#ecfdf5', color: '#059669', label: 'Xuất sắc' };
    if (score >= 50) return { bg: '#fffbeb', color: '#d97706', label: 'Trung bình' };
    return { bg: '#fee2e2', color: '#dc2626', label: 'Thấp' };
  };

  if (loading) {
    return <div className="p-4 text-center">Đang tải dữ liệu tài khoản...</div>;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .acc-root { min-height: 100vh; background: #f0f4f8; padding: 28px; }
        .acc-header { background: #1e293b; border-radius: 16px; padding: 28px 32px; margin-bottom: 24px; position: relative; overflow: hidden; }
        .acc-header::before { content: ''; position: absolute; top: -40px; right: -40px; width: 180px; height: 180px; background: rgba(99,102,241,0.12); border-radius: 50%; }
        .acc-header::after { content: ''; position: absolute; bottom: -30px; left: 30%; width: 120px; height: 120px; background: rgba(16,185,129,0.08); border-radius: 50%; }
        .acc-header h1 { color: #f1f5f9; font-size: 22px; font-weight: 700; margin: 0 0 4px; position: relative; z-index: 1; }
        .acc-header p { color: #94a3b8; font-size: 14px; margin: 0; position: relative; z-index: 1; }
        .acc-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 22px; }
        .acc-stat-card { background: #fff; border-radius: 12px; padding: 18px 20px; border: 1px solid #e2e8f0; }
        .acc-stat-card .stat-val { font-size: 26px; font-weight: 700; line-height: 1; margin-bottom: 4px; }
        .acc-stat-card .stat-label { font-size: 12.5px; color: #64748b; font-weight: 500; }
        .acc-stat-card .stat-icon { float: right; width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .color-blue .stat-val { color: #3b82f6; } .color-blue .stat-icon { background: #eff6ff; color: #3b82f6; }
        .color-green .stat-val { color: #10b981; } .color-green .stat-icon { background: #ecfdf5; color: #10b981; }
        .color-red .stat-val { color: #ef4444; } .color-red .stat-icon { background: #fee2e2; color: #ef4444; }
        .color-purple .stat-val { color: #8b5cf6; } .color-purple .stat-icon { background: #f5f3ff; color: #8b5cf6; }
        .acc-toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 18px; flex-wrap: wrap; }
        .acc-search { position: relative; flex: 1; min-width: 240px; max-width: 420px; }
        .acc-search input { width: 100%; padding: 10px 16px 10px 42px; border-radius: 10px; border: 1.5px solid #e2e8f0; font-size: 13.5px; background: #fff; transition: 0.2s; outline: none; }
        .acc-search input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .acc-search .search-ic { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .acc-status-pills { display: flex; gap: 6px; }
        .acc-status-pill { padding: 8px 14px; border-radius: 20px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: 0.2s; }
        .acc-status-pill:hover { border-color: #c7d2fe; background: #f5f3ff; }
        .acc-status-pill.active { background: #6366f1; color: #fff; border-color: #6366f1; }
        .acc-create-btn { padding: 9px 18px; border-radius: 10px; background: #6366f1; color: #fff; border: none; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .acc-create-btn:hover { background: #4f46e5; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
        .acc-table-wrap { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; }
        .acc-table { width: 100%; border-collapse: collapse; }
        .acc-table thead { background: #f8fafc; }
        .acc-table th { padding: 12px 18px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
        .acc-table td { padding: 14px 18px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; color: #334155; }
        .acc-table tr:last-child td { border-bottom: none; }
        .acc-table tr:hover td { background: #fafbfd; }
        .acc-username { font-family: 'JetBrains Mono', monospace; font-size: 12.5px; color: #6366f1; font-weight: 600; background: #eef2ff; padding: 3px 8px; border-radius: 5px; }
        .acc-status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; font-size: 12.5px; font-weight: 600; }
        .acc-status-active { background: #ecfdf5; color: #059669; }
        .acc-status-locked { background: #fee2e2; color: #dc2626; }
        .acc-empty { padding: 60px 20px; text-align: center; color: #94a3b8; }
        .acc-empty svg { margin-bottom: 12px; opacity: 0.5; }
        .acc-act-btn { background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s; color: #475569; font-size: 13px; font-weight: 500; display: inline-flex; align-items: center; gap: 4px; }
        .acc-act-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
        .acc-act-btn-danger { background: #fee2e2; border-color: #fecaca; color: #dc2626; }
        .acc-act-btn-danger:hover { background: #fca5a5; border-color: #f87171; }
        .acc-act-btn-success { background: #dcfce7; border-color: #bbf7d0; color: #16a34a; }
        .acc-act-btn-success:hover { background: #86efac; border-color: #4ade80; }
        
        /* Modal Styles */
        .modal-backdrop-acc { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s; }
        .modal-dialog-acc { background: #fff; border-radius: 16px; width: 90%; max-width: 600px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; animation: slideUp 0.3s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .modal-header-acc { padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .modal-header-acc h3 { margin: 0; font-size: 18px; font-weight: 700; color: #1e293b; }
        .modal-close { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .modal-close:hover { background: #e2e8f0; }
        .modal-body-acc { padding: 24px; overflow-y: auto; flex: 1; }
        .modal-footer-acc { padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; gap: 12px; justify-content: flex-end; }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px; }
        .form-control { width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13.5px; transition: 0.2s; outline: none; }
        .form-control:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .form-control.is-invalid { border-color: #ef4444; }
        .form-control.is-invalid:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }
        .invalid-feedback { color: #ef4444; font-size: 12px; margin-top: 4px; display: flex; align-items: center; gap: 4px; }
        .btn { padding: 10px 20px; border-radius: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: 0.2s; border: none; display: inline-flex; align-items: center; gap: 6px; }
        .btn-secondary { background: #f1f5f9; color: #475569; }
        .btn-secondary:hover { background: #e2e8f0; }
        .btn-primary { background: #6366f1; color: #fff; }
        .btn-primary:hover { background: #4f46e5; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) { .acc-stats { grid-template-columns: repeat(2,1fr); } .acc-toolbar { flex-direction: column; align-items: stretch; } .acc-search { max-width: 100%; } }
      `}</style>

      <div className="acc-root">
        {/* Header */}
        <div className="acc-header">
          <h1><Users size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />Quản lý Tài khoản</h1>
          <p>Quản lý và theo dõi người dùng trong hệ thống</p>
        </div>

        {/* Stats */}
        <div className="acc-stats">
          <div className="acc-stat-card color-blue">
            <div className="stat-icon"><Users size={18} /></div>
            <div className="stat-val">{stats.total}</div>
            <div className="stat-label">Tổng tài khoản</div>
          </div>
          <div className="acc-stat-card color-green">
            <div className="stat-icon"><UserCheck size={18} /></div>
            <div className="stat-val">{stats.active}</div>
            <div className="stat-label">Đang hoạt động</div>
          </div>
          <div className="acc-stat-card color-red">
            <div className="stat-icon"><UserX size={18} /></div>
            <div className="stat-val">{stats.locked}</div>
            <div className="stat-label">Đã khóa</div>
          </div>
          <div className="acc-stat-card color-purple">
            <div className="stat-icon"><Shield size={18} /></div>
            <div className="stat-val">{stats.highCredit}</div>
            <div className="stat-label">Uy tín cao</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="acc-toolbar">
          <div className="acc-search">
            <Search className="search-ic" size={17} />
            <input
              type="text"
              placeholder="Tìm kiếm tên, email, username..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="acc-status-pills">
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                className={`acc-status-pill${selectedStatus === opt.value ? ' active' : ''}`}
                onClick={() => setSelectedStatus(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button className="acc-create-btn" onClick={() => setShowCreateForm(true)}>
            <Plus size={16} /> Thêm tài khoản
          </button>
        </div>

        {/* Table */}
        <div className="acc-table-wrap">
          <table className="acc-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Vai trò</th>
                <th style={{ textAlign: 'center' }}>Uy tín</th>
                <th style={{ textAlign: 'center' }}>Trạng thái</th>
                <th style={{ textAlign: 'center', width: 120 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="acc-empty">
                    <UserX size={40} /><br />
                    Không tìm thấy tài khoản nào
                  </td>
                </tr>
              ) : filteredAccounts.map(acc => {
                const creditBadge = getCreditScoreBadge(acc.creditScore);
                return (
                  <tr key={acc.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{acc.fullName}</div>
                      {acc.department && (
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{acc.department}</div>
                      )}
                    </td>
                    <td style={{ fontSize: 12.5, color: '#64748b' }}>
                      <Mail size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      {acc.email}
                    </td>
                    <td style={{ fontSize: 12.5, color: '#64748b' }}>
                      <Phone size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      {acc.phone}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        background: `${getRoleBadgeColor(acc.role)}15`,
                        color: getRoleBadgeColor(acc.role)
                      }}>
                        {acc.role}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        background: creditBadge.bg,
                        color: creditBadge.color
                      }}>
                        {acc.creditScore}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`acc-status-badge ${acc.status === 'active' ? 'acc-status-active' : 'acc-status-locked'}`}>
                        {acc.status === 'active' ? (
                          <><UserCheck size={13} /> Hoạt động</>
                        ) : (
                          <><UserX size={13} /> Đã khóa</>
                        )}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className={`acc-act-btn ${acc.status === 'active' ? 'acc-act-btn-danger' : 'acc-act-btn-success'}`}
                        onClick={() => toggleAccountStatus(acc.id)}
                      >
                        {acc.status === 'active' ? <><Lock size={14} /> Khóa</> : <><Unlock size={14} /> Mở</>}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create Account */}
      {showCreateForm && (
        <div className="modal-backdrop-acc" onClick={handleCloseModal}>
          <div className="modal-dialog-acc" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-acc">
              <h3>Thêm tài khoản mới</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-body-acc">
              <form onSubmit={handleCreateAccount} id="createAccountForm">
                <div className="form-group">
                  <label className="form-label">Họ tên <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.fullName ? 'is-invalid' : ''}`}
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên đầy đủ"
                  />
                  {formErrors.fullName && (
                    <div className="invalid-feedback">
                      <AlertCircle size={12} />
                      {formErrors.fullName}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Username <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.username ? 'is-invalid' : ''}`}
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Chỉ chữ, số và _"
                    />
                    {formErrors.username && (
                      <div className="invalid-feedback">
                        <AlertCircle size={12} />
                        {formErrors.username}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="password"
                      className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Ít nhất 6 ký tự"
                    />
                    {formErrors.password && (
                      <div className="invalid-feedback">
                        <AlertCircle size={12} />
                        {formErrors.password}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Vai trò <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    className={`form-control ${formErrors.roleId ? 'is-invalid' : ''}`}
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Chọn vai trò --</option>
                    {roles.map(r => (
                      <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
                    ))}
                  </select>
                  {formErrors.roleId && (
                    <div className="invalid-feedback">
                      <AlertCircle size={12} />
                      {formErrors.roleId}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Email <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="email"
                    className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                  />
                  {formErrors.email && (
                    <div className="invalid-feedback">
                      <AlertCircle size={12} />
                      {formErrors.email}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Số điện thoại <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="tel"
                    className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Nhập 10 chữ số"
                  />
                  {formErrors.phone && (
                    <div className="invalid-feedback">
                      <AlertCircle size={12} />
                      {formErrors.phone}
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="modal-footer-acc">
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="createAccountForm"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Tạo tài khoản
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}