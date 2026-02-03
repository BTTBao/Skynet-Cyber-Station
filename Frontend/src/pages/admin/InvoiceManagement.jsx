import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter } from 'lucide-react';
import InvoiceDetail from './InvoiceDetail'; // File Chi tiết hóa đơn

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('http://localhost:5270/api/invoices');
      const result = await res.json();
      // Kiểm tra backend trả về result.data đúng
      setInvoices(result.data || []);
    } catch (err) { 
      console.error('Lỗi fetch hóa đơn:', err); 
    } finally { 
      setLoading(false); 
    }
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
    <div className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">Quản lý hóa đơn</h2>
        <div className="d-flex gap-2">
          <div className="position-relative">
            <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" size={18} />
            <input type="text" className="form-control ps-5" placeholder="Tìm mã hóa đơn..." style={{ borderRadius: '10px' }} />
          </div>
          <button className="btn btn-outline-secondary d-flex align-items-center gap-2" style={{ borderRadius: '10px' }}>
            <Filter size={18} /> Lọc
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: '15px', overflow: 'hidden' }}>
        <table className="table table-hover mb-0">
          <thead className="bg-light">
            <tr>
              <th className="ps-4 py-3">Mã HĐ</th>
              <th className="py-3">Khách hàng</th>
              <th className="py-3">Tổng tiền</th>
              <th className="py-3">Tiền cọc</th>
              <th className="py-3">Ngày thanh toán</th>
              <th className="py-3">Trạng thái</th>
              <th className="py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-secondary">
                  Không có hóa đơn
                </td>
              </tr>
            ) : invoices.map(inv => (
              <tr key={inv.invoiceID} className="align-middle">
                <td className="ps-4 fw-bold text-primary">INV-{String(inv.invoiceID).padStart(5, '0')}</td>
                <td>{inv.user?.fullName || '---'}</td>
                <td className="fw-semibold">{new Intl.NumberFormat('vi-VN').format(inv.totalAmount)}đ</td>
                <td className="fw-semibold">{inv.deposit ? new Intl.NumberFormat('vi-VN').format(inv.deposit) + 'đ' : '---'}</td>
                <td>{inv.PaymentDate ? new Date(inv.PaymentDate).toLocaleDateString('vi-VN') : '---'}</td>
                <td>
                  <span className={`badge ${inv.status === 'Đã thanh toán' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'} p-2 px-3`}>
                    {inv.status}
                  </span>
                </td>
                <td className="text-center">
                  <button className="btn btn-sm btn-light p-2 px-3" onClick={() => setSelectedInvoice(inv)}>
                    <Eye size={16} className="me-1" /> Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
