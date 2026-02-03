using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class Computer
{
    public int ComputerId { get; set; }

    public int RoomId { get; set; }

    public string? ComputerNumber { get; set; }

    public string? ComputerName { get; set; }

    public string? Specifications { get; set; }

    public string? Status { get; set; }

    public virtual Room Room { get; set; } = null!;
}
