-- ============================================
-- CHÈN DỮ LIỆU MẪU - HỆ THỐNG QUẢN LÝ CHO THUÊ PHÒNG MÁY TÍNH
-- ============================================

USE QuanLyPhongMay;
GO

-- 1. Xóa dữ liệu cũ theo đúng thứ tự (để tránh lỗi khóa ngoại)
DELETE FROM IncidentReports;
DBCC CHECKIDENT ('IncidentReports', RESEED, 0); -- Reset ID về 0

DELETE FROM Invoices;
DBCC CHECKIDENT ('Invoices', RESEED, 0);

DELETE FROM RoomBookings;
DBCC CHECKIDENT ('RoomBookings', RESEED, 0);

DELETE FROM Computers;
DBCC CHECKIDENT ('Computers', RESEED, 0);

DELETE FROM Rooms;
DBCC CHECKIDENT ('Rooms', RESEED, 0);

DELETE FROM RoomTypes;
DBCC CHECKIDENT ('RoomTypes', RESEED, 0);

DELETE FROM Users;
DBCC CHECKIDENT ('Users', RESEED, 0);

DELETE FROM Roles;
DBCC CHECKIDENT ('Roles', RESEED, 0);
GO

-- ============================================
-- 1. BẢNG ROLES (Vai trò)
-- ============================================
INSERT INTO Roles (RoleName) VALUES
(N'Admin'),      -- ID sẽ là 1
(N'Giảng viên'), -- ID sẽ là 2
(N'Sinh viên');  -- ID sẽ là 3

-- ============================================
-- 2. BẢNG USERS (Người dùng) - 35 bản ghi
-- ============================================
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, RoleID, IsStudent, IsTeacher, IsStaff, Department, Status) VALUES
-- Admin (1)
('admin.system', 'Admin@2024', N'Trần Minh Quân', 'quan.tm@university.edu.vn', '0901234567', 1, 0, 0, 1, N'Phòng Quản trị Hệ thống', N'Active'),

-- Giảng viên (10)
('gv.honglan', 'Teacher123', N'Phạm Hồng Lan', 'lan.ph@university.edu.vn', '0912345678', 2, 0, 1, 0, N'Khoa Công nghệ Thông tin', N'Active'),
('gv.ductrung', 'Teacher456', N'Lê Đức Trung', 'trung.ld@university.edu.vn', '0923456789', 2, 0, 1, 0, N'Khoa Công nghệ Thông tin', N'Active'),
('gv.thanhhuyen', 'Teacher789', N'Ngô Thanh Huyền', 'huyen.nt@university.edu.vn', '0934567890', 2, 0, 1, 0, N'Khoa Khoa học Máy tính', N'Active'),
('gv.quangminh', 'Teacher321', N'Vũ Quang Minh', 'minh.vq@university.edu.vn', '0945678901', 2, 0, 1, 0, N'Khoa Trí tuệ Nhân tạo', N'Active'),
('gv.kimoanh', 'Teacher654', N'Đặng Kim Oanh', 'oanh.dk@university.edu.vn', '0956789012', 2, 0, 1, 0, N'Khoa Đồ họa Máy tính', N'Active'),
('gv.tuananh', 'Teacher987', N'Hoàng Tuấn Anh', 'anh.ht@university.edu.vn', '0967890123', 2, 0, 1, 0, N'Khoa Công nghệ Thông tin', N'Active'),
('gv.minhchau', 'Teacher147', N'Bùi Minh Châu', 'chau.bm@university.edu.vn', '0978901234', 2, 0, 1, 0, N'Khoa An toàn Thông tin', N'Active'),
('gv.haidang', 'Teacher258', N'Trịnh Hải Đăng', 'dang.th@university.edu.vn', '0989012345', 2, 0, 1, 0, N'Khoa Hệ thống Thông tin', N'Active'),
('gv.phuongthanh', 'Teacher369', N'Lý Phương Thanh', 'thanh.lp@university.edu.vn', '0990123456', 2, 0, 1, 0, N'Khoa Công nghệ Thông tin', N'Active'),
('gv.vankhang', 'Teacher741', N'Phan Văn Khang', 'khang.pv@university.edu.vn', '0901234568', 2, 0, 1, 0, N'Khoa Khoa học Dữ liệu', N'Active'),
('gv.dinhtuan', 'Teacherf2024', N'Đỗ Đình Tuấn', 'tuan.dd@university.edu.vn', '0912345679', 2, 0, 1, 0, N'Phòng Khoa học Dữ liệu', N'Active'),
('gv.ngoclam', 'Teacher2025', N'Võ Ngọc Lâm', 'lam.vn@university.edu.vn', '0923456780', 2, 0, 1, 0, N'Phòng Công nghệ Thông tin', N'Active'),
('gv.thanhthao', 'Teacher2026', N'Dương Thanh Thảo', 'thao.dt@university.edu.vn', '0934567891', 2, 0, 1, 0, N'Phòng Đồ họa Máy tính', N'Active'),
('gv.quocbao', 'Teacher2027', N'Lưu Quốc Bảo', 'bao.lq@university.edu.vn', '0945678902', 2, 0, 1, 0, N'Phòng Kỹ thuật', N'Active'),

