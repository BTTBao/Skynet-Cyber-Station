import React, { useState } from 'react';
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

export default function AccountManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    role: 'student',
    email: '',
    phone: ''
  });

  // Dữ liệu mẫu tài khoản
  const [accounts, setAccounts] = useState([
    { 
      id: 1, 
      fullName: 'Nguyễn Văn An', 
      role: 'Admin', 
      email: 'nguyenvanan@utt.edu.vn', 
      phone: '0901234567',
      creditScore: 95,
      status: 'active'
    },
    { 
      id: 2, 
      fullName: 'Trần Thị Bình', 
      role: 'Sinh viên', 
      email: 'tranthibinh@student.utt.edu.vn', 
      phone: '0912345678',
      creditScore: 88,
      status: 'active'
    },
    { 
      id: 3, 
      fullName: 'Lê Hoàng Cường', 
      role: 'Giảng viên', 
      email: 'lehoangcuong@utt.edu.vn', 
      phone: '0923456789',
      creditScore: 92,
      status: 'active'
    },
    { 
      id: 4, 
      fullName: 'Phạm Minh Đức', 
      role: 'Sinh viên', 
      email: 'phamminhduc@student.utt.edu.vn', 
      phone: '0934567890',
      creditScore: 45,
      status: 'locked'
    },
    { 
      id: 5, 
      fullName: 'Võ Thị Em', 
      role: 'Sinh viên', 
      email: 'vothiem@student.utt.edu.vn', 
      phone: '0945678901',
      creditScore: 78,
      status: 'active'
    },
    { 
      id: 6, 
      fullName: 'Hoàng Văn Phong', 
      role: 'Quản lý', 
      email: 'hoangvanphong@utt.edu.vn', 
      phone: '0956789012',
      creditScore: 98,
      status: 'active'
    },
    { 
      id: 7, 
      fullName: 'Đặng Thị Giang', 
      role: 'Sinh viên', 
      email: 'dangthigiang@student.utt.edu.vn', 
      phone: '0967890123',
      creditScore: 65,
      status: 'active'
    },
    { 
      id: 8, 
      fullName: 'Bùi Minh Hải', 
      role: 'Sinh viên', 
      email: 'buiminhhai@student.utt.edu.vn', 
      phone: '0978901234',
      creditScore: 30,
      status: 'locked'
    }
  ]);

  // Lọc tài khoản theo từ khóa tìm kiếm
  const filteredAccounts = accounts.filter(account => 
    account.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.phone.includes(searchTerm) ||
    account.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Xử lý thay đổi input form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý tạo tài khoản mới
  const handleCreateAccount = (e) => {
    e.preventDefault();
    
    const newAccount = {
      id: accounts.length + 1,
      fullName: formData.fullName,
      role: getRoleLabel(formData.role),
      email: formData.email,
      phone: formData.phone,
      creditScore: 100,
      status: 'active'
    };

    setAccounts([...accounts, newAccount]);
    
    // Reset form
    setFormData({
      fullName: '',
      username: '',
      password: '',
      role: 'student',
      email: '',
      phone: ''
    });
    
    setShowCreateForm(false);
  };

  // Chuyển đổi role code sang label
  const getRoleLabel = (roleCode) => {
    const roles = {
      'admin': 'Admin',
      'manager': 'Quản lý',
      'teacher': 'Giảng viên',
      'student': 'Sinh viên'
    };
    return roles[roleCode] || 'Sinh viên';
  };

  // Xử lý khóa/mở khóa tài khoản
  const toggleAccountStatus = (id) => {
    setAccounts(accounts.map(account => 
      account.id === id 
        ? { ...account, status: account.status === 'active' ? 'locked' : 'active' }
        : account
    ));
  };

  // Get badge color cho credit score
  const getCreditScoreBadge = (score) => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  // Get role badge color
  const getRoleBadge = (role) => {
    const badges = {
      'Admin': 'danger',
      'Quản lý': 'primary',
      'Giảng viên': 'info',
      'Sinh viên': 'secondary'
    };
    return badges[role] || 'secondary';
  };

  return (
    <>
      <style>{`
        .account-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
          padding: 2rem;
          margin-bottom: 1.5rem;
        }
        .search-box {
          position: relative;
        }
        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }
        .search-input {
          padding-left: 45px;
          border-radius: 10px;
          border: 2px solid #e2e8f0;
          transition: all 0.3s;
        }
        .search-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .create-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 10px;
          padding: 0.6rem 1.5rem;
          color: white;
          font-weight: 600;
          transition: transform 0.2s;
        }
        .create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        .table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          animation: fadeIn 0.2s;
        }
        .modal-content-custom {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .form-label-custom {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }
        .form-control-custom {
          border-radius: 8px;
          border: 2px solid #e2e8f0;
          padding: 0.65rem 1rem;
          transition: all 0.3s;
        }
        .form-control-custom:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 8px;
        }
        .status-active {
          background-color: #22c55e;
        }
        .status-locked {
          background-color: #ef4444;
        }
      `}</style>

      <div className="container-fluid p-4">
        
        {/* Thống kê nhanh */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h3 className="fw-bold text-primary mb-1">{accounts.length}</h3>
                <p className="text-secondary small mb-0">Tổng tài khoản</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h3 className="fw-bold text-success mb-1">
                  {accounts.filter(a => a.status === 'active').length}
                </h3>
                <p className="text-secondary small mb-0">Đang hoạt động</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h3 className="fw-bold text-danger mb-1">
                  {accounts.filter(a => a.status === 'locked').length}
                </h3>
                <p className="text-secondary small mb-0">Bị khóa</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h3 className="fw-bold text-warning mb-1">
                  {filteredAccounts.length}
                </h3>
                <p className="text-secondary small mb-0">Kết quả tìm kiếm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Thanh tìm kiếm và nút tạo */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-8">
            <div className="search-box">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                className="form-control search-input"
                placeholder="Tìm kiếm theo tên, email, số điện thoại, vai trò..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-4">
            <button 
              className="create-btn w-100"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus size={20} className="me-2" />
              Tạo tài khoản mới
            </button>
          </div>
        </div>

        {/* Bảng danh sách tài khoản */}
        <div className="table-container">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 text-secondary fw-semibold">Họ tên</th>
                  <th className="px-4 py-3 text-secondary fw-semibold">Vai trò</th>
                  <th className="px-4 py-3 text-secondary fw-semibold">Email</th>
                  <th className="px-4 py-3 text-secondary fw-semibold">Số điện thoại</th>
                  <th className="px-4 py-3 text-secondary fw-semibold text-center">Điểm uy tín</th>
                  <th className="px-4 py-3 text-secondary fw-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-secondary fw-semibold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => (
                    <tr key={account.id}>
                      <td className="px-4 py-3">
                        <div className="fw-semibold text-dark">{account.fullName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge bg-${getRoleBadge(account.role)}`}>
                          {account.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center text-secondary">
                          <Mail size={16} className="me-2" />
                          {account.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center text-secondary">
                          <Phone size={16} className="me-2" />
                          {account.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`badge bg-${getCreditScoreBadge(account.creditScore)} fs-6 px-3 py-2`}>
                          {account.creditScore}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center">
                          <span className={`status-${account.status}`}></span>
                          <span className={account.status === 'active' ? 'text-success' : 'text-danger'}>
                            {account.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="d-flex gap-2 justify-content-center">
                            <button 
                                title="Xem chi tiết"
                                style={{padding: "5px 10px"}}
                            >
                                <Eye size={18}/>
                            </button>
                            <button 
                                onClick={() => toggleAccountStatus(account.id)}
                                style={{padding: "5px 10px"}}
                                title={account.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            >
                                {account.status === 'active' ? <Lock size={18} /> : <Unlock size={18} />}
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="text-secondary">
                        <UserX size={48} className="mb-3 opacity-50" />
                        <p className="mb-0">Không tìm thấy tài khoản nào</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form tạo tài khoản */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-bottom">
              <div className="d-flex align-items-center justify-content-between">
                <h4 className="fw-bold mb-0">Tạo tài khoản mới</h4>
                <button 
                  className="btn btn-light rounded-circle p-2"
                  onClick={() => setShowCreateForm(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateAccount} className="p-4">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label-custom">
                    Họ tên <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-custom"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Nhập họ tên đầy đủ"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label-custom">
                    Username <span className="text-danger">*</span>
                  </label>
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
                  <label className="form-label-custom">
                    Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-custom"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label-custom">
                    Vai trò <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-control-custom"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="student">Sinh viên</option>
                    <option value="teacher">Giảng viên</option>
                    <option value="manager">Quản lý</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label-custom">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-custom"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@utt.edu.vn"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label-custom">
                    Số điện thoại <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control form-control-custom"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0123456789"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
              </div>

              <div className="d-flex gap-3 mt-4">
                <button 
                  type="button" 
                  className="btn btn-light flex-fill py-2 rounded-3"
                  onClick={() => setShowCreateForm(false)}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn create-btn flex-fill py-2"
                >
                  <UserCheck size={18} className="me-2" />
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}