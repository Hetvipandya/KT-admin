
import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, RefreshCw, User, Calendar, Search, Filter, Users, AlertCircle } from "lucide-react";

const ADMIN_ID = "6a23b5c49cd1507bfd5e3bcb";
const PENDING_URL = "https://kt-backend-1.onrender.com/api/attendance/pending";
const APPROVE_URL = "https://kt-backend-1.onrender.com/api/attendance/approve";

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-sky-600",
  "bg-rose-600",
  "bg-violet-600",
  "bg-indigo-600",
  "bg-teal-600",
];

const normalizeRequests = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.pendingRequests)) return payload.pendingRequests;
    if (Array.isArray(payload.requests)) return payload.requests;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.attendance)) return payload.attendance;
    if (payload._id || payload.userId) return [payload];
  }
  return [];
};

const mapRequest = (item, index) => ({
  id: item._id || item.id || `${item.requestedTime || item.date}-${index}`,
  name: item.employeeName || item.name || item.userId?.name || item.employee?.name || "Unknown Employee",
  role: item.role || item.userId?.role || item.employee?.role || "Employee",
  requestedTime: item.requestedTime || item.checkInTime || item.requestedAt || "N/A",
  date: item.date || item.createdAt || "",
  approvalStatus: item.approvalStatus || item.status || "pending",
  avatarColor: item.avatarColor || AVATAR_COLORS[index % AVATAR_COLORS.length],
  email: item.email || item.userId?.email || "",
  department: item.department || item.userId?.department || "",
});

export default function CheckInRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const token = localStorage.getItem("token");

  const fetchPendingRequests = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    setError("");

    try {
      if (!token) {
        setError("Please login first.");
        return;
      }

      const res = await fetch(PENDING_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const normalized = normalizeRequests(data);
      const mappedRequests = normalized.map(mapRequest);

      setRequests((prevRequests) => {
        const processedItems = prevRequests.filter(item => item.approvalStatus !== "pending");
        const newPendingItems = mappedRequests.filter(
          (newItem) => !processedItems.some((oldItem) => oldItem.id === newItem.id)
        );
        return [...processedItems, ...newPendingItems];
      });
    } catch (err) {
      console.error(err);
      setError("Unable to load pending requests.");
    } finally {
      if (showLoader) setLoading(false);
      else setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests(true);
    const interval = setInterval(() => {
      fetchPendingRequests(false);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id, type) => {
    setActioningId(id);
    setError("");

    const updatedStatus = type === "approve" ? "approved" : "rejected";

    try {
      if (!token) {
        setError("Please login first.");
        return;
      }

      await fetch(APPROVE_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminId: ADMIN_ID,
          approvedBy: ADMIN_ID,
          attendanceId: id,
          action: type,
          approvalStatus: updatedStatus,
        }),
      });

      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === id ? { ...req, approvalStatus: updatedStatus } : req
        )
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update request status.");
    } finally {
      setActioningId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return "bg-green-100 text-green-700 border-green-300";
      case "rejected": return "bg-red-100 text-red-700 border-red-300";
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default: return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return <CheckCircle className="h-3 w-3" />;
      case "rejected": return <XCircle className="h-3 w-3" />;
      case "pending": return <Clock className="h-3 w-3" />;
      default: return null;
    }
  };

  const pendingCount = requests.filter(r => r.approvalStatus === "pending").length;
  const approvedCount = requests.filter(r => r.approvalStatus === "approved").length;
  const rejectedCount = requests.filter(r => r.approvalStatus === "rejected").length;

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || req.approvalStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Check-In Requests</h1>
          <p className="text-sm text-gray-500">Manage employee attendance approvals</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white border border-gray-300 px-3 py-1 rounded text-sm">
            <span className="text-gray-600">Total: </span>
            <span className="font-semibold">{requests.length}</span>
          </div>
          <div className="bg-yellow-50 border border-yellow-300 px-3 py-1 rounded text-sm">
            <span className="text-yellow-700 font-medium">{pendingCount} Pending</span>
          </div>
          <button
            onClick={() => fetchPendingRequests(true)}
            disabled={refreshing || loading}
            className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
          >
            {refreshing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-gray-300 rounded">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 p-4 border-b border-gray-200">
          <div className="bg-yellow-50 border border-yellow-300 rounded p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-700 text-xs font-bold uppercase">
              <Clock className="h-4 w-4" />
              Pending
            </div>
            <p className="text-xl font-bold text-yellow-700">{pendingCount}</p>
          </div>
          <div className="bg-green-50 border border-green-300 rounded p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-green-700 text-xs font-bold uppercase">
              <CheckCircle className="h-4 w-4" />
              Approved
            </div>
            <p className="text-xl font-bold text-green-700">{approvedCount}</p>
          </div>
          <div className="bg-red-50 border border-red-300 rounded p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-red-700 text-xs font-bold uppercase">
              <XCircle className="h-4 w-4" />
              Rejected
            </div>
            <p className="text-xl font-bold text-red-700">{rejectedCount}</p>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="m-4 bg-red-50 border border-red-300 text-red-600 px-4 py-2 rounded text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="animate-pulse border border-gray-200 rounded p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block bg-blue-50 border border-blue-200 rounded-full p-3 mb-3">
              <Clock className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-800">
              {searchTerm || filterStatus !== "all" ? "No Results" : "No Check-In Requests"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filter" 
                : "All attendance requests will appear here."}
            </p>
          </div>
        ) : (
          <div className="p-4">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm border border-gray-200">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-xs font-bold uppercase text-gray-600">
                    <th className="px-4 py-2.5">#</th>
                    <th className="px-4 py-2.5">Employee</th>
                    <th className="px-4 py-2.5">Time</th>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((req, index) => (
                    <tr key={req.id} className={actioningId === req.id ? "opacity-60" : "hover:bg-gray-50"}>
                      <td className="px-4 py-3 text-gray-500 text-sm">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-full ${req.avatarColor} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                            {req.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{req.name}</p>
                            <p className="text-xs text-gray-500">{req.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{req.requestedTime}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {req.date ? new Date(req.date).toLocaleDateString("en-IN") : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border rounded ${getStatusColor(req.approvalStatus)}`}>
                          {getStatusIcon(req.approvalStatus)}
                          {req.approvalStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {req.approvalStatus === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              disabled={actioningId === req.id}
                              onClick={() => handleAction(req.id, "reject")}
                              className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-300 rounded hover:bg-red-100 disabled:opacity-50"
                            >
                              Reject
                            </button>
                            <button
                              disabled={actioningId === req.id}
                              onClick={() => handleAction(req.id, "approve")}
                              className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredRequests.map((req) => (
                <div key={req.id} className={`border border-gray-200 rounded p-3 ${actioningId === req.id ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`h-9 w-9 rounded-full ${req.avatarColor} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                        {req.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 text-sm truncate">{req.name}</p>
                        <p className="text-xs text-gray-500 truncate">{req.role}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {req.requestedTime} • {req.date ? new Date(req.date).toLocaleDateString("en-IN") : "N/A"}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded flex-shrink-0 ${getStatusColor(req.approvalStatus)}`}>
                      {getStatusIcon(req.approvalStatus)}
                      {req.approvalStatus}
                    </span>
                  </div>

                  {req.approvalStatus === "pending" && (
                    <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                      <button
                        disabled={actioningId === req.id}
                        onClick={() => handleAction(req.id, "reject")}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-300 rounded hover:bg-red-100 disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        disabled={actioningId === req.id}
                        onClick={() => handleAction(req.id, "approve")}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}