-- Sinh viên (20)
('sv.minhnhat', 'Student2024', N'Nguyễn Minh Nhật', 'nhat.nm@student.edu.vn', '0956789013', 3, 1, 0, 0, N'Khoa Công nghệ Thông tin', N'Active'),
('sv.thuylinh', 'Student2025', N'Trần Thùy Linh', 'linh.tt@student.edu.vn', '0967890124', 3, 1, 0, 0, N'Khoa Công nghệ Thông tin', N'Active'),
('sv.hoanglong', 'Student2026', N'Phạm Hoàng Long', 'long.ph@student.edu.vn', '0978901235', 3, 1, 0, 0, N'Khoa Khoa học Máy tính', N'Active'),
('sv.lanphuong', 'Student2027', N'Lê Lan Phương', 'phuong.ll@student.edu.vn', '0989012346', 3, 1, 0, 0, N'Khoa Trí tuệ Nhân tạo', N'Active'),
('sv.ducmanh', 'Student2028', N'Vũ Đức Mạnh', 'manh.vd@student.edu.vn', '0990123457', 3, 1, 0, 0, N'Khoa Công nghệ Thông tin', N'Active'),
('sv.kimchi', 'Student2029', N'Đào Kim Chi', 'chi.dk@student.edu.vn', '0901234569', 3, 1, 0, 0, N'Khoa Đồ họa Máy tính', N'Active'),
('sv.tiendat', 'Student2030', N'Ngô Tiến Đạt', 'dat.nt@student.edu.vn', '0912345680', 3, 1, 0, 0, N'Khoa An toàn Thông tin', N'Active'),
('sv.bichngoc', 'Student2031', N'Bùi Bích Ngọc', 'ngoc.bb@student.edu.vn', '0923456781', 3, 1, 0, 0, N'Khoa Hệ thống Thông tin', N'Active'),
('sv.quanghieu', 'Student2032', N'Hoàng Quang Hiếu', 'hieu.hq@student.edu.vn', '0934567892', 3, 1, 0, 0, N'Khoa Công nghệ Thông tin', N'Active'),
('sv.myduyen', 'Student2033', N'Phan Mỹ Duyên', 'duyen.pm@student.edu.vn', '0945678903', 3, 1, 0, 0, N'Khoa Khoa học Dữ liệu', N'Active'),
('sv.anhtu', 'Student2034', N'Lý Anh Tú', 'tu.la@student.edu.vn', '0956789014', 3, 1, 0, 0, N'Khoa Công nghệ Thông tin', N'Active'),
('sv.thanhvan', 'Student2035', N'Đinh Thanh Vân', 'van.dt@student.edu.vn', '0967890125', 3, 1, 0, 0, N'Khoa Công nghệ Thông tin', N'Active'),
('sv.haison', 'Student2036', N'Trương Hải Sơn', 'son.th@student.edu.vn', '0978901236', 3, 1, 0, 0, N'Khoa Khoa học Máy tính', N'Active'),
('sv.phuonganh', 'Student2037', N'Võ Phương Anh', 'anh.vp@student.edu.vn', '0989012347', 3, 1, 0, 0, N'Khoa Trí tuệ Nhân tạo', N'Active'),
('sv.minhtri', 'Student2038', N'Lê Minh Trí', 'tri.lm@student.edu.vn', '0990123458', 3, 1, 0, 0, N'Khoa Công nghệ Thông tin', N'Active'),
('sv.khanhnguyen', 'Student2039', N'Đặng Khánh Nguyên', 'nguyen.dk@student.edu.vn', '0901234570', 3, 1, 0, 0, N'Khoa Đồ họa Máy tính', N'Active'),
('sv.quocanh', 'Student2040', N'Nguyễn Quốc Anh', 'anh.nq@student.edu.vn', '0912345681', 3, 1, 0, 0, N'Khoa An toàn Thông tin', N'Active'),
('sv.tuyetmai', 'Student2041', N'Phạm Tuyết Mai', 'mai.pt@student.edu.vn', '0923456782', 3, 1, 0, 0, N'Khoa Hệ thống Thông tin', N'Active'),
('sv.ducthang', 'Student2042', N'Trần Đức Thắng', 'thang.td@student.edu.vn', '0934567893', 3, 1, 0, 0, N'Khoa Công nghệ Thông tin', N'Active'),
('sv.hongnhung', 'Student2043', N'Lưu Hồng Nhung', 'nhung.lh@student.edu.vn', '0945678904', 3, 1, 0, 0, N'Khoa Khoa học Dữ liệu', N'Active');

