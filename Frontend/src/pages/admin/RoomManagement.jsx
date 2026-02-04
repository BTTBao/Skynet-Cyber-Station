import React, { useState, useEffect } from 'react';
import RoomDetail from './RoomDetail';
import {
  Search,
  Plus,
  Eye,
  X,
  Monitor,
  Layers,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';
import axios from 'axios';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({ 
    roomTypeID: '', 
    roomCode: '', 
    roomName: '', 
    capacity: 8, 
    floor: 1, 
    description: '' 
  });

  const floors = [0, 1, 2, 3, 4, 5];

  // Fetch room types từ API
  const fetchRoomTypes = async () => {
    try {
      const res = await axios.get("https://localhost:7140/api/rt");
      setRoomTypes(res.data);
      // Set default room type nếu có
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, roomTypeID: res.data[0].roomTypeID }));
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi tải danh sách loại phòng!");
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get("https://localhost:7140/api/rooms");
      setRooms(res.data);
    } catch (error) {
      console.error(error);
      alert("Lỗi khi tải danh sách phòng!");
    }
  };

  useEffect(() => {
    fetchRoomTypes();
    fetchRooms();
  }, []);

  // Filter phòng
  const filteredRooms = rooms.filter((r) => {
    const matchSearch =
      r.roomCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.typeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFloor = selectedFloor === 0 || r.floor === selectedFloor;
    return matchSearch && matchFloor;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: (name === 'totalComputers' || name === 'floor' || name === 'roomTypeID') 
        ? Number(value) 
        : value 
    }));
  };

  // Tạo phòng mới
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://localhost:7140/api/rooms', formData);
      setRooms([...rooms, res.data]);
      setFormData({ 
        roomTypeID: roomTypes.length > 0 ? roomTypes[0].roomTypeID : '', 
        roomCode: '', 
        roomName: '', 
        capacity: 8, 
        floor: 1, 
        description: '' 
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Tạo phòng thất bại!');
    }
  };

  // Fetch chi tiết phòng khi click
  const handleViewRoom = async (room) => {
    try {
      const res = await axios.get(`https://localhost:7140/api/rooms/${room.roomID}`);
      setSelectedRoom(res.data);
    } catch (error) {
      console.error(error);
      alert('Lỗi khi tải chi tiết phòng!');
    }
  };

  if (selectedRoom) {
    return <RoomDetail 
      room={selectedRoom} 
      onBack={() => setSelectedRoom(null)} 
      onUpdate={(updatedRoom) => { 
        setRooms(rooms.map(r => r.roomID === updatedRoom.roomID ? updatedRoom : r)); 
        setSelectedRoom(updatedRoom); 
      }} 
    />;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .bk-code { font-family:'JetBrains Mono',monospace; font-size:12px; color:#6366f1; font-weight:600; background:#eef2ff; padding:3px 8px; border-radius:5px; display:inline-block; }
        .rm-root { min-height: 100vh; background: #f0f4f8; padding: 28px; }
        .rm-header { background: #1e293b; border-radius: 16px; padding: 28px 32px; margin-bottom: 24px; position: relative; overflow: hidden; }
        .rm-header::before { content: ''; position: absolute; top: -40px; right: -40px; width: 180px; height: 180px; background: rgba(99,102,241,0.12); border-radius: 50%; }
        .rm-header::after { content: ''; position: absolute; bottom: -30px; left: 30%; width: 120px; height: 120px; background: rgba(16,185,129,0.08); border-radius: 50%; }
        .rm-header h1 { color: #f1f5f9; font-size: 22px; font-weight: 700; margin: 0 0 4px; position: relative; z-index: 1; }
        .rm-header p { color: #94a3b8; font-size: 14px; margin: 0; position: relative; z-index: 1; }
        .rm-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 22px; }
        .rm-stat-card { background: #fff; border-radius: 12px; padding: 18px 20px; border: 1px solid #e2e8f0; }
        .rm-stat-card .stat-val { font-size: 26px; font-weight: 700; line-height: 1; margin-bottom: 4px; }
        .rm-stat-card .stat-label { font-size: 12.5px; color: #64748b; font-weight: 500; }
        .rm-stat-card .stat-icon { float: right; width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .color-blue .stat-val { color: #3b82f6; } .color-blue .stat-icon { background: #eff6ff; color: #3b82f6; }
        .color-green .stat-val { color: #10b981; } .color-green .stat-icon { background: #ecfdf5; color: #10b981; }
        .color-red .stat-val { color: #ef4444; } .color-red .stat-icon { background: #fef2f2; color: #ef4444; }
        .color-amber .stat-val { color: #f59e0b; } .color-amber .stat-icon { background: #fffbeb; color: #f59e0b; }
        .rm-toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 18px; flex-wrap: wrap; }
        .rm-search { position: relative; flex: 1; min-width: 240px; max-width: 420px; }
        .rm-search input { width: 100%; padding: 10px 16px 10px 42px; border-radius: 10px; border: 1.5px solid #e2e8f0; font-size: 13.5px; background: #fff; transition: 0.2s; outline: none; }
        .rm-search input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .rm-search .search-ic { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .rm-floor-pills { display: flex; gap: 6px; }
        .rm-floor-pill { padding: 8px 14px; border-radius: 20px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: 0.2s; }
        .rm-floor-pill:hover { border-color: #c7d2fe; background: #f5f3ff; }
        .rm-floor-pill.active { background: #6366f1; color: #fff; border-color: #6366f1; }
        .rm-create-btn { margin-left: auto; padding: 10px 22px; background: #1e293b; color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 7px; transition: 0.2s; white-space: nowrap; }
        .rm-create-btn:hover { background: #334155; box-shadow: 0 4px 12px rgba(30,41,59,0.25); }
        .rm-table-wrap { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; }
        .rm-table { width: 100%; border-collapse: collapse; }
        .rm-table thead { background: #f8fafc; }
        .rm-table th { padding: 12px 18px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
        .rm-table td { padding: 14px 18px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; color: #334155; }
        .rm-table tr:last-child td { border-bottom: none; }
        .rm-table tr:hover td { background: #fafbfd; }
        .rm-code { font-family: 'JetBrains Mono', monospace; font-size: 12.5px; color: #6366f1; font-weight: 600; background: #eef2ff; padding: 3px 8px; border-radius: 5px; }
        .rm-name { font-weight: 600; color: #1e293b; }
        .rm-status-row { display: flex; gap: 10px; }
        .rm-status-chip { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 500; }
        .rm-status-chip .dot { width: 7px; height: 7px; border-radius: 50%; }
        .dot-green { background: #10b981; } .dot-red { background: #ef4444; } .dot-amber { background: #f59e0b; }
        .rm-state-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; font-size: 12.5px; font-weight: 600; }
        .rm-state-active { background: #ecfdf5; color: #059669; }
        .rm-state-maint { background: #fffbeb; color: #d97706; }
        .rm-empty { padding: 60px 20px; text-align: center; color: #94a3b8; }
        .rm-empty svg { margin-bottom: 12px; opacity: 0.5; }
        .rm-view-btn { background: none; border: none; padding: 6px 10px; cursor: pointer; color: #6366f1; transition: 0.2s; border-radius: 6px; }
        .rm-view-btn:hover { background: #f5f3ff; }
        /* Modal */
        .rm-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(3px); animation: rmFadeIn 0.2s; }
        @keyframes rmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .rm-modal { background: #fff; border-radius: 18px; width: 90%; max-width: 560px; max-height: 88vh; overflow-y: auto; animation: rmSlideUp 0.28s cubic-bezier(.34,1.56,.64,1); box-shadow: 0 24px 48px rgba(0,0,0,0.14); }
        @keyframes rmSlideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .rm-modal-head { padding: 22px 24px 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; }
        .rm-modal-head h3 { margin: 0; font-size: 17px; color: #1e293b; font-weight: 700; }
        .rm-close-btn { background: none; border: none; padding: 4px; cursor: pointer; color: #64748b; transition: 0.2s; border-radius: 6px; }
        .rm-close-btn:hover { background: #f1f5f9; color: #1e293b; }
        .rm-modal-body { padding: 22px 24px 24px; }
        .rm-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .rm-form-group { margin-bottom: 16px; }
        .rm-form-group.full { grid-column: 1 / -1; }
        .rm-form-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .rm-form-label .req { color: #ef4444; }
        .rm-form-input { width: 100%; padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13.5px; outline: none; transition: 0.2s; background: #fff; color: #1e293b; }
        .rm-form-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .rm-form-input select, .rm-form-input.select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 34px; }
        .rm-form-actions { display: flex; gap: 10px; margin-top: 22px; }
        .rm-btn-cancel { flex: 1; padding: 10px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 9px; font-size: 13.5px; font-weight: 600; color: #475569; cursor: pointer; transition: 0.2s; }
        .rm-btn-cancel:hover { background: #f1f5f9; }
        .rm-btn-submit { flex: 1; padding: 10px; background: #1e293b; color: #fff; border: none; border-radius: 9px; font-size: 13.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: 0.2s; }
        .rm-btn-submit:hover { background: #334155; }
        textarea.rm-form-input { resize: vertical; min-height: 72px; }
        @media (max-width: 640px) { .rm-stats { grid-template-columns: repeat(2,1fr); } .rm-form-row { grid-template-columns: 1fr; } .rm-toolbar { flex-direction: column; align-items: stretch; } .rm-search { max-width: 100%; } .rm-create-btn { margin-left: 0; justify-content: center; } }
      `}</style>

      <div className="rm-root">
        <div className="rm-header">
          <h1><Layers size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />Quản lý Phòng Máy Tính</h1>
          <p>Giám sát toàn bộ phòng máy tính, theo dõi trạng thái và thiết bị</p>
        </div>

        <div className="rm-stats">
          <div className="rm-stat-card color-blue">
            <div className="stat-icon"><Monitor size={18} /></div>
            <div className="stat-val">{rooms.length}</div>
            <div className="stat-label">Tổng phòng máy</div>
          </div>
          <div className="rm-stat-card color-green">
            <div className="stat-icon"><CheckCircle2 size={18} /></div>
            <div className="stat-val">{rooms.filter(r => r.status === 'Active').length}</div>
            <div className="stat-label">Đang hoạt động</div>
          </div>
          <div className="rm-stat-card color-amber">
            <div className="stat-icon"><AlertCircle size={18} /></div>
            <div className="stat-val">{rooms.filter(r => r.status === 'Maintenance').length}</div>
            <div className="stat-label">Bảo dưỡng</div>
          </div>
          <div className="rm-stat-card color-red">
            <div className="stat-icon"><XCircle size={18} /></div>
            <div className="stat-val">{rooms.filter(r => r.status === 'Inactive').length}</div>
            <div className="stat-label">Ngưng hoạt động</div>
          </div>
        </div>

        <div className="rm-toolbar">
          <div className="rm-search">
            <Search size={16} className="search-ic" />
            <input type="text" placeholder="Tìm phòng..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>

          <div className="rm-floor-pills">
            {floors.map(f => (
              <button key={f} className={`rm-floor-pill ${selectedFloor === f ? 'active' : ''}`} onClick={() => setSelectedFloor(f)}>
                {f === 0 ? 'Tất cả' : `Tầng ${f}`}
              </button>
            ))}
          </div>

          <button className="rm-create-btn" onClick={() => setShowCreateForm(true)}><Plus size={16} />Tạo phòng</button>
        </div>

        <div className="rm-table-wrap">
          <table className="rm-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên phòng</th>
                <th>Loại</th>
                <th>Số máy</th>
                <th>Tình trạng máy</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="rm-empty">
                    <Layers size={48} /><br />
                    Không tìm thấy phòng máy nào
                  </td>
                </tr>
              ) : filteredRooms.map(room => (
                <tr key={room.roomID}>
                  <td><span className="bk-code">{room.roomCode}</span></td>
                  <td className="rm-name">{room.roomName}</td>
                  <td>{room.typeName}</td>
                  <td>{room.capacity}</td>
                  <td className="rm-status-row">
                    <span className="rm-status-chip"><span className="dot dot-green"></span> {room.activeComputers}</span>
                    <span className="rm-status-chip"><span className="dot dot-red"></span> {room.brokenComputers}</span>
                    <span className="rm-status-chip"><span className="dot dot-amber"></span> {room.maintenanceComputers}</span>
                  </td>
                  <td>
                    {room.status === 'Active' ? <span className="rm-state-badge rm-state-active">Hoạt động</span> : <span className="rm-state-badge rm-state-maint">Bảo dưỡng</span>}
                  </td>
                  <td><button className="rm-view-btn" onClick={() => handleViewRoom(room)}><Eye size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showCreateForm && (
          <div className="rm-overlay">
            <form className="rm-modal" onSubmit={handleCreateRoom}>
              <div className="rm-modal-head">
                <h3>Tạo phòng mới</h3>
                <button type="button" className="rm-close-btn" onClick={() => setShowCreateForm(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="rm-modal-body">
                <div className="rm-form-row">
                  <div className="rm-form-group">
                    <label className="rm-form-label">Mã phòng <span className="req">*</span></label>
                    <input className="rm-form-input" name="roomCode" value={formData.roomCode} onChange={handleInputChange} required />
                  </div>
                  <div className="rm-form-group">
                    <label className="rm-form-label">Tên phòng <span className="req">*</span></label>
                    <input className="rm-form-input" name="roomName" value={formData.roomName} onChange={handleInputChange} required />
                  </div>
                  <div className="rm-form-group">
                    <label className="rm-form-label">Loại phòng</label>
                    <select className="rm-form-input" name="roomTypeID" value={formData.roomTypeID} onChange={handleInputChange}>
                      {roomTypes.map(t => (
                        <option key={t.roomTypeID} value={t.roomTypeID}>
                          {t.typeName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="rm-form-group">
                    <label className="rm-form-label">Số máy</label>
                    <input type="number" className="rm-form-input" name="totalComputers" value={formData.totalComputers} onChange={handleInputChange} min={1} />
                  </div>
                  <div className="rm-form-group">
                    <label className="rm-form-label">Tầng</label>
                    <input type="number" className="rm-form-input" name="floor" value={formData.floor} onChange={handleInputChange} min={1} max={5} />
                  </div>
                  <div className="rm-form-group full">
                    <label className="rm-form-label">Mô tả</label>
                    <textarea className="rm-form-input" name="description" value={formData.description} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="rm-form-actions">
                  <button type="button" className="rm-btn-cancel" onClick={() => setShowCreateForm(false)}>Hủy</button>
                  <button type="submit" className="rm-btn-submit"><Plus size={16} /> Tạo phòng</button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}