import { useEffect, useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Briefcase, 
  Clock, 
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Activity,
  Calendar,
  X,
  Phone,
  MapPin,
  Award,
  BookOpen,
  Smile,
  Star,
  Building2,
  BadgeCheck
} from 'lucide-react';

const avatarColors = [
  'from-indigo-500 to-indigo-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-emerald-500 to-emerald-600',
  'from-sky-500 to-sky-600',
  'from-purple-500 to-purple-600',
  'from-pink-500 to-pink-600',
  'from-teal-500 to-teal-600'
];

const getAvatarColor = (index) => avatarColors[index % avatarColors.length];

const getInitials = (name) => {
  const words = name.split(' ').filter(Boolean);
  if (words.length === 0) return 'EM';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

const getStatusStyle = (status) => {
  const normalizedStatus = (status || '').toLowerCase();
  
  const statusMap = {
    'active': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', label: 'Active' },
    'active now': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', label: 'Active Now' },
    'inactive': { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400', label: 'Inactive' },
    'on leave': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', label: 'On Leave' },
    'remote': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400', label: 'Remote' },
    'busy': { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-400', label: 'Busy' },
  };
  
  return statusMap[normalizedStatus] || { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400', label: status || 'Unknown' };
};

const getPunctualityIcon = (status) => {
  const normalized = (status || '').toLowerCase();
  if (normalized.includes('online') || normalized.includes('active') || normalized.includes('probation')) return <Activity className="w-3 h-3 text-emerald-500" />;
  if (normalized.includes('away') || normalized.includes('break')) return <Clock className="w-3 h-3 text-amber-500" />;
  if (normalized.includes('offline') || normalized.includes('inactive')) return <UserX className="w-3 h-3 text-slate-400" />;
  return <UserCheck className="w-3 h-3 text-blue-500" />;
};

const getAttendanceStatusStyle = (status) => {
  const normalized = (status || '').toLowerCase();

  if (normalized.includes('present') || normalized.includes('active') || normalized.includes('on time')) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' };
  }

  if (normalized.includes('late')) {
    return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' };
  }

  if (normalized.includes('absent') || normalized.includes('leave')) {
    return { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-400' };
  }

  if (normalized.includes('half')) {
    return { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-400' };
  }

  return { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' };
};

const normalizeAttendanceRecords = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.attendance)) return payload.attendance;
  if (Array.isArray(payload.logs)) return payload.logs;
  if (Array.isArray(payload.records)) return payload.records;
  return [];
};

const getAttendanceStatusText = (record) => {
  const rawStatus = record?.status || record?.attendanceStatus || record?.currentStatus || record?.state || record?.attendance?.status || '';
  return rawStatus ? String(rawStatus).trim() : 'No status';
};

const getAttendanceName = (record) => {
  const candidates = [
    record?.employeeName,
    record?.name,
    record?.employee?.name,
    record?.employee?.fullName,
    record?.user?.name,
    record?.user?.fullName,
    [record?.employee?.firstName, record?.employee?.lastName].filter(Boolean).join(' '),
    [record?.user?.firstName, record?.user?.lastName].filter(Boolean).join(' '),
  ];

  return candidates.find(Boolean) || '';
};

const getAttendanceEmail = (record) => {
  return record?.email || record?.employee?.email || record?.user?.email || '';
};

const getAttendanceId = (record) => {
  return record?.employeeID || record?.employeeId || record?.employee?._id || record?.user?._id || record?.employee?._id || record?.id || record?._id || '';
};

const isAttendanceMatch = (member, record) => {
  const memberId = String(member?.employeeId || member?.id || '').trim().toLowerCase();
  const recordId = String(getAttendanceId(record)).trim().toLowerCase();

  if (memberId && recordId && memberId === recordId) return true;

  const memberEmail = String(member?.email || '').trim().toLowerCase();
  const recordEmail = String(getAttendanceEmail(record)).trim().toLowerCase();
  if (memberEmail && recordEmail && memberEmail === recordEmail) return true;

  const memberName = String(member?.name || '').trim().toLowerCase();
  const recordName = String(getAttendanceName(record)).trim().toLowerCase();

  if (!memberName || !recordName) return false;
  return memberName === recordName || recordName.includes(memberName) || memberName.includes(recordName);
};

export default function Members() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [attendanceStatusMap, setAttendanceStatusMap] = useState({});

  useEffect(() => {
    let isMounted = true;

    const fetchAllMembers = async () => {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [usersRes, teamLeadRes, employeeRes] = await Promise.all([
          fetch('https://kt-backend-1.onrender.com/api/users/all', { headers }),
          fetch('https://kt-backend-1.onrender.com/api/teamLead/team', { headers }),
          fetch('https://kt-backend-1.onrender.com/api/employee/list', { headers })
        ]);

        if (!usersRes.ok) throw new Error('Failed to fetch users');
        if (!teamLeadRes.ok) throw new Error('Failed to fetch team leads');
        if (!employeeRes.ok) throw new Error('Failed to fetch employees');

        const usersData = await usersRes.json();
        const teamLeadData = await teamLeadRes.json();
        const employeeData = await employeeRes.json();

        const usersList = usersData?.users || usersData?.data || usersData || [];
        const teamLeadsList = teamLeadData?.teamLeads || teamLeadData?.data || teamLeadData || [];
        const employeesList = employeeData?.employees || employeeData?.data || employeeData || [];

        const formatDate = (dateStr) => {
          if (!dateStr) return 'N/A';
          const date = new Date(dateStr);
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-GB');
        };

        const interns = usersList
          .filter(user => {
            const role = String(user?.role || '').toLowerCase();
            return role === 'intern';
          })
          .map((user, index) => {
            const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'Unnamed Intern';
            return {
              id: user?._id || user?.id || `intern-${index}`,
              employeeId: user?.employeeID || user?.employeeId || `INT${String(index + 1).padStart(4, '0')}`,
              name: fullName,
              email: user?.email || 'No email',
              mobile: user?.mobile || 'N/A',
              gender: user?.gender || 'N/A',
              dob: formatDate(user?.dob || user?.dateOfBirth),
              bloodGroup: user?.bloodGroup || 'N/A',
              currentAddress: user?.currentAddress || 'N/A',
              permanentAddress: user?.permanentAddress || 'N/A',
              designation: 'Intern',
              department: user?.department?.departmentName || user?.departmentName || 'Unassigned',
              status: user?.employeeStatus || user?.status || 'Active',
              currentAction: user?.currentAction || 'Available',
              skills: Array.isArray(user?.skills) ? user.skills : [],
              initials: getInitials(fullName),
              avatarColor: getAvatarColor(index),
              joiningDate: formatDate(user?.joiningDate),
              roleType: 'intern'
            };
          });

        const teamLeads = teamLeadsList
          .map((lead, index) => {
            const leadUser = lead?.teamLead || lead?.user || lead;
            const fullName = [leadUser?.firstName, leadUser?.lastName].filter(Boolean).join(' ') 
              || leadUser?.name || lead?.name || 'Unnamed TL';
            
            return {
              id: lead?._id || leadUser?._id || lead?.teamLeadId || `tl-${index}`,
              employeeId: leadUser?.employeeID || leadUser?.employeeId || lead?.employeeID || `TL${String(index + 1).padStart(4, '0')}`,
              name: fullName,
              email: leadUser?.email || lead?.email || 'No email',
              mobile: leadUser?.mobile || lead?.mobile || 'N/A',
              gender: leadUser?.gender || 'N/A',
              dob: formatDate(leadUser?.dob || leadUser?.dateOfBirth),
              bloodGroup: leadUser?.bloodGroup || 'N/A',
              currentAddress: leadUser?.currentAddress || lead?.currentAddress || 'N/A',
              permanentAddress: leadUser?.permanentAddress || lead?.permanentAddress || 'N/A',
              designation: 'Team Lead',
              department: lead?.department?.departmentName || leadUser?.department?.departmentName || leadUser?.departmentName || 'Unassigned',
              status: lead?.status || leadUser?.employeeStatus || 'Active',
              currentAction: lead?.currentAction || leadUser?.currentAction || 'Available',
              skills: Array.isArray(leadUser?.skills) ? leadUser.skills : [],
              initials: getInitials(fullName),
              avatarColor: getAvatarColor(index + interns.length),
              joiningDate: formatDate(leadUser?.joiningDate || lead?.joiningDate),
              roleType: 'tl'
            };
          });

        const employees = employeesList
          .filter(emp => {
            const isTeamLead = emp?.isTeamlead ?? emp?.isTeamLead ?? true;
            return isTeamLead === false || isTeamLead === 'false' || isTeamLead === 0 || isTeamLead === '0';
          })
          .map((emp, index) => {
            const fullName = [emp?.firstName, emp?.lastName].filter(Boolean).join(' ') || emp?.name || 'Unnamed Employee';
            
            let designation = 'Employee';
            if (typeof emp?.designation === 'object' && emp?.designation?.designationName) {
              designation = emp.designation.designationName;
            } else if (emp?.designationName) {
              designation = emp.designationName;
            } else if (emp?.designation) {
              designation = typeof emp.designation === 'string' ? emp.designation : 'Employee';
            }

            let department = 'Unassigned';
            if (typeof emp?.department === 'object' && emp?.department?.departmentName) {
              department = emp.department.departmentName;
            } else if (emp?.departmentName) {
              department = emp.departmentName;
            } else if (emp?.department) {
              department = typeof emp.department === 'string' ? emp.department : 'Unassigned';
            }

            return {
              id: emp?._id || emp?.id || `emp-${index}`,
              employeeId: emp?.employeeID || emp?.employeeId || `EMP${String(index + 1).padStart(4, '0')}`,
              name: fullName,
              email: emp?.email || 'No email',
              mobile: emp?.mobile || 'N/A',
              gender: emp?.gender || 'N/A',
              dob: formatDate(emp?.dob || emp?.dateOfBirth),
              bloodGroup: emp?.bloodGroup || 'N/A',
              currentAddress: emp?.currentAddress || 'N/A',
              permanentAddress: emp?.permanentAddress || 'N/A',
              designation: designation,
              department: department,
              status: emp?.employeeStatus || emp?.status || 'Active',
              currentAction: emp?.currentAction || 'Available',
              skills: Array.isArray(emp?.skills) ? emp.skills : [],
              initials: getInitials(fullName),
              avatarColor: getAvatarColor(index + interns.length + teamLeads.length),
              joiningDate: formatDate(emp?.joiningDate),
              roleType: 'employee'
            };
          });

        const allMembers = [...interns, ...teamLeads, ...employees];
        
        if (isMounted) {
          setMembers(allMembers);
          setFilteredMembers(allMembers);
        }

      } catch (err) {
        console.error('❌ Error fetching members:', err);
        if (isMounted) {
          setError(err.message || 'Unable to load team members.');
          setMembers([]);
          setFilteredMembers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAllMembers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!members.length) {
      setAttendanceStatusMap({});
      return () => {
        isMounted = false;
      };
    }

    const fetchAttendanceStatuses = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('https://kt-backend-1.onrender.com/api/attendance/admin/all', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) return;

        const data = await response.json();
        const attendanceRecords = normalizeAttendanceRecords(data);

        const nextStatusMap = {};
        members.forEach((member) => {
          const matchedRecord = attendanceRecords.find((record) => isAttendanceMatch(member, record));
          nextStatusMap[member.id] = matchedRecord ? getAttendanceStatusText(matchedRecord) : '';
        });

        if (isMounted) {
          setAttendanceStatusMap(nextStatusMap);
        }
      } catch (err) {
        console.error('❌ Error fetching attendance status:', err);
      }
    };

    fetchAttendanceStatuses();

    return () => {
      isMounted = false;
    };
  }, [members]);

  useEffect(() => {
    let filtered = members;

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(member =>
        member.roleType === selectedRole
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(member =>
        String(member.status || '').toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    setFilteredMembers(filtered);
  }, [searchTerm, selectedRole, selectedStatus, members]);

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setShowDetailModal(true);
  };

  const roles = ['all', ...new Set(members.map(m => m.roleType))];
  const statuses = ['all', ...new Set(members.map(m => String(m.status || '').toLowerCase()))];

  const getRoleLabel = (role) => {
    const labels = {
      'intern': 'Interns',
      'tl': 'Team Leads',
      'employee': 'Employees',
      'all': 'All Roles'
    };
    return labels[role] || role;
  };

  const getRoleIcon = (roleType) => {
    const icons = {
      'intern': <BookOpen className="w-3.5 h-3.5" />,
      'tl': <Star className="w-3.5 h-3.5" />,
      'employee': <Building2 className="w-3.5 h-3.5" />
    };
    return icons[roleType] || <UserCheck className="w-3.5 h-3.5" />;
  };

  const getRoleBadgeStyle = (roleType) => {
    const styles = {
      'intern': 'bg-violet-50 text-violet-700 border-violet-300',
      'tl': 'bg-amber-50 text-amber-700 border-amber-300',
      'employee': 'bg-blue-50 text-blue-700 border-blue-300'
    };
    return styles[roleType] || 'bg-slate-50 text-slate-700 border-slate-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* Header Section */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 border shadow-lg shadow-indigo-500/20">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Team Members</h1>
              </div>
              <p className="text-[11px] sm:text-sm text-slate-500 ml-1">
                {filteredMembers.length} total • 
                <span className="text-violet-600 font-medium"> {members.filter(m => m.roleType === 'intern').length}</span> interns • 
                <span className="text-amber-600 font-medium"> {members.filter(m => m.roleType === 'tl').length}</span> leads • 
                <span className="text-blue-600 font-medium"> {members.filter(m => m.roleType === 'employee').length}</span> employees
              </p>
            </div>
          </div>
        </div>

        {/* Filters Section - Compact */}
        <div className="mb-4 flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full sm:w-36 pl-8 pr-7 py-1.5 text-sm border border-slate-300 focus:outline-none focus:ring-1 bg-white appearance-none cursor-pointer"
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {getRoleLabel(role)}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 sm:flex-none">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full sm:w-32 pl-8 pr-7 py-1.5 text-sm border border-slate-300 focus:outline-none focus:ring-1 bg-white appearance-none cursor-pointer"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="border border-slate-300 p-3 animate-pulse bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200"></div>
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-200 w-2/3"></div>
                    <div className="h-2.5 bg-slate-200 w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="border border-rose-300 bg-rose-50 px-3 py-2.5 text-rose-700 flex items-center gap-2 text-sm">
            <UserX className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="border border-slate-300 bg-white p-6 text-center">
            <Users className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
            <h3 className="text-sm font-semibold text-slate-900">No members found</h3>
            <p className="text-xs text-slate-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredMembers.map((member) => {
              const statusStyle = getStatusStyle(member.status);
              const attendanceStatus = attendanceStatusMap[member.id] || 'No status';
              const attendanceStatusStyle = getAttendanceStatusStyle(attendanceStatus);
              const roleBadgeStyle = getRoleBadgeStyle(member.roleType);
              
              return (
                <div
                  key={member.id}
                  onClick={() => handleMemberClick(member)}
                  className="group relative bg-white border border-slate-300 hover:border-indigo-400 p-3 transition-all hover:shadow-md cursor-pointer"
                >
                  <button className="absolute top-1.5 right-1.5 p-0.5 opacity-0 group-hover:opacity-100 hover:bg-slate-50">
                    <MoreVertical className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <div className="flex gap-3 items-start">
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 bg-gradient-to-br ${member.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                        {member.initials}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusStyle.dot} ring-2 ring-white`}></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="text-sm font-semibold text-slate-900 truncate max-w-[120px] sm:max-w-[140px]">
                          {member.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Briefcase className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{member.designation}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium border ${roleBadgeStyle}`}>
                          {getRoleIcon(member.roleType)}
                          {member.roleType === 'tl' ? 'Lead' : member.roleType === 'intern' ? 'Intern' : 'Employee'}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                          {member.status}
                        </span>
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium ${attendanceStatusStyle.bg} ${attendanceStatusStyle.text}`}>
                          {getPunctualityIcon(attendanceStatus)}
                          {attendanceStatus}
                        </span>
                      </div>
                    </div>

                    <div className="self-center p-0.5 text-slate-300 group-hover:text-indigo-600">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Member Detail Modal - Compact */}
      {showDetailModal && selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col border border-slate-300">
            
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-300 px-4 py-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 bg-gradient-to-br ${selectedMember.avatarColor} text-white flex items-center justify-center font-bold text-xs flex-shrink-0`}>
                  {selectedMember.initials}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-slate-900 truncate">{selectedMember.name}</h2>
                  <p className="text-[11px] text-slate-500 truncate">{selectedMember.designation}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-indigo-50/40 p-2 text-center border border-indigo-300">
                  <div className="text-xs font-bold text-indigo-700 truncate">{selectedMember.employeeId}</div>
                  <div className="text-[9px] text-slate-400 font-medium mt-0.5">ID</div>
                </div>
                <div className="bg-emerald-50/40 p-2 text-center border border-emerald-300">
                  <div className="text-xs font-bold text-emerald-700 capitalize truncate">{selectedMember.gender}</div>
                  <div className="text-[9px] text-slate-400 font-medium mt-0.5">Gender</div>
                </div>
                <div className="bg-amber-50/40 p-2 text-center border border-amber-300">
                  <div className="text-xs font-bold text-amber-700 uppercase truncate">{selectedMember.bloodGroup}</div>
                  <div className="text-[9px] text-slate-400 font-medium mt-0.5">Blood</div>
                </div>
                <div className="bg-rose-50/40 p-2 text-center border border-rose-300">
                  <div className="text-xs font-bold text-rose-700 capitalize truncate">{selectedMember.currentAction}</div>
                  <div className="text-[9px] text-slate-400 font-medium mt-0.5">Action</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-2">
                  <h3 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-300">
                    <Smile className="w-3.5 h-3.5 text-indigo-500" />
                    Personal Info
                  </h3>
                  
                  <div className="space-y-1.5">
                    <div className="flex gap-2 p-2 bg-slate-50/60 border border-slate-200 items-center">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] text-slate-400">Email</div>
                        <div className="text-xs font-medium text-slate-700 truncate">{selectedMember.email}</div>
                      </div>
                    </div>

                    <div className="flex gap-2 p-2 bg-slate-50/60 border border-slate-200 items-center">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[9px] text-slate-400">Mobile</div>
                        <div className="text-xs font-medium text-slate-700 truncate">{selectedMember.mobile}</div>
                      </div>
                    </div>

                    <div className="flex gap-2 p-2 bg-slate-50/60 border border-slate-200 items-center">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[9px] text-slate-400">DOB</div>
                        <div className="text-xs font-medium text-slate-700">{selectedMember.dob}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-300">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                    Work Details
                  </h3>
                  
                  <div className="space-y-1.5">
                    <div className="flex gap-2 p-2 bg-slate-50/60 border border-slate-200 items-center">
                      <Award className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[9px] text-slate-400">Role</div>
                        <div className="text-xs font-medium text-slate-700 truncate">{selectedMember.designation}</div>
                      </div>
                    </div>

                    <div className="flex gap-2 p-2 bg-slate-50/60 border border-slate-200 items-start">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-[9px] text-slate-400">Address</div>
                        <div className="text-xs font-medium text-slate-700 leading-tight truncate">{selectedMember.currentAddress}</div>
                      </div>
                    </div>

                    <div className="flex gap-2 p-2 bg-slate-50/60 border border-slate-200 items-center">
                      <Activity className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <div className="text-[9px] text-slate-400">Joined</div>
                          <div className="text-xs font-medium text-slate-700">{selectedMember.joiningDate}</div>
                        </div>
                        <div className="flex gap-1">
                          <span className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium ${getStatusStyle(selectedMember.status).bg} ${getStatusStyle(selectedMember.status).text}`}>
                            {selectedMember.status}
                          </span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium ${getAttendanceStatusStyle(attendanceStatusMap[selectedMember.id] || 'No status').bg} ${getAttendanceStatusStyle(attendanceStatusMap[selectedMember.id] || 'No status').text}`}>
                            {attendanceStatusMap[selectedMember.id] || 'No status'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {selectedMember.skills && selectedMember.skills.length > 0 && (
                <div className="pt-1">
                  <h3 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedMember.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-medium border border-indigo-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  ); 
}