using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class IncidentReport
{
    public int ReportId { get; set; }

    public int UserId { get; set; }
    public int RoomId { get; set; }

    public string Description { get; set; } = null!;

    public DateTime? ReportDate { get; set; }

    public string? Status { get; set; }

    public virtual User User { get; set; } = null!;
    public virtual Room Room { get; set; } = null!;
}
