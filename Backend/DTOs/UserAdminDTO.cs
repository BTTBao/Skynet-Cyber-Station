using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    // DTO cho việc hiển thị danh sách user
    public class UserDto
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Role { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public int CreditScore { get; set; }
        public string Status { get; set; }
    }

    // DTO cho việc tạo user mới
    public class CreateUserDto
    {
        [Required(ErrorMessage = "Họ tên là bắt buộc")]
        [StringLength(100, ErrorMessage = "Họ tên không được vượt quá 100 ký tự")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Username là bắt buộc")]
        [StringLength(50, ErrorMessage = "Username không được vượt quá 50 ký tự")]
        public string Username { get; set; }

        [Required(ErrorMessage = "Password là bắt buộc")]
        [StringLength(255, MinimumLength = 6, ErrorMessage = "Password phải có ít nhất 6 ký tự")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Vai trò là bắt buộc")]
        public int Role { get; set; } // admin, manager, teacher, student

        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
        [RegularExpression(@"^[0-9]{10}$", ErrorMessage = "Số điện thoại phải có 10 chữ số")]
        public string Phone { get; set; }

        public string Department { get; set; }
    }

    // DTO cho việc cập nhật user
    public class UpdateUserDto
    {
        [Required]
        public int UserID { get; set; }

        [StringLength(100)]
        public string FullName { get; set; }

        [EmailAddress]
        public string Email { get; set; }

        [RegularExpression(@"^[0-9]{10}$")]
        public string PhoneNumber { get; set; }

        public string Department { get; set; }

        public int? RoleID { get; set; }
    }

    // DTO cho thống kê
    public class UserStatisticsDto
    {
        public int Total { get; set; }
        public int Active { get; set; }
        public int Locked { get; set; }
        public int Students { get; set; }
        public int Teachers { get; set; }
        public int Staff { get; set; }
    }

    // DTO cho chi tiết user
    public class UserDetailDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Role { get; set; }
        public string Department { get; set; }
        public int CreditScore { get; set; }
        public string Status { get; set; }
        public bool IsStudent { get; set; }
        public bool IsTeacher { get; set; }
        public bool IsStaff { get; set; }
    }
}