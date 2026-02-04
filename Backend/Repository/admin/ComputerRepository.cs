using Backend.Models;
using Microsoft.EntityFrameworkCore;
namespace Backend.Repository.admin;


public class ComputerRepository 
{
    private readonly QuanLyPhongMayContext _context;

    public ComputerRepository(QuanLyPhongMayContext context)
    {
        _context = context;
    }

    public async Task<List<Computer>> GetByRoomIdAsync(long roomId)
    {
        return await _context.Computers
            .Where(c => c.RoomId == roomId)
            .OrderBy(c => Convert.ToInt32(c.ComputerNumber))
            .ToListAsync();
    }

    public async Task<Computer?> GetByRoomIdAndNumberAsync(long roomId, int computerNumber)
    {
        return await _context.Computers
            .FirstOrDefaultAsync(c => c.RoomId == roomId && c.ComputerNumber == computerNumber.ToString());
    }

    public async Task<bool> ExistsByRoomIdAsync(long roomId)
    {
        return await _context.Computers.AnyAsync(c => c.RoomId == roomId);
    }

    public async Task<int> CountByRoomIdAsync(long roomId)
    {
        return await _context.Computers.CountAsync(c => c.RoomId == roomId);
    }

    public async Task<Computer> AddAsync(Computer computer)
    {
        await _context.Computers.AddAsync(computer);
        await _context.SaveChangesAsync();
        return computer;
    }

    public async Task<List<Computer>> AddRangeAsync(List<Computer> computers)
    {
        await _context.Computers.AddRangeAsync(computers);
        await _context.SaveChangesAsync();
        return computers;
    }

    public async Task<Computer> UpdateAsync(Computer computer)
    {
        _context.Computers.Update(computer);
        await _context.SaveChangesAsync();
        return computer;
    }

    public async Task DeleteByRoomIdAsync(long roomId)
    {
        var computers = await _context.Computers
            .Where(c => c.RoomId == roomId)
            .ToListAsync();

        _context.Computers.RemoveRange(computers);
        await _context.SaveChangesAsync();
    }
}