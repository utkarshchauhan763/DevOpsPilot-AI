
import { Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Topbar({ onMenuClick }) {
  const { user } = useAuth();

  const userName = user?.name || "User";

  const initials = userName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-800 bg-[#0b1120]/95 px-5 backdrop-blur-lg md:px-8">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="text-slate-400 transition hover:text-white lg:hidden"
        >
          <Menu size={23} />
        </button>

        <div>
          <h2 className="text-lg font-semibold text-white">
            Workspace
          </h2>

          <p className="text-xs text-slate-500">
            Monitor and manage your infrastructure
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white"
          title={userName}
          aria-label={`Logged in as ${userName}`}
        >
          {initials}
        </div>

        <span className="hidden text-sm font-medium text-slate-300 sm:block">
          {userName}
        </span>
      </div>
    </header>
  );
}

export default Topbar;
