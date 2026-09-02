  import React, { useEffect, useRef, useState } from "react";
  import { createPortal } from "react-dom";
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
    X,
    UserX,
    ChevronRight,
    Bell,
    Plus,
    Edit3,
    Trash2
  } from "lucide-react";
  import { useConfirm } from "../components/common/ConfirmDialog";

  export default function Dashboard() {
    const { confirm, confirmationDialog } = useConfirm();
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
    const [presentRecords, setPresentRecords] = useState([]);
    const [dashboardCounts, setDashboardCounts] = useState({
      employeeCount: 0,
      internCount: 0,
      teamLeadCount: 0,
    });
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const [showAllAnnouncementsModal, setShowAllAnnouncementsModal] = useState(false);
    const [showBellDropdown, setShowBellDropdown] = useState(false);
    const notificationButtonRef = useRef(null);
    const [notificationPosition, setNotificationPosition] = useState(null);
    const absentCardRef = useRef(null);
    const [absentPosition, setAbsentPosition] = useState(null);
    // Announcement form state
    const [announcementForm, setAnnouncementForm] = useState({
      title: "",
      message: "",
      type: "ANNOUNCEMENT"
    });
    const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);

    const isAutoAbsentTimeReached = () => {
      const now = new Date();
      return now.getHours() > 10 || (now.getHours() === 10 && now.getMinutes() >= 30);
    };

    useEffect(() => {
      const loadDashboard = async () => {
        setLoading(true);
        await Promise.all([
          fetchUsers(),
          fetchTeamLeads(),
          fetchLeaves(),
          fetchHolidays(),
          fetchAbsentAttendance(),
          fetchAnnouncements(),
        ]);
        setLoading(false);
      };

      loadDashboard();
    }, []);

    useEffect(() => {
      const openAnnouncement = () => {
        setAnnouncementForm({ title: "", message: "", type: "ANNOUNCEMENT" });
        setEditingAnnouncementId(null);
        setShowAnnouncementModal(true);
      };

      window.addEventListener("open-announcement", openAnnouncement);
      return () => window.removeEventListener("open-announcement", openAnnouncement);
    }, []);

    useEffect(() => {
      const openNotifications = () => {
        setNotificationPosition({
          top: 64,
          left: 12,
          width: Math.min(320, window.innerWidth - 24),
        });
        setShowBellDropdown(true);
      };

      window.addEventListener("open-notifications", openNotifications);
      return () => window.removeEventListener("open-notifications", openNotifications);
    }, []);

    useEffect(() => {
      if (!isAutoAbsentTimeReached()) return;

      fetchAbsentAttendance();

      const intervalId = setInterval(() => {
        if (isAutoAbsentTimeReached()) {
          fetchAbsentAttendance();
        }
      }, 60000);

      return () => clearInterval(intervalId);
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
        // Fetch employees from employee/list API
        const employeeResponse = await fetch("https://kt-backend-1.onrender.com/api/employee/list");
        const employeeData = await employeeResponse.json();
        console.log("Employee API Response:", employeeData);
        
        let employees = [];
        if (Array.isArray(employeeData)) {
          employees = employeeData;
        } else if (employeeData.users && Array.isArray(employeeData.users)) {
          employees = employeeData.users;
        } else if (employeeData.data && Array.isArray(employeeData.data)) {
          employees = employeeData.data;
        } else if (employeeData.employees && Array.isArray(employeeData.employees)) {
          employees = employeeData.employees;
        }
        
        const employeeCount = Array.isArray(employees) ? employees.length : 0;
        console.log("Employee Count:", employeeCount);

        // Fetch interns from users/all API
        const usersResponse = await fetch("https://kt-backend-1.onrender.com/api/users/all");
        const usersData = await usersResponse.json();
        const users = usersData.users || usersData.data || [];
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
        console.error("Error fetching users:", error);
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
    const response = await fetch(
      "https://kt-backend-1.onrender.com/api/holiday/current-month"
    );

    if (!response.ok) {
      throw new Error(
        `Holiday API failed: ${response.status}`
      );
    }

    const data = await response.json();

    let holidays = [];

    if (Array.isArray(data)) {
      holidays = data;
    } else if (Array.isArray(data.holidays)) {
      holidays = data.holidays;
    } else if (Array.isArray(data.data)) {
      holidays = data.data;
    } else if (Array.isArray(data.holiday)) {
      holidays = data.holiday;
    } else if (Array.isArray(data.currentMonthHolidays)) {
      holidays = data.currentMonthHolidays;
    } else if (Array.isArray(data.result)) {
      holidays = data.result;
    }

    const formatted = holidays.map((holiday) => ({
      id: holiday._id || holiday.id,

      name:
        holiday.holidayName ||
        holiday.name ||
        "Holiday",

      date: formatHolidayDate(
        holiday.holidayDate ||
        holiday.date
      ),

      // ================= UNSPLASH IMAGE =================
      image:
        holiday.imagePhotographer || null,

      // Optional Unsplash attribution
      photographer:
        holiday.imagePhotographer || null,

      photographerUrl:
        holiday.imagePhotographerUrl || null,

      unsplashUrl:
        holiday.imageUnsplashUrl || null,

      isDefault:
        holiday.isDefault || false,
    }));

    setUpcomingHolidays(formatted);
  } catch (error) {
    console.error(
      "Error fetching holidays:",
      error
    );

    setUpcomingHolidays([]);
  }
}

    const getLocalDateKey = (dateValue) => {
      const parsedDate = new Date(dateValue);
      if (Number.isNaN(parsedDate.getTime())) return null;
      return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}-${String(parsedDate.getDate()).padStart(2, "0")}`;
    };

    const normalizeAttendanceRecords = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (!payload || typeof payload !== "object") return [];

      const nestedCandidates = [
        payload.data,
        payload.records,
        payload.result,
        payload.attendance,
        payload.absent,
        payload.notCheckedIn,
        payload.notCheckedInList,
        payload.users,
        payload.employees,
        payload.data?.data,
        payload.data?.records,
        payload.data?.users,
        payload.data?.employees,
      ];

      for (const candidate of nestedCandidates) {
        if (Array.isArray(candidate)) return candidate;
      }

      return [];
    };

    const getAttendanceStatus = (record) => {
      const rawStatus =
        record?.status ||
        record?.attendanceStatus ||
        record?.currentStatus ||
        record?.state ||
        record?.attendance?.status ||
        "";
      const status = String(rawStatus).trim().toLowerCase();

      if (["present", "on time", "approved"].includes(status)) return "present";
      if (record?.checkInTime || record?.checkinTime || record?.punchIn || record?.approvedCheckInTime) {
        return "present";
      }
      return status;
    };

    const getAttendanceDate = (record) =>
      record?.date ||
      record?.attendanceDate ||
      record?.attendance?.date ||
      record?.createdAt ||
      record?.checkInTime ||
      record?.checkinTime ||
      record?.updatedAt;
 
    async function fetchAbsentAttendance() {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch absent records from the dedicated API
        const absentResponse = await fetch(
          "https://kt-backend-1.onrender.com/api/attendance/absent/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!absentResponse.ok) {
          throw new Error(`Absent attendance fetch failed: ${absentResponse.status}`);
        }

        const absentData = await absentResponse.json();
        const absentRecordsList = normalizeAttendanceRecords(absentData);

        const normalizedAbsent = absentRecordsList.map((record, index) => ({
          ...record,
          _id: record._id || record.id || `absent-${index}`,
          employeeName: record.employeeName || record.name || record.user?.name || record.employee?.name || "N/A",
          role: record.role || record.user?.role || record.employee?.role || "N/A",
        }));

        setAbsentRecords(normalizedAbsent);

        // Fetch present records
        const attendanceResponse = await fetch("https://kt-backend-1.onrender.com/api/attendance/admin/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const attendanceData = await attendanceResponse.json();
        const attendanceList = normalizeAttendanceRecords(attendanceData);

        const todayKey = getLocalDateKey(new Date());
        const todayPresent = attendanceList.filter((record) => {
          const recordDate = getLocalDateKey(getAttendanceDate(record));
          return getAttendanceStatus(record) === "present" && (!recordDate || recordDate === todayKey);
        });

        setPresentRecords(todayPresent);
      } catch (error) {
        console.error("Error fetching absent attendance:", error);
        setAbsentRecords([]);

        try {
          const token = localStorage.getItem("token");
          const response = await fetch("https://kt-backend-1.onrender.com/api/attendance/admin/all", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          let attendanceData = normalizeAttendanceRecords(data);

          const todayKey = getLocalDateKey(new Date());
          const absentOnly = attendanceData.filter((record) => {
            const recordDate = getLocalDateKey(getAttendanceDate(record));
            return getAttendanceStatus(record) === "absent" && (!recordDate || recordDate === todayKey);
          });

          const presentOnly = attendanceData.filter((record) => {
            const recordDate = getLocalDateKey(getAttendanceDate(record));
            return getAttendanceStatus(record) === "present" && (!recordDate || recordDate === todayKey);
          });

          setAbsentRecords(absentOnly);
          setPresentRecords(presentOnly);
        } catch (fallbackError) {
          console.error("Fallback absent attendance fetch failed:", fallbackError);
        }
      }
    }

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

        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
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
        } else {
          alert(data?.message || "Failed to save announcement. Please try again.");
        }
      } catch (error) {
        console.error("Error posting announcement:", error);
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
      const confirmed = await confirm({
        title: "Delete announcement?",
        message: "Are you sure you want to delete this announcement?",
        confirmLabel: "Delete",
      });
      if (!confirmed) return;

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

        if (response.ok) {
          await fetchAnnouncements();
        }
      } catch (error) {
        console.error("Error deleting announcement:", error);
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

    const getAccentStyles = (accent) => {
      switch (accent) {
        case "amber":
          return {
            iconBg: "bg-amber-50 text-amber-600 border border-amber-200/60",
            badgeBg: "bg-amber-50 text-amber-700 border border-amber-200/60",
          };
        case "purple":
          return {
            iconBg: "bg-purple-50 text-purple-600 border border-purple-200/60",
            badgeBg: "bg-purple-50 text-purple-700 border border-purple-200/60",
          };
        default:
          return {
            iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-200/60",
            badgeBg: "bg-indigo-50 text-indigo-700 border border-indigo-200/60",
          };
      }
    };

    const toggleNotifications = () => {
      if (!showBellDropdown && notificationButtonRef.current) {
        const buttonRect = notificationButtonRef.current.getBoundingClientRect();
        const dropdownWidth = Math.min(320, window.innerWidth - 24);
        const isMobile = window.innerWidth < 640;
        setNotificationPosition({
          top: buttonRect.bottom + 8,
          left: isMobile
            ? 12
            : Math.max(12, buttonRect.right - dropdownWidth),
          width: dropdownWidth,
        });
      }
      setShowBellDropdown((visible) => !visible);
    };

    const openAbsentDetails = () => {
      const cardRect = absentCardRef.current?.getBoundingClientRect();
      const popupWidth = Math.min(360, window.innerWidth - 24);
      const isMobile = window.innerWidth < 640;

      setAbsentPosition({
        top: isMobile ? "50%" : (cardRect?.bottom || 0) + 8,
        left: isMobile
          ? "50%"
          : Math.min(
              Math.max(12, cardRect?.left || 12),
              window.innerWidth - popupWidth - 12
            ),
        width: popupWidth,
        transform: isMobile ? "translate(-50%, -50%)" : "none",
      });
      setShowAbsentModal(true);
    };
 
    return (
      <div className="space-y-4">
        {loading && (
          <div className="flex justify-center items-center py-16 sm:py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600" />
          </div>
        )}
        {!loading && (
          <>
        {confirmationDialog}
        {/* Minimal Compact Header */}
        <div className="bg-transparent p-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs text-slate-400">Overview of organization metrics & daily status</p>
          </div>

          <div className="hidden items-center gap-2 shrink-0 sm:flex">
            {/* Bell Icon & Dropdown */}
            <div className="relative">
              <button
                type="button"
                ref={notificationButtonRef}
                onClick={toggleNotifications}
                aria-label={`Notifications${announcements.length > 0 ? `, ${announcements.length} unread` : ""}`}
                aria-expanded={showBellDropdown}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                {announcements.length > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                    {announcements.length > 99 ? "99+" : announcements.length}
                  </span>
                )}
              </button>

              {showBellDropdown && (
                createPortal(
                  <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowBellDropdown(false)} />
                  <div
                    role="dialog"
                    aria-label="Notifications"
                    className="fixed z-50 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-slate-200/90 bg-white text-xs shadow-xl"
                    style={notificationPosition || { top: 80, left: 12, width: "calc(100vw - 1.5rem)" }}
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="font-semibold text-slate-900">Announcements</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowBellDropdown(false);
                          setAnnouncementForm({ title: "", message: "", type: "ANNOUNCEMENT" });
                          setEditingAnnouncementId(null);
                          setShowAnnouncementModal(true);
                        }}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> New
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                      {announcements.length === 0 ? (
                        <div className="p-4 text-center text-slate-400">No announcements</div>
                      ) : (
                        announcements.slice(0, 5).map((announcement, idx) => (
                          <div key={announcement._id || idx} className="p-3 hover:bg-slate-50 transition-colors">
                            <p className="font-medium text-slate-800 truncate">{announcement.title}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{announcement.message}</p>
                            <div className="flex items-center justify-between mt-1.5 text-[10px]">
                              <span className="text-slate-400">{formatAnnouncementDate(announcement.createdAt)}</span>
                              <div className="flex gap-1">
                                <button onClick={() => handleAnnouncementEdit(announcement)} className="p-0.5 text-slate-400 hover:text-slate-700">
                                  <Edit3 className="h-3 w-3" />
                                </button>
                                <button onClick={() => handleAnnouncementDelete(announcement._id || announcement.id)} className="p-0.5 text-slate-400 hover:text-rose-600">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setShowBellDropdown(false);
                        setShowAllAnnouncementsModal(true);
                      }}
                      className="w-full border-t border-slate-100 py-2 text-center text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      View all
                    </button>
                  </div>
                  </>,
                  document.body
                )
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setAnnouncementForm({ title: "", message: "", type: "ANNOUNCEMENT" });
                setEditingAnnouncementId(null);
                setShowAnnouncementModal(true);
              }}
              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Post Announcement
            </button>
          </div>
        </div>

        {/* Shrink-to-fit Minimal Stat Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const styles = getAccentStyles(stat.accent);
            return (
              <div
                key={stat.id}
                className="bg-white p-3.5 border border-slate-200/80 rounded-xl shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-md ${styles.iconBg}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${styles.badgeBg}`}>
                    {stat.badge}
                  </span>
                </div>
                <div className="mt-2.5">
                  <p className="text-xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{stat.name}</p>
                </div>
              </div>
            );
          })}

          {/* Absent Card */}
          <button
            type="button"
            ref={absentCardRef}
            onClick={openAbsentDetails}
            className="bg-white p-3.5 border border-rose-200/80 rounded-xl shadow-xs hover:bg-rose-50/20 hover:border-rose-300 transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200/60">
                <UserX className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-md">
                Action Required
              </span>
            </div>
            <div className="mt-2.5 flex items-end justify-between">
              <div>
                <p className="text-xl font-bold text-slate-900 tracking-tight">{absentRecords.length}</p>
                <p className="text-[11px] text-rose-600 font-medium">Absent Today</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-rose-500 transition-colors" />
            </div>
          </button>
        </div>

        {/* Corporate Events & Celebrations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-4">
          
          {/* Holidays */}
          <div className="self-start h-fit bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <h2 className="text-xs font-semibold text-slate-900">Upcoming Holidays</h2>
              </div>
              <span className="text-[10px] font-medium text-slate-400">{upcomingHolidays.length} Events</span>
            </div>

            <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
              {upcomingHolidays.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  No upcoming holidays
                </div>
              ) : (
                upcomingHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="relative p-3 rounded-lg overflow-hidden border border-slate-200/60 shadow-xs flex items-center justify-between min-h-[56px]"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.5)), url(${holiday.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="flex items-center gap-2 text-white z-10">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-white">{holiday.name}</p>
                        <p className="text-[10px] text-white/70">Official Holiday</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold bg-white/20 backdrop-blur-xs text-white px-2.5 py-1 rounded-md border border-white/30 flex items-center gap-1 z-10 shrink-0">
                      <Clock className="h-3 w-3 text-amber-300" />
                      {holiday.date}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Birthdays */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Cake className="h-3.5 w-3.5 text-slate-400" />
                <h2 className="text-xs font-semibold text-slate-900">Celebrations</h2>
              </div>
              <span className="text-[10px] font-medium text-slate-400">{birthdays.length} Birthdays</span>
            </div>

            <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
              {birthdays.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  No birthdays this month
                </div>
              ) : (
                birthdays.map((person) => {
                  const initials = person.name
                    .trim()
                    .split(/\s+/)
                    .map((word) => word.charAt(0).toUpperCase())
                    .slice(0, 2)
                    .join("");

                  return (
                    <div
                      key={person.id}
                      className="group flex items-center gap-3 p-3 rounded-lg bg-slate-50/60 border border-slate-100 hover:bg-rose-50/40 hover:border-rose-200 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-sm font-bold shrink-0 border border-rose-200">
                        {initials}
                      </div>
                      <div className="min-w-0">
                       
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Birthday: {formatBirthdayDate(person.dob)}
                        </p>
                        <span className="pointer-events-none absolute z-20 hidden max-w-[220px] -translate-y-1 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white shadow-lg group-hover:block">
                          {person.name}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Present Today Grid */}
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <h2 className="text-xs font-semibold text-slate-900">Present Today</h2>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
              {presentRecords.length} Active
            </span>
          </div>

          <div className="p-3 max-h-[300px] overflow-y-auto">
            {presentRecords.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                No present records logged today
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {presentRecords.map((record, index) => {
                  const displayName = record.employee?.name || record.employeeName || record.user?.name || record.name || "N/A";
                  const role = record.employee?.role || record.role || record.user?.role || "N/A";
                  const initials = displayName
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase())
                    .slice(0, 2)
                    .join("");

                  return (
                    <div
                      key={record._id || record.id || index}
                      className="flex flex-col items-center p-2.5 rounded-lg bg-slate-50/60 border border-slate-100 hover:border-emerald-300 transition-all text-center"
                    >
                      <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-semibold shrink-0">
                        {initials}
                      </div>
                      <p className="mt-1.5 text-xs font-medium text-slate-800 truncate w-full">
                        {displayName}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate w-full">{role}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Announcement Modal */} 
        {showAnnouncementModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div
              className="w-full rounded-xl border border-slate-200/90 bg-white shadow-xl overflow-hidden"
              style={{
                width: "100%",
                maxWidth: "28rem",
              }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-semibold text-slate-900">
                  {editingAnnouncementId ? "Edit Announcement" : "Post Announcement"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAnnouncementModal(false);
                    setAnnouncementForm({ title: "", message: "", type: "ANNOUNCEMENT" });
                    setEditingAnnouncementId(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="Enter title"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Message</label>
                  <textarea
                    placeholder="Enter message..."
                    value={announcementForm.message}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAnnouncementForm({ title: "", message: "", type: "ANNOUNCEMENT" });
                      setShowAnnouncementModal(false);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAnnouncementSubmit}
                    disabled={!announcementForm.title.trim() || !announcementForm.message.trim()}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
                  >
                    {editingAnnouncementId ? "Update" : "Post"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Absent Drawer */}
{showAbsentModal && (
  <div
    className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
    onClick={() => setShowAbsentModal(false)}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="absent-today-title"
      onClick={(event) => event.stopPropagation()}
      style={absentPosition || { top: 12, left: 12, width: "calc(100vw - 24px)" }}
      className="fixed max-w-[360px] max-h-[70vh] rounded-xl bg-white shadow-xl border border-slate-200/90 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <UserX className="h-4 w-4 text-rose-600" />
          <h3 id="absent-today-title" className="text-xs font-semibold text-slate-900">
            Absent Today
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setShowAbsentModal(false)}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3 max-h-[calc(70vh-53px)] overflow-y-auto">
        {absentRecords.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
            No absent records today
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {absentRecords.map((record, index) => {
              const displayName =
                record.employee?.name ||
                record.employeeName ||
                record.user?.name ||
                record.name ||
                "N/A";

              const role =
                record.employee?.role ||
                record.role ||
                record.user?.role ||
                "N/A";

              const initials = displayName
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .map((word) => word.charAt(0).toUpperCase())
                .slice(0, 2)
                .join("");

              return (
                <div
                  key={record._id || record.id || index}
                  className="group flex flex-col items-center justify-center text-center p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-rose-50/40 hover:border-rose-200 transition-all"
                >
                  {/* Initial Circle */}
                  <div className="h-11 w-11 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-sm font-bold border border-rose-200 shadow-xs">
                    {initials}
                  </div>

                  {/* Employee Name */}
                  <p
                    className="mt-2 text-xs font-semibold text-slate-800 truncate w-full"
                    title={displayName}
                  >
                    {displayName}
                  </p>

                  {/* Role */}
                  <p
                    className="mt-0.5 text-[10px] text-slate-400 truncate w-full"
                    title={role}
                  >
                    {role}
                  </p>

                  {/* Absent Badge */}
                  <span className="mt-2 px-2 py-0.5 text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200/60 rounded-md">
                    Absent
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </div>
)}

        {/* Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white w-full max-w-xs rounded-xl p-4 text-center shadow-xl border border-slate-200/90">
              <div
                className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center mb-3 ${
                  selectedStatus === "approved" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                }`}
              >
                <AlertCircle className="h-4 w-4" />
              </div>

              <h3 className="text-xs font-semibold text-slate-900">Confirm Decision</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Set leave status to <span className="font-semibold text-slate-800 uppercase">{selectedStatus}</span>?
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-slate-200 bg-white py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmAction}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium text-white transition-colors shadow-xs ${
                    selectedStatus === "approved" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View All Announcements Modal */}
        {showAllAnnouncementsModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white w-full max-w-xl rounded-xl shadow-xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[80vh]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-semibold text-slate-900">All Announcements</h3>
                <button
                  type="button"
                  onClick={() => setShowAllAnnouncementsModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-3 flex-1">
                {announcements.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                    No announcements
                  </div>
                ) : (
                  announcements.map((announcement, index) => (
                    <div key={announcement._id || index} className="p-3 rounded-lg bg-slate-50/60 border border-slate-100">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-xs font-semibold text-slate-900">{announcement.title}</h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatAnnouncementDate(announcement.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{announcement.message}</p>
                      <div className="mt-2.5 flex items-center justify-end gap-2 border-t border-slate-200/60 pt-1.5">
                        <button
                          onClick={() => handleAnnouncementEdit(announcement)}
                          className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900"
                        >
                          <Edit3 className="h-3 w-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleAnnouncementDelete(announcement._id || announcement.id)}
                          className="flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAllAnnouncementsModal(false)}
                  className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    );
  }