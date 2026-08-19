import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  Users,
  AlertCircle,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';

const ATTENDANCE_URL =
  'https://kt-backend-1.onrender.com/api/attendance/admin/all';

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

/* =========================================================
   GET TODAY
========================================================= */
const getTodayLocal = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/* =========================================================
   NORMALIZE API RESPONSE
========================================================= */
const normalizeLogs = (payload) => {
  if (Array.isArray(payload)) return payload;

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.attendance)) {
    return payload.attendance;
  }

  if (Array.isArray(payload.logs)) {
    return payload.logs;
  }

  if (Array.isArray(payload.records)) {
    return payload.records;
  }

  if (Array.isArray(payload.result)) {
    return payload.result;
  }

  return [];
};

/* =========================================================
   FORMAT TIME
========================================================= */
const formatTime = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return value;
};

/* =========================================================
   NORMALIZE STATUS
========================================================= */
const normalizeStatus = (item) => {
  let status = String(
    item?.status ||
      item?.attendanceStatus ||
      item?.attendance?.status ||
      item?.adminDecision ||
      ''
  )
    .trim()
    .toLowerCase();

  if (status === 'half-day' || status === 'halfday') {
    status = 'half day';
  }

  if (status === 'onleave' || status === 'leave') {
    status = 'on leave';
  }

  if (
    item?.isAbsent === true ||
    item?.absent === true ||
    status === 'absent'
  ) {
    return 'absent';
  }

  if (status === 'half day') {
    return 'half day';
  }

  if (status === 'on leave') {
    return 'on leave';
  }

  if (
    item?.isLate === true &&
    status !== 'absent' &&
    status !== 'half day' &&
    status !== 'on leave'
  ) {
    return 'late';
  }

  if (
    status === 'present' ||
    status === 'on time' ||
    status === 'approved'
  ) {
    return 'present';
  }

  if (
    item?.checkInTime ||
    item?.punchIn ||
    item?.approvedCheckInTime
  ) {
    return 'present';
  }

  return 'unknown';
};

/* =========================================================
   MAP API LOG
========================================================= */
const mapLog = (item, index) => {
  const breaks = Array.isArray(item?.breaks)
    ? item.breaks
    : item?.breaks
      ? [item.breaks]
      : [];

  const firstBreak = breaks[0] || {};

  return {
    id: item?._id || item?.id || `log-${index}`,

    name:
      item?.employeeName ||
      item?.name ||
      item?.user?.name ||
      item?.employee?.name ||
      item?.employeeId?.name ||
      'Unknown Employee',

    email:
      item?.email ||
      item?.user?.email ||
      item?.employee?.email ||
      item?.employeeId?.email ||
      '',

    date:
      item?.date ||
      item?.attendanceDate ||
      item?.createdAt ||
      '',

    checkIn:
      item?.checkInTime ||
      item?.approvedCheckInTime ||
      item?.punchIn ||
      '',

    checkOut:
      item?.checkOutTime ||
      item?.punchOut ||
      '',

    breakStart:
      firstBreak?.startTime ||
      firstBreak?.startTimeFullDisplay ||
      firstBreak?.startTimeDisplay ||
      '',

    breakEnd:
      firstBreak?.endTime ||
      firstBreak?.endTimeFullDisplay ||
      firstBreak?.endTimeDisplay ||
      '',

    totalHours:
      item?.totalWorkTimeDisplay ||
      item?.totalWorkTimeHours ||
      item?.totalHours ||
      item?.hours ||
      '0h',

    isLate: item?.isLate === true,

    status: normalizeStatus(item),

    avatarColor:
      item?.avatarColor ||
      AVATAR_COLORS[index % AVATAR_COLORS.length],
  };
};

/* =========================================================
   FORMAT INDIAN DATE
========================================================= */
const formatIndianDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/* =========================================================
   PARSE TIME TO MINUTES
========================================================= */
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || timeStr === '—') {
    return null;
  }

  const date = new Date(timeStr);

  if (!Number.isNaN(date.getTime())) {
    return date.getHours() * 60 + date.getMinutes();
  }

  try {
    const timeParts = String(timeStr).match(
      /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i
    );

    if (timeParts) {
      let hours = parseInt(timeParts[1], 10);
      const minutes = parseInt(timeParts[2], 10);
      const ampm = timeParts[4];

      if (ampm) {
        if (
          ampm.toUpperCase() === 'PM' &&
          hours !== 12
        ) {
          hours += 12;
        }

        if (
          ampm.toUpperCase() === 'AM' &&
          hours === 12
        ) {
          hours = 0;
        }
      }

      return hours * 60 + minutes;
    }
  } catch (error) {
    return null;
  }

  return null;
};

