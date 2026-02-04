// Backend.Controllers.admin.InvoicessController
using Backend.DTOs;
using Backend.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers.admin
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class InvoicessController : ControllerBase
    {
        private readonly InvoiceService _invoiceService;

        public InvoicessController(InvoiceService invoiceService)
            => _invoiceService = invoiceService;

        /// <summary>
        /// Lấy tất cả hóa đơn
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _invoiceService.GetAllInvoicesFullAsync();
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Tạo hóa đơn mới
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateInvoiceDto createInvoiceDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ", errors = ModelState });
                }

                var result = await _invoiceService.CreateInvoiceAsync(createInvoiceDto);
                return CreatedAtAction(nameof(GetAll), new { id = result.InvoiceID },
                    new { success = true, message = "Tạo hóa đơn thành công", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Xác nhận thanh toán hóa đơn
        /// </summary>
        [HttpPatch("{id}/confirm-payment")]
        public async Task<IActionResult> ConfirmPayment(int id)
        {
            try
            {
                var result = await _invoiceService.ConfirmPaymentAsync(id);

                if (result == null)
                {
                    return NotFound(new { success = false, message = $"Không tìm thấy hóa đơn với ID {id}" });
                }

                return Ok(new { success = true, message = "Xác nhận thanh toán thành công", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}