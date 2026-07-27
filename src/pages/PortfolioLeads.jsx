// import { useState, useEffect } from "react";
// import { Users, Mail, FolderOpen, Search, Filter, TrendingUp, Clock, ChevronDown } from "lucide-react";

// export default function PortfolioLeads() {
//   const [leads, setLeads] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterPriority, setFilterPriority] = useState("all");
//   const [filterStage, setFilterStage] = useState("all");
//   const [showFilters, setShowFilters] = useState(false);
//   const [selectedLead, setSelectedLead] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   useEffect(() => {
//     fetchPortfolio();
//   }, []);

//   const fetchPortfolio = async () => {
//     try {
//       const res = await fetch(
//         "https://kt-backend-1.onrender.com/api/portfolio/get"
//       );
//       const data = await res.json();

//       if (data.success) {
//         const formattedData = data.data.map((item) => ({
//           id: item._id,
//           clientName: item.fullName || "N/A",
//           keyContact: item.email || "N/A",
//           projectScope: item.projectTitle || "N/A",
//           stage: "Proposal Sent",
//           priority: "High",
//           createdAt: item.createdAt,
//         }));

//         setLeads(formattedData);
//       }
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openDetails = (lead) => {
//     setSelectedLead(lead);
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setSelectedLead(null);
//   };

//   const getPriorityColor = (priority) => {
//     switch (priority?.toLowerCase()) {
//       case "high":
//         return "bg-red-50 text-red-700 border-red-200";
//       case "medium":
//         return "bg-yellow-50 text-yellow-700 border-yellow-200";
//       case "low":
//         return "bg-green-50 text-green-700 border-green-200";
//       default:
//         return "bg-gray-50 text-gray-700 border-gray-200";
//     }
//   };

//   const getStageColor = (stage) => {
//     switch (stage?.toLowerCase()) {
//       case "proposal sent":
//         return "bg-blue-50 text-blue-700 border-blue-200";
//       case "negotiation":
//         return "bg-purple-50 text-purple-700 border-purple-200";
//       case "closed":
//         return "bg-emerald-50 text-emerald-700 border-emerald-200";
//       case "lost":
//         return "bg-red-50 text-red-700 border-red-200";
//       default:
//         return "bg-gray-50 text-gray-700 border-gray-200";
//     }
//   };

//   const filteredLeads = leads.filter((lead) => {
//     const matchesSearch = lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       lead.keyContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       lead.projectScope.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesPriority = filterPriority === "all" || lead.priority.toLowerCase() === filterPriority;
//     const matchesStage = filterStage === "all" || lead.stage.toLowerCase() === filterStage;
    
//     return matchesSearch && matchesPriority && matchesStage;
//   });

//   return (
//     <div className="min-h-screen bg-gray-50 px-3 sm:px-4 py-4 sm:py-6 lg:px-8">
//       <div className="mx-auto max-w-7xl">
//         {/* Header */}
//         <div className="mb-4 sm:mb-6 lg:mb-8">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
//             <div>
//               <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Portfolio Leads</h1>
//             <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500">View and manage all portfolio inquiries</p>
//           </div>
//             <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
//               <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center gap-1.5 sm:gap-2">
//                 <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
//                 <span className="text-xs sm:text-sm text-gray-600">Total: </span>
//                 <span className="font-semibold text-gray-900 text-xs sm:text-sm">{leads.length}</span>
//               </div>
//               <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-green-50 rounded-lg border border-green-200">
//                 <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
//                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
//                   <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-green-500" />
//                 </span>
//                 <span className="text-[10px] sm:text-xs font-medium text-green-700">Live</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           {/* Search and Filter Bar */}
//           <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
//             <div className="flex flex-col gap-3 sm:gap-4">
//               <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
//                 <div className="relative flex-1">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
//                   <input
//                     type="text"
//                     placeholder="Search by name, email, or project..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
//                   />
//                 </div>
//                 <button
//                   onClick={() => setShowFilters(!showFilters)}
//                   className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
//                 >
//                   <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//                   <span className="hidden xs:inline">Filters</span>
//                   <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
//                 </button>
//               </div>

//               {/* Filter Options */}
//               {showFilters && (
//                 <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-gray-100">
//                   <div>
//                     <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1">Priority</label>
//                     <select
//                       value={filterPriority}
//                       onChange={(e) => setFilterPriority(e.target.value)}
//                       className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
//                     >
//                       <option value="all">All Priorities</option>
//                       <option value="high">High</option>
//                       <option value="medium">Medium</option>
//                       <option value="low">Low</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1">Stage</label>
//                     <select
//                       value={filterStage}
//                       onChange={(e) => setFilterStage(e.target.value)}
//                       className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
//                     >
//                       <option value="all">All Stages</option>
//                       <option value="proposal sent">Proposal Sent</option>
//                       <option value="negotiation">Negotiation</option>
//                       <option value="closed">Closed</option>
//                       <option value="lost">Lost</option>
//                     </select>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {loading ? (
//             <div className="grid grid-cols-1 gap-3 sm:gap-4 p-3 sm:p-4 lg:p-6">
//               {[1, 2, 3, 4].map((skeleton) => (
//                 <div key={skeleton} className="animate-pulse rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-5 space-y-3">
//                   <div className="flex items-start justify-between">
//                     <div className="space-y-2 flex-1">
//                       <div className="h-5 sm:h-6 w-1/3 rounded bg-gray-200" />
//                       <div className="h-3 sm:h-4 w-1/2 rounded bg-gray-200" />
//                     </div>
//                     <div className="flex gap-1.5 sm:gap-2">
//                       <div className="h-5 sm:h-6 w-16 sm:w-20 rounded-full bg-gray-200" />
//                       <div className="h-5 sm:h-6 w-16 sm:w-20 rounded-full bg-gray-200" />
//                     </div>
//                   </div>
//                   <div className="flex flex-wrap gap-1.5 sm:gap-2">
//                     <div className="h-3 sm:h-4 w-24 sm:w-32 rounded bg-gray-200" />
//                     <div className="h-3 sm:h-4 w-20 sm:w-28 rounded bg-gray-200" />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : filteredLeads.length === 0 ? (
//             <div className="text-center py-12 sm:py-16">
//               <div className="flex justify-center mb-3 sm:mb-4">
//                 <div className="rounded-full bg-blue-50 p-3 sm:p-4 border border-blue-200">
//                   <FolderOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
//                 </div>
//               </div>
//               <h3 className="text-base sm:text-lg font-semibold text-gray-900">
//                 {searchTerm || filterPriority !== "all" || filterStage !== "all" ? "No Results Found" : "No Portfolio Leads"}
//               </h3>
//               <p className="mt-1 text-xs sm:text-sm text-gray-500 px-4">
//                 {searchTerm || filterPriority !== "all" || filterStage !== "all"
//                   ? "Try adjusting your search or filter terms"
//                   : "No portfolio inquiries found in the system."}
//               </p>
//             </div>
//           ) : (
//             <div className="p-3 sm:p-4 lg:p-6">
//               {/* Desktop Table View */}
//               <div className="hidden lg:block overflow-hidden rounded-lg border border-gray-200">
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
//                         <th className="px-4 py-3 text-left">#</th>
//                         <th className="px-4 py-3 text-left">Client Name</th>
//                         <th className="px-4 py-3 text-left">Email</th>
//                         <th className="px-4 py-3 text-left">Project Title</th>
//                         <th className="px-4 py-3 text-left">Priority</th>
//                         <th className="px-4 py-3 text-left">Stage</th>
//                         <th className="px-4 py-3 text-left">Date</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-100">
//                       {filteredLeads.map((lead, index) => (
//                         <tr key={lead.id} onClick={() => openDetails(lead)} className="cursor-pointer hover:bg-gray-50 transition-colors">
//                           <td className="px-4 py-3 text-sm font-medium text-gray-500">
//                             {index + 1}
//                           </td>
//                           <td className="px-4 py-3">
//                             <div className="flex items-center gap-2">
//                               <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white shadow-sm flex-shrink-0">
//                                 {lead.clientName.charAt(0)}
//                               </div>
//                               <span className="font-medium text-gray-900 truncate max-w-[120px]">
//                                 {lead.clientName}
//                               </span>
//                             </div>
//                           </td>
//                           <td className="px-4 py-3">
//                             <a
//                               href={`mailto:${lead.keyContact}`}
//                               onClick={(e) => e.stopPropagation()}
//                               className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[150px]"
//                             >
//                               <Mail className="h-3.5 w-3.5 flex-shrink-0" />
//                               <span className="truncate">{lead.keyContact}</span>
//                             </a>
//                           </td>
//                           <td className="px-4 py-3">
//                             <span className="flex items-center gap-1.5 text-gray-700 truncate max-w-[150px]">
//                               <FolderOpen className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
//                               <span className="truncate">{lead.projectScope}</span>
//                             </span>
//                           </td>
//                           <td className="px-4 py-3">
//                             <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border whitespace-nowrap ${getPriorityColor(lead.priority)}`}>
//                               {lead.priority}
//                             </span>
//                           </td>
//                           <td className="px-4 py-3">
//                             <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border whitespace-nowrap ${getStageColor(lead.stage)}`}>
//                               {lead.stage}
//                             </span>
//                           </td>
//                           <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
//                             {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN", {
//                               day: "2-digit",
//                               month: "short",
//                               year: "numeric"
//                             }) : "N/A"}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               {/* Tablet View */}
//               <div className="hidden sm:block lg:hidden">
//                 <div className="space-y-3">
//                   {filteredLeads.map((lead, index) => (
//                     <div key={lead.id} onClick={() => openDetails(lead)} role="button" className="cursor-pointer rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
//                       <div className="flex items-start justify-between">
//                         <div className="flex items-center gap-3 flex-1 min-w-0">
//                           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white shadow-sm flex-shrink-0">
//                             {lead.clientName.charAt(0)}
//                           </div>
//                           <div className="min-w-0 flex-1">
//                             <h3 className="font-semibold text-gray-900 truncate">
//                               {lead.clientName}
//                             </h3>
//                             <a
//                               href={`mailto:${lead.keyContact}`}
//                               onClick={(e) => e.stopPropagation()}
//                               className="flex items-center gap-1 text-sm text-blue-600 hover:underline truncate"
//                             >
//                               <Mail className="h-3.5 w-3.5 flex-shrink-0" />
//                               <span className="truncate">{lead.keyContact}</span>
//                             </a>
//                           </div>
//                         </div>
//                         <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
//                           <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border whitespace-nowrap ${getPriorityColor(lead.priority)}`}>
//                             {lead.priority}
//                           </span>
//                           <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border whitespace-nowrap ${getStageColor(lead.stage)}`}>
//                             {lead.stage}
//                           </span>
//                         </div>
//                       </div>

//                       <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
//                         <div className="flex items-center gap-1.5 text-gray-600 min-w-0">
//                           <FolderOpen className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
//                           <span className="truncate">{lead.projectScope}</span>
//                         </div>
//                         <div className="flex items-center gap-1.5 text-gray-500">
//                           <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
//                           <span className="text-xs truncate">
//                             {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN") : "N/A"}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Mobile Card View */}
//               <div className="sm:hidden space-y-3">
//                 {filteredLeads.map((lead, index) => (
//                   <div key={lead.id} onClick={() => openDetails(lead)} role="button" className="cursor-pointer rounded-xl border border-gray-200 p-3 hover:shadow-md transition-shadow">
//                     <div className="flex items-start justify-between">
//                       <div className="flex items-center gap-2.5 flex-1 min-w-0">
//                         <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white shadow-sm flex-shrink-0">
//                           {lead.clientName.charAt(0)}
//                         </div>
//                         <div className="min-w-0 flex-1">
//                           <h3 className="font-semibold text-gray-900 text-sm truncate">
//                             {lead.clientName}
//                           </h3>
//                           <p className="text-xs text-gray-500 truncate">{lead.projectScope}</p>
//                         </div>
//                       </div>
//                       <div className="flex flex-col items-end gap-0.5 ml-1 flex-shrink-0">
//                         <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${getPriorityColor(lead.priority)}`}>
//                           {lead.priority}
//                         </span>
//                         <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${getStageColor(lead.stage)}`}>
//                           {lead.stage}
//                         </span>
//                       </div>
//                     </div>

//                     <div className="mt-2.5 pt-2.5 border-t border-gray-100">
//                       <div className="flex items-center justify-between text-xs">
//                         <a
//                           href={`mailto:${lead.keyContact}`}
//                           onClick={(e) => e.stopPropagation()}
//                           className="flex items-center gap-1 text-blue-600 hover:underline truncate max-w-[60%]"
//                         >
//                           <Mail className="h-3 w-3 flex-shrink-0" />
//                           <span className="truncate">{lead.keyContact}</span>
//                         </a>
//                         <span className="flex items-center gap-1 text-gray-500 text-[10px]">
//                           <Clock className="h-3 w-3 text-gray-400" />
//                           {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN") : "N/A"}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//               {showModal && selectedLead && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center">
//                   <div className="absolute inset-0 bg-black opacity-40" onClick={closeModal} />
//                   <div className="relative bg-white rounded-lg shadow-lg w-full max-w-xl mx-4 p-4">
//                     <div className="flex justify-between items-start">
//                       <h3 className="text-lg font-semibold text-gray-900">Lead Details</h3>
//                       <button onClick={closeModal} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
//                     </div>
//                     <div className="mt-3 space-y-2 text-sm text-gray-700">
//                       <div><span className="font-medium">Client:</span> {selectedLead.clientName}</div>
//                       <div><span className="font-medium">Email:</span> <a href={`mailto:${selectedLead.keyContact}`} className="text-blue-600 hover:underline" onClick={(e)=>e.stopPropagation()}>{selectedLead.keyContact}</a></div>
//                       <div><span className="font-medium">Project:</span> {selectedLead.projectScope}</div>
//                       <div><span className="font-medium">Priority:</span> {selectedLead.priority}</div>
//                       <div><span className="font-medium">Stage:</span> {selectedLead.stage}</div>
//                       <div><span className="font-medium">Date:</span> {selectedLead.createdAt ? new Date(selectedLead.createdAt).toLocaleDateString("en-IN") : "N/A"}</div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { 
  Users, Mail, FolderOpen, Search, Filter, TrendingUp, Clock, ChevronDown, 
  X, Calendar, User, Briefcase, Tag, AlertCircle, CheckCircle, MessageCircle,
  Phone, MapPin, Building, Star, Award
} from "lucide-react";

