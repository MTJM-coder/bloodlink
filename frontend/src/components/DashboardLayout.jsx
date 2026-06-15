import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-[#F5F7FA] min-h-screen p-3 sm:p-5">
      <div className="flex gap-5">

        {/* Sidebar - desktop */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Sidebar - mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <div
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-3 top-3 bottom-3 w-64">
              <div className="relative h-full">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute -right-3 top-3 bg-white rounded-full p-1.5 shadow-md z-10"
                >
                  <FiX size={16} />
                </button>
                <Sidebar onNavigate={() => setSidebarOpen(false)} />
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 flex flex-col gap-3 sm:gap-5 min-w-0">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <Outlet />
        </main>
      </div>
    </div>
  );
}