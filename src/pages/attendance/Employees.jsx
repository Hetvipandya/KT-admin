
import { useState, useEffect } from "react";
import { 
  Users, Plus, User, Mail, Phone, Briefcase, Building, 
  CheckCircle, XCircle, UserCheck, UserX, Search, Filter,
  ChevronDown, Edit, Trash2, Crown, UserMinus, X
} from "lucide-react";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    designation: "",
    department: "",
    dob: "",        // Changed from dateOfBirth to dob
    address: "",
    bloodGroup: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(
        "https://kt-backend-1.onrender.com/api/employee/list"
      );

      const data = await res.json();

      if (data.success) {
        setEmployees(data.employees);
      } 
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTL = async (employeeId, isTeamLead) => {
    try {
      const url = isTeamLead
        ? `https://kt-backend-1.onrender.com/api/employee/remove-tl/${employeeId}`
        : `https://kt-backend-1.onrender.com/api/employee/assign-tl/${employeeId}`;

      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(url, {
        method: "PUT",
        headers,
      });

      const data = await res.json();

      alert(data.message);

      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === employeeId
            ? {
                ...emp,
                isTeamLead: !isTeamLead,
              }
            : emp
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update TL");
    }
  };

  const getAttendanceStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Inactive":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getRoleBadge = (isTeamLead) => {
    if (isTeamLead) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-gray-50 text-gray-600 border-gray-200";
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "https://kt-backend-1.onrender.com/api/employee/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Employee Added Successfully");
        setShowModal(false);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          mobile: "",
          designation: "",
          department: "",
          dob: "",
          address: "",
          bloodGroup: "",
        });
        fetchEmployees();
      } else {
        alert(data.message || "Failed to add employee");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add employee");
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || emp.employeeStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 px-3 sm:px-4 py-4 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Employees
              </h1>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500">
                View and manage all employees
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white shadow-sm border border-gray-200 flex items-center gap-1.5 sm:gap-2">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-600">Total: </span>
                <span className="font-semibold text-gray-900 text-xs sm:text-sm">{employees.length}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-green-50 border border-green-200">
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 sm:h-2 sm:w-2 bg-green-500" />
                </span>
                <span className="text-[10px] sm:text-xs font-medium text-green-700">Live</span>
              </div>
              <button
                onClick={() => {
                  setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    mobile: "",
                    designation: "",
                    department: "",
                    dob: "",
                    address: "",
                    bloodGroup: "",
                  });
                  setShowModal(true);
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 sm:gap-2 shadow-sm text-xs sm:text-sm font-medium"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Add Employee
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
          {/* Search and Filter Bar */}
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or designation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
                >
                  <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Filters</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-gray-100">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 p-3 sm:p-4 lg:p-6">
              {[1, 2, 3, 4].map((skeleton) => (
                <div key={skeleton} className="animate-pulse border border-gray-200 p-3 sm:p-4 lg:p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-5 sm:h-6 w-1/3 bg-gray-200" />
                      <div className="h-3 sm:h-4 w-1/2 bg-gray-200" />
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                      <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-200" />
                      <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-200" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-200" />
                    <div className="h-3 sm:h-4 w-20 sm:w-28 bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="bg-blue-50 p-3 sm:p-4 border border-blue-200">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {searchTerm || filterStatus !== "all" ? "No Results Found" : "No Employees Found"}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 px-4">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter terms"
                  : "Add your first employee to get started."}
              </p>
            </div>
          ) : (
            <div className="p-3 sm:p-4 lg:p-6">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">Employee</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Designation</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Role</th>
                        <th className="px-4 py-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredEmployees.map((emp, index) => (
                        <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-500">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white shadow-sm flex-shrink-0">
                                {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                              </div>
                              <span className="font-medium text-gray-900">
                                {emp.firstName} {emp.lastName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <a
                              href={`mailto:${emp.email}`}
                              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[150px]"
                            >
                              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{emp.email}</span>
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5 text-gray-700">
                              <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                              {emp.designation || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium border ${getAttendanceStyle(emp.employeeStatus)}`}>
                              {emp.employeeStatus || "Unknown"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium border ${getRoleBadge(emp.isTeamLead)}`}>
                              {emp.isTeamLead ? (
                                <>
                                  <Crown className="h-3 w-3 mr-1 text-amber-600" />
                                  Team Lead
                                </>
                              ) : (
                                "Member"
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleTL(emp._id, emp.isTeamLead)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                                emp.isTeamLead
                                  ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                              }`}
                            >
                              {emp.isTeamLead ? (
                                <>
                                  <UserMinus className="h-3 w-3" />
                                  Remove TL
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-3 w-3" />
                                  Assign TL
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tablet View */}
              <div className="hidden sm:block lg:hidden">
                <div className="space-y-3">
                  {filteredEmployees.map((emp, index) => (
                    <div key={emp._id} className="border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white shadow-sm flex-shrink-0">
                            {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {emp.firstName} {emp.lastName}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">{emp.designation || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium border ${getAttendanceStyle(emp.employeeStatus)}`}>
                            {emp.employeeStatus || "Unknown"}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium border ${getRoleBadge(emp.isTeamLead)}`}>
                            {emp.isTeamLead ? "TL" : "Member"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600 min-w-0">
                          <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <a href={`mailto:${emp.email}`} className="truncate text-blue-600 hover:underline">
                            {emp.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 min-w-0">
                          <Building className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{emp.department?.departmentName || emp.departmentName || "N/A"}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => toggleTL(emp._id, emp.isTeamLead)}
                          className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                            emp.isTeamLead
                              ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          }`}
                        >
                          {emp.isTeamLead ? (
                            <>
                              <UserMinus className="h-3.5 w-3.5" />
                              Remove as Team Lead
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5" />
                              Assign as Team Lead
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {filteredEmployees.map((emp, index) => (
                  <div key={emp._id} className="border border-gray-200 p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white shadow-sm flex-shrink-0">
                          {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {emp.firstName} {emp.lastName}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">{emp.designation || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 ml-1 flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium border ${getAttendanceStyle(emp.employeeStatus)}`}>
                          {emp.employeeStatus || "Unknown"}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium border ${getRoleBadge(emp.isTeamLead)}`}>
                          {emp.isTeamLead ? "TL" : "Member"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <a
                          href={`mailto:${emp.email}`}
                          className="flex items-center gap-1 text-blue-600 hover:underline truncate max-w-[55%]"
                        >
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{emp.email}</span>
                        </a>
                        <span className="flex items-center gap-1 text-gray-500 text-[10px]">
                          <Building className="h-3 w-3 text-gray-400" />
                          <span className="truncate max-w-[60px]">
                            {emp.department?.departmentName || emp.departmentName || "N/A"}
                          </span>
                        </span>
                      </div>
                      <button
                        onClick={() => toggleTL(emp._id, emp.isTeamLead)}
                        className={`mt-2 w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 text-[10px] font-medium transition-colors ${
                          emp.isTeamLead
                            ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        }`}
                      >
                        {emp.isTeamLead ? (
                          <>
                            <UserMinus className="h-3 w-3" />
                            Remove TL
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3 w-3" />
                            Assign TL
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Add Employee */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div 
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Add Employee</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Add a new employee to the system</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddEmployee} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    First Name *
                  </label>
                  <input
                    name="firstName"
                    placeholder="e.g. John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Last Name *
                  </label>
                  <input
                    name="lastName"
                    placeholder="e.g. Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="e.g. john.doe@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mobile Number *
                </label>
                <input
                  name="mobile"
                  placeholder="e.g. 9876543210"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Designation *
                </label>
                <input
                  name="designation"
                  placeholder="e.g. Software Engineer"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  placeholder="e.g. IT, HR, Sales"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date of Birth *
                </label>
                <input
                  type="text"
                  name="dob"  // Changed from dateOfBirth to dob
                  placeholder="e.g. 1990-01-01"
                  value={formData.dob}  // Changed from dateOfBirth to dob
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="e.g. 123 Main St, City, State"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Blood Group *
                </label>
                <input
                  type="text"
                  name="bloodGroup"
                  placeholder="e.g. A+, O-, etc."
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition rounded-lg"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}