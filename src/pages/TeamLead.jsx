// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const BASE_URL = "https://kt-backend-1.onrender.com/api";

// export const TeamLead = () => {
//   const [teamLeads, setTeamLeads] = useState([]);
//   const [interns, setInterns] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [assignedInterns, setAssignedInterns] = useState({});
//   const [assignedEmployees, setAssignedEmployees] = useState({});
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedTeamLead, setSelectedTeamLead] = useState(null);
//   const [showInternDropdown, setShowInternDropdown] = useState(null);
//   const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(null);

//   const getUserRole = () => {
//     try {
//       const user = JSON.parse(localStorage.getItem('user') || '{}');
//       return user?.role?.toLowerCase().trim() || '';
//     } catch {
//       return '';
//     }
//   };

//   const getLeadId = (lead) => {
//     if (!lead) return null;
//     return (
//       lead.teamLead?.userId ||
//       lead.teamLead?.employeeId ||
//       lead.userId ||
//       lead.employeeId ||
//       lead.user?._id ||
//       lead._id
//     );
//   };

//   const getDisplayName = (value) => {
//     if (!value) return "";
//     if (typeof value === "string") return value;
//     if (typeof value === "object") {
//       if (value.name) return value.name;
//       if (value.fullName) return value.fullName;
//       if (value.displayName) return value.displayName;
//       if (value.firstName || value.lastName) {
//         return `${value.firstName || ""} ${value.lastName || ""}`.trim();
//       }
//     }
//     return "";
//   };

//   const normalizeInternId = (item) => {
//     if (!item) return null;
//     if (typeof item === "string") return item;
//     if (typeof item === "number") return String(item);
//     if (typeof item === "object") {
//       if (item._id) return String(item._id);
//       if (item.id) return String(item.id);
//       if (item.internId) return String(item.internId);
//       if (item.userId) return String(item.userId);
//       if (item._ref) return String(item._ref);
//       if (item.user) return normalizeInternId(item.user);
//       if (item.details) return normalizeInternId(item.details);
//     }
//     return null;
//   };

//   const normalizeEmployeeId = (item) => {
//     if (!item) return null;
//     if (typeof item === "string") return item;
//     if (typeof item === "number") return String(item);
//     if (typeof item === "object") {
//       if (item._id) return String(item._id);
//       if (item.id) return String(item.id);
//       if (item.employeeId) return String(item.employeeId);
//       if (item.userId) return String(item.userId);
//       if (item._ref) return String(item._ref);
//       if (item.user) return normalizeEmployeeId(item.user);
//       if (item.details) return normalizeEmployeeId(item.details);
//     }
//     return null;
//   };

//   const getEmployeeDisplayName = (employee) => {
//     if (!employee) return "Unnamed";
    
//     if (employee.firstName) {
//       const lastName = employee.lastName || "";
//       return `${employee.firstName} ${lastName}`.trim();
//     }
    
//     if (employee.name) return employee.name;
//     if (employee.fullName) return employee.fullName;
//     if (employee.displayName) return employee.displayName;
//     if (employee.email) return employee.email;
    
//     return "Unnamed";
//   };

//   const getInternDisplayName = (intern) => {
//     if (!intern) return "Unnamed";
    
//     if (intern.name) return intern.name;
//     if (intern.fullName) return intern.fullName;
//     if (intern.displayName) return intern.displayName;
//     if (intern.firstName) {
//       const lastName = intern.lastName || "";
//       return `${intern.firstName} ${lastName}`.trim();
//     }
//     if (intern.email) return intern.email;
    
//     return "Unnamed";
//   };

//   useEffect(() => {
//     fetchTeamLeads();
//   }, []);

//   const fetchTeamLeads = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const token = localStorage.getItem('token');
//       if (!token) {
//         setError("Authentication required. Please login.");
//         setLoading(false);
//         return;
//       }

//       const headers = {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       };

//       const teamLeadResponse = await axios.get(
//         `${BASE_URL}/teamLead/team`,
//         { headers }
//       );

//       let teamLeadsData = [];
//       if (teamLeadResponse?.data?.data) {
//         teamLeadsData = teamLeadResponse.data.data;
//       } else if (teamLeadResponse?.data?.teamLeads) {
//         teamLeadsData = teamLeadResponse.data.teamLeads;
//       } else if (Array.isArray(teamLeadResponse?.data)) {
//         teamLeadsData = teamLeadResponse.data;
//       } else {
//         teamLeadsData = teamLeadResponse?.data || [];
//       }

//       if (!Array.isArray(teamLeadsData)) {
//         teamLeadsData = [];
//       }

//       let processedTeamLeads = teamLeadsData.map((lead) => {
//         let normalizedLead = lead;

//         if (lead.user && typeof lead.user === 'object') {
//           normalizedLead = {
//             ...lead.user,
//             ...lead,
//             _id: lead.teamLead.userId || lead.teamLead.employeeId,
//             teamLead: lead.teamLead.userId || lead.teamLead.employeeId,
//           };
//         } else if (lead.teamLead && typeof lead.teamLead === 'object') {
//           normalizedLead = {
//             ...lead.teamLead,
//             ...lead,
//             _id: lead.teamLead._id || lead._id || lead.teamLead.userId || lead.teamLead.user?._id,
//             teamLead: lead.teamLead._id || lead._id,
//           };
//         } else if (lead.teamLeadId) {
//           normalizedLead = {
//             ...lead,
//             _id: lead._id || lead.teamLeadId,
//             teamLead: lead._id || lead.teamLeadId,
//           };
//         } else {
//           normalizedLead = {
//             ...lead,
//             _id: lead._id,
//             teamLead: lead._id,
//           };
//         }

//         const leadId = getLeadId(normalizedLead) || normalizedLead._id;
//         return {
//           ...normalizedLead,
//           _id: leadId,
//           teamLead: leadId,
//         };
//       });

