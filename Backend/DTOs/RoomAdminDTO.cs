namespace Backend.DTOs
{
    
        // ============================================
        // ROOM DTOs
        // ============================================

        /// <summary>
        /// DTO cho hiển thị danh sách phòng
        /// </summary>
        public class RoomDto
        {
            public int RoomID { get; set; }
            public int RoomTypeID { get; set; }
            public string RoomCode { get; set; }
            public string RoomName { get; set; }
            public int Capacity { get; set; }
            public int? Floor { get; set; }
            public string Description { get; set; }
            public string Status { get; set; }

            // Thông tin từ RoomType
            public string TypeName { get; set; }
            public decimal BasePrice { get; set; }

            // Thống kê máy tính
            public int TotalComputers { get; set; }
            public int ActiveComputers { get; set; }
            public int BrokenComputers { get; set; }
            public int MaintenanceComputers { get; set; }
        }

        /// <summary>
        /// DTO cho tạo phòng mới
        /// </summary>
        public class CreateRoomDto
        {
            public int RoomTypeID { get; set; }
            public string RoomCode { get; set; }
            public string RoomName { get; set; }
            public int Capacity { get; set; }
            public int? Floor { get; set; }
            public string Description { get; set; }
        }

        /// <summary>
        /// DTO cho cập nhật phòng
        /// </summary>
        public class UpdateRoomDto
        {
            public int RoomTypeID { get; set; }
            public string RoomName { get; set; }
            public int Capacity { get; set; }
            public int? Floor { get; set; }
            public string Description { get; set; }
            public string Status { get; set; }
        }

        /// <summary>
        /// DTO cho chi tiết phòng (bao gồm danh sách máy tính)
        /// </summary>
        public class RoomDetailDto : RoomDto
        {
            public List<ComputerDto> Computers { get; set; }
        }

        /// <summary>
        /// DTO cho máy tính
        /// </summary>
        public class ComputerDto
        {
            public int ComputerID { get; set; }
            public int RoomID { get; set; }
            public string ComputerNumber { get; set; }
            public string ComputerName { get; set; }
            public string Specifications { get; set; }
            public string Status { get; set; }
            public string RoomCode { get; set; }
            public string RoomName { get; set; }
        }

        // ============================================
        // COMMON DTOs
        // ============================================

        /// <summary>
        /// Response wrapper chuẩn cho tất cả API
        /// </summary>
        public class ApiResponse<T>
        {
            public bool Success { get; set; }
            public string Message { get; set; }
            public T Data { get; set; }
            public List<string> Errors { get; set; }

            public ApiResponse()
            {
                Errors = new List<string>();
            }

            public static ApiResponse<T> SuccessResponse(T data, string message = "Thành công")
            {
                return new ApiResponse<T>
                {
                    Success = true,
                    Message = message,
                    Data = data
                };
            }

            public static ApiResponse<T> ErrorResponse(string message, List<string> errors = null)
            {
                return new ApiResponse<T>
                {
                    Success = false,
                    Message = message,
                    Errors = errors ?? new List<string>()
                };
            }
        }

    public class RoomDetailDto2
    {
        public int RoomID { get; set; }
        public int RoomTypeID { get; set; }
        public string RoomCode { get; set; }
        public string RoomName { get; set; }
        public int Capacity { get; set; }
        public int? Floor { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }

        // Thông tin từ RoomType
        public string TypeName { get; set; }
        public decimal BasePrice { get; set; }

        // Thống kê máy tính
        public int TotalComputers { get; set; }
        public int ActiveComputers { get; set; }
        public int BrokenComputers { get; set; }
        public int MaintenanceComputers { get; set; }

        // Danh sách máy tính chi tiết
        public List<ComputerDto2> Computers { get; set; } = new List<ComputerDto2>();
    }

}