-- ============================================
-- 3. BẢNG ROOMTYPES (Loại phòng) - 5 bản ghi
-- ============================================
INSERT INTO RoomTypes (TypeName, BasePrice) VALUES
(N'Phòng Cơ bản', 15000.00),
(N'Phòng Đồ họa', 25000.00),
(N'Phòng AI & Machine Learning', 35000.00),
(N'Phòng Gaming & VR', 30000.00),
(N'Phòng Lập trình nâng cao', 20000.00);

-- ============================================
-- 4. BẢNG ROOMS (Phòng máy) - 12 bản ghi
-- ============================================
INSERT INTO Rooms (RoomTypeID, RoomCode, RoomName, Capacity, Floor, Description, Status) VALUES
(1, 'B101', N'Phòng Thực hành Cơ bản 1', 40, 1, N'Phòng máy cơ bản cho sinh viên năm nhất', N'Active'),
(1, 'B102', N'Phòng Thực hành Cơ bản 2', 40, 1, N'Phòng máy cơ bản dành cho các môn tin học đại cương', N'Active'),
(5, 'B201', N'Phòng Lập trình 1', 35, 2, N'Phòng máy trang bị đầy đủ công cụ lập trình', N'Active'),
(5, 'B202', N'Phòng Lập trình 2', 35, 2, N'Phòng máy cho các lớp lập trình nâng cao', N'Active'),
(2, 'B301', N'Phòng Đồ họa & Thiết kế', 30, 3, N'Máy cấu hình cao với card đồ họa chuyên dụng', N'Active'),
(2, 'B302', N'Phòng Multimedia', 30, 3, N'Phòng máy cho biên tập video và xử lý hình ảnh', N'Active'),
(3, 'B401', N'Phòng AI Research Lab', 25, 4, N'Phòng thí nghiệm AI với GPU mạnh mẽ', N'Active'),
(3, 'B402', N'Phòng Deep Learning', 25, 4, N'Máy trạm cao cấp cho nghiên cứu học sâu', N'Active'),
(4, 'B403', N'Phòng Gaming Lab', 20, 4, N'Phòng máy game với VR headset', N'Active'),
(1, 'B501', N'Phòng Tự học 1', 50, 5, N'Phòng máy mở cửa tự do cho sinh viên', N'Active'),
(1, 'B502', N'Phòng Tự học 2', 50, 5, N'Phòng máy tự học 24/7', N'Active'),
(5, 'B503', N'Phòng Hackathon', 30, 5, N'Phòng dành cho các cuộc thi lập trình', N'Active');

-- ============================================
-- 5. BẢNG COMPUTERS (Máy tính) - 40 bản ghi
-- ============================================
-- Phòng B101
INSERT INTO Computers (RoomID, ComputerNumber, ComputerName, Specifications, Status) VALUES
(1, 'PC-01', 'B101-PC01', N'Intel Core i3-10100, 8GB RAM, 256GB SSD, Intel UHD Graphics', N'Active'),
(1, 'PC-02', 'B101-PC02', N'Intel Core i3-10100, 8GB RAM, 256GB SSD, Intel UHD Graphics', N'Active'),
(1, 'PC-03', 'B101-PC03', N'Intel Core i3-10100, 8GB RAM, 256GB SSD, Intel UHD Graphics', N'Active'),
(1, 'PC-04', 'B101-PC04', N'Intel Core i3-10100, 8GB RAM, 256GB SSD, Intel UHD Graphics', N'Maintenance'),

-- Phòng B102
(2, 'PC-01', 'B102-PC01', N'Intel Core i3-12100, 8GB RAM, 512GB SSD, Intel UHD Graphics 730', N'Active'),
(2, 'PC-02', 'B102-PC02', N'Intel Core i3-12100, 8GB RAM, 512GB SSD, Intel UHD Graphics 730', N'Active'),
(2, 'PC-03', 'B102-PC03', N'Intel Core i3-12100, 8GB RAM, 512GB SSD, Intel UHD Graphics 730', N'Active'),

-- Phòng B201
(3, 'PC-01', 'B201-PC01', N'Intel Core i5-12400, 16GB RAM, 512GB NVMe SSD, Intel UHD Graphics 730', N'Active'),
(3, 'PC-02', 'B201-PC02', N'Intel Core i5-12400, 16GB RAM, 512GB NVMe SSD, Intel UHD Graphics 730', N'Active'),
(3, 'PC-03', 'B201-PC03', N'Intel Core i5-12400, 16GB RAM, 512GB NVMe SSD, Intel UHD Graphics 730', N'Active'),
(3, 'PC-04', 'B201-PC04', N'Intel Core i5-12400, 16GB RAM, 512GB NVMe SSD, Intel UHD Graphics 730', N'Active'),

-- Phòng B202
(4, 'PC-01', 'B202-PC01', N'AMD Ryzen 5 5600, 16GB RAM, 512GB NVMe SSD, AMD Radeon Graphics', N'Active'),
(4, 'PC-02', 'B202-PC02', N'AMD Ryzen 5 5600, 16GB RAM, 512GB NVMe SSD, AMD Radeon Graphics', N'Active'),
(4, 'PC-03', 'B202-PC03', N'AMD Ryzen 5 5600, 16GB RAM, 512GB NVMe SSD, AMD Radeon Graphics', N'Active'),

