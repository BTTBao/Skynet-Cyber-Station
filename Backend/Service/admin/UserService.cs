using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Backend.DTOs;
using Backend.Repository.admin;
using Backend.Models;

namespace Backend.Service
{
    public interface IUserService
    {
        Task<List<UserDto>> GetAllUsersAsync();
        Task<UserDetailDto> GetUserByIdAsync(int userId);
        Task<UserDto> CreateUserAsync(CreateUserDto createUserDto);
        Task<UserDto> UpdateUserAsync(UpdateUserDto updateUserDto);
        Task<bool> DeleteUserAsync(int userId);
        Task<bool> ToggleUserStatusAsync(int userId);
        Task<List<UserDto>> SearchUsersAsync(string searchTerm);
        Task<UserStatisticsDto> GetUserStatisticsAsync();
    }

    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly QuanLyPhongMayContext _context;

        public UserService(IUserRepository userRepository, QuanLyPhongMayContext context)
        {
            _userRepository = userRepository;
            _context = context;
            _roleRepository = new RoleRepository(context);
        }

        public async Task<List<UserDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllUsersAsync();
            return users.Select(MapToUserDto).ToList();
        }

        public async Task<UserDetailDto> GetUserByIdAsync(int userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return null;

            return new UserDetailDto
            {
                Id = user.UserId,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.PhoneNumber,
                Role = GetRoleLabel(user),
                Department = user.Department,
                CreditScore = user.Point,
                Status = user.Status?.ToLower() ?? "active",
                IsStudent = user.IsStudent ?? false,
                IsTeacher = user.IsTeacher ?? false,
                IsStaff = user.IsStaff ?? false
            };
        }

        public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
        {
            // Kiểm tra username đã tồn tại
            var existingUser = await _userRepository.GetUserByUsernameAsync(createUserDto.Username);
            if (existingUser != null)
                throw new Exception("Username đã tồn tại");

            // Kiểm tra email đã tồn tại
            existingUser = await _userRepository.GetUserByEmailAsync(createUserDto.Email);
            if (existingUser != null)
                throw new Exception("Email đã tồn tại");

            // Lấy RoleID dựa trên role string
            var roleId = createUserDto.Role;
            if (roleId == 0)
                throw new Exception("Vai trò không hợp lệ");

            // Hash password
            var passwordHash = HashPassword(createUserDto.Password);

            // Tạo user mới
            var user = new User
            {
                Username = createUserDto.Username,
                PasswordHash = passwordHash,
                FullName = createUserDto.FullName,
                Email = createUserDto.Email,
                PhoneNumber = createUserDto.Phone,
                RoleId = roleId,
                Department = createUserDto.Department,
                Point = 100,
                Status = "Active"
            };
            var role = await _roleRepository.GetRoleByIdAsync(createUserDto.Role);
            // Set flags dựa trên role
            switch (role.RoleName.ToLower())
            {
                case "student":
                    user.IsStudent = true;
                    break;
                case "teacher":
                    user.IsTeacher = true;
                    break;
                case "admin":
                case "manager":
                    user.IsStaff = true;
                    break;
            }

            var createdUser = await _userRepository.CreateUserAsync(user);
            return MapToUserDto(createdUser);
        }

        public async Task<UserDto> UpdateUserAsync(UpdateUserDto updateUserDto)
        {
            var user = await _userRepository.GetUserByIdAsync(updateUserDto.UserID);
            if (user == null)
                throw new Exception("Không tìm thấy người dùng");

            // Cập nhật thông tin
            if (!string.IsNullOrEmpty(updateUserDto.FullName))
                user.FullName = updateUserDto.FullName;

            if (!string.IsNullOrEmpty(updateUserDto.Email))
            {
                // Kiểm tra email mới có trùng với user khác không
                var existingUser = await _userRepository.GetUserByEmailAsync(updateUserDto.Email);
                if (existingUser != null && existingUser.UserId != user.UserId)
                    throw new Exception("Email đã được sử dụng bởi người dùng khác");
                
                user.Email = updateUserDto.Email;
            }

            if (!string.IsNullOrEmpty(updateUserDto.PhoneNumber))
                user.PhoneNumber = updateUserDto.PhoneNumber;

            if (!string.IsNullOrEmpty(updateUserDto.Department))
                user.Department = updateUserDto.Department;

            if (updateUserDto.RoleID.HasValue)
                user.RoleId = updateUserDto.RoleID.Value;

            var updatedUser = await _userRepository.UpdateUserAsync(user);
            return MapToUserDto(updatedUser);
        }

        public async Task<bool> DeleteUserAsync(int userId)
        {
            return await _userRepository.DeleteUserAsync(userId);
        }

        public async Task<bool> ToggleUserStatusAsync(int userId)
        {
            return await _userRepository.ToggleUserStatusAsync(userId);
        }

        public async Task<List<UserDto>> SearchUsersAsync(string searchTerm)
        {
            var users = await _userRepository.SearchUsersAsync(searchTerm);
            return users.Select(MapToUserDto).ToList();
        }

        public async Task<UserStatisticsDto> GetUserStatisticsAsync()
        {
            var stats = await _userRepository.GetUserStatisticsAsync();
            return new UserStatisticsDto
            {
                Total = stats["total"],
                Active = stats["active"],
                Locked = stats["locked"],
                Students = stats["students"],
                Teachers = stats["teachers"],
                Staff = stats["staff"]
            };
        }

        // Helper methods
        private UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.UserId,
                FullName = user.FullName,
                Role = GetRoleLabel(user),
                Email = user.Email,
                Phone = user.PhoneNumber,
                CreditScore = user.Point,
                Status = user.Status?.ToLower() ?? "active"
            };
        }

        private string GetRoleLabel(User user)
        {
            if (user.Role != null)
                return user.Role.RoleName;

            // Fallback nếu không có Role relation
            if (user.IsStaff == true) return "Admin";
            if (user.IsTeacher == true) return "Giảng viên";
            if (user.IsStudent == true) return "Sinh viên";
            return "Sinh viên";
        }

        private async Task<int> GetRoleIdByName(string roleName)
        {
            var role = await _context.Roles
                .FirstOrDefaultAsync(r => r.RoleName.ToLower() == GetRoleNameInVietnamese(roleName));
            
            return role?.RoleId ?? 0;
        }

        private string GetRoleNameInVietnamese(string roleCode)
        {
            return roleCode.ToLower() switch
            {
                "admin" => "admin",
                "manager" => "quản lý",
                "teacher" => "giảng viên",
                "student" => "sinh viên",
                _ => "sinh viên"
            };
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }
    }
}