namespace Backend.DTOs
{
    public class InvoiceDto2
    {
        public int InvoiceID { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal? Deposit { get; set; }
        public string Status { get; set; }
        public DateTime? PaymentDate { get; set; }
        public int BookingID { get; set; }

        // Thông tin lồng nhau (Nested DTOs)
        public UserInfoDto User { get; set; }
        public BookingInfoDto Booking { get; set; }
    }
    // Dùng cho thông tin khách hàng trong hóa đơn
    public class UserInfoDto
    {
        public string FullName { get; set; }
        public string Email { get; set; }
    }

    // Dùng cho thông tin đặt phòng trong hóa đơn
    public class BookingInfoDto
    {
        public string RoomName { get; set; }
        public string RoomCode { get; set; }
        public int NumberOfPeople { get; set; }
        public DateOnly BookingDate { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Purpose { get; set; }
    }
    public class CreateInvoiceDto
    {
        public int BookingID { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal? Deposit { get; set; }
        public string Status { get; set; } // "Pending", "Paid", "Cancelled"
        public DateTime? PaymentDate { get; set; }
    }
}