-- Phòng B301
(5, 'PC-01', 'B301-PC01', N'Intel Core i7-13700K, 32GB RAM, 1TB NVMe SSD, NVIDIA RTX 4060 Ti 8GB', N'Active'),
(5, 'PC-02', 'B301-PC02', N'Intel Core i7-13700K, 32GB RAM, 1TB NVMe SSD, NVIDIA RTX 4060 Ti 8GB', N'Active'),
(5, 'PC-03', 'B301-PC03', N'Intel Core i7-13700K, 32GB RAM, 1TB NVMe SSD, NVIDIA RTX 4060 Ti 8GB', N'Active'),
(5, 'PC-04', 'B301-PC04', N'Intel Core i7-13700K, 32GB RAM, 1TB NVMe SSD, NVIDIA RTX 4060 Ti 8GB', N'In Use'),

-- Phòng B302
(6, 'PC-01', 'B302-PC01', N'AMD Ryzen 7 7700X, 32GB RAM, 1TB NVMe SSD, NVIDIA RTX 4070 12GB', N'Active'),
(6, 'PC-02', 'B302-PC02', N'AMD Ryzen 7 7700X, 32GB RAM, 1TB NVMe SSD, NVIDIA RTX 4070 12GB', N'Active'),
(6, 'PC-03', 'B302-PC03', N'AMD Ryzen 7 7700X, 32GB RAM, 1TB NVMe SSD, NVIDIA RTX 4070 12GB', N'Active'),

-- Phòng B401
(7, 'WS-01', 'B401-WS01', N'AMD Ryzen 9 7950X, 64GB RAM, 2TB NVMe SSD, NVIDIA RTX 4090 24GB', N'Active'),
(7, 'WS-02', 'B401-WS02', N'AMD Ryzen 9 7950X, 64GB RAM, 2TB NVMe SSD, NVIDIA RTX 4090 24GB', N'Active'),
(7, 'WS-03', 'B401-WS03', N'AMD Ryzen 9 7950X, 64GB RAM, 2TB NVMe SSD, NVIDIA RTX 4090 24GB', N'Active'),
(7, 'WS-04', 'B401-WS04', N'AMD Ryzen 9 7950X, 64GB RAM, 2TB NVMe SSD, NVIDIA RTX 4090 24GB', N'In Use'),

-- Phòng B402
(8, 'WS-01', 'B402-WS01', N'Intel Core i9-13900K, 128GB RAM, 4TB NVMe SSD, NVIDIA RTX 4090 24GB', N'Active'),
(8, 'WS-02', 'B402-WS02', N'Intel Core i9-13900K, 128GB RAM, 4TB NVMe SSD, NVIDIA RTX 4090 24GB', N'Active'),
(8, 'WS-03', 'B402-WS03', N'Intel Core i9-13900K, 128GB RAM, 4TB NVMe SSD, NVIDIA RTX 4090 24GB', N'Active'),

-- Phòng B403
(9, 'GM-01', 'B403-GM01', N'Intel Core i7-13700K, 32GB RAM, 2TB SSD, NVIDIA RTX 4080 16GB + VR Ready', N'Active'),
(9, 'GM-02', 'B403-GM02', N'Intel Core i7-13700K, 32GB RAM, 2TB SSD, NVIDIA RTX 4080 16GB + VR Ready', N'Active'),
(9, 'GM-03', 'B403-GM03', N'Intel Core i7-13700K, 32GB RAM, 2TB SSD, NVIDIA RTX 4080 16GB + VR Ready', N'Active'),

-- Phòng B501
(10, 'PC-01', 'B501-PC01', N'Intel Core i5-11400, 16GB RAM, 512GB SSD, Intel UHD Graphics 730', N'Active'),
(10, 'PC-02', 'B501-PC02', N'Intel Core i5-11400, 16GB RAM, 512GB SSD, Intel UHD Graphics 730', N'Active'),
(10, 'PC-03', 'B501-PC03', N'Intel Core i5-11400, 16GB RAM, 512GB SSD, Intel UHD Graphics 730', N'Active'),
(10, 'PC-04', 'B501-PC04', N'Intel Core i5-11400, 16GB RAM, 512GB SSD, Intel UHD Graphics 730', N'Active'),
(10, 'PC-05', 'B501-PC05', N'Intel Core i5-11400, 16GB RAM, 512GB SSD, Intel UHD Graphics 730', N'Broken'),

-- Phòng B502
(11, 'PC-01', 'B502-PC01', N'AMD Ryzen 5 5500, 16GB RAM, 512GB SSD, AMD Radeon Graphics', N'Active'),
(11, 'PC-02', 'B502-PC02', N'AMD Ryzen 5 5500, 16GB RAM, 512GB SSD, AMD Radeon Graphics', N'Active'),
(11, 'PC-03', 'B502-PC03', N'AMD Ryzen 5 5500, 16GB RAM, 512GB SSD, AMD Radeon Graphics', N'Active'),

