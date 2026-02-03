using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository.admin
{
    public interface IUserRepository
    {
        Task<List<User>> GetAllUsersAsync();
        Task<User> GetUserByIdAsync(int userId);
        Task<User> GetUserByUsernameAsync(string username);
        Task<User> GetUserByEmailAsync(string email);
        Task<User> CreateUserAsync(User user);
        Task<User> UpdateUserAsync(User user);
        Task<bool> DeleteUserAsync(int userId);
        Task<bool> ToggleUserStatusAsync(int userId);
        Task<List<User>> SearchUsersAsync(string searchTerm);
        Task<Dictionary<string, int>> GetUserStatisticsAsync();
    }

    public class UserRepository : IUserRepository
    {
        private readonly QuanLyPhongMayContext _context;

        public UserRepository(QuanLyPhongMayContext context)
        {
            _context = context;
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _context.Users
                .Include(u => u.Role)
                .OrderByDescending(u => u.UserId)
                .ToListAsync();
        }

        public async Task<User> GetUserByIdAsync(int userId)
        {
            return await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId);
        }

        public async Task<User> GetUserByUsernameAsync(string username)
        {
            return await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> CreateUserAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return await GetUserByIdAsync(user.UserId);
        }

        public async Task<User> UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return await GetUserByIdAsync(user.UserId);
        }

        public async Task<bool> DeleteUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleUserStatusAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.Status = user.Status == "Active" ? "Locked" : "Active";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<User>> SearchUsersAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetAllUsersAsync();

            searchTerm = searchTerm.ToLower().Trim();

            return await _context.Users
                .Include(u => u.Role)
                .Where(u => 
                    u.FullName.ToLower().Contains(searchTerm) ||
                    u.Email.ToLower().Contains(searchTerm) ||
                    u.PhoneNumber.Contains(searchTerm) ||
                    u.Username.ToLower().Contains(searchTerm) ||
                    u.Role.RoleName.ToLower().Contains(searchTerm)
                )
                .OrderByDescending(u => u.UserId)
                .ToListAsync();
        }

        public async Task<Dictionary<string, int>> GetUserStatisticsAsync()
        {
            var stats = new Dictionary<string, int>
            {
                ["total"] = await _context.Users.CountAsync(),
                ["active"] = await _context.Users.CountAsync(u => u.Status == "Active"),
                ["locked"] = await _context.Users.CountAsync(u => u.Status == "Locked"),
                ["students"] = await _context.Users.CountAsync(u => u.IsStudent == true),
                ["teachers"] = await _context.Users.CountAsync(u => u.IsTeacher == true),
                ["staff"] = await _context.Users.CountAsync(u => u.IsStaff == true)
            };

            return stats;
        }
    }
}