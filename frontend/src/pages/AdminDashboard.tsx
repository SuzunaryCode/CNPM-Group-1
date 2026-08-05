import { useCallback, useEffect, useState } from "react";
import { KeyRound, Plus, ShieldCheck, Trash2, Users, Building, Calendar as CalendarIcon, Search, LayoutDashboard } from "lucide-react";
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

interface AdminDashboardProps {
  externalSubTab?: "dashboard" | "customers" | "license";
  hideHeaderAndTabs?: boolean;
}

const AdminDashboard = ({ externalSubTab, hideHeaderAndTabs = false }: AdminDashboardProps) => {
  const [localSubTab, setLocalSubTab] = useState<"dashboard" | "customers" | "license">("dashboard");
  const subTab = externalSubTab || localSubTab;

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (subTab === "dashboard") void loadStats();
     
    if (subTab === "license") void loadKeys();
     
    if (subTab === "customers") void loadUsers();
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

  const subTabs = [
    { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { id: "customers", label: "Khách hàng", icon: Users },
    { id: "license", label: "Licenses", icon: KeyRound },
  ] as const;

  return (
    <div className="space-y-8 pb-12">
      {!hideHeaderAndTabs && (
        <>
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-black text-white tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              <ShieldCheck className="h-8 w-8 text-indigo-400" />
              <span>System Manager</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
              Quản lý toàn diện tài nguyên hệ thống, danh sách khách hàng doanh nghiệp, phát hành và phân bổ License Key.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto border-b border-slate-800 pb-2">
            {subTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setLocalSubTab(id)}
                className={`inline-flex min-w-max cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  subTab === id
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-600/20"
                    : "bg-slate-900/40 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {subTab === "dashboard" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {hideHeaderAndTabs && (
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Tổng quan hệ thống
              </h2>
              <p className="text-xs text-slate-400 mt-1">Báo cáo tài nguyên, hoạt động của Licenses và khách hàng doanh nghiệp.</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {/* Card 1: Tổng Licenses */}
            <div className="group rounded-2xl border border-slate-850 bg-slate-900/40 p-6 backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/5">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Licenses</p>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-md">
                  <KeyRound size={18} />
                </div>
              </div>
              <h3 className="text-4xl font-extrabold text-white tracking-tight font-mono">{stats?.total_licenses ?? "-"}</h3>
            </div>

            {/* Card 2: Đang kích hoạt (Active) */}
            <div className="group rounded-2xl border border-slate-850 bg-slate-900/40 p-6 backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/5">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đang kích hoạt</p>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md">
                  <ShieldCheck size={18} />
                </div>
              </div>
              <h3 className="text-4xl font-extrabold text-emerald-400 tracking-tight font-mono">{stats?.active_licenses ?? "-"}</h3>
            </div>

            {/* Card 3: Đã hết hạn (Expired) */}
            <div className="group rounded-2xl border border-slate-850 bg-slate-900/40 p-6 backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:border-amber-500/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/5">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đã hết hạn</p>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-md">
                  <CalendarIcon size={18} />
                </div>
              </div>
              <h3 className="text-4xl font-extrabold text-amber-400 tracking-tight font-mono">{stats?.expired_licenses ?? "-"}</h3>
            </div>

            {/* Card 4: Đã cấp phát (Assigned) */}
            <div className="group rounded-2xl border border-slate-850 bg-slate-900/40 p-6 backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/5">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đã cấp phát</p>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-md">
                  <Building size={18} />
                </div>
              </div>
              <h3 className="text-4xl font-extrabold text-blue-400 tracking-tight font-mono">{stats?.assigned_licenses ?? "-"}</h3>
            </div>

            {/* Card 5: Tổng khách hàng */}
            <div className="group rounded-2xl border border-slate-850 bg-slate-900/40 p-6 backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:border-violet-500/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/5">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng khách hàng</p>
                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-md">
                  <Users size={18} />
                </div>
              </div>
              <h3 className="text-4xl font-extrabold text-white tracking-tight font-mono">{stats?.total_customers ?? "-"}</h3>
            </div>
          </div>
        </div>
      )}

      {subTab === "customers" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Quản lý khách hàng
              </h2>
              <p className="text-xs text-slate-400 mt-1">Quản lý các tài khoản doanh nghiệp (Bên B), đổi nhanh thông tin công ty và cấu hình gói cước.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
               <div className="relative flex-1 sm:w-64 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4"/>
                  <input
                    type="text"
                    placeholder="Tìm email, tên, công ty..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500/50 focus:bg-slate-950 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-500"
                  />
               </div>
               <button onClick={loadUsers} className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer">
                 Tìm kiếm
               </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/20 shadow-2xl backdrop-blur-xl">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-300">Khách hàng</th>
                  <th className="px-6 py-4 font-bold text-slate-300">Công ty</th>
                  <th className="px-6 py-4 font-bold text-slate-300">Vai trò / Gói</th>
                  <th className="px-6 py-4 font-bold text-right text-slate-300">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/10">
                {users.filter(u => u.role !== "STAFF").map((row) => (
                  <tr key={row.id} className="hover:bg-indigo-500/5 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-100">{row.full_name || "—"}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{row.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-200">
                      {editingUserId === row.id ? (
                        <div className="flex items-center gap-2">
                           <input 
                             autoFocus
                             value={editCompanyName}
                             onChange={(e) => setEditCompanyName(e.target.value)}
                             className="rounded-lg bg-slate-950 border border-indigo-500/50 px-3 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                             placeholder="Nhập tên công ty..."
                           />
                           <button onClick={() => saveCompany(row.id)} className="text-indigo-400 font-bold text-xs hover:text-indigo-300 transition-colors">Lưu</button>
                           <button onClick={() => setEditingUserId(null)} className="text-slate-400 font-bold text-xs hover:text-slate-300 transition-colors">Hủy</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <span className="text-slate-300 flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5 text-slate-500" />
                            {row.company_name || "—"}
                          </span>
                          <button onClick={() => { setEditingUserId(row.id); setEditCompanyName(row.company_name || ""); }} className="opacity-0 group-hover:opacity-100 text-xs text-indigo-400 hover:text-indigo-300 transition-opacity hover:underline">Sửa</button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300 border border-slate-700">{row.role}</span>
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${row.plan === "PRO" ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                          {row.plan}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => void updatePlan(row.id, row.plan === "PRO" ? "FREE" : "PRO")}
                        className="cursor-pointer rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition-all active:scale-[0.98]"
                      >
                        Đổi sang {row.plan === "PRO" ? "FREE" : "PRO"}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.filter(u => u.role !== "STAFF").length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-medium">
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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Quản lý License Keys
              </h2>
              <p className="text-xs text-slate-400 mt-1">Phát hành, phân bổ (assign) hoặc thu hồi các khóa bản quyền hệ thống.</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between p-6 rounded-2xl bg-slate-900/40 border border-slate-850 backdrop-blur-xl">
             <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Số lượng</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={keyCount}
                    onChange={(event) => setKeyCount(Math.min(100, Math.max(1, Number(event.target.value) || 1)))}
                    className="w-24 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Thời hạn (ngày)</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Vĩnh viễn"
                    value={keyExpiresDays}
                    onChange={(event) => setKeyExpiresDays(event.target.value === "" ? "" : Number(event.target.value))}
                    className="w-36 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-700"
                  />
                </div>
                <div className="pt-6">
                  <button
                    onClick={() => void generateKeys()}
                    disabled={generating}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4" />
                    {generating ? "Đang tạo..." : "Phát hành Key"}
                  </button>
                </div>
             </div>

             <div className="flex items-center gap-3 w-full xl:w-auto pt-4 xl:pt-0 border-t xl:border-t-0 border-slate-800">
                <div className="relative w-full xl:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4"/>
                  <input 
                    type="text"
                    placeholder="Tra cứu mã Key..."
                    value={licenseSearch}
                    onChange={(e) => setLicenseSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadKeys()}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600"
                  />
                </div>
                <button onClick={loadKeys} className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-750 px-4 py-2.5 text-sm font-semibold text-white active:scale-[0.98] transition-all cursor-pointer">Lọc</button>
             </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/20 shadow-2xl backdrop-blur-xl">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-300">License Key</th>
                  <th className="px-6 py-4 font-bold text-slate-300">Trạng thái</th>
                  <th className="px-6 py-4 font-bold text-slate-300">Cấp phát cho</th>
                  <th className="px-6 py-4 font-bold text-slate-300">Hết hạn lúc</th>
                  <th className="px-6 py-4 font-bold text-right text-slate-300">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/10">
                {keys.map((row) => (
                  <tr key={row.id} className="hover:bg-indigo-500/5 transition-colors duration-200">
                    <td className="px-6 py-4">
                       <div className="font-mono font-bold text-slate-100 tracking-wide text-sm">{row.key}</div>
                       <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1"><CalendarIcon className="h-3 w-3 text-indigo-400"/> Tạo lúc {new Date(row.created_at).toLocaleDateString("vi-VN")}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       {row.used_by_email ? (
                         <div className="text-emerald-400 text-xs font-semibold">Đã dùng: {row.used_by_email}</div>
                       ) : row.assigned_to_email ? (
                         <div className="text-indigo-400 text-xs font-semibold">Đã cấp: {row.assigned_to_email}</div>
                       ) : (
                         <span className="text-slate-500 text-xs italic">Chưa cấp phát</span>
                       )}
                    </td>
                    <td className="px-6 py-4">
                      {row.expires_at ? (
                        <span className="text-slate-300 text-xs">{new Date(row.expires_at).toLocaleString("vi-VN")}</span>
                      ) : (
                        <span className="text-emerald-500/70 text-xs font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Vĩnh viễn</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {row.status === "AVAILABLE" && (
                        <>
                          <button
                            onClick={() => setAssigningKeyId(row.id)}
                            className="cursor-pointer rounded-lg bg-indigo-600/10 border border-indigo-500/30 px-3 py-1.5 text-xs font-bold text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-[0.98]"
                          >
                            Cấp phát
                          </button>
                          <button
                            onClick={() => void revokeKey(row.id)}
                            title="Vô hiệu hóa key"
                            className="cursor-pointer rounded-lg bg-slate-800 hover:bg-red-500/20 border border-slate-700 p-1.5 text-slate-400 hover:text-red-400 transition-all active:scale-[0.98]"
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
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center">
                      <KeyRound className="h-10 w-10 text-slate-700 mb-3 animate-pulse"/>
                      <span className="font-semibold text-sm">Không tìm thấy License Key nào.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assigningKeyId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <h3 className="text-xl font-bold text-white mb-2">Cấp phát License Key</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Nhập ID của người dùng (Customer ID) để cấp phát key này cho họ trước khi họ thực hiện kích hoạt.
            </p>
            <form onSubmit={assignKey} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customer ID</label>
                <input
                  type="number"
                  placeholder="Ví dụ: 2"
                  value={assignTargetUserId}
                  onChange={(e) => setAssignTargetUserId(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3.5 text-white focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-700"
                  required
                  autoFocus
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setAssigningKeyId(null); setAssignTargetUserId(""); }}
                  className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-750 py-3.5 font-bold text-sm text-slate-300 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3.5 font-bold text-sm text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
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
