import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  AlertCircle,
} from "lucide-react";

const ADMIN_ID = "6a23b5c49cd1507bfd5e3bcb";

const PENDING_URL =
  "https://kt-backend-1.onrender.com/api/attendance/pending";

const APPROVE_URL =
  "https://kt-backend-1.onrender.com/api/attendance/approve";

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
    if (Array.isArray(payload.pendingRequests)) {
      return payload.pendingRequests;
    }

    if (Array.isArray(payload.requests)) {
      return payload.requests;
    }

    if (Array.isArray(payload.data)) {
      return payload.data;
    }

    if (Array.isArray(payload.attendance)) {
      return payload.attendance;
    }

    if (payload._id || payload.userId) {
      return [payload];
    }
  }

  return [];
};

const mapRequest = (item, index) => ({
  id:
    item._id ||
    item.id ||
    `${item.requestedTime || item.date}-${index}`,

  name:
    item.employeeName ||
    item.name ||
    item.userId?.name ||
    item.employee?.name ||
    "Unknown Employee",

  role:
    item.role ||
    item.userId?.role ||
    item.employee?.role ||
    "Employee",

  requestedTime:
    item.requestedTime ||
    item.checkInTime ||
    item.requestedAt ||
    "N/A",

  date:
    item.date ||
    item.createdAt ||
    "",

  approvalStatus:
    item.approvalStatus ||
    item.status ||
    "pending",

  avatarColor:
    item.avatarColor ||
    AVATAR_COLORS[index % AVATAR_COLORS.length],

  email:
    item.email ||
    item.userId?.email ||
    "",

  department:
    item.department ||
    item.userId?.department ||
    "",
});

