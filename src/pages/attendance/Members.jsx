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
  BadgeCheck,
  Loader2,
  FolderOpen,
  FileText
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

const PROJECT_API_BASE = 'https://kt-backend-1.onrender.com/api/projectManage';

const normalizeArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.projects)) return payload.projects;
  if (Array.isArray(payload.tasks)) return payload.tasks;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.dailyUpdates)) return payload.dailyUpdates;
  if (Array.isArray(payload.updates)) return payload.updates;
  return [];
};

const getMemberIdentityValues = (member = {}) => {
  const candidates = [
    member?.id,
    member?._id,
    member?.employeeId,
    member?.userId,
    member?.email,
  ].filter(Boolean);

  return candidates
    .map((value) => String(value).trim().toLowerCase())
    .filter(Boolean);
};

const hasMemberMatch = (value, member) => {
  if (!value || !member) return false;

  if (Array.isArray(value)) {
    return value.some((item) => hasMemberMatch(item, member));
  }

  const memberIds = getMemberIdentityValues(member);

  if (typeof value === 'object') {
    const objectIds = [
      value?._id,
      value?.id,
      value?.userId,
      value?.employeeId,
      value?.userID,
    ]
      .filter(Boolean)
      .map((id) => String(id).trim().toLowerCase());

    return objectIds.some((id) => memberIds.includes(id));
  }

  const valueId = String(value).trim().toLowerCase();

  return memberIds.includes(valueId);
};

const projectMatchesMember = (project, member) => {
  if (!project || !member) return false;

  const fields = [
    // Team Lead
    project?.teamLeadUser,
    project?.teamLeadEmployee,
    project?.teamLead,

    // Members
    project?.employees,
    project?.interns,

    // Other possible fields
    project?.assignedEmployee,
    project?.assignedTL,
    project?.assignedIntern,
    project?.createdBy,
    project?.projectLead,
    project?.members,
    project?.projectMembers,
    project?.assignedTo,
    project?.employee,
    project?.user
  ];

  return fields.some((field) => hasMemberMatch(field, member));
};

