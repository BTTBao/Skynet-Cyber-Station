using Backend.DTOs;
using Backend.Repository.admin;

namespace Backend.Service
{
    public class InvoiceService
    {
        private readonly InvoiceRepository _invoiceRepository;

        public InvoiceService(InvoiceRepository invoiceRepository)
        {
            _invoiceRepository = invoiceRepository;
        }

        /// <summary>
        /// Lấy toàn bộ hóa đơn với thông tin user, booking và room
        /// </summary>
        public async Task<IEnumerable<InvoiceDto2>> GetAllInvoicesFullAsync()
        {
            // Gọi repository để lấy dữ liệu đầy đủ
            var invoices = await _invoiceRepository.GetInvoicesFullAsync();

            // Nếu muốn, có thể xử lý thêm: filter, sort, format...
            return invoices;
        }

    }
}