-- Phòng B503
(12, 'PC-01', 'B503-PC01', N'Intel Core i7-12700K, 32GB RAM, 1TB NVMe SSD, NVIDIA RTX 3060 12GB', N'Active'),
(12, 'PC-02', 'B503-PC02', N'Intel Core i7-12700K, 32GB RAM, 1TB NVMe SSD, NVIDIA RTX 3060 12GB', N'Active'),
(12, 'PC-03', 'B503-PC03', N'Intel Core i7-12700K, 32GB RAM, 1TB NVMe SSD, NVIDIA RTX 3060 12GB', N'Active');

-- ============================================
-- 6. BẢNG ROOMBOOKINGS (Đặt lịch) - 45 bản ghi
-- ============================================
INSERT INTO RoomBookings (UserID, RoomID, BookingDate, Purpose, NumberOfPeople, StartTime, EndTime, Status, RejectionReason) VALUES
-- Đã hoàn thành (tháng 12/2024)
(16, 3, '2024-12-15', N'Thực hành môn Lập trình C++', 30, '2024-12-15 08:00:00', '2024-12-15 10:00:00', N'Completed', NULL),
(17, 1, '2024-12-16', N'Học tin học đại cương', 35, '2024-12-16 13:00:00', '2024-12-16 15:00:00', N'Completed', NULL),
(18, 5, '2024-12-18', N'Thực hành Photoshop', 25, '2024-12-18 09:00:00', '2024-12-18 12:00:00', N'Completed', NULL),
(19, 7, '2024-12-20', N'Nghiên cứu mô hình CNN', 15, '2024-12-20 14:00:00', '2024-12-20 17:00:00', N'Completed', NULL),
(20, 2, '2024-12-22', N'Thực hành Excel nâng cao', 30, '2024-12-22 08:00:00', '2024-12-22 10:00:00', N'Completed', NULL),

-- Đã duyệt - sắp diễn ra (tháng 1/2025)
(2, 4, '2025-01-08', N'Buổi học Java Spring Boot', 32, '2025-01-08 08:00:00', '2025-01-08 11:00:00', N'Approved', NULL),
(3, 6, '2025-01-10', N'Workshop biên tập video', 28, '2025-01-10 13:00:00', '2025-01-10 16:00:00', N'Approved', NULL),
(4, 8, '2025-01-12', N'Hội thảo Deep Learning', 20, '2025-01-12 09:00:00', '2025-01-12 12:00:00', N'Approved', NULL),
(5, 9, '2025-01-15', N'Trải nghiệm VR cho sinh viên', 18, '2025-01-15 14:00:00', '2025-01-15 17:00:00', N'Approved', NULL),
(6, 3, '2025-01-17', N'Thực hành Python', 35, '2025-01-17 08:00:00', '2025-01-17 10:00:00', N'Approved', NULL),
(7, 5, '2025-01-18', N'Khóa học Adobe Illustrator', 25, '2025-01-18 13:00:00', '2025-01-18 16:00:00', N'Approved', NULL),
(8, 12, '2025-01-20', N'Cuộc thi lập trình', 30, '2025-01-20 08:00:00', '2025-01-20 18:00:00', N'Approved', NULL),
(9, 1, '2025-01-22', N'Ôn tập tin học cơ bản', 40, '2025-01-22 09:00:00', '2025-01-22 11:00:00', N'Approved', NULL),
(10, 7, '2025-01-24', N'Thử nghiệm thuật toán ML', 22, '2025-01-24 14:00:00', '2025-01-24 17:00:00', N'Approved', NULL),
(11, 2, '2025-01-25', N'Học Access Database', 30, '2025-01-25 08:00:00', '2025-01-25 10:00:00', N'Approved', NULL),

-- Đã hoàn thành (tháng 1/2025)
(21, 10, '2025-01-05', N'Tự học lập trình web', 1, '2025-01-05 18:00:00', '2025-01-05 21:00:00', N'Completed', NULL),
(22, 11, '2025-01-06', N'Làm bài tập lớn', 1, '2025-01-06 19:00:00', '2025-01-06 22:00:00', N'Completed', NULL),
(23, 3, '2025-01-07', N'Ôn thi C++', 3, '2025-01-07 15:00:00', '2025-01-07 18:00:00', N'Completed', NULL),
(24, 10, '2025-01-08', N'Học React', 1, '2025-01-08 17:00:00', '2025-01-08 20:00:00', N'Completed', NULL),
(25, 11, '2025-01-09', N'Làm đồ án tốt nghiệp', 2, '2025-01-09 14:00:00', '2025-01-09 18:00:00', N'Completed', NULL),

