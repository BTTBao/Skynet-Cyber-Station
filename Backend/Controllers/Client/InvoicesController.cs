using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.DTOs; // <--- Nhớ import DTO
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Bắt buộc có Token mới được vào
    public class InvoicesController : ControllerBase
    {
        private readonly QuanLyPhongMayContext _context;

        public InvoicesController(QuanLyPhongMayContext context)
        {
            _context = context;
        }

        // GET: api/Invoices/5
        [HttpGet("{id}")]
        public async Task<ActionResult<InvoiceDetailDTO>> GetInvoice(int id)
        {
            // 1. Lấy UserID từ Token hiện tại
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("UserId")?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            int currentUserId = int.Parse(userIdClaim);

            // 2. Query và Map sang DTO
            // Sử dụng .Select() thay vì .Include() để tránh lỗi vòng lặp JSON
            var invoiceDto = await _context.Invoices
                .Where(i => i.InvoiceId == id)
                .Select(i => new InvoiceDetailDTO
                {
                    InvoiceId = i.InvoiceId,
                    TotalAmount = i.TotalAmount,
                    Status = i.Status,
                    Deposit = i.Deposit,
                    PaymentDate = i.PaymentDate,
                    BookingId = i.BookingId,
                    UserId = i.UserId,

                    // Map User
                    User = new InvoiceUserDto
                    {
                        FullName = i.User.FullName,
                        Email = i.User.Email,
                        Department = i.User.Department
                    },

                    // Map Booking
                    Booking = new InvoiceBookingDto
                    {
                        BookingDate = i.Booking.BookingDate,
                        StartTime = i.Booking.StartTime,
                        EndTime = i.Booking.EndTime,

                        // Map Room lồng trong Booking
                        Room = new InvoiceRoomDto
                        {
                            RoomName = i.Booking.Room.RoomName,
                            RoomCode = i.Booking.Room.RoomCode,

                            // Map RoomType lồng trong Room
                            RoomType = new InvoiceRoomTypeDto
                            {
                                TypeName = i.Booking.Room.RoomType.TypeName,
                                BasePrice = i.Booking.Room.RoomType.BasePrice
                            }
                        }
                    }
                })
                .FirstOrDefaultAsync();

            if (invoiceDto == null) return NotFound(new { message = "Không tìm thấy hóa đơn." });

            // 3. CHECK QUYỀN: Chỉ chủ hóa đơn hoặc Admin mới được xem
            if (invoiceDto.UserId != currentUserId && userRole != "Admin")
            {
                return StatusCode(403, new { message = "Bạn không có quyền xem hóa đơn này." });
            }

            return Ok(invoiceDto);
        }

        // POST: api/Invoices/5/pay
        [HttpPost("{id}/pay")]
        public async Task<IActionResult> PayInvoice(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("UserId")?.Value;
            int currentUserId = int.Parse(userIdClaim ?? "0");
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null) return NotFound();

            // Check quyền
            if (invoice.UserId != currentUserId && userRole != "Admin")
            {
                return StatusCode(403, new { message = "Bạn không được phép thanh toán hóa đơn này." });
            }

            if (invoice.Status == "Paid" || invoice.Status == "Deposit Paid")
                return BadRequest(new { message = "Hóa đơn này đã được thanh toán rồi." });

            // Cập nhật trạng thái
            // Đổi thành "Paid" để UserProfile hiển thị màu xanh (hoặc bạn có thể dùng "Deposit Paid" nếu muốn rõ ràng)
            invoice.Status = "Paid";
            invoice.PaymentDate = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Thanh toán cọc thành công!", paymentDate = invoice.PaymentDate });
        }
    }
}