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
                    .Where(r => r.UserId == userId)
                    .Select(r => new
                    {
                        id = r.ReportId,
                        userId = r.UserId,
                        title = r.Title,
                        description = r.Description,
                        status = r.Status,
                        timestamp = DateTime.Now
                    })
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
                // Logic ghép chuỗi Title theo yêu cầu
                string autoTitle = $"Báo cáo sự cố phòng {request.RoomId}";

                var newReport = new IncidentReport
                {
                    UserId = request.UserId,
                    Title = autoTitle,
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
