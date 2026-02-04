import React, { useState } from 'react';
import {
  ArrowLeft,
  Monitor,
  CheckCircle2,
  X,
  Server,
  Info,
  Plus,
  Database
} from 'lucide-react';

export default function RoomDetail({ room, onBack, onUpdate }) {
  const [selectedComputer, setSelectedComputer] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [specifications, setSpecifications] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const activeCount = room.computers?.filter(c => c.status === 'active').length || 0;
  const brokenCount = room.computers?.filter(c => c.status === 'broken').length || 0;
  const maintenanceCount = room.computers?.filter(c => c.status === 'maintenance').length || 0;

  const openComputer = (comp) => {
    setSelectedComputer(comp);
    setEditStatus(comp.status);
  };

  const handleUpdateStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://localhost:7140/api/computers/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          computerNumber: selectedComputer.computerNumber,
          roomId: room.roomID,
          status: editStatus
        })
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedComputer = await response.json();
      
      // Update local state
      const updated = {
        ...room,
        computers: room.computers.map(c =>
          c.computerID === selectedComputer.computerID ? { ...c, status: editStatus } : c
        )
      };
      onUpdate(updated);
      setSelectedComputer(null);
    } catch (error) {
      alert('Lỗi khi cập nhật trạng thái: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComputers = async () => {
    if (!specifications.trim()) {
      alert('Vui lòng nhập thông số kỹ thuật');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://localhost:7140/api/computers/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.roomID,
          specifications: specifications.trim(),
          capacity: room.capacity
        })
      });
      console.log(room.capacity, room.roomID, specifications);

      if (!response.ok) throw new Error('Failed to create computers');

      const newComputers = await response.json();
      
      // Update local state
      const updated = {
        ...room,
        computers: newComputers
      };
      onUpdate(updated);
      setShowAddForm(false);
      setSpecifications('');
    } catch (error) {
      alert('Lỗi khi thêm máy tính: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const statusLabel = (s) => ({ active: 'Hoạt động', broken: 'Hỏng', maintenance: 'Bảo dưỡng' }[s]);

  const hasComputers = room.computers && room.computers.length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .rd-root { min-height: 100vh; background: #f0f4f8; padding: 28px; }

        /* Back bar */
        .bk-code { font-family:'JetBrains Mono',monospace; font-size:12px; color:#6366f1; font-weight:600; background:#eef2ff; padding:3px 8px; border-radius:5px; display:inline-block; }
        .rd-back { display: inline-flex; align-items: center; gap: 8px; color: #6366f1; font-size: 13.5px; font-weight: 600; cursor: pointer; border: none; background: none; padding: 0; margin-bottom: 18px; transition: 0.2s; }
        .rd-back:hover { color: #4f46e5; }

        /* Head card */
        .rd-head { background: #1e293b; border-radius: 16px; padding: 26px 30px; display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; flex-wrap: wrap; margin-bottom: 22px; position: relative; overflow: hidden; }
        .rd-head::before { content: ''; position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(99,102,241,0.1); border-radius: 50%; }
        .rd-head::after { content: ''; position: absolute; bottom: -40px; left: 20%; width: 140px; height: 140px; background: rgba(16,185,129,0.07); border-radius: 50%; }
        .rd-head-left { position: relative; z-index: 1; }
        .rd-head-code { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #6366f1; background: rgba(99,102,241,0.15); padding: 3px 10px; border-radius: 5px; display: inline-block; margin-bottom: 6px; font-weight: 600; }
        .rd-head h1 { color: #f1f5f9; font-size: 21px; margin: 0 0 6px; font-weight: 700; }
        .rd-head-desc { color: #94a3b8; font-size: 13px; max-width: 440px; line-height: 1.5; margin: 0; }
        .rd-head-right { position: relative; z-index: 1; display: flex; gap: 28px; }
        .rd-head-stat { text-align: center; }
        .rd-head-stat .val { font-size: 22px; font-weight: 700; color: #f1f5f9; line-height: 1; }
        .rd-head-stat .lbl { font-size: 11px; color: #64748b; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 500; }
        .rd-head-stat.s-green .val { color: #34d399; }
        .rd-head-stat.s-red .val { color: #f87171; }
        .rd-head-stat.s-amber .val { color: #fbbf24; }

        /* Info strip */
        .rd-info-strip { display: flex; gap: 12px; margin-bottom: 22px; flex-wrap: wrap; }
        .rd-info-chip { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 9px 14px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: #334155; }
        .rd-info-chip svg { color: #6366f1; }
        .rd-info-chip strong { color: #1e293b; font-weight: 600; }

        /* Legend */
        .rd-legend { display: flex; gap: 18px; align-items: center; margin-bottom: 14px; }
        .rd-legend-item { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 500; color: #64748b; }
        .rd-legend-dot { width: 10px; height: 10px; border-radius: 50%; }

        /* Empty state */
        .rd-empty { background: #fff; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 60px 40px; text-align: center; }
        .rd-empty-icon { width: 80px; height: 80px; margin: 0 auto 20px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
        .rd-empty h3 { font-size: 18px; color: #1e293b; margin: 0 0 8px; font-weight: 700; }
        .rd-empty p { font-size: 14px; color: #64748b; margin: 0 0 24px; }
        .rd-btn-add { background: #6366f1; color: #fff; border: none; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: 0.2s; }
        .rd-btn-add:hover { background: #4f46e5; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.3); }

        /* Add form */
        .rd-add-form { background: #fff; border-radius: 16px; padding: 24px; margin-bottom: 22px; border: 1.5px solid #e2e8f0; }
        .rd-add-form h3 { font-size: 16px; color: #1e293b; margin: 0 0 18px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
        .rd-form-group { margin-bottom: 16px; }
        .rd-form-label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px; }
        .rd-form-info { font-size: 12px; color: #94a3b8; margin-top: 4px; }
        .rd-textarea { width: 100%; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; outline: none; resize: vertical; min-height: 100px; transition: 0.2s; font-family: 'DM Sans', sans-serif; }
        .rd-textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .rd-form-actions { display: flex; gap: 10px; }
        .rd-btn-cancel { flex: 1; padding: 11px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 10px; font-size: 13.5px; font-weight: 600; color: #475569; cursor: pointer; transition: 0.2s; }
        .rd-btn-cancel:hover { background: #f1f5f9; }
        .rd-btn-submit { flex: 1; padding: 11px; background: #6366f1; color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .rd-btn-submit:hover { background: #4f46e5; }
        .rd-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Grid */
        .rd-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 12px; }
        .rd-pc { background: #fff; border: 1.5px solid #e8ecf0; border-radius: 12px; padding: 14px 10px 12px; text-align: center; cursor: pointer; transition: 0.2s; position: relative; }
        .rd-pc:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.08); border-color: #c7d2fe; }
        .rd-pc.status-active { border-top: 3px solid #10b981; }
        .rd-pc.status-broken { border-top: 3px solid #ef4444; background: #fef7f7; }
        .rd-pc.status-maintenance { border-top: 3px solid #f59e0b; background: #fefcf3; }
        .rd-pc-icon { width: 44px; height: 32px; margin: 0 auto 8px; position: relative; }
        .rd-pc-monitor { width: 44px; height: 28px; background: #1e293b; border-radius: 4px; margin: 0 auto; position: relative; display: flex; align-items: center; justify-content: center; }
        .rd-pc-monitor::after { content: ''; position: absolute; bottom: -5px; width: 12px; height: 5px; background: #1e293b; border-radius: 0 0 2px 2px; }
        .rd-pc-screen { width: 36px; height: 20px; border-radius: 2px; }
        .rd-pc.status-active .rd-pc-screen { background: #34d399; }
        .rd-pc.status-broken .rd-pc-screen { background: #f87171; }
        .rd-pc.status-maintenance .rd-pc-screen { background: #fbbf24; }
        .rd-pc-code { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: #6366f1; font-weight: 600; margin-top: 6px; }
        .rd-pc-status-label { font-size: 10px; font-weight: 600; margin-top: 2px; }
        .rd-pc.status-active .rd-pc-status-label { color: #059669; }
        .rd-pc.status-broken .rd-pc-status-label { color: #dc2626; }
        .rd-pc.status-maintenance .rd-pc-status-label { color: #d97706; }

        /* Modal */
        .rd-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(3px); animation: rdFadeIn 0.2s; }
        @keyframes rdFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .rd-modal { background: #fff; border-radius: 18px; width: 90%; max-width: 480px; animation: rdSlideUp 0.28s cubic-bezier(.34,1.56,.64,1); box-shadow: 0 24px 48px rgba(0,0,0,0.14); overflow: hidden; }
        @keyframes rdSlideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .rd-modal-head { padding: 18px 22px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
        .rd-modal-head h3 { margin: 0; font-size: 15.5px; color: #1e293b; font-weight: 700; display: flex; align-items: center; gap: 8px; }
        .rd-modal-head .head-code { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #6366f1; background: #eef2ff; padding: 2px 8px; border-radius: 5px; font-weight: 600; }
        .rd-modal-close { background: none; border: none; padding: 4px; cursor: pointer; color: #64748b; transition: 0.2s; border-radius: 6px; }
        .rd-modal-close:hover { background: #f1f5f9; color: #1e293b; }
        .rd-modal-body { padding: 22px; }

        .rd-spec-block { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 18px; }
        .rd-spec-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
        .rd-spec-row:last-child { margin-bottom: 0; }
        .rd-spec-icon { color: #6366f1; flex-shrink: 0; margin-top: 2px; }
        .rd-spec-content { flex: 1; }
        .rd-spec-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #94a3b8; font-weight: 600; margin-bottom: 3px; }
        .rd-spec-value { font-size: 14px; color: #1e293b; font-weight: 600; line-height: 1.4; }

        .rd-divider { border: none; border-top: 1.5px solid #f1f5f9; margin: 18px 0; }
        .rd-edit-section h4 { font-size: 13px; font-weight: 700; color: #374151; margin: 0 0 12px; display: flex; align-items: center; gap: 6px; }
        .rd-select-wrap { position: relative; margin-bottom: 12px; }
        .rd-select { width: 100%; padding: 10px 38px 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 13.5px; outline: none; background: #fff; color: #1e293b; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; cursor: pointer; transition: 0.2s; }
        .rd-select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .rd-modal-actions { display: flex; gap: 10px; margin-top: 18px; }
        .rd-label-sm { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 5px; display: block; text-transform: uppercase; letter-spacing: 0.03em; }

        @media (max-width: 1100px) { .rd-grid { grid-template-columns: repeat(6, 1fr); } }
        @media (max-width: 780px) { .rd-grid { grid-template-columns: repeat(4, 1fr); } .rd-head { flex-direction: column; } .rd-head-right { flex-direction: row; gap: 20px; } }
        @media (max-width: 480px) { .rd-grid { grid-template-columns: repeat(3, 1fr); } }
      `}</style>

      <div className="rd-root">
        <button className="rd-back" onClick={onBack}><ArrowLeft size={16} /> Quay lại danh sách</button>

        <div className="rd-head">
          <div className="rd-head-left">
            <div className="rd-head-code">{room.roomCode}</div>
            <h1>{room.roomName}</h1>
            <p className="rd-head-desc">{room.description || 'Chưa có mô tả'}</p>
          </div>
          <div className="rd-head-right">
            <div className="rd-head-stat"><div className="val">{room.totalComputers}</div><div className="lbl">Tổng máy</div></div>
            <div className="rd-head-stat s-green"><div className="val">{activeCount}</div><div className="lbl">Hoạt động</div></div>
            <div className="rd-head-stat s-red"><div className="val">{brokenCount}</div><div className="lbl">Hỏng</div></div>
            <div className="rd-head-stat s-amber"><div className="val">{maintenanceCount}</div><div className="lbl">Bảo dưỡng</div></div>
          </div>
        </div>

        <div className="rd-info-strip">
          <div className="rd-info-chip"><Server size={15} /> Loại: <strong>{room.typeName}</strong></div>
          <div className="rd-info-chip"><Database size={15} /> Tầng: <strong>{room.floor}</strong></div>
          <div className="rd-info-chip">
            <CheckCircle2 size={15} style={{ color: room.status === 'Active' ? '#10b981' : '#f59e0b' }} />
            Trạng thái: <strong style={{ color: room.status === 'Active' ? '#059669' : '#d97706' }}>{room.status === 'Active' ? 'Hoạt động' : 'Bảo dưỡng'}</strong>
          </div>
        </div>

        {!hasComputers && !showAddForm && (
          <div className="rd-empty">
            <div className="rd-empty-icon"><Monitor size={40} /></div>
            <h3>Phòng chưa có máy tính</h3>
            <p>Thêm máy tính cho phòng này để bắt đầu quản lý</p>
            <button className="rd-btn-add" onClick={() => setShowAddForm(true)}>
              <Plus size={18} /> Thêm máy tính
            </button>
          </div>
        )}

        {showAddForm && (
          <div className="rd-add-form">
            <h3><Plus size={18} /> Thêm máy tính cho phòng</h3>
            <div className="rd-form-group">
              <label className="rd-form-label">Thông số kỹ thuật</label>
              <textarea
                className="rd-textarea"
                value={specifications}
                onChange={e => setSpecifications(e.target.value)}
                placeholder="Ví dụ: Intel Core i5-10400, RAM 8GB DDR4, SSD 256GB, Intel UHD Graphics 630, Windows 10 Pro"
              />
              <div className="rd-form-info">
                Hệ thống sẽ tự động tạo {room.capacity} máy tính với thông số này
              </div>
            </div>
            <div className="rd-form-actions">
              <button className="rd-btn-cancel" onClick={() => { setShowAddForm(false); setSpecifications(''); }}>Hủy</button>
              <button className="rd-btn-submit" onClick={handleAddComputers} disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Lưu'}
              </button>
            </div>
          </div>
        )}

        {hasComputers && (
          <>
            <div className="rd-legend">
              <span style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginRight: 4 }}>Ký hiệu:</span>
              <div className="rd-legend-item"><div className="rd-legend-dot" style={{ background: '#10b981' }} /> Hoạt động</div>
              <div className="rd-legend-item"><div className="rd-legend-dot" style={{ background: '#ef4444' }} /> Hỏng</div>
              <div className="rd-legend-item"><div className="rd-legend-dot" style={{ background: '#f59e0b' }} /> Bảo dưỡng</div>
            </div>

            <div className="rd-grid">
              {room.computers.map(comp => (
                <div key={comp.computerID} className={`rd-pc status-${comp.status}`} onClick={() => openComputer(comp)} title={`${comp.computerName} — ${statusLabel(comp.status)}`}>
                  <div className="rd-pc-icon">
                    <div className="rd-pc-monitor">
                      <div className="rd-pc-screen" />
                    </div>
                  </div>
                  <div className="rd-pc-code">{comp.computerNumber}</div>
                  <div className="rd-pc-status-label">{statusLabel(comp.status)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedComputer && (
        <div className="rd-overlay" onClick={() => setSelectedComputer(null)}>
          <div className="rd-modal" onClick={e => e.stopPropagation()}>
            <div className="rd-modal-head">
              <h3><Monitor size={17} /> Thông tin máy <span className="head-code">{selectedComputer.computerName}</span></h3>
              <button className="rd-modal-close" onClick={() => setSelectedComputer(null)}><X size={15} /></button>
            </div>
            <div className="rd-modal-body">
              <div className="rd-spec-block">
                <div className="rd-spec-row">
                  <Server size={16} className="rd-spec-icon" />
                  <div className="rd-spec-content">
                    <div className="rd-spec-label">Thông số kỹ thuật</div>
                    <div className="rd-spec-value">{selectedComputer.specifications}</div>
                  </div>
                </div>
              </div>

              <hr className="rd-divider" />

              <div className="rd-edit-section">
                <h4><Info size={14} /> Chỉnh sửa trạng thái</h4>
                <label className="rd-label-sm">Trạng thái máy</label>
                <div className="rd-select-wrap">
                  <select
                    className="rd-select"
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                  >
                    <option value="active">✓  Hoạt động</option>
                    <option value="broken">✗  Hỏng</option>
                    <option value="maintenance">⟳  Đang bảo dưỡng</option>
                  </select>
                </div>
              </div>

              <div className="rd-modal-actions">
                <button type="button" className="rd-btn-cancel" onClick={() => setSelectedComputer(null)}>Hủy</button>
                <button type="button" className="rd-btn-submit" onClick={handleUpdateStatus} disabled={isLoading}>
                  {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}