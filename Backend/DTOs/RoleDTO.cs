namespace Backend.DTOs
{
    /// <summary>
    /// DTO cho việc hiển thị thông tin Role
    /// </summary>
    public class RoleDto
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; }
        public string RoleCode { get; set; }  // Để frontend map với các value như 'admin', 'student'
    }
}