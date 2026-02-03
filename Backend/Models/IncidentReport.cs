using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class IncidentReport
{
    public int ReportId { get; set; }

    public int UserId { get; set; }

    public string Title { get; set; } = null!;

    public string Description { get; set; } = null!;

    public string? Status { get; set; }

    public virtual User User { get; set; } = null!;
}