/* =========================================================
   ATTENDANCE TIMELINE CALCULATION
========================================================= */
const calculateAttendanceProgress = (
  checkIn,
  breakStart,
  breakEnd,
  checkOut
) => {
  const checkInMinutes = parseTimeToMinutes(checkIn);
  const breakStartMinutes = parseTimeToMinutes(breakStart);
  const breakEndMinutes = parseTimeToMinutes(breakEnd);
  const checkOutMinutes = parseTimeToMinutes(checkOut);

  if (checkInMinutes === null) {
    return [];
  }

  let effectiveBreakEnd = breakEndMinutes;

  if (
    effectiveBreakEnd === null &&
    checkOutMinutes !== null
  ) {
    effectiveBreakEnd = checkOutMinutes;
  }

  const segments = [];
  let currentTime = checkInMinutes;

  if (
    breakStartMinutes !== null &&
    breakStartMinutes > currentTime
  ) {
    segments.push({
      start: currentTime,
      end: breakStartMinutes,
      color: 'blue',
      label: 'Working',
      startTime: formatTime(checkIn),
      endTime: formatTime(breakStart),
    });

    currentTime = breakStartMinutes;
  } else if (
    breakStartMinutes === null &&
    checkOutMinutes !== null &&
    checkOutMinutes > currentTime
  ) {
    segments.push({
      start: currentTime,
      end: checkOutMinutes,
      color: 'blue',
      label: 'Working',
      startTime: formatTime(checkIn),
      endTime: formatTime(checkOut),
    });

    currentTime = checkOutMinutes;
  }

  if (
    breakStartMinutes !== null &&
    effectiveBreakEnd !== null &&
    effectiveBreakEnd > breakStartMinutes
  ) {
    segments.push({
      start: breakStartMinutes,
      end: effectiveBreakEnd,
      color: 'yellow',
      label: 'Break',
      startTime: formatTime(breakStart),
      endTime: formatTime(breakEnd || checkOut),
    });

    currentTime = effectiveBreakEnd;
  }

  if (
    checkOutMinutes !== null &&
    checkOutMinutes > currentTime
  ) {
    segments.push({
      start: currentTime,
      end: checkOutMinutes,
      color: 'gray',
      label: 'Inactive',
      startTime: formatTime(
        currentTime === breakStartMinutes
          ? breakStart
          : currentTime
      ),
      endTime: formatTime(checkOut),
    });
  }

  return segments;
};

