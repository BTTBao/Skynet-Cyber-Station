import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Loader2, ArrowLeft, CheckCircle, CreditCard, 
    ShieldCheck, Home, AlertTriangle, Calendar, Clock, Banknote
} from 'lucide-react';

const API_BASE_URL = "https://localhost:7140/api";

const Checkout = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // 1. Fetch Invoice
    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const token = localStorage.getItem("token") || localStorage.getItem("authToken");
                const res = await fetch(`${API_BASE_URL}/Invoices/${invoiceId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`, 
                        "Content-Type": "application/json"
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setInvoice(data);
                } else if (res.status === 403) {
                    setError("⛔ Bạn không có quyền truy cập hóa đơn này.");
                } else if (res.status === 404) {
                    setError("🔍 Không tìm thấy hóa đơn.");
                } else {
                    setError("❌ Có lỗi xảy ra khi tải dữ liệu.");
                }
            } catch (error) {
                console.error(error);
                setError("❌ Lỗi kết nối đến máy chủ.");
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [invoiceId]);

    // 2. Thanh toán (Gửi yêu cầu thanh toán cọc)
    const handlePayment = async () => {
        setProcessingPayment(true);
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        try {
            const res = await fetch(`${API_BASE_URL}/Invoices/${invoiceId}/pay`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                setPaymentSuccess(true);
            } else {
                const errData = await res.json();
                alert(`Lỗi: ${errData.message || "Thanh toán thất bại"}`);
            }
        } catch (error) {
            alert("Lỗi kết nối.");
        } finally {
            setProcessingPayment(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-[#271756]"><Loader2 className="animate-spin w-10 h-10" /></div>;
    if (error) return <div className="h-screen flex items-center justify-center flex-col p-4"><AlertTriangle className="text-red-500 w-12 h-12 mb-2"/><p className="text-red-500 font-bold">{error}</p><button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg">Về trang chủ</button></div>;

    // --- TÍNH TOÁN HIỂN THỊ ---
    // Backend đã tính Deposit và lưu vào DB, nên ta lấy trực tiếp
    const totalAmount = invoice.totalAmount || 0;
    const depositAmount = invoice.deposit || 0; 
    const remainingAmount = totalAmount - depositAmount;

    // Giao diện Thành công
    if (paymentSuccess) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 animate-fade-in">
            <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={48} />
                </div>
                <h2 className="text-2xl font-black text-[#271756] mb-2">Đã thanh toán cọc!</h2>
                <p className="text-gray-500 mb-8">
                    Bạn đã thanh toán <b>{depositAmount.toLocaleString()} đ</b> (30%).
                    <br/>Phòng đã được giữ chỗ cho bạn.
                </p>
                <div className="space-y-3">
                    <button onClick={() => navigate('/history')} className="w-full py-3 bg-[#271756] text-white font-bold rounded-xl shadow-lg hover:bg-[#1a0f3d] transition">
                        Xem lịch sử đặt phòng
                    </button>
                    <button onClick={() => navigate('/')} className="w-full py-3 bg-white text-gray-600 border border-gray-200 font-bold rounded-xl hover:bg-gray-50 transition">
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F3F4F6] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header Navigation */}
                <div className="flex justify-between items-center mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-[#271756] font-medium transition">
                        <ArrowLeft size={20} className="mr-2" /> Quay lại
                    </button>
                    <button onClick={() => navigate('/')} className="flex items-center text-[#271756] bg-white px-4 py-2 rounded-full font-bold text-sm shadow-sm hover:shadow-md transition">
                        <Home size={18} className="mr-2" /> Trang chủ
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-[#271756] to-[#6b4c9a]"></div>
                            <div className="p-6 md:p-8">
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">Xác nhận đặt cọc</h1>
                                <p className="text-gray-500 text-sm mb-6">Mã hóa đơn: <span className="font-mono font-bold text-[#271756]">#{invoice.invoiceId}</span></p>
                                
                                <div className="space-y-4 border-t border-gray-100 pt-6">
                                    {/* Thông tin phòng */}
                                    <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-purple-600 shadow-sm"><Banknote size={24} /></div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase">Phòng thuê</p>
                                            <p className="font-bold text-lg text-[#271756]">{invoice.booking?.room?.roomName}</p>
                                            <p className="text-sm text-gray-600">{invoice.booking?.room?.roomType?.typeName}</p>
                                        </div>
                                    </div>

                                    {/* Thời gian */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                                            <Calendar className="text-gray-400" size={20}/>
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase">Ngày</p>
                                                <p className="font-semibold text-gray-800">{new Date(invoice.booking?.bookingDate).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                                            <Clock className="text-gray-400" size={20}/>
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase">Giờ</p>
                                                <p className="font-semibold text-gray-800">
                                                    {new Date(invoice.booking?.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(invoice.booking?.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Phương thức thanh toán */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><CreditCard size={20}/> Phương thức</h3>
                             <div className="border-2 border-[#271756] bg-purple-50 p-4 rounded-xl flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded"></div>
                                    <span className="font-bold text-[#271756]">Ví điện tử / Thẻ Ngân hàng</span>
                                </div>
                                <CheckCircle size={20} className="text-[#271756] fill-current" />
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: BILLING (QUAN TRỌNG) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 sticky top-6 border border-gray-100">
                            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-6">Chi tiết thanh toán</h3>
                            
                            <div className="space-y-4 mb-8 text-sm">
                                {/* Tổng tiền (Mờ đi) */}
                                <div className="flex justify-between text-gray-400">
                                    <span>Tổng giá trị thuê</span>
                                    <span className="line-through">{totalAmount.toLocaleString()} đ</span>
                                </div>

                                {/* Tiền cọc (Nổi bật) */}
                                <div className="flex justify-between items-center text-[#271756] bg-purple-50 p-3 rounded-lg border border-purple-100">
                                    <span className="font-bold">Cọc trước (30%)</span>
                                    <span className="text-xl font-black">{depositAmount.toLocaleString()} đ</span>
                                </div>

                                {/* Còn lại */}
                                <div className="flex justify-between text-gray-500 text-xs italic pt-2">
                                    <span>Còn lại (Thanh toán sau khi dùng)</span>
                                    <span>{remainingAmount.toLocaleString()} đ</span>
                                </div>
                            </div>

                            <button 
                                onClick={handlePayment}
                                disabled={processingPayment || invoice.status === "Paid"}
                                className={`w-full py-4 text-white font-bold rounded-xl transition transform active:scale-95 flex items-center justify-center gap-2 shadow-xl ${invoice.status === "Paid" ? "bg-green-600 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-[#271756] to-[#512da8] hover:shadow-purple-900/30"}`}
                            >
                                {processingPayment ? <Loader2 className="animate-spin" /> : invoice.status === "Paid" ? "ĐÃ THANH TOÁN CỌC" : `THANH TOÁN ${depositAmount.toLocaleString()} đ`}
                            </button>
                            
                            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-400 bg-gray-50 py-2 rounded-lg">
                                <ShieldCheck size={12} className="text-green-500"/> Thanh toán bảo mật SSL
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;