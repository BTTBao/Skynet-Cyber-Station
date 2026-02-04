using Backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers.Client
{
    [Route("api/client/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly QuanLyPhongMayContext _context;

        public ReportController(QuanLyPhongMayContext context)
        {
            _context = context;
        }

        // GET: api/client/Report/user/5
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetReportsByUser(int userId)
        {
            try
            {
                var reports = await _context.IncidentReports
                    .Include(r => r.Room) // Đảm bảo join bảng Room (tùy chọn nếu dùng Select)
                    .Where(r => r.UserId == userId)
                    .Select(r => new
                    {
                        id = r.ReportId,
                        userId = r.UserId,
                        roomId = r.RoomId,

                        // --- THÊM DÒNG NÀY ---
                        roomName = r.Room.RoomName,
                        // ---------------------

                        description = r.Description,
                        status = r.Status,

                        // FIX: Lấy ngày báo cáo thực tế thay vì DateTime.Now
                        timestamp = r.ReportDate
                    })
                    .OrderByDescending(r => r.timestamp) // Sắp xếp mới nhất lên đầu
                    .ToListAsync();

                return Ok(reports);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }

        // POST: api/client/Report
        [HttpPost]
        public async Task<IActionResult> CreateReport([FromBody] CreateReportRequest request)
        {
            try
            {
                var newReport = new IncidentReport
                {
                    UserId = request.UserId,
                    RoomId = request.RoomId,
                    Description = request.Description,
                    Status = "not yet processed"
                };

                _context.IncidentReports.Add(newReport);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Gửi báo cáo thành công", reportId = newReport.ReportId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi gửi báo cáo", error = ex.Message });
            }
        }
    }
    public class CreateReportRequest
    {
        public int UserId { get; set; }
        public int RoomId { get; set; }
        public string Description { get; set; }
    }
}
