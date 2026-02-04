using Backend.DTOs;
using Backend.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;


[ApiController]
[Route("api/[controller]")]
public class ComputersController : ControllerBase
{
    private readonly ComputerService _computerService;

    public ComputersController(ComputerService computerService)
    {
        _computerService = computerService;
    }


    [HttpPost("bulk-create")]
    [ProducesResponseType(typeof(List<ComputerResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<List<ComputerResponse>>> BulkCreateComputers(
        [FromBody] BulkCreateComputerRequest request)
    {
       
        try
        {
            var computers = await _computerService.BulkCreateComputersAsync(request);
            return CreatedAtAction(
                nameof(GetComputersByRoom),
                new { roomId = request.RoomId },
                computers);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("update-status")]
    [ProducesResponseType(typeof(ComputerResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ComputerResponse>> UpdateComputerStatus(
        [FromBody] UpdateComputerStatusRequest request)
    {
        try
        {
            var computer = await _computerService.UpdateComputerStatusAsync(request);
            return Ok(computer);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }


    [HttpGet("room/{roomId}")]
    [ProducesResponseType(typeof(List<ComputerResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ComputerResponse>>> GetComputersByRoom(long roomId)
    {
        var computers = await _computerService.GetComputersByRoomIdAsync(roomId);
        return Ok(computers);
    }


    [HttpGet("room/{roomId}/computer/{computerNumber}")]
    [ProducesResponseType(typeof(ComputerResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ComputerResponse>> GetComputer(long roomId, int computerNumber)
    {
        try
        {
            var computer = await _computerService.GetComputerAsync(roomId, computerNumber);
            return Ok(computer);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpDelete("room/{roomId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteComputersByRoom(long roomId)
    {
        await _computerService.DeleteComputersByRoomIdAsync(roomId);
        return NoContent();
    }
}