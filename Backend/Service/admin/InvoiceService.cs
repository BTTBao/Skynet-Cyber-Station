// Backend.Service.InvoiceService
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
            var invoices = await _invoiceRepository.GetInvoicesFullAsync();
            return invoices;
        }

        /// <summary>
        /// Tạo hóa đơn mới
        /// </summary>
        public async Task<InvoiceDto2> CreateInvoiceAsync(CreateInvoiceDto createInvoiceDto)
        {
            // Validate dữ liệu đầu vào
            if (createInvoiceDto.TotalAmount <= 0)
            {
                throw new Exception("Tổng tiền phải lớn hơn 0");
            }

            if (createInvoiceDto.Deposit.HasValue && createInvoiceDto.Deposit < 0)
            {
                throw new Exception("Tiền đặt cọc không được âm");
            }

            if (createInvoiceDto.Deposit.HasValue && createInvoiceDto.Deposit > createInvoiceDto.TotalAmount)
            {
                throw new Exception("Tiền đặt cọc không được lớn hơn tổng tiền");
            }

            // Gọi repository để tạo hóa đơn (UserID sẽ tự động lấy từ Booking)
            var invoice = await _invoiceRepository.CreateInvoiceAsync(createInvoiceDto);

            // Lấy lại thông tin đầy đủ của hóa đơn vừa tạo
            var invoiceDto = await _invoiceRepository.GetInvoiceByIdAsync(invoice.InvoiceId);
            return invoiceDto;
        }

        /// <summary>
        /// Xác nhận thanh toán hóa đơn
        /// </summary>
        public async Task<InvoiceDto2> ConfirmPaymentAsync(int invoiceId)
        {
            // Kiểm tra hóa đơn tồn tại
            var existingInvoice = await _invoiceRepository.GetInvoiceByIdAsync(invoiceId);

            if (existingInvoice == null)
            {
                return null;
            }

            // Kiểm tra xem đã thanh toán chưa
            if (existingInvoice.Status == "Đã thanh toán")
            {
                throw new Exception("Hóa đơn này đã được thanh toán trước đó");
            }

            // Cập nhật trạng thái và ngày thanh toán
            var updatedInvoice = await _invoiceRepository.ConfirmPaymentAsync(invoiceId);

            // Lấy lại thông tin đầy đủ sau khi cập nhật
            var invoiceDto = await _invoiceRepository.GetInvoiceByIdAsync(updatedInvoice.InvoiceId);
            return invoiceDto;
        }
    }
}