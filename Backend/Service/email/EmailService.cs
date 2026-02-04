using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Options;
using Backend.Models; // Namespace chứa class EmailSettings
using Microsoft.Extensions.Logging;

namespace Backend.Service
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly ILogger<EmailService> _logger;

        // Inject EmailSettings qua IOptions và Logger
        public EmailService(IOptions<EmailSettings> emailSettings, ILogger<EmailService> logger)
        {
            _emailSettings = emailSettings.Value;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string message)
        {
            try
            {
                // 1. Tạo đối tượng MimeMessage
                var emailMessage = new MimeMessage();

                // Người gửi
                emailMessage.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SenderEmail));

                // Người nhận
                emailMessage.To.Add(MailboxAddress.Parse(toEmail));

                // Tiêu đề
                emailMessage.Subject = subject;

                // Nội dung (HTML)
                var builder = new BodyBuilder();
                builder.HtmlBody = message;
                emailMessage.Body = builder.ToMessageBody();

                // 2. Kết nối SMTP Client (Dùng MailKit)
                using var client = new SmtpClient();

                // Bỏ qua check SSL nếu dev local (Optional - dùng cho môi trường test nếu bị lỗi certificate)
                // client.CheckCertificateRevocation = false; 

                // Kết nối tới Server (Gmail: smtp.gmail.com, Port: 587, SSL: StartTls)
                await client.ConnectAsync(_emailSettings.MailServer, _emailSettings.MailPort, MailKit.Security.SecureSocketOptions.StartTls);

                // Xác thực
                await client.AuthenticateAsync(_emailSettings.SenderEmail, _emailSettings.Password);

                // Gửi mail
                await client.SendAsync(emailMessage);

                // Ngắt kết nối
                await client.DisconnectAsync(true);

                _logger.LogInformation($"[EmailService] Đã gửi mail thành công đến: {toEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"[EmailService] Lỗi khi gửi mail đến {toEmail}: {ex.Message}");
                // Ném lỗi ra để Controller biết (nếu cần), hoặc nuốt lỗi tùy logic của bạn
                throw;
            }
        }
    }
}