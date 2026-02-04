using System;

namespace Backend.DTOs
{
    // DTO Tổng cho hóa đơn
    public class InvoiceDetailDTO
    {
        public int InvoiceId { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }
        public decimal? Deposit { get; set; }
        public DateTime? PaymentDate { get; set; }
        public int BookingId { get; set; }
        public int UserId { get; set; }

        // Object lồng nhau (đã được làm phẳng để tránh vòng lặp)
        public InvoiceUserDto User { get; set; }
        public InvoiceBookingDto Booking { get; set; }
    }

    // DTO cho User (chỉ lấy tên, email, khoa)
    public class InvoiceUserDto
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Department { get; set; }
    }

    // DTO cho Booking
    public class InvoiceBookingDto
    {
        public DateOnly BookingDate { get; set; } // Lưu ý kiểu dữ liệu DateOnly
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public InvoiceRoomDto Room { get; set; }
    }

    // DTO cho Room
    public class InvoiceRoomDto
    {
        public string RoomName { get; set; }
        public string RoomCode { get; set; }
        public InvoiceRoomTypeDto RoomType { get; set; }
    }

    // DTO cho RoomType
    public class InvoiceRoomTypeDto
    {
        public string TypeName { get; set; }
        public decimal? BasePrice { get; set; }
    }
}