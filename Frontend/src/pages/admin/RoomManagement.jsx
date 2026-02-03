import React, { useState } from 'react';
import RoomDetail from './RoomDetail';
import {
  Search,
  Plus,
  Eye,
  X,
  Monitor,
  Layers,
  Filter,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';

const initialRooms = [
  { id: 1, code: 'PC-101', name: 'Phòng Lập Trình A', type: 'Lập trình', totalComputers: 24, floor: 1, description: 'Phòng máy tính dành cho lớp lập trình cơ bản', status: 'active', computers: Array.from({ length: 24 }, (_, i) => ({ id: i + 1, code: `PC101-${String(i + 1).padStart(2, '0')}`, brand: 'Dell OptiPlex 7090', cpu: 'Intel Core i7-10700', ram: '16GB DDR4', storage: '512GB SSD', gpu: 'Intel UHD 630', os: 'Windows 10 Pro', status: i % 5 === 0 ? 'broken' : 'active', note: i % 5 === 0 ? 'Lỗi card đồ hoạ' : '' })) },
  { id: 2, code: 'PC-102', name: 'Phòng Đồ Họa B', type: 'Đồ họa', totalComputers: 16, floor: 1, description: 'Phòng máy tính cao cấu dành cho thiết kế đồ họa', status: 'active', computers: Array.from({ length: 16 }, (_, i) => ({ id: i + 1, code: `PC102-${String(i + 1).padStart(2, '0')}`, brand: 'Apple iMac Pro', cpu: 'Intel Xeon W-2150B', ram: '32GB ECC', storage: '1TB SSD', gpu: 'AMD Radeon Pro Vega 56', os: 'macOS Big Sur', status: i === 3 || i === 7 ? 'maintenance' : 'active', note: i === 3 ? 'Đang bảo dưỡng ổĐĐa cứng' : i === 7 ? 'Cập nhật phần mềm' : '' })) },
  { id: 3, code: 'PC-201', name: 'Phòng Hệ Thống C', type: 'Hệ thống', totalComputers: 20, floor: 2, description: 'Phòng máy tính dành cho môn học hệ thống tính toán', status: 'active', computers: Array.from({ length: 20 }, (_, i) => ({ id: i + 1, code: `PC201-${String(i + 1).padStart(2, '0')}`, brand: 'Lenovo ThinkPad X1', cpu: 'Intel Core i5-10210U', ram: '8GB DDR4', storage: '256GB SSD', gpu: 'Intel UHD 620', os: 'Ubuntu 20.04 LTS', status: i === 2 || i === 10 || i === 15 ? 'broken' : 'active', note: i === 2 ? 'Không boot được' : i === 10 ? 'Ổng cứng hỏng' : i === 15 ? 'Dây cáp mất' : '' })) },
  { id: 4, code: 'PC-202', name: 'Phòng AI & ML D', type: 'AI & ML', totalComputers: 8, floor: 2, description: 'Phòng máy tính GPU cao cấu dành cho Artificial Intelligence', status: 'maintenance', computers: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, code: `PC202-${String(i + 1).padStart(2, '0')}`, brand: 'NVIDIA DGX A100', cpu: 'AMD EPYC 7742', ram: '128GB DDR4', storage: '2TB NVMe SSD', gpu: 'NVIDIA A100 80GB', os: 'Ubuntu 22.04 LTS', status: i < 2 ? 'maintenance' : 'active', note: i === 0 ? 'Nâng cấp GPU' : i === 1 ? 'Thay thế PSU' : '' })) },
  { id: 5, code: 'PC-301', name: 'Phòng Mạng Máy E', type: 'Mạng máy', totalComputers: 30, floor: 3, description: 'Phòng thực hành mạng máy tính với cấu hình server', status: 'active', computers: Array.from({ length: 30 }, (_, i) => ({ id: i + 1, code: `PC301-${String(i + 1).padStart(2, '0')}`, brand: 'HP EliteDesk 800 G8', cpu: 'Intel Core i7-10700', ram: '16GB DDR4', storage: '512GB SSD', gpu: 'Intel UHD 630', os: 'Windows Server 2022', status: i === 5 || i === 12 || i === 20 || i === 27 ? 'broken' : 'active', note: i === 5 ? 'Card mạng hỏng' : i === 12 ? 'Nguồn không ổn định' : i === 20 ? 'Lỗi BIOS' : i === 27 ? 'Cần thay RAM' : '' })) },
  { id: 6, code: 'PC-302', name: 'Phòng Cơ Sở Dữ Liệu F', type: 'Cơ sở dữ liệu', totalComputers: 18, floor: 3, description: 'Phòng thực hành quản trị cơ sở dữ liệu', status: 'active', computers: Array.from({ length: 18 }, (_, i) => ({ id: i + 1, code: `PC302-${String(i + 1).padStart(2, '0')}`, brand: 'Dell PowerEdge R740', cpu: 'Intel Xeon Gold 6248', ram: '64GB ECC DDR4', storage: '1TB SSD', gpu: 'Intel UHD', os: 'CentOS 7', status: i === 9 ? 'maintenance' : 'active', note: i === 9 ? 'Backup dữ liệu' : '' })) },
  { id: 7, code: 'PC-401', name: 'Phòng Multimedia G', type: 'Đồ họa', totalComputers: 12, floor: 4, description: 'Phòng chuyên dụng cho thiết kế multimedia và video editing', status: 'active', computers: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, code: `PC401-${String(i + 1).padStart(2, '0')}`, brand: 'Apple Mac Pro', cpu: 'AMD Ryzen Threadripper 3990X', ram: '256GB DDR4', storage: '4TB SSD', gpu: 'AMD Radeon RX 6900 XT', os: 'macOS Monterey', status: i === 1 || i === 8 ? 'broken' : 'active', note: i === 1 ? 'Không xuất HDMI' : i === 8 ? 'Quạt làm mát hỏng' : '' })) },
  { id: 8, code: 'PC-402', name: 'Phòng Thi Trực Tuyến H', type: 'Thi cử', totalComputers: 40, floor: 4, description: 'Phòng máy tính dành riêng cho thi cử trực tuyến', status: 'active', computers: Array.from({ length: 40 }, (_, i) => ({ id: i + 1, code: `PC402-${String(i + 1).padStart(2, '0')}`, brand: 'Lenovo IdeaPad 5', cpu: 'Intel Core i5-1135G7', ram: '8GB DDR4', storage: '256GB SSD', gpu: 'Intel Iris Xe 80 EUs', os: 'Windows 10 Pro', status: [3, 7, 11, 19, 25, 33].includes(i) ? 'broken' : 'active', note: [3, 7, 11, 19, 25, 33].includes(i) ? 'Cần kiểm tra' : '' })) },
  { id: 9, code: 'PC-501', name: 'Phòng Research I', type: 'Nghiên cứu', totalComputers: 10, floor: 5, description: 'Phòng máy tính dành cho các dự án nghiên cứu khoa học', status: 'active', computers: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, code: `PC501-${String(i + 1).padStart(2, '0')}`, brand: 'Supermicro X11SPH', cpu: 'Intel Xeon Platinum 8280', ram: '512GB DDR4 ECC', storage: '8TB NVMe', gpu: 'NVIDIA RTX A6000', os: 'Linux Mint 21', status: i === 4 ? 'maintenance' : 'active', note: i === 4 ? 'Nâng cấp hệ thống' : '' })) },
  { id: 10, code: 'PC-502', name: 'Phòng Cloud Computing J', type: 'Cloud', totalComputers: 6, floor: 5, description: 'Phòng thực hành cloud computing và DevOps', status: 'maintenance', computers: Array.from({ length: 6 }, (_, i) => ({ id: i + 1, code: `PC502-${String(i + 1).padStart(2, '0')}`, brand: 'Dell R750', cpu: 'Intel Xeon E5-2680 v4', ram: '128GB DDR4', storage: '2TB SSD', gpu: 'NVIDIA Tesla V100', os: 'Kubernetes / Docker', status: i < 2 ? 'maintenance' : 'active', note: i === 0 ? 'Setup cluster mới' : i === 1 ? 'Cấu hình container' : '' })) }
];

