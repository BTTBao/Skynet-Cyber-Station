# KẾ HOẠCH CHI TIẾT  
## Bài toán nghiệp vụ: Quản lý cho thuê phòng máy trong bối cảnh giáo dục

---

## 1. Thông tin chung
- **Tên đề tài:** Hệ thống quản lý cho thuê phòng máy  
- **Bối cảnh áp dụng:** Trường đại học / cao đẳng / trung tâm đào tạo  
- **Loại hệ thống:** Hệ thống thông tin quản lý (MIS)  
- **Đối tượng sử dụng:** Quản trị viên, giảng viên, sinh viên, bộ phận quản lý phòng máy  

---

## 2. Mục tiêu nghiệp vụ
- Quản lý tập trung thông tin phòng máy và thiết bị
- Quản lý lịch cho thuê / sử dụng phòng máy
- Tránh trùng lịch, sử dụng không hiệu quả
## 8. Kế hoạch kỹ thuật mở rộng (Technical Plan)

### 8.1 Kiến trúc cơ bản phổ biến
- **Mô hình:** Client – Server, 3 lớp (Presentation → Application → Data)
- **Luồng chính:** ReactJS (UI) → ASP.NET Core Web API → SQL Server
- **Giao tiếp:** RESTful API (JSON), HTTPS

**Sơ đồ đơn giản:**
```
[ReactJS SPA] ──HTTP/HTTPS──> [ASP.NET Core Web API] ──> [SQL Server]
         ▲                           │
         └──────────── JSON ─────────┘
```

---

### 8.2 Stack công nghệ cụ thể

#### 8.2.1 Front-end (ReactJS - JavaScript)
- ReactJS (JavaScript), React Router
- Axios (gọi API)
- UI Library (tùy chọn): MUI hoặc Ant Design

**Module chính:** Auth, Rooms, Bookings, Issues, Reports, Dashboard

#### 8.2.2 Back-end (ASP.NET Core Web API)
- ASP.NET Core Web API (.NET 6/7/8)
- Entity Framework Core
- Swagger (OpenAPI)

**Cấu trúc cơ bản:** Controllers → Services → Repositories → DbContext

#### 8.2.3 Database (SQL Server)
- SQL Server 2019+ / Azure SQL
- Tối ưu với Index cho Users/Rooms/Bookings

---

### 8.3 API endpoints với RESTful design

**Base URL:** /api/v1

**Auth**
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout

**Users**
- GET /users (admin)
- GET /users/me
- PUT /users/{id}

**Rooms**
- GET /rooms
- GET /rooms/{id}
- GET /rooms/available?date=YYYY-MM-DD&slotId=1
- POST /rooms (admin)
- PUT /rooms/{id} (admin)
- PATCH /rooms/{id}/status (admin)

**Computers**
- GET /rooms/{id}/computers
- POST /rooms/{id}/computers (admin)
- PATCH /computers/{id}/status (admin/technician)

**Bookings**
- GET /bookings (filter theo role)
- GET /bookings/my
- POST /bookings
- PATCH /bookings/{id}/approve (admin)
- PATCH /bookings/{id}/reject (admin)
- PATCH /bookings/{id}/cancel
- PATCH /bookings/{id}/checkin
- PATCH /bookings/{id}/checkout

**Issues**
- GET /issues
- POST /issues
- PATCH /issues/{id}/assign (admin)
- PATCH /issues/{id}/resolve (technician)

**Reports**
- GET /reports/usage
- GET /reports/users
- GET /reports/issues

---

### 8.4 Authentication/Authorization chi tiết

**Authentication (JWT):**
- Access Token: 15 phút
- Refresh Token: 7 ngày (lưu httpOnly cookie)
- Token payload: { userId, role, exp }

**Authorization (RBAC):**
- **Admin:** toàn quyền
- **Lecturer:** tạo/cập nhật/hủy lịch của mình, xem phòng
- **Student:** tạo/hủy lịch của mình, xem phòng
- **Technician:** xem/cập nhật thiết bị, xử lý issues
- **Manager:** xem báo cáo tổng hợp

**Bảo mật tối thiểu:**
- HTTPS bắt buộc (prod)
- Validate input ở API layer
- Rate limiting cho login
- Logging/audit cho hành động nhạy cảm

