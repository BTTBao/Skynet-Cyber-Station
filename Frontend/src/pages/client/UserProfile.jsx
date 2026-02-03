import React, { useState, useEffect } from 'react';
import './UserProfile.css';

// --- Cấu hình API URL ---
const API_BASE_URL = "https://localhost:7140/api"; // Sửa lại port theo backend của bạn

// --- Icon SVG (Giữ nguyên) ---
const Icons = {
  User: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  Mail: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
  Phone: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>,
  Building: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5M12 6.75h1.5M15 6.75h1.5M9 10.5h1.5M12 10.5h1.5M15 10.5h1.5M9 14.25h1.5M12 14.25h1.5M15 14.25h1.5M9 18h1.5M12 18h1.5M15 18h1.5" /></svg>,
  Calendar: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
  Invoice: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 2.072c.675-.25 1.25.07 1.5.317" /></svg>,
  Report: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
  Save: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

const UserProfile = ({ userId }) => { // <--- 1. Nhận props là userId
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // --- 1. Fetch Data từ API ---
  useEffect(() => {
    // Kiểm tra nếu chưa có userId thì không chạy
    if (!userId) return; 

    // 2. SỬA LỖI Ở ĐÂY: Thay currentUserId thành userId
    fetch(`${API_BASE_URL}/Users/${userId}`) 
      .then(response => {
        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu người dùng.');
        }
        return response.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  // --- 2. Xử lý Update Data ---
  const handleSave = async (e) => {
    e.preventDefault(); // Ngăn reload trang
    
    // DTO để gửi lên server (UpdateUserProfileDto)
    const updateData = {
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber
    };

    try {
      const response = await fetch(`${API_BASE_URL}/Users/${user.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        alert("✅ Cập nhật thông tin thành công!");
      } else {
        const errData = await response.json();
        alert(`❌ Lỗi: ${errData.message || "Có lỗi xảy ra"}`);
      }
    } catch (error) {
      alert("❌ Lỗi kết nối đến server.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const renderStatusBadge = (status) => {
    let className = 'badge ';
    const s = status?.toLowerCase() || '';
    
    if (['approved', 'paid', 'resolved', 'active'].includes(s)) className += 'status-success';
    else if (['pending', 'unpaid', 'not yet paid'].includes(s)) className += 'status-pending';
    else if (['rejected', 'cancelled'].includes(s)) className += 'status-rejected';
    else className += 'status-processing';
    
    return <span className={className}>{status}</span>;
  };

  // --- Loading & Error States ---
  if (loading) return <div className="profile-wrapper"><h3>Đang tải dữ liệu...</h3></div>;
  if (error) return <div className="profile-wrapper"><h3 style={{color: 'red'}}>Lỗi: {error}</h3></div>;
  if (!user) return null;

  // Tính toán thống kê
  const totalSpent = user.invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, item) => sum + item.totalAmount, 0); // Model C# là TotalAmount

  const pendingInvoices = user.invoices.filter(i => i.status !== 'Paid').length;

  // --- Render Nội dung bên phải ---
  const renderTabContent = () => {
    switch (activeTab) {
      case 'bookings':
        return (
          <>
            <div className="card-header">
              <h3 className="header-title">{Icons.Calendar} Lịch sử đặt phòng</h3>
            </div>
            <div className="card-body">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Phòng</th>
                    <th>Ngày đặt</th>
                    <th>Thời gian</th>
                    <th>Mục đích</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {/* API trả về roomBookings (chữ thường đầu) */}
                  {user.roomBookings.length === 0 ? (
                    <tr><td colSpan="5" style={{textAlign:'center'}}>Chưa có dữ liệu</td></tr>
                  ) : (
                    user.roomBookings.map(bk => (
                      <tr key={bk.bookingId}>
                        <td style={{fontWeight: 'bold', color: 'var(--primary)'}}>
                          {bk.roomName}
                        </td>
                        <td>{bk.date}</td> {/* String dd/MM/yyyy từ API */}
                        <td>{bk.timeRange}</td> {/* String HH:mm - HH:mm từ API */}
                        <td>{bk.purpose || '-'}</td>
                        <td>{renderStatusBadge(bk.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        );

      case 'invoices':
        return (
          <>
            <div className="card-header">
              <h3 className="header-title">{Icons.Invoice} Hóa đơn & Thanh toán</h3>
              <div style={{textAlign: 'right'}}>
                <span style={{fontSize: '0.9rem', color: '#666'}}>Đã thanh toán: </span>
                <span style={{fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem'}}>
                  {totalSpent.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
            <div className="card-body">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã HĐ</th>
                    <th>Mã BK</th>
                    <th>Ngày thanh toán</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                   {user.invoices.length === 0 ? (
                    <tr><td colSpan="5" style={{textAlign:'center'}}>Chưa có dữ liệu</td></tr>
                  ) : (
                    user.invoices.map(inv => (
                      <tr key={inv.invoiceId}>
                        <td>#{inv.invoiceId}</td>
                        <td>BK-{inv.bookingRefId}</td>
                        <td>{inv.paymentDate || '-'}</td>
                        <td style={{fontWeight: 'bold'}}>{inv.totalAmount.toLocaleString('vi-VN')} đ</td>
                        <td>{renderStatusBadge(inv.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        );

      case 'reports':
        return (
          <>
             <div className="card-header">
              <h3 className="header-title">{Icons.Report} Báo cáo sự cố</h3>
            </div>
            <div className="card-body">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tiêu đề</th>
                    <th>Mô tả chi tiết</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {user.incidentReports.length === 0 ? (
                    <tr><td colSpan="4" style={{textAlign:'center'}}>Chưa có dữ liệu</td></tr>
                  ) : (
                    user.incidentReports.map(rp => (
                      <tr key={rp.reportId}>
                        <td>#{rp.reportId}</td>
                        <td style={{fontWeight:'600'}}>{rp.title}</td>
                        <td style={{maxWidth: '200px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                          {rp.description}
                        </td>
                        <td>{renderStatusBadge(rp.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        );

      case 'info':
      default:
        return (
          <>
            <div className="card-header">
              <h3 className="header-title">{Icons.User} Thông tin tài khoản</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSave}>
                <div className="form-grid">
                  {/* Readonly */}
                  <div className="form-group">
                    <label className="label">Tên đăng nhập</label>
                    <div className="input-wrapper">
                      <span className="input-icon">{Icons.User}</span>
                      <input type="text" className="input-field" value={user.username} disabled />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Vai trò</label>
                    <div className="input-wrapper">
                      <span className="input-icon">{Icons.Building}</span>
                      <input type="text" className="input-field" value={user.roleName} disabled />
                    </div>
                  </div>

                  {/* Editable */}
                  <div className="form-group full-width">
                    <label className="label">Họ và tên</label>
                    <div className="input-wrapper">
                      <span className="input-icon">{Icons.User}</span>
                      <input 
                        type="text" name="fullName" className="input-field" 
                        value={user.fullName} onChange={handleChange} 
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Email</label>
                    <div className="input-wrapper">
                      <span className="input-icon">{Icons.Mail}</span>
                      <input 
                        type="email" name="email" className="input-field" 
                        value={user.email} onChange={handleChange} 
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Số điện thoại</label>
                    <div className="input-wrapper">
                      <span className="input-icon">{Icons.Phone}</span>
                      <input 
                        type="text" name="phoneNumber" className="input-field" 
                        value={user.phoneNumber || ''} onChange={handleChange} 
                      />
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label className="label">Đơn vị (Department)</label>
                    <div className="input-wrapper">
                      <span className="input-icon">{Icons.Building}</span>
                      <input type="text" className="input-field" value={user.department || ''} disabled />
                    </div>
                  </div>
                </div>
                
                <button type="submit" className="btn-save">
                  {Icons.Save} Lưu thay đổi
                </button>
              </form>
            </div>
          </>
        );
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-container">

        {/* --- LEFT SIDEBAR --- */}
        <div className="profile-sidebar">
          <div className="card sidebar-card">
            <div className="banner"></div>
            <div className="avatar-wrapper">
              <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Avatar" className="avatar-img" />
            </div>
            <div className="user-info-text">
              <h2 className="user-name">{user.fullName}</h2>
              <p className="user-role">{user.roleName}</p>
              <span className={`badge ${user.status === 'Active' ? 'status-active' : 'status-rejected'}`}>
                {user.status}
              </span>
            </div>

            <div className="menu-nav">
              <div className={`menu-item ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
                {Icons.User} Thông tin chung
              </div>
              <div className={`menu-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                {Icons.Calendar} Lịch sử đặt phòng
              </div>
              <div className={`menu-item ${activeTab === 'invoices' ? 'active' : ''}`} onClick={() => setActiveTab('invoices')}>
                {Icons.Invoice} Hóa đơn
              </div>
              <div className={`menu-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                {Icons.Report} Báo cáo sự cố
              </div>
            </div>
          </div>

            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-num">{user.roomBookings.length}</span>
                <span className="stat-label">Lượt đặt</span>
              </div>
               <div className="stat-box">
                <span className="stat-num" style={{color: pendingInvoices > 0 ? '#d97706' : '#10b981'}}>
                  {pendingInvoices}
                </span>
                <span className="stat-label">Chưa TT</span>
              </div>
            </div>
        </div>

        {/* --- RIGHT CONTENT --- */}
        <div className="card content-card">
          {renderTabContent()}
        </div>

      </div>
    </div>
  );
};

export default UserProfile;