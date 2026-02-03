using System.Collections.Generic;

namespace Backend.DTOs
{
    public class LoginDto
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
    public class UserProfileDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? PhoneNumber { get; set; }
        public string? Department { get; set; }
        public string? Status { get; set; }

        // Hiển thị Role dựa trên logic của bạn (Teacher/Student/Staff hoặc tên Role)
        public string RoleName { get; set; } = null!;

        public List<BookingDto> RoomBookings { get; set; } = new();
        public List<InvoiceDto> Invoices { get; set; } = new();
        public List<ReportDto> IncidentReports { get; set; } = new();
    }

    // DTO cho Booking
    public class BookingDto
    {
        public int BookingId { get; set; }
        public string RoomName { get; set; } = null!; // Lấy từ bảng Room
        public string Date { get; set; } = null!;     // Format dd/MM/yyyy
        public string TimeRange { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string? Purpose { get; set; }
    }

    // DTO cho Invoice
    public class InvoiceDto
    {
        public int InvoiceId { get; set; }
        public int BookingRefId { get; set; }
        public decimal TotalAmount { get; set; }
        public string? PaymentDate { get; set; }
        public string Status { get; set; } = null!;
    }

    // DTO cho Report
    public class ReportDto
    {
        public int ReportId { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Status { get; set; } = null!;
    }

    // DTO để Update Profile (nếu cần)
    public class UpdateUserProfileDto
    {
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? PhoneNumber { get; set; }
    }
}