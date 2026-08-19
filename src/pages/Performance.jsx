import React, { useEffect, useRef, useState } from "react";

const Performance = () => {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const [employees, setEmployees] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [editingId, setEditingId] = useState(null);
  const [editRemarks, setEditRemarks] = useState("");
  const [isEmployeeMenuOpen, setIsEmployeeMenuOpen] = useState(false);
  const employeeMenuRef = useRef(null);

  const [form, setForm] = useState({
    employeeID: "",
    remarks: "",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (employeeMenuRef.current && !employeeMenuRef.current.contains(event.target)) {
        setIsEmployeeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchAllPerformances();
  }, []);

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
  };

  const getEmployeeDisplayName = (perf) => {
    if (!perf) return "Unknown Employee";
    
    if (perf.employeeID) {
      if (typeof perf.employeeID === "object") {
        const emp = perf.employeeID;
        if (emp.name) return emp.name;
        if (emp.firstName && emp.lastName) return `${emp.firstName} ${emp.lastName}`;
        if (emp.firstName) return emp.firstName;
        if (emp.fullName) return emp.fullName;
        if (emp.displayName) return emp.displayName;
      }
    }
    
    const candidates = [
      perf.employeeName,
      perf.employee?.name,
      perf.employee?.fullName,
      perf.employee?.displayName,
      perf.name,
      perf.fullName,
      perf.displayName,
    ];

    for (const value of candidates) {
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }

    return "Unknown Employee";
  };

  const getEmployeeTypeLabel = (perf) => {
    const rawType =
      perf?.employeeType ||
      perf?.employee?.type ||
      perf?.employeeID?.type ||
      perf?.type ||
      "";

    const normalized = String(rawType).trim().toLowerCase();

    switch (normalized) {
      case "intern":
        return "Intern";
      case "employee":
        return "Employee";
      case "teamlead":
      case "team lead":
      case "team_lead":
        return "Team Lead";
      default:
        return rawType ? String(rawType) : "N/A";
    }
  };

  const fetchAllPerformances = async () => {
    try {
      const response = await fetch(
        "https://kt-backend-1.onrender.com/api/performance/all",
        { headers }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch performances");
      }

      const data = await response.json();

      if (data.success) {
        setPerformances(data.data);
      }
    } catch (err) {
      console.error("Error fetching performances:", err);
      showNotification("Failed to load performance history", "warning");
    }
  }; 

const fetchEmployees = async () => {
  setLoading(true);

  try {
    const token = localStorage.getItem("token");

    const commonHeaders = {
      Authorization: `Bearer ${token}`,
    };

    // Same APIs used in Dashboard
    const [employeeResponse, usersResponse, teamLeadResponse] =
      await Promise.all([
        fetch(
          "https://kt-backend-1.onrender.com/api/employee/list",
          { headers: commonHeaders }
        ),

        fetch(
          "https://kt-backend-1.onrender.com/api/users/all",
          { headers: commonHeaders }
        ),

        fetch(
          "https://kt-backend-1.onrender.com/api/teamLead/team",
          { headers: commonHeaders }
        ),
      ]);

    const employeeData = await employeeResponse.json();
    const usersData = await usersResponse.json();
    const teamLeadData = await teamLeadResponse.json();

    console.log("Employee API:", employeeData);
    console.log("Users API:", usersData);
    console.log("Team Lead API:", teamLeadData);

    // --------------------------------------------------
    // 1. EMPLOYEES
    // Same API as Dashboard
    // --------------------------------------------------

    let employeeList = [];

    if (Array.isArray(employeeData)) {
      employeeList = employeeData;
    } else if (Array.isArray(employeeData.users)) {
      employeeList = employeeData.users;
    } else if (Array.isArray(employeeData.data)) {
      employeeList = employeeData.data;
    } else if (Array.isArray(employeeData.employees)) {
      employeeList = employeeData.employees;
    }

    const employees = employeeList
      .map((employee) => ({
        _id: employee._id || employee.id || employee.userId,

        name:
          employee.name ||
          employee.fullName ||
          employee.displayName ||
          `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
          "Unknown Employee",

        email:
          employee.email ||
          employee.employeeEmail ||
          employee.user?.email ||
          "",

        type: "employee",

        role:
          employee.role ||
          employee.user?.role ||
          "employee",
      }))
      .filter((employee) => employee._id);

    // --------------------------------------------------
    // 2. INTERNS
    // Same users/all API as Dashboard
    // --------------------------------------------------

    const users = Array.isArray(usersData)
      ? usersData
      : usersData.users ||
        usersData.data ||
        [];

    const interns = users
      .filter(
        (user) =>
          String(user.role || "").toLowerCase() === "intern"
      )
      .map((intern) => ({
        _id: intern._id || intern.id || intern.userId,

        name:
          intern.name ||
          intern.fullName ||
          intern.displayName ||
          `${intern.firstName || ""} ${intern.lastName || ""}`.trim() ||
          "Unknown Intern",

        email:
          intern.email ||
          intern.user?.email ||
          "",

        type: "intern",

        role: "intern",
      }))
      .filter((intern) => intern._id);

    // --------------------------------------------------
    // 3. TEAM LEADS
    // Same teamLead/team API as Dashboard
    // --------------------------------------------------

    const teamLeadList =
      teamLeadData.teamLeads ||
      teamLeadData.data ||
      teamLeadData.teamlead ||
      teamLeadData.teams ||
      [];

    const teamLeads = Array.isArray(teamLeadList)
      ? teamLeadList
          .map((teamLead) => {
            // Different possible structures
            const user =
              teamLead.user ||
              teamLead.employee ||
              teamLead.teamLead ||
              teamLead;

            return {
              _id:
                user?._id ||
                user?.id ||
                teamLead._id ||
                teamLead.id ||
                teamLead.userId,

              name:
                user?.name ||
                user?.fullName ||
                user?.displayName ||
                `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                teamLead.name ||
                teamLead.fullName ||
                "Unknown Team Lead",

              email:
                user?.email ||
                teamLead.email ||
                "",

              type: "teamlead",

              role: "teamlead",
            };
          })
          .filter((teamLead) => teamLead._id)
      : [];

    // --------------------------------------------------
    // MERGE ALL
    // --------------------------------------------------

    const combinedEmployees = [
      ...interns,
      ...employees,
      ...teamLeads,
    ];

    // Remove duplicate IDs
    const uniqueEmployees = Array.from(
      new Map(
        combinedEmployees.map((employee) => [
          employee._id,
          employee,
        ])
      ).values()
    );

    console.log("Performance Employees:", uniqueEmployees);
    console.log("Interns:", interns);
    console.log("Employees:", employees);
    console.log("Team Leads:", teamLeads);

    setEmployees(uniqueEmployees);
  } catch (err) {
    console.error(
      "Error fetching employees, interns and team leads:",
      err
    );

    showNotification(
      "Failed to load employees, interns and team leads",
      "error"
    );
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleEmployeeSelect = (employeeId) => {
    setForm({
      ...form,
      employeeID: employeeId,
    });
    setIsEmployeeMenuOpen(false);
  };

  const validateForm = () => {
    if (!form.employeeID) {
      showNotification("Please select an employee", "error");
      return false;
    }
    return true;
  };

  const submitPerformance = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    const payload = {
      employeeID: form.employeeID,
      remarks: form.remarks || "",
    };

    try {
      const response = await fetch(
        "https://kt-backend-1.onrender.com/api/performance/create",
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit performance");
      }

      const data = await response.json();
      showNotification("Performance submitted successfully!", "success");
      fetchAllPerformances();

      setForm({
        employeeID: "",
        remarks: "",
      });
    } catch (err) {
      console.error("Error submitting performance:", err);
      showNotification(err.message || "Failed to submit performance. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      employeeID: "",
      remarks: "",
    });
    setEditingId(null);
    setEditRemarks("");
    showNotification("Form has been reset", "info");
  };

  const handleEditPerformance = (perf) => {
    setEditingId(perf._id);
    setEditRemarks(perf.remarks || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdatePerformance = async () => {
    if (!editRemarks.trim()) {
      showNotification("Please enter some remarks", "error");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `https://kt-backend-1.onrender.com/api/performance/update/${editingId}`,
        {
          method: "PUT",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ remarks: editRemarks }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update performance");
      }

      const data = await response.json();
      showNotification("Performance updated successfully!", "success");
      fetchAllPerformances();
      
      setEditingId(null);
      setEditRemarks("");
    } catch (err) {
      console.error("Error updating performance:", err);
      showNotification(err.message || "Failed to update performance. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePerformance = async (perf) => {
    const employeeName = getEmployeeDisplayName(perf);
    if (!window.confirm(`Are you sure you want to delete performance record for ${employeeName}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `https://kt-backend-1.onrender.com/api/performance/delete/${perf._id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete performance");
      }

      showNotification(`Performance record for ${employeeName} deleted successfully!`, "success");
      fetchAllPerformances();
    } catch (err) {
      console.error("Error deleting performance:", err);
      showNotification("Failed to delete performance. Please try again.", "error");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRemarks("");
  };

  const Notification = () => {
    if (!notification.message) return null;

    const bgColor = {
      success: "bg-green-100 border-green-400 text-green-700",
      error: "bg-red-100 border-red-400 text-red-700",
      warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
      info: "bg-blue-100 border-blue-400 text-blue-700",
    };

    return (
      <div
        className={`fixed top-4 right-4 z-50 px-4 sm:px-6 py-3 sm:py-4 rounded-lg border shadow-lg max-w-[90%] sm:max-w-md ${
          bgColor[notification.type] || bgColor.info
        }`}
      >
        <div className="flex items-center text-sm sm:text-base">
          <span className="mr-2 sm:mr-3">
            {notification.type === "success" && "✅"}
            {notification.type === "error" && "❌"}
            {notification.type === "warning" && "⚠️"}
            {notification.type === "info" && "ℹ️"}
          </span>
          <span className="break-words">{notification.message}</span>
        </div>
      </div>
    );
  };

  const PerformanceList = () => {
    if (performances.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
          No performance records found
        </div>
      );
    }

    return (
      <div className="mt-8 sm:mt-12 border-t pt-6 sm:pt-8">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          📋 Performance History
        </h3>
        
        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {performances.map((perf) => (
            <div key={perf._id} className="rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">
                    {getEmployeeDisplayName(perf)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {perf.employeeID?.email || perf.employeeEmail || "No email"}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                    getEmployeeTypeLabel(perf) === "Intern"
                      ? "bg-purple-100 text-purple-800"
                      : getEmployeeTypeLabel(perf) === "Employee"
                      ? "bg-blue-100 text-blue-800"
                      : getEmployeeTypeLabel(perf) === "Team Lead"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {getEmployeeTypeLabel(perf)}
                </span>
              </div>
              
              <div className="mb-2">
                <div className="text-xs text-gray-500">Remarks:</div>
                <div className="text-sm text-gray-700 break-words">
                  {perf.remarks || "-"}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  {new Date(perf.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditPerformance(perf)}
                    className="px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition duration-150"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePerformance(perf)}
                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition duration-150"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remarks
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performances.map((perf) => (
                <tr key={perf._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {getEmployeeDisplayName(perf)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {perf.employeeID?.email || perf.employeeEmail || "No email"}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        getEmployeeTypeLabel(perf) === "Intern"
                          ? "bg-purple-100 text-purple-800"
                          : getEmployeeTypeLabel(perf) === "Employee"
                          ? "bg-blue-100 text-blue-800"
                          : getEmployeeTypeLabel(perf) === "Team Lead"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {getEmployeeTypeLabel(perf)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {perf.remarks || "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(perf.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditPerformance(perf)}
                        className="px-3 py-1 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition duration-150"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePerformance(perf)}
                        className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition duration-150"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-4 lg:px-8">
      <Notification />

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-slate-200 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <span>📊 Employee Performance</span>
              <span className="text-xs sm:text-sm font-normal text-black bg-black/10 px-3 sm:px-4 py-1 sm:py-2 rounded-full whitespace-nowrap">
                Performance Review
              </span>
            </h2>
            <p className="text-black mt-1 text-sm sm:text-base">
              {editingId ? "Edit performance remarks" : "Select an employee and add performance remarks"}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16 sm:py-20">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="p-4 sm:p-6 md:p-8">
              {/* Show Edit Mode */}
              {editingId ? (
                <div className="mb-6">
                  <div className="border border-blue-200 rounded-xl p-3 sm:p-4 mb-4">
                    <p className="text-blue-800 font-medium text-sm sm:text-base">✏️ Editing Performance</p>
                    <p className="text-blue-600 text-xs sm:text-sm">
                      Updating remarks for: {
                        performances.find(p => p._id === editingId) 
                          ? getEmployeeDisplayName(performances.find(p => p._id === editingId))
                          : "Unknown"
                      }
                    </p>
                  </div>
                  
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Edit Remarks
                  </label>
                  <textarea
                    rows={5}
                    value={editRemarks}
                    onChange={(e) => setEditRemarks(e.target.value)}
                    placeholder="Edit remarks..."
                    className="w-full border-2 border-gray-200 rounded-xl p-3 sm:p-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200 resize-none text-sm sm:text-base"
                  />

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
                    <button
                      onClick={handleUpdatePerformance}
                      disabled={submitting}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-xl transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 text-sm sm:text-base"
                    >
                      {submitting ? "Updating..." : "✅ Update Performance"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={submitting}
                      className="px-4 sm:px-6 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-2.5 sm:py-3 rounded-xl transition duration-200 text-sm sm:text-base"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Employee Selection Dropdown */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Employee *
                    </label>
                    <div ref={employeeMenuRef} className="relative w-full min-w-0">
                      <button
                        type="button"
                        onClick={() => setIsEmployeeMenuOpen((prev) => !prev)}
                        className="w-full min-w-0 max-w-full border-2 border-gray-200 rounded-xl p-3 pr-10 text-left focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200 bg-white text-sm sm:text-base flex items-center justify-between"
                      >
                        <span className={form.employeeID ? "text-gray-900" : "text-gray-500"}>
                          {employees.find((emp) => emp._id === form.employeeID)?.name || "-- Select an Employee --"}
                        </span>
                        <svg
                          className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                            isEmployeeMenuOpen ? "rotate-180" : "rotate-0"
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {isEmployeeMenuOpen && (
                        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                          {[
                            { key: "intern", label: "👨‍🎓 Interns" },
                            { key: "employee", label: "👔 Employees" },
                            { key: "teamlead", label: "👨‍💼 Team Leads" },
                          ].map((role) => {
                            const filteredEmployees = employees.filter((emp) => emp.type === role.key);
                            if (filteredEmployees.length === 0) return null;

                            return (
                              <div key={role.key}>
                                <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                  {role.label}
                                </div>
                                {filteredEmployees.map((emp) => (
                                  <button
                                    key={emp._id}
                                    type="button"
                                    onClick={() => handleEmployeeSelect(emp._id)}
                                    className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                                      form.employeeID === emp._id
                                        ? "bg-indigo-50 text-indigo-700 font-medium"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                  >
                                    {emp.name || "Unknown Employee"}
                                  </button>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {employees.length === 0 && !loading && (
                      <p className="text-yellow-600 text-xs sm:text-sm mt-2">
                        ⚠️ No employees available for evaluation
                      </p>
                    )}
                    {employees.length > 0 && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-2">
                        Total: {employees.length} (
                        {employees.filter((e) => e.type === "intern").length} interns,{" "}
                        {employees.filter((e) => e.type === "employee").length} employees,{" "}
                        {employees.filter((e) => e.type === "teamlead").length} team leads)
                      </p>
                    )}
                  </div>

                  {/* Remarks Textarea */}
                  {form.employeeID && (
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        📝 Remarks
                      </label>
                      <textarea
                        rows={5}
                        name="remarks"
                        value={form.remarks}
                        onChange={handleChange}
                        placeholder="Add your remarks about the employee's performance..."
                        className="w-full border-2 border-gray-200 rounded-xl p-3 sm:p-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200 resize-none text-sm sm:text-base"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8">
                    <button
                      onClick={submitPerformance}
                      disabled={submitting || loading || !form.employeeID}
                      className="flex-1 bg-slate-300 hover:bg-slate-400 border border-slate-400 text-black font-semibold py-2.5 sm:py-3 px-4 rounded-xl transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-black"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        "💾 Save Performance"
                      )}
                    </button>

                    <button
                      onClick={resetForm}
                      disabled={submitting}
                      className="px-4 sm:px-6 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-2.5 sm:py-3 rounded-xl transition duration-200 disabled:opacity-50 text-sm sm:text-base"
                    >
                      🔄 Reset
                    </button>
                  </div>
                </>
              )}

              {/* Performance List */}
              <PerformanceList />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500">
          <p>Select an employee and add remarks to submit performance evaluation</p>
        </div>
      </div>
    </div>
  ); 
};

export default Performance; 