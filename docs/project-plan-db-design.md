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
- Theo dõi tình trạng phòng máy, thiết bị
- Hỗ trợ thống kê, báo cáo phục vụ quản lý

---

## 3. Phạm vi nghiệp vụ (Business Scope)

### 3.1 Trong phạm vi
- Quản lý phòng máy
- Quản lý người thuê (giảng viên, sinh viên, đơn vị)
- Đặt lịch thuê phòng
- Phê duyệt / hủy lịch thuê
- Thống kê, báo cáo

### 3.2 Ngoài phạm vi
- Thanh toán trực tuyến
- Quản lý tài chính kế toán chi tiết
- Bảo trì phần cứng chuyên sâu

---

## 4. Stakeholders & Actors

| Nhóm | Vai trò |
|----|----|
| Ban quản lý | Quyết định, phê duyệt |
| Quản trị viên | Quản lý hệ thống |
| Giảng viên | Đăng ký thuê phòng |
| Sinh viên | Đăng ký thuê phòng |
| Kỹ thuật viên | Theo dõi tình trạng phòng |

---

## 5. Phân tích nghiệp vụ (Business Analysis)

### 5.1 Vấn đề hiện tại (As-Is)
- Quản lý bằng Excel / giấy tờ
- Dễ trùng lịch phòng
- Khó tổng hợp báo cáo
- Không theo dõi được lịch sử sử dụng

### 5.2 Nhu cầu nghiệp vụ (Business Needs)
- Hệ thống tập trung
- Tra cứu lịch phòng theo thời gian thực
- Quản lý trạng thái phòng
- Lưu vết lịch sử sử dụng

---

## 6. Quy trình nghiệp vụ chi tiết (To-Be – Business Process)

### 6.1 Quy trình đăng ký và sử dụng phòng máy (End-to-End)

```
[Người dùng] → [Đăng nhập] → [Tìm kiếm phòng] → [Đăng ký thuê]
                                        ↓
                              [Hệ thống tạo yêu cầu]
                                        ↓
                              [Gửi thông báo Admin]
                                        ↓
[Admin] → [Xem danh sách yêu cầu] → [Xét duyệt]
                            ↓           ↓
                        [Phê duyệt]  [Từ chối]
                            ↓           ↓
                    [Khóa lịch phòng]  [Thông báo lý do]
                            ↓
                    [Thông báo người dùng]
                            ↓
[Người dùng] → [Đến phòng đúng giờ] → [Check-in bằng QR]
                            ↓
                    [Hệ thống xác nhận] → [Sử dụng phòng]
                                        ↓
                    [Kết thúc] → [Check-out] → [Đánh giá]
                                        ↓
                    [Hệ thống cập nhật] → [Giải phóng phòng]
                                        ↓
                              [Lưu lịch sử & Thống kê]
```

### 6.2 Quy trình chi tiết từng bước

#### Bước 1: Đăng nhập và xác thực
- **Input:** Username, Password
- **Xử lý:** kiểm tra tài khoản, mật khẩu, trạng thái, tạo JWT
- **Output:** Token, Thông tin user, Quyền hạn

#### Bước 2: Tìm kiếm phòng khả dụng
- **Input:** Ngày, Ca, Số lượng máy cần, Bộ lọc
- **Xử lý:** loại phòng trùng lịch, phòng bảo trì
- **Output:** Danh sách phòng khả dụng

#### Bước 3: Tạo yêu cầu thuê phòng
- **Input:** phòng, ngày, ca, mục đích, số người, yêu cầu đặc biệt
- **Validate:** thời gian đăng ký trước, không trùng lịch, giới hạn số yêu cầu
- **Output:** Booking ID, trạng thái "Pending"

#### Bước 4: Phê duyệt yêu cầu
- **Input:** Booking ID, Approve/Reject
- **Xử lý:** cập nhật trạng thái, khóa lịch phòng, gửi thông báo

#### Bước 5: Check-in
- **Input:** QR code/Booking code
- **Xử lý:** kiểm tra hợp lệ, cập nhật trạng thái "In Use"

#### Bước 6: Sử dụng & báo cáo sự cố
- Ghi nhận sự cố trong bảng Issues

#### Bước 7: Check-out
- **Output:** hoàn thành booking, giải phóng phòng

#### Bước 8: Hủy lịch (Optional)
- **Xử lý:** cập nhật trạng thái "Cancelled", trừ điểm uy tín

---

## 7. Kế hoạch kỹ nghiệp vụ (Business Plan)

