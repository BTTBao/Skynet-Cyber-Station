using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [Route("api/client/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        // Thay QuanLyPhongMayContext bằng tên Context thực tế trong file Program.cs của bạn
        private readonly QuanLyPhongMayContext _context;
        private readonly IConfiguration _configuration;

        // Inject thêm IConfiguration vào Constructor
        public UsersController(QuanLyPhongMayContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
        [HttpPost("login")]
        public async Task<ActionResult<object>> Login([FromBody] LoginDto loginReq)
        {
            // 1. Tìm user trong DB
            var user = await _context.Users
                .Include(u => u.Role) // Load Role để phân quyền
                .FirstOrDefaultAsync(u => u.Username == loginReq.Username);

            // 2. Kiểm tra User và Password
            // Lưu ý: Tạm thời so sánh trực tiếp. Nên dùng Hash trong thực tế.
            if (user == null || user.PasswordHash != loginReq.Password)
            {
                return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng." });
            }

            // 3. Tạo Token (JWT)
            var token = GenerateJwtToken(user);

            // 4. Trả về Token + Thông tin User (để React lưu)
            return Ok(new
            {
                token = token,
                user = new
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    FullName = user.FullName,
                    Role = user.Role?.RoleName ?? "User",
                    Email = user.Email
                }
            });
        }
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto request)
        {
            // 1. Tìm User trong database
            var user = await _context.Users.FindAsync(request.UserId);

            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng." });
            }

            // 2. Kiểm tra mật khẩu hiện tại
            // LƯU Ý: Nếu database lưu mật khẩu mã hóa, hãy Hash(request.CurrentPassword) trước khi so sánh
            if (user.PasswordHash != request.CurrentPassword)
            {
                return BadRequest(new { message = "Mật khẩu hiện tại không chính xác." });
            }

            // 3. Kiểm tra mật khẩu mới (Validation đơn giản)
            if (string.IsNullOrEmpty(request.NewPassword) || request.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 6 ký tự." });
            }

            // 4. Cập nhật mật khẩu mới
            // LƯU Ý: Nếu dùng bảo mật, hãy Hash(request.NewPassword) trước khi gán
            user.PasswordHash = request.NewPassword;

            try
            {
                // 5. Lưu xuống Database
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Đổi mật khẩu thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }
        // Hàm phụ trợ để tạo Token
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role?.RoleName ?? "User"),
                new Claim("FullName", user.FullName ?? "")
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(2), // Token sống 2 tiếng
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
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