import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  Search, 
  Plus, 
  Eye, 
  Lock,
  Unlock,
  X,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Shield
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5270/api';

export default function AccountManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    roleId: '', 
    email: '',
    phone: '',
    department: ''
  });

  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    locked: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAccounts();
    fetchStatistics();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles`);
      const result = await response.json();
      
      if (result.success) {
        setRoles(result.data);
        if (result.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            roleId: result.data[0].roleId
          }));
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
      setFormData(prev => ({ ...prev, roleId: fallbackRoles[3].roleId }));
    }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const result = await response.json();
      if (result.success) {
        setAccounts(result.data);
        setError(null);
      } else {
        setError('Không thể tải danh sách tài khoản');
      }
    } catch (err) {
      setError('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/statistics`);
      const result = await response.json();
      if (result.success) {
        setStatistics(result.data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      fetchAccounts();
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/users/search?searchTerm=${encodeURIComponent(term)}`);
      const result = await response.json();
      if (result.success) setAccounts(result.data);
    } catch (err) {
      console.error('Error searching:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ FIX CHÍNH: Map formData → payload khớp với CreateUserDto của Backend
  // CreateUserDto expect: { FullName, Username, Password, Role (int), Email, Phone, Department }
  // formData có: { fullName, username, password, roleId, email, phone, department }
  // Chỉ cần đổi roleId → role khi build payload
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      fullName: formData.fullName,
      username: formData.username,
      password: formData.password,
      role: parseInt(formData.roleId),       // ← đổi key "roleId" → "role" để khớp CreateUserDto
      email: formData.email,
      phone: formData.phone,
      department: formData.department || ''  // ← gửi department (optional nhưng nên có)
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
        await fetchStatistics();
        // Reset form về trạng thái ban đầu
        setFormData({
          fullName: '',
          username: '',
          password: '',
          roleId: roles.length > 0 ? roles[0].roleId : '',
          email: '',
          phone: '',
          department: ''
        });
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
        await fetchStatistics();
      }
    } catch (err) {
      alert('Lỗi kết nối đến server');
    }
  };

  const getCreditScoreBadge = (score) => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  const getRoleBadge = (roleName) => {
    const badges = {
      'Admin': 'danger',
      'Quản lý': 'primary',
      'Giảng viên': 'info',
      'Sinh viên': 'secondary'
    };
    return badges[roleName] || 'secondary';
  };

  return (
    <>
      <style>{`
        .account-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white; padding: 2rem; margin-bottom: 1.5rem; }
        .search-box { position: relative; }
        .search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #64748b; }
        .search-input { padding-left: 45px; border-radius: 10px; border: 2px solid #e2e8f0; transition: all 0.3s; }
        .search-input:focus { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); outline: none; }
        .create-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 10px; padding: 0.6rem 1.5rem; color: white; font-weight: 600; transition: transform 0.2s; cursor: pointer; }
        .create-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3); }
        .create-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
        .table-container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1050; animation: fadeIn 0.2s; }
        .modal-content-custom { background: white; border-radius: 16px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .form-label-custom { font-weight: 600; color: #1e293b; margin-bottom: 0.5rem; display: block; }
        .form-control-custom { border-radius: 8px; border: 2px solid #e2e8f0; padding: 0.65rem 1rem; transition: all 0.3s; width: 100%; }
        .form-control-custom:focus { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); outline: none; }
        .status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 8px; }
        .status-active { background-color: #22c55e; }
        .status-locked { background-color: #ef4444; }
        .loading-spinner { display: inline-block; width: 20px; height: 20px; border: 3px solid #f3f3f3; border-top: 3px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      <div className="container-fluid p-4">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}

        {/* Thống kê nhanh */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h3 className="fw-bold text-primary mb-1">{statistics.total}</h3>
                <p className="text-secondary small mb-0">Tổng tài khoản</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h3 className="fw-bold text-success mb-1">{statistics.active}</h3>
                <p className="text-secondary small mb-0">Hoạt động</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h3 className="fw-bold text-danger mb-1">{statistics.locked}</h3>
                <p className="text-secondary small mb-0">Bị khóa</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h3 className="fw-bold text-warning mb-1">{accounts.length}</h3>
                <p className="text-secondary small mb-0">Đang hiển thị</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tìm kiếm và Nút tạo */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-8">
            <div className="search-box">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                className="form-control search-input"
                placeholder="Tìm kiếm theo tên, email, vai trò..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-4">
            <button className="create-btn w-100" onClick={() => setShowCreateForm(true)}>
              <Plus size={20} className="me-2" /> Tạo tài khoản mới
            </button>
          </div>
        </div>

        {/* Bảng danh sách */}
        <div className="table-container">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">Họ tên</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">SĐT</th>
                  <th className="px-4 py-3 text-center">Uy tín</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="loading-spinner"></div>
                    </td>
                  </tr>
                ) : accounts.length > 0 ? (
                  accounts.map((acc) => (
                    <tr key={acc.id}>
                      <td className="px-4 py-3 fw-semibold">{acc.fullName}</td>
                      <td className="px-4 py-3">
                        <span className={`badge bg-${getRoleBadge(acc.role)}`}>{acc.role}</span>
                      </td>
                      <td className="px-4 py-3 text-secondary">
                        <Mail size={14} className="me-1"/> {acc.email}
                      </td>
                      <td className="px-4 py-3 text-secondary">
                        <Phone size={14} className="me-1"/> {acc.phone}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`badge bg-${getCreditScoreBadge(acc.creditScore)}`}>
                          {acc.creditScore}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`status-dot status-${acc.status}`}></span>
                        <span className={acc.status === 'active' ? 'text-success' : 'text-danger'}>
                          {acc.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          <button className="btn btn-sm btn-light"><Eye size={16}/></button>
                          <button 
                            className={`btn btn-sm ${acc.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                            onClick={() => toggleAccountStatus(acc.id)}
                          >
                            {acc.status === 'active' ? <Lock size={16}/> : <Unlock size={16}/>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-secondary">
                      <UserX size={40} className="mb-2 opacity-50"/><br/>Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
              <h4 className="fw-bold mb-0">Thêm tài khoản</h4>
              <button className="btn-close" onClick={() => setShowCreateForm(false)}></button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-4">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label-custom">Họ tên *</label>
                  <input
                    type="text"
                    className="form-control form-control-custom"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Nhập họ tên"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Username *</label>
                  <input
                    type="text"
                    className="form-control form-control-custom"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Nhập username"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Password *</label>
                  <input
                    type="password"
                    className="form-control form-control-custom"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Ít nhất 6 ký tự"
                    minLength={6}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label-custom">Vai trò *</label>
                  <select
                    className="form-select form-control-custom"
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    required
                  >
                    {roles.map(r => (
                      <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label-custom">Email *</label>
                  <input
                    type="email"
                    className="form-control form-control-custom"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label-custom">Số điện thoại *</label>
                  <input
                    type="tel"
                    className="form-control form-control-custom"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10 chữ số"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
              </div>
              <div className="d-flex gap-3 mt-4">
                <button type="button" className="btn btn-light flex-fill" onClick={() => setShowCreateForm(false)}>Hủy</button>
                <button type="submit" className="create-btn flex-fill" disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}