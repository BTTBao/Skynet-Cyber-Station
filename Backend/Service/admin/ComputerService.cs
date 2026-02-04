using Backend.DTOs;
using Backend.Models;
using Backend.Repository.admin;

namespace Backend.Service;

public class ComputerService 
{
    private readonly ComputerRepository _computerRepository;
    private readonly ILogger<ComputerService> _logger;

    private static readonly string[] ValidStatuses = { "active", "broken", "maintenance" };

    public ComputerService(
        ComputerRepository computerRepository,
        ILogger<ComputerService> logger)
    {
        _computerRepository = computerRepository;
        _logger = logger;
    }

    public async Task<List<ComputerResponse>> BulkCreateComputersAsync(BulkCreateComputerRequest request)
    {
        if (request.Capacity <= 0)
            throw new ArgumentException("Capacity must be greater than 0");

        var existingCount = await _computerRepository.CountByRoomIdAsync(request.RoomId);

        var computers = new List<Computer>();

        for (int i = 1; i <= request.Capacity; i++)
        {
            var number = existingCount + i;
            computers.Add(new Computer
            {
                RoomId = (int)request.RoomId,
                ComputerNumber = number.ToString(),
                ComputerName = $"Máy {number}",
                Specifications = request.Specifications,
                Status = "active"
            });
        }

        var saved = await _computerRepository.AddRangeAsync(computers);
        return saved.Select(ConvertToResponse).ToList();
    }


    public async Task<ComputerResponse> UpdateComputerStatusAsync(UpdateComputerStatusRequest request)
    {
        _logger.LogInformation("Updating status for computer number {Number} in room ID: {RoomId}",
            request.ComputerNumber, request.RoomId);

        // Validate status
        if (!ValidStatuses.Contains(request.Status.ToLower()))
        {
            throw new ArgumentException("Invalid status. Allowed values: active, broken, maintenance");
        }

        // Find computer
        var computer = await _computerRepository.GetByRoomIdAndNumberAsync(
            request.RoomId,
            request.ComputerNumber);

        if (computer == null)
        {
            throw new KeyNotFoundException(
                $"Computer not found with number {request.ComputerNumber} in room ID {request.RoomId}");
        }

        // Update status
        computer.Status = request.Status.ToLower();
        var updatedComputer = await _computerRepository.UpdateAsync(computer);

        _logger.LogInformation("Successfully updated computer {Name} status to {Status}",
            computer.ComputerName, request.Status);

        return ConvertToResponse(updatedComputer);
    }

    public async Task<List<ComputerResponse>> GetComputersByRoomIdAsync(long roomId)
    {
        _logger.LogInformation("Fetching all computers for room ID: {RoomId}", roomId);

        var computers = await _computerRepository.GetByRoomIdAsync(roomId);

        return computers.Select(ConvertToResponse).ToList();
    }

    public async Task<ComputerResponse> GetComputerAsync(long roomId, int computerNumber)
    {
        _logger.LogInformation("Fetching computer number {Number} in room ID: {RoomId}",
            computerNumber, roomId);

        var computer = await _computerRepository.GetByRoomIdAndNumberAsync(roomId, computerNumber);

        if (computer == null)
        {
            throw new KeyNotFoundException(
                $"Computer not found with number {computerNumber} in room ID {roomId}");
        }

        return ConvertToResponse(computer);
    }

    public async Task DeleteComputersByRoomIdAsync(long roomId)
    {
        _logger.LogInformation("Deleting all computers for room ID: {RoomId}", roomId);

        await _computerRepository.DeleteByRoomIdAsync(roomId);

        _logger.LogInformation("Successfully deleted all computers for room ID: {RoomId}", roomId);
    }

    private static ComputerResponse ConvertToResponse(Computer computer)
    {
        return new ComputerResponse
        {
            ComputerID = computer.ComputerId,
            RoomId = computer.RoomId,
            ComputerNumber = computer.ComputerNumber,
            ComputerName = computer.ComputerName,
            Specifications = computer.Specifications ?? string.Empty,
            Status = computer.Status
        };
    }
}