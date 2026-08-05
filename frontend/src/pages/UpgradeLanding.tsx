import React, { useState } from "react";
import { Check, X, KeyRound, QrCode, Sparkles, HeartHandshake } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../services/api";
import type { AxiosError } from "axios";

interface ApiErrorBody {
  detail?: string;
}

interface UpgradeLandingProps {
  onUserUpdated?: () => void;
}

const UpgradeLanding: React.FC<UpgradeLandingProps> = ({ onUserUpdated }) => {
  const [licenseKey, setLicenseKey] = useState("");
  const [activating, setActivating] = useState(false);

  const activateLicense = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!licenseKey.trim()) return;
    setActivating(true);
    try {
      await api.put("/users/me/upgrade", { key: licenseKey.trim() });
      setLicenseKey("");
      toast.success("Kích hoạt thành công! Giao diện của bạn đã được nâng cấp lên gói PRO tối ưu!");
      onUserUpdated?.();
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorBody>;
      const detail = axiosError.response?.data?.detail;
      if (axiosError.response?.status === 429) {
        toast.error(detail || "Bạn thử quá nhanh, vui lòng đợi 1 phút.");
      } else {
        toast.error(detail || "License Key không hợp lệ hoặc đã được sử dụng.");
      }
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1 text-xs font-bold text-amber-500 animate-bounce">
          <Sparkles className="h-3.5 w-3.5" />
          <span>NovaChat Premium Upgrade</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Nâng tầm doanh nghiệp với <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-black">NovaChat PRO</span>
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Mở khóa toàn bộ các tính năng AI cao cấp, tinh chỉnh giao diện chatbot tùy ý và gỡ bỏ hoàn toàn nhãn thương hiệu.
        </p>
      </div>

      {/* Pricing Comparison Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Free Plan Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gói cơ bản</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">FREE Tier</h2>
              <p className="text-xs text-slate-500 mt-1">Trải nghiệm các tính năng cốt lõi của chatbot.</p>
            </div>
            
            <div className="flex items-baseline gap-1.5 border-b border-slate-100 pb-5">
              <span className="text-4xl font-black text-slate-900">0đ</span>
              <span className="text-xs text-slate-500 font-semibold">/ trọn đời</span>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-600">
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Giao diện Light Mode cơ bản</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-450">
                <Check className="h-4 w-4 text-emerald-550 shrink-0" />
                <span>Nhập mã nhúng widget</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <X className="h-4 w-4 text-red-400 shrink-0" />
                <span className="line-through">Nhúng widget không giới hạn tin nhắn (Giới hạn 50 tin/tháng)</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <X className="h-4 w-4 text-red-400 shrink-0" />
                <span className="line-through">Không chứa banner quảng cáo tài trợ</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <X className="h-4 w-4 text-red-400 shrink-0" />
                <span className="line-through">Tùy biến Avatar, tên bot, màu sắc riêng biệt</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <X className="h-4 w-4 text-red-400 shrink-0" />
                <span className="line-through">Khóa domain bảo mật widget</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <X className="h-4 w-4 text-red-400 shrink-0" />
                <span className="line-through">Xem Thống kê & Báo cáo nâng cao</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <X className="h-4 w-4 text-red-400 shrink-0" />
                <span className="line-through">Gỡ bỏ nhãn thương hiệu (Watermark)</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-500 font-bold">
            Gói hiện tại của bạn
          </div>
        </div>

        {/* Pro Plan Card */}
        <div className="rounded-3xl border-2 border-indigo-600 bg-slate-900 text-white p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
          {/* Badge indicator */}
          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase px-4 py-1 rounded-bl-xl tracking-wider">
            KHUYÊN DÙNG
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Gói tối ưu</span>
              <h2 className="text-2xl font-black text-white mt-1">PRO Tier</h2>
              <p className="text-xs text-slate-400 mt-1">Giải pháp hỗ trợ khách hàng chuyên nghiệp bằng AI.</p>
            </div>
            
            <div className="flex items-baseline gap-1.5 border-b border-slate-800 pb-5">
              <span className="text-4xl font-black text-white bg-gradient-to-r from-white via-indigo-200 to-pink-300 bg-clip-text text-transparent">Premium</span>
              <span className="text-xs text-slate-400 font-semibold">/ theo giấy phép</span>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-450 shrink-0 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                <span className="font-semibold text-white">Nâng cấp giao diện Premium Dark Mode</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-450 shrink-0 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                <span>Không giới hạn tin nhắn gửi đi của Chatbot</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-450 shrink-0 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                <span>Tắt hoàn toàn các banner quảng cáo tài trợ</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-450 shrink-0 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                <span>Tự do tùy biến giao diện, avatar, tên bot, màu chủ đạo</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-450 shrink-0 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                <span>Khóa domain bảo mật widget chống copy mã nhúng</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-450 shrink-0 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                <span>Mở khóa toàn bộ Thống kê & Báo cáo nâng cao</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-450 shrink-0 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                <span>Gỡ bỏ watermark "Powered by NovaChat" vĩnh viễn</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 text-center text-xs text-indigo-400 font-bold">
            Kích hoạt ở biểu mẫu phía dưới
          </div>
        </div>
      </div>

      {/* Unlock Methods Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-t border-slate-200 pt-10">
        
        {/* QR Code section */}
        <div className="md:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center text-center space-y-4">
          <h3 className="flex items-center gap-2 font-bold text-slate-800 text-sm uppercase tracking-wider">
            <QrCode className="h-5 w-5 text-indigo-600" />
            <span>1. Liên hệ Chủ doanh nghiệp</span>
          </h3>
          
          <p className="text-xs text-slate-500 leading-relaxed">
            Quét mã QR để liên hệ trực tiếp với chúng tôi qua Zalo/Hỗ trợ để mua và nhận License Key kích hoạt gói PRO trọn vẹn.
          </p>

          {/* SVG QR Code Mockup */}
          <div className="w-40 h-40 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-3 shadow-inner relative overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
              <path d="M0 0h30v10H10v20H0V0zm70 0h30v30H90V10H70V0zM0 70h10v20h20v10H0V70zm90 20H70v10h30V70H90v20z" fill="currentColor"/>
              <path d="M15 15h10v10H15zm60 0h10v10H75zm0 60h10v10H75z" fill="currentColor"/>
              <path d="M35 15h5v5h-5zm10 0h5v5h-5zm0 10h5v5h-5zm10-10h5v5h-5zm0 10h5v5h-5zm10 0h5v5h-5zM35 35h5v5h-5zm10 0h5v5h-5zm10 0h5v5h-5zm10 0h5v5h-5zM15 45h5v5h-5zm10 0h5v5h-5zm15 0h5v5h-5zm10 0h5v5h-5zm10 0h5v5h-5zm10 0h5v5h-5zM15 55h5v5h-5zm10 0h5v5h-5zm25 0h5v5h-5zm10 0h5v5h-5zm10 0h5v5h-5zM35 65h5v5h-5zm10 0h5v5h-5zm15 0h5v5h-5zm10 0h5v5h-5zM45 75h5v5h-5zm10 0h5v5h-5zm10 0h5v5h-5zM35 85h5v5h-5zm10 0h5v5h-5zm15 0h5v5h-5z" fill="currentColor"/>
            </svg>
            <div className="absolute inset-0 bg-indigo-500/5 flex items-center justify-center">
              <div className="w-9 h-9 bg-white rounded-xl shadow-md border border-slate-100 flex items-center justify-center">
                <HeartHandshake className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </div>
          
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">ZALO / HOTLINE: 0987.654.321</span>
        </div>

        {/* License key form */}
        <div className="md:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 w-full">
          <h3 className="flex items-center gap-2 font-bold text-slate-800 text-sm uppercase tracking-wider">
            <KeyRound className="h-5 w-5 text-indigo-600" />
            <span>2. Nhập mã License Key</span>
          </h3>

          <p className="text-xs text-slate-500 leading-relaxed">
            Nếu bạn đã sở hữu khóa kích hoạt (License Key) được cấp từ chủ doanh nghiệp, vui lòng điền vào biểu mẫu bên dưới để nâng cấp tài khoản của bạn lên PRO ngay lập tức.
          </p>

          <form onSubmit={activateLicense} className="space-y-4">
            <div className="relative rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <KeyRound className="h-4 w-4" />
              </span>
              <input
                required
                placeholder="NOVA-XXXX-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={(event) => setLicenseKey(event.target.value)}
                className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
            
            <button
              type="submit"
              disabled={activating}
              className="w-full cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-pink-650 transition disabled:opacity-50"
            >
              {activating ? "Đang xử lý kích hoạt..." : "Kích hoạt tài khoản PRO 🚀"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default UpgradeLanding;