export default function RoomManagement() {
  const [rooms, setRooms] = useState(initialRooms);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({ type: 'Lập trình', code: '', name: '', totalComputers: 8, floor: 1, description: '' });

  const floors = [0, 1, 2, 3, 4, 5];
  const roomTypes = ['Lập trình', 'Đồ họa', 'Hệ thống', 'AI & ML', 'Mạng máy', 'Cơ sở dữ liệu', 'Multimedia', 'Thi cử', 'Nghiên cứu', 'Cloud'];

  const filteredRooms = rooms.filter(r => {
    const matchSearch = r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFloor = selectedFloor === 0 || r.floor === selectedFloor;
    return matchSearch && matchFloor;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'totalComputers' || name === 'floor' ? Number(value) : value }));
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    const newRoom = {
      id: rooms.length + 1,
      ...formData,
      status: 'active',
      computers: Array.from({ length: formData.totalComputers }, (_, i) => ({
        id: i + 1,
        code: `${formData.code}-${String(i + 1).padStart(2, '0')}`,
        brand: 'Dell OptiPlex 7090',
        cpu: 'Intel Core i7-10700',
        ram: '16GB DDR4',
        storage: '512GB SSD',
        gpu: 'Intel UHD 630',
        os: 'Windows 10 Pro',
        status: 'active',
        note: ''
      }))
    };
    setRooms([...rooms, newRoom]);
    setFormData({ type: 'Lập trình', code: '', name: '', totalComputers: 8, floor: 1, description: '' });
    setShowCreateForm(false);
  };

  const getComputerStats = (room) => {
    const active = room.computers.filter(c => c.status === 'active').length;
    const broken = room.computers.filter(c => c.status === 'broken').length;
    const maintenance = room.computers.filter(c => c.status === 'maintenance').length;
    return { active, broken, maintenance };
  };

  const getTypeBadge = (type) => {
    const map = { 'Lập trình': '#3b82f6', 'Đồ họa': '#ec4899', 'Hệ thống': '#8b5cf6', 'AI & ML': '#f59e0b', 'Mạng máy': '#10b981', 'Cơ sở dữ liệu': '#06b6d4', 'Multimedia': '#ef4444', 'Thi cử': '#6366f1', 'Nghiên cứu': '#14b8a6', 'Cloud': '#f97316' };
    return map[type] || '#64748b';
  };

  if (selectedRoom) {
    return <RoomDetail room={selectedRoom} onBack={() => setSelectedRoom(null)} onUpdate={(updatedRoom) => { setRooms(rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r)); setSelectedRoom(updatedRoom); }} />;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
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
        .rm-type-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #fff; }
        .rm-status-row { display: flex; gap: 10px; }
        .rm-status-chip { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 500; }
        .rm-status-chip .dot { width: 7px; height: 7px; border-radius: 50%; }
        .dot-green { background: #10b981; } .dot-red { background: #ef4444; } .dot-amber { background: #f59e0b; }
        .rm-status-chip.green { color: #059669; } .rm-status-chip.red { color: #dc2626; } .rm-status-chip.amber { color: #d97706; }
        .rm-state-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; font-size: 12.5px; font-weight: 600; }
        .rm-state-active { background: #ecfdf5; color: #059669; }
        .rm-state-maint { background: #fffbeb; color: #d97706; }
        .rm-empty { padding: 60px 20px; text-align: center; color: #94a3b8; }
        .rm-empty svg { margin-bottom: 12px; opacity: 0.5; }

        /* Modal */
        .rm-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(3px); animation: rmFadeIn 0.2s; }
        @keyframes rmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .rm-modal { background: #fff; border-radius: 18px; width: 90%; max-width: 560px; max-height: 88vh; overflow-y: auto; animation: rmSlideUp 0.28s cubic-bezier(.34,1.56,.64,1); box-shadow: 0 24px 48px rgba(0,0,0,0.14); }
        @keyframes rmSlideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .rm-modal-head { padding: 22px 24px 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; }
        .rm-modal-head h3 { margin: 0; font-size: 17px; color: #1e293b; font-weight: 700; }
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
        {/* Header */}
        <div className="rm-header">
          <h1><Layers size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />Quản lý Phòng Máy Tính</h1>
          <p>Giám sát toàn bộ phòng máy tính, theo dõi trạng thái và thiết bị</p>
        </div>

        {/* Stats */}
        <div className="rm-stats">
          <div className="rm-stat-card color-blue">
            <div className="stat-icon"><Monitor size={18} /></div>
            <div className="stat-val">{rooms.length}</div>
            <div className="stat-label">Tổng phòng máy</div>
          </div>
          <div className="rm-stat-card color-green">
            <div className="stat-icon"><CheckCircle2 size={18} /></div>
            <div className="stat-val">{rooms.filter(r => r.status === 'active').length}</div>
            <div className="stat-label">Đang hoạt động</div>
          </div>
          <div className="rm-stat-card color-red">
            <div className="stat-icon"><XCircle size={18} /></div>
            <div className="stat-val">{rooms.reduce((s, r) => s + r.computers.filter(c => c.status === 'broken').length, 0)}</div>
            <div className="stat-label">Máy hỏng</div>
          </div>
          <div className="rm-stat-card color-amber">
            <div className="stat-icon"><AlertCircle size={18} /></div>
            <div className="stat-val">{rooms.reduce((s, r) => s + r.computers.filter(c => c.status === 'maintenance').length, 0)}</div>
            <div className="stat-label">Đang bảo dưỡng</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="rm-toolbar">
          <div className="rm-search">
            <Search className="search-ic" size={17} />
            <input type="text" placeholder="Tìm kiếm phòng, mã code, loại phòng..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="rm-floor-pills">
            {floors.map(f => (
              <button key={f} className={`rm-floor-pill${selectedFloor === f ? ' active' : ''}`} onClick={() => setSelectedFloor(f)}>
                {f === 0 ? 'Tất cả' : `Tầng ${f}`}
              </button>
            ))}
          </div>
          <button className="rm-create-btn" onClick={() => setShowCreateForm(true)}>
            <Plus size={16} /> Tạo phòng mới
          </button>
        </div>

        {/* Table */}
        <div className="rm-table-wrap">
          <table className="rm-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Mã code</th>
                <th style={{ textAlign: 'center' }}>Tên phòng</th>
                <th style={{ textAlign: 'center' }}>Loại phòng</th>
                <th style={{ textAlign: 'center' }}>Số máy</th>
                <th style={{ textAlign: 'center' }}>Tình trạng máy</th>
                <th style={{ textAlign: 'center' }}>Trạng thái</th>
                <th style={{ textAlign: 'center', width: 70 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.length > 0 ? filteredRooms.map(room => {
                const stats = getComputerStats(room);
                return (
                  <tr key={room.id}>
                    <td><span className="rm-code">{room.code}</span></td>
                    <td>
                      <div className="rm-name">{room.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Tầng {room.floor}</div>
                    </td>
                    <td><span className="rm-type-badge" style={{ background: getTypeBadge(room.type) }}>{room.type}</span></td>
                    <td style={{ textAlign: 'center' }}><strong style={{ color: '#1e293b' }}>{room.totalComputers}</strong></td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="rm-status-row" style={{ textAlign: 'center' }}>
                        <span className="rm-status-chip green"><span className="dot dot-green" />{stats.active}</span>
                        {stats.broken > 0 && <span className="rm-status-chip red"><span className="dot dot-red" />{stats.broken}</span>}
                        {stats.maintenance > 0 && <span className="rm-status-chip amber"><span className="dot dot-amber" />{stats.maintenance}</span>}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`rm-state-badge ${room.status === 'active' ? 'rm-state-active' : 'rm-state-maint'}`}>
                        {room.status === 'active' ? <><CheckCircle2 size={13} /> Hoạt động</> : <><AlertCircle size={13} /> Bảo dưỡng</>}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="rm-act-btn" title="Xem chi tiết" onClick={() => setSelectedRoom(room)}>
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={7} className="rm-empty"><Monitor size={40} /><br />Không tìm thấy phòng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateForm && (
        <div className="rm-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="rm-modal" onClick={e => e.stopPropagation()}>
            <div className="rm-modal-head">
              <h3>Tạo phòng mới</h3>
              <button className="rm-modal-close" onClick={() => setShowCreateForm(false)}><X size={16} /></button>
            </div>
            <div className="rm-modal-body">
              <form onSubmit={handleCreateRoom}>
                <div className="rm-form-row">
                  <div className="rm-form-group">
                    <label className="rm-form-label">Loại phòng <span className="req">*</span></label>
                    <select className="rm-form-input select" name="type" value={formData.type} onChange={handleInputChange} required>
                      {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="rm-form-group">
                    <label className="rm-form-label">Mã code <span className="req">*</span></label>
                    <input type="text" className="rm-form-input" name="code" value={formData.code} onChange={handleInputChange} placeholder="VD: PC-601" required />
                  </div>
                  <div className="rm-form-group">
                    <label className="rm-form-label">Tên phòng <span className="req">*</span></label>
                    <input type="text" className="rm-form-input" name="name" value={formData.name} onChange={handleInputChange} placeholder="VD: Phòng Lập trình K" required />
                  </div>
                  <div className="rm-form-group">
                    <label className="rm-form-label">Số lượng máy <span className="req">*</span></label>
                    <input type="number" className="rm-form-input" name="totalComputers" value={formData.totalComputers} onChange={handleInputChange} min={1} max={60} required />
                  </div>
                  <div className="rm-form-group">
                    <label className="rm-form-label">Tầng <span className="req">*</span></label>
                    <select className="rm-form-input select" name="floor" value={formData.floor} onChange={handleInputChange} required>
                      {[1, 2, 3, 4, 5].map(f => <option key={f} value={f}>Tầng {f}</option>)}
                    </select>
                  </div>
                  <div className="rm-form-group full" style={{ gridColumn: '1 / -1' }}>
                    <label className="rm-form-label">Mô tả</label>
                    <textarea className="rm-form-input" name="description" value={formData.description} onChange={handleInputChange} placeholder="Nhập mô tả phòng..." />
                  </div>
                </div>
                <div className="rm-form-actions">
                  <button type="button" className="rm-btn-cancel" onClick={() => setShowCreateForm(false)}>Hủy</button>
                  <button type="submit" className="rm-btn-submit">Tạo phòng</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}