using Backend.DTOs;
using Backend.Models;
using Backend.Repository.admin;


namespace Backend.Service
{
    public interface IIncidentReportService
    {
        Task<IEnumerable<IncidentReportDto>> GetAllIncidentReportsAsync();
        Task<IncidentReportDto?> GetIncidentReportByIdAsync(int reportId);
        Task<IEnumerable<IncidentReportDto>> GetIncidentReportsByUserIdAsync(int userId);
        Task<IEnumerable<IncidentReportDto>> GetIncidentReportsByRoomIdAsync(int roomId);
        Task<IEnumerable<IncidentReportDto>> GetIncidentReportsByStatusAsync(string status);
        Task<IncidentReportDto> CreateIncidentReportAsync(CreateIncidentReportDto createDto);
        Task<IncidentReportDto?> UpdateIncidentReportAsync(int reportId, UpdateIncidentReportDto updateDto);
        Task<bool> DeleteIncidentReportAsync(int reportId);
        Task<IncidentReportDto?> MarkAsResolvedAsync(int reportId);
        Task<IncidentReportDto?> MarkAsProcessingAsync(int reportId);
        Task<IncidentStatsDto> GetIncidentStatsAsync();
    }
    public class IncidentReportService : IIncidentReportService
    {
        private readonly IIncidentReportRepository _incidentReportRepository;

        public IncidentReportService(IIncidentReportRepository incidentReportRepository)
        {
            _incidentReportRepository = incidentReportRepository;
        }

        public async Task<IEnumerable<IncidentReportDto>> GetAllIncidentReportsAsync()
        {
            var incidents = await _incidentReportRepository.GetAllAsync();
            return incidents.Select(MapToDto);
        }

        public async Task<IncidentReportDto?> GetIncidentReportByIdAsync(int reportId)
        {
            var incident = await _incidentReportRepository.GetByIdAsync(reportId);
            return incident != null ? MapToDto(incident) : null;
        }

        public async Task<IEnumerable<IncidentReportDto>> GetIncidentReportsByUserIdAsync(int userId)
        {
            var incidents = await _incidentReportRepository.GetByUserIdAsync(userId);
            return incidents.Select(MapToDto);
        }

        public async Task<IEnumerable<IncidentReportDto>> GetIncidentReportsByRoomIdAsync(int roomId)
        {
            var incidents = await _incidentReportRepository.GetByRoomIdAsync(roomId);
            return incidents.Select(MapToDto);
        }

        public async Task<IEnumerable<IncidentReportDto>> GetIncidentReportsByStatusAsync(string status)
        {
            var incidents = await _incidentReportRepository.GetByStatusAsync(status);
            return incidents.Select(MapToDto);
        }

        public async Task<IncidentReportDto> CreateIncidentReportAsync(CreateIncidentReportDto createDto)
        {
            var incidentReport = new IncidentReport
            {
                UserId = createDto.UserId,
                RoomId = createDto.RoomId,
                Description = createDto.Description,
                ReportDate = DateTime.Now,
                Status = "not yet process" // Mặc định là chưa xử lý
            };

            var created = await _incidentReportRepository.CreateAsync(incidentReport);
            return MapToDto(created);
        }

        public async Task<IncidentReportDto?> UpdateIncidentReportAsync(int reportId, UpdateIncidentReportDto updateDto)
        {
            var existing = await _incidentReportRepository.GetByIdAsync(reportId);
            if (existing == null)
                return null;

            // Cập nhật các trường nếu có giá trị mới
            if (!string.IsNullOrEmpty(updateDto.Description))
                existing.Description = updateDto.Description;

            if (!string.IsNullOrEmpty(updateDto.Status))
                existing.Status = updateDto.Status;

            var updated = await _incidentReportRepository.UpdateAsync(existing);
            return updated != null ? MapToDto(updated) : null;
        }

        public async Task<bool> DeleteIncidentReportAsync(int reportId)
        {
            return await _incidentReportRepository.DeleteAsync(reportId);
        }

        public async Task<IncidentReportDto?> MarkAsResolvedAsync(int reportId)
        {
            var existing = await _incidentReportRepository.GetByIdAsync(reportId);
            if (existing == null)
                return null;

            existing.Status = "resolved";
            var updated = await _incidentReportRepository.UpdateAsync(existing);
            return updated != null ? MapToDto(updated) : null;
        }

        public async Task<IncidentReportDto?> MarkAsProcessingAsync(int reportId)
        {
            var existing = await _incidentReportRepository.GetByIdAsync(reportId);
            if (existing == null)
                return null;

            existing.Status = "processing";
            var updated = await _incidentReportRepository.UpdateAsync(existing);
            return updated != null ? MapToDto(updated) : null;
        }

        public async Task<IncidentStatsDto> GetIncidentStatsAsync()
        {
            var total = await _incidentReportRepository.GetTotalCountAsync();
            var notYetProcess = await _incidentReportRepository.GetCountByStatusAsync("not yet process");
            var processing = await _incidentReportRepository.GetCountByStatusAsync("processing");
            var resolved = await _incidentReportRepository.GetCountByStatusAsync("resolved");

            return new IncidentStatsDto
            {
                Total = total,
                NotYetProcess = notYetProcess,
                Processing = processing,
                Resolved = resolved
            };
        }

        // Helper method để map từ Entity sang DTO
        private IncidentReportDto MapToDto(IncidentReport incident)
        {
            return new IncidentReportDto
            {
                ReportId = incident.ReportId,
                UserId = incident.UserId,
                RoomId = incident.RoomId,
                Description = incident.Description,
                ReportDate = incident.ReportDate,
                Status = incident.Status,
                ReporterName = incident.User?.FullName ?? "Unknown",
                ReporterEmail = incident.User?.Email,
                RoomCode = incident.Room?.RoomCode ?? "N/A",
                RoomName = incident.Room?.RoomName ?? "N/A"
            };
        }
    }
}