-- Chờ duyệt (tháng 2/2025)
(26, 5, '2025-02-05', N'Học Blender 3D', 1, '2025-02-05 13:00:00', '2025-02-05 16:00:00', N'Pending', NULL),
(27, 7, '2025-02-06', N'Nghiên cứu NLP', 5, '2025-02-06 09:00:00', '2025-02-06 12:00:00', N'Pending', NULL),
(28, 12, '2025-02-08', N'Tập huấn lập trình thi đấu', 25, '2025-02-08 08:00:00', '2025-02-08 17:00:00', N'Pending', NULL),
(29, 4, '2025-02-10', N'Thực hành Django framework', 28, '2025-02-10 13:00:00', '2025-02-10 16:00:00', N'Pending', NULL),
(30, 6, '2025-02-12', N'Chỉnh sửa video dự án', 3, '2025-02-12 14:00:00', '2025-02-12 17:00:00', N'Pending', NULL),
(31, 10, '2025-02-13', N'Ôn tập JavaScript', 1, '2025-02-13 18:00:00', '2025-02-13 21:00:00', N'Pending', NULL),
(32, 1, '2025-02-15', N'Học Word, Excel cơ bản', 2, '2025-02-15 09:00:00', '2025-02-15 11:00:00', N'Pending', NULL),
(33, 8, '2025-02-17', N'Nghiên cứu Computer Vision', 8, '2025-02-17 13:00:00', '2025-02-17 16:00:00', N'Pending', NULL),
(34, 9, '2025-02-19', N'Chơi game và test VR', 4, '2025-02-19 15:00:00', '2025-02-19 18:00:00', N'Pending', NULL),
(35, 11, '2025-02-20', N'Làm bài tập nhóm', 5, '2025-02-20 16:00:00', '2025-02-20 19:00:00', N'Pending', NULL),

-- Từ chối
(16, 9, '2025-01-28', N'Tổ chức giải game', 50, '2025-01-28 08:00:00', '2025-01-28 18:00:00', N'Rejected', N'Số lượng người vượt quá sức chứa phòng (max 20 người)'),
(17, 7, '2025-02-01', N'Sử dụng AI để tạo content', 30, '2025-02-01 09:00:00', '2025-02-01 12:00:00', N'Rejected', N'Mục đích không phù hợp với quy định sử dụng phòng học'),
(18, 8, '2025-02-03', N'Đào cryptocurrency', 10, '2025-02-03 20:00:00', '2025-02-04 08:00:00', N'Rejected', N'Hoạt động bị cấm, vi phạm quy định sử dụng thiết bị'),

-- Đã hủy
(19, 4, '2025-01-30', N'Dạy lập trình cho sinh viên', 30, '2025-01-30 13:00:00', '2025-01-30 16:00:00', N'Cancelled', NULL),
(20, 6, '2025-02-02', N'Workshop After Effects', 25, '2025-02-02 14:00:00', '2025-02-02 17:00:00', N'Cancelled', NULL),

-- Đang diễn ra hôm nay (2025-02-03)
(2, 3, '2025-02-03', N'Giảng dạy Data Structure', 35, '2025-02-03 08:00:00', '2025-02-03 11:00:00', N'Approved', NULL),
(3, 5, '2025-02-03', N'Thực hành AutoCAD', 28, '2025-02-03 13:00:00', '2025-02-03 16:00:00', N'Approved', NULL),
(4, 8, '2025-02-03', N'Training mô hình AI', 18, '2025-02-03 14:00:00', '2025-02-03 18:00:00', N'Approved', NULL),

-- Lịch tương lai gần
(5, 12, '2025-02-04', N'Workshop Git & GitHub', 30, '2025-02-04 09:00:00', '2025-02-04 12:00:00', N'Approved', NULL),
(6, 1, '2025-02-04', N'Dạy tin học văn phòng', 38, '2025-02-04 13:00:00', '2025-02-04 15:00:00', N'Approved', NULL),
(7, 9, '2025-02-05', N'Hướng dẫn Unity game development', 16, '2025-02-05 14:00:00', '2025-02-05 17:00:00', N'Approved', NULL),
(8, 7, '2025-02-06', N'Seminar về Transformers', 20, '2025-02-06 09:00:00', '2025-02-06 12:00:00', N'Approved', NULL),
(9, 2, '2025-02-07', N'Dạy PowerPoint nâng cao', 35, '2025-02-07 08:00:00', '2025-02-07 10:00:00', N'Approved', NULL),
(10, 6, '2025-02-08', N'Thực hành Premiere Pro', 26, '2025-02-08 13:00:00', '2025-02-08 16:00:00', N'Approved', NULL),
(11, 4, '2025-02-09', N'Lập trình Mobile với Flutter', 32, '2025-02-09 08:00:00', '2025-02-09 11:00:00', N'Approved', NULL);
GO

-- Chuyển các bản ghi 'Approved' nhưng diễn ra vào các ngày sau hôm nay thành 'Booked'
UPDATE RoomBookings 
SET Status = 'Booked' 
WHERE Status = 'Approved' AND CAST(StartTime AS DATE) > '2025-02-03';

-- Chuyển các bản ghi 'Approved' đang diễn ra trong ngày hôm nay thành 'InUse'
UPDATE RoomBookings 
SET Status = 'InUse' 
WHERE Status = 'Approved' AND CAST(StartTime AS DATE) = '2025-02-03';