/* =========================================================
   TIMELINE COMPONENT
========================================================= */
const AttendanceTimeline = ({
  checkIn,
  breakStart,
  breakEnd,
  checkOut,
}) => {
  const segments = calculateAttendanceProgress(
    checkIn,
    breakStart,
    breakEnd,
    checkOut
  );

  const [
    localHoveredSegment,
    setLocalHoveredSegment,
  ] = useState(null);

  if (segments.length === 0) {
    return (
      <div className="w-full bg-gray-100 h-5 rounded-lg flex items-center justify-center text-[10px] text-gray-500">
        No timeline data available
      </div>
    );
  }

  const totalDuration =
    segments[segments.length - 1].end -
    segments[0].start;

  if (totalDuration <= 0) {
    return (
      <div className="w-full bg-gray-100 h-5 rounded-lg flex items-center justify-center text-[10px] text-gray-500">
        No timeline data available
      </div>
    );
  }

  const getColorClass = (color) => {
    switch (color) {
      case 'blue':
        return 'bg-gradient-to-r from-blue-400 to-blue-600';

      case 'yellow':
        return 'bg-gradient-to-r from-yellow-300 to-yellow-500';

      case 'gray':
        return 'bg-gradient-to-r from-gray-300 to-gray-500';

      default:
        return 'bg-gray-300';
    }
  };

  const getHoverColor = (color) => {
    switch (color) {
      case 'blue':
        return 'hover:from-blue-500 hover:to-blue-700';

      case 'yellow':
        return 'hover:from-yellow-400 hover:to-yellow-600';

      case 'gray':
        return 'hover:from-gray-400 hover:to-gray-600';

      default:
        return '';
    }
  };

  const getSegmentIcon = (color) => {
    switch (color) {
      case 'blue':
        return '💼';

      case 'yellow':
        return '☕';

      case 'gray':
        return '⏸️';

      default:
        return '';
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] text-gray-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            In: {formatTime(checkIn)}
          </span>

          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Out: {formatTime(checkOut)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">
            {segments.map((seg, idx) => (
              <span key={idx}>
                {idx > 0 && ' → '}

                <span
                  className={
                    seg.color === 'blue'
                      ? 'text-blue-600'
                      : seg.color === 'yellow'
                        ? 'text-yellow-600'
                        : 'text-gray-500'
                  }
                >
                  {seg.label}
                </span>
              </span>
            ))}
          </span>
        </div>
      </div>

      <div className="relative w-full h-6 rounded-lg overflow-hidden shadow-inner bg-gray-100">
        {segments.map((segment, idx) => {
          const width =
            ((segment.end - segment.start) /
              totalDuration) *
            100;

          const isHovered =
            localHoveredSegment === idx;

          return (
            <div
              key={idx}
              className={`
                ${getColorClass(segment.color)}
                ${getHoverColor(segment.color)}
                h-full
                absolute
                top-0
                left-0
                flex
                items-center
                justify-center
                text-white
                text-xs
                font-semibold
                transition-all
                duration-200
                cursor-pointer
                ${
                  isHovered
                    ? 'shadow-lg z-10 scale-y-105'
                    : ''
                }
              `}
              style={{
                width: `${width}%`,
                left: `${
                  ((segment.start -
                    segments[0].start) /
                    totalDuration) *
                  100
                }%`,
                boxShadow: isHovered
                  ? '0 4px 12px rgba(0,0,0,0.3)'
                  : 'none',
              }}
              onMouseEnter={() =>
                setLocalHoveredSegment(idx)
              }
              onMouseLeave={() =>
                setLocalHoveredSegment(null)
              }
              title={`${segment.label}: ${segment.startTime} - ${segment.endTime}`}
            >
              {width > 12 && (
                <span className="truncate px-1 flex items-center gap-1">
                  <span className="text-sm">
                    {getSegmentIcon(segment.color)}
                  </span>

                  <span className="hidden sm:inline text-[11px]">
                    {segment.label}
                  </span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-xs font-medium text-gray-600 mt-2">
        <span>📥 Check-in</span>

        {breakStart &&
          breakStart !== '—' && (
            <span>☕ Break</span>
          )}

        <span>📤 Check-out</span>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function AttendanceLogs() {
  const [selectedDate, setSelectedDate] =
    useState(getTodayLocal());

  const [logs, setLogs] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState('');

  const [searchTerm, setSearchTerm] =
    useState('');

  const [showFilters, setShowFilters] =
    useState(false);

  const [filterStatus, setFilterStatus] =
    useState('all');

  const [sortField, setSortField] =
    useState('date');

  const [sortOrder, setSortOrder] =
    useState('desc');

  const token =
    localStorage.getItem('token');

  /* =========================================================
     FETCH ATTENDANCE
  ========================================================= */
  const fetchAttendanceLogs = async (
    showLoader = true,
    date = selectedDate
  ) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError('');

    try {
      if (!token) {
        setError(
          'Please login to view attendance logs.'
        );
        return;
      }

      const url =
        `${ATTENDANCE_URL}?date=${encodeURIComponent(
          date
        )}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `HTTP Error: ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        'DATE-WISE ATTENDANCE:',
        data
      );

      const attendanceItems =
        normalizeLogs(data);

      const mappedLogs =
        attendanceItems.map(mapLog);

      setLogs(mappedLogs);
    } catch (err) {
      console.error(
        'Attendance fetch error:',
        err
      );

      setError(
        'Unable to load attendance logs.'
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  /* =========================================================
     DATE CHANGE FETCH
  ========================================================= */
  useEffect(() => {
    fetchAttendanceLogs(
      true,
      selectedDate
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  /* =========================================================
     STATUS ICON
  ========================================================= */
  const getStatusIconAndColor = (
    status
  ) => {
    const iconClass =
      'h-3 w-3 sm:h-3.5 sm:w-3.5';

    switch (
      String(status || '')
        .toLowerCase()
        .trim()
    ) {
      case 'on time':
      case 'present':
        return {
          icon: (
            <Clock
              className={`${iconClass} text-green-600`}
            />
          ),
          color: 'green',
          label: 'On Time / Present',
        };

      case 'late':
        return {
          icon: (
            <Clock
              className={`${iconClass} text-yellow-600`}
            />
          ),
          color: 'yellow',
          label: 'Late',
        };

      case 'half day':
      case 'half-day':
      case 'halfday':
        return {
          icon: (
            <Clock
              className={`${iconClass} text-blue-600`}
            />
          ),
          color: 'blue',
          label: 'Half Day',
        };

      case 'on leave':
      case 'absent':
        return {
          icon: (
            <Clock
              className={`${iconClass} text-rose-600`}
            />
          ),
          color: 'rose',
          label: 'On Leave / Absent',
        };

      default:
        return {
          icon: (
            <Clock
              className={`${iconClass} text-gray-600`}
            />
          ),
          color: 'gray',
          label: 'Unknown',
        };
    }
  };

  /* =========================================================
     STATUS STYLE
  ========================================================= */
  const getStatusStyle = (status) => {
    switch (
      String(status || '')
        .toLowerCase()
        .trim()
    ) {
      case 'on time':
      case 'present':
        return 'bg-green-50 text-green-700 border-green-300';

      case 'late':
        return 'bg-yellow-50 text-yellow-700 border-yellow-300';

      case 'half day':
      case 'half-day':
      case 'halfday':
        return 'bg-blue-50 text-blue-700 border-blue-300';

      case 'on leave':
      case 'absent':
        return 'bg-rose-50 text-rose-700 border-rose-300';

      default:
        return 'bg-gray-50 text-gray-600 border-gray-300';
    }
  };

  /* =========================================================
     INITIALS
  ========================================================= */
  const getInitials = (name) => {
    if (!name) return 'NA';

    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  /* =========================================================
     SORT
  ========================================================= */
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(
        sortOrder === 'asc'
          ? 'desc'
          : 'asc'
      );
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  /* =========================================================
     FILTER + SORT
  ========================================================= */
  const filteredAndSortedLogs =
    [...logs]
      .filter((log) => {
        const name =
          String(log.name || '')
            .toLowerCase();

        const email =
          String(log.email || '')
            .toLowerCase();

        const search =
          searchTerm.toLowerCase();

        const matchesSearch =
          name.includes(search) ||
          email.includes(search);

        const currentStatus =
          String(log.status || '')
            .toLowerCase()
            .trim();

        const matchesStatus =
          filterStatus === 'all' ||
          currentStatus ===
            filterStatus.toLowerCase();

        return (
          matchesSearch &&
          matchesStatus
        );
      })
      .sort((a, b) => {
        let compareA =
          a[sortField] || '';

        let compareB =
          b[sortField] || '';

        if (sortField === 'date') {
          compareA =
            new Date(a.date).getTime() ||
            0;

          compareB =
            new Date(b.date).getTime() ||
            0;
        }

        if (sortField === 'name') {
          compareA = String(
            compareA
          ).toLowerCase();

          compareB = String(
            compareB
          ).toLowerCase();
        }

        if (sortOrder === 'asc') {
          return compareA > compareB
            ? 1
            : -1;
        }

        return compareA < compareB
          ? 1
          : -1;
      });

  /* =========================================================
     ATTENDANCE COUNTS
  ========================================================= */
  const getNormalizedStatus = (log) => {
    return String(log?.status || '')
      .trim()
      .toLowerCase();
  };

  const onTimeCount = logs.filter(
    (log) => {
      const status =
        getNormalizedStatus(log);

      return (
        status === 'present' ||
        status === 'on time'
      );
    }
  ).length;

  const lateCount = logs.filter(
    (log) =>
      getNormalizedStatus(log) ===
      'late'
  ).length;

  const halfDayCount = logs.filter(
    (log) => {
      const status =
        getNormalizedStatus(log);

      return (
        status === 'half day' ||
        status === 'half-day' ||
        status === 'halfday'
      );
    }
  ).length;

  const absentCount = logs.filter(
    (log) => {
      const status =
        getNormalizedStatus(log);

      return (
        status === 'absent' ||
        status === 'on leave' ||
        status === 'leave'
      );
    }
  ).length;

  /* =========================================================
     EXPORT EXCEL
  ========================================================= */
  const exportToExcel = () => {
    try {
      const exportData =
        filteredAndSortedLogs.map(
          (log) => ({
            'Employee Name': log.name,
            Email: log.email,
            Date: formatIndianDate(
              log.date
            ),
            'Check In': formatTime(
              log.checkIn
            ),
            'Break Start': formatTime(
              log.breakStart
            ),
            'Break End': formatTime(
              log.breakEnd
            ),
            'Check Out': formatTime(
              log.checkOut
            ),
            'Total Hours':
              log.totalHours,
            Status: log.status,
          })
        );

      const wb =
        XLSX.utils.book_new();

      const ws =
        XLSX.utils.json_to_sheet(
          exportData
        );

      XLSX.utils.book_append_sheet(
        wb,
        ws,
        'Attendance'
      );

      XLSX.writeFile(
        wb,
        `Attendance_Logs_${new Date()
          .toLocaleDateString('en-IN')
          .replace(/\//g, '-')}.xlsx`
      );
    } catch (error) {
      console.error(
        'Export error:',
        error
      );

      alert(
        'Failed to export data'
      );
    }
  };

  /* =========================================================
     UI
  ========================================================= */
  return (
    <div className="p-4 max-w-7xl mx-auto">

      {/* HEADER */}
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

          {/* DATE */}
          <div className="flex items-center gap-2 bg-white border border-gray-300 px-2 sm:px-3 py-1">
            <Calendar className="h-4 w-4 text-gray-500" />

            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(
                  e.target.value
                )
              }
              className="text-xs sm:text-sm text-gray-700 focus:outline-none"
            />
          </div>

          {/* TOTAL */}
          <div className="bg-white border border-gray-300 px-2 sm:px-4 py-1 flex items-center gap-1 sm:gap-2">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />

            <span className="text-xs sm:text-sm text-gray-600 hidden xs:inline">
              Total:
            </span>

            <span className="font-semibold text-gray-800 text-xs sm:text-sm">
              {logs.length}
            </span>
          </div>

          {/* EXPORT */}
          <button
            onClick={exportToExcel}
            className="bg-emerald-600 text-white px-2 sm:px-4 py-1 hover:bg-emerald-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />

            <span className="hidden xs:inline">
              Export
            </span>

            <span className="hidden sm:inline">
              Excel
            </span>
          </button>

          {/* REFRESH */}
          <button
            onClick={() =>
              fetchAttendanceLogs(false)
            }
            disabled={
              refreshing || loading
            }
            className="bg-blue-600 text-white px-2 sm:px-4 py-1 hover:bg-blue-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                refreshing
                  ? 'animate-spin'
                  : ''
              }`}
            />

            <span className="hidden sm:inline">
              {refreshing
                ? 'Refreshing...'
                : 'Refresh'}
            </span>
          </button>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white border border-gray-300">

        <div className="p-2 sm:p-4 border-b border-gray-200 bg-gray-50" />

        {/* STATS */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-3 p-2 sm:p-4 border-b border-gray-200">

          {/* ON TIME */}
          <div className="bg-emerald-50 border border-emerald-300 p-1.5 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-emerald-700 mb-0.5">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />

              <span className="text-[8px] sm:text-xs font-bold uppercase tracking-wider">
                On Time
              </span>
            </div>

            <p className="text-sm sm:text-lg font-bold text-emerald-700">
              {onTimeCount}
            </p>
          </div>

          {/* LATE */}
          <div className="bg-yellow-50 border border-yellow-300 p-1.5 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-yellow-700 mb-0.5">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />

              <span className="text-[8px] sm:text-xs font-bold uppercase tracking-wider">
                Late
              </span>
            </div>

            <p className="text-sm sm:text-lg font-bold text-yellow-700">
              {lateCount}
            </p>
          </div>

          {/* HALF DAY */}
          <div className="bg-blue-50 border border-blue-300 p-1.5 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-blue-700 mb-0.5">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />

              <span className="text-[8px] sm:text-xs font-bold uppercase tracking-wider">
                Half Day
              </span>
            </div>

            <p className="text-sm sm:text-lg font-bold text-blue-700">
              {halfDayCount}
            </p>
          </div>

          {/* ABSENT */}
          <div className="bg-rose-50 border border-rose-300 p-1.5 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-rose-700 mb-0.5">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />

              <span className="text-[8px] sm:text-xs font-bold uppercase tracking-wider">
                Absent
              </span>
            </div>

            <p className="text-sm sm:text-lg font-bold text-rose-700">
              {absentCount}
            </p>
          </div>
        </div>

        {/* TIMELINE LEGEND */}
        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-700 bg-gray-50 p-3 border-b border-gray-200">

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-r from-blue-400 to-blue-600" />
            <span className="font-medium">
              💼 Working
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-r from-yellow-300 to-yellow-500" />
            <span className="font-medium">
              ☕ Break
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-r from-gray-300 to-gray-500" />
            <span className="font-medium">
              ⏸️ Idle
            </span>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="p-2 sm:p-4 border-b border-gray-200">

          <div className="flex flex-col gap-2 sm:gap-4">

            <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-4">

              {/* SEARCH */}
              <div className="relative flex-1 min-w-0">

                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />

                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                  className="w-full pl-7 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* FILTER */}
              <button
                onClick={() =>
                  setShowFilters(
                    !showFilters
                  )
                }
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0"
              >
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />

                <span className="hidden xs:inline">
                  Filters
                </span>

                <ChevronDown
                  className={`h-3 w-3 transition-transform ${
                    showFilters
                      ? 'rotate-180'
                      : ''
                  }`}
                />
              </button>
            </div>

            {/* FILTER OPTIONS */}
            {showFilters && (
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-gray-200">

                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1">
                    Status
                  </label>

                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(
                        e.target.value
                      )
                    }
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">
                      All Status
                    </option>

                    <option value="on time">
                      On Time
                    </option>

                    <option value="present">
                      Present
                    </option>

                    <option value="late">
                      Late
                    </option>

                    <option value="on leave">
                      On Leave
                    </option>

                    <option value="absent">
                      Absent
                    </option>

                    <option value="half day">
                      Half Day
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1">
                    Sort By
                  </label>

                  <select
                    value={`${sortField}-${sortOrder}`}
                    onChange={(e) => {
                      const [
                        field,
                        order,
                      ] =
                        e.target.value.split(
                          '-'
                        );

                      setSortField(field);
                      setSortOrder(order);
                    }}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="date-desc">
                      Date (Newest)
                    </option>

                    <option value="date-asc">
                      Date (Oldest)
                    </option>

                    <option value="name-asc">
                      Name (A-Z)
                    </option>

                    <option value="name-desc">
                      Name (Z-A)
                    </option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mx-2 sm:mx-4 mt-2 sm:mt-4 bg-red-50 border border-red-300 text-red-600 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />

            <span className="break-words">
              {error}
            </span>
          </div>
        )}

        {/* =====================================================
            LOADING EFFECT
            SAME STYLE AS PERFORMANCE COMPONENT
        ===================================================== */}
        {loading ? (
          <div className="flex justify-center items-center py-16 sm:py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600" />
          </div>
        ) : filteredAndSortedLogs.length === 0 ? (

          /* EMPTY */
          <div className="text-center py-12 sm:py-16">

            <div className="flex justify-center mb-3 sm:mb-4">

              <div className="bg-blue-50 border border-blue-300 p-3 sm:p-4">

                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />

              </div>
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-gray-800">

              {searchTerm ||
              filterStatus !== 'all'
                ? 'No Results Found'
                : 'No Attendance Logs'}

            </h3>

            <p className="mt-1 text-xs sm:text-sm text-gray-500 px-4">

              {searchTerm ||
              filterStatus !== 'all'
                ? 'Try adjusting your search or filter terms'
                : 'Attendance records will appear here.'}

            </p>
          </div>
        ) : (

          /* DATA */
          <div className="p-2 sm:p-4">

            {/* DESKTOP */}
            <div className="hidden xl:block overflow-x-auto border border-gray-200">

              <table className="w-full text-sm">

                <thead>

                  <tr className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase text-gray-500">

                    <th className="px-3 py-2.5 text-left">
                      #
                    </th>

                    <th className="px-3 py-2.5 text-left">
                      Employee
                    </th>

                    <th
                      className="px-3 py-2.5 text-left cursor-pointer hover:text-gray-700"
                      onClick={() =>
                        handleSort('date')
                      }
                    >
                      <div className="flex items-center gap-1">
                        Date
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>

                    <th className="px-3 py-2.5 text-left min-w-[280px]">
                      Timeline
                    </th>

                    <th className="px-3 py-2.5 text-left">
                      Total Hours
                    </th>

                    <th className="px-3 py-2.5 text-left">
                      Status
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">

                  {filteredAndSortedLogs.map(
                    (log, index) => {

                      const {
                        icon,
                      } =
                        getStatusIconAndColor(
                          log.status
                        );

                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-gray-50"
                        >

                          <td className="px-3 py-3 text-sm font-medium text-gray-500">
                            {index + 1}
                          </td>

                          <td className="px-3 py-3">

                            <div className="flex items-center gap-2">

                              <div
                                className={`h-8 w-8 ${log.avatarColor} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}
                              >
                                {getInitials(
                                  log.name
                                )}
                              </div>

                              <div className="min-w-0">

                                <p className="font-medium text-gray-800 truncate max-w-[120px]">
                                  {log.name}
                                </p>

                                <p className="text-xs text-gray-400 truncate max-w-[120px]">
                                  {log.email}
                                </p>

                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {formatIndianDate(
                              log.date
                            )}
                          </td>

                          <td className="px-3 py-3 min-w-[280px]">

                            <AttendanceTimeline
                              checkIn={
                                log.checkIn
                              }
                              breakStart={
                                log.breakStart
                              }
                              breakEnd={
                                log.breakEnd
                              }
                              checkOut={
                                log.checkOut
                              }
                            />

                          </td>

                          <td className="px-3 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">
                            {log.totalHours}
                          </td>

                          <td className="px-3 py-3">

                            <span
                              title={
                                log.status
                              }
                              className={`inline-flex items-center justify-center h-8 w-8 rounded border ${getStatusStyle(
                                log.status
                              )}`}
                            >
                              {icon}
                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>
              </table>
            </div>

            {/* MOBILE / TABLET */}
            <div className="xl:hidden">

              <div className="space-y-3">

                {filteredAndSortedLogs.map(
                  (log, index) => {

                    const {
                      icon,
                    } =
                      getStatusIconAndColor(
                        log.status
                      );

                    return (
                      <div
                        key={log.id}
                        className="border border-gray-200 p-3 sm:p-4"
                      >

                        <div className="flex items-start justify-between">

                          <div className="flex items-center gap-3 flex-1 min-w-0">

                            <div
                              className={`h-9 w-9 sm:h-10 sm:w-10 ${log.avatarColor} text-white flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0`}
                            >
                              {getInitials(
                                log.name
                              )}
                            </div>

                            <div className="min-w-0 flex-1">

                              <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                                {log.name}
                              </h3>

                              <p className="text-xs text-gray-400 truncate">
                                {log.email}
                              </p>

                              <p className="text-xs text-gray-500 mt-0.5">
                                {formatIndianDate(
                                  log.date
                                )}
                              </p>

                            </div>
                          </div>

                          <div className="ml-2 flex-shrink-0">

                            <span
                              title={
                                log.status
                              }
                              className={`inline-flex items-center justify-center h-8 w-8 rounded border ${getStatusStyle(
                                log.status
                              )}`}
                            >
                              {icon}
                            </span>

                          </div>
                        </div>

                        <div className="mt-3">

                          <AttendanceTimeline
                            checkIn={
                              log.checkIn
                            }
                            breakStart={
                              log.breakStart
                            }
                            breakEnd={
                              log.breakEnd
                            }
                            checkOut={
                              log.checkOut
                            }
                          />

                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap gap-2 text-xs text-gray-600">

                          <div className="flex items-center gap-1">

                            <Clock className="h-3 w-3 text-gray-400" />

                            <span>
                              In:{' '}
                              {formatTime(
                                log.checkIn
                              )}
                            </span>

                          </div>

                          <div className="flex items-center gap-1">

                            <Clock className="h-3 w-3 text-gray-400" />

                            <span>
                              Out:{' '}
                              {formatTime(
                                log.checkOut
                              )}
                            </span>

                          </div>

                          <div className="flex items-center gap-1">

                            <span className="font-semibold text-gray-700">
                              Total:{' '}
                              {
                                log.totalHours
                              }
                            </span>

                          </div>

                          <div className="flex items-center gap-1">

                            <span className="font-semibold text-gray-700 capitalize">
                              Status:{' '}
                              {log.status}
                            </span>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}