const taskMatchesMember = (task, member) => {
  if (!task || !member) return false;

  const fields = [
    task?.assignedTo,
    task?.assignedEmployee,
    task?.assignedIntern,
    task?.assignedTeamLeadUser,
    task?.assignedTeamLeadEmployee,
    task?.employee,
    task?.user,
    task?.assignedUser,
    task?.assignee
  ];

  return fields.some((field) => hasMemberMatch(field, member));
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
  const [memberInsights, setMemberInsights] = useState({ projects: [], tasks: [], dailyUpdates: [] });
  const [memberInsightsLoading, setMemberInsightsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAllMembers = async () => {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const usersRes = await fetch('https://kt-backend-1.onrender.com/api/users/all', { headers });

        if (!usersRes.ok) throw new Error('Failed to fetch users');

        const usersData = await usersRes.json();
        const usersList = usersData?.users || usersData?.data || usersData || [];

        const formatDate = (dateStr) => {
          if (!dateStr) return 'N/A';
          const date = new Date(dateStr);
          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-GB');
        };

        const allMembers = usersList
          .filter((user) => {
            const role = String(user?.role || user?.userRole || '').toLowerCase().trim();
            return role && role !== 'admin';
          })
          .map((user, index) => {
            const role = String(user?.role || user?.userRole || '').toLowerCase().trim();
            const roleType = role === 'intern'
              ? 'intern'
              : role === 'teamlead' || role === 'team lead' || role === 'team_lead' || role === 'tl'
              ? 'tl'
              : 'employee';

            const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'Unnamed User';

            let designation = roleType === 'intern'
              ? 'Intern'
              : roleType === 'tl'
              ? 'Team Lead'
              : 'Employee';

            if (typeof user?.designation === 'object' && user?.designation?.designationName) {
              designation = user.designation.designationName;
            } else if (user?.designationName) {
              designation = user.designationName;
            } else if (user?.designation) {
              designation = typeof user.designation === 'string' ? user.designation : designation;
            }

            let department = 'Unassigned';
            if (typeof user?.department === 'object' && user?.department?.departmentName) {
              department = user.department.departmentName;
            } else if (user?.departmentName) {
              department = user.departmentName;
            } else if (user?.department) {
              department = typeof user.department === 'string' ? user.department : 'Unassigned';
            }

            return {
              id: user?._id || user?.id || `${roleType}-${index}`,
              employeeId: user?.employeeID || user?.employeeId || `${roleType.toUpperCase()}${String(index + 1).padStart(4, '0')}`,
              name: fullName,
              email: user?.email || 'No email',
              mobile: user?.mobile || 'N/A',
              gender: user?.gender || 'N/A',
              dob: formatDate(user?.dob || user?.dateOfBirth),
              bloodGroup: user?.bloodGroup || 'N/A',
              currentAddress: user?.currentAddress || 'N/A',
              permanentAddress: user?.permanentAddress || 'N/A',
              designation,
              department,
              status: user?.employeeStatus || user?.status || 'Active',
              currentAction: user?.currentAction || 'Available',
              skills: Array.isArray(user?.skills) ? user.skills : [],
              initials: getInitials(fullName),
              avatarColor: getAvatarColor(index),
              joiningDate: formatDate(user?.joiningDate),
              roleType
            };
          });
        
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

  const resolveTeamMemberDetails = async (memberIds, allMembers, token) => {
  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    return [];
  }

  return memberIds
    .map((id) => {
      if (!id) return null;

      const projectMemberId = String(
        id?._id ||
        id?.id ||
        id?.userId ||
        id?.userID ||
        id
      )
        .trim()
        .toLowerCase();

      return allMembers.find((member) => {
        const memberIds = [
          member?.id,
          member?._id,
          member?.userId,
          member?.employeeId
        ]
          .filter(Boolean)
          .map((x) => String(x).trim().toLowerCase());

        return memberIds.includes(projectMemberId);
      });
    })
    .filter(Boolean);
};

  const handleMemberClick = async (member) => {
    setSelectedMember(member);
    setShowDetailModal(true);
    setMemberInsightsLoading(true);
    setMemberInsights({ projects: [], tasks: [], dailyUpdates: [] });

    const memberIdentifier = member?.id || member?.employeeId || member?.email || member?.name || '';
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const projectsPromise = fetch(
        `${PROJECT_API_BASE}/project/all`,
        { headers }
      ).then(async (response) => {
        if (!response.ok) return [];

        const payload = await response.json();

        return normalizeArrayPayload(payload)
          .filter((project) => projectMatchesMember(project, member));
      });

      const tasksPromise = memberIdentifier
        ? fetch(`${PROJECT_API_BASE}/task/employee/${encodeURIComponent(memberIdentifier)}`, { headers }).then(async (response) => {
            if (!response.ok) return [];
            const payload = await response.json();
            return normalizeArrayPayload(payload).filter((task) => taskMatchesMember(task, member));
          })
        : Promise.resolve([]);

      const [projects, tasks] = await Promise.all([projectsPromise, tasksPromise]);

      const enrichedProjects = await Promise.all(
        projects.map(async (project) => {
          const tlIds = Array.isArray(project?.teamLead) ? project.teamLead : project?.teamLead ? [project.teamLead] : [];
          const empIds = Array.isArray(project?.employees) ? project.employees : project?.employees ? [project.employees] : [];
          const internIds = Array.isArray(project?.interns) ? project.interns : project?.interns ? [project.interns] : [];

          const teamLeads = await resolveTeamMemberDetails(tlIds, members, token);
          const employees = await resolveTeamMemberDetails(empIds, members, token);
          const interns = await resolveTeamMemberDetails(internIds, members, token);

          return {
            ...project,
            resolvedTeamLeads: teamLeads,
            resolvedEmployees: employees,
            resolvedInterns: interns
          };
        })
      );

      const dailyUpdates = [];
      if (tasks.length) {
        const updateResults = await Promise.all(tasks.map(async (task) => {
          const taskId = task?._id || task?.id || task?.taskId;
          if (!taskId) return [];

          try {
            const response = await fetch(`${PROJECT_API_BASE}/daily-update/${taskId}`, { headers });
            if (!response.ok) return [];
            const payload = await response.json();
            return normalizeArrayPayload(payload).map((update) => ({
              ...update,
              taskTitle: task?.taskTitle || task?.title || 'Task'
            }));
          } catch (err) {
            console.error('❌ Error fetching project updates:', err);
            return [];
          }
        }));

        updateResults.forEach((updates) => dailyUpdates.push(...updates));
      }

      setMemberInsights({
        projects: enrichedProjects.slice(0, 5),
        tasks: tasks.slice(0, 5),
        dailyUpdates: dailyUpdates
          .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0))
          .slice(0, 5)
      });
    } catch (err) {
      console.error('❌ Error fetching member project insights:', err);
      setMemberInsights({ projects: [], tasks: [], dailyUpdates: [] });
    } finally {
      setMemberInsightsLoading(false);
    }
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
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedMember(null);
                  setMemberInsights({ projects: [], tasks: [], dailyUpdates: [] });
                }}
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pt-1">
                <div className="border border-slate-200 bg-slate-50/60 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <h3 className="text-[11px] font-bold text-slate-800">Assigned Projects</h3>
                  </div>

                  {memberInsightsLoading ? (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Loading projects...
                    </div>
                  ) : memberInsights.projects.length > 0 ? (
                    <ul className="space-y-2.5">
                      {memberInsights.projects.map((project, idx) => (
                        <li key={project?._id || project?.id || idx} className="text-[11px] text-slate-700 border border-slate-300 p-2 bg-white">
                          <div className="font-medium truncate mb-1.5">{project?.projectName || project?.name || 'Untitled Project'}</div>
                          <div className="text-[10px] text-slate-500 mb-1.5">{project?.status || 'In progress'} • Budget: {project?.projectBudget || 'N/A'}</div>
                          
                          {/* Team Leads */}
                          {project?.resolvedTeamLeads && project.resolvedTeamLeads.length > 0 && (
                            <div className="mb-1.5 pb-1.5 border-b border-slate-200">
                              <div className="text-[9px] font-semibold text-amber-700 mb-1">Team Leads:</div>
                              <div className="flex flex-wrap gap-1">
                                {project.resolvedTeamLeads.map((tl) => (
                                  <span key={tl?.id} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-medium border border-amber-200">
                                    <Star className="w-2.5 h-2.5" />
                                    {tl?.name || 'TL'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Employees */}
                          {project?.resolvedEmployees && project.resolvedEmployees.length > 0 && (
                            <div className="mb-1.5 pb-1.5 border-b border-slate-200">
                              <div className="text-[9px] font-semibold text-blue-700 mb-1">Employees:</div>
                              <div className="flex flex-wrap gap-1">
                                {project.resolvedEmployees.map((emp) => (
                                  <span key={emp?.id} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-medium border border-blue-200">
                                    <Building2 className="w-2.5 h-2.5" />
                                    {emp?.name || 'Employee'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Interns */}
                          {project?.resolvedInterns && project.resolvedInterns.length > 0 && (
                            <div>
                              <div className="text-[9px] font-semibold text-violet-700 mb-1">Interns:</div>
                              <div className="flex flex-wrap gap-1">
                                {project.resolvedInterns.map((intern) => (
                                  <span key={intern?.id} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-violet-50 text-violet-700 text-[9px] font-medium border border-violet-200">
                                    <BookOpen className="w-2.5 h-2.5" />
                                    {intern?.name || 'Intern'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-slate-500">No assigned projects found.</p>
                  )}
                </div>

                <div className="border border-slate-200 bg-slate-50/60 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <h3 className="text-[11px] font-bold text-slate-800">Assigned Tasks</h3>
                  </div>

                  {memberInsightsLoading ? (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Loading tasks...
                    </div>
                  ) : memberInsights.tasks.length > 0 ? (
                    <ul className="space-y-1.5">
                      {memberInsights.tasks.map((task, idx) => (
                        <li key={task?._id || task?.id || idx} className="text-[11px] text-slate-700">
                          <div className="font-medium truncate">{task?.taskTitle || task?.title || 'Untitled Task'}</div>
                          <div className="text-[10px] text-slate-500">{task?.status || 'Pending'} • {task?.progress || 0}%</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-slate-500">No assigned tasks found.</p>
                  )}
                </div>

                <div className="border border-slate-200 bg-slate-50/60 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Activity className="w-3.5 h-3.5 text-indigo-500" />
                    <h3 className="text-[11px] font-bold text-slate-800">Daily Reports</h3>
                  </div>

                  {memberInsightsLoading ? (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Loading reports...
                    </div>
                  ) : memberInsights.dailyUpdates.length > 0 ? (
                    <ul className="space-y-1.5">
                      {memberInsights.dailyUpdates.map((update, idx) => (
                        <li key={update?._id || update?.id || idx} className="text-[11px] text-slate-700">
                          <div className="font-medium truncate">{update?.taskTitle || 'Task update'}</div>
                          <div className="text-[10px] text-slate-500">{update?.message || update?.description || 'No details provided'}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-slate-500">No daily reports found.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  ); 
}