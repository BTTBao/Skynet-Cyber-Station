using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class ComputerDto2
    {
        public int ComputerID { get; set; }
        public int RoomID { get; set; }
        public string ComputerCode { get; set; }
        public string ComputerNumber { get; set; }
        public string ComputerName { get; set; }
        public string Specifications { get; set; }
        public string Status { get; set; }
        public string Note { get; set; }

        // Thông tin chi tiết từ Specifications (nếu có)
        public string Brand { get; set; }
        public string CPU { get; set; }
        public string RAM { get; set; }
        public string Storage { get; set; }
        public string GPU { get; set; }
        public string OS { get; set; }

        // Thông tin phòng
        public string RoomCode { get; set; }
        public string RoomName { get; set; }
    }

    /// <summary>
    /// DTO for bulk creating computers
    /// </summary>
    public class BulkCreateComputerRequest
    {
        [Required(ErrorMessage = "Room ID is required")]
        public long RoomId { get; set; }

        [Required(ErrorMessage = "Specifications are required")]
        [StringLength(1000, ErrorMessage = "Specifications cannot exceed 1000 characters")]
        public string Specifications { get; set; } = string.Empty;
        public int Capacity { get; set; } = 0;
    }

    /// <summary>
    /// DTO for updating computer status
    /// </summary>
    public class UpdateComputerStatusRequest
    {
        [Required(ErrorMessage = "Computer number is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Computer number must be greater than 0")]
        public int ComputerNumber { get; set; }

        [Required(ErrorMessage = "Room ID is required")]
        public long RoomId { get; set; }

        [Required(ErrorMessage = "Status is required")]
        [RegularExpression("^(active|broken|maintenance)$",
            ErrorMessage = "Status must be 'active', 'broken', or 'maintenance'")]
        public string Status { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for computer response
    /// </summary>
    public class ComputerResponse
    {
        public long ComputerID { get; set; }
        public long RoomId { get; set; }
        public string ComputerNumber { get; set; }
        public string ComputerName { get; set; } = string.Empty;
        public string Specifications { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}