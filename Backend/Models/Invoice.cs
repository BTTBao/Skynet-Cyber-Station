using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class Invoice
{
    public int InvoiceId { get; set; }

    public int BookingId { get; set; }

    public int UserId { get; set; }

    public decimal TotalAmount { get; set; }

    public string? Status { get; set; }

    public decimal? Deposit { get; set; }

    public DateTime? PaymentDate { get; set; }

    public virtual RoomBooking Booking { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