//       const uniqueTeamLeads = processedTeamLeads.reduce((acc, current) => {
//         const exists = acc.some(item => item._id === current._id);
//         if (!exists) {
//           acc.push(current);
//         }
//         return acc;
//       }, []);

//       setTeamLeads(uniqueTeamLeads);
//       await Promise.all([
//         fetchInterns(headers),
//         fetchEmployees(headers)
//       ]);

//       const assignments = {};
//       const employeeAssignments = {};
//       const savedAssignments = loadSavedAssignments();
//       const savedEmployeeAssignments = loadSavedEmployeeAssignments();

//       uniqueTeamLeads.forEach((lead) => {
//         const leadId = getLeadId(lead);
        
//         const assignedIds = getAssignedInternIds(lead);
//         const normalizedAssignedIds = [...new Set(assignedIds.filter(Boolean))];
//         if (normalizedAssignedIds.length > 0) {
//           assignments[leadId] = normalizedAssignedIds;
//         } else if (savedAssignments[leadId]) {
//           assignments[leadId] = savedAssignments[leadId];
//         }

//         const assignedEmployeeIds = getAssignedEmployeeIds(lead);
//         const normalizedEmployeeIds = [...new Set(assignedEmployeeIds.filter(Boolean))];
//         if (normalizedEmployeeIds.length > 0) {
//           employeeAssignments[leadId] = normalizedEmployeeIds;
//         } else if (savedEmployeeAssignments[leadId]) {
//           employeeAssignments[leadId] = savedEmployeeAssignments[leadId];
//         }
//       });

//       setAssignedInterns(assignments);
//       setAssignedEmployees(employeeAssignments);
//       persistAssignments(assignments);
//       persistEmployeeAssignments(employeeAssignments);

//     } catch (error) {
//       console.error("Error fetching team leads:", error);
//       handleError(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchInterns = async (headers) => {
//     try {
//       const usersResponse = await axios.get(`${BASE_URL}/users/all`, { headers });
//       const allUsers = usersResponse?.data?.users || [];
//       const internUsers = allUsers.filter((user) => {
//         return user.role?.toLowerCase().trim() === "intern";
//       });
//       setInterns(internUsers);
//     } catch (error) {
//       console.log("Could not fetch interns:", error);
//     }
//   };

//   const fetchEmployees = async (headers) => {
//     try {
//       const employeesResponse = await axios.get(`${BASE_URL}/employee/list`, { headers });
//       const allEmployees = employeesResponse?.data?.employees || [];
//       if (Array.isArray(allEmployees)) {
//         setEmployees(allEmployees);
//       } else {
//         setEmployees([]);
//       }
//     } catch (error) {
//       console.log("Could not fetch employees:", error);
//       setEmployees([]);
//     }
//   };

//   const handleError = (error) => {
//     if (error.response?.status === 401) {
//       setError("Authentication failed. Please login again.");
//     } else if (error.response?.status === 403) {
//       setError("You don't have permission to view team leads.");
//     } else if (error.response?.status === 404) {
//       setError("Team leads data not found.");
//     } else {
//       setError("Failed to load team leads. Please try again.");
//     }
//   };

//   const handleInternToggle = (teamLeadId, internId) => {
//     setAssignedInterns((prev) => {
//       const current = prev[teamLeadId] || [];
//       if (current.includes(internId)) {
//         return {
//           ...prev,
//           [teamLeadId]: current.filter((id) => id !== internId),
//         };
//       } else {
//         return {
//           ...prev,
//           [teamLeadId]: [...current, internId],
//         };
//       }
//     });
//   };

//   const handleEmployeeToggle = (teamLeadId, employeeId) => {
//     setAssignedEmployees((prev) => {
//       const current = prev[teamLeadId] || [];
//       if (current.includes(employeeId)) {
//         return {
//           ...prev,
//           [teamLeadId]: current.filter((id) => id !== employeeId),
//         };
//       } else {
//         return {
//           ...prev,
//           [teamLeadId]: [...current, employeeId],
//         };
//       }
//     });
//   };

//   const handleSaveAssignments = async (leadId, type) => {
//     const lead = teamLeads.find(l => l._id === leadId);
//     if (!lead) {
//       alert("Team lead not found.");
//       return;
//     }

//     const selectedInterns = assignedInterns[leadId] || [];
//     const selectedEmployees = assignedEmployees[leadId] || [];
    
//     if (type === 'interns' && selectedInterns.length === 0) {
//       alert("Please select at least one intern to assign.");
//       return;
//     }

//     if (type === 'employees' && selectedEmployees.length === 0) {
//       alert("Please select at least one employee to assign.");
//       return;
//     }

//     setSaving(true);
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         alert("Authentication required. Please login again.");
//         setSaving(false);
//         return;
//       }

//       const headers = {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       };

//       const candidateIds = [
//         lead.teamLead?.userId,
//         lead.teamLead?.employeeId,
//         lead.userId,
//         lead.employeeId,
//         lead._id,
//       ].filter(Boolean).map(String);

//       if (candidateIds.length === 0) {
//         alert("Invalid team lead data. Please refresh and try again.");
//         setSaving(false);
//         return;
//       }

//       const internIds = selectedInterns.map((id) => String(id));
//       const employeeIds = selectedEmployees.map((id) => String(id));

//       const payloadBuilders = [
//         (id) => ({ 
//           teamLead: id, 
//           interns: internIds,
//           employees: employeeIds 
//         }),
//         (id) => ({ 
//           teamLeadId: id, 
//           interns: internIds,
//           employees: employeeIds 
//         }),
//         (id) => ({ 
//           teamLead: id, 
//           internIds,
//           employeeIds 
//         }),
//         (id) => ({ 
//           teamLeadId: id, 
//           internIds,
//           employeeIds 
//         }),
//         (id) => ({ 
//           teamLead: id, 
//           interns: internIds.map(i => ({ internId: i })),
//           employees: employeeIds.map(e => ({ employeeId: e }))
//         }),
//       ];

