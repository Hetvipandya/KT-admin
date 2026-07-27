
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Menu, X, LayoutDashboard, FileText, Users, Briefcase, UserCheck, User, LogOut } from "lucide-react";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); // Mobile sidebar state
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const location = useLocation();

  const menu = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
       { label: "Employee Requests", path: "/employee-requests", icon: UserCheck },
           { label: "Portfolio Leads", path: "/portfolio-leads", icon: UserCheck },
               { label: "Positions", path: "/positions", icon: Briefcase },
                  { label: "Contacts", path: "/contacts", icon: Users },
                  {label:"Team Lead", path: "/team-lead", icon: UserCheck},
    { label: "Applications", path: "/applications", icon: FileText },
 


 
    { label: "Profile", path: "/profile", icon: User },
    { label: "Logout", path: "/logout", icon: LogOut },
  ];

  const attendanceItems = [
    { label: "Employees", path: "/attendance/employees" },
    { label: "Check-In Request", path: "/attendance/check-in-request" },
    { label: "Leave Request", path: "/attendance/leave-request" },
    { label: "Attendance Logs", path: "/attendance/attendance-logs" },
    { label: "Adjustments", path: "/attendance/adjustments" },
    { label: "Task Management", path: "/attendance/team" },
    { label: "Members", path: "/attendance/members" },
    { label: "Holidays", path: "/attendance/holidays" },
  ];

  // જો સબ-મેનૂનું કોઈ પેજ એક્ટિવ હોય તો Dropdown ઓટોમેટિકલી ઓપન રાખવા માટે
  useEffect(() => {
    const isAttendanceActive = attendanceItems.some(item => location.pathname === item.path);
    if (isAttendanceActive) {
      setAttendanceOpen(true);
    }
  }, [location.pathname]);

  // મોબાઈલ પર મેનૂ આઈટમ ક્લિક કરવાથી સાઈડબાર બંધ થઈ જશે
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white border-b px-4 flex items-center justify-between z-50">
        <img src="/logo.jpeg" alt="Logo" className="h-10 object-contain" />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop (Mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-white border-r flex flex-col overflow-hidden z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:z-30`}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 flex-shrink-0">
          <img
            src="/logo.jpeg"
            alt="Kevalon Technology"
            className="h-12 object-contain"
          />
          {/* Mobile close button inside sidebar */}
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-800">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
          
          {/* Main Menu */}
          <div className="space-y-1">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main</p>
            {menu.slice(0, 5).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-semibold shadow-sm shadow-blue-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          {/* Attendance Dropdown */}
          <div className="space-y-1">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Management</p>
            <button
              onClick={() => setAttendanceOpen(!attendanceOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
            >
              <span className="flex items-center gap-3">
                <Users size={18} />
                Attendance
              </span>
              {attendanceOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {attendanceOpen && (
              <div className="mt-1 ml-4 pl-4 border-l border-gray-100 space-y-1 transition-all">
                {attendanceItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-blue-50/70 text-blue-600 font-semibold"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Settings & Bottom Area */}
          <div className="pt-4 border-t border-gray-100 space-y-1">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Account</p>
            {menu.slice(5).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                      item.label === "Logout"
                        ? "text-red-500 hover:bg-red-50"
                        : isActive
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;