-- Đồng bộ các giá trị khác (nếu cần chuẩn hóa viết hoa/thường)
UPDATE RoomBookings SET Status = 'Pending' WHERE Status = 'Pending';
UPDATE RoomBookings SET Status = 'Rejected' WHERE Status = 'Rejected';
UPDATE RoomBookings SET Status = 'Completed' WHERE Status = 'Completed';
UPDATE RoomBookings SET Status = 'Rejected' WHERE Status = 'Cancelled'; -- Chuyển Cancelled sang Rejected hoặc tùy chọn khác
GO

-- ============================================
-- 7. BẢNG INVOICES (Hóa đơn) - 35 bản ghi
-- ============================================
INSERT INTO Invoices (BookingID, UserID, TotalAmount, Status, Deposit, PaymentDate) VALUES
-- Đã thanh toán (tháng 12/2024)
(1, 16, 40000.00, N'Paid', 20000.00, '2024-12-14 15:30:00'),
(2, 17, 30000.00, N'Paid', 15000.00, '2024-12-15 10:20:00'),
(3, 18, 75000.00, N'Paid', 37500.00, '2024-12-17 14:15:00'),
(4, 19, 105000.00, N'Paid', 52500.00, '2024-12-19 16:45:00'),
(5, 20, 30000.00, N'Paid', 15000.00, '2024-12-21 09:30:00'),

-- Đã thanh toán (tháng 1/2025)
(6, 2, 60000.00, N'Paid', 30000.00, '2025-01-07 11:00:00'),
(7, 3, 75000.00, N'Paid', 37500.00, '2025-01-09 13:20:00'),
(8, 4, 105000.00, N'Paid', 52500.00, '2025-01-11 10:15:00'),
(9, 5, 90000.00, N'Paid', 45000.00, '2025-01-14 15:45:00'),
(10, 6, 40000.00, N'Paid', 20000.00, '2025-01-16 09:30:00'),
(11, 7, 75000.00, N'Paid', 37500.00, '2025-01-17 12:00:00'),
(12, 8, 200000.00, N'Paid', 100000.00, '2025-01-19 14:30:00'),
(13, 9, 30000.00, N'Paid', 15000.00, '2025-01-21 10:45:00'),
(14, 10, 105000.00, N'Paid', 52500.00, '2025-01-23 16:20:00'),
(15, 11, 30000.00, N'Paid', 15000.00, '2025-01-24 11:15:00'),

(16, 21, 45000.00, N'Paid', NULL, '2025-01-05 17:50:00'),
(17, 22, 45000.00, N'Paid', NULL, '2025-01-06 18:45:00'),
(18, 23, 60000.00, N'Paid', NULL, '2025-01-07 14:30:00'),
(19, 24, 45000.00, N'Paid', NULL, '2025-01-08 16:50:00'),
(20, 25, 60000.00, N'Paid', NULL, '2025-01-09 13:45:00'),

-- Chưa thanh toán - chờ duyệt
(21, 26, 75000.00, N'Not yet paid', 37500.00, NULL),
(22, 27, 105000.00, N'Not yet paid', 52500.00, NULL),
(23, 28, 180000.00, N'Not yet paid', 90000.00, NULL),
(24, 29, 60000.00, N'Not yet paid', 30000.00, NULL),
(25, 30, 75000.00, N'Not yet paid', 37500.00, NULL),
(26, 31, 45000.00, N'Not yet paid', NULL, NULL),
(27, 32, 30000.00, N'Not yet paid', NULL, NULL),
(28, 33, 105000.00, N'Not yet paid', 52500.00, NULL),
(29, 34, 90000.00, N'Not yet paid', 45000.00, NULL),
(30, 35, 45000.00, N'Not yet paid', NULL, NULL),

-- Đã hủy
(31, 19, 60000.00, N'Cancelled', 30000.00, NULL),
(32, 20, 75000.00, N'Cancelled', 37500.00, NULL),

-- Đang sử dụng hôm nay - chưa thanh toán
(33, 2, 60000.00, N'Not yet paid', 30000.00, NULL),
(34, 3, 75000.00, N'Not yet paid', 37500.00, NULL),
(35, 4, 140000.00, N'Not yet paid', 70000.00, NULL);