---

### 8.5 Yêu cầu phi chức năng

#### 8.5.1 Performance
- API response < 300ms (95th percentile)
- Tìm phòng trống < 500ms
- Hỗ trợ 200 concurrent users

#### 8.5.2 Security
- JWT + Refresh Token
- Password hashing (BCrypt)
- Chống SQL injection (EF Core)
- CORS cấu hình rõ ràng

#### 8.5.3 Scalability
- Tách API và DB
- Có thể scale API theo chiều ngang
- Index đầy đủ cho các bảng lớn
- Error handling với try-catch
- Graceful degradation
- Transaction rollback on errors
- Data validation ở cả frontend và backend

---

## 9. Thiết kế dữ liệu chi tiết (Database Design)

### 9.1 Entity Relationship Diagram (ERD) - Mô tả quan hệ

```
Users (1) ----< (N) Bookings (N) >---- (1) Rooms
  |                    |                      |
  |                    |                      |
 (1)              (1) |                  (1)|
  |                    |                      |
  v                    v                      v
Roles             BookingLogs          Computers (N)
  |                    |                      |
  |                (1) |                  (1)|
  |                    v                      v
  |               Notifications          ComputerStatus
  |                                           |
  |                                       (N) |
  |                                           v
  +-------------------<----------------------Issues
```

### 9.2 Chi tiết các bảng (Tables)

#### Table: Users
**Mục đích:** Lưu thông tin người dùng

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| user_id | INT | PK, AUTO_INCREMENT | ID người dùng |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Tên đăng nhập |
| password_hash | VARCHAR(255) | NOT NULL | Mật khẩu đã hash (bcrypt) |
| email | VARCHAR(100) | UNIQUE, NOT NULL | Email |
| full_name | VARCHAR(100) | NOT NULL | Họ tên đầy đủ |
| phone | VARCHAR(15) | NULL | Số điện thoại |
| role_id | INT | FK → Roles, NOT NULL | Vai trò (1:Admin, 2:GV, 3:SV, 4:Kỹ thuật) |
| student_id | VARCHAR(20) | NULL | Mã sinh viên (nếu là SV) |
| department | VARCHAR(100) | NULL | Khoa/Phòng ban |
| reputation_score | INT | DEFAULT 100 | Điểm uy tín (50-150) |
| status | ENUM('active','locked','inactive') | DEFAULT 'active' | Trạng thái tài khoản |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Ngày cập nhật |
| last_login | TIMESTAMP | NULL | Lần đăng nhập cuối |

**Indexes:**
- PRIMARY KEY (user_id)
- UNIQUE INDEX idx_username (username)
- UNIQUE INDEX idx_email (email)
- INDEX idx_role (role_id)
- INDEX idx_status (status)

---

#### Table: Roles
**Mục đích:** Định nghĩa vai trò và quyền hạn

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| role_id | INT | PK, AUTO_INCREMENT | ID vai trò |
| role_name | VARCHAR(50) | UNIQUE, NOT NULL | Tên vai trò |
| description | TEXT | NULL | Mô tả vai trò |
| permissions | JSON | NULL | Quyền hạn (JSON) |

**Dữ liệu mẫu:**
- 1: Admin - Toàn quyền
- 2: Lecturer - Giảng viên
- 3: Student - Sinh viên
- 4: Technician - Kỹ thuật viên
- 5: Manager - Ban quản lý (chỉ xem báo cáo)

---

#### Table: Buildings
**Mục đích:** Quản lý tòa nhà

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| building_id | INT | PK, AUTO_INCREMENT | ID tòa nhà |
| building_code | VARCHAR(10) | UNIQUE, NOT NULL | Mã tòa (A, B, C...) |
| building_name | VARCHAR(100) | NOT NULL | Tên tòa nhà |
| address | VARCHAR(255) | NULL | Địa chỉ |
| total_floors | INT | NOT NULL | Số tầng |
| status | ENUM('active','inactive') | DEFAULT 'active' | Trạng thái |

---