export default function PortfolioLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStage, setFilterStage] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(
        "https://kt-backend-1.onrender.com/api/portfolio/get"
      );
      const data = await res.json();

      if (data.success) {
        const formattedData = data.data.map((item) => ({
          id: item._id,
          clientName: item.fullName || "N/A",
          keyContact: item.email || "N/A",
          projectScope: item.projectTitle || "N/A",
          stage: "Proposal Sent",
          priority: "High",
          createdAt: item.createdAt,
          phone: item.phone || "N/A",
          company: item.company || "N/A",
          message: item.message || "No message provided",
          estimatedValue: "₹5,00,000",
        }));

        setLeads(formattedData);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLead(null);
    document.body.style.overflow = 'auto';
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStageColor = (stage) => {
    switch (stage?.toLowerCase()) {
      case "proposal sent":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "negotiation":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "closed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "lost":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.keyContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.projectScope.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filterPriority === "all" || lead.priority.toLowerCase() === filterPriority;
    const matchesStage = filterStage === "all" || lead.stage.toLowerCase() === filterStage;
    
    return matchesSearch && matchesPriority && matchesStage;
  });

  return (
    <div className="min-h-screen bg-gray-50 px-3 sm:px-4 py-4 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Portfolio Leads</h1>
          </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center gap-1.5 sm:gap-2">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-600">Total: </span>
                <span className="font-semibold text-gray-900 text-xs sm:text-sm">{leads.length}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-green-50 rounded-lg border border-green-200">
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-green-500" />
                </span>
                <span className="text-[10px] sm:text-xs font-medium text-green-700">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Search and Filter Bar */}
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or project..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
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
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1">Priority</label>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1">Stage</label>
                    <select
                      value={filterStage}
                      onChange={(e) => setFilterStage(e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                    >
                      <option value="all">All Stages</option>
                      <option value="proposal sent">Proposal Sent</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="closed">Closed</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 p-3 sm:p-4 lg:p-6">
              {[1, 2, 3, 4].map((skeleton) => (
                <div key={skeleton} className="animate-pulse rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-5 sm:h-6 w-1/3 rounded bg-gray-200" />
                      <div className="h-3 sm:h-4 w-1/2 rounded bg-gray-200" />
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                      <div className="h-5 sm:h-6 w-16 sm:w-20 rounded-full bg-gray-200" />
                      <div className="h-5 sm:h-6 w-16 sm:w-20 rounded-full bg-gray-200" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <div className="h-3 sm:h-4 w-24 sm:w-32 rounded bg-gray-200" />
                    <div className="h-3 sm:h-4 w-20 sm:w-28 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="rounded-full bg-blue-50 p-3 sm:p-4 border border-blue-200">
                  <FolderOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {searchTerm || filterPriority !== "all" || filterStage !== "all" ? "No Results Found" : "No Portfolio Leads"}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 px-4">
                {searchTerm || filterPriority !== "all" || filterStage !== "all"
                  ? "Try adjusting your search or filter terms"
                  : "No portfolio inquiries found in the system."}
              </p>
            </div>
          ) : (
            <div className="p-3 sm:p-4 lg:p-6">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-hidden rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">Client Name</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Project Title</th>
                        <th className="px-4 py-3 text-left">Priority</th>
                        <th className="px-4 py-3 text-left">Stage</th>
                        <th className="px-4 py-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredLeads.map((lead, index) => (
                        <tr key={lead.id} onClick={() => openDetails(lead)} className="cursor-pointer hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-500">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white shadow-sm flex-shrink-0">
                                {lead.clientName.charAt(0)}
                              </div>
                              <span className="font-medium text-gray-900 truncate max-w-[120px]">
                                {lead.clientName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <a
                              href={`mailto:${lead.keyContact}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[150px]"
                            >
                              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{lead.keyContact}</span>
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5 text-gray-700 truncate max-w-[150px]">
                              <FolderOpen className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{lead.projectScope}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border whitespace-nowrap ${getPriorityColor(lead.priority)}`}>
                              {lead.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border whitespace-nowrap ${getStageColor(lead.stage)}`}>
                              {lead.stage}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            }) : "N/A"}
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
                  {filteredLeads.map((lead, index) => (
                    <div key={lead.id} onClick={() => openDetails(lead)} role="button" className="cursor-pointer rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white shadow-sm flex-shrink-0">
                            {lead.clientName.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {lead.clientName}
                            </h3>
                            <a
                              href={`mailto:${lead.keyContact}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-sm text-blue-600 hover:underline truncate"
                            >
                              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{lead.keyContact}</span>
                            </a>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border whitespace-nowrap ${getPriorityColor(lead.priority)}`}>
                            {lead.priority}
                          </span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border whitespace-nowrap ${getStageColor(lead.stage)}`}>
                            {lead.stage}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600 min-w-0">
                          <FolderOpen className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{lead.projectScope}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-xs truncate">
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN") : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {filteredLeads.map((lead, index) => (
                  <div key={lead.id} onClick={() => openDetails(lead)} role="button" className="cursor-pointer rounded-xl border border-gray-200 p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white shadow-sm flex-shrink-0">
                          {lead.clientName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {lead.clientName}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">{lead.projectScope}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 ml-1 flex-shrink-0">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${getPriorityColor(lead.priority)}`}>
                          {lead.priority}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${getStageColor(lead.stage)}`}>
                          {lead.stage}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <a
                          href={`mailto:${lead.keyContact}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-blue-600 hover:underline truncate max-w-[60%]"
                        >
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{lead.keyContact}</span>
                        </a>
                        <span className="flex items-center gap-1 text-gray-500 text-[10px]">
                          <Clock className="h-3 w-3 text-gray-400" />
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN") : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Properly Designed Modal */}
      {showModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between z-10 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-500/30 flex-shrink-0">
                  {selectedLead.clientName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedLead.clientName}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getPriorityColor(selectedLead.priority)}`}>
                      {selectedLead.priority}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStageColor(selectedLead.stage)}`}>
                      {selectedLead.stage}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Email</span>
                  </div>
                  <a 
                    href={`mailto:${selectedLead.keyContact}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline break-all"
                  >
                    {selectedLead.keyContact}
                  </a>
                </div>

                {selectedLead.phone && selectedLead.phone !== "N/A" && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <Phone className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Phone</span>
                    </div>
                    <a 
                      href={`tel:${selectedLead.phone}`}
                      className="text-sm font-medium text-gray-900 hover:text-green-600 hover:underline"
                    >
                      {selectedLead.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <FolderOpen className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Project</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{selectedLead.projectScope}</p>
                </div>

                {selectedLead.company && selectedLead.company !== "N/A" && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <Building className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Company</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{selectedLead.company}</p>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Award className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Estimated Value</span>
                  </div>
                  <p className="text-sm font-bold text-purple-700">{selectedLead.estimatedValue || "N/A"}</p>
                </div>

                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Received On</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedLead.createdAt ? new Date(selectedLead.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric"
                    }) : "N/A"}
                  </p> 
                </div>
              </div>

              {/* Message */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-500 mb-3">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Message</span>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedLead.message || "No message provided"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={`mailto:${selectedLead.keyContact}`}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Mail className="h-4 w-4" />
                  Send Email
                </a>
                {selectedLead.phone && selectedLead.phone !== "N/A" && (
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Phone className="h-4 w-4" />
                    Call Client
                  </a>
                )}
                <button
                  onClick={closeModal}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <X className="h-4 w-4" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}