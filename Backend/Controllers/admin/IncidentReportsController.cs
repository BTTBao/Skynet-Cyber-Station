using Backend.DTOs;
using Backend.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class IncidentReportsController : ControllerBase
    {
        private readonly IIncidentReportService _incidentReportService;

        public IncidentReportsController(IIncidentReportService incidentReportService)
        {
            _incidentReportService = incidentReportService;
        }

        // GET: api/IncidentReports
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IncidentReportDto>>> GetAllIncidentReports()
        {
            var incidents = await _incidentReportService.GetAllIncidentReportsAsync();
            return Ok(new { success = true, data = incidents });
        }

        // GET: api/IncidentReports/5
        [HttpGet("{id}")]
        public async Task<ActionResult<IncidentReportDto>> GetIncidentReport(int id)
        {
            var incident = await _incidentReportService.GetIncidentReportByIdAsync(id);

            if (incident == null)
            {
                return NotFound(new { success = false, message = "Incident report not found" });
            }

            return Ok(new { success = true, data = incident });
        }

        // GET: api/IncidentReports/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<IncidentReportDto>>> GetIncidentReportsByUser(int userId)
        {
            var incidents = await _incidentReportService.GetIncidentReportsByUserIdAsync(userId);
            return Ok(new { success = true, data = incidents });
        }

        // GET: api/IncidentReports/room/5
        [HttpGet("room/{roomId}")]
        public async Task<ActionResult<IEnumerable<IncidentReportDto>>> GetIncidentReportsByRoom(int roomId)
        {
            var incidents = await _incidentReportService.GetIncidentReportsByRoomIdAsync(roomId);
            return Ok(new { success = true, data = incidents });
        }

        // GET: api/IncidentReports/status/not yet process
        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<IncidentReportDto>>> GetIncidentReportsByStatus(string status)
        {
            var incidents = await _incidentReportService.GetIncidentReportsByStatusAsync(status);
            return Ok(new { success = true, data = incidents });
        }

        // GET: api/IncidentReports/stats
        [HttpGet("stats")]
        public async Task<ActionResult<IncidentStatsDto>> GetIncidentStats()
        {
            var stats = await _incidentReportService.GetIncidentStatsAsync();
            return Ok(new { success = true, data = stats });
        }

        // POST: api/IncidentReports
        [HttpPost]
        public async Task<ActionResult<IncidentReportDto>> CreateIncidentReport(CreateIncidentReportDto createDto)
        {
            try
            {
                var incident = await _incidentReportService.CreateIncidentReportAsync(createDto);
                return CreatedAtAction(
                    nameof(GetIncidentReport),
                    new { id = incident.ReportId },
                    new { success = true, data = incident }
                );
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // PUT: api/IncidentReports/5
        [HttpPut("{id}")]
        public async Task<ActionResult<IncidentReportDto>> UpdateIncidentReport(int id, UpdateIncidentReportDto updateDto)
        {
            var updated = await _incidentReportService.UpdateIncidentReportAsync(id, updateDto);

            if (updated == null)
            {
                return NotFound(new { success = false, message = "Incident report not found" });
            }

            return Ok(new { success = true, data = updated });
        }

        // PUT: api/IncidentReports/5/resolve
        [HttpPut("{id}/resolve")]
        public async Task<ActionResult<IncidentReportDto>> MarkAsResolved(int id)
        {
            var updated = await _incidentReportService.MarkAsResolvedAsync(id);

            if (updated == null)
            {
                return NotFound(new { success = false, message = "Incident report not found" });
            }

            return Ok(new { success = true, data = updated });
        }

        // PUT: api/IncidentReports/5/process
        [HttpPut("{id}/process")]
        public async Task<ActionResult<IncidentReportDto>> MarkAsProcessing(int id)
        {
            var updated = await _incidentReportService.MarkAsProcessingAsync(id);

            if (updated == null)
            {
                return NotFound(new { success = false, message = "Incident report not found" });
            }

            return Ok(new { success = true, data = updated });
        }

        // DELETE: api/IncidentReports/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteIncidentReport(int id)
        {
            var result = await _incidentReportService.DeleteIncidentReportAsync(id);

            if (!result)
            {
                return NotFound(new { success = false, message = "Incident report not found" });
            }

            return Ok(new { success = true, message = "Incident report deleted successfully" });
        }
    }
}