#### Table: Rooms
**Mục đích:** Quản lý phòng máy

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| room_id | INT | PK, AUTO_INCREMENT | ID phòng |
| room_code | VARCHAR(20) | UNIQUE, NOT NULL | Mã phòng (A101, B205...) |
| room_name | VARCHAR(100) | NOT NULL | Tên phòng |
| building_id | INT | FK → Buildings, NOT NULL | Thuộc tòa nhà nào |
| floor | INT | NOT NULL | Tầng thứ mấy |
| capacity | INT | NOT NULL | Sức chứa (số người) |
| total_computers | INT | NOT NULL | Tổng số máy tính |
| working_computers | INT | NOT NULL | Số máy hoạt động tốt |
| description | TEXT | NULL | Mô tả phòng |
| facilities | JSON | NULL | Trang thiết bị (máy chiếu, điều hòa...) |
| image_url | VARCHAR(255) | NULL | Hình ảnh phòng |
| status | ENUM('available','occupied','maintenance','disabled') | DEFAULT 'available' | Trạng thái |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- PRIMARY KEY (room_id)
- UNIQUE INDEX idx_room_code (room_code)
- INDEX idx_building_floor (building_id, floor)
- INDEX idx_status (status)

**Constraints:**
- working_computers <= total_computers
- CHECK (working_computers >= 0)

---

