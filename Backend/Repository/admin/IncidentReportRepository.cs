
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository.admin
{
    public interface IIncidentReportRepository
    {
        Task<IEnumerable<IncidentReport>> GetAllAsync();
        Task<IncidentReport?> GetByIdAsync(int reportId);
        Task<IEnumerable<IncidentReport>> GetByUserIdAsync(int userId);
        Task<IEnumerable<IncidentReport>> GetByRoomIdAsync(int roomId);
        Task<IEnumerable<IncidentReport>> GetByStatusAsync(string status);
        Task<IncidentReport> CreateAsync(IncidentReport incidentReport);
        Task<IncidentReport?> UpdateAsync(IncidentReport incidentReport);
        Task<bool> DeleteAsync(int reportId);
        Task<bool> ExistsAsync(int reportId);
        Task<int> GetTotalCountAsync();
        Task<int> GetCountByStatusAsync(string status);

    }
    public class IncidentReportRepository : IIncidentReportRepository
    {
        private readonly QuanLyPhongMayContext _context;

        public IncidentReportRepository(QuanLyPhongMayContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<IncidentReport>> GetAllAsync()
        {
            return await _context.IncidentReports
                .Include(ir => ir.User)
                .Include(ir => ir.Room)
                .OrderByDescending(ir => ir.ReportDate)
                .ToListAsync();
        }

        public async Task<IncidentReport?> GetByIdAsync(int reportId)
        {
            return await _context.IncidentReports
                .Include(ir => ir.User)
                .Include(ir => ir.Room)
                .FirstOrDefaultAsync(ir => ir.ReportId == reportId);
        }

        public async Task<IEnumerable<IncidentReport>> GetByUserIdAsync(int userId)
        {
            return await _context.IncidentReports
                .Include(ir => ir.User)
                .Include(ir => ir.Room)
                .Where(ir => ir.UserId == userId)
                .OrderByDescending(ir => ir.ReportDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<IncidentReport>> GetByRoomIdAsync(int roomId)
        {
            return await _context.IncidentReports
                .Include(ir => ir.User)
                .Include(ir => ir.Room)
                .Where(ir => ir.RoomId == roomId)
                .OrderByDescending(ir => ir.ReportDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<IncidentReport>> GetByStatusAsync(string status)
        {
            return await _context.IncidentReports
                .Include(ir => ir.User)
                .Include(ir => ir.Room)
                .Where(ir => ir.Status == status)
                .OrderByDescending(ir => ir.ReportDate)
                .ToListAsync();
        }

        public async Task<IncidentReport> CreateAsync(IncidentReport incidentReport)
        {
            _context.IncidentReports.Add(incidentReport);
            await _context.SaveChangesAsync();

            // Load related entities
            await _context.Entry(incidentReport)
                .Reference(ir => ir.User)
                .LoadAsync();
            await _context.Entry(incidentReport)
                .Reference(ir => ir.Room)
                .LoadAsync();

            return incidentReport;
        }

        public async Task<IncidentReport?> UpdateAsync(IncidentReport incidentReport)
        {
            var existing = await _context.IncidentReports.FindAsync(incidentReport.ReportId);
            if (existing == null)
                return null;

            _context.Entry(existing).CurrentValues.SetValues(incidentReport);
            await _context.SaveChangesAsync();

            // Load related entities
            await _context.Entry(existing)
                .Reference(ir => ir.User)
                .LoadAsync();
            await _context.Entry(existing)
                .Reference(ir => ir.Room)
                .LoadAsync();

            return existing;
        }

        public async Task<bool> DeleteAsync(int reportId)
        {
            var incidentReport = await _context.IncidentReports.FindAsync(reportId);
            if (incidentReport == null)
                return false;

            _context.IncidentReports.Remove(incidentReport);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int reportId)
        {
            return await _context.IncidentReports.AnyAsync(ir => ir.ReportId == reportId);
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _context.IncidentReports.CountAsync();
        }

        public async Task<int> GetCountByStatusAsync(string status)
        {
            return await _context.IncidentReports
                .Where(ir => ir.Status == status)
                .CountAsync();
        }
    }
}