//       let lastError = null;
//       let lastAttemptInfo = null;
//       let success = false;

//       for (const id of candidateIds) {
//         for (const build of payloadBuilders) {
//           const payload = {
//             ...build(id),
//             department: lead.department || lead.departmentName || lead.teamLead?.department || "",
//             designation: lead.designation || lead.designationName || lead.teamLead?.designation || "",
//             teamLeadName: getUserName(lead),
//             teamLeadEmail: getUserEmail(lead),
//           };

//           try {
//             lastAttemptInfo = { id, payload };
//             const response = await axios.post(`${BASE_URL}/teamLead/create-team`, payload, { headers });
//             if ((response.status === 200 || response.status === 201) && response.data?.success !== false) {
//               success = true;
//               const updatedInternAssignments = { ...assignedInterns };
//               const updatedEmployeeAssignments = { ...assignedEmployees };
//               const idKey = lead._id || id;
              
//               updatedInternAssignments[idKey] = internIds;
//               updatedEmployeeAssignments[idKey] = employeeIds;
              
//               setAssignedInterns(updatedInternAssignments);
//               setAssignedEmployees(updatedEmployeeAssignments);
//               persistAssignments(updatedInternAssignments);
//               persistEmployeeAssignments(updatedEmployeeAssignments);

//               // Close the dropdown
//               setShowInternDropdown(null);
//               setShowEmployeeDropdown(null);

//               await fetchTeamLeads();
              
//               if (type === 'interns') {
//                 alert(`Successfully assigned ${internIds.length} intern(s) to ${getUserName(lead)}!`);
//               } else {
//                 alert(`Successfully assigned ${employeeIds.length} employee(s) to ${getUserName(lead)}!`);
//               }
//               break;
//             }
//           } catch (err) {
//             lastError = err;
//             if (lastAttemptInfo && err?.response?.data) {
//               lastAttemptInfo.response = err.response.data;
//             }
//             const status = err?.response?.status;
//             if (status === 404) {
//               continue;
//             } else {
//               throw err;
//             }
//           }
//         }
//         if (success) break;
//       }

//       if (!success) {
//         let errorMessage = 'Failed to save assignments. Please try again.';
//         if (lastError?.response) {
//           const data = lastError.response.data;
//           errorMessage = data?.message || data?.error || `Server responded with status ${lastError.response.status}`;
//         } else if (lastError?.request) {
//           errorMessage = 'No response from server. Please check your connection.';
//         } else if (lastError) {
//           errorMessage = lastError.message;
//         }

//         console.error('Assignment attempts failed. Last attempt:', lastAttemptInfo, 'lastError:', lastError);
//         alert(errorMessage);
//       }

//     } catch (error) {
//       console.error('Error saving assignments:', error);
//       let errorMessage = 'Failed to save assignments. Please try again.';
//       if (error?.response) {
//         errorMessage = error.response.data?.message || error.response.data?.error || `Server error (${error.response.status})`;
//       } else if (error?.request) {
//         errorMessage = 'No response from server. Please check your connection.';
//       } else if (error?.message) {
//         errorMessage = error.message;
//       }
//       alert(errorMessage);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const getDepartment = (lead) => {
//     if (!lead) return "-";
//     if (lead.departmentName) return lead.departmentName;
//     if (lead.department?.departmentName) return lead.department.departmentName;
//     if (lead.teamLead?.department?.departmentName) return lead.teamLead.department.departmentName;
//     if (typeof lead.department === "string") return lead.department;
//     if (typeof lead.teamLead?.department === "string") return lead.teamLead.department;
//     return "-";
//   };

//   const getDesignation = (lead) => {
//     if (!lead) return "-";
//     if (lead.designationName) return lead.designationName;
//     if (lead.designation?.designationName) return lead.designation.designationName;
//     if (lead.teamLead?.designation) return lead.teamLead.designation;
//     if (lead.teamLead?.designationName) return lead.teamLead.designationName;
//     if (typeof lead.designation === "string") return lead.designation;
//     return "-";
//   };

//   const getUserName = (lead) => {
//     if (!lead) return "No Name";
//     const nameKeys = ['name','fullName','displayName','userName','username','empName','employeeName','leadName','teamLeadName'];

//     const isString = (v) => typeof v === 'string' && v.trim().length > 0;

//     const findNameRecursive = (obj, seen = new Set()) => {
//       if (!obj || typeof obj !== 'object' || seen.has(obj)) return null;
//       seen.add(obj);

//       for (const key of nameKeys) {
//         if (Object.prototype.hasOwnProperty.call(obj, key) && isString(obj[key])) {
//           return obj[key].trim();
//         }
//       }

//       const first = obj.firstName || obj.first_name || obj.user?.firstName || obj.teamLead?.firstName;
//       const last = obj.lastName || obj.last_name || obj.user?.lastName || obj.teamLead?.lastName;
//       if (isString(first) || isString(last)) {
//         return `${(first || '').toString().trim()} ${(last || '').toString().trim()}`.trim();
//       }

//       for (const k of Object.keys(obj)) {
//         try {
//           const val = obj[k];
//           if (val && typeof val === 'object') {
//             const found = findNameRecursive(val, seen);
//             if (isString(found)) return found;
//           }
//         } catch (e) {
//           // ignore
//         }
//       }

//       return null;
//     };

//     const found = findNameRecursive(lead);
//     if (isString(found)) return found;

//     const email = lead.email || lead.user?.email || lead.teamLead?.email;
//     if (isString(email) && email.includes('@')) return email.split('@')[0];