#### Table: Computers
**Mục đích:** Quản lý từng máy tính trong phòng

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| computer_id | INT | PK, AUTO_INCREMENT | ID máy tính |
| room_id | INT | FK → Rooms, NOT NULL | Thuộc phòng nào |
| computer_number | VARCHAR(10) | NOT NULL | Số hiệu máy (PC01, PC02...) |
| cpu | VARCHAR(100) | NULL | CPU (Intel i5-10400...) |
| ram | VARCHAR(50) | NULL | RAM (8GB, 16GB...) |
| storage | VARCHAR(50) | NULL | Ổ cứng (512GB SSD...) |
| monitor | VARCHAR(100) | NULL | Màn hình (24" Dell...) |
| os | VARCHAR(50) | NULL | Hệ điều hành (Windows 11...) |
| installed_software | JSON | NULL | Phần mềm đã cài (JSON array) |
| purchase_date | DATE | NULL | Ngày mua |
| warranty_expire | DATE | NULL | Hết bảo hành |
| status | ENUM('good','maintenance','broken','retired') | DEFAULT 'good' | Trạng thái |
| last_maintenance | DATE | NULL | Bảo trì lần cuối |
| notes | TEXT | NULL | Ghi chú |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- PRIMARY KEY (computer_id)
- UNIQUE INDEX idx_room_computer (room_id, computer_number)
- INDEX idx_status (status)

**Trigger:** Khi update status của Computer → Update lại working_computers trong Rooms

---

#### Table: TimeSlots
**Mục đích:** Định nghĩa các ca sử dụng

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| slot_id | INT | PK, AUTO_INCREMENT | ID ca |
| slot_name | VARCHAR(50) | NOT NULL | Tên ca (Sáng, Chiều, Tối) |
| start_time | TIME | NOT NULL | Giờ bắt đầu |
| end_time | TIME | NOT NULL | Giờ kết thúc |
| description | TEXT | NULL | Mô tả |

**Dữ liệu mẫu:**
- 1: Ca Sáng - 07:00:00 - 11:00:00
- 2: Ca Chiều - 13:00:00 - 17:00:00
- 3: Ca Tối - 18:00:00 - 21:00:00

---

#### Table: Bookings
**Mục đích:** Quản lý lịch đặt phòng

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| booking_id | INT | PK, AUTO_INCREMENT | ID đặt phòng |
| booking_code | VARCHAR(20) | UNIQUE, NOT NULL | Mã booking (BK20260201001) |
| user_id | INT | FK → Users, NOT NULL | Người đặt |
| room_id | INT | FK → Rooms, NOT NULL | Phòng đã đặt |
| booking_date | DATE | NOT NULL | Ngày đặt |
| slot_id | INT | FK → TimeSlots, NOT NULL | Ca sử dụng |
| purpose | ENUM('teaching','exam','study','research','event','other') | NOT NULL | Mục đích |
| expected_participants | INT | NOT NULL | Số người dự kiến |
| special_requirements | TEXT | NULL | Yêu cầu đặc biệt |
| notes | TEXT | NULL | Ghi chú |
| status | ENUM('pending','approved','rejected','cancelled','in_use','completed','expired') | DEFAULT 'pending' | Trạng thái |
| priority | INT | DEFAULT 3 | Mức ưu tiên (1:Cao, 5:Thấp) |
| approved_by | INT | FK → Users, NULL | Người phê duyệt |
| approved_at | TIMESTAMP | NULL | Thời gian phê duyệt |
| rejection_reason | TEXT | NULL | Lý do từ chối |
| cancelled_by | INT | FK → Users, NULL | Người hủy |
| cancelled_at | TIMESTAMP | NULL | Thời gian hủy |
| cancellation_reason | TEXT | NULL | Lý do hủy |
| qr_code | VARCHAR(255) | NULL | QR code để check-in |
| actual_checkin_time | TIMESTAMP | NULL | Thời gian check-in thực tế |
| actual_checkout_time | TIMESTAMP | NULL | Thời gian check-out thực tế |
| rating | INT | NULL CHECK (rating BETWEEN 1 AND 5) | Đánh giá sau sử dụng |
| feedback | TEXT | NULL | Phản hồi |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- PRIMARY KEY (booking_id)
- UNIQUE INDEX idx_booking_code (booking_code)
- INDEX idx_user (user_id)
- INDEX idx_room_date_slot (room_id, booking_date, slot_id)
- INDEX idx_status (status)
- INDEX idx_booking_date (booking_date)

**Constraints:**
- UNIQUE (room_id, booking_date, slot_id, status) WHERE status IN ('approved', 'in_use')
  → Đảm bảo không trùng lịch

---

#### Table: RoomSchedule
**Mục đích:** Lịch phòng đã được khóa (view nhanh)

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| schedule_id | INT | PK, AUTO_INCREMENT | ID lịch |
| room_id | INT | FK → Rooms, NOT NULL | |
| booking_id | INT | FK → Bookings, UNIQUE | |
| booking_date | DATE | NOT NULL | |
| slot_id | INT | FK → TimeSlots, NOT NULL | |
| user_id | INT | FK → Users, NOT NULL | |
| purpose | VARCHAR(50) | NULL | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- PRIMARY KEY (schedule_id)
- UNIQUE INDEX idx_room_date_slot (room_id, booking_date, slot_id)

**Note:** Bảng này được insert khi booking được approve, delete khi completed/cancelled

---

#### Table: Issues
**Mục đích:** Quản lý sự cố thiết bị

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| issue_id | INT | PK, AUTO_INCREMENT | ID sự cố |
| issue_code | VARCHAR(20) | UNIQUE, NOT NULL | Mã sự cố (ISS20260201001) |
| reported_by | INT | FK → Users, NOT NULL | Người báo cáo |
| room_id | INT | FK → Rooms, NOT NULL | Phòng gặp sự cố |
| computer_id | INT | FK → Computers, NULL | Máy gặp sự cố (NULL nếu sự cố chung) |
| booking_id | INT | FK → Bookings, NULL | Liên quan đến booking nào |
| issue_type | ENUM('hardware','software','network','facility','other') | NOT NULL | Loại sự cố |
| severity | ENUM('low','medium','high','critical') | NOT NULL | Mức độ |
| title | VARCHAR(200) | NOT NULL | Tiêu đề sự cố |
| description | TEXT | NOT NULL | Mô tả chi tiết |
| image_urls | JSON | NULL | Hình ảnh minh chứng |
| status | ENUM('open','in_progress','resolved','closed') | DEFAULT 'open' | Trạng thái xử lý |
| assigned_to | INT | FK → Users, NULL | Kỹ thuật viên được giao |
| assigned_at | TIMESTAMP | NULL | |
| resolved_at | TIMESTAMP | NULL | |
| resolution_notes | TEXT | NULL | Ghi chú giải quyết |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- PRIMARY KEY (issue_id)
- INDEX idx_room (room_id)
- INDEX idx_computer (computer_id)
- INDEX idx_status (status)
- INDEX idx_severity (severity)

---

#### Table: Notifications
**Mục đích:** Quản lý thông báo cho người dùng

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| notification_id | INT | PK, AUTO_INCREMENT | |
| user_id | INT | FK → Users, NOT NULL | Người nhận |
| type | ENUM('booking','approval','reminder','system','issue') | NOT NULL | Loại thông báo |
| title | VARCHAR(200) | NOT NULL | Tiêu đề |
| message | TEXT | NOT NULL | Nội dung |
| link | VARCHAR(255) | NULL | Link liên quan |
| is_read | BOOLEAN | DEFAULT FALSE | Đã đọc chưa |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| read_at | TIMESTAMP | NULL | |

**Indexes:**
- PRIMARY KEY (notification_id)
- INDEX idx_user_read (user_id, is_read)
- INDEX idx_created (created_at)

---

#### Table: BookingLogs
**Mục đích:** Audit log cho mọi thay đổi của booking

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| log_id | INT | PK, AUTO_INCREMENT | |
| booking_id | INT | FK → Bookings, NOT NULL | |
| action | VARCHAR(50) | NOT NULL | created/approved/rejected/cancelled/checkin/checkout |
| performed_by | INT | FK → Users, NOT NULL | Người thực hiện |
| old_status | VARCHAR(20) | NULL | Trạng thái cũ |
| new_status | VARCHAR(20) | NULL | Trạng thái mới |
| notes | TEXT | NULL | Ghi chú |
| ip_address | VARCHAR(45) | NULL | IP thực hiện |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- PRIMARY KEY (log_id)
- INDEX idx_booking (booking_id)
- INDEX idx_created (created_at)

---

#### Table: MaintenanceSchedules
**Mục đích:** Lịch bảo trì định kỳ

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| maintenance_id | INT | PK, AUTO_INCREMENT | |
| room_id | INT | FK → Rooms, NOT NULL | |
| scheduled_date | DATE | NOT NULL | |
| slot_id | INT | FK → TimeSlots, NOT NULL | |
| maintenance_type | ENUM('regular','emergency','repair') | NOT NULL | |
| description | TEXT | NULL | |
| assigned_to | INT | FK → Users, NULL | |
| status | ENUM('scheduled','in_progress','completed','cancelled') | DEFAULT 'scheduled' | |
| started_at | TIMESTAMP | NULL | |
| completed_at | TIMESTAMP | NULL | |
| report | TEXT | NULL | Báo cáo sau bảo trì |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- PRIMARY KEY (maintenance_id)
- INDEX idx_room_date (room_id, scheduled_date)
- INDEX idx_status (status)

---

#### Table: Reports
**Mục đích:** Lưu các báo cáo đã tạo

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| report_id | INT | PK, AUTO_INCREMENT | |
| report_type | VARCHAR(50) | NOT NULL | usage/user/equipment/issue |
| title | VARCHAR(200) | NOT NULL | |
| date_from | DATE | NOT NULL | |
| date_to | DATE | NOT NULL | |
| generated_by | INT | FK → Users, NOT NULL | |
| file_path | VARCHAR(255) | NULL | Đường dẫn file PDF/Excel |
| data | JSON | NULL | Dữ liệu báo cáo (JSON) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

---

### 9.3 Các ràng buộc toàn vẹng (Integrity Constraints)

1. **Referential Integrity:**
   - Tất cả Foreign Keys có ON DELETE CASCADE hoặc RESTRICT tùy trường hợp
   - Ví dụ: Xóa Room → Không được (nếu có Bookings liên quan)

2. **Domain Integrity:**
   - Email: Format phải hợp lệ (CHECK hoặc validate ở application)
   - Phone: Chỉ số và dấu +
   - Dates: booking_date >= CURRENT_DATE

3. **Entity Integrity:**
   - Tất cả bảng có Primary Key AUTO_INCREMENT

4. **Business Rules Constraints:**
   - `CHECK (working_computers <= total_computers)`
   - `CHECK (expected_participants <= capacity)` (trong Bookings JOIN Rooms)
   - `CHECK (rating BETWEEN 1 AND 5)`
   - `CHECK (reputation_score BETWEEN 0 AND 200)`

### 9.4 Views (Khung nhìn)

#### View: v_available_rooms
```sql
CREATE VIEW v_available_rooms AS
SELECT 
    r.room_id, r.room_code, r.room_name,
    b.building_name, r.floor,
    r.capacity, r.working_computers,
    ROUND(r.working_computers * 100.0 / r.total_computers, 2) AS availability_rate,
    r.facilities, r.image_url
FROM Rooms r
JOIN Buildings b ON r.building_id = b.building_id
WHERE r.status = 'available'
  AND r.working_computers >= r.total_computers * 0.8;
```

#### View: v_booking_summary
```sql
CREATE VIEW v_booking_summary AS
SELECT 
    b.booking_id, b.booking_code, b.booking_date,
    u.full_name AS user_name, u.email,
    r.room_code, r.room_name,
    ts.slot_name, ts.start_time, ts.end_time,
    b.purpose, b.status,
    b.created_at
FROM Bookings b
JOIN Users u ON b.user_id = u.user_id
JOIN Rooms r ON b.room_id = r.room_id
JOIN TimeSlots ts ON b.slot_id = ts.slot_id;
```

### 9.5 Stored Procedures (Procedures quan trọng)

#### SP: sp_check_room_availability
```sql
CREATE PROCEDURE sp_check_room_availability(
    IN p_room_id INT,
    IN p_booking_date DATE,
    IN p_slot_id INT,
    OUT p_available BOOLEAN
)
BEGIN
    DECLARE booking_count INT;
    
    SELECT COUNT(*) INTO booking_count
    FROM Bookings
    WHERE room_id = p_room_id
      AND booking_date = p_booking_date
      AND slot_id = p_slot_id
      AND status IN ('approved', 'in_use');
    
    SET p_available = (booking_count = 0);
END;
```

#### SP: sp_update_reputation_score
```sql
CREATE PROCEDURE sp_update_reputation_score(
    IN p_user_id INT,
    IN p_action VARCHAR(20),  -- 'complete', 'cancel_late', 'noshow'
    IN p_points INT
)
BEGIN
    UPDATE Users
    SET reputation_score = GREATEST(0, LEAST(200, reputation_score + p_points))
    WHERE user_id = p_user_id;
    
    -- Check nếu điểm < 50 → Khóa tài khoản
    UPDATE Users
    SET status = 'locked'
    WHERE user_id = p_user_id AND reputation_score < 50;
END;
```

### 9.6 Triggers

#### Trigger: trg_update_room_working_computers
```sql
CREATE TRIGGER trg_update_room_working_computers
AFTER UPDATE ON Computers
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        UPDATE Rooms
        SET working_computers = (
            SELECT COUNT(*)
            FROM Computers
            WHERE room_id = NEW.room_id AND status = 'good'
        )
        WHERE room_id = NEW.room_id;
    END IF;
END;
```

#### Trigger: trg_create_booking_log
```sql
CREATE TRIGGER trg_create_booking_log
AFTER UPDATE ON Bookings
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO BookingLogs (booking_id, action, performed_by, old_status, new_status, created_at)
        VALUES (NEW.booking_id, CONCAT('status_change_to_', NEW.status), NEW.updated_by, OLD.status, NEW.status, NOW());
    END IF;
END;
```

### 9.7 Indexes Strategy

**Tối ưu hóa truy vấn:**
- **Bookings:** Composite index trên (room_id, booking_date, slot_id, status) → Tìm phòng trống nhanh
- **Users:** Index trên username, email → Đăng nhập/tìm kiếm nhanh
- **Issues:** Index trên (status, severity) → Dashboard kỹ thuật viên
- **Notifications:** Index trên (user_id, is_read, created_at) → Load thông báo chưa đọc

### 9.8 Backup Strategy

1. **Full Backup:** Hàng ngày vào 2:00 AM
2. **Incremental Backup:** Mỗi 6 giờ
3. **Transaction Log Backup:** Mỗi giờ
4. **Retention:** Giữ 30 ngày
5. **Test Restore:** Hàng tuần
---
## Kết luận
Hệ thống quản lý cho thuê phòng máy giúp nâng cao hiệu quả sử dụng tài nguyên, giảm sai sót thủ công và hỗ trợ công tác quản lý trong môi trường giáo dục.
