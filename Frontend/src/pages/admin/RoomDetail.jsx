import React, { useState } from 'react';
import {
  ArrowLeft,
  Monitor,
  CheckCircle2,
  AlertCircle,
  XCircle,
  X,
  Cpu,
  HardDrive,
  Database,
  Server,
  Info
} from 'lucide-react';

export default function RoomDetail({ room, onBack, onUpdate }) {
  const [selectedComputer, setSelectedComputer] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNote, setEditNote] = useState('');

  const activeCount = room.computers.filter(c => c.status === 'active').length;
  const brokenCount = room.computers.filter(c => c.status === 'broken').length;
  const maintenanceCount = room.computers.filter(c => c.status === 'maintenance').length;

  const openComputer = (comp) => {
    setSelectedComputer(comp);
    setEditStatus(comp.status);
    setEditNote(comp.note);
  };

  const handleSaveComputer = () => {
    const updated = {
      ...room,
      computers: room.computers.map(c =>
        c.id === selectedComputer.id ? { ...c, status: editStatus, note: editNote } : c
      )
    };
    onUpdate(updated);
    setSelectedComputer(null);
  };

  const statusColor = (s) => ({ active: '#10b981', broken: '#ef4444', maintenance: '#f59e0b' }[s]);
  const statusLabel = (s) => ({ active: 'Hoạt động', broken: 'Hỏng', maintenance: 'Bảo dưỡng' }[s]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .rd-root { min-height: 100vh; background: #f0f4f8; padding: 28px; }

        /* Back bar */
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

        /* Grid */
        .rd-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 12px; }
        .rd-pc { background: #fff; border: 1.5px solid #e8ecf0; border-radius: 12px; padding: 14px 10px 12px; text-align: center; cursor: pointer; transition: 0.2s; position: relative; }
        .rd-pc:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.08); border-color: #c7d2fe; }
        .rd-pc.status-active { border-top: 3px solid #10b981; }
        .rd-pc.status-broken { border-top: 3px solid #ef4444; background: #fef7f7; }
        .rd-pc.status-maintenance { border-top: 3px solid #f59e0b; background: #fefcf3; }
        .rd-pc-icon { width: 44px; height: 32px; margin: 0 auto 8px; position: relative; }
        /* Monitor shape */
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
        .rd-modal-body { padding: 22px; }
        .rd-spec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; }
        .rd-spec-item { background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 10px; padding: 12px 14px; }
        .rd-spec-item .spec-icon { color: #6366f1; margin-bottom: 5px; display: flex; align-items: center; gap: 5px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #94a3b8; font-weight: 600; }
        .rd-spec-item .spec-val { font-size: 13px; color: #1e293b; font-weight: 600; line-height: 1.35; }
        .rd-spec-item.full { grid-column: 1 / -1; }
        .rd-divider { border: none; border-top: 1.5px solid #f1f5f9; margin: 18px 0; }
        .rd-edit-section h4 { font-size: 13px; font-weight: 700; color: #374151; margin: 0 0 12px; display: flex; align-items: center; gap: 6px; }
        .rd-edit-section h4 span { font-weight: 400; color: #94a3b8; font-size: 11.5px; }
        .rd-select-wrap { position: relative; margin-bottom: 12px; }
        .rd-select { width: 100%; padding: 10px 38px 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 13.5px; outline: none; background: #fff; color: #1e293b; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; cursor: pointer; transition: 0.2s; }
        .rd-select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .rd-select-status { display: flex; align-items: center; gap: 8px; }
        .rd-status-preview { width: 10px; height: 10px; border-radius: 50%; }
        .rd-textarea { width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 13.5px; outline: none; resize: vertical; min-height: 56px; transition: 0.2s; }
        .rd-textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .rd-modal-actions { display: flex; gap: 10px; margin-top: 18px; }
        .rd-btn-cancel { flex: 1; padding: 10px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 9px; font-size: 13.5px; font-weight: 600; color: #475569; cursor: pointer; transition: 0.2s; }
        .rd-btn-cancel:hover { background: #f1f5f9; }
        .rd-btn-save { flex: 1; padding: 10px; background: #1e293b; color: #fff; border: none; border-radius: 9px; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .rd-btn-save:hover { background: #334155; }
        .rd-label-sm { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 5px; display: block; text-transform: uppercase; letter-spacing: 0.03em; }

        @media (max-width: 1100px) { .rd-grid { grid-template-columns: repeat(6, 1fr); } }
        @media (max-width: 780px) { .rd-grid { grid-template-columns: repeat(4, 1fr); } .rd-head { flex-direction: column; } .rd-head-right { flex-direction: row; gap: 20px; } }
        @media (max-width: 480px) { .rd-grid { grid-template-columns: repeat(3, 1fr); } .rd-spec-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="rd-root">
        {/* Back */}
        <button className="rd-back" onClick={onBack}><ArrowLeft size={16} /> Quay lại danh sách</button>

        {/* Head */}
        <div className="rd-head">
          <div className="rd-head-left">
            <div className="rd-head-code">{room.code}</div>
            <h1>{room.name}</h1>
            <p className="rd-head-desc">{room.description || 'Chưa có mô tả'}</p>
          </div>
          <div className="rd-head-right">
            <div className="rd-head-stat"><div className="val">{room.totalComputers}</div><div className="lbl">Tổng máy</div></div>
            <div className="rd-head-stat s-green"><div className="val">{activeCount}</div><div className="lbl">Hoạt động</div></div>
            <div className="rd-head-stat s-red"><div className="val">{brokenCount}</div><div className="lbl">Hỏng</div></div>
            <div className="rd-head-stat s-amber"><div className="val">{maintenanceCount}</div><div className="lbl">Bảo dưỡng</div></div>
          </div>
        </div>

        {/* Info chips */}
        <div className="rd-info-strip">
          <div className="rd-info-chip"><Server size={15} /> Loại: <strong>{room.type}</strong></div>
          <div className="rd-info-chip"><Database size={15} /> Tầng: <strong>{room.floor}</strong></div>
          <div className="rd-info-chip">
            <CheckCircle2 size={15} style={{ color: room.status === 'active' ? '#10b981' : '#f59e0b' }} />
            Trạng thái: <strong style={{ color: room.status === 'active' ? '#059669' : '#d97706' }}>{room.status === 'active' ? 'Hoạt động' : 'Bảo dưỡng'}</strong>
          </div>
        </div>

        {/* Legend */}
        <div className="rd-legend">
          <span style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginRight: 4 }}>Ký hiệu:</span>
          <div className="rd-legend-item"><div className="rd-legend-dot" style={{ background: '#10b981' }} /> Hoạt động</div>
          <div className="rd-legend-item"><div className="rd-legend-dot" style={{ background: '#ef4444' }} /> Hỏng</div>
          <div className="rd-legend-item"><div className="rd-legend-dot" style={{ background: '#f59e0b' }} /> Bảo dưỡng</div>
        </div>

        {/* Computer Grid - 8 per row via CSS grid */}
        <div className="rd-grid">
          {room.computers.map(comp => (
            <div key={comp.id} className={`rd-pc status-${comp.status}`} onClick={() => openComputer(comp)} title={`${comp.code} — ${statusLabel(comp.status)}`}>
              <div className="rd-pc-icon">
                <div className="rd-pc-monitor">
                  <div className="rd-pc-screen" />
                </div>
              </div>
              <div className="rd-pc-code">{comp.code.split('-').pop()}</div>
              <div className="rd-pc-status-label">{statusLabel(comp.status)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Computer Detail Modal */}
      {selectedComputer && (
        <div className="rd-overlay" onClick={() => setSelectedComputer(null)}>
          <div className="rd-modal" onClick={e => e.stopPropagation()}>
            <div className="rd-modal-head">
              <h3><Monitor size={17} /> Thông số máy <span className="head-code">{selectedComputer.code}</span></h3>
              <button className="rd-modal-close" onClick={() => setSelectedComputer(null)}><X size={15} /></button>
            </div>
            <div className="rd-modal-body">
              {/* Read-only specs */}
              <div className="rd-spec-grid">
                <div className="rd-spec-item">
                  <div className="spec-icon"><Server size={12} /> Thương hiệu</div>
                  <div className="spec-val">{selectedComputer.brand}</div>
                </div>
                <div className="rd-spec-item">
                  <div className="spec-icon"><Cpu size={12} /> Processor</div>
                  <div className="spec-val">{selectedComputer.cpu}</div>
                </div>
                <div className="rd-spec-item">
                  <div className="spec-icon"><Database size={12} /> RAM</div>
                  <div className="spec-val">{selectedComputer.ram}</div>
                </div>
                <div className="rd-spec-item">
                  <div className="spec-icon"><HardDrive size={12} /> Storage</div>
                  <div className="spec-val">{selectedComputer.storage}</div>
                </div>
                <div className="rd-spec-item">
                  <div className="spec-icon"><Monitor size={12} /> GPU</div>
                  <div className="spec-val">{selectedComputer.gpu}</div>
                </div>
                <div className="rd-spec-item">
                  <div className="spec-icon"><Server size={12} /> OS</div>
                  <div className="spec-val">{selectedComputer.os}</div>
                </div>
              </div>

              <hr className="rd-divider" />

              {/* Editable section */}
              <div className="rd-edit-section">
                <h4><Info size={14} /> Chỉnh sửa trạng thái <span>(các trường khác chỉ được xem)</span></h4>
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
                <label className="rd-label-sm">Ghi chú</label>
                <textarea
                  className="rd-textarea"
                  value={editNote}
                  onChange={e => setEditNote(e.target.value)}
                  placeholder="Nhập ghi chú về máy tính này..."
                />
              </div>

              <div className="rd-modal-actions">
                <button type="button" className="rd-btn-cancel" onClick={() => setSelectedComputer(null)}>Hủy</button>
                <button type="button" className="rd-btn-save" onClick={handleSaveComputer}>Lưu thay đổi</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}