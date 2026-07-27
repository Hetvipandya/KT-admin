import { useState, useEffect } from 'react';

export default function Adjustments() {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    sessions: [
      {
        checkin: '',
        breakStart: '',
        breakEnd: '',
        checkout: ''
      } 
    ],
    reason: ''
  });

  const [advancedMode, setAdvancedMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentAdjustments, setRecentAdjustments] = useState([]);
  const [fetchingLogs, setFetchingLogs] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);

  const API_BASE_URL = 'https://kt-backend-1.onrender.com/api';

  // Fetch all employees from all sources
  useEffect(() => {
  const fetchAllEmployees = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};

      const attendanceRes = await fetch(
        `${API_BASE_URL}/attendance/admin/all`,
        { headers }
      );

      if (!attendanceRes.ok) {
        throw new Error("Failed to load employees");
      }

      const attendanceData = await attendanceRes.json();

      const attendanceList =
        attendanceData.data ||
        attendanceData.attendance ||
        attendanceData.records ||
        [];

      const employeeMap = new Map();

      attendanceList.forEach((item) => {
        const emp =
          item.userId ||
          item.employeeId ||
          item.employee ||
          {};

        if (!emp || !emp._id) return;

        if (!employeeMap.has(emp._id)) {
          employeeMap.set(emp._id, {
            id: emp._id,
            name:
              `${emp.firstName || ""} ${emp.lastName || ""}`.trim() ||
              emp.name ||
              "Unknown Employee",
            employeeId:
              emp.employeeID ||
              emp.employeeId ||
              "",
            roleType: emp.role || "employee",
          });
        }
      });

      const employeeList = Array.from(employeeMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setEmployees(employeeList);

      if (employeeList.length === 0) {
        setError("No employees found.");
      }
    } catch (err) {
      console.error(err);
      setEmployees([]);
      setError(err.message || "Unable to load employees.");
    } finally {
      setLoading(false);
    }
  };

  fetchAllEmployees();
  fetchRecentAdjustments();
}, []);

  // Fetch recent adjustments history
  const fetchRecentAdjustments = async () => {
    setFetchingLogs(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found, skipping fetch');
        setFetchingLogs(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/adjustment/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned HTML instead of JSON.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setRecentAdjustments(data.data.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching adjustments:', error);
    } finally {
      setFetchingLogs(false);
    }
  };

  // Handle session field changes
  const handleSessionChange = (index, field, value) => {
    const newSessions = [...formData.sessions];
    newSessions[index] = { ...newSessions[index], [field]: value };
    setFormData(prev => ({ ...prev, sessions: newSessions }));
  };

  const addSession = () => {
    if (sessionCount >= 2) {
      alert('Maximum 2 sessions allowed');
      return;
    }
    setFormData(prev => ({
      ...prev,
      sessions: [...prev.sessions, { checkin: '', breakStart: '', breakEnd: '', checkout: '' }]
    }));
    setSessionCount(prev => prev + 1);
  };

  const removeSession = () => {
    if (sessionCount <= 1) {
      alert('Minimum 1 session required');
      return;
    }
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.slice(0, -1)
    }));
    setSessionCount(prev => prev - 1);
  };

  const handleEmployeeSelect = (e) => {
    setFormData(prev => ({ ...prev, employeeId: e.target.value }));
  };

  const handleDateChange = (e) => {
    setFormData(prev => ({ ...prev, date: e.target.value }));
  };

  const handleReasonChange = (e) => {
    setFormData(prev => ({ ...prev, reason: e.target.value }));
  };

  // Submit - Direct Attendance Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.date || !formData.reason) {
      alert("Please fill in all required fields (Employee, Date, and Reason).");
      return;
    }

    let hasAnyTime = false;
    for (const session of formData.sessions) {
      if (session.checkin || session.breakStart || session.breakEnd || session.checkout) {
        hasAnyTime = true;
        break;
      }
    }

    if (!hasAnyTime) {
      alert("Please fill in at least one time field.");
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      // Clean sessions - only send non-empty fields
      const sessionsToSend = formData.sessions.map(session => {
        const cleaned = {};
        if (session.checkin) cleaned.checkin = session.checkin;
        if (session.breakStart) cleaned.breakStart = session.breakStart;
        if (session.breakEnd) cleaned.breakEnd = session.breakEnd;
        if (session.checkout) cleaned.checkout = session.checkout;
        return cleaned;
      }).filter(session => Object.keys(session).length > 0);

      const payload = {
        employeeId: formData.employeeId,
        date: formData.date,
        sessions: sessionsToSend.length > 0 ? sessionsToSend : [{ checkin: '', breakStart: '', breakEnd: '', checkout: '' }],
        reason: formData.reason
      };

      console.log('Sending payload:', payload);

      const response = await fetch(`${API_BASE_URL}/adjustment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Server response:', text);
        throw new Error('Server error. Please try again.');
      }

      const data = await response.json();

      if (data.success) {
        // Reset form
        setFormData({
          employeeId: '',
          date: '',
          sessions: [{ checkin: '', breakStart: '', breakEnd: '', checkout: '' }],
          reason: ''
        });
        setSessionCount(1);
        
        // Refresh the list
        await fetchRecentAdjustments();
        
        alert("✅ Attendance updated successfully!");
      } else {
        throw new Error(data.message || 'Failed to update attendance');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Get employee name from ID or nested object data
  const getEmployeeName = (employeeId) => {
    if (!employeeId) return 'Unknown Employee';

    if (typeof employeeId === 'object') {
      if (employeeId.name) return employeeId.name;
      if (employeeId.fullName) return employeeId.fullName; 
      if (employeeId.employeeName) return employeeId.employeeName;
      if (employeeId.user?.name) return employeeId.user.name;
      if (employeeId.employee?.name) return employeeId.employee.name;
      if (employeeId.userId?.name) return employeeId.userId.name;
      if (employeeId.firstName || employeeId.lastName) {
        return `${employeeId.firstName || ''} ${employeeId.lastName || ''}`.trim();
      }
      return 'Unknown Employee';
    }

    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };

  // Get role badge style
  const getRoleBadgeStyle = (roleType) => {
    const styles = {
      'intern': 'bg-violet-50 text-violet-700 border-violet-300',
      'tl': 'bg-amber-50 text-amber-700 border-amber-300',
      'employee': 'bg-blue-50 text-blue-700 border-blue-300'
    };
    return styles[roleType] || 'bg-slate-50 text-slate-700 border-slate-300';
  };

  const getStatusStyle = (status) => {
    const styles = {
      'present': 'bg-green-50 text-green-700 border-green-300',
      'absent': 'bg-red-50 text-red-700 border-red-300',
      'half-day': 'bg-yellow-50 text-yellow-700 border-yellow-300'
    };
    return styles[status] || 'bg-slate-50 text-slate-700 border-slate-300';
  };

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '—';
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timeStr;
    }
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const hasSessionData = () => {
    return formData.sessions.some(s => 
      s.checkin || s.breakStart || s.breakEnd || s.checkout
    );
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="border-b border-gray-300 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Adjustments</h1>
        <p className="mt-1 text-sm text-gray-500">Apply direct attendance adjustments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Adjustment Form */}
        <div className="lg:col-span-2 bg-gray-50 border border-gray-300 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Manual Attendance Correction</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Select Employee <span className="text-red-500">*</span>
                </label>
                <select 
                  value={formData.employeeId}
                  onChange={handleEmployeeSelect}
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">{loading ? 'Loading...' : 'Choose employee...'}</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
                {employees.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Total: {employees.length} employees loaded
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Date <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={handleDateChange}
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Sessions */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Time Sessions
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addSession}
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 transition-colors"
                    disabled={sessionCount >= 2}
                  >
                    + Add Session
                  </button>
                  <button
                    type="button"
                    onClick={removeSession}
                    className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 transition-colors"
                    disabled={sessionCount <= 1}
                  >
                    - Remove
                  </button>
                </div>
              </div>

              {formData.sessions.map((session, index) => (
                <div key={index} className="bg-white border border-gray-200 p-4">
                  <span className="text-sm font-medium text-gray-700">
                    Session {index + 1}
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Check In</label>
                      <input
                        type="time"
                        value={session.checkin}
                        onChange={(e) => handleSessionChange(index, 'checkin', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Break Start</label>
                      <input
                        type="time"
                        value={session.breakStart}
                        onChange={(e) => handleSessionChange(index, 'breakStart', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Break End</label>
                      <input
                        type="time"
                        value={session.breakEnd}
                        onChange={(e) => handleSessionChange(index, 'breakEnd', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Check Out</label>
                      <input
                        type="time"
                        value={session.checkout}
                        onChange={(e) => handleSessionChange(index, 'checkout', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea 
                rows="3"
                placeholder="Reason for adjustment..."
                value={formData.reason}
                onChange={handleReasonChange}
                className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                type="submit"
                disabled={submitting || loading}
                className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white font-medium text-sm px-6 py-2.5 transition-colors"
              >
                {submitting ? 'Updating...' : 'Update Attendance'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Recent History */}
        <div className="border border-gray-300 p-5 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Adjustments</h2>
          
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {fetchingLogs ? (
              <p className="text-sm text-gray-500 text-center py-4">Loading...</p>
            ) : recentAdjustments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No adjustments yet</p>
            ) : (
              recentAdjustments.map((item) => (
                <div key={item._id} className="p-3.5 border border-gray-200 bg-gray-50 text-xs text-gray-600">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-gray-800 text-sm">
                      {item.employeeName || getEmployeeName(item.employeeId) || 'Unknown Employee'}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 border ${getStatusStyle(item.status)}`}>
                      {item.status?.toUpperCase() || 'PRESENT'}
                    </span>
                  </div>
                  
                  <p className="text-gray-500 mt-1">
                    Date: <span className="text-gray-700">{formatDateDisplay(item.date)}</span>
                  </p>

                  <div className="mt-2 pt-2 border-t border-dashed border-gray-200 flex flex-wrap gap-2">
                    {item.checkInTime && (
                      <span className="bg-green-50 px-1.5 py-0.5 border border-green-200">
                        In: {formatTimeDisplay(item.checkInTime)}
                      </span>
                    )}
                    {item.checkOutTime && (
                      <span className="bg-red-50 px-1.5 py-0.5 border border-red-200">
                        Out: {formatTimeDisplay(item.checkOutTime)}
                      </span>
                    )}
                    {item.totalWorkTime > 0 && (
                      <span className="bg-blue-50 px-1.5 py-0.5 border border-blue-200">
                        Work: {item.totalWorkTime}h
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}