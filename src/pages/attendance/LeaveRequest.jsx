import { useState, useEffect } from "react";
import { 
  Calendar, Clock, User, Briefcase, FileText, CheckCircle, 
  XCircle, Search, Filter, ChevronDown, Users, AlertCircle,
  MessageSquare, CalendarDays, Clock as ClockIcon, RefreshCw
} from "lucide-react";

export default function LeaveRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [error, setError] = useState("");

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "https://kt-backend-1.onrender.com/api/leave/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      let leaveArray = [];

      if (Array.isArray(data)) leaveArray = data;
      else if (Array.isArray(data.leaves)) leaveArray = data.leaves;
      else if (Array.isArray(data.data)) leaveArray = data.data;

      const normalizedLeaves = leaveArray.map((leave) => ({
        id: leave._id || leave.id,
        name: leave.employeeId?.name || leave.name || 'Unknown',
        role: leave.employeeId?.role || leave.role || 'No role listed',
        leaveType: leave.leaveType || leave.type || 'Unknown',
        startDate: leave.startDate || leave.fromDate || '',
        endDate: leave.endDate || leave.toDate || '',
        totalDays: leave.totalDays ?? 0,
        reason: leave.reason || '',
        avatarColor: leave.avatarColor || getRandomColor(),
        approvalStatus: leave.approvalStatus || leave.status || leave.approvedStatus || leave.leaveStatus || 'Pending',
        teamLeadStatus: leave.teamLeadStatus || leave.teamLeadApprovalStatus || leave.approvalStatus || 'Pending',
        hrApprovalStatus: leave.hrApprovalStatus || leave.hrStatus || leave.hrApprovedStatus || leave.hrApprovalStatus || 'Pending',
        adminStatus: leave.adminStatus || 'Pending',
        appliedOn: leave.createdAt || leave.appliedOn || '',
      }));

      setRequests(normalizedLeaves);
    } catch (error) {
      console.log(error);
      setError("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  const getRandomColor = () => {
    const colors = [
      "bg-blue-600",
      "bg-emerald-600",
      "bg-amber-600",
      "bg-sky-600",
      "bg-rose-600",
      "bg-violet-600",
      "bg-indigo-600",
      "bg-teal-600",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const getLeaveTypeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case 'sick leave':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      case 'casual leave':
        return 'bg-indigo-50 text-indigo-700 border-indigo-300';
      case 'annual leave':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'maternity leave':
        return 'bg-pink-50 text-pink-700 border-pink-300';
      case 'paternity leave':
        return 'bg-sky-50 text-sky-700 border-sky-300';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-300';
    }
  };

  const getLeaveTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'sick leave':
        return <AlertCircle className="h-3.5 w-3.5" />;
      case 'casual leave':
        return <Calendar className="h-3.5 w-3.5" />;
      case 'annual leave':
        return <CalendarDays className="h-3.5 w-3.5" />;
      default:
        return <FileText className="h-3.5 w-3.5" />;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'NA';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || req.leaveType.toLowerCase() === filterType;
    
    return matchesSearch && matchesType;
  });

  const totalCount = requests.length;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Leave Requests
          </h1>
          <p className="text-sm text-gray-500">
            Review and manage employee leave applications
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white border border-gray-300 px-3 py-1 text-sm">
            <span className="text-gray-600">Total: </span>
            <span className="font-semibold">{requests.length}</span>
          </div>
          <div className="bg-yellow-50 border border-yellow-300 px-3 py-1 text-sm">
            <span className="text-yellow-700 font-medium">{totalCount} Records</span>
          </div>
          <button
            onClick={() => fetchLeaves()}
            className="bg-blue-600 text-white px-4 py-1.5 text-sm font-medium hover:bg-blue-700 flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-gray-300">

        {/* Search and Filter Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, role, or leave type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center gap-1.5 whitespace-nowrap"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Leave Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">All Types</option>
                    <option value="sick leave">Sick Leave</option>
                    <option value="casual leave">Casual Leave</option>
                    <option value="annual leave">Annual Leave</option>
                    <option value="maternity leave">Maternity Leave</option>
                    <option value="paternity leave">Paternity Leave</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="m-4 bg-red-50 border border-red-300 text-red-600 px-4 py-2 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((skeleton) => (
              <div key={skeleton} className="animate-pulse border border-gray-200 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-gray-200" />
                      <div className="h-3 w-20 bg-gray-200" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-16 bg-gray-200" />
                    <div className="h-8 w-16 bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block bg-blue-50 border border-blue-200 p-3 mb-3">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-800">
              {searchTerm || filterType !== "all" ? "No Results Found" : "No Leave Requests"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filter terms"
                : "All leave applications will appear here."}
            </p>
          </div>
        ) : (
          <div className="p-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase text-gray-500">
                    <th className="px-4 py-2.5 text-left">#</th>
                    <th className="px-4 py-2.5 text-left">Employee</th>
                    <th className="px-4 py-2.5 text-left">Leave Type</th>
                    <th className="px-4 py-2.5 text-left">Duration</th>
                    <th className="px-4 py-2.5 text-left">Dates</th>
                    <th className="px-4 py-2.5 text-left">Reason</th>
                    <th className="px-4 py-2.5 text-left">Team Lead Status</th>
                    <th className="px-4 py-2.5 text-left">HR Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((req, index) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 ${req.avatarColor} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                            {getInitials(req.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{req.name}</p>
                            <p className="text-xs text-gray-500">{req.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border ${getLeaveTypeStyle(req.leaveType)}`}>
                          {getLeaveTypeIcon(req.leaveType)}
                          {req.leaveType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-800">
                          {req.totalDays} {req.totalDays === 1 ? 'Day' : 'Days'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600">
                          {formatDateShort(req.startDate)} - {formatDateShort(req.endDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-500 max-w-[150px]">
                          {req.reason || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {req.teamLeadStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {req.hrApprovalStatus || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tablet and Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {filteredRequests.map((req) => (
                <div key={req.id} className="border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`h-10 w-10 ${req.avatarColor} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                        {getInitials(req.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {req.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">{req.role}</p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border ${getLeaveTypeStyle(req.leaveType)}`}>
                        {getLeaveTypeIcon(req.leaveType)}
                        <span className="hidden xs:inline">{req.leaveType}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs">
                        {formatDateShort(req.startDate)} - {formatDateShort(req.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <ClockIcon className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs font-medium">{req.totalDays} days</span>
                    </div>
                  </div>

                  {req.reason && (
                    <div className="mt-2 flex items-start gap-1.5 text-gray-500">
                      <MessageSquare className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs">{req.reason}</p>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Team Lead Status</span>
                      <span className="font-medium text-gray-700">{req.teamLeadStatus || 'Pending'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">HR Status</span>
                      <span className="font-medium text-gray-700">{req.hrApprovalStatus || 'Pending'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}