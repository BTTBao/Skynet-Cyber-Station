-- ============================================
-- HỆ THỐNG QUẢN LÝ CHO THUÊ PHÒNG MÁY TÍNH
-- ============================================
use master;
go
drop database if exists QuanLyPhongMay;
go
-- Tạo database
CREATE DATABASE QuanLyPhongMay;
GO

USE QuanLyPhongMay;
GO

-- ============================================
-- BẢNG NGƯỜI DÙNG VÀ PHÂN QUYỀN
-- ============================================

-- Bảng vai trò
CREATE TABLE Roles (
    RoleID INT PRIMARY KEY IDENTITY(1,1),
    RoleName NVARCHAR(50) NOT NULL UNIQUE,
);

-- Bảng người dùng
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PhoneNumber NVARCHAR(15),
    RoleID INT NOT NULL,
    IsStudent BIT DEFAULT 0,   -- Sinh viên
    IsTeacher BIT DEFAULT 0,   -- Giảng viên
    IsStaff BIT DEFAULT 0,   -- Cán bộ / Admin
    Department NVARCHAR(100),
    Point INT DEFAULT 100,        -- Điểm tích lũy
    Status NVARCHAR(20) DEFAULT N'Active',
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
);


-- ============================================
-- BẢNG PHÒNG VÀ MÁY TÍNH
-- ============================================

CREATE TABLE RoomTypes (
    RoomTypeID INT PRIMARY KEY IDENTITY(1,1),
    TypeName NVARCHAR(50) NOT NULL, -- Ví dụ: Phòng AI, Phòng Cơ bản, Phòng Đồ họa
    BasePrice DECIMAL(10,2) DEFAULT 0 -- Giá cơ bản mỗi giờ
);

-- Bảng phòng máy
CREATE TABLE Rooms (
    RoomID INT PRIMARY KEY IDENTITY(1,1),
	RoomTypeID INT NOT NULL,
    RoomCode NVARCHAR(20) NOT NULL UNIQUE,
    RoomName NVARCHAR(100) NOT NULL,
    Capacity INT NOT NULL, -- Số lượng máy
    Floor INT,
    Description NVARCHAR(500),
    Status NVARCHAR(20) DEFAULT N'Active',
	FOREIGN KEY (RoomTypeID) REFERENCES RoomTypes(RoomTypeID)
);

-- Bảng máy tính
CREATE TABLE Computers (
    ComputerID INT PRIMARY KEY IDENTITY(1,1),
    RoomID INT NOT NULL,
    ComputerNumber NVARCHAR(20),
    ComputerName NVARCHAR(100),
    Specifications NVARCHAR(500), -- Thông số kỹ thuật
    Status NVARCHAR(20) DEFAULT N'Active', -- Sẵn sàng, Đang sử dụng, Bảo trì, Hỏng
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID)
);

-- ============================================
-- BẢNG ĐẶT LỊCH VÀ THUÊ PHÒNG
-- ============================================

-- Bảng đặt lịch thuê phòng
CREATE TABLE RoomBookings (
    BookingID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    RoomID INT NOT NULL,
    BookingDate DATE NOT NULL,
    Purpose NVARCHAR(500), -- Mục đích sử dụng
    NumberOfPeople INT,
	StartTime DATETIME,
	EndTime DATETIME,
    Status NVARCHAR(20) DEFAULT N'Pending', -- Chờ duyệt, Đã duyệt, Từ chối, Đã hủy, Hoàn thành
    RejectionReason NVARCHAR(500),
	IsUsed BIT DEFAULT 0,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID),
);


-- ============================================
-- BẢNG THANH TOÁN VÀ HÓA ĐƠN
-- ============================================

-- Bảng hóa đơn
CREATE TABLE Invoices (
    InvoiceID INT PRIMARY KEY IDENTITY(1,1),
    BookingID INT NOT NULL,
    UserID INT NOT NULL,
    TotalAmount DECIMAL(10,2) NOT NULL,
    Status NVARCHAR(20) DEFAULT N'not yet paid', -- Chưa thanh toán, Đã thanh toán, Đã hủy
    Deposit DECIMAL(10,2), -- Tiền cọc
    PaymentDate DATETIME,
    FOREIGN KEY (BookingID) REFERENCES RoomBookings(BookingID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- ============================================
-- BẢNG BÁO CÁO SỰ CỐ
-- ============================================

-- Bảng báo cáo sự cố
CREATE TABLE IncidentReports (
    ReportID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NOT NULL,
    Status NVARCHAR(20) DEFAULT N'not yet processed', -- Mới, Đang xử lý, Đã giải quyết, Đã đóng
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
);

INSERT INTO Roles (RoleName)
VALUES (N'Admin'), (N'Giảng viên'), (N'Sinh viên');

-- Users
INSERT INTO Users
(Username, PasswordHash, FullName, Email, PhoneNumber, RoleID, IsStudent, IsTeacher, IsStaff, Department)
VALUES
('admin', 'hash_admin', N'Quản trị hệ thống', 'admin@uni.edu', '0900000001', 1, 0, 0, 1, N'CNTT'),
('gv01', 'hash_teacher', N'Nguyễn Văn A', 'gv01@uni.edu', '0900000002', 2, 0, 1, 0, N'CNTT'),
('sv01', 'hash_student', N'Trần Thị B', 'sv01@uni.edu', '0900000003', 3, 1, 0, 0, N'Khoa học máy tính');

-- RoomTypes
INSERT INTO RoomTypes (TypeName, BasePrice)
VALUES
(N'Phòng Cơ bản', 50000),
(N'Phòng AI', 120000),
(N'Phòng Đồ họa', 150000);

-- Rooms
INSERT INTO Rooms (RoomTypeID, RoomCode, RoomName, Capacity, Floor, Description)
VALUES
(1, 'R101', N'Phòng máy 101', 40, 1, N'Phòng thực hành cơ bản'),
(2, 'R201', N'Phòng AI 201', 30, 2, N'Phòng GPU'),
(3, 'R301', N'Phòng Đồ họa 301', 25, 3, N'Phòng thiết kế');

-- Computers
INSERT INTO Computers (RoomID, ComputerNumber, ComputerName, Specifications)
VALUES
(1, 'PC01', 'PC-101-01', 'Core i5, RAM 16GB'),
(1, 'PC02', 'PC-101-02', 'Core i5, RAM 16GB'),
(2, 'AI01', 'AI-201-01', 'RTX 3080, RAM 32GB'),
(3, 'DG01', 'DG-301-01', 'RTX 3070, RAM 32GB');

-- RoomBookings
INSERT INTO RoomBookings
(UserID, RoomID, BookingDate, Purpose, NumberOfPeople, StartTime, EndTime, Status)
VALUES
(2, 2, GETDATE(), N'Dạy học AI', 25, GETDATE(), DATEADD(hour, 3, GETDATE()), N'Approved'),
(3, 1, GETDATE(), N'Học thực hành', 30, GETDATE(), DATEADD(hour, 2, GETDATE()), N'Pending');

-- Invoices
INSERT INTO Invoices
(BookingID, UserID, TotalAmount, Deposit, Status)
VALUES
(1, 2, 360000, 100000, N'paid');

-- IncidentReports
INSERT INTO IncidentReports
(UserID, Title, Description)
VALUES
(3, N'Máy không khởi động', N'Máy PC01 không lên nguồn');



