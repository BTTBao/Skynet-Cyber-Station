import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Users,
  Monitor,
  Clock
} from 'lucide-react';

export default function Dashboard() {
  // Dữ liệu doanh thu 7 ngày gần đây
  const revenueData = [
    { day: 'T2', revenue: 2500000, bookings: 15 },
    { day: 'T3', revenue: 2800000, bookings: 18 },
    { day: 'T4', revenue: 3200000, bookings: 22 },
    { day: 'T5', revenue: 2900000, bookings: 19 },
    { day: 'T6', revenue: 3500000, bookings: 25 },
    { day: 'T7', revenue: 4200000, bookings: 30 },
    { day: 'CN', revenue: 3800000, bookings: 28 }
  ];

  // Phòng được book nhiều nhất
  const topBookedRooms = [
    { id: 1, name: 'Phòng A101', floor: 'Tầng 1', bookings: 45, capacity: 30 },
    { id: 2, name: 'Phòng B202', floor: 'Tầng 2', bookings: 38, capacity: 25 },
    { id: 3, name: 'Phòng C303', floor: 'Tầng 3', bookings: 35, capacity: 40 },
    { id: 4, name: 'Phòng A102', floor: 'Tầng 1', bookings: 32, capacity: 30 },
    { id: 5, name: 'Phòng D404', floor: 'Tầng 4', bookings: 28, capacity: 20 }
  ];

  // Phòng doanh thu cao nhất
  const topRevenueRooms = [
    { id: 1, name: 'Phòng C303', floor: 'Tầng 3', revenue: 12500000, hours: 250 },
    { id: 2, name: 'Phòng A101', floor: 'Tầng 1', revenue: 11800000, hours: 236 },
    { id: 3, name: 'Phòng B202', floor: 'Tầng 2', revenue: 9500000, hours: 190 },
    { id: 4, name: 'Phòng D404', floor: 'Tầng 4', revenue: 8200000, hours: 164 },
    { id: 5, name: 'Phòng A102', floor: 'Tầng 1', revenue: 7900000, hours: 158 }
  ];

  // Thống kê hôm nay
  const todayStats = {
    revenue: 3800000,
    bookings: 28,
    activeRooms: 12,
    totalRooms: 20
  };

  // Tính max revenue để scale biểu đồ
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));

  // Format tiền VNĐ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <>
      <style>{`
        .stat-card {
          border-radius: 12px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .chart-container {
          height: 300px;
          position: relative;
        }
        .chart-bar {
          position: absolute;
          bottom: 40px;
          background: linear-gradient(180deg, #3b82f6 0%, #1e40af 100%);
          border-radius: 8px 8px 0 0;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .chart-bar:hover {
          background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
          transform: translateY(-5px);
        }
        .chart-label {
          position: absolute;
          bottom: 15px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
        }
        .chart-value {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          font-weight: 600;
          color: #1e40af;
          white-space: nowrap;
        }
        .table-rank {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
        }
        .rank-1 { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; }
        .rank-2 { background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%); color: white; }
        .rank-3 { background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%); color: white; }
        .rank-other { background-color: #f1f5f9; color: #64748b; }
        .progress-bar-custom {
          background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
        }
      `}</style>

      <div className="container-fluid p-4">
        {/* Thống kê hôm nay */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6 col-xl-3">
            <div className="card stat-card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <DollarSign size={24} className="text-white" />
                  </div>
                  <div className="flex-grow-1">
                    <p className="text-secondary small mb-1">Doanh thu hôm nay</p>
                    <h4 className="fw-bold mb-0">{formatCurrency(todayStats.revenue)}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <div className="card stat-card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' }}>
                    <Calendar size={24} className="text-white" />
                  </div>
                  <div className="flex-grow-1">
                    <p className="text-secondary small mb-1">Lượt book hôm nay</p>
                    <h4 className="fw-bold mb-0">{todayStats.bookings}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <div className="card stat-card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                    <Monitor size={24} className="text-white" />
                  </div>
                  <div className="flex-grow-1">
                    <p className="text-secondary small mb-1">Phòng đang hoạt động</p>
                    <h4 className="fw-bold mb-0">{todayStats.activeRooms}/{todayStats.totalRooms}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <div className="card stat-card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
                    <TrendingUp size={24} className="text-white" />
                  </div>
                  <div className="flex-grow-1">
                    <p className="text-secondary small mb-1">Tỷ lệ sử dụng</p>
                    <h4 className="fw-bold mb-0">{Math.round((todayStats.activeRooms/todayStats.totalRooms)*100)}%</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Biểu đồ doanh thu 7 ngày */}
        <div className="row g-3 mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div>
                    <h5 className="fw-bold mb-1">Doanh thu 7 ngày gần đây</h5>
                    <p className="text-secondary small mb-0">Biểu đồ thống kê doanh thu theo ngày</p>
                  </div>
                  <div className="badge bg-primary px-3 py-2">
                    <Clock size={16} className="me-2" />
                    Tuần này
                  </div>
                </div>

                <div className="chart-container">
                  <div className="position-relative h-100 d-flex align-items-end justify-content-around px-3">
                    {revenueData.map((item, index) => {
                      const height = (item.revenue / maxRevenue) * 220;
                      const width = `calc((100% - 120px) / 7)`;
                      
                      return (
                        <div 
                          key={index} 
                          className="position-relative"
                          style={{ width: width }}
                        >
                          <div 
                            className="chart-bar w-100"
                            style={{ height: `${height}px` }}
                            title={`${item.day}: ${formatCurrency(item.revenue)}`}
                          >
                            <div className="chart-value">
                              {(item.revenue / 1000000).toFixed(1)}M
                            </div>
                          </div>
                          <div className="chart-label">{item.day}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-top">
                  <div className="row text-center">
                    <div className="col-4">
                      <p className="text-secondary small mb-1">Tổng doanh thu</p>
                      <h6 className="fw-bold text-primary mb-0">
                        {formatCurrency(revenueData.reduce((sum, item) => sum + item.revenue, 0))}
                      </h6>
                    </div>
                    <div className="col-4">
                      <p className="text-secondary small mb-1">Trung bình/ngày</p>
                      <h6 className="fw-bold text-success mb-0">
                        {formatCurrency(revenueData.reduce((sum, item) => sum + item.revenue, 0) / 7)}
                      </h6>
                    </div>
                    <div className="col-4">
                      <p className="text-secondary small mb-1">Tổng lượt book</p>
                      <h6 className="fw-bold text-warning mb-0">
                        {revenueData.reduce((sum, item) => sum + item.bookings, 0)} lượt
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bảng top phòng */}
        <div className="row g-3">
          {/* Phòng được book nhiều nhất */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div>
                    <h5 className="fw-bold mb-1">Top phòng được book nhiều nhất</h5>
                    <p className="text-secondary small mb-0">Xếp hạng theo số lượt đặt phòng</p>
                  </div>
                  <div className="badge bg-info text-white px-3 py-2">
                    <Calendar size={16} />
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 text-secondary small fw-semibold" style={{ width: '60px' }}>Hạng</th>
                        <th className="border-0 text-secondary small fw-semibold">Phòng</th>
                        <th className="border-0 text-secondary small fw-semibold text-center">Sức chứa</th>
                        <th className="border-0 text-secondary small fw-semibold text-end">Lượt book</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topBookedRooms.map((room, index) => (
                        <tr key={room.id}>
                          <td>
                            <div className={`table-rank ${index < 3 ? `rank-${index + 1}` : 'rank-other'}`}>
                              {index + 1}
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="fw-semibold text-dark">{room.name}</div>
                              <div className="small text-secondary">{room.floor}</div>
                            </div>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-light text-dark">
                              <Users size={14} className="me-1" />
                              {room.capacity}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="d-flex flex-column align-items-end">
                              <span className="fw-bold text-primary">{room.bookings}</span>
                              <div className="progress" style={{ width: '100px', height: '6px' }}>
                                <div 
                                  className="progress-bar progress-bar-custom" 
                                  style={{ width: `${(room.bookings / topBookedRooms[0].bookings) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Phòng doanh thu cao nhất */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div>
                    <h5 className="fw-bold mb-1">Top phòng doanh thu cao nhất</h5>
                    <p className="text-secondary small mb-0">Xếp hạng theo tổng doanh thu</p>
                  </div>
                  <div className="badge bg-success text-white px-3 py-2">
                    <DollarSign size={16} />
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 text-secondary small fw-semibold" style={{ width: '60px' }}>Hạng</th>
                        <th className="border-0 text-secondary small fw-semibold">Phòng</th>
                        <th className="border-0 text-secondary small fw-semibold text-center">Giờ thuê</th>
                        <th className="border-0 text-secondary small fw-semibold text-end">Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topRevenueRooms.map((room, index) => (
                        <tr key={room.id}>
                          <td>
                            <div className={`table-rank ${index < 3 ? `rank-${index + 1}` : 'rank-other'}`}>
                              {index + 1}
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="fw-semibold text-dark">{room.name}</div>
                              <div className="small text-secondary">{room.floor}</div>
                            </div>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-light text-dark">
                              <Clock size={14} className="me-1" />
                              {room.hours}h
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="d-flex flex-column align-items-end">
                              <span className="fw-bold text-success">
                                {(room.revenue / 1000000).toFixed(1)}M
                              </span>
                              <div className="progress" style={{ width: '100px', height: '6px' }}>
                                <div 
                                  className="progress-bar bg-success" 
                                  style={{ width: `${(room.revenue / topRevenueRooms[0].revenue) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}