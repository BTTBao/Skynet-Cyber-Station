using System.Threading.Tasks;

namespace Backend.Service
{
    public interface IEmailService
    {
        /// <summary>
        /// Gửi email bất đồng bộ
        /// </summary>
        /// <param name="toEmail">Địa chỉ người nhận</param>
        /// <param name="subject">Tiêu đề email</param>
        /// <param name="message">Nội dung (hỗ trợ HTML)</param>
        Task SendEmailAsync(string toEmail, string subject, string message);
    }
}