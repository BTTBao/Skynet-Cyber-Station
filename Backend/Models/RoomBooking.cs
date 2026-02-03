using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class RoomBooking
{
    public int BookingId { get; set; }

    public int UserId { get; set; }

    public int RoomId { get; set; }

    public DateOnly BookingDate { get; set; }

    public string? Purpose { get; set; }

    public int? NumberOfPeople { get; set; }

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public string? Status { get; set; }

    public bool? IsUsed { get; set; }

    public string? RejectionReason { get; set; }

    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    public virtual Room Room { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