//     return 'No Name';
//   };

//   const getUserEmail = (lead) => {
//     return lead.email || lead.user?.email || lead.teamLead?.email || "N/A";
//   };

//   const loadSavedAssignments = () => {
//     try {
//       return JSON.parse(localStorage.getItem('teamLeadAssignedInterns') || '{}') || {};
//     } catch {
//       return {};
//     }
//   };

//   const loadSavedEmployeeAssignments = () => {
//     try {
//       return JSON.parse(localStorage.getItem('teamLeadAssignedEmployees') || '{}') || {};
//     } catch {
//       return {};
//     }
//   };

//   const persistAssignments = (assignments) => {
//     try {
//       localStorage.setItem('teamLeadAssignedInterns', JSON.stringify(assignments));
//     } catch {
//       // ignore storage failures
//     }
//   };

//   const persistEmployeeAssignments = (assignments) => {
//     try {
//       localStorage.setItem('teamLeadAssignedEmployees', JSON.stringify(assignments));
//     } catch {
//       // ignore storage failures
//     }
//   };

//   const getAssignedInternIds = (lead) => {
//     const candidateLists = [
//       lead.interns,
//       lead.assignedInterns,
//       lead.teamInterns,
//       lead.internDetails,
//       lead.internIds,
//       lead.assignedInternIds,
//       lead.team?.interns,
//       lead.team?.assignedInterns,
//       lead.team?.internDetails,
//       lead.user?.interns,
//       lead.user?.assignedInterns,
//       lead.teamLead?.interns,
//       lead.teamLead?.assignedInterns,
//       lead.teamLead?.internDetails,
//     ];

//     for (const value of candidateLists) {
//       if (!value) continue;

//       if (Array.isArray(value)) {
//         const ids = value
//           .map((item) => normalizeInternId(item))
//           .filter(Boolean);

//         if (ids.length > 0) {
//           return [...new Set(ids)];
//         }
//       }

//       if (typeof value === "object") {
//         const ids = Object.values(value)
//           .flatMap((entry) => {
//             if (Array.isArray(entry)) {
//               return entry.map((item) => normalizeInternId(item)).filter(Boolean);
//             }
//             return [normalizeInternId(entry)].filter(Boolean);
//           });

//         if (ids.length > 0) {
//           return [...new Set(ids)];
//         }
//       }
//     }

//     return [];
//   };

//   const getAssignedEmployeeIds = (lead) => {
//     const candidateLists = [
//       lead.employees,
//       lead.assignedEmployees,
//       lead.teamEmployees,
//       lead.employeeDetails,
//       lead.employeeIds,
//       lead.assignedEmployeeIds,
//       lead.team?.employees,
//       lead.team?.assignedEmployees,
//       lead.team?.employeeDetails,
//       lead.user?.employees,
//       lead.user?.assignedEmployees,
//       lead.teamLead?.employees,
//       lead.teamLead?.assignedEmployees,
//       lead.teamLead?.employeeDetails,
//     ];

//     for (const value of candidateLists) {
//       if (!value) continue;

//       if (Array.isArray(value)) {
//         const ids = value
//           .map((item) => normalizeEmployeeId(item))
//           .filter(Boolean);

//         if (ids.length > 0) {
//           return [...new Set(ids)];
//         }
//       }

//       if (typeof value === "object") {
//         const ids = Object.values(value)
//           .flatMap((entry) => {
//             if (Array.isArray(entry)) {
//               return entry.map((item) => normalizeEmployeeId(item)).filter(Boolean);
//             }
//             return [normalizeEmployeeId(entry)].filter(Boolean);
//           });

//         if (ids.length > 0) {
//           return [...new Set(ids)];
//         }
//       }
//     }

//     return [];
//   };

//   const userRole = getUserRole();
//   const isAdmin = userRole === 'admin';

//   if (loading) {
//     return (
//       <div className="p-6 text-center text-lg">
//         <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
//         <p className="mt-2">Loading Team Leads...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6">
//         <div className="border border-red-400 bg-red-50 text-red-700 px-4 py-3">
//           <strong>Error: </strong>
//           <span>{error}</span>
//           <button 
//             onClick={() => fetchTeamLeads()} 
//             className="mt-3 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 border border-red-700 block"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 max-w-7xl mx-auto">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
//         <h2 className="text-xl font-bold text-slate-800">
//           {isAdmin ? 'All Team Leads & Assignments' : 'My Team & Assignments'}
//         </h2>
//         {isAdmin && (
//           <span className="bg-green-100 text-green-800 text-xs px-3 py-1 border border-green-300">
//             Admin View
//           </span>
//         )}
//       </div>

//       {teamLeads.length === 0 ? (
//         <div className="text-center text-gray-500 py-8 border border-slate-300 bg-white">
//           {isAdmin ? 'No Team Leads Found' : 'You are not assigned as a Team Lead'}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {teamLeads.map((lead, index) => {
//             const selectedInterns = assignedInterns[lead._id] || [];
//             const selectedEmployees = assignedEmployees[lead._id] || [];
//             const totalAssignments = selectedInterns.length + selectedEmployees.length;
//             const leadName = getUserName(lead);
//             const leadEmail = getUserEmail(lead);

//             return (
//               <div
//                 key={lead._id || index}
//                 className="border border-slate-300 p-4 bg-white relative"
//               >
//                 <div className="flex justify-between items-start mb-3">
//                   <h3 className="text-base font-semibold text-slate-800">
//                     {leadName}
//                   </h3>
//                   <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 border border-blue-300">
//                     Team Lead
//                   </span>
//                 </div>

//                 <div className="space-y-1 text-sm">
//                   <p className="text-slate-600">
//                     <span className="font-medium">Email:</span> {leadEmail}
//                   </p>
//                   <p className="text-slate-600">
//                     <span className="font-medium">Department:</span> {getDepartment(lead)}
//                   </p>
//                   <p className="text-slate-600">
//                     <span className="font-medium">Designation:</span> {getDesignation(lead)}
//                   </p>
//                 </div>

