import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, Lock, Mail, Phone, Loader2, 
  AlertCircle, CheckCircle, ArrowRight, LogIn, Home, Shield 
} from "lucide-react";

const AuthPage = () => {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    confirmPassword: ""
  });

  // --- HÀM XỬ LÝ ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const switchMode = (mode) => {
    setError("");
    setSuccessMsg("");
    setIsLogin(mode);
  };

  // --- LOGIC SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    const BASE_URL = "https://localhost:7140/api/client/Users";

    try {
      if (isLogin) {
        // === ĐĂNG NHẬP ===
        const response = await fetch(`${BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          }),
        });

        if (!response.ok) {
           const errText = await response.text();
           throw new Error(errText || "Tài khoản hoặc mật khẩu không đúng.");
        }

        const data = await response.json();
        
        // ✅ KIỂM TRA ROLE ADMIN
        const userRole = data.user?.role || data.role || "";
        const isAdmin = userRole.toLowerCase() === "admin";

        // Lưu thông tin đăng nhập
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
        localStorage.setItem("currentUser", JSON.stringify(data.user || data));
        localStorage.setItem("isAdmin", isAdmin.toString());

        // Hiển thị thông báo thành công
        if (isAdmin) {
          alert("✅ Đăng nhập thành công với quyền Admin!");
          navigate("/admin");
        } else {
          alert("✅ Đăng nhập thành công!");
          navigate("/");
        }
      } else {
        // === ĐĂNG KÝ ===
        if (formData.password !== formData.confirmPassword) {
            throw new Error("Mật khẩu xác nhận không khớp!");
        }
        if (formData.password.length < 6) {
            throw new Error("Mật khẩu phải từ 6 ký tự trở lên.");
        }

        const registerPayload = {
            fullName: formData.fullName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            username: formData.username,
            password: formData.password
        };

        const response = await fetch(`${BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registerPayload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Đăng ký thất bại.");
        }

        setSuccessMsg("🎉 Đăng ký thành công! Vui lòng đăng nhập.");
        setIsLogin(true); 
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
      }

    } catch (err) {
      console.error("Auth Error:", err);
      if (err.message.includes("Failed to fetch")) {
          setError("Không thể kết nối đến máy chủ Backend.");
      } else {
          setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10 relative">
      
      {/* --- NÚT VỀ TRANG CHỦ --- */}
      <button 
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-all transform hover:-translate-x-1"
      >
        <Home className="w-5 h-5" />
        Về trang chủ
      </button>

      <div className="max-w-lg w-full bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 transition-all">
        
        {/* --- HEADER TABS --- */}
        <div className="flex border-b border-gray-200">
            <button 
                onClick={() => switchMode(true)}
                className={`flex-1 py-4 text-center font-semibold text-sm transition-colors ${isLogin ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 bg-gray-50'}`}
            >
                ĐĂNG NHẬP
            </button>
            <button 
                onClick={() => switchMode(false)}
                className={`flex-1 py-4 text-center font-semibold text-sm transition-colors ${!isLogin ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 bg-gray-50'}`}
            >
                ĐĂNG KÝ
            </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
                {isLogin ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}
            </h2>
            <p className="text-gray-500 text-sm mt-2">
                {isLogin ? "Đăng nhập để quản lý phòng máy" : "Điền thông tin bên dưới để bắt đầu"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* THÔNG BÁO LỖI / THÀNH CÔNG */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* --- FORM FIELDS --- */}
            
            {/* ĐĂNG KÝ ONLY */}
            {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text" name="fullName" required
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Nguyễn Văn A"
                      value={formData.fullName} onChange={handleChange}
                    />
                  </div>
                </div>
            )}

            {!isLogin && (
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                            type="email" name="email" required
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="abc@mail.com"
                            value={formData.email} onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                            type="text" name="phoneNumber"
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="0912..."
                            value={formData.phoneNumber} onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* SHARED FIELDS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text" name="username" required
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white"
                  placeholder="username123"
                  value={formData.username} onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="password" name="password" required
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="••••••••"
                  value={formData.password} onChange={handleChange}
                />
              </div>
            </div>

            {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu</label>
                  <div className="relative">
                    <CheckCircle className={`absolute left-3 top-2.5 h-5 w-5 ${formData.confirmPassword && formData.password === formData.confirmPassword ? "text-green-500" : "text-gray-400"}`} />
                    <input
                      type="password" name="confirmPassword" required
                      className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${formData.confirmPassword && formData.password !== formData.confirmPassword ? "border-red-300 bg-red-50" : "border-gray-300"}`}
                      placeholder="••••••••"
                      value={formData.confirmPassword} onChange={handleChange}
                    />
                  </div>
                </div>
            )}

            {/* BUTTON SUBMIT */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 mt-6 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Đang xử lý...
                </>
              ) : isLogin ? (
                <>
                    <LogIn className="mr-2 h-4 w-4" /> Đăng nhập
                </>
              ) : (
                <>
                    Đăng ký ngay <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* FOOTER */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            <button 
                onClick={() => switchMode(!isLogin)}
                className="font-semibold text-blue-600 hover:text-blue-500 hover:underline bg-transparent border-none cursor-pointer"
            >
                {isLogin ? "Đăng ký ngay" : "Đăng nhập ngay"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;