### 7.1 Các Use Case chi tiết

#### UC01: Quản lý phòng máy
**Mô tả:** Quản trị viên quản lý thông tin phòng máy  
**Actor:** Quản trị viên  
**Luồng chính:**
1. Đăng nhập với quyền quản trị viên
2. Truy cập module quản lý phòng máy
3. Thực hiện các thao tác:
    - Thêm phòng máy mới (mã phòng, tên, tầng, tòa nhà, sức chứa, mô tả)
    - Sửa thông tin phòng máy
    - Vô hiệu hóa/Kích hoạt phòng máy
    - Xem danh sách phòng máy (filter, search, pagination)
    - Xem chi tiết phòng máy và danh sách máy tính trong phòng
4. Hệ thống lưu thông tin và hiển thị kết quả

**Luồng thay thế:**
- A1: Mã phòng đã tồn tại → Thông báo lỗi
- A2: Phòng đang có lịch thuê → Không cho phép vô hiệu hóa

**Tiền điều kiện:** Người dùng đã đăng nhập với quyền quản trị viên  
**Hậu điều kiện:** Dữ liệu phòng máy được cập nhật trong hệ thống

---

#### UC02: Quản lý máy tính trong phòng
**Mô tả:** Quản lý chi tiết từng máy tính trong phòng  
**Actor:** Quản trị viên, Kỹ thuật viên  
**Luồng chính:**
1. Chọn phòng máy cần quản lý
2. Xem danh sách máy tính trong phòng
3. Thực hiện thao tác:
    - Thêm máy tính (số hiệu, cấu hình CPU, RAM, HDD, monitor, trạng thái)
    - Sửa thông tin máy tính
    - Cập nhật trạng thái (Hoạt động tốt/Đang bảo trì/Hỏng hóc)
    - Ghi chú sự cố
4. Hệ thống cập nhật và thông báo

**Business Rules:**
- Số lượng máy trong phòng không vượt quá sức chứa
- Khi số máy hỏng > 30% tổng số máy → Phòng tự động chuyển trạng thái "Cần bảo trì"

---

#### UC03: Đăng ký thuê phòng
**Mô tả:** Người dùng đăng ký thuê phòng máy  
**Actor:** Giảng viên, Sinh viên  
**Luồng chính:**
1. Đăng nhập hệ thống
2. Truy cập chức năng "Đặt phòng"
3. Chọn tiêu chí tìm kiếm:
    - Ngày thuê
    - Ca sử dụng (Sáng 7h-11h, Chiều 13h-17h, Tối 18h-21h)
    - Số lượng máy cần
    - Tòa nhà/Tầng (tùy chọn)
4. Hệ thống hiển thị danh sách phòng khả dụng
5. Chọn phòng và điền thông tin:
    - Mục đích sử dụng (Học tập/Thi cử/Nghiên cứu/Sự kiện)
    - Số lượng người dự kiến
    - Yêu cầu phần mềm đặc biệt (nếu có)
    - Ghi chú bổ sung
6. Xác nhận đăng ký
7. Hệ thống tạo yêu cầu với trạng thái "Chờ duyệt"
8. Gửi email thông báo cho người đăng ký và quản trị viên

**Luồng thay thế:**
- A1: Không có phòng trống → Hiển thị thông báo, đề xuất ca/ngày khác
- A2: Vi phạm quy định đăng ký trước tối thiểu → Thông báo lỗi
- A3: Người dùng đã có lịch trùng giờ → Cảnh báo xung đột

**Tiền điều kiện:** 
- Người dùng đã xác thực tài khoản
- Tài khoản không bị khóa

**Hậu điều kiện:** 
- Yêu cầu thuê phòng được tạo trong hệ thống
- Thông báo được gửi đến các bên liên quan

---

#### UC04: Phê duyệt/Từ chối yêu cầu thuê phòng
**Mô tả:** Quản trị viên xét duyệt yêu cầu  
**Actor:** Quản trị viên  
**Luồng chính:**
1. Đăng nhập với quyền quản trị viên
2. Xem danh sách yêu cầu chờ duyệt
3. Xem chi tiết yêu cầu:
    - Thông tin người đăng ký
    - Lịch sử thuê phòng của người này
    - Thông tin phòng và thời gian
    - Mục đích sử dụng
4. Quyết định:
    - **Phê duyệt:** Yêu cầu chuyển sang "Đã duyệt", phòng bị khóa lịch
    - **Từ chối:** Nhập lý do từ chối, yêu cầu chuyển sang "Đã từ chối"
