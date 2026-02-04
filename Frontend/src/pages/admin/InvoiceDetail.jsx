import React from 'react';
import { X } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function InvoiceDetail({ invoice, onBack, onUpdate }) {
  if (!invoice) return null;

  const handleStatusChange = (newStatus) => {
    // Giả lập update trạng thái, gọi API sau này
    const updated = { ...invoice, status: newStatus };
    onUpdate(updated);
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Chi tiết hóa đơn INV-{String(invoice.invoiceID).padStart(5, '0')}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onBack}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <strong>Khách hàng:</strong> {invoice.user?.fullName} ({invoice.user?.email})
            </div>
            <div className="mb-3 d-flex gap-3">
              <div><strong>Tổng tiền:</strong> {new Intl.NumberFormat('vi-VN').format(invoice.totalAmount)}đ</div>
              <div><strong>Tiền cọc:</strong> {invoice.deposit ? new Intl.NumberFormat('vi-VN').format(invoice.deposit) + 'đ' : '---'}</div>
              <div><strong>Ngày thanh toán:</strong> {invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString('vi-VN') : '---'}</div>
            </div>

            {invoice.booking ? (
              <div className="border rounded p-3 mb-3">
                <h6>Thông tin đặt phòng</h6>
                <div><strong>Phòng:</strong> {invoice.booking.roomName} ({invoice.booking.roomCode})</div>
                <div><strong>Số người:</strong> {invoice.booking.numberOfPeople}</div>
                <div><strong>Ngày đặt:</strong> {new Date(invoice.booking.bookingDate).toLocaleDateString('vi-VN')}</div>
                <div><strong>Thời gian:</strong> {new Date(invoice.booking.startTime).toLocaleTimeString()} - {new Date(invoice.booking.endTime).toLocaleTimeString()}</div>
                <div><strong>Mục đích:</strong> {invoice.booking.purpose}</div>
              </div>
            ) : (
              <div className="text-secondary mb-3">Chưa có thông tin booking</div>
            )}

            <div className="mb-3">
              <strong>Trạng thái:</strong> 
              <span className={`badge ms-2 ${invoice.status === 'paid' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'} p-2 px-3`}>
                {invoice.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onBack}>Quay lại</button>
          </div>
        </div>
      </div>
    </div>
  );
}
