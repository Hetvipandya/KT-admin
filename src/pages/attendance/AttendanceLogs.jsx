import { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Briefcase, FileText, 
  Download, RefreshCw, Search, Filter, ChevronDown,
  Users, AlertCircle, CheckCircle, XCircle, Clock as ClockIcon,
  ArrowUpDown, FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

const ATTENDANCE_URL = 'https://kt-backend-1.onrender.com/api/attendance/admin/all';
const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-emerald-600',  
  'bg-amber-600',
  'bg-sky-600',
  'bg-rose-600',
  'bg-violet-600',
  'bg-indigo-600',
  'bg-teal-600',
];

const normalizeLogs = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.attendance)) return payload.attendance;
  if (Array.isArray(payload.logs)) return payload.logs;
  return [];
};

const formatTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const mapLog = (item, index) => {
  const breaks = Array.isArray(item.breaks) ? item.breaks : item.breaks ? [item.breaks] : [];
  const firstBreak = breaks[0] || {};

  return {
    id: item._id || item.id || `log-${index}`,
    name: item.employeeName || item.name || item.user?.name || item.employee?.name || "Unknown Employee",
    email: item.email || item.user?.email || item.employee?.email || "",
    date: item.date || item.attendanceDate || item.createdAt || "",
    checkIn: item.checkInTime || item.punchIn || "",
    checkOut: item.checkOutTime || item.punchOut || "",
    breakStart: firstBreak.startTime || firstBreak.startTimeFullDisplay || firstBreak.startTimeDisplay || "",
    breakEnd: firstBreak.endTime || firstBreak.endTimeFullDisplay || firstBreak.endTimeDisplay || "",
    totalHours: item.totalWorkTimeDisplay || item.totalWorkTimeHours || item.totalHours || item.hours || "0h",
    isLate: item.isLate,
    status: item.isLate ? "Late" : item.status || "Present",
    avatarColor: item.avatarColor || AVATAR_COLORS[index % AVATAR_COLORS.length],
  };
};

const formatIndianDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function AttendanceLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const token = localStorage.getItem('token');

  const fetchAttendanceLogs = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    setError('');

    try {
      if (!token) {
        setError('Please login to view attendance logs.');
        return;
      }

      const response = await fetch(ATTENDANCE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      const attendanceItems = normalizeLogs(data);
      setLogs(attendanceItems.map(mapLog));
    } catch (err) {
      console.error(err);
      setError('Unable to load attendance logs.');
    } finally {
      if (showLoader) setLoading(false);
      else setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendanceLogs(true);
  }, []);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'on time':
      case 'present':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'late':
        return 'bg-yellow-50 text-yellow-700 border-yellow-300';
      case 'on leave':
      case 'absent':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      case 'half day':
        return 'bg-purple-50 text-purple-700 border-purple-300';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'on time':
      case 'present':
        return <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
      case 'late':
        return <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
      case 'on leave':
      case 'absent':
        return <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
      default:
        return <ClockIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedLogs = logs
    .filter((log) => {
      const matchesSearch = log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || log.status.toLowerCase() === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let compareA = a[sortField] || '';
      let compareB = b[sortField] || '';
      
      if (sortField === 'date') {
        compareA = new Date(a.date).getTime();
        compareB = new Date(b.date).getTime();
      }
      
      if (sortOrder === 'asc') {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });

  const exportToExcel = () => {
    try {
      const exportData = filteredAndSortedLogs.map((log) => ({
        'Employee Name': log.name,
        'Email': log.email,
        'Date': formatIndianDate(log.date),
        'Check In': formatTime(log.checkIn),
        'Break Start': formatTime(log.breakStart),
        'Break End': formatTime(log.breakEnd),
        'Check Out': formatTime(log.checkOut),
        'Total Hours': log.totalHours,
        'Status': log.status,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
      XLSX.writeFile(wb, `Attendance_Logs_${new Date().toLocaleDateString('en-IN')}.xlsx`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    }
  };

  const onTimeCount = logs.filter(l => l.status?.toLowerCase() === 'on time' || l.status?.toLowerCase() === 'present').length;
  const lateCount = logs.filter(l => l.status?.toLowerCase() === 'late').length;
  const absentCount = logs.filter(l => l.status?.toLowerCase() === 'on leave' || l.status?.toLowerCase() === 'absent').length;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-800 truncate">
            Attendance Logs
          </h1>
          <p className="text-sm text-gray-500 truncate">
            Inspect detailed attendance logs and history for your team
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          <div className="bg-white border border-gray-300 px-2 sm:px-4 py-1 flex items-center gap-1 sm:gap-2">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
            <span className="text-xs sm:text-sm text-gray-600 hidden xs:inline">Total: </span>
            <span className="font-semibold text-gray-800 text-xs sm:text-sm">{logs.length}</span>
          </div>
          <button
            onClick={exportToExcel}
            className="bg-emerald-600 text-white px-2 sm:px-4 py-1 hover:bg-emerald-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Export</span>
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            onClick={() => fetchAttendanceLogs(true)}
            disabled={refreshing || loading}
            className="bg-blue-600 text-white px-2 sm:px-4 py-1 hover:bg-blue-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                <span className="hidden sm:inline">Refreshing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-gray-300">

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 p-2 sm:p-4 border-b border-gray-200">
          <div className="bg-emerald-50 border border-emerald-300 p-1.5 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-emerald-700 mb-0.5">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[8px] sm:text-xs font-bold uppercase tracking-wider">On Time</span>
            </div>
            <p className="text-base sm:text-xl font-bold text-emerald-700">{onTimeCount}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-300 p-1.5 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-yellow-700 mb-0.5">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[8px] sm:text-xs font-bold uppercase tracking-wider">Late</span>
            </div>
            <p className="text-base sm:text-xl font-bold text-yellow-700">{lateCount}</p>
          </div>
          <div className="bg-rose-50 border border-rose-300 p-1.5 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-rose-700 mb-0.5">
              <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[8px] sm:text-xs font-bold uppercase tracking-wider">Absent</span>
            </div>
            <p className="text-base sm:text-xl font-bold text-rose-700">{absentCount}</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-2 sm:p-4 border-b border-gray-200">
          <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-4">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0"
              >
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Filters</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-gray-200">
                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="on time">On Time</option>
                    <option value="late">Late</option>
                    <option value="on leave">On Leave</option>
                    <option value="absent">Absent</option>
                    <option value="half day">Half Day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1">Sort By</label>
                  <select
                    value={`${sortField}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortField(field);
                      setSortOrder(order);
                    }}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="date-desc">Date (Newest)</option>
                    <option value="date-asc">Date (Oldest)</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-2 sm:mx-4 mt-2 sm:mt-4 bg-red-50 border border-red-300 text-red-600 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="break-words">{error}</span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-2 sm:gap-4 p-2 sm:p-4">
            {[1, 2, 3, 4].map((skeleton) => (
              <div key={skeleton} className="animate-pulse border border-gray-200 p-3 sm:p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-3 sm:h-5 w-20 sm:w-32 bg-gray-200" />
                      <div className="h-2 sm:h-3 w-14 sm:w-20 bg-gray-200" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-5 w-12 sm:h-8 sm:w-16 bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedLogs.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="bg-blue-50 border border-blue-300 p-3 sm:p-4">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
              </div>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              {searchTerm || filterStatus !== "all" ? "No Results Found" : "No Attendance Logs"}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 px-4">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter terms"
                : "Attendance records will appear here."}
            </p>
          </div>
        ) : (
          <div className="p-2 sm:p-4">
            {/* Desktop Table View */}
            <div className="hidden xl:block overflow-x-auto border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase text-gray-500">
                    <th className="px-3 py-2.5 text-left">#</th>
                    <th className="px-3 py-2.5 text-left">Employee</th>
                    <th className="px-3 py-2.5 text-left cursor-pointer hover:text-gray-700" onClick={() => handleSort('date')}>
                      <div className="flex items-center gap-1">
                        Date
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-3 py-2.5 text-left">Check In</th>
                    <th className="px-3 py-2.5 text-left">Break Start</th>
                    <th className="px-3 py-2.5 text-left">Break End</th>
                    <th className="px-3 py-2.5 text-left">Check Out</th>
                    <th className="px-3 py-2.5 text-left">Total Hours</th>
                    <th className="px-3 py-2.5 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAndSortedLogs.map((log, index) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 text-sm font-medium text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 ${log.avatarColor} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                            {getInitials(log.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 truncate max-w-[120px]">{log.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[120px]">{log.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {formatIndianDate(log.date)}
                      </td>
                      <td className="px-3 py-3 text-sm font-mono text-gray-700 whitespace-nowrap">
                        {formatTime(log.checkIn)}
                      </td>
                      <td className="px-3 py-3 text-sm font-mono text-gray-700 whitespace-nowrap">
                        {formatTime(log.breakStart)}
                      </td>
                      <td className="px-3 py-3 text-sm font-mono text-gray-700 whitespace-nowrap">
                        {formatTime(log.breakEnd)}
                      </td>
                      <td className="px-3 py-3 text-sm font-mono text-gray-700 whitespace-nowrap">
                        {formatTime(log.checkOut)}
                      </td>
                      <td className="px-3 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">
                        {log.totalHours}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border whitespace-nowrap ${getStatusStyle(log.status)}`}>
                          {getStatusIcon(log.status)}
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tablet View */}
            <div className="hidden md:block xl:hidden">
              <div className="space-y-3">
                {filteredAndSortedLogs.map((log, index) => (
                  <div key={log.id} className="border border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`h-10 w-10 ${log.avatarColor} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                          {getInitials(log.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-800 truncate">
                            {log.name}
                          </h3>
                          <p className="text-xs text-gray-400 truncate">{log.email}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatIndianDate(log.date)}</p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border ${getStatusStyle(log.status)}`}>
                          {getStatusIcon(log.status)}
                          <span className="hidden sm:inline">{log.status}</span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-xs">In: {formatTime(log.checkIn)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <ClockIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-xs">Out: {formatTime(log.checkOut)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
                        <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-xs">Break: {formatTime(log.breakStart)} - {formatTime(log.breakEnd)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
                        <ClockIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-xs font-medium">Total Hours: {log.totalHours}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
              {filteredAndSortedLogs.map((log, index) => (
                <div key={log.id} className="border border-gray-200 p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className={`h-9 w-9 ${log.avatarColor} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                        {getInitials(log.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">
                          {log.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">{formatIndianDate(log.date)}</p>
                        <p className="text-[10px] text-gray-400 truncate">{log.email}</p>
                      </div>
                    </div>
                    <div className="ml-1 flex-shrink-0">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-medium border ${getStatusStyle(log.status)}`}>
                        {getStatusIcon(log.status)}
                        <span className="hidden">{log.status}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-200 grid grid-cols-2 gap-1 text-xs">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="text-[10px]">In: {formatTime(log.checkIn)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <ClockIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="text-[10px]">Out: {formatTime(log.checkOut)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 col-span-2">
                      <span className="text-gray-400 text-[9px]">Break: {formatTime(log.breakStart)} - {formatTime(log.breakEnd)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 col-span-2">
                      <span className="font-semibold text-gray-700 text-[10px]">Total: {log.totalHours}</span>
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