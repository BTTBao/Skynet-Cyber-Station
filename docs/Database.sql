-- ============================================
-- HỆ THỐNG QUẢN LÝ CHO THUÊ PHÒNG MÁY TÍNH
-- ============================================

USE master;
GO
DROP DATABASE IF EXISTS QuanLyPhongMay;
GO

CREATE DATABASE QuanLyPhongMay;
GO
USE QuanLyPhongMay;
GO

-- ============================================
-- ROLES & USERS
-- ============================================

CREATE TABLE Roles (
    RoleID INT IDENTITY PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Users (
    UserID INT IDENTITY PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PhoneNumber NVARCHAR(15),
    RoleID INT NOT NULL,
    IsStudent BIT DEFAULT 0,
    IsTeacher BIT DEFAULT 0,
    IsStaff BIT DEFAULT 0,
    Department NVARCHAR(100),
    Point INT DEFAULT 100,
    Status NVARCHAR(20) DEFAULT N'Active',
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
);

-- ============================================
-- ROOM & COMPUTER
-- ============================================

CREATE TABLE RoomTypes (
    RoomTypeID INT IDENTITY PRIMARY KEY,
    TypeName NVARCHAR(50) NOT NULL,
    BasePrice DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE Rooms (
    RoomID INT IDENTITY PRIMARY KEY,
    RoomTypeID INT NOT NULL,
    RoomCode NVARCHAR(20) NOT NULL UNIQUE,
    RoomName NVARCHAR(100) NOT NULL,
    Capacity INT NOT NULL,
    Floor INT,
    Description NVARCHAR(500),
    Status NVARCHAR(20) DEFAULT N'Active',
    FOREIGN KEY (RoomTypeID) REFERENCES RoomTypes(RoomTypeID)
);

CREATE TABLE Computers (
    ComputerID INT IDENTITY PRIMARY KEY,
    RoomID INT NOT NULL,
    ComputerNumber NVARCHAR(20),
    ComputerName NVARCHAR(100),
    Specifications NVARCHAR(500),
    Status NVARCHAR(20) DEFAULT N'Active',
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID)
);

-- ============================================
-- BOOKINGS
-- ============================================

CREATE TABLE RoomBookings (
    BookingID INT IDENTITY PRIMARY KEY,
    UserID INT NOT NULL,
    RoomID INT NOT NULL,
    BookingDate DATE NOT NULL,
    Purpose NVARCHAR(500),
    NumberOfPeople INT,
    StartTime DATETIME,
    EndTime DATETIME,
    Status NVARCHAR(20) DEFAULT N'Pending',
    RejectionReason NVARCHAR(500),
    IsUsed BIT DEFAULT 0,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID)
);

-- ============================================
-- INVOICES
-- ============================================

CREATE TABLE Invoices (
    InvoiceID INT IDENTITY PRIMARY KEY,
    BookingID INT NOT NULL,
    UserID INT NOT NULL,
    TotalAmount DECIMAL(10,2) NOT NULL,
    Status NVARCHAR(20) DEFAULT N'not yet paid',
    Deposit DECIMAL(10,2),
    PaymentDate DATETIME,
    FOREIGN KEY (BookingID) REFERENCES RoomBookings(BookingID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- ============================================
-- INCIDENT REPORTS
-- ============================================

CREATE TABLE IncidentReports (
    ReportID INT IDENTITY PRIMARY KEY,
    UserID INT NOT NULL,
    RoomID INT NOT NULL,
    Description NVARCHAR(1000) NOT NULL,
    ReportDate DATETIME DEFAULT GETDATE(),
    Status NVARCHAR(20) DEFAULT N'not yet processed',
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID)
);

-- ============================================
-- SEED DATA
-- ============================================

-- Roles
INSERT INTO Roles (RoleName)
VALUES (N'Admin'), (N'Giảng viên'), (N'Sinh viên');

-- Users
INSERT INTO Users
(Username, PasswordHash, FullName, Email, PhoneNumber, RoleID, IsStudent, IsTeacher, IsStaff, Department)
VALUES
('admin', 'hash_admin', N'Quản trị hệ thống', 'admin@uni.edu', '0900000001', 1, 0, 0, 1, N'CNTT'),
('gv01', 'hash_gv01', N'Nguyễn Văn A', 'gv01@uni.edu', '0900000002', 2, 0, 1, 0, N'CNTT'),
('gv02', 'hash_gv02', N'Trần Văn B', 'gv02@uni.edu', '0900000008', 2, 0, 1, 0, N'AI'),
('sv01', 'hash_sv01', N'Trần Thị C', 'sv01@uni.edu', '0900000003', 3, 1, 0, 0, N'CNTT'),
('sv02', 'hash_sv02', N'Lê Văn D', 'sv02@uni.edu', '0900000004', 3, 1, 0, 0, N'HTTT'),
('staff01', 'hash_staff', N'Nguyễn Văn Quản', 'staff@uni.edu', '0900000005', 1, 0, 0, 1, N'Phòng đào tạo');

-- RoomTypes
INSERT INTO RoomTypes (TypeName, BasePrice)
VALUES
(N'Phòng Cơ bản', 50000),
(N'Phòng AI', 120000),
(N'Phòng Đồ họa', 150000);

-- Rooms
INSERT INTO Rooms (RoomTypeID, RoomCode, RoomName, Capacity, Floor, Description)
VALUES
(1, 'R101', N'Phòng máy 101', 40, 1, N'Thực hành cơ bản'),
(1, 'R102', N'Phòng máy 102', 35, 1, N'Học đại cương'),
(2, 'R201', N'Phòng AI 201', 30, 2, N'GPU mạnh'),
(3, 'R301', N'Phòng Đồ họa 301', 25, 3, N'Design');

-- Computers
INSERT INTO Computers (RoomID, ComputerNumber, ComputerName, Specifications)
VALUES
(1, 'PC01', 'PC-101-01', 'Core i5, RAM 16GB'),
(1, 'PC02', 'PC-101-02', 'Core i5, RAM 16GB'),
(2, 'AI01', 'AI-201-01', 'RTX 3080, RAM 32GB'),
(2, 'AI02', 'AI-201-02', 'RTX 3090, RAM 64GB'),
(3, 'DG01', 'DG-301-01', 'RTX 3070, RAM 32GB');

-- RoomBookings
INSERT INTO RoomBookings
(UserID, RoomID, BookingDate, Purpose, NumberOfPeople, StartTime, EndTime, Status)
VALUES
(2, 3, GETDATE(), N'Dạy học AI', 28, GETDATE(), DATEADD(hour,3,GETDATE()), N'Approved'),
(4, 1, GETDATE(), N'Học thực hành', 35, GETDATE(), DATEADD(hour,2,GETDATE()), N'Pending'),
(5, 2, GETDATE(), N'Workshop AI', 30, GETDATE(), DATEADD(hour,4,GETDATE()), N'Approved');

-- Invoices
INSERT INTO Invoices
(BookingID, UserID, TotalAmount, Deposit, Status, PaymentDate)
VALUES
(1, 2, 360000, 100000, N'paid', GETDATE()),
(3, 5, 480000, 200000, N'paid', GETDATE());

-- IncidentReports
INSERT INTO IncidentReports
(UserID, RoomID, Description, Status)
VALUES
(4, 1, N'Máy PC01 không khởi động', N'not yet processed'),
(5, 2, N'Máy AI02 quá nóng', N'processing'),
(2, 3, N'Màn hình bị nhấp nháy', N'resolved');
