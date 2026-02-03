using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class Room
{
    public int RoomId { get; set; }

    public int RoomTypeId { get; set; }

    public string RoomCode { get; set; } = null!;

    public string RoomName { get; set; } = null!;

    public int Capacity { get; set; }

    public int? Floor { get; set; }

    public string? Description { get; set; }

    public string? Status { get; set; }

    public virtual ICollection<Computer> Computers { get; set; } = new List<Computer>();

    public virtual ICollection<RoomBooking> RoomBookings { get; set; } = new List<RoomBooking>();

    public virtual RoomType RoomType { get; set; } = null!;
}
