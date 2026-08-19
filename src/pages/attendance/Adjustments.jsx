import { useState, useEffect } from "react";

export default function Adjustments() {
  const emptySession = {
    checkin: "",
    breakStart: "",
    breakEnd: "",
    checkout: "",
  };

  const initialForm = {
    employeeId: "",
    date: "",
    sessions: [{ ...emptySession }],
    reason: "",
  };

  const [formData, setFormData] = useState(initialForm);

  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [recentAdjustments, setRecentAdjustments] = useState([]);
  const [fetchingLogs, setFetchingLogs] = useState(false);

  const [sessionCount, setSessionCount] = useState(1);

  // ==========================================
  // EDIT MODE
  // ==========================================

  const [editMode, setEditMode] = useState(false);

  const [selectedAdjustment, setSelectedAdjustment] =
    useState(null);

  // ==========================================
  // CHECKBOX STATE
  // ==========================================

  /*
    Each session has 4 checkbox values:

    checkin
    breakStart
    breakEnd
    checkout

    Example:

    {
      checkin: true,
      breakStart: false,
      breakEnd: false,
      checkout: true
    }

    ALL TRUE => PUT
    ANY FALSE => PATCH
  */

  const [selectedFields, setSelectedFields] = useState([
    {
      checkin: false,
      breakStart: false,
      breakEnd: false,
      checkout: false,
    },
  ]);

  const API_BASE_URL =
    "https://kt-backend-1.onrender.com/api";

  // ==========================================
  // Fetch Employees + History
  // ==========================================

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

        const attendanceData =
          await attendanceRes.json();

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
                `${emp.firstName || ""} ${
                  emp.lastName || ""
                }`.trim() ||
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

        const employeeList = Array.from(
          employeeMap.values()
        ).sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setEmployees(employeeList);

        if (employeeList.length === 0) {
          setError("No employees found.");
        }
      } catch (err) {
        console.error(err);

        setEmployees([]);

        setError(
          err.message || "Unable to load employees."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllEmployees();
    fetchRecentAdjustments();
  }, []);

  // ==========================================
  // Fetch Adjustment History
  // ==========================================

  const fetchRecentAdjustments = async () => {
    setFetchingLogs(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn(
          "No token found, skipping fetch"
        );

        setFetchingLogs(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/adjustment/history`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const contentType =
        response.headers.get("content-type");

      if (
        !contentType ||
        !contentType.includes("application/json")
      ) {
        throw new Error(
          "Server returned HTML instead of JSON."
        );
      }

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success && data.data) {
        setRecentAdjustments(
          data.data.slice(0, 10)
        );
      }
    } catch (error) {
      console.error(
        "Error fetching adjustments:",
        error
      );
    } finally {
      setFetchingLogs(false);
    }
  };

  // ==========================================
  // Session Change
  // ==========================================

  const handleSessionChange = (
    index,
    field,
    value
  ) => {
    const newSessions = [
      ...formData.sessions,
    ];

    newSessions[index] = {
      ...newSessions[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      sessions: newSessions,
    }));
  };

  // ==========================================
  // CHECKBOX CHANGE
  // ==========================================

  const handleFieldCheckbox = (
    sessionIndex,
    field,
    checked
  ) => {
    setSelectedFields((prev) => {
      const updated = [...prev];

      if (!updated[sessionIndex]) {
        updated[sessionIndex] = {
          checkin: false,
          breakStart: false,
          breakEnd: false,
          checkout: false,
        };
      }

      updated[sessionIndex] = {
        ...updated[sessionIndex],
        [field]: checked,
      };

      return updated;
    });
  };

  // ==========================================
  // Check whether all 4 checkboxes are checked
  // ==========================================

  const areAllFieldsSelected = () => {
    if (!selectedFields.length) {
      return false;
    }

    /*
      For PUT we require ALL 4 fields
      of ALL sessions to be selected.
    */

    return selectedFields.every(
      (sessionFields) =>
        sessionFields.checkin &&
        sessionFields.breakStart &&
        sessionFields.breakEnd &&
        sessionFields.checkout
    );
  };

  // ==========================================
  // Get Update Method
  // ==========================================

  const getUpdateMethod = () => {
    return areAllFieldsSelected()
      ? "PUT"
      : "PATCH";
  };

  // ==========================================
  // Add Session
  // ==========================================

  const addSession = () => {
    if (sessionCount >= 2) {
      alert("Maximum 2 sessions allowed");
      return;
    }

    setFormData((prev) => ({
      ...prev,

      sessions: [
        ...prev.sessions,
        { ...emptySession },
      ],
    }));

    setSelectedFields((prev) => [
      ...prev,
      {
        checkin: false,
        breakStart: false,
        breakEnd: false,
        checkout: false,
      },
    ]);

    setSessionCount((prev) => prev + 1);
  };

  // ==========================================
  // Remove Session
  // ==========================================

  const removeSession = () => {
    if (sessionCount <= 1) {
      alert("Minimum 1 session required");
      return;
    }

    setFormData((prev) => ({
      ...prev,

      sessions: prev.sessions.slice(0, -1),
    }));

    setSelectedFields((prev) =>
      prev.slice(0, -1)
    );

    setSessionCount((prev) => prev - 1);
  };

  // ==========================================
  // Employee
  // ==========================================

  const handleEmployeeSelect = (e) => {
    setFormData((prev) => ({
      ...prev,
      employeeId: e.target.value,
    }));
  };

  // ==========================================
  // Date
  // ==========================================

  const handleDateChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      date: e.target.value,
    }));
  };

  // ==========================================
  // Reason
  // ==========================================

  const handleReasonChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      reason: e.target.value,
    }));
  };

  // ==========================================
  // EDIT EXISTING ATTENDANCE
  // ==========================================

  const handleEditAdjustment = (item) => {
    let employeeId = "";

    if (typeof item.employeeId === "object") {
      employeeId =
        item.employeeId?._id ||
        item.employeeId?.id ||
        "";
    } else {
      employeeId = item.employeeId || "";
    }

    // ------------------------------------------
    // Convert sessions
    // ------------------------------------------

    let sessions = [];

    if (
      Array.isArray(item.sessions) &&
      item.sessions.length > 0
    ) {
      sessions = item.sessions.map((session) => ({
        checkin: session.checkin || "",
        breakStart: session.breakStart || "",
        breakEnd: session.breakEnd || "",
        checkout: session.checkout || "",
      }));
    } else {
      /*
        If history API returns flat attendance
        fields instead of sessions, convert them
        into session 1.
      */

      sessions = [
        {
          checkin:
            item.checkInTime || "",
          breakStart:
            item.breakStart || "",
          breakEnd:
            item.breakEnd || "",
          checkout:
            item.checkOutTime || "",
        },
      ];
    }

    // ------------------------------------------
    // Checkbox values
    // ------------------------------------------

    const checkboxValues = sessions.map(
      (session) => ({
        checkin: Boolean(session.checkin),
        breakStart: Boolean(
          session.breakStart
        ),
        breakEnd: Boolean(
          session.breakEnd
        ),
        checkout: Boolean(
          session.checkout
        ),
      })
    );

    setFormData({
      employeeId,
      date: item.date || "",
      sessions,
      reason: item.reason || "",
    });

    setSessionCount(sessions.length);

    setSelectedFields(checkboxValues);

    setSelectedAdjustment(item);

    setEditMode(true);

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // Cancel Edit
  // ==========================================

  const handleCancelEdit = () => {
    setFormData({
      ...initialForm,
      sessions: [{ ...emptySession }],
    });

    setSessionCount(1);

    setSelectedFields([
      {
        checkin: false,
        breakStart: false,
        breakEnd: false,
        checkout: false,
      },
    ]);

    setEditMode(false);

    setSelectedAdjustment(null);

    setError("");
  };

  // ==========================================
  // SUBMIT
  //
  // ALL CHECKBOXES = PUT
  // OTHERWISE     = PATCH
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ------------------------------------------
    // Validation
    // ------------------------------------------

    if (
      !formData.employeeId ||
      !formData.date
    ) {
      alert(
        "Please select Employee and Date."
      );

      return;
    }

    if (!formData.reason.trim()) {
      alert("Please enter Reason.");

      return;
    }

    const hasAnyTime =
      formData.sessions.some(
        (session) =>
          session.checkin ||
          session.breakStart ||
          session.breakEnd ||
          session.checkout
      );

    if (!hasAnyTime) {
      alert(
        "Please fill in at least one time field."
      );

      return;
    }

    // ------------------------------------------
    // Automatically determine PUT/PATCH
    // ------------------------------------------

    const method = getUpdateMethod();

    // ------------------------------------------
    // PUT Validation
    // ------------------------------------------

    if (method === "PUT") {
      const allTimesFilled =
        formData.sessions.every(
          (session) =>
            session.checkin &&
            session.breakStart &&
            session.breakEnd &&
            session.checkout
        );

      if (!allTimesFilled) {
        alert(
          "For PUT, all 4 timing fields must be filled."
        );

        return;
      }
    }

    setSubmitting(true);
    setError("");

    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "No authentication token found. Please login again."
        );
      }

      let payload = {};

      // ========================================
      // PATCH
      // ========================================

      if (method === "PATCH") {
        /*
          PATCH sends ONLY the fields whose
          checkbox is checked.
        */

        const sessionsToSend =
          formData.sessions
            .map((session, sessionIndex) => {
              const checkbox =
                selectedFields[
                  sessionIndex
                ] || {};

              const cleaned = {};

              if (
                checkbox.checkin &&
                session.checkin
              ) {
                cleaned.checkin =
                  session.checkin;
              }

              if (
                checkbox.breakStart &&
                session.breakStart
              ) {
                cleaned.breakStart =
                  session.breakStart;
              }

              if (
                checkbox.breakEnd &&
                session.breakEnd
              ) {
                cleaned.breakEnd =
                  session.breakEnd;
              }

              if (
                checkbox.checkout &&
                session.checkout
              ) {
                cleaned.checkout =
                  session.checkout;
              }

              return cleaned;
            })
            .filter(
              (session) =>
                Object.keys(session).length > 0
            );

        /*
          Keep old flat PATCH fields compatible
          with your existing backend.
        */

        const firstSession =
          formData.sessions[0];

        const firstCheckbox =
          selectedFields[0] || {};

        payload = {
          employeeId:
            formData.employeeId,

          date: formData.date,

          reason:
            formData.reason.trim(),
        };

        if (
          firstCheckbox.checkin &&
          firstSession.checkin
        ) {
          payload.checkInTime =
            firstSession.checkin;
        }

        if (
          firstCheckbox.checkout &&
          firstSession.checkout
        ) {
          payload.checkOutTime =
            firstSession.checkout;
        }

        if (
          firstCheckbox.breakStart &&
          firstSession.breakStart
        ) {
          payload.breakStart =
            firstSession.breakStart;
        }

        if (
          firstCheckbox.breakEnd &&
          firstSession.breakEnd
        ) {
          payload.breakEnd =
            firstSession.breakEnd;
        }

        /*
          If your backend supports sessions
          in PATCH also, this will be available.
        */

        if (sessionsToSend.length > 0) {
          payload.sessions =
            sessionsToSend;
        }
      }

      // ========================================
      // PUT
      // ========================================

      else {
        /*
          PUT = ALL 4 checkboxes checked.

          Therefore send complete sessions.
        */

        const sessionsToSend =
          formData.sessions.map(
            (session) => ({
              checkin:
                session.checkin,

              breakStart:
                session.breakStart,

              breakEnd:
                session.breakEnd,

              checkout:
                session.checkout,
            })
          );

        payload = {
          employeeId:
            formData.employeeId,

          date: formData.date,

          sessions:
            sessionsToSend,

          reason:
            formData.reason.trim(),
        };
      }

      // ========================================
      // API URL
      // ========================================

      const url =
        `${API_BASE_URL}/adjustment/update/` +
        `${formData.employeeId}/` +
        `${formData.date}`;

      // ========================================
      // Console Debug
      // ========================================

      console.log(
        "===================================="
      );

      console.log(
        `${method} Attendance Request`
      );

      console.log("URL:", url);

      console.log(
        "Selected Fields:",
        selectedFields
      );

      console.log(
        "Are All Fields Selected:",
        areAllFieldsSelected()
      );

      console.log(
        "Payload:",
        payload
      );

      console.log(
        "===================================="
      );

      // ========================================
      // API CALL
      // ========================================

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify(payload),
      });

      // ========================================
      // Response Type
      // ========================================

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        !contentType ||
        !contentType.includes(
          "application/json"
        )
      ) {
        const text =
          await response.text();

        console.error(
          "Server response:",
          text
        );

        throw new Error(
          "Server returned invalid response."
        );
      }

      const data =
        await response.json();

      // ========================================
      // Error
      // ========================================

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            `Failed to ${method} attendance`
        );
      }

      // ========================================
      // SUCCESS
      // ========================================

      alert(
        method === "PUT"
          ? "✅ Complete attendance updated successfully!"
          : "✅ Selected attendance fields updated successfully!"
      );

      // ========================================
      // Reset Form
      // ========================================

      setFormData({
        employeeId: "",
        date: "",

        sessions: [
          {
            checkin: "",
            breakStart: "",
            breakEnd: "",
            checkout: "",
          },
        ],

        reason: "",
      });

      setSelectedFields([
        {
          checkin: false,
          breakStart: false,
          breakEnd: false,
          checkout: false,
        },
      ]);

      setSessionCount(1);

      setEditMode(false);

      setSelectedAdjustment(null);

      // ========================================
      // Refresh History
      // ========================================

      await fetchRecentAdjustments();
    } catch (error) {
      console.error(
        `${method} attendance error:`,
        error
      );

      setError(
        error.message ||
          "Something went wrong."
      );

      alert(
        `❌ Error: ${
          error.message ||
          "Something went wrong."
        }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // Get Employee Name
  // ==========================================

  const getEmployeeName = (
    employeeId
  ) => {
    if (!employeeId) {
      return "Unknown Employee";
    }

    if (
      typeof employeeId === "object"
    ) {
      if (employeeId.name) {
        return employeeId.name;
      }

      if (employeeId.fullName) {
        return employeeId.fullName;
      }

      if (
        employeeId.employeeName
      ) {
        return employeeId.employeeName;
      }

      if (employeeId.user?.name) {
        return employeeId.user.name;
      }

      if (
        employeeId.employee?.name
      ) {
        return employeeId.employee.name;
      }

      if (
        employeeId.userId?.name
      ) {
        return employeeId.userId.name;
      }

      if (
        employeeId.firstName ||
        employeeId.lastName
      ) {
        return `${employeeId.firstName || ""} ${
          employeeId.lastName || ""
        }`.trim();
      }

      return "Unknown Employee";
    }

    const employee =
      employees.find(
        (emp) =>
          emp.id === employeeId
      );

    return employee
      ? employee.name
      : "Unknown Employee";
  };

  // ==========================================
  // Status Style
  // ==========================================

  const getStatusStyle = (
    status
  ) => {
    const styles = {
      present:
        "bg-green-50 text-green-700 border-green-300",

      absent:
        "bg-red-50 text-red-700 border-red-300",

      "half-day":
        "bg-yellow-50 text-yellow-700 border-yellow-300",
    };

    return (
      styles[status] ||
      "bg-slate-50 text-slate-700 border-slate-300"
    );
  };

  // ==========================================
  // Format Time
  // ==========================================

  const formatTimeDisplay = (
    timeStr
  ) => {
    if (!timeStr) {
      return "—";
    }

    try {
      const date =
        new Date(timeStr);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return timeStr;
      }

      return date.toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      );
    } catch {
      return timeStr;
    }
  };

  // ==========================================
  // Format Date
  // ==========================================

  const formatDateDisplay = (
    dateStr
  ) => {
    if (!dateStr) {
      return "N/A";
    }

    try {
      const date =
        new Date(dateStr);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return dateStr;
      }

      return date.toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return dateStr;
    }
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="p-4 max-w-7xl mx-auto">

      {/* =====================================
          Header
      ===================================== */}

      <div className="border-b border-gray-300 pb-4 mb-6">

        <h1 className="text-2xl font-bold text-gray-800">
          Adjustments
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Apply direct attendance adjustments.
        </p>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ===================================
            LEFT - FORM
        =================================== */}

        <div className="lg:col-span-2 bg-gray-50 border border-gray-300 p-5">

          <div className="flex items-center justify-between mb-4">

            

            {editMode && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 hover:bg-red-100"
              >
                Cancel Edit
              </button>
            )}

          </div>


          {/* =================================
              Error
          ================================= */}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* =================================
              Form
          ================================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Employee + Date */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Employee */}

              <div>

                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">

                  Select Employee{" "}

                  <span className="text-red-500">
                    *
                  </span>

                </label>

                <select
                  value={
                    formData.employeeId
                  }
                  onChange={
                    handleEmployeeSelect
                  }
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={
                    loading ||
                    editMode
                  }
                >

                  <option value="">
                    {loading
                      ? "Loading..."
                      : "Choose employee..."}
                  </option>

                  {employees.map(
                    (employee) => (
                      <option
                        key={
                          employee.id
                        }
                        value={
                          employee.id
                        }
                      >
                        {employee.name}
                      </option>
                    )
                  )}

                </select>

                {employees.length >
                  0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Total:{" "}
                    {
                      employees.length
                    }{" "}
                    employees loaded
                  </p>
                )}

              </div>

              {/* Date */}

              <div>

                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">

                  Date{" "}

                  <span className="text-red-500">
                    *
                  </span>

                </label>

                <input
                  type="date"
                  value={
                    formData.date
                  }
                  onChange={
                    handleDateChange
                  }
                  disabled={
                    editMode
                  }
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                />

              </div>

            </div>

            {/* =================================
                Sessions
            ================================= */}

            <div className="space-y-4">

              <div className="flex justify-between items-center">

                <div>

                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Time Sessions
                  </label>

                  <p className="text-xs text-gray-500 mt-1">
                    Select the checkbox beside a
                    timing field to include it in
                    the update.
                  </p>

                </div>

                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={addSession}
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 transition-colors"
                    disabled={
                      sessionCount >=
                      2
                    }
                  >
                    + Add Session
                  </button>

                  <button
                    type="button"
                    onClick={
                      removeSession
                    }
                    className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 transition-colors"
                    disabled={
                      sessionCount <=
                      1
                    }
                  >
                    - Remove
                  </button>

                </div>

              </div>

              {formData.sessions.map(
                (
                  session,
                  index
                ) => {

                  const checkbox =
                    selectedFields[
                      index
                    ] || {
                      checkin: false,
                      breakStart: false,
                      breakEnd: false,
                      checkout: false,
                    };

                  return (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 p-4"
                    >

                      <div className="flex justify-between items-center mb-3">

                        <span className="text-sm font-medium text-gray-700">
                          Session{" "}
                          {index + 1}
                        </span>

                        <span className="text-[11px] text-gray-400">
                          {[
                            checkbox.checkin,
                            checkbox.breakStart,
                            checkbox.breakEnd,
                            checkbox.checkout,
                          ].filter(Boolean).length}
                          /4 selected
                        </span>

                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">

                        {/* ======================
                            CHECK IN
                        ====================== */}

                        <div>

                          <label className="flex items-center justify-between text-xs text-gray-500 mb-1">

                            <span>
                              Check In
                            </span>

                            <input
                              type="checkbox"
                              checked={
                                checkbox.checkin
                              }
                              onChange={(e) =>
                                handleFieldCheckbox(
                                  index,
                                  "checkin",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 cursor-pointer accent-blue-600"
                              title="Include Check In in update"
                            />

                          </label>

                          <input
                            type="time"
                            value={
                              session.checkin
                            }
                            onChange={(e) =>
                              handleSessionChange(
                                index,
                                "checkin",
                                e.target.value
                              )
                            }
                            className={`w-full bg-gray-50 border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                              checkbox.checkin
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300"
                            }`}
                          />

                          <p className="text-[10px] text-gray-400 mt-1">
                            {checkbox.checkin
                              ? "Included"
                              : "Not included"}
                          </p>

                        </div>

                        {/* ======================
                            BREAK START
                        ====================== */}

                        <div>

                          <label className="flex items-center justify-between text-xs text-gray-500 mb-1">

                            <span>
                              Break Start
                            </span>

                            <input
                              type="checkbox"
                              checked={
                                checkbox.breakStart
                              }
                              onChange={(e) =>
                                handleFieldCheckbox(
                                  index,
                                  "breakStart",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 cursor-pointer accent-blue-600"
                              title="Include Break Start in update"
                            />

                          </label>

                          <input
                            type="time"
                            value={
                              session.breakStart
                            }
                            onChange={(e) =>
                              handleSessionChange(
                                index,
                                "breakStart",
                                e.target.value
                              )
                            }
                            className={`w-full bg-gray-50 border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                              checkbox.breakStart
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300"
                            }`}
                          />

                          <p className="text-[10px] text-gray-400 mt-1">
                            {checkbox.breakStart
                              ? "Included"
                              : "Not included"}
                          </p>

                        </div>

                        {/* ======================
                            BREAK END
                        ====================== */}

                        <div>

                          <label className="flex items-center justify-between text-xs text-gray-500 mb-1">

                            <span>
                              Break End
                            </span>

                            <input
                              type="checkbox"
                              checked={
                                checkbox.breakEnd
                              }
                              onChange={(e) =>
                                handleFieldCheckbox(
                                  index,
                                  "breakEnd",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 cursor-pointer accent-blue-600"
                              title="Include Break End in update"
                            />

                          </label>

                          <input
                            type="time"
                            value={
                              session.breakEnd
                            }
                            onChange={(e) =>
                              handleSessionChange(
                                index,
                                "breakEnd",
                                e.target.value
                              )
                            }
                            className={`w-full bg-gray-50 border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                              checkbox.breakEnd
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300"
                            }`}
                          />

                          <p className="text-[10px] text-gray-400 mt-1">
                            {checkbox.breakEnd
                              ? "Included"
                              : "Not included"}
                          </p>

                        </div>

                        {/* ======================
                            CHECK OUT
                        ====================== */}

                        <div>

                          <label className="flex items-center justify-between text-xs text-gray-500 mb-1">

                            <span>
                              Check Out
                            </span>

                            <input
                              type="checkbox"
                              checked={
                                checkbox.checkout
                              }
                              onChange={(e) =>
                                handleFieldCheckbox(
                                  index,
                                  "checkout",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 cursor-pointer accent-blue-600"
                              title="Include Check Out in update"
                            />

                          </label>

                          <input
                            type="time"
                            value={
                              session.checkout
                            }
                            onChange={(e) =>
                              handleSessionChange(
                                index,
                                "checkout",
                                e.target.value
                              )
                            }
                            className={`w-full bg-gray-50 border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                              checkbox.checkout
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300"
                            }`}
                          />

                          <p className="text-[10px] text-gray-400 mt-1">
                            {checkbox.checkout
                              ? "Included"
                              : "Not included"}
                          </p>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            {/* =================================
                Reason
            ================================= */}

            <div>

              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">

                Reason{" "}

                <span className="text-red-500">
                  *
                </span>

              </label>

              <textarea
                rows="3"
                placeholder="Reason for adjustment..."
                value={
                  formData.reason
                }
                onChange={
                  handleReasonChange
                }
                className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />

            </div>

            {/* =================================
                API INFO
            ================================= */}

            {/* =================================
                Submit
            ================================= */}

            <div className="flex justify-end pt-2">

          <button
  type="submit"
  disabled={submitting || loading}
  className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white font-medium text-sm px-6 py-2.5 transition-colors"
>
  {submitting
    ? "Submitting..."
    : editMode
    ? "Update Attendance"
    : "Submit"}
</button>

            </div>

          </form>

        </div>

        {/* ===================================
            RIGHT - HISTORY
        =================================== */}

        <div className="border border-gray-300 p-5 flex flex-col">

          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Adjustments
          </h2>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">

            {fetchingLogs ? (

              <p className="text-sm text-gray-500 text-center py-4">
                Loading...
              </p>

            ) : recentAdjustments.length ===
              0 ? (

              <p className="text-sm text-gray-500 text-center py-4">
                No adjustments yet
              </p>

            ) : (

              recentAdjustments.map(
                (item) => (

                  <div
                    key={item._id}
                    className="p-3.5 border border-gray-200 bg-gray-50 text-xs text-gray-600"
                  >

                    {/* Name + Status */}

                    <div className="flex justify-between items-start">

                      <span className="font-semibold text-gray-800 text-sm">

                        {item.employeeName ||
                          getEmployeeName(
                            item.employeeId
                          ) ||
                          "Unknown Employee"}

                      </span>

                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 border ${getStatusStyle(
                          item.status
                        )}`}
                      >

                        {item.status
                          ?.toUpperCase() ||
                          "PRESENT"}

                      </span>

                    </div>

                    {/* Date */}

                    <p className="text-gray-500 mt-1">

                      Date:{" "}

                      <span className="text-gray-700">

                        {formatDateDisplay(
                          item.date
                        )}

                      </span>

                    </p>

                    {/* Times */}

                    <div className="mt-2 pt-2 border-t border-dashed border-gray-200 flex flex-wrap gap-2">

                      {item.checkInTime && (
                        <span className="bg-green-50 px-1.5 py-0.5 border border-green-200">

                          In:{" "}

                          {formatTimeDisplay(
                            item.checkInTime
                          )}

                        </span>
                      )}

                      {item.checkOutTime && (
                        <span className="bg-red-50 px-1.5 py-0.5 border border-red-200">

                          Out:{" "}

                          {formatTimeDisplay(
                            item.checkOutTime
                          )}

                        </span>
                      )}

                      {item.totalWorkTime >
                        0 && (
                        <span className="bg-blue-50 px-1.5 py-0.5 border border-blue-200">

                          Work:{" "}

                          {
                            item.totalWorkTime
                          }

                          h

                        </span>
                      )}

                    </div>

                    {/* Reason */}

                    {item.reason && (
                      <p className="mt-2 text-gray-500">

                        Reason:{" "}

                        <span className="text-gray-700">

                          {item.reason}

                        </span>

                      </p>
                    )}

                    {/* Edit */}

                    <button
                      type="button"
                      onClick={() =>
                        handleEditAdjustment(
                          item
                        )
                      }
                      className="mt-3 w-full bg-gray-800 hover:bg-gray-700 text-white py-2 text-xs font-medium transition-colors"
                    >
                      Edit Attendance
                    </button>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </div>

    </div>
  );
}