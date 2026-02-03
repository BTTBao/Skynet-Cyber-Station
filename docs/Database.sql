-- ============================================
-- HỆ THỐNG QUẢN LÝ CHO THUÊ PHÒNG MÁY TÍNH
-- ============================================

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
    IsStaff   BIT DEFAULT 0,   -- Cán bộ / Admin
    Department NVARCHAR(100),
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