//                 <div className="mt-3 pt-3 border-t border-slate-200">
//                   <p className="text-sm text-slate-600">
//                     <span className="font-medium">Assigned Interns:</span> {selectedInterns.length}
//                   </p>
//                   <p className="text-sm text-slate-600">
//                     <span className="font-medium">Assigned Employees:</span> {selectedEmployees.length}
//                   </p>
//                   <p className="text-sm text-slate-600 font-medium">
//                     <span className="font-medium">Total Members:</span> {totalAssignments}
//                   </p>
//                 </div>

//                 <div className="mt-3 space-y-2">
//                   {/* Assign Interns Button */}
//                   <div className="relative">
//                     <button
//                       onClick={() => {
//                         setShowInternDropdown(showInternDropdown === lead._id ? null : lead._id);
//                         setShowEmployeeDropdown(null);
//                         setSelectedTeamLead(lead);
//                       }}
//                       className="w-full py-2 px-4 font-medium text-white bg-green-600 hover:bg-green-700 border border-green-700"
//                       disabled={!isAdmin}
//                     >
//                       Assign Interns ({selectedInterns.length})
//                     </button>

//                     {showInternDropdown === lead._id && isAdmin && (
//                       <div className="absolute z-50 mt-1 w-full bg-white border border-slate-300 shadow-lg max-h-60 overflow-y-auto">
//                         <div className="p-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
//                           <span className="text-sm font-medium text-slate-700">
//                             Select Interns
//                           </span>
//                           <div className="space-x-2">
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 const allIds = interns.map(intern => intern._id);
//                                 setAssignedInterns(prev => ({
//                                   ...prev,
//                                   [lead._id]: allIds
//                                 }));
//                               }}
//                               className="text-xs text-blue-600 hover:text-blue-800 font-medium"
//                               disabled={interns.length === 0}
//                             >
//                               Select All
//                             </button>
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setAssignedInterns(prev => ({
//                                   ...prev,
//                                   [lead._id]: []
//                                 }));
//                               }}
//                               className="text-xs text-red-600 hover:text-red-800 font-medium"
//                               disabled={selectedInterns.length === 0}
//                             >
//                               Deselect All
//                             </button>
//                           </div>
//                         </div>
                        
//                         {interns.length === 0 ? (
//                           <p className="text-slate-500 text-sm text-center py-4">
//                             No Interns Available
//                           </p>
//                         ) : (
//                           interns.map((intern) => {
//                             const isChecked = selectedInterns.includes(intern._id);
//                             return (
//                               <label
//                                 key={intern._id}
//                                 className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
//                               >
//                                 <input
//                                   type="checkbox"
//                                   checked={isChecked}
//                                   onChange={() =>
//                                     handleInternToggle(lead._id, intern._id)
//                                   }
//                                   className="w-4 h-4 text-green-600 border-slate-300 focus:ring-green-500"
//                                 />
//                                 <span className="text-sm">
//                                   {getInternDisplayName(intern)}
//                                   <span className="text-slate-500 ml-1 text-xs">
//                                     ({intern.uniqueID || intern.email || "No ID"})
//                                   </span>
//                                 </span>
//                               </label>
//                             );
//                           })
//                         )}
                        
//                         <div className="p-2 bg-slate-50 border-t border-slate-200">
//                           <button
//                             onClick={() => handleSaveAssignments(lead._id, 'interns')}
//                             disabled={saving || selectedInterns.length === 0}
//                             className={`w-full py-1.5 px-4 text-sm font-medium text-white border ${
//                               saving || selectedInterns.length === 0
//                                 ? "bg-slate-400 border-slate-400 cursor-not-allowed"
//                                 : "bg-green-600 hover:bg-green-700 border-green-700"
//                             }`}
//                           >
//                             {saving ? "Saving..." : `Save ${selectedInterns.length} Intern(s)`}
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Assign Employees Button */}
//                   <div className="relative">
//                     <button
//                       onClick={() => {
//                         setShowEmployeeDropdown(showEmployeeDropdown === lead._id ? null : lead._id);
//                         setShowInternDropdown(null);
//                         setSelectedTeamLead(lead);
//                       }}
//                       className="w-full py-2 px-4 font-medium text-white bg-purple-600 hover:bg-purple-700 border border-purple-700"
//                       disabled={!isAdmin}
//                     >
//                       Assign Employees ({selectedEmployees.length})
//                     </button>

//                     {showEmployeeDropdown === lead._id && isAdmin && (
//                       <div className="absolute z-50 mt-1 w-full bg-white border border-slate-300 shadow-lg max-h-60 overflow-y-auto">
//                         <div className="p-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
//                           <span className="text-sm font-medium text-slate-700">
//                             Select Employees
//                           </span>
//                           <div className="space-x-2">
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 const allIds = employees.map(emp => emp._id);
//                                 setAssignedEmployees(prev => ({
//                                   ...prev,
//                                   [lead._id]: allIds
//                                 }));
//                               }}
//                               className="text-xs text-blue-600 hover:text-blue-800 font-medium"
//                               disabled={employees.length === 0}
//                             >
//                               Select All
//                             </button>
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setAssignedEmployees(prev => ({
//                                   ...prev,
//                                   [lead._id]: []
//                                 }));
//                               }}
//                               className="text-xs text-red-600 hover:text-red-800 font-medium"
//                               disabled={selectedEmployees.length === 0}
//                             >
//                               Deselect All
//                             </button>
//                           </div>
//                         </div>
                        
//                         {employees.length === 0 ? (
//                           <p className="text-slate-500 text-sm text-center py-4">
//                             No Employees Available
//                           </p>
//                         ) : (
//                           employees.map((employee) => {
//                             const isChecked = selectedEmployees.includes(employee._id);
//                             return (
//                               <label
//                                 key={employee._id}
//                                 className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
//                               >
//                                 <input
//                                   type="checkbox"
//                                   checked={isChecked}
//                                   onChange={() =>
//                                     handleEmployeeToggle(lead._id, employee._id)
//                                   }
//                                   className="w-4 h-4 text-purple-600 border-slate-300 focus:ring-purple-500"
//                                 />
//                                 <span className="text-sm">
//                                   {getEmployeeDisplayName(employee)}
//                                   <span className="text-slate-500 ml-1 text-xs">
//                                     ({employee.employeeID || employee.uniqueID || employee.email || "No ID"})
//                                   </span>
//                                 </span>
//                               </label>
//                             );
//                           })
//                         )}
                        
//                         <div className="p-2 bg-slate-50 border-t border-slate-200">
//                           <button
//                             onClick={() => handleSaveAssignments(lead._id, 'employees')}
//                             disabled={saving || selectedEmployees.length === 0}
//                             className={`w-full py-1.5 px-4 text-sm font-medium text-white border ${
//                               saving || selectedEmployees.length === 0
//                                 ? "bg-slate-400 border-slate-400 cursor-not-allowed"
//                                 : "bg-purple-600 hover:bg-purple-700 border-purple-700"
//                             }`}
//                           >
//                             {saving ? "Saving..." : `Save ${selectedEmployees.length} Employee(s)`}
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {totalAssignments > 0 && (
//                     <div className="text-xs text-slate-500 mt-2">
//                       <span className="font-medium">Assigned to:</span>
//                       <div className="flex flex-wrap gap-1 mt-1">
//                         {selectedInterns.slice(0, 2).map((internId) => {
//                           const intern = interns.find(i => i._id === internId);
//                           return intern ? (
//                             <span key={internId} className="bg-green-100 px-2 py-0.5 border border-green-200 text-xs">
//                               {getInternDisplayName(intern)} (I)
//                             </span>
//                           ) : null;
//                         })}
//                         {selectedEmployees.slice(0, 2).map((employeeId) => {
//                           const employee = employees.find(e => e._id === employeeId);
//                           return employee ? (
//                             <span key={employeeId} className="bg-purple-100 px-2 py-0.5 border border-purple-200 text-xs">
//                               {getEmployeeDisplayName(employee)} (E)
//                             </span>
//                           ) : null;
//                         })}
//                         {totalAssignments > 4 && (
//                           <span className="bg-slate-100 px-2 py-0.5 border border-slate-200 text-xs">
//                             +{totalAssignments - 4} more
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://kt-backend-1.onrender.com/api";

export const TeamLead = () => {
  const [teamLeads, setTeamLeads] = useState([]);
  const [interns, setInterns] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignedInterns, setAssignedInterns] = useState({});
  const [assignedEmployees, setAssignedEmployees] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTeamLead, setSelectedTeamLead] = useState(null);
  const [showInternDropdown, setShowInternDropdown] = useState(null);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(null);

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

  useEffect(() => {
    fetchTeamLeads();
  }, []);

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

      // Process team leads data
      const processedTeamLeads = teamLeadsData.map((lead) => {
        // Extract team lead ID from various possible locations
        const leadId = 
          lead.teamLead?.userId || 
          lead.teamLead?.employeeId || 
          lead.teamLead?._id ||
          lead.userId || 
          lead.employeeId || 
          lead.user?._id || 
          lead._id;

        return {
          ...lead,
          _id: leadId || lead._id,
          teamLeadId: leadId || lead._id,
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
      
      // Fetch interns and employees
      await Promise.all([
        fetchInterns(headers),
        fetchEmployees(headers)
      ]);

      // Load saved assignments from localStorage
      const savedInternAssignments = loadSavedAssignments();
      const savedEmployeeAssignments = loadSavedEmployeeAssignments();

      // Initialize assignments from API data or localStorage
      const internAssignments = {};
      const employeeAssignments = {};

      uniqueTeamLeads.forEach((lead) => {
        const leadId = lead._id;
        
        // Get interns from API response
        const apiInterns = getAssignedInternIds(lead);
        if (apiInterns.length > 0) {
          internAssignments[leadId] = apiInterns;
        } else if (savedInternAssignments[leadId]) {
          internAssignments[leadId] = savedInternAssignments[leadId];
        } else {
          internAssignments[leadId] = [];
        }

        // Get employees from API response
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

  const handleInternToggle = (teamLeadId, internId) => {
    setAssignedInterns((prev) => {
      const current = prev[teamLeadId] || [];
      const updated = current.includes(internId)
        ? current.filter((id) => id !== internId)
        : [...current, internId];
      return {
        ...prev,
        [teamLeadId]: updated,
      };
    });
  };

  const handleEmployeeToggle = (teamLeadId, employeeId) => {
    setAssignedEmployees((prev) => {
      const current = prev[teamLeadId] || [];
      const updated = current.includes(employeeId)
        ? current.filter((id) => id !== employeeId)
        : [...current, employeeId];
      return {
        ...prev,
        [teamLeadId]: updated,
      };
    });
  };

  const handleSaveAssignments = async (leadId, type) => {
    const lead = teamLeads.find(l => l._id === leadId);
    if (!lead) {
      alert("Team lead not found.");
      return;
    }

    const selectedInterns = assignedInterns[leadId] || [];
    const selectedEmployees = assignedEmployees[leadId] || [];
    
    if (type === 'interns' && selectedInterns.length === 0) {
      alert("Please select at least one intern to assign.");
      return;
    }

    if (type === 'employees' && selectedEmployees.length === 0) {
      alert("Please select at least one employee to assign.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Authentication required. Please login again.");
        setSaving(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Get the correct team lead ID
      const teamLeadId = lead.teamLeadId || lead._id || lead.teamLead?.userId || lead.teamLead?.employeeId;
      
      if (!teamLeadId) {
        alert("Invalid team lead data. Please refresh and try again.");
        setSaving(false);
        return;
      }

      // Prepare payload with only employees and interns
      const payload = {
        teamLead: teamLeadId,
        employees: selectedEmployees.map(id => String(id)),
        interns: selectedInterns.map(id => String(id))
      };

      console.log("Saving assignments:", payload);

      const response = await axios.post(
        `${BASE_URL}/teamLead/create-team`,
        payload,
        { headers }
      );

      if (response.status === 200 || response.status === 201) {
        // Update local state
        const updatedInternAssignments = { ...assignedInterns };
        const updatedEmployeeAssignments = { ...assignedEmployees };
        
        updatedInternAssignments[leadId] = selectedInterns;
        updatedEmployeeAssignments[leadId] = selectedEmployees;
        
        setAssignedInterns(updatedInternAssignments);
        setAssignedEmployees(updatedEmployeeAssignments);
        persistAssignments(updatedInternAssignments);
        persistEmployeeAssignments(updatedEmployeeAssignments);

        // Close dropdowns
        setShowInternDropdown(null);
        setShowEmployeeDropdown(null);

        // Refresh data
        await fetchTeamLeads();
        
        const message = type === 'interns' 
          ? `Successfully assigned ${selectedInterns.length} intern(s) to ${getUserName(lead)}!`
          : `Successfully assigned ${selectedEmployees.length} employee(s) to ${getUserName(lead)}!`;
        alert(message);
      } else {
        throw new Error("Failed to save assignments");
      }

    } catch (error) {
      console.error('Error saving assignments:', error);
      let errorMessage = 'Failed to save assignments. Please try again.';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getDepartment = (lead) => {
    if (!lead) return "-";
    if (lead.departmentName) return lead.departmentName;
    if (lead.department?.departmentName) return lead.department.departmentName;
    if (lead.teamLead?.department?.departmentName) return lead.teamLead.department.departmentName;
    if (typeof lead.department === "string") return lead.department;
    if (typeof lead.teamLead?.department === "string") return lead.teamLead.department;
    return "-";
  };

  const getDesignation = (lead) => {
    if (!lead) return "-";
    if (lead.designationName) return lead.designationName;
    if (lead.designation?.designationName) return lead.designation.designationName;
    if (lead.teamLead?.designation) return lead.teamLead.designation;
    if (lead.teamLead?.designationName) return lead.teamLead.designationName;
    if (typeof lead.designation === "string") return lead.designation;
    return "-";
  };

  const getUserName = (lead) => {
    if (!lead) return "No Name";
    
    // Direct name fields
    if (lead.name) return lead.name;
    if (lead.fullName) return lead.fullName;
    if (lead.displayName) return lead.displayName;
    if (lead.userName) return lead.userName;
    if (lead.username) return lead.username;
    
    // First name + Last name
    if (lead.firstName || lead.lastName) {
      return `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
    }
    
    // Nested in user or teamLead
    if (lead.user) {
      return getUserName(lead.user);
    }
    if (lead.teamLead) {
      return getUserName(lead.teamLead);
    }
    
    // Fallback to email
    if (lead.email) {
      return lead.email.split('@')[0];
    }
    
    return "No Name";
  };

  const getUserEmail = (lead) => {
    return lead.email || lead.user?.email || lead.teamLead?.email || "N/A";
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

  const userRole = getUserRole();
  const isAdmin = userRole === 'admin';

  if (loading) {
    return (
      <div className="p-6 text-center text-lg">
        <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
        <p className="mt-2">Loading Team Leads...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="border border-red-400 bg-red-50 text-red-700 px-4 py-3">
          <strong>Error: </strong>
          <span>{error}</span>
          <button 
            onClick={() => fetchTeamLeads()} 
            className="mt-3 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 border border-red-700 block"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
        <h2 className="text-xl font-bold text-slate-800">
          {isAdmin ? 'All Team Leads & Assignments' : 'My Team & Assignments'}
        </h2>
        {isAdmin && (
          <span className="bg-green-100 text-green-800 text-xs px-3 py-1 border border-green-300">
            Admin View
          </span>
        )}
      </div>

      {teamLeads.length === 0 ? (
        <div className="text-center text-gray-500 py-8 border border-slate-300 bg-white">
          {isAdmin ? 'No Team Leads Found' : 'You are not assigned as a Team Lead'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamLeads.map((lead, index) => {
            const selectedInterns = assignedInterns[lead._id] || [];
            const selectedEmployees = assignedEmployees[lead._id] || [];
            const totalAssignments = selectedInterns.length + selectedEmployees.length;
            const leadName = getUserName(lead);
            const leadEmail = getUserEmail(lead);

            return (
              <div
                key={lead._id || index}
                className="border border-slate-300 p-4 bg-white relative"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-base font-semibold text-slate-800">
                    {leadName}
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 border border-blue-300">
                    Team Lead
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-slate-600">
                    <span className="font-medium">Email:</span> {leadEmail}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-medium">Department:</span> {getDepartment(lead)}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-medium">Designation:</span> {getDesignation(lead)}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Assigned Interns:</span> {selectedInterns.length}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Assigned Employees:</span> {selectedEmployees.length}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">
                    <span className="font-medium">Total Members:</span> {totalAssignments}
                  </p>
                </div>

                <div className="mt-3 space-y-2">
                  {/* Assign Interns Button */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowInternDropdown(showInternDropdown === lead._id ? null : lead._id);
                        setShowEmployeeDropdown(null);
                        setSelectedTeamLead(lead);
                      }}
                      className="w-full py-2 px-4 font-medium text-white bg-green-600 hover:bg-green-700 border border-green-700"
                      disabled={!isAdmin}
                    >
                      Assign Interns ({selectedInterns.length})
                    </button>

                    {showInternDropdown === lead._id && isAdmin && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-slate-300 shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-700">
                            Select Interns
                          </span>
                          <div className="space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const allIds = interns.map(intern => intern._id);
                                setAssignedInterns(prev => ({
                                  ...prev,
                                  [lead._id]: allIds
                                }));
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              disabled={interns.length === 0}
                            >
                              Select All
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAssignedInterns(prev => ({
                                  ...prev,
                                  [lead._id]: []
                                }));
                              }}
                              className="text-xs text-red-600 hover:text-red-800 font-medium"
                              disabled={selectedInterns.length === 0}
                            >
                              Deselect All
                            </button>
                          </div>
                        </div>
                        
                        {interns.length === 0 ? (
                          <p className="text-slate-500 text-sm text-center py-4">
                            No Interns Available
                          </p>
                        ) : (
                          interns.map((intern) => {
                            const isChecked = selectedInterns.includes(intern._id);
                            return (
                              <label
                                key={intern._id}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() =>
                                    handleInternToggle(lead._id, intern._id)
                                  }
                                  className="w-4 h-4 text-green-600 border-slate-300 focus:ring-green-500"
                                />
                                <span className="text-sm">
                                  {getInternDisplayName(intern)}
                                  <span className="text-slate-500 ml-1 text-xs">
                                    ({intern.uniqueID || intern.email || "No ID"})
                                  </span>
                                </span>
                              </label>
                            );
                          })
                        )}
                        
                        <div className="p-2 bg-slate-50 border-t border-slate-200">
                          <button
                            onClick={() => handleSaveAssignments(lead._id, 'interns')}
                            disabled={saving || selectedInterns.length === 0}
                            className={`w-full py-1.5 px-4 text-sm font-medium text-white border ${
                              saving || selectedInterns.length === 0
                                ? "bg-slate-400 border-slate-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 border-green-700"
                            }`}
                          >
                            {saving ? "Saving..." : `Save ${selectedInterns.length} Intern(s)`}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Assign Employees Button */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowEmployeeDropdown(showEmployeeDropdown === lead._id ? null : lead._id);
                        setShowInternDropdown(null);
                        setSelectedTeamLead(lead);
                      }}
                      className="w-full py-2 px-4 font-medium text-white bg-purple-600 hover:bg-purple-700 border border-purple-700"
                      disabled={!isAdmin}
                    >
                      Assign Employees ({selectedEmployees.length})
                    </button>

                    {showEmployeeDropdown === lead._id && isAdmin && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-slate-300 shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-700">
                            Select Employees
                          </span>
                          <div className="space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const allIds = employees.map(emp => emp._id);
                                setAssignedEmployees(prev => ({
                                  ...prev,
                                  [lead._id]: allIds
                                }));
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              disabled={employees.length === 0}
                            >
                              Select All
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAssignedEmployees(prev => ({
                                  ...prev,
                                  [lead._id]: []
                                }));
                              }}
                              className="text-xs text-red-600 hover:text-red-800 font-medium"
                              disabled={selectedEmployees.length === 0}
                            >
                              Deselect All
                            </button>
                          </div>
                        </div>
                        
                        {employees.length === 0 ? (
                          <p className="text-slate-500 text-sm text-center py-4">
                            No Employees Available
                          </p>
                        ) : (
                          employees.map((employee) => {
                            const isChecked = selectedEmployees.includes(employee._id);
                            return (
                              <label
                                key={employee._id}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() =>
                                    handleEmployeeToggle(lead._id, employee._id)
                                  }
                                  className="w-4 h-4 text-purple-600 border-slate-300 focus:ring-purple-500"
                                />
                                <span className="text-sm">
                                  {getEmployeeDisplayName(employee)}
                                  <span className="text-slate-500 ml-1 text-xs">
                                    ({employee.employeeID || employee.uniqueID || employee.email || "No ID"})
                                  </span>
                                </span>
                              </label>
                            );
                          })
                        )}
                        
                        <div className="p-2 bg-slate-50 border-t border-slate-200">
                          <button
                            onClick={() => handleSaveAssignments(lead._id, 'employees')}
                            disabled={saving || selectedEmployees.length === 0}
                            className={`w-full py-1.5 px-4 text-sm font-medium text-white border ${
                              saving || selectedEmployees.length === 0
                                ? "bg-slate-400 border-slate-400 cursor-not-allowed"
                                : "bg-purple-600 hover:bg-purple-700 border-purple-700"
                            }`}
                          >
                            {saving ? "Saving..." : `Save ${selectedEmployees.length} Employee(s)`}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {totalAssignments > 0 && (
                    <div className="text-xs text-slate-500 mt-2">
                      <span className="font-medium">Assigned to:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedInterns.slice(0, 2).map((internId) => {
                          const intern = interns.find(i => i._id === internId);
                          return intern ? (
                            <span key={internId} className="bg-green-100 px-2 py-0.5 border border-green-200 text-xs">
                              {getInternDisplayName(intern)} (I)
                            </span>
                          ) : null;
                        })}
                        {selectedEmployees.slice(0, 2).map((employeeId) => {
                          const employee = employees.find(e => e._id === employeeId);
                          return employee ? (
                            <span key={employeeId} className="bg-purple-100 px-2 py-0.5 border border-purple-200 text-xs">
                              {getEmployeeDisplayName(employee)} (E)
                            </span>
                          ) : null;
                        })}
                        {totalAssignments > 4 && (
                          <span className="bg-slate-100 px-2 py-0.5 border border-slate-200 text-xs">
                            +{totalAssignments - 4} more
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
  );
};