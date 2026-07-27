import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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
import { TeamLead } from "./pages/TeamLead";

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
        <Route
  path="/"
  element={
    <Login
      setIsAuthenticated={setIsAuthenticated}
    />
  }
/>

<Route
  path="/login"
  element={
    <Login
      setIsAuthenticated={setIsAuthenticated}
    />
  }
/>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />

      <main className="min-h-screen pt-16 p-4 lg:ml-72 lg:p-6 lg:pt-0">
        <div className="min-h-[calc(100vh-48px)] rounded-2xl bg-white shadow-md p-6">
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
            <Route path="/profile" element={<Profile />} />
            <Route path="/setting" element={<Setting />} />
            <Route
  path="/logout"
  element={
    <Logout
      setIsAuthenticated={setIsAuthenticated}
    />
  }
/>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
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