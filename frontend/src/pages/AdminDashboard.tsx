import { useCallback, useEffect, useState } from "react";
import { KeyRound, Plus, ShieldCheck, Trash2, UserCog, Users, Building, Calendar as CalendarIcon, Search, LayoutDashboard } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../services/api";

interface DashboardStats {
  total_licenses: number;
  active_licenses: number;
  expired_licenses: number;
  assigned_licenses: number;
  total_customers: number;
}

interface LicenseKeyRow {
  id: number;
  key: string;
  status: "AVAILABLE" | "USED" | "REVOKED" | "EXPIRED" | "DISABLED";
  assigned_to_user_id: number | null;
  assigned_to_email: string | null;
  used_by_user_id: number | null;
  used_by_email: string | null;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

interface AdminUserRow {
  id: number;
  email: string;
  full_name: string | null;
  company_name: string | null;
  role: string;
  plan: "FREE" | "PRO";
  is_active: boolean;
}

const STATUS_STYLE: Record<string, string> = {
  AVAILABLE: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  USED: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  REVOKED: "bg-red-500/10 text-red-400 border border-red-500/20",
  DISABLED: "bg-red-500/10 text-red-400 border border-red-500/20",
  EXPIRED: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
};

const AdminDashboard = () => {
  const [subTab, setSubTab] = useState<"dashboard" | "customers" | "license" | "staff">("dashboard");

  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [keys, setKeys] = useState<LicenseKeyRow[]>([]);
  const [keyCount, setKeyCount] = useState(1);
  const [keyExpiresDays, setKeyExpiresDays] = useState<number | "">("");
  const [generating, setGenerating] = useState(false);
  const [licenseSearch, setLicenseSearch] = useState("");

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editCompanyName, setEditCompanyName] = useState("");

  const [assigningKeyId, setAssigningKeyId] = useState<number | null>(null);
  const [assignTargetUserId, setAssignTargetUserId] = useState("");

