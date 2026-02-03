using Backend.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers.admin
{
    [Route("api/[controller]")]
    [ApiController]
    public class InvoicesController : ControllerBase
    {
        private readonly InvoiceService _invoiceService;
        public InvoicesController(InvoiceService invoiceService) => _invoiceService = invoiceService;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _invoiceService.GetAllInvoicesFullAsync();
            return Ok(new { success = true, data = result });
        }

    }
}
