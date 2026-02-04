import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle2, Clock, XCircle, Check } from 'lucide-react';

export default function IncidentManagement() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => { fetchIncidents(); }, []);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('https://localhost:7140/api/IncidentReports');
      const result = await res.json();
      
      // Map dữ liệu từ API sang format của frontend
      const mappedData = (result.data || []).map(item => ({
        id: item.reportId,
        description: item.description,
        reporterName: item.reporterName,
        status: item.status,
        reportDate: item.reportDate,
        roomCode: item.roomCode,
        roomName: item.roomName
      }));
      
      setIncidents(mappedData);
    } catch (err) { 
      console.error('Lỗi fetch sự cố:', err);
      // Mock data cho demo
      setIncidents([
        {
          id: 1,
          description: 'Máy PC101-05 tại phòng Lập Trình A không thể khởi động, màn hình không hiển thị gì',
          reporterName: 'Nguyễn Văn A',
          status: 'not yet process',
          reportDate: '2024-02-01T08:30:00',
          roomCode: 'PC-101',
          roomName: 'Phòng Lập Trình A'
        },
        {
          id: 2,
          description: 'Toàn bộ máy tại phòng PC-202 bị mất kết nối internet',
          reporterName: 'Trần Thị B',
          status: 'processing',
          reportDate: '2024-02-02T10:15:00',
          roomCode: 'PC-202',
          roomName: 'Phòng AI & ML D'
        },
        {
          id: 3,
          description: 'Adobe Photoshop trên máy PC102-08 bị crash liên tục khi mở file PSD',
          reporterName: 'Lê Văn C',
          status: 'resolved',
          reportDate: '2024-02-03T14:20:00',
          roomCode: 'PC-102',
          roomName: 'Phòng Đồ Họa B'
        },
        {
          id: 4,
          description: 'Bàn phím tại máy PC301-12 không nhận phím, đã thử cắm lại nhiều lần',
          reporterName: 'Phạm Thị D',
          status: 'not yet process',
          reportDate: '2024-02-04T09:00:00',
          roomCode: 'PC-301',
          roomName: 'Phòng Mạng Máy E'
        },
        {
          id: 5,
          description: 'Máy PC201-15 báo ổ C: đã đầy, không thể cài đặt thêm phần mềm',
          reporterName: 'Hoàng Văn E',
          status: 'processing',
          reportDate: '2024-02-04T11:30:00',
          roomCode: 'PC-201',
          roomName: 'Phòng Hệ Thống C'
        }
      ]);
    } finally { 
      setLoading(false); 
    }
  };

  const handleMarkAsDone = async (incidentId) => {
    try {
      // Gọi API để cập nhật trạng thái
      const res = await fetch(`https://localhost:7140/api/IncidentReports/${incidentId}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        // Cập nhật state local
        setIncidents(incidents.map(inc => 
          inc.id === incidentId ? { ...inc, status: 'resolved' } : inc
        ));
      }
    } catch (err) {
      console.error('Lỗi cập nhật sự cố:', err);
      // Fallback: cập nhật local nếu API lỗi
      setIncidents(incidents.map(inc => 
        inc.id === incidentId ? { ...inc, status: 'resolved' } : inc
      ));
    }
  };

  const handleMarkAsProcessing = async (incidentId) => {
    try {
      // Gọi API để cập nhật trạng thái
      const res = await fetch(`https://localhost:7140/api/IncidentReports/${incidentId}/process`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        // Cập nhật state local
        setIncidents(incidents.map(inc => 
          inc.id === incidentId ? { ...inc, status: 'processing' } : inc
        ));
      }
    } catch (err) {
      console.error('Lỗi cập nhật sự cố:', err);
      // Fallback: cập nhật local nếu API lỗi
      setIncidents(incidents.map(inc => 
        inc.id === incidentId ? { ...inc, status: 'processing' } : inc
      ));
    }
  };

  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'not yet processed', label: 'Chưa xử lý' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'resolved', label: 'Đã giải quyết' }
  ];

  const filteredIncidents = incidents.filter(inc => {
    const matchSearch = 
      inc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.reporterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.roomCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.roomName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === 'all' || inc.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: incidents.length,
    notYetProcess: incidents.filter(inc => inc.status === 'not yet processed').length ?? 0,
    processing: incidents.filter(inc => inc.status === 'processing').length ?? 0,
    resolved: incidents.filter(inc => inc.status === 'resolved').length ?? 0
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'not yet processed':
        return { className: 'inc-status-pending', icon: <Clock size={13} />, text: 'Chưa xử lý' };
      case 'processing':
        return { className: 'inc-status-processing', icon: <AlertTriangle size={13} />, text: 'Đang xử lý' };
      case 'resolved':
        return { className: 'inc-status-resolved', icon: <CheckCircle2 size={13} />, text: 'Đã giải quyết' };
      default:
        return { className: 'inc-status-pending', icon: <Clock size={13} />, text: 'Chưa xử lý' };
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Đang tải dữ liệu sự cố...</div>;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .inc-root { min-height: 100vh; background: #f0f4f8; padding: 28px; }
        .inc-header { background: #1e293b; border-radius: 16px; padding: 28px 32px; margin-bottom: 24px; position: relative; overflow: hidden; }
        .inc-header::before { content: ''; position: absolute; top: -40px; right: -40px; width: 180px; height: 180px; background: rgba(99,102,241,0.12); border-radius: 50%; }
        .inc-header::after { content: ''; position: absolute; bottom: -30px; left: 30%; width: 120px; height: 120px; background: rgba(16,185,129,0.08); border-radius: 50%; }
        .inc-header h1 { color: #f1f5f9; font-size: 22px; font-weight: 700; margin: 0 0 4px; position: relative; z-index: 1; }
        .inc-header p { color: #94a3b8; font-size: 14px; margin: 0; position: relative; z-index: 1; }
        .inc-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 22px; }
        .inc-stat-card { background: #fff; border-radius: 12px; padding: 18px 20px; border: 1px solid #e2e8f0; }
        .inc-stat-card .stat-val { font-size: 26px; font-weight: 700; line-height: 1; margin-bottom: 4px; }
        .inc-stat-card .stat-label { font-size: 12.5px; color: #64748b; font-weight: 500; }
        .inc-stat-card .stat-icon { float: right; width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .color-blue .stat-val { color: #3b82f6; } .color-blue .stat-icon { background: #eff6ff; color: #3b82f6; }
        .color-red .stat-val { color: #ef4444; } .color-red .stat-icon { background: #fef2f2; color: #ef4444; }
        .color-amber .stat-val { color: #f59e0b; } .color-amber .stat-icon { background: #fffbeb; color: #f59e0b; }
        .color-green .stat-val { color: #10b981; } .color-green .stat-icon { background: #ecfdf5; color: #10b981; }
        .inc-toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 18px; flex-wrap: wrap; }
        .inc-search { position: relative; flex: 1; min-width: 240px; max-width: 420px; }
        .inc-search input { width: 100%; padding: 10px 16px 10px 42px; border-radius: 10px; border: 1.5px solid #e2e8f0; font-size: 13.5px; background: #fff; transition: 0.2s; outline: none; }
        .inc-search input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .inc-search .search-ic { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .inc-status-pills { display: flex; gap: 6px; }
        .inc-status-pill { padding: 8px 14px; border-radius: 20px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: 0.2s; }
        .inc-status-pill:hover { border-color: #c7d2fe; background: #f5f3ff; }
        .inc-status-pill.active { background: #6366f1; color: #fff; border-color: #6366f1; }
        .inc-table-wrap { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; }
        .inc-table { width: 100%; border-collapse: collapse; }
        .inc-table thead { background: #f8fafc; }
        .inc-table th { padding: 12px 18px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
        .inc-table td { padding: 14px 18px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; color: #334155; }
        .inc-table tr:last-child td { border-bottom: none; }
        .inc-table tr:hover td { background: #fafbfd; }
        .inc-title { font-weight: 600; color: #1e293b; margin-bottom: 2px; }
        .inc-room-code { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #6366f1; background: #eef2ff; padding: 2px 6px; border-radius: 4px; }
        .inc-content { color: #64748b; font-size: 12.5px; line-height: 1.5; max-width: 400px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .inc-status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; font-size: 12.5px; font-weight: 600; }
        .inc-status-pending { background: #fffbeb; color: #d97706; }
        .inc-status-processing { background: #fef3c7; color: #b45309; }
        .inc-status-resolved { background: #ecfdf5; color: #059669; }
        .inc-empty { padding: 60px 20px; text-align: center; color: #94a3b8; }
        .inc-empty svg { margin-bottom: 12px; opacity: 0.5; }
        .inc-act-btn { background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s; color: #475569; font-size: 13px; font-weight: 500; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
        .inc-act-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
        .inc-act-btn.done { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
        .inc-act-btn.done:hover { background: #d1fae5; }
        .inc-act-btn.processing { background: #fffbeb; color: #d97706; border-color: #fde68a; }
        .inc-act-btn.processing:hover { background: #fef3c7; }
        @media (max-width: 640px) { 
          .inc-stats { grid-template-columns: repeat(2,1fr); } 
          .inc-toolbar { flex-direction: column; align-items: stretch; } 
          .inc-search { max-width: 100%; }
          .inc-content { max-width: 200px; }
        }
      `}</style>

      <div className="inc-root">
        {/* Header */}
        <div className="inc-header">
          <h1><AlertTriangle size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />Quản lý Sự cố</h1>
          <p>Theo dõi và xử lý các sự cố phát sinh trong hệ thống</p>
        </div>

        {/* Stats */}
        <div className="inc-stats">
          <div className="inc-stat-card color-blue">
            <div className="stat-icon"><AlertTriangle size={18} /></div>
            <div className="stat-val">{stats.total}</div>
            <div className="stat-label">Tổng sự cố</div>
          </div>
          <div className="inc-stat-card color-red">
            <div className="stat-icon"><Clock size={18} /></div>
            <div className="stat-val">{stats.notYetProcess}</div>
            <div className="stat-label">Chưa xử lý</div>
          </div>
          <div className="inc-stat-card color-amber">
            <div className="stat-icon"><XCircle size={18} /></div>
            <div className="stat-val">{stats.processing}</div>
            <div className="stat-label">Đang xử lý</div>
          </div>
          <div className="inc-stat-card color-green">
            <div className="stat-icon"><CheckCircle2 size={18} /></div>
            <div className="stat-val">{stats.resolved}</div>
            <div className="stat-label">Đã giải quyết</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="inc-toolbar">
          <div className="inc-search">
            <Search className="search-ic" size={17} />
            <input 
              type="text" 
              placeholder="Tìm kiếm phòng, nội dung, người báo..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="inc-status-pills">
            {statusOptions.map(opt => (
              <button 
                key={opt.value} 
                className={`inc-status-pill${selectedStatus === opt.value ? ' active' : ''}`} 
                onClick={() => setSelectedStatus(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="inc-table-wrap">
          <table className="inc-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Phòng</th>
                <th style={{ width: '35%' }}>Nội dung sự cố</th>
                <th>Người báo</th>
                <th style={{ textAlign: 'center' }}>Tình trạng</th>
                <th style={{ textAlign: 'center', width: 180 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="inc-empty">
                    <AlertTriangle size={40} /><br />
                    Không tìm thấy sự cố nào
                  </td>
                </tr>
              ) : filteredIncidents.map(inc => {
                const statusBadge = getStatusBadge(inc.status);
                return (
                  <tr key={inc.id}>
                    <td>
                      <div className="inc-title">{inc.roomName || 'N/A'}</div>
                      {inc.roomCode && (
                        <div style={{ marginTop: 4 }}>
                          <span className="inc-room-code">{inc.roomCode}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="inc-content">{inc.description}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{inc.reporterName}</div>
                      {inc.reportDate && (
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                          {new Date(inc.reportDate).toLocaleString('vi-VN')}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`inc-status-badge ${statusBadge.className}`}>
                        {statusBadge.icon} {statusBadge.text}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {inc.status === 'not yet processed' ? (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button 
                            className="inc-act-btn processing" 
                            onClick={() => handleMarkAsProcessing(inc.id)}
                            title="Chuyển sang đang xử lý"
                          >
                            <AlertTriangle size={14} /> Xử lý
                          </button>
                          <button 
                            className="inc-act-btn done" 
                            onClick={() => handleMarkAsDone(inc.id)}
                            title="Đánh dấu đã hoàn thành"
                          >
                            <Check size={14} /> Hoàn thành
                          </button>
                        </div>
                      ) : inc.status === 'processing' ? (
                        <button 
                          className="inc-act-btn done" 
                          onClick={() => handleMarkAsDone(inc.id)}
                          title="Đánh dấu đã hoàn thành"
                        >
                          <Check size={16} /> Hoàn thành
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}