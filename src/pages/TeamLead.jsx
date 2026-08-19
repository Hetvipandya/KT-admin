import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://kt-backend-1.onrender.com/api";

// Modal Component for Assignments
const AssignmentModal = ({ isOpen, onClose, lead, interns, employees, onSave }) => {
  const [selectedInterns, setSelectedInterns] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('interns');

  useEffect(() => {
    if (lead && isOpen) {
      setSelectedInterns(lead.assignedInterns || []); 
      setSelectedEmployees(lead.assignedEmployees || []);
    }
  }, [lead, isOpen]);

  const handleInternToggle = (internId) => {
    setSelectedInterns(prev => 
      prev.includes(internId) 
        ? prev.filter(id => id !== internId)
        : [...prev, internId]
    );
  };

  const handleEmployeeToggle = (employeeId) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSave = async () => {
    if (activeTab === 'interns' && selectedInterns.length === 0) {
      alert("Please select at least one intern.");
      return;
    }
    if (activeTab === 'employees' && selectedEmployees.length === 0) {
      alert("Please select at least one employee.");
      return;
    }

    setSaving(true);
    await onSave({
      internIds: selectedInterns,
      employeeIds: selectedEmployees,
      leadId: lead._id
    });
    setSaving(false);
    onClose();
  };

  const selectAll = (type) => {
    if (type === 'interns') {
      setSelectedInterns(interns.map(intern => intern._id));
    } else {
      setSelectedEmployees(employees.map(emp => emp._id));
    }
  };

  const deselectAll = (type) => {
    if (type === 'interns') {
      setSelectedInterns([]);
    } else {
      setSelectedEmployees([]);
    }
  };

  if (!isOpen) return null;

  const getDisplayName = (person, type) => {
    if (!person) return "Unnamed";
    return person.name || person.fullName || person.firstName || person.email || "Unnamed";
  };

  // Get department name from lead
  const getDepartmentName = (lead) => {
    if (!lead) return "Unknown Department";
    
    // Check from teamLead.department
    if (lead.teamLead?.department?.name) return lead.teamLead.department.name;
    if (lead.teamLead?.department?.departmentName) return lead.teamLead.department.departmentName;
    
    // Check from lead.department
    if (lead.department?.name) return lead.department.name;
    if (lead.department?.departmentName) return lead.department.departmentName;
    
    // Check if department is a string
    if (typeof lead.department === "string") return lead.department;
    if (typeof lead.teamLead?.department === "string") return lead.teamLead.department;
    
    return "Unknown Department";
  };

  const departmentName = getDepartmentName(lead);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Assign Team Members</h2>
                  <p className="text-blue-100 text-sm">
                    Team Lead: {lead?.name || lead?.firstName || "Unnamed"}
                    {departmentName && departmentName !== "Unknown Department" && (
                      <span className="ml-2">• Dept: {departmentName}</span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setActiveTab('interns')}
                className={`flex-1 py-2 px-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === 'interns'
                    ? 'border-green-500 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Interns
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                    {selectedInterns.length}
                  </span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab('employees')}
                className={`flex-1 py-2 px-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === 'employees'
                    ? 'border-purple-500 text-purple-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Employees
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                    {selectedEmployees.length}
                  </span>
                </span>
              </button>
            </div>

            {/* Content */}
            {activeTab === 'interns' ? (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">
                    {interns.length} interns available
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => selectAll('interns')}
                      className="text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1 hover:bg-green-50 rounded transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => deselectAll('interns')}
                      className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1">
                  {interns.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No interns available
                    </p>
                  ) : (
                    interns.map((intern) => (
                      <label
                        key={intern._id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={selectedInterns.includes(intern._id)}
                          onChange={() => handleInternToggle(intern._id)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {getDisplayName(intern, 'intern')}
                          </p>
                          {intern.email && (
                            <p className="text-xs text-gray-500 truncate">
                              {intern.email}
                            </p>
                          )}
                        </div>
                        {intern.uniqueID && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                            {intern.uniqueID}
                          </span>
                        )}
                      </label>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">
                    {employees.length} employees available
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => selectAll('employees')}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium px-2 py-1 hover:bg-purple-50 rounded transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => deselectAll('employees')}
                      className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1">
                  {employees.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No employees available
                    </p>
                  ) : (
                    employees.map((employee) => (
                      <label
                        key={employee._id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee._id)}
                          onChange={() => handleEmployeeToggle(employee._id)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {getDisplayName(employee, 'employee')}
                          </p>
                          {employee.email && (
                            <p className="text-xs text-gray-500 truncate">
                              {employee.email}
                            </p>
                          )}
                        </div>
                        {employee.employeeID && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                            {employee.employeeID}
                          </span>
                        )}
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-all shadow-md ${
                activeTab === 'interns'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-purple-600 hover:bg-purple-700'
              } ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                `Save Assignments`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main TeamLead Component
export const TeamLead = () => {
  const [teamLeads, setTeamLeads] = useState([]);
  const [interns, setInterns] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [assignedInterns, setAssignedInterns] = useState({});
  const [assignedEmployees, setAssignedEmployees] = useState({});

  // Helper Functions
  const getUserRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user?.role?.toLowerCase().trim() || '';
    } catch {
      return '';
    }
  };

  const getLeadId = (lead) => {
    if (!lead) return null;
    return (
      lead.teamLead?.userId ||
      lead.teamLead?.employeeId ||
      lead.userId ||
      lead.employeeId ||
      lead.user?._id ||
      lead._id
    );
  };

  const normalizeInternId = (item) => {
    if (!item) return null;
    if (typeof item === "string") return item;
    if (typeof item === "number") return String(item);
    if (typeof item === "object") {
      if (item._id) return String(item._id);
      if (item.id) return String(item.id);
      if (item.internId) return String(item.internId);
      if (item.userId) return String(item.userId);
      if (item.user) return normalizeInternId(item.user);
    }
    return null;
  };

  const normalizeEmployeeId = (item) => {
    if (!item) return null;
    if (typeof item === "string") return item;
    if (typeof item === "number") return String(item);
    if (typeof item === "object") {
      if (item._id) return String(item._id);
      if (item.id) return String(item.id);
      if (item.employeeId) return String(item.employeeId);
      if (item.userId) return String(item.userId);
      if (item.user) return normalizeEmployeeId(item.user);
    }
    return null;
  };

  const getEmployeeDisplayName = (employee) => {
    if (!employee) return "Unnamed";
    if (employee.firstName) {
      const lastName = employee.lastName || "";
      return `${employee.firstName} ${lastName}`.trim();
    }
    if (employee.name) return employee.name;
    if (employee.fullName) return employee.fullName;
    if (employee.displayName) return employee.displayName;
    if (employee.email) return employee.email;
    return "Unnamed";
  };

  const getInternDisplayName = (intern) => {
    if (!intern) return "Unnamed";
    if (intern.name) return intern.name;
    if (intern.fullName) return intern.fullName;
    if (intern.displayName) return intern.displayName;
    if (intern.firstName) {
      const lastName = intern.lastName || "";
      return `${intern.firstName} ${lastName}`.trim();
    }
    if (intern.email) return intern.email;
    return "Unnamed";
  };

  // Get department name from lead data
const getDepartment = (lead) => {
  if (!lead) return "-";
  
  // Check from teamLead.department (populated from backend)
  if (lead.teamLead?.department) {
    if (typeof lead.teamLead.department === 'object') {
      return lead.teamLead.department.name || 
             lead.teamLead.department.departmentName || 
             "-";
    }
    if (typeof lead.teamLead.department === 'string') {
      if (!lead.teamLead.department.match(/^[0-9a-fA-F]{24}$/)) {
        return lead.teamLead.department;
      }
    }
  }
  
  // Check from lead.department
  if (lead.department) {
    if (typeof lead.department === 'object') {
      return lead.department.name || 
             lead.department.departmentName || 
             "-";
    }
    if (typeof lead.department === 'string') {
      if (!lead.department.match(/^[0-9a-fA-F]{24}$/)) {
        return lead.department;
      }
    }
  }
  
  // Check departmentName
  if (lead.departmentName) {
    return lead.departmentName;
  }
  
  // Check if department is in teamLead.user
  if (lead.teamLead?.user?.department) {
    if (typeof lead.teamLead.user.department === 'object') {
      return lead.teamLead.user.department.name || 
             lead.teamLead.user.department.departmentName || 
             "-";
    }
    if (typeof lead.teamLead.user.department === 'string') {
      if (!lead.teamLead.user.department.match(/^[0-9a-fA-F]{24}$/)) {
        return lead.teamLead.user.department;
      }
    }
  }
  
  // Check if department is in user object
  if (lead.user?.department) {
    if (typeof lead.user.department === 'object') {
      return lead.user.department.name || 
             lead.user.department.departmentName || 
             "-";
    }
    if (typeof lead.user.department === 'string') {
      if (!lead.user.department.match(/^[0-9a-fA-F]{24}$/)) {
        return lead.user.department;
      }
    }
  }
  
  return "-";
};

const getDesignation = (lead) => {
  if (!lead) return "-";
  
  // Check all possible paths for designation
  // Check teamLead.designation (could be populated object or string)
  if (lead.teamLead?.designation) {
    if (typeof lead.teamLead.designation === 'object') {
      return lead.teamLead.designation.designationName || 
             lead.teamLead.designation.name || 
             lead.teamLead.designation.title || 
             "-";
    }
    if (typeof lead.teamLead.designation === 'string') {
      // If it looks like a MongoDB ID, it's not the name
      if (!lead.teamLead.designation.match(/^[0-9a-fA-F]{24}$/)) {
        return lead.teamLead.designation;
      }
    }
  }
  
  // Check teamLead.designationName
  if (lead.teamLead?.designationName) {
    return lead.teamLead.designationName;
  }
  
  // Check lead.designation (could be object or string)
  if (lead.designation) {
    if (typeof lead.designation === 'object') {
      return lead.designation.designationName || 
             lead.designation.name || 
             lead.designation.title || 
             "-";
    }
    if (typeof lead.designation === 'string') {
      if (!lead.designation.match(/^[0-9a-fA-F]{24}$/)) {
        return lead.designation;
      }
    }
  }
  
  // Check lead.designationName
  if (lead.designationName) {
    return lead.designationName;
  }
  
  // Check if designation is in teamLead.user
  if (lead.teamLead?.user?.designation) {
    if (typeof lead.teamLead.user.designation === 'object') {
      return lead.teamLead.user.designation.designationName || 
             lead.teamLead.user.designation.name || 
             "-";
    }
    if (typeof lead.teamLead.user.designation === 'string') {
      if (!lead.teamLead.user.designation.match(/^[0-9a-fA-F]{24}$/)) {
        return lead.teamLead.user.designation;
      }
    }
  }
  
  // Check if designation is in user object
  if (lead.user?.designation) {
    if (typeof lead.user.designation === 'object') {
      return lead.user.designation.designationName || 
             lead.user.designation.name || 
             "-";
    }
    if (typeof lead.user.designation === 'string') {
      if (!lead.user.designation.match(/^[0-9a-fA-F]{24}$/)) {
        return lead.user.designation;
      }
    }
  }
  
  return "-";
};

  const getUserName = (lead) => {
    if (!lead) return "No Name";
    
    // Check teamLead first (from backend structure)
    if (lead.teamLead?.name) return lead.teamLead.name;
    
    // Check other possible fields
    if (lead.name) return lead.name;
    if (lead.fullName) return lead.fullName;
    if (lead.displayName) return lead.displayName;
    if (lead.userName) return lead.userName;
    if (lead.username) return lead.username;
    
    if (lead.firstName || lead.lastName) {
      return `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
    }
    if (lead.user) return getUserName(lead.user);
    if (lead.email) return lead.email.split('@')[0];
    return "No Name";
  };

  const getUserEmail = (lead) => {
    if (lead.teamLead?.email) return lead.teamLead.email;
    return lead.email || lead.user?.email || "N/A";
  };

  const getAssignedInternIds = (lead) => {
    const candidateLists = [
      lead.interns,
      lead.assignedInterns,
      lead.teamInterns,
      lead.internIds,
      lead.team?.interns,
      lead.user?.interns,
      lead.teamLead?.interns,
    ];

    for (const value of candidateLists) {
      if (!value) continue;
      if (Array.isArray(value)) {
        const ids = value
          .map((item) => normalizeInternId(item))
          .filter(Boolean);
        if (ids.length > 0) {
          return [...new Set(ids)];
        }
      }
    }
    return [];
  };

  const getAssignedEmployeeIds = (lead) => {
    const candidateLists = [
      lead.employees,
      lead.assignedEmployees,
      lead.teamEmployees,
      lead.employeeIds,
      lead.team?.employees,
      lead.user?.employees,
      lead.teamLead?.employees,
    ];

    for (const value of candidateLists) {
      if (!value) continue;
      if (Array.isArray(value)) {
        const ids = value
          .map((item) => normalizeEmployeeId(item))
          .filter(Boolean);
        if (ids.length > 0) {
          return [...new Set(ids)];
        }
      }
    }
    return [];
  };

  const loadSavedAssignments = () => {
    try {
      return JSON.parse(localStorage.getItem('teamLeadAssignedInterns') || '{}') || {};
    } catch {
      return {};
    }
  };

  const loadSavedEmployeeAssignments = () => {
    try {
      return JSON.parse(localStorage.getItem('teamLeadAssignedEmployees') || '{}') || {};
    } catch {
      return {};
    }
  };

  const persistAssignments = (assignments) => {
    try {
      localStorage.setItem('teamLeadAssignedInterns', JSON.stringify(assignments));
    } catch {
      // ignore storage failures
    }
  };

  const persistEmployeeAssignments = (assignments) => {
    try {
      localStorage.setItem('teamLeadAssignedEmployees', JSON.stringify(assignments));
    } catch {
      // ignore storage failures
    }
  };

  // Fetch Functions
  const fetchTeamLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentication required. Please login.");
        setLoading(false);
        return;
      }
  
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const teamLeadResponse = await axios.get(
        `${BASE_URL}/teamLead/team`,
        { headers }
      );

      let teamLeadsData = [];
      if (teamLeadResponse?.data?.data) {
        teamLeadsData = teamLeadResponse.data.data;
      } else if (Array.isArray(teamLeadResponse?.data)) {
        teamLeadsData = teamLeadResponse.data;
      } else {
        teamLeadsData = teamLeadResponse?.data || [];
      }

      if (!Array.isArray(teamLeadsData)) {
        teamLeadsData = [];
      }

      // Filter out admin users from team leads
      const filteredTeamLeads = teamLeadsData.filter((lead) => {
        const role = 
          lead?.teamLead?.role?.toLowerCase().trim() ||
          lead?.role?.toLowerCase().trim() ||
          lead?.user?.role?.toLowerCase().trim() ||
          lead?.teamLead?.user?.role?.toLowerCase().trim() ||
          '';
        return role !== 'admin';
      });

      const processedTeamLeads = filteredTeamLeads.map((lead) => {
        const leadId = 
          lead?.teamLead?.userId || 
          lead?.teamLead?.employeeId || 
          lead?.teamLead?._id ||
          lead?.userId || 
          lead?.employeeId || 
          lead?.user?._id || 
          lead?._id;

        return {
          ...lead,
          _id: leadId || lead._id,
          teamLeadId: leadId || lead._id,
          role: lead?.teamLead?.role || lead?.role || 'team lead'
        };
      });

      // Remove duplicates
      const uniqueTeamLeads = processedTeamLeads.reduce((acc, current) => {
        const exists = acc.some(item => item._id === current._id);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);

      setTeamLeads(uniqueTeamLeads);
      
      await Promise.all([
        fetchInterns(headers),
        fetchEmployees(headers)
      ]);

      const savedInternAssignments = loadSavedAssignments();
      const savedEmployeeAssignments = loadSavedEmployeeAssignments();

      const internAssignments = {};
      const employeeAssignments = {};

      uniqueTeamLeads.forEach((lead) => {
        const leadId = lead._id;
        
        const apiInterns = getAssignedInternIds(lead);
        if (apiInterns.length > 0) {
          internAssignments[leadId] = apiInterns;
        } else if (savedInternAssignments[leadId]) {
          internAssignments[leadId] = savedInternAssignments[leadId];
        } else {
          internAssignments[leadId] = [];
        }

        const apiEmployees = getAssignedEmployeeIds(lead);
        if (apiEmployees.length > 0) {
          employeeAssignments[leadId] = apiEmployees;
        } else if (savedEmployeeAssignments[leadId]) {
          employeeAssignments[leadId] = savedEmployeeAssignments[leadId];
        } else {
          employeeAssignments[leadId] = [];
        }
      });

      setAssignedInterns(internAssignments);
      setAssignedEmployees(employeeAssignments);
      persistAssignments(internAssignments);
      persistEmployeeAssignments(employeeAssignments);

    } catch (error) {
      console.error("Error fetching team leads:", error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterns = async (headers) => {
    try {
      const usersResponse = await axios.get(`${BASE_URL}/users/all`, { headers });
      const allUsers = usersResponse?.data?.users || [];
      const internUsers = allUsers.filter((user) => {
        return user.role?.toLowerCase().trim() === "intern";
      });
      setInterns(internUsers);
    } catch (error) {
      console.log("Could not fetch interns:", error);
      setInterns([]);
    }
  };

  const fetchEmployees = async (headers) => {
    try {
      const employeesResponse = await axios.get(`${BASE_URL}/employee/list`, { headers });
      const allEmployees = employeesResponse?.data?.employees || [];
      setEmployees(Array.isArray(allEmployees) ? allEmployees : []);
    } catch (error) {
      console.log("Could not fetch employees:", error);
      setEmployees([]);
    }
  };

  const handleError = (error) => {
    if (error.response?.status === 401) {
      setError("Authentication failed. Please login again.");
    } else if (error.response?.status === 403) {
      setError("You don't have permission to view team leads.");
    } else if (error.response?.status === 404) {
      setError("Team leads data not found.");
    } else {
      setError("Failed to load team leads. Please try again.");
    }
  };

  // Modal Handlers
  const handleOpenModal = (lead) => {
    const leadWithAssignments = {
      ...lead,
      assignedInterns: assignedInterns[lead._id] || [],
      assignedEmployees: assignedEmployees[lead._id] || []
    };
    setSelectedLead(leadWithAssignments);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedLead(null);
  };

  const handleSaveAssignments = async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }
  
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
  
      const employeeIds = [];
      for (const rawId of data.employeeIds) {
        const employee = employees.find(emp => 
          String(emp._id) === String(rawId) || 
          (emp.userID && String(emp.userID) === String(rawId))
        );
        
        if (employee) {
          employeeIds.push(String(employee._id));
        } else {
          employeeIds.push(String(rawId));
        }
      }
  
      const internIds = data.internIds.map(id => String(id));
  
      const payload = {
        teamLead: data.leadId,
        employees: employeeIds,
        interns: internIds
      };
  
      console.log('Sending payload:', payload);
  
      const response = await axios.post(
        `${BASE_URL}/teamLead/create-team`,
        payload,
        { headers }
      );
  
      if (response.status === 200 || response.status === 201) {
        setAssignedInterns(prev => ({
          ...prev,
          [data.leadId]: data.internIds
        }));
        setAssignedEmployees(prev => ({
          ...prev,
          [data.leadId]: data.employeeIds
        }));
        
        persistAssignments({
          ...assignedInterns,
          [data.leadId]: data.internIds
        });
        persistEmployeeAssignments({
          ...assignedEmployees,
          [data.leadId]: data.employeeIds
        });
  
        await fetchTeamLeads();
        alert("Assignments saved successfully!");
      } else {
        throw new Error("Failed to save assignments");
      }
    } catch (error) {
      console.error('Error saving assignments:', error);
      alert(error?.response?.data?.message || 'Failed to save assignments. Please try again.');
    }
  };

  useEffect(() => {
    fetchTeamLeads();
  }, []);

  const userRole = getUserRole();
  const isAdmin = userRole === 'admin';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-lg font-medium text-gray-700">Loading Team Leads...</p>
        <p className="text-sm text-gray-500">Please wait while we fetch the data</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button 
                onClick={() => fetchTeamLeads()} 
                className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="bg-blue-600 text-white p-2 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                {isAdmin ? 'Team Leads & Assignments' : 'My Team'}
              </h1>
              <p className="mt-1 text-gray-600 text-sm md:text-base">
                {isAdmin 
                  ? 'Manage all team leads and their team members' 
                  : 'View your team members and assignments'}
              </p>
            </div>
            {isAdmin && (
              <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-green-700">Admin Access</span>
              </div>
            )}
          </div>
          
          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-sm text-blue-600 font-medium">Total Team Leads</p>
              <p className="text-2xl font-bold text-blue-900">{teamLeads.length}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <p className="text-sm text-green-600 font-medium">Total Interns</p>
              <p className="text-2xl font-bold text-green-900">
                {Object.values(assignedInterns).reduce((acc, curr) => acc + curr.length, 0)}
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <p className="text-sm text-purple-600 font-medium">Total Employees</p>
              <p className="text-2xl font-bold text-purple-900">
                {Object.values(assignedEmployees).reduce((acc, curr) => acc + curr.length, 0)}
              </p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <p className="text-sm text-orange-600 font-medium">Total Members</p>
              <p className="text-2xl font-bold text-orange-900">
                {Object.values(assignedInterns).reduce((acc, curr) => acc + curr.length, 0) +
                 Object.values(assignedEmployees).reduce((acc, curr) => acc + curr.length, 0)}
              </p>
            </div>
          </div>
        </div>

        {teamLeads.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No Team Leads Found</h3>
            <p className="mt-1 text-gray-500">
              {isAdmin ? 'No team leads have been created yet.' : 'You are not assigned as a Team Lead.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {teamLeads.map((lead, index) => {
              const selectedInterns = assignedInterns[lead._id] || [];
              const selectedEmployees = assignedEmployees[lead._id] || [];
              const totalAssignments = selectedInterns.length + selectedEmployees.length;
              const leadName = getUserName(lead);
              const leadEmail = getUserEmail(lead);
              const departmentName = getDepartment(lead);

              return (
                <div
                  key={lead._id || index}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {leadName}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">{leadEmail}</p>
                      </div>
                      <div className="flex-shrink-0 ml-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></span>
                          Team Lead
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-gray-600">
                          <span className="font-medium">Department:</span> {departmentName}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-600">
                          <span className="font-medium">Designation:</span> {getDesignation(lead)}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 font-medium">Interns</p>
                        <p className="text-lg font-bold text-green-600">{selectedInterns.length}</p>
                      </div>
                      <div className="text-center border-l border-r border-gray-200">
                        <p className="text-xs text-gray-500 font-medium">Employees</p>
                        <p className="text-lg font-bold text-purple-600">{selectedEmployees.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 font-medium">Total</p>
                        <p className="text-lg font-bold text-blue-600">{totalAssignments}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    {isAdmin && (
                      <button
                        onClick={() => handleOpenModal(lead)}
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Assign Team Members
                        {totalAssignments > 0 && (
                          <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                            {totalAssignments}
                          </span>
                        )}
                      </button>
                    )}

                    {/* Member Tags */}
                    {totalAssignments > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 font-medium mb-2">Team Members</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedInterns.slice(0, 3).map((internId) => {
                            const intern = interns.find(i => String(i._id) === String(internId));
                            return intern ? (
                              <span key={internId} className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 text-xs rounded-full border border-green-200">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                                {getInternDisplayName(intern)}
                              </span>
                            ) : null;
                          })}
                          {selectedEmployees.slice(0, 3).map((employeeId) => {
                            const employee = employees.find(e => 
                              String(e._id) === String(employeeId) || 
                              (e.userID && String(e.userID) === String(employeeId))
                            );
                            return employee ? (
                              <span key={employeeId} className="inline-flex items-center px-2.5 py-1 bg-purple-100 text-purple-800 text-xs rounded-full border border-purple-200">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-1.5"></span>
                                {getEmployeeDisplayName(employee)}
                              </span>
                            ) : null;
                          })}
                          {totalAssignments > 6 && (
                            <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
                              +{totalAssignments - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <AssignmentModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        lead={selectedLead}
        interns={interns}
        employees={employees}
        onSave={handleSaveAssignments}
      />
    </div>
  );
};