-- ============================================
-- 8. BẢNG INCIDENTREPORTS (Báo cáo sự cố) - 32 bản ghi
-- ============================================
INSERT INTO IncidentReports (UserID, Title, Description, Status) VALUES
-- Đã giải quyết (tháng 12/2024)
(16, N'Máy tính không khởi động được', N'Máy B101-PC04 không lên nguồn, đèn báo không sáng. Kiểm tra nguồn và mainboard.', N'Resolved'),
(17, N'Mất kết nối Internet', N'Toàn bộ phòng B102 mất kết nối mạng vào lúc 14:00 ngày 16/12.', N'Resolved'),
(18, N'Phần mềm Photoshop lỗi', N'Adobe Photoshop trên máy B301-PC02 báo lỗi khi mở file PSD lớn.', N'Resolved'),
(19, N'Màn hình bị nhấp nháy', N'Màn hình máy B201-PC05 bị nhấp nháy liên tục, có thể do cáp VGA lỏng.', N'Resolved'),
(20, N'Bàn phím không hoạt động', N'Bàn phím máy B102-PC15 không phản hồi khi gõ phím.', N'Resolved'),
(21, N'Chuột bị trôi con trỏ', N'Chuột máy B501-PC10 bị trôi con trỏ, cần thay chuột mới.', N'Resolved'),
(22, N'Máy chạy quá chậm', N'Máy B101-PC20 khởi động và chạy ứng dụng rất chậm.', N'Resolved'),
(23, N'Lỗi Windows Update', N'Máy B202-PC08 bị treo khi cập nhật Windows, không thể hoàn tất.', N'Resolved'),

-- Đang xử lý (tháng 1/2025)
(24, N'Ổ cứng báo lỗi', N'Máy B301-PC04 xuất hiện thông báo lỗi ổ cứng khi khởi động.', N'In Progress'),
(25, N'Card đồ họa không nhận diện', N'GPU trên máy B401-WS04 không được Windows nhận diện sau khi khởi động lại.', N'In Progress'),
(26, N'Máy tự động tắt nguồn', N'Máy B201-PC12 tự tắt nguồn sau 10-15 phút sử dụng.', N'In Progress'),
(27, N'Loa không có tiếng', N'Hệ thống loa trong phòng B302 không phát ra âm thanh.', N'In Progress'),
(28, N'Máy chiếu không hoạt động', N'Máy chiếu phòng B401 không hiển thị hình ảnh từ máy tính.', N'In Progress'),
(29, N'Điều hòa không mát', N'Điều hòa phòng B403 chạy nhưng không làm mát, có thể hết gas.', N'In Progress'),
(30, N'VR Headset bị lỗi tracking', N'Thiết bị VR tại máy B403-GM02 không theo dõi chuyển động chính xác.', N'In Progress'),

-- Mới báo cáo (chưa xử lý)
(31, N'Ghế xoay bị hỏng', N'Ghế tại vị trí B501-PC25 bị gãy chân, không thể ngồi được.', N'Not yet processed'),
(32, N'Bàn làm việc bị lung lay', N'Bàn số 15 phòng B502 bị lỏng vít, cần siết lại.', N'Not yet processed'),
(33, N'Ổ cắm điện không hoạt động', N'Ổ cắm điện tại hàng ghế cuối phòng B201 không có điện.', N'Not yet processed'),
(34, N'Đèn huỳnh quang hỏng', N'Một bóng đèn trong phòng B301 bị chập chờn.', N'Not yet processed'),
(35, N'Cửa phòng khó đóng', N'Cửa ra vào phòng B402 bị kẹt, khó đóng mở.', N'Not yet processed'),
(16, N'RAM bị lỗi', N'Máy B202-PC18 thường xuyên xuất hiện Blue Screen, nghi ngờ RAM bị lỗi.', N'Not yet processed'),
(17, N'Ổ DVD không đọc được đĩa', N'Ổ DVD trên máy B101-PC30 không đọc được bất kỳ đĩa nào.', N'Not yet processed'),
(18, N'Windows bị lỗi font chữ', N'Một số phần mềm trên máy B301-PC06 hiển thị ký tự lỗi (tofu).', N'Not yet processed'),
(19, N'Máy in không kết nối được', N'Máy in phòng B503 không thể kết nối từ các máy tính trong phòng.', N'Not yet processed'),
(20, N'Phần mềm Visual Studio lỗi', N'Visual Studio trên máy B201-PC20 không thể compile project C++.', N'Not yet processed'),

-- Đã đóng
(21, N'Quạt trong case kêu to', N'Quạt tản nhiệt CPU máy B401-WS01 phát ra tiếng ồn lớn.', N'Closed'),
(22, N'Bụi bẩn trong máy', N'Máy B102-PC08 cần vệ sinh bên trong do tích tụ nhiều bụi.', N'Closed'),
(23, N'Cần cài đặt thêm phần mềm', N'Yêu cầu cài đặt PyCharm cho các máy tại phòng B201.', N'Closed'),
(24, N'Cập nhật driver card đồ họa', N'Các máy phòng B301 cần cập nhật driver NVIDIA mới nhất.', N'Closed'),
(25, N'Thiếu bàn phím phụ', N'Phòng B503 thiếu 3 bàn phím dự phòng cho sự kiện.', N'Closed'),
(26, N'Yêu cầu tăng dung lượng RAM', N'Máy B402-WS05 cần nâng cấp RAM từ 64GB lên 128GB.', N'Closed'),
(27, N'Cần thay thế SSD', N'SSD trên máy B501-PC05 đã đầy, cần thay ổ dung lượng lớn hơn.', N'Closed');

GO
PRINT N'Đã chèn dữ liệu thành công!';