import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, FileText, CheckCircle2, Clock, DollarSign, Users, Check, X, AlertCircle } from 'lucide-react';
import InvoiceDetail from './InvoiceDetail';

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [invoiceToConfirm, setInvoiceToConfirm] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('https://localhost:7140/api/Invoicess', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      if (!res.ok) {
        if (res.status === 401) console.error("Token hết hạn hoặc không hợp lệ");
        if (res.status === 403) console.error("Bạn không có quyền truy cập hóa đơn");
        throw new Error(`Lỗi server: ${res.status}`);
      }
      const result = await res.json();
      setInvoices(result.data || []);
    } catch (err) { 
      console.error('Lỗi fetch hóa đơn:', err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleOpenConfirmModal = (invoice) => {
    setInvoiceToConfirm(invoice);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setInvoiceToConfirm(null);
  };

  const handleConfirmPayment = async () => {
    if (!invoiceToConfirm) return;

    setIsConfirming(true);
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`https://localhost:7140/api/Invoicess/${invoiceToConfirm.invoiceID}/confirm-payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json','Authorization': `Bearer ${token}` }
      });
      console.log(invoiceToConfirm.invoiceID);

      const result = await res.json();

      if (result.success) {
        await fetchInvoices();
        setShowConfirmModal(false);
        setInvoiceToConfirm(null);
      } else {
        alert(result.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error('Lỗi xác nhận thanh toán:', err);
      alert('Lỗi kết nối đến server');
    } finally {
      setIsConfirming(false);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'paid', label: 'Đã thanh toán' },
    { value: 'not yet paid', label: 'Chưa thanh toán' }
  ];

  const filteredInvoices = invoices.filter(inv => {
    const matchSearch = 
      String(inv.invoiceID).includes(searchTerm) ||
      inv.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === 'all' || inv.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter(inv => inv.status === 'Đã thanh toán').length,
    unpaid: invoices.filter(inv => inv.status === 'Chưa thanh toán').length,
    totalAmount: invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
  };

  if (loading) {
    return <div className="p-4 text-center">Đang tải dữ liệu hóa đơn...</div>;
  }

  if (selectedInvoice) {
    return (
      <InvoiceDetail
        invoice={selectedInvoice}
        onBack={() => setSelectedInvoice(null)}
        onUpdate={(updated) => {
          setInvoices(invoices.map(inv => inv.invoiceID === updated.invoiceID ? updated : inv));
          setSelectedInvoice(updated);
        }}
      />
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .inv-root { min-height: 100vh; background: #f0f4f8; padding: 28px; }
        .inv-header { background: #1e293b; border-radius: 16px; padding: 28px 32px; margin-bottom: 24px; position: relative; overflow: hidden; }
        .inv-header::before { content: ''; position: absolute; top: -40px; right: -40px; width: 180px; height: 180px; background: rgba(99,102,241,0.12); border-radius: 50%; }
        .inv-header::after { content: ''; position: absolute; bottom: -30px; left: 30%; width: 120px; height: 120px; background: rgba(16,185,129,0.08); border-radius: 50%; }
        .inv-header h1 { color: #f1f5f9; font-size: 22px; font-weight: 700; margin: 0 0 4px; position: relative; z-index: 1; }
        .inv-header p { color: #94a3b8; font-size: 14px; margin: 0; position: relative; z-index: 1; }
        .inv-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 22px; }
        .inv-stat-card { background: #fff; border-radius: 12px; padding: 18px 20px; border: 1px solid #e2e8f0; }
        .inv-stat-card .stat-val { font-size: 26px; font-weight: 700; line-height: 1; margin-bottom: 4px; }
        .inv-stat-card .stat-label { font-size: 12.5px; color: #64748b; font-weight: 500; }
        .inv-stat-card .stat-icon { float: right; width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .color-blue .stat-val { color: #3b82f6; } .color-blue .stat-icon { background: #eff6ff; color: #3b82f6; }
        .color-green .stat-val { color: #10b981; } .color-green .stat-icon { background: #ecfdf5; color: #10b981; }
        .color-amber .stat-val { color: #f59e0b; } .color-amber .stat-icon { background: #fffbeb; color: #f59e0b; }
        .color-purple .stat-val { color: #8b5cf6; } .color-purple .stat-icon { background: #f5f3ff; color: #8b5cf6; }
        .inv-toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 18px; flex-wrap: wrap; }
        .inv-search { position: relative; flex: 1; min-width: 240px; max-width: 420px; }
        .inv-search input { width: 100%; padding: 10px 16px 10px 42px; border-radius: 10px; border: 1.5px solid #e2e8f0; font-size: 13.5px; background: #fff; transition: 0.2s; outline: none; }
        .inv-search input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .inv-search .search-ic { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .inv-status-pills { display: flex; gap: 6px; }
        .inv-status-pill { padding: 8px 14px; border-radius: 20px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: 0.2s; }
        .inv-status-pill:hover { border-color: #c7d2fe; background: #f5f3ff; }
        .inv-status-pill.active { background: #6366f1; color: #fff; border-color: #6366f1; }
        .inv-table-wrap { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; }
        .inv-table { width: 100%; border-collapse: collapse; }
        .inv-table thead { background: #f8fafc; }
        .inv-table th { padding: 12px 18px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
        .inv-table td { padding: 14px 18px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; color: #334155; }
        .inv-table tr:last-child td { border-bottom: none; }
        .inv-table tr:hover td { background: #fafbfd; }
        .inv-code { font-family: 'JetBrains Mono', monospace; font-size: 12.5px; color: #6366f1; font-weight: 600; background: #eef2ff; padding: 3px 8px; border-radius: 5px; }
        .inv-status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; font-size: 12.5px; font-weight: 600; }
        .inv-status-paid { background: #ecfdf5; color: #059669; }
        .inv-status-unpaid { background: #fffbeb; color: #d97706; }
        .inv-empty { padding: 60px 20px; text-align: center; color: #94a3b8; }
        .inv-empty svg { margin-bottom: 12px; opacity: 0.5; }
        .inv-act-btn { background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 6px; border-radius: 8px; cursor: pointer; transition: 0.2s; color: #475569; font-size: 13px; font-weight: 500; display: inline-flex; align-items: center; gap: 4px; }
        .inv-act-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
        .inv-act-btn-success { background: #dcfce7; border: 1px solid #bbf7d0; color: #16a34a; }
        .inv-act-btn-success:hover { background: #86efac; border-color: #4ade80; }

        /* Modal Styles */
        .modal-backdrop-confirm { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s; }
        .modal-dialog-confirm { background: #fff; border-radius: 16px; width: 90%; max-width: 480px; overflow: hidden; animation: slideUp 0.3s; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .modal-header-confirm { padding: 24px 24px 16px; border-bottom: 1px solid #e2e8f0; }
        .modal-header-icon { width: 48px; height: 48px; border-radius: 12px; background: #dcfce7; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .modal-header-icon svg { color: #16a34a; }
        .modal-title-confirm { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 6px; }
        .modal-subtitle-confirm { font-size: 14px; color: #64748b; margin: 0; }
        
        .modal-body-confirm { padding: 24px; }
        .invoice-info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
        .invoice-info-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .invoice-info-row:last-child { margin-bottom: 0; }
        .invoice-info-label { font-size: 13px; color: #64748b; font-weight: 500; }
        .invoice-info-value { font-size: 14px; color: #1e293b; font-weight: 600; }
        .invoice-info-value.highlight { color: #16a34a; font-size: 18px; }
        
        .warning-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px 14px; display: flex; gap: 10px; }
        .warning-box svg { color: #f59e0b; flex-shrink: 0; margin-top: 2px; }
        .warning-text { font-size: 13px; color: #92400e; line-height: 1.5; }
        
        .modal-footer-confirm { padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; gap: 12px; justify-content: flex-end; }
        .btn-confirm { padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.2s; border: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-cancel { background: #f1f5f9; color: #475569; }
        .btn-cancel:hover { background: #e2e8f0; }
        .btn-primary-confirm { background: #16a34a; color: #fff; }
        .btn-primary-confirm:hover { background: #15803d; }
        .btn-primary-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
        .spinner-confirm { display: inline-block; width: 14px; height: 14px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        @media (max-width: 640px) { .inv-stats { grid-template-columns: repeat(2,1fr); } .inv-toolbar { flex-direction: column; align-items: stretch; } .inv-search { max-width: 100%; } }
      `}</style>

      <div className="inv-root">
        {/* Header */}
        <div className="inv-header">
          <h1><FileText size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />Quản lý Hóa đơn</h1>
          <p>Theo dõi và quản lý toàn bộ hóa đơn thanh toán</p>
        </div>

        {/* Stats */}
        <div className="inv-stats">
          <div className="inv-stat-card color-blue">
            <div className="stat-icon"><FileText size={18} /></div>
            <div className="stat-val">{stats.total}</div>
            <div className="stat-label">Tổng hóa đơn</div>
          </div>
          <div className="inv-stat-card color-green">
            <div className="stat-icon"><CheckCircle2 size={18} /></div>
            <div className="stat-val">{stats.paid}</div>
            <div className="stat-label">Đã thanh toán</div>
          </div>
          <div className="inv-stat-card color-amber">
            <div className="stat-icon"><Clock size={18} /></div>
            <div className="stat-val">{stats.unpaid}</div>
            <div className="stat-label">Chưa thanh toán</div>
          </div>
          <div className="inv-stat-card color-purple">
            <div className="stat-icon"><DollarSign size={18} /></div>
            <div className="stat-val">{new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(stats.totalAmount)}</div>
            <div className="stat-label">Tổng doanh thu</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="inv-toolbar">
          <div className="inv-search">
            <Search className="search-ic" size={17} />
            <input 
              type="text" 
              placeholder="Tìm kiếm mã hóa đơn, khách hàng..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="inv-status-pills">
            {statusOptions.map(opt => (
              <button 
                key={opt.value} 
                className={`inv-status-pill${selectedStatus === opt.value ? ' active' : ''}`} 
                onClick={() => setSelectedStatus(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Mã HĐ</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Tiền cọc</th>
                <th>Ngày thanh toán</th>
                <th style={{ textAlign: 'center' }}>Trạng thái</th>
                <th style={{ textAlign: 'center', width: 180 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="inv-empty">
                    <FileText size={40} /><br />
                    Không tìm thấy hóa đơn nào
                  </td>
                </tr>
              ) : filteredInvoices.map(inv => (
                <tr key={inv.invoiceID}>
                  <td><span className="inv-code">INV-{String(inv.invoiceID).padStart(5, '0')}</span></td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{inv.user?.fullName || '---'}</div>
                    {inv.user?.email && (
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{inv.user.email}</div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>
                    {new Intl.NumberFormat('vi-VN').format(inv.totalAmount)}đ
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {inv.deposit ? new Intl.NumberFormat('vi-VN').format(inv.deposit) + 'đ' : '---'}
                  </td>
                  <td>
                    {inv.paymentDate ? new Date(inv.paymentDate).toLocaleDateString('vi-VN') : '---'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`inv-status-badge ${inv.status === 'paid' ? 'inv-status-paid' : 'inv-status-unpaid'}`}>
                      {inv.status === 'paid' ? (
                        <><CheckCircle2 size={13} /> Đã thanh toán</>
                      ) : (
                        <><Clock size={13} /> Chưa thanh toán</>
                      )}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button className="inv-act-btn" onClick={() => setSelectedInvoice(inv)}>
                        <Eye size={18} /> 
                      </button>
                      {inv.status !== 'paid' && (
                        <button 
                          className="inv-act-btn inv-act-btn-success" 
                          onClick={() => handleOpenConfirmModal(inv)}
                        >
                          <Check size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && invoiceToConfirm && (
        <div className="modal-backdrop-confirm" onClick={handleCloseConfirmModal}>
          <div className="modal-dialog-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-confirm">
              <div className="modal-header-icon">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="modal-title-confirm">Xác nhận thanh toán</h3>
              <p className="modal-subtitle-confirm">Vui lòng kiểm tra thông tin trước khi xác nhận</p>
            </div>

            <div className="modal-body-confirm">
              <div className="invoice-info-box">
                <div className="invoice-info-row">
                  <span className="invoice-info-label">Mã hóa đơn</span>
                  <span className="invoice-info-value">
                    INV-{String(invoiceToConfirm.invoiceID).padStart(5, '0')}
                  </span>
                </div>
                <div className="invoice-info-row">
                  <span className="invoice-info-label">Khách hàng</span>
                  <span className="invoice-info-value">{invoiceToConfirm.user?.fullName || '---'}</span>
                </div>
                <div className="invoice-info-row">
                  <span className="invoice-info-label">Tổng tiền thanh toán</span>
                  <span className="invoice-info-value highlight">
                    {new Intl.NumberFormat('vi-VN').format(invoiceToConfirm.totalAmount)}đ
                  </span>
                </div>
              </div>

              <div className="warning-box">
                <AlertCircle size={18} />
                <div className="warning-text">
                  Sau khi xác nhận, hóa đơn sẽ được đánh dấu là <strong>"Đã thanh toán"</strong> và không thể hoàn tác. Ngày thanh toán sẽ được ghi nhận là thời điểm hiện tại.
                </div>
              </div>
            </div>

            <div className="modal-footer-confirm">
              <button 
                type="button" 
                className="btn-confirm btn-cancel" 
                onClick={handleCloseConfirmModal}
                disabled={isConfirming}
              >
                Hủy bỏ
              </button>
              <button 
                type="button" 
                className="btn-confirm btn-primary-confirm" 
                onClick={handleConfirmPayment}
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <>
                    <span className="spinner-confirm"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Xác nhận thanh toán
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