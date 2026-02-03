using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        // Thay QuanLyPhongMayContext bằng tên Context thực tế trong file Program.cs của bạn
        private readonly QuanLyPhongMayContext _context;

        public UsersController(QuanLyPhongMayContext context)
        {
            _context = context;
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserProfileDto>> GetUserProfile(int id)
        {
            try
            {
                // =========================================================
                // BƯỚC 1: LẤY DỮ LIỆU THÔ (LOAD TỪ DB VỀ RAM)
                // =========================================================
                // Dùng .AsNoTracking() để tăng tốc độ vì ta chỉ đọc, không sửa
                var user = await _context.Users
                    .AsNoTracking()
                    .Include(u => u.Role)           // Include bảng Role
                    .Include(u => u.RoomBookings)   // Include danh sách đặt phòng
                        .ThenInclude(rb => rb.Room) // -> Lấy tiếp thông tin Phòng (để lấy RoomName)
                    .Include(u => u.Invoices)       // Include hóa đơn
                    .Include(u => u.IncidentReports)// Include báo cáo
                    .FirstOrDefaultAsync(u => u.UserId == id);

                if (user == null)
                {
                    return NotFound(new { message = "Không tìm thấy người dùng." });
                }

                // =========================================================
                // BƯỚC 2: MAP SANG DTO (XỬ LÝ TRONG RAM - C#)
                // =========================================================
                // Việc này tránh lỗi: "Linq cannot translate ToString" và lỗi JSON loop

                var userDto = new UserProfileDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    FullName = user.FullName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    Department = user.Department,
                    Status = user.Status ?? "Active",

                    // Lấy tên Role từ bảng Role. Nếu null thì check các cờ IsTeacher/IsStudent
                    RoleName = user.Role != null ? user.Role.RoleName :
                               (user.IsTeacher == true ? "Giảng viên" :
                               (user.IsStudent == true ? "Sinh viên" : "Người dùng")),

                    // --- Xử lý danh sách Booking ---
                    RoomBookings = user.RoomBookings
                        .OrderByDescending(b => b.BookingDate)
                        .Select(b => new BookingDto
                        {
                            BookingId = b.BookingId,
                            // Kiểm tra null cho Room để tránh crash nếu dữ liệu lỗi
                            RoomName = b.Room != null ? b.Room.RoomName : "Phòng đã bị xóa",

                            // Format ngày tháng thoải mái vì đang chạy trong RAM
                            Date = b.BookingDate.ToString("dd/MM/yyyy"),

                            TimeRange = (b.StartTime.HasValue && b.EndTime.HasValue)
                                        ? $"{b.StartTime.Value:HH:mm} - {b.EndTime.Value:HH:mm}"
                                        : "N/A",
                            Status = b.Status ?? "Pending",
                            Purpose = b.Purpose
                        }).ToList(),

                    // --- Xử lý danh sách Hóa đơn ---
                    Invoices = user.Invoices
                        .OrderByDescending(i => i.InvoiceId)
                        .Select(i => new InvoiceDto
                        {
                            InvoiceId = i.InvoiceId,
                            BookingRefId = i.BookingId,
                            TotalAmount = i.TotalAmount,
                            PaymentDate = i.PaymentDate.HasValue
                                          ? i.PaymentDate.Value.ToString("dd/MM/yyyy")
                                          : null,
                            Status = i.Status ?? "Unpaid"
                        }).ToList(),

                    // --- Xử lý danh sách Báo cáo ---
                    IncidentReports = user.IncidentReports
                        .OrderByDescending(r => r.ReportId)
                        .Select(r => new ReportDto
                        {
                            ReportId = r.ReportId,
                            Title = r.Title,
                            Description = r.Description,
                            Status = r.Status ?? "Processing"
                        }).ToList()
                };

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                // Ghi log lỗi ra cửa sổ Output để debug
                Console.WriteLine($"Error GetUserProfile: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi Server", details = ex.Message });
            }
        }

        // API Update User (Cập nhật thông tin cá nhân)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUserProfile(int id, [FromBody] UpdateUserProfileDto updateDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found" });

            user.FullName = updateDto.FullName;
            user.Email = updateDto.Email;
            user.PhoneNumber = updateDto.PhoneNumber;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thành công!" });
        }
    }
}