5. Hệ thống gửi email thông báo kết quả cho người đăng ký
6. Cập nhật lịch phòng

**Business Rules:**
- Yêu cầu phải được xử lý trong vòng 24h
- Quá 24h không xử lý → Tự động chuyển sang "Hết hạn"
- Giảng viên được ưu tiên duyệt hơn sinh viên trong trường hợp xung đột

---

#### UC05: Hủy lịch đã đăng ký
**Mô tả:** Người dùng hoặc quản trị viên hủy lịch đã đặt  
**Actor:** Giảng viên, Sinh viên, Quản trị viên  
**Luồng chính:**
1. Truy cập "Lịch của tôi"
2. Chọn lịch cần hủy (trạng thái "Đã duyệt" hoặc "Chờ duyệt")
3. Nhấn "Hủy lịch", nhập lý do
4. Xác nhận hủy
5. Hệ thống:
    - Cập nhật trạng thái thành "Đã hủy"
    - Giải phóng lịch phòng
    - Gửi thông báo cho các bên liên quan

**Business Rules:**
- Chỉ được hủy trước thời gian sử dụng tối thiểu 2 giờ
- Hủy quá 3 lần trong tháng → Tài khoản bị cảnh cáo
- Quản trị viên có thể hủy bất kỳ lúc nào với lý do hợp lệ

---

#### UC06: Check-in/Check-out phòng máy
**Mô tả:** Xác nhận sử dụng phòng thực tế  
**Actor:** Giảng viên, Sinh viên, Kỹ thuật viên  
**Luồng chính:**
1. **Check-in:**
    - Người dùng đến phòng đúng giờ
    - Quét QR code tại phòng hoặc nhập mã phòng
    - Hệ thống xác nhận lịch hợp lệ
    - Trạng thái chuyển "Đang sử dụng"
    - Ghi nhận thời gian check-in thực tế

2. **Check-out:**
    - Khi kết thúc, người dùng check-out
    - Đánh giá tình trạng phòng máy (tốt/có sự cố)
    - Ghi chú sự cố nếu có
    - Hệ thống ghi nhận thời gian check-out
    - Trạng thái chuyển "Hoàn thành"

**Luồng thay thế:**
- A1: Đến muộn quá 15 phút không check-in → Lịch tự động hủy
- A2: Không check-out → Sau thời gian kết thúc + 30 phút tự động check-out

---

#### UC07: Báo cáo sự cố thiết bị
**Mô tả:** Người dùng báo cáo sự cố trong quá trình sử dụng  
**Actor:** Giảng viên, Sinh viên, Kỹ thuật viên  
**Luồng chính:**
1. Trong phiên sử dụng, phát hiện sự cố
2. Truy cập "Báo cáo sự cố"
3. Chọn máy/thiết bị gặp sự cố
4. Mô tả sự cố (text, upload ảnh)
5. Đánh giá mức độ (Nhẹ/Trung bình/Nghiêm trọng)
6. Gửi báo cáo
7. Hệ thống:
    - Tạo ticket sự cố
    - Thông báo cho kỹ thuật viên
    - Cập nhật trạng thái thiết bị nếu nghiêm trọng

---

#### UC08: Xem lịch sử sử dụng
**Mô tả:** Xem lịch sử thuê phòng của bản thân hoặc toàn hệ thống  
**Actor:** Tất cả người dùng, Quản trị viên  
**Luồng chính:**
1. Truy cập "Lịch sử"
2. **Người dùng thường:** Xem lịch sử của bản thân
3. **Quản trị viên:** Xem toàn bộ, filter theo:
    - Người dùng
    - Phòng máy
    - Khoảng thời gian
    - Trạng thái
4. Xuất báo cáo Excel/PDF

---

#### UC09: Thống kê và báo cáo
**Mô tả:** Tạo các báo cáo phân tích  
**Actor:** Quản trị viên, Ban quản lý  
**Các loại báo cáo:**
1. **Báo cáo sử dụng phòng máy:**
    - Tỷ lệ sử dụng theo phòng
    - Phòng hot nhất/ít dùng nhất
    - Biểu đồ sử dụng theo thời gian

2. **Báo cáo người dùng:**
    - Top người dùng thuê nhiều nhất
    - Tỷ lệ hủy lịch
    - Điểm uy tín người dùng

3. **Báo cáo thiết bị:**
    - Tình trạng thiết bị
    - Tần suất sự cố
    - Chi phí bảo trì (nếu có)

