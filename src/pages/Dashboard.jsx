import React, { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  Briefcase,
  Calendar,
  Clock,
  Cake,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  Search,
  X,
  UserX,
  ChevronRight,
  TrendingUp,
  FileText,
  AlertTriangle,
  Clock3,
  Megaphone,
  Bell,
  Plus,
  Edit3,
  Trash2
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState([
    {
      id: 1,
      name: "Total Employees",
      value: 0,
      icon: Users,
      badge: "Full-Time",
      accent: "indigo",
    },
    {
      id: 2,
      name: "Total Interns",
      value: 0,
      icon: UserCheck,
      badge: "Trainees",
      accent: "amber",
    },
    {
      id: 3,
      name: "Total Team Leads",
      value: 0,
      icon: Briefcase,
      badge: "Management",
      accent: "purple",
    },
  ]);

  const [leaves, setLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  const [birthdays, setBirthdays] = useState([]);
  const [absentRecords, setAbsentRecords] = useState([]);
  const [dailyUpdates, setDailyUpdates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dashboardCounts, setDashboardCounts] = useState({
    employeeCount: 0,
    internCount: 0,
    teamLeadCount: 0,
  });
  const [expandedUpdateId, setExpandedUpdateId] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);

  // Announcement form state
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    type: "ANNOUNCEMENT"
  });
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchTeamLeads();
    fetchLeaves();
    fetchHolidays();
    fetchAbsentAttendance();
    fetchDailyUpdates();
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    setStats([
      {
        id: 1,
        name: "Total Employees",
        value: dashboardCounts.employeeCount,
        icon: Users,
        badge: "Full-Time",
        accent: "indigo",
      },
      {
        id: 2,
        name: "Total Interns",
        value: dashboardCounts.internCount,
        icon: UserCheck,
        badge: "Trainees",
        accent: "amber",
      },
      {
        id: 3,
        name: "Total Team Leads",
        value: dashboardCounts.teamLeadCount,
        icon: Briefcase,
        badge: "Management",
        accent: "purple",
      },
    ]);
  }, [dashboardCounts.employeeCount, dashboardCounts.internCount, dashboardCounts.teamLeadCount]);

  async function fetchUsers() {
    try {
      const response = await fetch("https://kt-backend-1.onrender.com/api/users/all");
      const data = await response.json();
      const users = data.users || data.data || [];

      const employeeCount = users.filter((user) => user.role?.toLowerCase() === "employee").length;
      const internCount = users.filter((user) => user.role?.toLowerCase() === "intern").length;

      const formattedBirthdays = users
        .map((user) => ({
          id: user._id || user.id,
          name: user.name || user.fullName || "N/A",
          role: user.role || "N/A",
          dob: user.dob || user.dateOfBirth || user.birthDate || user.birthday || null,
        }))
        .filter((user) => user.dob && isBirthdayInCurrentMonth(user.dob))
        .sort((a, b) => new Date(a.dob) - new Date(b.dob));

      setBirthdays(formattedBirthdays);
      setDashboardCounts((prev) => ({
        ...prev,
        employeeCount,
        internCount,
      }));
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchTeamLeads() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://kt-backend-1.onrender.com/api/teamLead/team", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      const teamLeads = data.teamLeads || data.data || data.teamlead || data.teams || [];

      setDashboardCounts((prev) => ({
        ...prev,
        teamLeadCount: Array.isArray(teamLeads) ? teamLeads.length : 0,
      }));
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchLeaves() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://kt-backend-1.onrender.com/api/leave/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      let leaveArray = Array.isArray(data) ? data : data.leaves || data.data || [];

      const hrApprovedLeaves = leaveArray.filter(
        (leave) => leave.hrStatus?.toLowerCase() === "approved"
      );
      setLeaves(hrApprovedLeaves);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchHolidays() {
    try {
      const response = await fetch("https://kt-backend-1.onrender.com/api/holiday/current-month");
      const data = await response.json();
      let holidays = Array.isArray(data) ? data : data.holidays || data.data || [];

      if (!Array.isArray(holidays) && typeof data === "object") {
        const possibleArrays = [data.holiday, data.currentMonthHolidays, data.result];
        holidays = possibleArrays.find(Array.isArray) || [];
      }

      const formatted = holidays.map((holiday) => ({
        id: holiday._id || holiday.id,
        name: holiday.holidayName || holiday.name || "Holiday",
        date: formatHolidayDate(holiday.holidayDate || holiday.date),
      }));

      setUpcomingHolidays(formatted);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchAbsentAttendance() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://kt-backend-1.onrender.com/api/attendance/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      let attendanceData = Array.isArray(data) ? data : data.attendance || data.data || [];

      const absentOnly = attendanceData.filter(
        (record) => record.status?.toLowerCase() === "absent"
      );
      setAbsentRecords(absentOnly);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchDailyUpdates() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://kt-backend-1.onrender.com/api/dailyUpdate/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      let updates = Array.isArray(data) ? data : data.dailyUpdates || data.data || data.updates || [];

      const sortedUpdates = [...updates].sort((a, b) => {
        const dateA = new Date(a.reportDate || a.createdAt || 0).getTime();
        const dateB = new Date(b.reportDate || b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      setDailyUpdates(sortedUpdates);
    } catch (error) {
      console.error(error);
    }
  }

  // Fetch announcements from API
  async function fetchAnnouncements() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://kt-backend-1.onrender.com/api/notification/announcement/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      let announcementsList = [];
      if (Array.isArray(data)) {
        announcementsList = data;
      } else if (data.data && Array.isArray(data.data)) {
        announcementsList = data.data;
      } else if (data.announcements && Array.isArray(data.announcements)) {
        announcementsList = data.announcements;
      }
      
      // Sort by createdAt descending (newest first)
      const sortedAnnouncements = announcementsList
        .filter(item => item.title && item.message)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      
      setAnnouncements(sortedAnnouncements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  }

  const updateLeaveStatus = async (leaveId, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://kt-backend-1.onrender.com/api/leave/admin-approval", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ leaveId, status }),
      });
      const data = await response.json();
      if (data.success) fetchLeaves();
    } catch (error) {
      console.error(error);
    }
  };

  const confirmAction = async () => {
    await updateLeaveStatus(selectedLeave, selectedStatus);
    setShowModal(false);
  };

  // Handle announcement submission
  const handleAnnouncementSubmit = async () => {
    if (!announcementForm.title.trim() || !announcementForm.message.trim()) {
      alert("Please fill both title and message before posting.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: announcementForm.title.trim(),
        message: announcementForm.message.trim(),
        type: announcementForm.type || "ANNOUNCEMENT",
      };

      const endpoint = editingAnnouncementId
        ? `https://kt-backend-1.onrender.com/api/notification/announcement/${editingAnnouncementId}`
        : "https://kt-backend-1.onrender.com/api/notification/announcement/create";
      const method = editingAnnouncementId ? "PUT" : "POST";
      const bodyPayload = payload;

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyPayload),
      });

      const data = await response.json().catch(() => null);
      const success = response.ok && (data?.success || data?.message || data?.data);
      if (success) {
        setAnnouncementForm({
          title: "",
          message: "",
          type: "ANNOUNCEMENT",
        });
        setEditingAnnouncementId(null);
        setShowAnnouncementModal(false);
        await fetchAnnouncements();
        alert(editingAnnouncementId ? "Announcement updated successfully!" : "Announcement posted successfully!");
      } else {
        alert(data?.message || "Failed to save announcement. Please try again.");
      }
    } catch (error) {
      console.error("Error posting announcement:", error);
      alert("Error posting announcement. Please try again.");
    }
  };

  const handleAnnouncementEdit = (announcement) => {
    setAnnouncementForm({
      title: announcement.title || "",
      message: announcement.message || "",
      type: announcement.type || "ANNOUNCEMENT",
    });
    setEditingAnnouncementId(announcement._id || announcement.id || null);
    setShowAnnouncementModal(true);
  };

  const handleAnnouncementDelete = async (announcementId) => {
    if (!window.confirm("Delete this announcement?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://kt-backend-1.onrender.com/api/notification/announcement/${announcementId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => null);
      if (response.ok && (data?.success || data?.message || data?.data)) {
        await fetchAnnouncements();
        alert("Announcement deleted successfully.");
      } else {
        alert(data?.message || "Failed to delete announcement. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      alert("Error deleting announcement. Please try again.");
    }
  };

  const formatHolidayDate = (dateValue) => {
    if (!dateValue) return "";
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return dateValue;
    return parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatBirthdayDate = (dateValue) => {
    if (!dateValue) return "";
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return dateValue;
    return parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatUpdateDate = (dateValue) => {
    if (!dateValue) return "";
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return dateValue;
    return parsedDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatAnnouncementDate = (dateValue) => {
    if (!dateValue) return "";
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return dateValue;
    return parsedDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isBirthdayInCurrentMonth = (dateValue) => {
    if (!dateValue) return false;
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return false;
    return parsedDate.getMonth() === new Date().getMonth();
  };

  const filteredDailyUpdates = dailyUpdates.filter((update) => {
    const name = (update.employeeId?.name || update.employeeName || update.employee?.name || "").toLowerCase();
    const project = (update.projectId?.projectName || update.projectName || "").toLowerCase();
    const status = (update.status || "submitted").toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = name.includes(query) || project.includes(query);
    const matchesTab = activeTab === "all" || status.includes(activeTab);

    return matchesSearch && matchesTab;
  });

  const getAccentStyles = (accent) => {
    switch (accent) {
      case "amber":
        return {
          iconBg: "bg-amber-50 text-amber-600",
          badgeBg: "bg-amber-50 text-amber-700",
        };
      case "purple":
        return {
          iconBg: "bg-purple-50 text-purple-600",
          badgeBg: "bg-purple-50 text-purple-700",
        };
      default:
        return {
          iconBg: "bg-indigo-50 text-indigo-600",
          badgeBg: "bg-indigo-50 text-indigo-700",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Flat Square Top Banner with Announcement Button */}
        <div className="bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm rounded-none">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* New Announcement Button */}
              <button
                type="button"
                onClick={() => {
                  setAnnouncementForm({ title: "", message: "", type: "ANNOUNCEMENT" });
                  setEditingAnnouncementId(null);
                  setShowAnnouncementModal(true);
                }}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-colors rounded-none"
              >
                <Plus className="h-4 w-4" />
                New Announcement
              </button>
              
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-none">
                <div className="h-2 w-2 bg-emerald-500 rounded-none" />
                <span className="text-xs font-semibold text-slate-600">
                  {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Square Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const styles = getAccentStyles(stat.accent);
            return (
              <div
                key={stat.id}
                className="bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow rounded-none flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 ${styles.iconBg} rounded-none`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 ${styles.badgeBg} uppercase tracking-wider rounded-none`}>
                    {stat.badge}
                  </span>
                </div>
                <div className="mt-5">
                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {stat.value}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{stat.name}</p>
                </div>
              </div>
            );
          })}

          {/* Clean Square Absent Trigger Card */}
          <button
            type="button"
            onClick={() => setShowAbsentModal(true)}
            className="text-left bg-white p-5 border border-rose-200/80 shadow-sm hover:shadow-md hover:bg-rose-50/20 transition-all flex flex-col justify-between rounded-none group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-none">
                <UserX className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 uppercase tracking-wider rounded-none">
                Action Req.
              </span>
            </div>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {absentRecords.length}
                </h3>
                <p className="text-xs font-bold text-rose-600 mt-1 uppercase tracking-wider">Absent Today</p>
              </div>
              <div className="h-8 w-8 bg-rose-50 flex items-center justify-center text-rose-600 group-hover:translate-x-1 transition-transform rounded-none">
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </button>
        </div>

        {/* Schedules & Celebrations Grid (Square) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Corporate Holidays */}
          <div className="bg-white border border-slate-200/80 shadow-sm flex flex-col rounded-none">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-none">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Corporate Holidays</h2>
                  <p className="text-[11px] text-slate-400 font-medium">Scheduled office closures</p>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-none">
                {upcomingHolidays.length} Events
              </span>
            </div>

            <div className="p-5 space-y-2.5 max-h-[350px] overflow-y-auto">
              {upcomingHolidays.length === 0 ? (
                <div className="text-center py-10 text-xs font-semibold text-slate-400 border border-dashed border-slate-200 bg-slate-50/50 rounded-none">
                  No upcoming holidays scheduled
                </div>
              ) : (
                upcomingHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50/60 border border-slate-100 hover:bg-indigo-50/30 transition-colors rounded-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-indigo-500 rounded-none" />
                      <span className="text-xs font-bold text-slate-800">{holiday.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1 border border-slate-200/60 flex items-center gap-1.5 rounded-none">
                      <Clock className="h-3 w-3 text-indigo-500" />
                      {holiday.date}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Team Celebrations */}
          <div className="bg-white border border-slate-200/80 shadow-sm flex flex-col rounded-none">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-50 text-pink-600 rounded-none">
                  <Cake className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Team Celebrations</h2>
                  <p className="text-[11px] text-slate-400 font-medium">Birthdays this month</p>
                </div>
              </div>
              <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-none">
                {birthdays.length} Birthdays
              </span>
            </div>

            <div className="p-5 space-y-2.5 max-h-[350px] overflow-y-auto">
              {birthdays.length === 0 ? (
                <div className="text-center py-10 text-xs font-semibold text-slate-400 border border-dashed border-slate-200 bg-slate-50/50 rounded-none">
                  No birthday celebrations this month
                </div>
              ) : (
                birthdays.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50/60 border border-slate-100 hover:bg-pink-50/30 transition-colors rounded-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs rounded-none">
                        {person.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{person.name}</p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{person.role}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-pink-600 bg-pink-50 px-3 py-1 rounded-none">
                      {formatBirthdayDate(person.dob)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Daily Submissions Feed + Announcement Section (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Daily Submissions Feed Container (Square) - Left Column (2/3 width) */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 shadow-sm rounded-none overflow-hidden">
            
            {/* Section Controls Topbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">Daily Work Submissions</h2>
                <p className="text-xs text-slate-400 font-medium">Detailed progress reports and project logs</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Tab Pills (Square) */}
                <div className="flex items-center bg-slate-100 border border-slate-200/80 rounded-none p-1">
                  {["all", "submitted", "completed"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 text-xs font-bold uppercase transition-all rounded-none ${
                        activeTab === tab
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Live Search Input (Square) */}
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter name or project..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-none focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Submissions Feed List */}
            <div className="p-6 max-h-[650px] overflow-y-auto space-y-3">
              {filteredDailyUpdates.length === 0 ? (
                <div className="text-center py-16 text-xs font-semibold text-slate-400 border border-dashed border-slate-200 bg-slate-50/50 rounded-none">
                  No work logs matching your criteria
                </div>
              ) : (
                filteredDailyUpdates.map((update, index) => {
                  const isExpanded = expandedUpdateId === (update._id || update.id || index);
                  return (
                    <div
                      key={update._id || update.id || index}
                      className="bg-white border border-slate-200/80 shadow-xs rounded-none overflow-hidden transition-all"
                    >
                      {/* Collapsed View - Name and Role Only */}
                      <button
                        type="button"
                        onClick={() => setExpandedUpdateId(isExpanded ? null : (update._id || update.id || index))}
                        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs rounded-none flex-shrink-0">
                            {(update.employeeId?.name || update.employeeName || "U").charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-slate-900">
                              {update.employeeId?.name || update.employeeName || update.employee?.name || "N/A"}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {update.employeeId?.role || update.role || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 border border-emerald-200/60 rounded-none uppercase whitespace-nowrap">
                            <CheckCircle2 className="h-3 w-3" />
                            {update.status || "Submitted"}
                          </span>
                          <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </button>

                      {/* Expanded View - Full Details */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 p-5 space-y-4 bg-slate-50/30">
                          {/* Meta Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-slate-500 bg-white px-3 py-1 border border-slate-200/60 rounded-none">
                                {formatUpdateDate(update.reportDate || update.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Task Grid Cards (Square) */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div className="bg-white p-3.5 border border-slate-100 rounded-none">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Project & Effort
                              </span>
                              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                                <FolderGit2 className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                                {update.projectId?.projectName || update.projectName || "N/A"}
                              </p>
                              <p className="text-slate-500 mt-1.5 font-medium">
                                Logged: <strong className="text-slate-800">{update.hoursWorked ?? "N/A"} hrs</strong>
                              </p>
                            </div>

                            <div className="bg-white p-3.5 border border-slate-100 rounded-none">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Today's Progress
                              </span>
                              <p className="text-slate-700 font-medium leading-relaxed">
                                {update.todaysWork || "N/A"}
                              </p>
                            </div>

                            <div className="bg-white p-3.5 border border-slate-100 rounded-none">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Tomorrow's Plan
                              </span>
                              <p className="text-slate-700 font-medium leading-relaxed">
                                {update.tomorrowPlan || "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Additional notes row */}
                          {(update.pendingWork || update.issuesFaced || update.remarks) && (
                            <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 border-t border-slate-100/80">
                              {update.pendingWork && (
                                <p className="font-medium">
                                  <strong className="text-slate-700 font-semibold">Pending:</strong> {update.pendingWork}
                                </p>
                              )}
                              {update.issuesFaced && (
                                <p className="font-medium text-rose-600">
                                  <strong className="font-semibold">Blockers:</strong> {update.issuesFaced}
                                </p>
                              )}
                              {update.remarks && (
                                <p className="font-medium">
                                  <strong className="text-slate-700 font-semibold">Remarks:</strong> {update.remarks}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Announcement Display Section - Right Column (1/3 width) */}
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-none overflow-hidden flex flex-col min-h-[650px]">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-none">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Announcements</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Latest updates from team</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-none">
                  {announcements.length}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {announcements.length === 0 ? (
                <div className="text-center py-10 text-xs font-semibold text-slate-400 border border-dashed border-slate-200 bg-slate-50/50 rounded-none">
                  No announcements available
                </div>
              ) : (
                announcements.slice(0, showAllAnnouncements ? announcements.length : 3).map((announcement, index) => (
                  <div
                    key={announcement._id || announcement.id || index}
                    className="p-4 bg-slate-50/60 border border-slate-100 hover:border-indigo-200 transition-colors rounded-none"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-1">
                        <Megaphone className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-xs font-bold text-slate-900">{announcement.title}</h4>
                          <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap">
                            {formatAnnouncementDate(announcement.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed break-words">
                          {announcement.message}
                        </p>
                        {announcement.type && (
                          <span className="inline-block mt-1.5 text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 uppercase tracking-wider rounded-none">
                            {announcement.type}
                          </span>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAnnouncementEdit(announcement)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-none hover:bg-slate-200 transition-colors"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAnnouncementDelete(announcement._id || announcement.id || index)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-none hover:bg-rose-200 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {/* Show More/Less Button */}
              {announcements.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllAnnouncements(!showAllAnnouncements)}
                  className="w-full text-center py-2 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/30 transition-colors border border-slate-200 bg-white rounded-none"
                >
                  {showAllAnnouncements ? "Show Less" : `View All (${announcements.length})`}
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Announcement Modal (Square) */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-2xl shadow-xl rounded-none overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-none">
                  <Megaphone className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">
                  {editingAnnouncementId ? "Edit Announcement" : "Post New Announcement"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAnnouncementModal(false);
                  setAnnouncementForm({ title: "", message: "", type: "ANNOUNCEMENT" });
                  setEditingAnnouncementId(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors rounded-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter announcement title"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-none focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Message
                </label>
                <textarea
                  placeholder="Enter announcement message"
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  rows="5"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-none focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAnnouncementForm({ title: "", message: "", type: "ANNOUNCEMENT" });
                    setShowAnnouncementModal(false);
                  }}
                  className="flex-1 border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors rounded-none"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleAnnouncementSubmit}
                  disabled={!announcementForm.title.trim() || !announcementForm.message.trim()}
                  className="flex-1 py-2.5 text-xs font-bold text-white rounded-none bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  POST
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Absent Attendees Modal (Square) */}
      {showAbsentModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-md shadow-xl rounded-none overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-none">
                  <UserX className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">Absent Employees Today</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAbsentModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors rounded-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-6 space-y-2.5">
              {absentRecords.length === 0 ? (
                <div className="p-8 text-center text-xs font-semibold text-slate-400 border border-dashed border-slate-200 bg-slate-50/50 rounded-none">
                  No absent records found
                </div>
              ) : (
                absentRecords.map((record, index) => (
                  <div
                    key={record._id || record.id || index}
                    className="flex items-center justify-between p-3.5 bg-slate-50/60 border border-slate-100 rounded-none"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {record.employee?.name || record.employeeName || record.user?.name || record.name || "N/A"}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {record.employee?.role || record.role || record.user?.role || "N/A"}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-bold bg-rose-50 text-rose-600 rounded-none uppercase">
                      {record.status || "Absent"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Decision Confirmation Modal (Square) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-xs shadow-xl p-6 text-center rounded-none">
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center mb-4 rounded-none ${
                selectedStatus === "approved"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              <AlertCircle className="h-6 w-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 uppercase">Confirm Decision</h3>
            <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
              Are you sure you want to change this leave status to{" "}
              <strong className="uppercase font-bold text-slate-900">{selectedStatus}</strong>?
            </p>

            <div className="flex gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors rounded-none"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={confirmAction}
                className={`flex-1 py-2.5 text-xs font-bold text-white transition-colors rounded-none ${
                  selectedStatus === "approved"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}