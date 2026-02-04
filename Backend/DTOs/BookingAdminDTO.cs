using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    // ─── Response DTO: hiển thị trong danh sách & detail ─────────────────
    public class BookingDto2
    {
        public int Id { get; set; }                 // BookingId
        public string Code { get; set; }            // "BK-" + BookingId (generate trong service)
        public decimal Price { get; set; }            // "BK-" + BookingId (generate trong service)
        public string Name { get; set; }            // User.FullName
        public string RoomCode { get; set; }        // Room.RoomCode
        public string Date { get; set; }            // BookingDate → "dd/MM/yyyy"
        public string TimeIn { get; set; }          // StartTime  → "HH:mm"
        public string TimeOut { get; set; }         // EndTime    → "HH:mm"
        public int People { get; set; }             // NumberOfPeople
        public string Purpose { get; set; }         // Purpose
        public string Status { get; set; }          // "pending" | "approved" | "rejected"
        public string RejectedReason { get; set; }  // RejectionReason (null nếu chưa reject)
        public string CreatedAt { get; set; }       // BookingDate fallback → "dd/MM/yyyy"
        public bool IsUsed { get; set; }            // true nếu phòng đã được sử dụng
        public bool IsBillCreated { get; set; }
    }

    // ─── Request DTO: body gửi khi từ chối ───────────────────────────────
    public class RejectBookingDto
    {
        [Required(ErrorMessage = "Lý do từ chối là bắt buộc")]
        [StringLength(500, ErrorMessage = "Lý do không được vượt quá 500 ký tự")]
        public string Reason { get; set; }
    }

    // ─── Response DTO: thống kê ──────────────────────────────────────────
    public class BookingStatisticsDto
    {
        public int Total { get; set; }
        public int Pending { get; set; }
        public int Approved { get; set; }
        public int Rejected { get; set; }
    }

    public class MarkAsUsedDto
    {
        public bool IsUsed { get; set; }
    }

}