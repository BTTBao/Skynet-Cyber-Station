using Backend.DTOs;
using Backend.Models;
using Backend.Repository.admin;


namespace Backend.Service
{
    public interface IRoleService
    {
        Task<List<RoleDto>> GetAllRolesAsync();
        Task<RoleDto> GetRoleByIdAsync(int roleId);
    }

    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _roleRepository;

        public RoleService(IRoleRepository roleRepository)
        {
            _roleRepository = roleRepository;
        }

        public async Task<List<RoleDto>> GetAllRolesAsync()
        {
            var roles = await _roleRepository.GetAllRolesAsync();
            return roles.Select(MapToRoleDto).ToList();
        }

        public async Task<RoleDto> GetRoleByIdAsync(int roleId)
        {
            var role = await _roleRepository.GetRoleByIdAsync(roleId);
            return role != null ? MapToRoleDto(role) : null;
        }

        // Helper method để map Role entity sang RoleDto
        private RoleDto MapToRoleDto(Role role)
        {
            return new RoleDto
            {
                RoleId = role.RoleId,
                RoleName = role.RoleName,
                RoleCode = GetRoleCode(role.RoleName)
            };
        }

        // Helper method để convert role name sang role code
        private string GetRoleCode(string roleName)
        {
            return roleName.ToLower() switch
            {
                "admin" => "admin",
                "quản lý" => "manager",
                "giảng viên" => "teacher",
                "sinh viên" => "student",
                _ => "student"
            };
        }
    }
}