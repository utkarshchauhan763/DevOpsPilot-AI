
import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080d19]">

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-64">
        <Topbar
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="p-5 md:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

export default DashboardLayout;