4. **Báo cáo theo mục đích:**
    - Phân bổ theo mục đích sử dụng
    - Thời gian sử dụng trung bình

**Output:** Dashboard, Excel, PDF

---

### 7.2 Business Rules chi tiết

#### Quy định về thời gian
1. **Thời gian đăng ký trước:**
    - Sinh viên: Tối thiểu 24 giờ trước
    - Giảng viên: Tối thiểu 4 giờ trước
    - Khẩn cấp: Quản trị viên có thể đăng ký ngay lập tức

2. **Khung giờ hoạt động:**
    - Ca sáng: 7:00 - 11:00
    - Ca chiều: 13:00 - 17:00
    - Ca tối: 18:00 - 21:00
    - Ngoài giờ: Cần phê duyệt đặc biệt

3. **Thời gian sử dụng tối đa:**
    - Sinh viên: Tối đa 4 giờ/lần, không quá 12 giờ/tuần
    - Giảng viên: Không giới hạn
    - Sự kiện: Tối đa 8 giờ/lần

#### Quy định về xung đột và ưu tiên
4. **Xử lý xung đột lịch:**
    - Ưu tiên 1: Thi cử chính thức
    - Ưu tiên 2: Giảng viên giảng dạy
    - Ưu tiên 3: Nghiên cứu khoa học
    - Ưu tiên 4: Học tập cá nhân/nhóm
    - Ưu tiên 5: Sự kiện ngoại khóa

5. **Đăng ký trùng lịch:**
    - Không cho phép 1 người đăng ký nhiều phòng cùng ca
    - Không cho phép 1 phòng có nhiều lịch trùng ca
    - Có thể đặt lịch liên tục nhiều ca

#### Quy định về trạng thái và hành vi
6. **Trạng thái phòng máy:**
    - "Sẵn sàng": Phòng hoạt động bình thường, có thể đặt
    - "Đang sử dụng": Có người đang dùng
    - "Bảo trì": Không cho phép đặt mới
    - "Ngừng hoạt động": Vô hiệu hóa hoàn toàn

7. **Hệ thống điểm uy tín:**
    - Mỗi user có điểm uy tín ban đầu: 100
    - Hủy lịch đúng quy định: -2 điểm
    - Hủy lịch trễ (< 2 giờ): -5 điểm
    - No-show (không đến): -10 điểm
    - Hoàn thành tốt: +1 điểm
    - Điểm < 50: Tạm khóa tài khoản, cần liên hệ admin

8. **Giới hạn đăng ký:**
    - Sinh viên: Tối đa 3 lịch "Chờ duyệt" cùng lúc
    - Giảng viên: Tối đa 10 lịch "Chờ duyệt" cùng lúc
    - Không được đặt quá 30 ngày trong tương lai

#### Quy định về phê duyệt
9. **Tự động phê duyệt:**
    - Giảng viên + mục đích "Giảng dạy" + đúng lịch học → Tự động duyệt
    - Các trường hợp khác: Cần quản trị viên duyệt thủ công

10. **Quá hạn xử lý:**
     - Yêu cầu > 24h không xử lý → Chuyển "Hết hạn"
     - Yêu cầu < 4h tới giờ sử dụng → Ưu tiên xử lý

#### Quy định về thiết bị
11. **Điều kiện phòng khả dụng:**
     - Số máy hoạt động tốt >= 80% tổng số máy
     - Có ít nhất 1 máy chiếu hoạt động
     - Điều hòa/quạt hoạt động (theo mùa)

12. **Bảo trì định kỳ:**
     - Mỗi phòng bảo trì 1 lần/tháng
     - Trong thời gian bảo trì: Không cho đặt lịch
     - Thông báo lịch bảo trì trước 7 ngày

#### Quy định về dữ liệu
13. **Lưu trữ:**
     - Lịch sử sử dụng: Lưu vĩnh viễn
     - Log hệ thống: Lưu 12 tháng
     - Yêu cầu "Đã từ chối"/"Hết hạn": Lưu 6 tháng

14. **Quyền truy cập dữ liệu:**
     - Sinh viên/Giảng viên: Chỉ xem dữ liệu của mình
     - Kỹ thuật viên: Xem dữ liệu thiết bị và sự cố
     - Quản trị viên: Xem toàn bộ
     - Ban quản lý: Xem báo cáo tổng hợp
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

---

## 12. Kết luận
Hệ thống quản lý cho thuê phòng máy giúp nâng cao hiệu quả sử dụng tài nguyên, giảm sai sót thủ công và hỗ trợ công tác quản lý trong môi trường giáo dục.
