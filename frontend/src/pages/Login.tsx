import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { AxiosError } from "axios";
import api from "../services/api";
import { Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2, ArrowRight, User } from "lucide-react";

interface ApiErrorBody {
  detail?: string;
}

const getApiErrorDetail = (error: unknown) => {
  const axiosError = error as AxiosError<ApiErrorBody>;
  return axiosError.response?.data?.detail;
};

// Cache full_name vao localStorage (cung cho o voi "email"/"token" da dung san)
// de Dashboard hien duoc ten thay vi email ma khong can them Context/state dung chung.
const cacheCurrentUserName = async () => {
  try {
    const me = await api.get("/users/me");
    if (me.data.full_name) {
      localStorage.setItem("full_name", me.data.full_name);
    } else {
      localStorage.removeItem("full_name");
    }
  } catch {
    localStorage.removeItem("full_name");
  }
};

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const invitation = searchParams.get("invite");
    if (invitation) sessionStorage.setItem("workspace_invitation", invitation);
    const token = searchParams.get("token");
    const googleEmail = searchParams.get("email");
    if (!token) return;
    localStorage.setItem("token", token);
    if (googleEmail) localStorage.setItem("email", googleEmail);
    const pendingInvitation = sessionStorage.getItem("workspace_invitation");
    const acceptInvitation = pendingInvitation
      ? api.post(`/workspaces/invitations/${pendingInvitation}/accept`)
      : Promise.resolve();
    void acceptInvitation.finally(() => {
      void cacheCurrentUserName().finally(() => {
        sessionStorage.removeItem("workspace_invitation");
        navigate("/dashboard", { replace: true });
      });
    });
  }, [navigate, searchParams]);

  const googleLoginUrl = `${
    import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"
  }/auth/google/login`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        // Gọi API Đăng ký
        await api.post("/auth/register", { email, password, full_name: fullName });
        alert("Đăng ký thành công! Hãy đăng nhập bằng tài khoản này.");
        setIsRegister(false);
        setPassword("");
        setFullName("");
        setShowPassword(false);
      } else {
        // Gọi API Đăng nhập
        const response = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("email", email);
        await cacheCurrentUserName();
        const pendingInvitation = sessionStorage.getItem("workspace_invitation");
        if (pendingInvitation) {
          await api.post(`/workspaces/invitations/${pendingInvitation}/accept`);
          sessionStorage.removeItem("workspace_invitation");
        }
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      console.error(err);
      setError(getApiErrorDetail(err) || "Đã xảy ra lỗi. Vui lòng kiểm tra lại kết nối.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="novachat-dark flex min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 relative">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[40rem] h-[40rem] bg-purple-650/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[30rem] h-[30rem] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 grid min-h-screen w-full lg:grid-cols-12">
        {/* Left Side - Branding & Visuals (Desktop only) */}
        <div className="relative hidden flex-col justify-between overflow-hidden border-r border-slate-900 bg-slate-900/10 p-12 lg:col-span-7 lg:flex backdrop-blur-md">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img src="/favicon.png" alt="NovaChat Logo" className="h-12 w-12 object-contain shadow-lg shadow-indigo-500/20" />
            <span className="text-xl font-black text-white bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-wide">
              NovaChat AI
            </span>
          </div>

          {/* Center Showcase */}
          <div className="max-w-md my-auto space-y-8 relative z-10">
            <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Nền tảng quản lý Bot AI</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black leading-tight text-white tracking-tight">
                Tạo dựng và quản trị{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-black">
                  Chatbot thông minh
                </span>{" "}
                chỉ trong vài phút.
              </h1>
              <p className="text-sm leading-relaxed text-slate-400">
                Nền tảng giúp bạn quản lý nhiều không gian làm việc khác nhau, huấn luyện dữ liệu tùy chỉnh và tích hợp trực tiếp các trợ lý ảo AI tốt nhất vào doanh nghiệp của bạn.
              </p>
            </div>

            {/* Feature List */}
            <ul className="space-y-4">
              {[
                "Quản lý nhiều Không gian làm việc riêng biệt",
                "Kết nối và đồng bộ dữ liệu nhanh chóng",
                "Giao diện quản lý trực quan và dễ sử dụng",
                "Phân quyền quản trị thông tin bảo mật tuyệt đối",
              ].map((text, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-450 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                  <span className="text-sm font-semibold text-slate-300">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer Info */}
          <div className="text-xs text-slate-650 font-medium">
            © 2026 NovaChat AI. Dự án môn học Kiến trúc Phần mềm - Nhóm 1.
          </div>
        </div>

        {/* Right Side - Authentication Form */}
        <div className="col-span-12 flex items-center justify-center p-6 sm:p-12 lg:col-span-5 relative z-10">
          <div className="w-full max-w-md space-y-6">
            {/* Branding for Mobile */}
            <div className="flex lg:hidden items-center justify-center space-x-3 mb-6">
              <img src="/favicon.png" alt="NovaChat Logo" className="h-10 w-10 object-contain shadow-lg shadow-indigo-500/20" />
              <span className="text-2xl font-black text-white bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">
                NovaChat AI
              </span>
            </div>

            {/* Card Form */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-3xl font-black text-white tracking-tight">
                  {isRegister ? "Đăng ký tài khoản" : "Chào mừng trở lại"}
                </h2>
                <p className="text-xs text-slate-400">
                  {isRegister
                    ? "Tạo tài khoản quản trị để trải nghiệm hệ thống"
                    : "Đăng nhập để quản lý chatbot của bạn"}
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-400 flex items-start space-x-2">
                  <span className="font-bold">⚠️ Lỗi:</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {isRegister && (
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Họ và tên
                    </label>
                    <div className="relative rounded-xl border border-slate-800 bg-slate-950/60 transition-all focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-550">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-700"
                        placeholder="Nguyễn Văn A"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Địa chỉ Email
                  </label>
                  <div className="relative rounded-xl border border-slate-800 bg-slate-950/60 transition-all focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-555">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-700"
                      placeholder="admin@novachat.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Mật khẩu
                  </label>
                  <div className="relative rounded-xl border border-slate-800 bg-slate-950/60 transition-all focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-555">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-transparent py-3.5 pl-11 pr-12 text-sm text-white outline-none placeholder:text-slate-700"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 transition-colors hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative mt-2 w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-650 font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 transform active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                >
                  <div className="flex w-full items-center justify-center space-x-2 px-4 py-3.5 text-sm">
                    <span>{loading ? "Đang xử lý..." : isRegister ? "Đăng ký" : "Đăng nhập"}</span>
                    {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                  </div>
                </button>
              </form>

              {!isRegister && (
                <>
                  <div className="my-5 flex items-center gap-3 text-xs text-slate-650">
                    <span className="h-px flex-1 bg-slate-800" />
                    hoặc
                    <span className="h-px flex-1 bg-slate-800" />
                  </div>
                  <a
                    href={googleLoginUrl}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-800 bg-white/5 px-4 py-3.5 text-sm font-bold text-slate-200 transition-all hover:bg-white/10 active:scale-[0.98]"
                  >
                    <span className="flex h-5 w-5 items-center justify-center font-black text-indigo-400">G</span>
                    Tiếp tục với Google
                  </a>
                </>
              )}

              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError(null);
                    setPassword("");
                    setFullName("");
                  }}
                  className="text-indigo-455 hover:text-indigo-350 font-bold text-sm transition-colors cursor-pointer"
                >
                  {isRegister
                    ? "Đã có tài khoản quản trị? Đăng nhập ngay"
                    : "Chưa có tài khoản? Tạo tài khoản mới"}
                </button>
              </div>
            </div>

            {/* Footer for Mobile */}
            <div className="block lg:hidden text-center text-xs text-slate-600 font-medium mt-4">
              © 2026 NovaChat AI. Dự án môn học Kiến trúc Phần mềm - Nhóm 1.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