  const [staffFullName, setStaffFullName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [creatingStaff, setCreatingStaff] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const res = await api.get("/admin/dashboard-stats");
      setStats(res.data);
    } catch {
      toast.error("Không thể tải báo cáo hệ thống.");
    }
  }, []);

  const loadKeys = useCallback(async () => {
    try {
      const response = await api.get(`/admin/license-keys?search=${licenseSearch}`);
      setKeys(response.data);
    } catch {
      toast.error("Không thể tải danh sách License Key.");
    }
  }, [licenseSearch]);

  const loadUsers = useCallback(async () => {
    try {
      const response = await api.get(`/admin/users?search=${userSearch}`);
      setUsers(response.data);
    } catch {
      toast.error("Không thể tải danh sách khách hàng.");
    }
  }, [userSearch]);

  useEffect(() => {
    if (subTab === "dashboard") loadStats();
    if (subTab === "license") loadKeys();
    if (subTab === "customers" || subTab === "staff") loadUsers();
  }, [subTab, loadStats, loadKeys, loadUsers]);

  // Handle generation
  const generateKeys = async () => {
    setGenerating(true);
    try {
      const payload: Record<string, unknown> = { count: keyCount };
      if (keyExpiresDays !== "") {
        const d = new Date();
        d.setDate(d.getDate() + Number(keyExpiresDays));
        payload.expires_at = d.toISOString();
      }
      const response = await api.post("/admin/license-keys", payload);
      setKeys((current) => [...response.data, ...current]);
      toast.success(`Đã tạo ${response.data.length} License Key.`);
    } catch {
      toast.error("Không thể tạo License Key.");
    } finally {
      setGenerating(false);
    }
  };

  const revokeKey = async (id: number) => {
    try {
      const response = await api.post(`/admin/license-keys/${id}/revoke`);
      setKeys((current) => current.map((row) => (row.id === id ? response.data : row)));
      toast.success("Đã vô hiệu hóa License Key.");
      loadStats();
    } catch {
      toast.error("Không thể vô hiệu hóa License Key.");
    }
  };

  const assignKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningKeyId || !assignTargetUserId) return;
    try {
      const response = await api.post(`/admin/license-keys/${assigningKeyId}/assign`, { user_id: Number(assignTargetUserId) });
      setKeys((current) => current.map((row) => (row.id === assigningKeyId ? response.data : row)));
      toast.success("Đã cấp phát License Key thành công.");
      setAssigningKeyId(null);
      setAssignTargetUserId("");
      loadStats();
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || "Không thể cấp phát Key.");
    }
  };

  const updatePlan = async (userId: number, plan: "FREE" | "PRO") => {
    try {
      const response = await api.put(`/admin/users/${userId}/plan`, { plan });
      setUsers((current) => current.map((row) => (row.id === userId ? response.data : row)));
      toast.success("Đã cập nhật gói người dùng.");
    } catch {
      toast.error("Không thể cập nhật gói.");
    }
  };

  const saveCompany = async (userId: number) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, { company_name: editCompanyName });
      setUsers((current) => current.map((row) => (row.id === userId ? response.data : row)));
      setEditingUserId(null);
      toast.success("Đã cập nhật tên công ty.");
    } catch {
      toast.error("Không thể cập nhật thông tin khách hàng.");
    }
  };

  const createStaff = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!staffFullName.trim() || !staffEmail.trim() || staffPassword.length < 8) {
      toast.error("Cần họ tên, email hợp lệ và mật khẩu tối thiểu 8 ký tự.");
      return;
    }
    setCreatingStaff(true);
    try {
      await api.post("/admin/staff", {
        email: staffEmail.trim(),
        password: staffPassword,
        full_name: staffFullName.trim(),
      });
      toast.success("Đã tạo tài khoản Staff.");
      setStaffFullName("");
      setStaffEmail("");
      setStaffPassword("");
      void loadUsers();
    } catch {
      toast.error("Không thể tạo tài khoản Staff (email có thể đã tồn tại).");
    } finally {
      setCreatingStaff(false);
    }
  };

  const subTabs = [
    { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { id: "customers", label: "Khách hàng", icon: Users },
    { id: "license", label: "Licenses", icon: KeyRound },
    { id: "staff", label: "Staff", icon: UserCog },
  ] as const;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-extrabold text-white">
          <ShieldCheck className="h-8 w-8 text-indigo-400" />
          <span>System Manager</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
          Quản lý toàn diện tài nguyên hệ thống, danh sách khách hàng doanh nghiệp, phát hành và phân bổ License Key.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-white/5 pb-2">
        {subTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className={`inline-flex min-w-max cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              subTab === id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "bg-slate-900/30 text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {subTab === "dashboard" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><KeyRound size={64}/></div>
               <p className="text-sm font-medium text-slate-400 mb-1">Tổng Licenses</p>
               <h3 className="text-3xl font-bold text-white">{stats?.total_licenses ?? "-"}</h3>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 backdrop-blur-md relative overflow-hidden">
               <p className="text-sm font-medium text-emerald-400/80 mb-1">Đang kích hoạt (Active)</p>
               <h3 className="text-3xl font-bold text-emerald-400">{stats?.active_licenses ?? "-"}</h3>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 backdrop-blur-md relative overflow-hidden">
               <p className="text-sm font-medium text-amber-400/80 mb-1">Đã hết hạn (Expired)</p>
               <h3 className="text-3xl font-bold text-amber-400">{stats?.expired_licenses ?? "-"}</h3>
            </div>
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6 backdrop-blur-md relative overflow-hidden">
               <p className="text-sm font-medium text-blue-400/80 mb-1">Đã cấp phát (Assigned)</p>
               <h3 className="text-3xl font-bold text-blue-400">{stats?.assigned_licenses ?? "-"}</h3>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Building size={64}/></div>
               <p className="text-sm font-medium text-slate-400 mb-1">Tổng khách hàng</p>
               <h3 className="text-3xl font-bold text-white">{stats?.total_customers ?? "-"}</h3>
            </div>
          </div>
        </div>
      )}

      {subTab === "customers" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4">
             <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4"/>
                <input
                  type="text"
                  placeholder="Tìm theo email, tên, tên công ty..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500 focus:bg-slate-900"
                />
             </div>
             <button onClick={loadUsers} className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 cursor-pointer">
               Tìm kiếm
             </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/5 shadow-2xl">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-white/5">
                <tr>
                  <th className="px-5 py-4 font-semibold">Khách hàng</th>
                  <th className="px-5 py-4 font-semibold">Công ty</th>
                  <th className="px-5 py-4 font-semibold">Vai trò / Gói</th>
                  <th className="px-5 py-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-900/30">
                {users.filter(u => u.role !== "STAFF").map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{row.full_name || "—"}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{row.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      {editingUserId === row.id ? (
                        <div className="flex items-center gap-2">
                           <input 
                             autoFocus
                             value={editCompanyName}
                             onChange={(e) => setEditCompanyName(e.target.value)}
                             className="rounded-lg bg-slate-950 border border-indigo-500/50 px-3 py-1.5 text-sm text-white outline-none"
                             placeholder="Nhập tên công ty..."
                           />
                           <button onClick={() => saveCompany(row.id)} className="text-indigo-400 font-semibold text-xs hover:text-indigo-300">Lưu</button>
                           <button onClick={() => setEditingUserId(null)} className="text-slate-400 font-semibold text-xs hover:text-slate-300">Hủy</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <span className="text-slate-300 flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5 text-slate-500" />
                            {row.company_name || "—"}
                          </span>
                          <button onClick={() => { setEditingUserId(row.id); setEditCompanyName(row.company_name || ""); }} className="opacity-0 group-hover:opacity-100 text-xs text-indigo-400 hover:underline">Sửa</button>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-300">{row.role}</span>
                        <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${row.plan === "PRO" ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                          {row.plan}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => void updatePlan(row.id, row.plan === "PRO" ? "FREE" : "PRO")}
                        className="cursor-pointer rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        Đổi sang {row.plan === "PRO" ? "FREE" : "PRO"}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.filter(u => u.role !== "STAFF").length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                      Không tìm thấy khách hàng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === "license" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Controls */}
          <div className="flex flex-col xl:flex-row gap-5 items-start xl:items-center justify-between p-5 rounded-2xl bg-slate-900/40 border border-white/5">
             <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Số lượng</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={keyCount}
                    onChange={(event) => setKeyCount(Math.min(100, Math.max(1, Number(event.target.value) || 1)))}
                    className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Thời hạn (ngày)</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Không viễn mãn"
                    value={keyExpiresDays}
                    onChange={(event) => setKeyExpiresDays(event.target.value === "" ? "" : Number(event.target.value))}
                    className="w-36 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-indigo-500 placeholder:text-slate-600"
                  />
                </div>
                <div className="pt-5">
                  <button
                    onClick={() => void generateKeys()}
                    disabled={generating}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4" />
                    {generating ? "Đang xử lý..." : "Phát hành Key"}
                  </button>
                </div>
             </div>

             <div className="flex items-center gap-3 w-full xl:w-auto">
                <div className="relative w-full xl:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4"/>
                  <input 
                    type="text"
                    placeholder="Tra cứu mã Key..."
                    value={licenseSearch}
                    onChange={(e) => setLicenseSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadKeys()}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <button onClick={loadKeys} className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 cursor-pointer">Lọc</button>
             </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/5 shadow-2xl">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-white/5">
                <tr>
                  <th className="px-5 py-4 font-semibold">License Key</th>
                  <th className="px-5 py-4 font-semibold">Trạng thái</th>
                  <th className="px-5 py-4 font-semibold">Cấp phát cho</th>
                  <th className="px-5 py-4 font-semibold">Hết hạn lúc</th>
                  <th className="px-5 py-4 font-semibold text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-900/30">
                {keys.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                       <div className="font-mono font-bold text-white tracking-wide">{row.key}</div>
                       <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1"><CalendarIcon className="h-3 w-3"/> Tạo lúc {new Date(row.created_at).toLocaleDateString("vi-VN")}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                       {row.used_by_email ? (
                         <div className="text-emerald-400 text-xs font-semibold">Đã dùng bởi: {row.used_by_email}</div>
                       ) : row.assigned_to_email ? (
                         <div className="text-indigo-400 text-xs font-semibold">Đã cấp cho: {row.assigned_to_email}</div>
                       ) : (
                         <span className="text-slate-500 text-xs italic">Chưa cấp phát</span>
                       )}
                    </td>
                    <td className="px-5 py-4">
                      {row.expires_at ? (
                        <span className="text-slate-300 text-xs">{new Date(row.expires_at).toLocaleString("vi-VN")}</span>
                      ) : (
                        <span className="text-emerald-500/50 text-xs font-semibold uppercase tracking-wider">Vĩnh viễn</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      {row.status === "AVAILABLE" && (
                        <>
                          <button
                            onClick={() => setAssigningKeyId(row.id)}
                            className="cursor-pointer rounded-lg bg-indigo-600/10 border border-indigo-500/20 px-3 py-1.5 text-xs font-bold text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                          >
                            Cấp phát
                          </button>
                          <button
                            onClick={() => void revokeKey(row.id)}
                            title="Vô hiệu hóa key"
                            className="cursor-pointer rounded-lg bg-slate-800/50 border border-slate-700/50 p-1.5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {keys.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-500 flex flex-col items-center">
                      <KeyRound className="h-10 w-10 text-slate-700 mb-3"/>
                      <span>Không tìm thấy License Key nào.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === "staff" && (
        <div className="max-w-xl space-y-6 rounded-2xl border border-white/5 bg-slate-900/40 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl">
          <div className="flex items-center gap-4">
             <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400"><UserCog className="h-6 w-6"/></div>
             <div>
                <h3 className="text-lg font-bold text-white">Quản lý Tài khoản Nội bộ</h3>
                <p className="text-sm text-slate-400">Tạo tài khoản phân quyền STAFF để nhân sự hỗ trợ hệ thống.</p>
             </div>
          </div>
          
          <form onSubmit={createStaff} className="space-y-4 pt-4 border-t border-white/5">
            <div>
               <label className="block text-xs font-semibold text-slate-400 mb-2">Họ & Tên</label>
               <input
                 type="text"
                 required
                 placeholder="Nguyễn Văn A"
                 value={staffFullName}
                 onChange={(event) => setStaffFullName(event.target.value)}
                 className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 focus:bg-slate-900 transition-colors"
               />
            </div>
            <div>
               <label className="block text-xs font-semibold text-slate-400 mb-2">Địa chỉ Email</label>
               <input
                 type="email"
                 required
                 placeholder="staff@novachat.ai"
                 value={staffEmail}
                 onChange={(event) => setStaffEmail(event.target.value)}
                 className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 focus:bg-slate-900 transition-colors"
               />
            </div>
            <div>
               <label className="block text-xs font-semibold text-slate-400 mb-2">Mật khẩu truy cập</label>
               <input
                 type="password"
                 required
                 placeholder="Tối thiểu 8 ký tự"
                 value={staffPassword}
                 onChange={(event) => setStaffPassword(event.target.value)}
                 className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 focus:bg-slate-900 transition-colors"
               />
            </div>
            <div className="pt-2">
              <button
                disabled={creatingStaff}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {creatingStaff ? "Đang khởi tạo..." : "Khởi tạo Tài khoản"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assign Modal */}
      {assigningKeyId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-2">Cấp phát License Key</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Nhập ID của người dùng (Customer ID) để cấp phát key này cho họ. Họ sẽ có thể thấy và sử dụng nó.
            </p>
            <form onSubmit={assignKey} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Customer ID</label>
                <input
                  type="number"
                  placeholder="Ví dụ: 2"
                  value={assignTargetUserId}
                  onChange={(e) => setAssignTargetUserId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-white focus:border-indigo-500 outline-none"
                  required
                  autoFocus
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setAssigningKeyId(null); setAssignTargetUserId(""); }}
                  className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 py-3.5 font-semibold text-sm text-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3.5 font-semibold text-sm text-white shadow-lg shadow-indigo-600/20"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
