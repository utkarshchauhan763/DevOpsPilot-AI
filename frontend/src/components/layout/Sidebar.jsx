
import { NavLink, useNavigate } from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  AlertTriangle,
  Settings,
  ShieldCheck,
  X,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const navigation = [
  { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { name: "Incidents", path: "/incidents", icon: AlertTriangle },
  { name: "System Health", path: "/system-health", icon: Activity },
  { name: "Settings", path: "/settings", icon: Settings },
];

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userRole = user?.role || "user";

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    onClose?.();
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-[#0d1525] transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/10 p-2">
              <Activity className="text-cyan-400" size={24} />
            </div>

            <div>
              <h1 className="font-bold text-white">
                DevOpsPilot <span className="text-cyan-400">AI</span>
              </h1>

              <p className="text-xs text-slate-500">
                Incident Intelligence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="text-slate-400 transition hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4 py-6">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
                    isActive
                      ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile and Logout */}
        <div className="border-t border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 font-semibold text-cyan-400">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {userName}
              </p>

              <p className="truncate text-xs text-slate-500">
                {userEmail}
              </p>

              <div className="mt-1 flex items-center gap-1 text-xs text-cyan-400">
                <ShieldCheck size={12} />
                <span className="capitalize">{userRole}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