export default function CheckInRequest() {
  const [requests, setRequests] = useState([]);

  // Initial page loading
  const [loading, setLoading] = useState(true);

  // Manual refresh loading
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [actioningId, setActioningId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [filterStatus, setFilterStatus] = useState("all");

  const token = localStorage.getItem("token");

  // ===============================
  // FETCH PENDING REQUESTS
  // ===============================
  const fetchPendingRequests = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    }

    setError("");

    try {
      if (!token) {
        setError("Please login first.");
        return;
      }

      const res = await fetch(PENDING_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch pending requests");
      }

      const data = await res.json();

      const normalized = normalizeRequests(data);

      const mappedRequests = normalized.map(mapRequest);

      setRequests((prevRequests) => {
        const processedItems = prevRequests.filter(
          (item) => item.approvalStatus !== "pending"
        );

        const newPendingItems = mappedRequests.filter(
          (newItem) =>
            !processedItems.some(
              (oldItem) => oldItem.id === newItem.id
            )
        );

        return [...processedItems, ...newPendingItems];
      });
    } catch (err) {
      console.error(err);
      setError("Unable to load pending requests.");
    } finally {
      // Initial loader stop
      setLoading(false);

      // Refresh loader stop
      if (showRefresh) {
        setRefreshing(false);
      }
    }
  };

  // ===============================
  // INITIAL LOAD + AUTO REFRESH
  // ===============================
  useEffect(() => {
    fetchPendingRequests(false);

    const interval = setInterval(() => {
      fetchPendingRequests(false);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // ===============================
  // APPROVE / REJECT
  // ===============================
  const handleAction = async (id, type) => {
    setActioningId(id);
    setError("");

    const updatedStatus =
      type === "approve"
        ? "approved"
        : "rejected";

    try {
      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(APPROVE_URL, {
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

      if (!response.ok) {
        throw new Error("Failed to update attendance");
      }

      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === id
            ? {
                ...req,
                approvalStatus: updatedStatus,
              }
            : req
        )
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update request status.");
    } finally {
      setActioningId(null);
    }
  };

  // ===============================
  // STATUS COLOR
  // ===============================
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-300";

      case "rejected":
        return "bg-red-100 text-red-700 border-red-300";

      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";

      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  // ===============================
  // STATUS ICON
  // ===============================
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <CheckCircle className="h-3 w-3" />;

      case "rejected":
        return <XCircle className="h-3 w-3" />;

      case "pending":
        return <Clock className="h-3 w-3" />;

      default:
        return null;
    }
  };

  // ===============================
  // COUNTS
  // ===============================
  const pendingCount = requests.filter(
    (r) => r.approvalStatus === "pending"
  ).length;

  const approvedCount = requests.filter(
    (r) => r.approvalStatus === "approved"
  ).length;

  const rejectedCount = requests.filter(
    (r) => r.approvalStatus === "rejected"
  ).length;

  // ===============================
  // FILTER
  // ===============================
  const filteredRequests = requests.filter((req) => {
    const name = req.name || "";
    const role = req.role || "";

    const matchesSearch =
      name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      role
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      req.approvalStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">

      {/* ===============================
          HEADER
      =============================== */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">

        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
            Check-In Requests
          </h1>

          <p className="text-xs sm:text-sm text-gray-500">
            Manage employee attendance approvals
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">

          {/* Total */}
          <div className="bg-white border border-gray-300 px-2.5 sm:px-3 py-1 rounded text-xs sm:text-sm">
            <span className="text-gray-600">
              Total:{" "}
            </span>

            <span className="font-semibold">
              {requests.length}
            </span>
          </div>

          {/* Pending */}
          <div className="bg-yellow-50 border border-yellow-300 px-2.5 sm:px-3 py-1 rounded text-xs sm:text-sm">
            <span className="text-yellow-700 font-medium">
              {pendingCount} Pending
            </span>
          </div>

          {/* Refresh */}
          <button
            onClick={() => fetchPendingRequests(true)}
            disabled={refreshing || loading}
            className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            {refreshing ? (
              <>
                <span className="hidden xs:inline">
                  Refreshing...
                </span>

                <span className="xs:hidden">
                  ...
                </span>
              </>
            ) : (
              <>
                <span className="hidden xs:inline">
                  Refresh
                </span>

                <span className="xs:hidden">
                  ↻
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ===============================
          MAIN CARD
      =============================== */}
      <div className="bg-white border border-gray-300 rounded-lg sm:rounded-xl shadow-sm overflow-hidden">

        {/* ===============================
            STATS
        =============================== */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 border-b border-gray-200">

          {/* Pending */}
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-2 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-700 text-[10px] sm:text-xs font-bold uppercase">

              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />

              <span className="hidden xs:inline">
                Pending
              </span>

              <span className="xs:hidden">
                Pend
              </span>
            </div>

            <p className="text-base sm:text-xl font-bold text-yellow-700">
              {pendingCount}
            </p>
          </div>

          {/* Approved */}
          <div className="bg-green-50 border border-green-300 rounded-lg p-2 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-green-700 text-[10px] sm:text-xs font-bold uppercase">

              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />

              <span className="hidden xs:inline">
                Approved
              </span>

              <span className="xs:hidden">
                Appr
              </span>
            </div>

            <p className="text-base sm:text-xl font-bold text-green-700">
              {approvedCount}
            </p>
          </div>

          {/* Rejected */}
          <div className="bg-red-50 border border-red-300 rounded-lg p-2 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-red-700 text-[10px] sm:text-xs font-bold uppercase">

              <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />

              <span className="hidden xs:inline">
                Rejected
              </span>

              <span className="xs:hidden">
                Rej
              </span>
            </div>

            <p className="text-base sm:text-xl font-bold text-red-700">
              {rejectedCount}
            </p>
          </div>
        </div>

        {/* ===============================
            SEARCH
        =============================== */}
        <div className="p-3 sm:p-4 border-b border-gray-200">

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">

            <div className="flex-1 relative">

              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

              <input
                type="text"
                placeholder="Search by name or role..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value)
              }
              className="px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
            >
              <option value="all">
                All Status
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="rejected">
                Rejected
              </option>
            </select>
          </div>
        </div>

        {/* ===============================
            ERROR
        =============================== */}
        {error && (
          <div className="m-3 sm:m-4 bg-red-50 border border-red-300 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm flex items-center gap-2">

            <AlertCircle className="h-4 w-4 flex-shrink-0" />

            <span className="break-words">
              {error}
            </span>
          </div>
        )}

        {/* ===============================
            INITIAL LOADING EFFECT
        =============================== */}
        {loading ? (
          <div className="p-4 sm:p-6">

            {/* Desktop Loading */}
            <div className="hidden md:block overflow-hidden border border-gray-200 rounded-lg">

              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                <div className="grid grid-cols-6 gap-4">

                  {[
                    "w-5",
                    "w-24",
                    "w-16",
                    "w-16",
                    "w-16",
                    "w-20",
                  ].map((width, index) => (
                    <div
                      key={index}
                      className={`h-3 ${width} bg-gray-200 rounded animate-pulse`}
                    />
                  ))}
                </div>
              </div>

              <div className="divide-y divide-gray-200">

                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="grid grid-cols-6 gap-4 items-center px-4 py-4"
                  >

                    <div className="h-4 w-5 bg-gray-200 rounded animate-pulse" />

                    <div className="flex items-center gap-2">

                      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />

                      <div className="space-y-2">

                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />

                        <div className="h-2.5 w-16 bg-gray-200 rounded animate-pulse" />

                      </div>
                    </div>

                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />

                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />

                    <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />

                    <div className="flex justify-end gap-2">

                      <div className="h-7 w-14 bg-gray-200 rounded animate-pulse" />

                      <div className="h-7 w-16 bg-gray-200 rounded animate-pulse" />

                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Loading */}
            <div className="md:hidden space-y-3">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="border border-gray-200 rounded-lg p-3"
                >

                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-2 flex-1">

                      <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />

                      <div className="space-y-2">

                        <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />

                        <div className="h-2.5 w-16 bg-gray-200 rounded animate-pulse" />

                        <div className="h-2.5 w-24 bg-gray-200 rounded animate-pulse" />

                      </div>
                    </div>

                    <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">

                    <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />

                    <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />

                  </div>
                </div>
              ))}
            </div>

            {/* Loading Text */}
            <div className="flex items-center justify-center gap-2 mt-5 text-sm text-gray-500">

              <RefreshCw className="h-4 w-4 animate-spin" />

              <span>
                Loading check-in requests...
              </span>

            </div>
          </div>
        ) : filteredRequests.length === 0 ? (

          /* ===============================
              EMPTY STATE
          =============================== */
          <div className="text-center py-12 sm:py-16">

            <div className="inline-block bg-blue-50 border border-blue-200 rounded-full p-3 sm:p-4 mb-3">

              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />

            </div>

            <h3 className="text-base sm:text-lg font-semibold text-gray-800">

              {searchTerm || filterStatus !== "all"
                ? "No Results"
                : "No Check-In Requests"}

            </h3>

            <p className="text-xs sm:text-sm text-gray-500 mt-1 px-4">

              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter"
                : "All attendance requests will appear here."}

            </p>
          </div>

        ) : (

          /* ===============================
              REQUEST DATA
          =============================== */
          <div className="p-3 sm:p-4">

            {/* ===============================
                DESKTOP TABLE
            =============================== */}
            <div className="hidden md:block overflow-x-auto">

              <table className="w-full text-sm border border-gray-200 rounded-lg">

                <thead className="bg-gray-50 border-b border-gray-200">

                  <tr className="text-left text-[10px] sm:text-xs font-bold uppercase text-gray-600">

                    <th className="px-3 sm:px-4 py-2.5">
                      #
                    </th>

                    <th className="px-3 sm:px-4 py-2.5">
                      Employee
                    </th>

                    <th className="px-3 sm:px-4 py-2.5">
                      Time
                    </th>

                    <th className="px-3 sm:px-4 py-2.5">
                      Date
                    </th>

                    <th className="px-3 sm:px-4 py-2.5">
                      Status
                    </th>

                    <th className="px-3 sm:px-4 py-2.5 text-right">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">

                  {filteredRequests.map((req, index) => (

                    <tr
                      key={req.id}
                      className={
                        actioningId === req.id
                          ? "opacity-60"
                          : "hover:bg-gray-50 transition-colors"
                      }
                    >

                      {/* Number */}
                      <td className="px-3 sm:px-4 py-3 text-gray-500 text-sm">
                        {index + 1}
                      </td>

                      {/* Employee */}
                      <td className="px-3 sm:px-4 py-3">

                        <div className="flex items-center gap-2">

                          <div
                            className={`h-8 w-8 rounded-full ${req.avatarColor} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}
                          >
                            {req.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <p className="font-medium text-gray-800 text-sm">
                              {req.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              {req.role}
                            </p>

                          </div>
                        </div>
                      </td>

                      {/* Time */}
                      <td className="px-3 sm:px-4 py-3 text-sm text-gray-700">
                        {req.requestedTime}
                      </td>

                      {/* Date */}
                      <td className="px-3 sm:px-4 py-3 text-sm text-gray-500">

                        {req.date
                          ? new Date(
                              req.date
                            ).toLocaleDateString("en-IN")
                          : "N/A"}

                      </td>

                      {/* Status */}
                      <td className="px-3 sm:px-4 py-3">

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border rounded-full ${getStatusColor(
                            req.approvalStatus
                          )}`}
                        >

                          {getStatusIcon(
                            req.approvalStatus
                          )}

                          {req.approvalStatus}

                        </span>

                      </td>

                      {/* Actions */}
                      <td className="px-3 sm:px-4 py-3 text-right">

                        {req.approvalStatus === "pending" ? (

                          <div className="flex items-center justify-end gap-2">

                            {/* Reject */}
                            <button
                              disabled={
                                actioningId === req.id
                              }
                              onClick={() =>
                                handleAction(
                                  req.id,
                                  "reject"
                                )
                              }
                              className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                            >
                              {actioningId === req.id
                                ? "..."
                                : "Reject"}
                            </button>

                            {/* Approve */}
                            <button
                              disabled={
                                actioningId === req.id
                              }
                              onClick={() =>
                                handleAction(
                                  req.id,
                                  "approve"
                                )
                              }
                              className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              {actioningId === req.id
                                ? "..."
                                : "Approve"}
                            </button>

                          </div>

                        ) : (

                          <span className="text-xs text-gray-400">
                            -
                          </span>

                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>
              </table>
            </div>

            {/* ===============================
                MOBILE CARDS
            =============================== */}
            <div className="md:hidden space-y-3">

              {filteredRequests.map((req) => (

                <div
                  key={req.id}
                  className={`border border-gray-200 rounded-lg p-3 ${
                    actioningId === req.id
                      ? "opacity-60"
                      : ""
                  }`}
                >

                  {/* Employee Header */}
                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-2 flex-1 min-w-0">

                      <div
                        className={`h-9 w-9 rounded-full ${req.avatarColor} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}
                      >
                        {req.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="font-semibold text-gray-800 text-sm truncate">
                          {req.name}
                        </p>

                        <p className="text-xs text-gray-500 truncate">
                          {req.role}
                        </p>

                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 flex-wrap">

                          <span>
                            {req.requestedTime}
                          </span>

                          <span className="hidden xs:inline">
                            •
                          </span>

                          <span className="hidden xs:inline">

                            {req.date
                              ? new Date(
                                  req.date
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                              : "N/A"}

                          </span>

                        </p>

                      </div>
                    </div>

                    {/* Status */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs font-medium border rounded-full flex-shrink-0 ${getStatusColor(
                        req.approvalStatus
                      )}`}
                    >

                      {getStatusIcon(
                        req.approvalStatus
                      )}

                      {req.approvalStatus}

                    </span>

                  </div>

                  {/* Actions */}
                  {req.approvalStatus === "pending" && (

                    <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">

                      {/* Reject */}
                      <button
                        disabled={
                          actioningId === req.id
                        }
                        onClick={() =>
                          handleAction(
                            req.id,
                            "reject"
                          )
                        }
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                      >
                        {actioningId === req.id
                          ? "Processing..."
                          : "Reject"}
                      </button>

                      {/* Approve */}
                      <button
                        disabled={
                          actioningId === req.id
                        }
                        onClick={() =>
                          handleAction(
                            req.id,
                            "approve"
                          )
                        }
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {actioningId === req.id
                          ? "Processing..."
                          : "Approve"}
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