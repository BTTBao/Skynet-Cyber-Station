using System;

namespace Backend.DTOs
{
    // DTO cho việc tạo mới incident report
    public class CreateIncidentReportDto
    {
        public int UserId { get; set; }
        public int RoomId { get; set; }
        public string Description { get; set; } = null!;
    }

    // DTO cho việc cập nhật incident report
    public class UpdateIncidentReportDto
    {
        public string? Description { get; set; }
        public string? Status { get; set; }
    }

    // DTO cho response incident report
    public class IncidentReportDto
    {
        public int ReportId { get; set; }
        public int UserId { get; set; }
        public int RoomId { get; set; }
        public string Description { get; set; } = null!;
        public DateTime? ReportDate { get; set; }
        public string? Status { get; set; }

        // Thông tin người báo cáo
        public string ReporterName { get; set; } = null!;
        public string? ReporterEmail { get; set; }

        // Thông tin phòng
        public string RoomCode { get; set; } = null!;
        public string RoomName { get; set; } = null!;
    }

    // DTO cho thống kê
    public class IncidentStatsDto
    {
        public int Total { get; set; }
        public int NotYetProcess { get; set; }
        public int Processing { get; set; }
        public int Resolved { get; set; }
    }
}