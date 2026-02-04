using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Backend.Controllers.Client
{
    [Route("api/client/[controller]")]
    [ApiController]
    [Authorize] // Bắt buộc phải có Token mới vào được Controller này
    public class UsersController : ControllerBase
    {
        private readonly QuanLyPhongMayContext _context;
        private readonly IConfiguration _configuration;

        public UsersController(QuanLyPhongMayContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // ==========================================
        // 1. ĐĂNG KÝ
        // ==========================================
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { message = "Vui lòng điền đầy đủ thông tin bắt buộc." });
            }

            var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
            if (!emailRegex.IsMatch(request.Email))
            {
                return BadRequest(new { message = "Email không đúng định dạng." });
            }

            var phoneRegex = new Regex(@"^0\d{9}$");
            if (!string.IsNullOrEmpty(request.PhoneNumber) && !phoneRegex.IsMatch(request.PhoneNumber))
            {
                return BadRequest(new { message = "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0." });
            }

            if (!IsPasswordStrong(request.Password))
            {
                return BadRequest(new { message = "Mật khẩu quá yếu! Yêu cầu: tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt." });
            }

            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                return BadRequest(new { message = "Tên đăng nhập này đã tồn tại." });

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest(new { message = "Email này đã được sử dụng bởi tài khoản khác." });

            if (!string.IsNullOrEmpty(request.PhoneNumber) &&
                await _context.Users.AnyAsync(u => u.PhoneNumber == request.PhoneNumber))
            {
                return BadRequest(new { message = "Số điện thoại này đã được sử dụng." });
            }

            var newUser = new User
            {
                Username = request.Username,
                PasswordHash = request.Password, // Lưu ý: Nên hash password trước khi lưu
                FullName = request.FullName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                Status = "Active",
                Point = 100,
                IsStudent = false,
                IsTeacher = false,
                IsStaff = false,
                Department = "N/A",
                RoleId = 0
            };

            try
            {
                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Đăng ký thành công! Vui lòng đăng nhập." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.InnerException?.Message ?? ex.Message });
            }
        }

        // ==========================================
        // 2. ĐĂNG NHẬP
        // ==========================================
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> Login([FromBody] LoginDto loginReq)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == loginReq.Username);

            if (user == null || user.PasswordHash != loginReq.Password)
            {
                return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng." });
            }

            if (user.Status == "Banned" || user.Status == "Locked")
            {
                return BadRequest(new { message = "Tài khoản của bạn đã bị khóa." });
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token,
                user = new
                {
                    user.UserId,
                    user.Username,
                    user.FullName,
                    Role = user.Role?.RoleName ?? (user.IsTeacher == true ? "Giảng viên" : "Sinh viên"),
                    user.Email,
                    user.Point
                }
            });
        }

        // ==========================================
        // 3. XEM PROFILE (ĐÃ BẢO MẬT)
        // ==========================================
        [HttpGet("{id}")]
        public async Task<ActionResult<UserProfileDto>> GetUserProfile(int id)
        {
            try
            {
                // --- SECURITY CHECK ---
                int currentUserId = GetCurrentUserId();
                // Logic: Nếu ID trong Token khác ID cần xem -> Chặn
                // (Mở rộng: && !User.IsInRole("Admin") để Admin vẫn xem được)
                if (currentUserId != id)
                {
                    return StatusCode(403, new { message = "Bạn không có quyền xem thông tin của người khác." });
                }
                // ----------------------

                var user = await _context.Users
                    .AsNoTracking()
                    .Include(u => u.Role)
                    .Include(u => u.RoomBookings).ThenInclude(rb => rb.Room)
                    .Include(u => u.Invoices)
                    .Include(u => u.IncidentReports)
                    .FirstOrDefaultAsync(u => u.UserId == id);

                if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

                var userDto = new UserProfileDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    FullName = user.FullName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    Department = user.Department,
                    Status = user.Status ?? "Active",
                    RoleName = user.Role?.RoleName ?? "User",

                    RoomBookings = user.RoomBookings.OrderByDescending(b => b.BookingDate).Select(b => new BookingDto
                    {
                        BookingId = b.BookingId,
                        RoomName = b.Room?.RoomName ?? "Unknown Room",
                        Date = b.BookingDate.ToString("dd/MM/yyyy"),
                        TimeRange = (b.StartTime.HasValue && b.EndTime.HasValue) ? $"{b.StartTime:HH:mm} - {b.EndTime:HH:mm}" : "N/A",
                        Status = b.Status ?? "Pending",
                        Purpose = b.Purpose
                    }).ToList(),

                    Invoices = user.Invoices.OrderByDescending(i => i.InvoiceId).Select(i => new InvoiceDto
                    {
                        InvoiceId = i.InvoiceId,
                        BookingRefId = i.BookingId,
                        TotalAmount = i.TotalAmount,
                        PaymentDate = i.PaymentDate?.ToString("dd/MM/yyyy"),
                        Status = i.Status ?? "Unpaid"
                    }).ToList(),

                    IncidentReports = user.IncidentReports.OrderByDescending(r => r.ReportId).Select(r => new ReportDto
                    {
                        ReportId = r.ReportId,
                        //Title = r.Title,
                        Description = r.Description,
                        Status = r.Status ?? "Processing"
                    }).ToList()
                };

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi Server: " + ex.Message });
            }
        }

        // ==========================================
        // 4. CẬP NHẬT PROFILE (ĐÃ BẢO MẬT)
        // ==========================================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUserProfile(int id, [FromBody] UpdateUserProfileDto updateDto)
        {
            // --- SECURITY CHECK ---
            // Chỉ chính chủ mới được sửa thông tin của mình
            if (GetCurrentUserId() != id)
            {
                return StatusCode(403, new { message = "Bạn không có quyền sửa thông tin của người khác." });
            }
            // ----------------------

            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found" });

            // Validate Regex
            var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
            if (!emailRegex.IsMatch(updateDto.Email))
                return BadRequest(new { message = "Email không đúng định dạng." });

            var phoneRegex = new Regex(@"^0\d{9}$");
            if (!string.IsNullOrEmpty(updateDto.PhoneNumber) && !phoneRegex.IsMatch(updateDto.PhoneNumber))
                return BadRequest(new { message = "Số điện thoại không hợp lệ (Phải có 10 số và bắt đầu bằng 0)." });

            // Check trùng (Trừ chính user đang sửa)
            if (await _context.Users.AnyAsync(u => u.Email == updateDto.Email && u.UserId != id))
                return BadRequest(new { message = "Email này đã được sử dụng bởi người khác." });

            if (!string.IsNullOrEmpty(updateDto.PhoneNumber) &&
                await _context.Users.AnyAsync(u => u.PhoneNumber == updateDto.PhoneNumber && u.UserId != id))
            {
                return BadRequest(new { message = "Số điện thoại này đã được sử dụng bởi người khác." });
            }

            // Update
            user.FullName = updateDto.FullName;
            user.Email = updateDto.Email;
            user.PhoneNumber = updateDto.PhoneNumber;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thành công!" });
        }

        // ==========================================
        // 5. ĐỔI MẬT KHẨU (ĐÃ BẢO MẬT)
        // ==========================================
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto request)
        {
            // --- SECURITY CHECK ---
            // ID trong Token phải khớp với ID muốn đổi pass
            if (GetCurrentUserId() != request.UserId)
            {
                return StatusCode(403, new { message = "Hành vi bất thường: ID người dùng không khớp." });
            }
            // ----------------------

            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

            if (user.PasswordHash != request.CurrentPassword)
                return BadRequest(new { message = "Mật khẩu hiện tại không chính xác." });

            if (!IsPasswordStrong(request.NewPassword))
                return BadRequest(new { message = "Mật khẩu mới không đủ mạnh (Cần 8 ký tự, hoa, thường, số, ký tự đặc biệt)." });

            user.PasswordHash = request.NewPassword;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đổi mật khẩu thành công!" });
        }

        // ==========================================
        // HÀM HỖ TRỢ (PRIVATE)
        // ==========================================
        private bool IsPasswordStrong(string password)
        {
            if (string.IsNullOrEmpty(password)) return false;
            if (password.Length < 8) return false;
            if (!password.Any(char.IsLower)) return false;
            if (!password.Any(char.IsUpper)) return false;
            if (!password.Any(char.IsDigit)) return false;
            if (!Regex.IsMatch(password, @"[!@#$%^&*()_+=\[{\]};:<>|./?,-]")) return false;
            return true;
        }

        // Hàm này trích xuất UserId từ Token trong Header
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            return 0; // Trả về 0 nếu không tìm thấy hoặc lỗi
        }

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
                Expires = DateTime.UtcNow.AddHours(24),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}