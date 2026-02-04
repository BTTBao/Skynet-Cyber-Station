import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Layers, Edit2, Trash2, X, Tag, AlertTriangle
} from 'lucide-react';
import axios from 'axios';

const API_URL = "https://localhost:7140/api/roomtypes";

export default function RoomTypeManagement() {
  const [types, setTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ roomTypeId: 0, typeName: '', basePrice: 0 });

  // 1. Load Data
  const fetchTypes = async () => {
    try {
      const res = await axios.get(API_URL);
      setTypes(res.data);
    } catch (error) {
      console.error(error);
      alert("Lỗi tải dữ liệu!");
    }
  };

  useEffect(() => { fetchTypes(); }, []);

  // 2. Handle Save (Create / Update)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${formData.roomTypeId}`, formData);
        alert("Cập nhật thành công!");
      } else {
        const { roomTypeId, ...newData } = formData; // Bỏ ID khi tạo mới
        await axios.post(API_URL, newData);
        alert("Thêm mới thành công!");
      }
      setShowModal(false);
      fetchTypes();
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  // 3. Handle Delete (Logic chặn xóa tại Frontend)
  const handleDelete = async (id, name, usedCount) => {
    // Cảnh báo ngay tại client để đỡ phải gọi API nếu biết chắc sẽ lỗi
    if (usedCount > 0) {
      alert(`KHÔNG THỂ XÓA!\n\nLoại phòng "${name}" đang được sử dụng bởi ${usedCount} phòng.\nBạn cần vào 'Quản lý phòng' để đổi loại phòng cho các phòng đó trước.`);
      return;
    }

    if (window.confirm(`Bạn chắc chắn muốn xóa loại phòng "${name}"?`)) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchTypes();
      } catch (error) {
        alert(error.response?.data?.message || "Xóa thất bại!");
      }
    }
  };

  // Mở modal
  const openEdit = (item) => {
    setIsEditing(true);
    setFormData(item);
    setShowModal(true);
  };
  const openCreate = () => {
    setIsEditing(false);
    setFormData({ roomTypeId: 0, typeName: '', basePrice: 0 });
    setShowModal(true);
  };

  // Filter
  const filtered = types.filter(t => t.typeName.toLowerCase().includes(searchTerm.toLowerCase()));

  // Định dạng tiền tệ VNĐ
  const formatMoney = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
            <h2 style={{ margin: 0, color: '#1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
                <Layers size={24} color="#6366f1"/> Quản lý Loại Phòng
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Cấu hình danh mục và đơn giá phòng</p>
        </div>
        <button 
            onClick={openCreate}
            style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight:'600' }}>
            <Plus size={18} /> Thêm loại mới
        </button>
      </div>

      {/* TOOLBAR */}
      <div style={{ marginBottom: '16px', maxWidth: '400px' }}>
        <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
                placeholder="Tìm kiếm tên loại phòng..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
            />
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead style={{ background: '#f1f5f9' }}>
                <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569' }}>Tên Loại Phòng</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569' }}>Đơn Giá (Gợi ý)</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#475569' }}>Số phòng đang dùng</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', color: '#475569' }}>Hành động</th>
                </tr>
            </thead>
            <tbody>
                {filtered.map(item => (
                    <tr key={item.roomTypeId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px', fontWeight: '600', color: '#334155' }}>{item.typeName}</td>
                        <td style={{ padding: '14px 16px', color: '#059669', fontWeight: 'bold' }}>
                            {formatMoney(item.basePrice)}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            {/* Logic hiển thị Badge đếm số phòng */}
                            <span style={{ 
                                padding: '4px 10px', 
                                borderRadius: '20px', 
                                background: item.usedCount > 0 ? '#e0f2fe' : '#f1f5f9',
                                color: item.usedCount > 0 ? '#0284c7' : '#94a3b8',
                                fontWeight: '600', fontSize:'12px'
                            }}>
                                {item.usedCount} phòng
                            </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button onClick={() => openEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', marginRight: '8px' }} title="Sửa">
                                <Edit2 size={18} />
                            </button>
                            
                            {/* Logic ẩn hiện nút xóa hoặc làm mờ */}
                            <button 
                                onClick={() => handleDelete(item.roomTypeId, item.typeName, item.usedCount)}
                                style={{ 
                                    background: 'none', border: 'none', cursor: 'pointer', 
                                    color: item.usedCount > 0 ? '#cbd5e1' : '#ef4444', // Nếu đang dùng thì màu xám nhạt
                                }} 
                                title={item.usedCount > 0 ? "Không thể xóa vì đang có phòng sử dụng" : "Xóa"}
                            >
                                {item.usedCount > 0 ? <AlertTriangle size={18} /> : <Trash2 size={18} />}
                            </button>
                        </td>
                    </tr>
                ))}
                {filtered.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Không có dữ liệu</td></tr>
                )}
            </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <form onSubmit={handleSave} style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>{isEditing ? 'Cập nhật' : 'Thêm mới'}</h3>
                    <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Tên loại phòng</label>
                    <input 
                        required 
                        value={formData.typeName} 
                        onChange={e => setFormData({...formData, typeName: e.target.value})}
                        placeholder="Ví dụ: Phòng Thường"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline:'none' }}
                    />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Giá cơ bản (VND)</label>
                    <input 
                        required 
                        type="number" 
                        min="0"
                        value={formData.basePrice} 
                        onChange={e => setFormData({...formData, basePrice: Number(e.target.value)})}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline:'none' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: '600' }}>Hủy</button>
                    <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#1e293b', color: '#fff', cursor: 'pointer', fontWeight: '600' }}>Lưu lại</button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
}