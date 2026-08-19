import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import Contacts from "./pages/Contacts";
import Positions from "./pages/Positions";
import PortfolioLeads from "./pages/PortfolioLeads";
import Employees from "./pages/attendance/Employees";
import CheckInRequest from "./pages/attendance/CheckInRequest";
import LeaveRequest from "./pages/attendance/LeaveRequest";
import AttendanceLogs from "./pages/attendance/AttendanceLogs"; 
import OfficeSettings from "./pages/attendance/OfficeSettings";
import Adjustments from "./pages/attendance/Adjustments";
import Team from "./pages/attendance/Team"; 
import Members from "./pages/attendance/Members";
import Holidays from "./pages/attendance/Holidays";
import Profile from "./pages/Profile";
import Setting from "./pages/Setting"; 
import Logout from "./pages/Logout";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import EmployeeRequests from "./pages/EmployeeRequests";
import Performance from "./pages/Performance";
import { TeamLead } from "./pages/TeamLead";

function PageHeader() {
  const location = useLocation();

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/applications": "Applications",
    "/contacts": "Contacts",
    "/positions": "Positions",
    "/portfolio-leads": "Portfolio Leads",
    "/employee-requests": "Employee Requests",
    "/team-lead": "Team Leads",
    "/attendance/employees": "Employees",
    "/attendance/check-in-request": "Check-In Requests",
    "/attendance/leave-request": "Leave Requests",
    "/attendance/attendance-logs": "Attendance Logs",
    "/attendance/office-settings": "Office Settings",
    "/attendance/adjustments": "Attendance Adjustments",
    "/attendance/team": "Task Management",
    "/attendance/members": "Team Members",
    "/attendance/holidays": "Holidays & Events",
    "/performance": "Performance Analytics",
    "/profile": "User Profile",
    "/setting": "Settings",
  };

  return (
    <header className="fixed top-14 left-0 right-0 z-30 h-16 border-b border-slate-200/80 bg-white/95 shadow-xs backdrop-blur lg:top-0 lg:left-60">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kevalon Technology</p>
          <h1 className="text-base font-semibold leading-6 text-slate-900">{pageTitles[location.pathname] || "Overview"}</h1>
        </div>
        <span className="hidden text-sm font-medium text-slate-400 sm:block">Admin Panel</span>
      </div>
    </header>
  );
}

function AppShell() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  useEffect(() => {
    const handleStorage = () => {
      setIsAuthenticated(localStorage.getItem("isAuthenticated") === "true");
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />

      <div className="lg:pl-60 flex flex-col min-h-screen">
        <PageHeader />

        <main className="flex-1 p-3 pt-32 sm:p-5 sm:pt-32 lg:p-6 lg:pt-20">
          <div className="page-content w-full">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/positions" element={<Positions />} />
              <Route path="/portfolio-leads" element={<PortfolioLeads />} />
              <Route path="/employee-requests" element={<EmployeeRequests />} />
              <Route path="/team-lead" element={<TeamLead />} />
              <Route path="/attendance/employees" element={<Employees />} />
              <Route path="/attendance/check-in-request" element={<CheckInRequest />} />
              <Route path="/attendance/leave-request" element={<LeaveRequest />} />
              <Route path="/attendance/attendance-logs" element={<AttendanceLogs />} />
              <Route path="/attendance/office-settings" element={<OfficeSettings />} />
              <Route path="/attendance/adjustments" element={<Adjustments />} />
              <Route path="/attendance/team" element={<Team />} />
              <Route path="/attendance/members" element={<Members />} />
              <Route path="/attendance/holidays" element={<Holidays />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/setting" element={<Setting />} />
              <Route path="/logout" element={<Logout setIsAuthenticated={setIsAuthenticated} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;