import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Calendar,
  Clock,
  User,
  Users, 
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  FolderOpen,
  FileText,
  BarChart3,
  Target,
  ListTodo,
  MessageSquare
} from "lucide-react";

const BASE_URL =
  "https://kt-backend-1.onrender.com/api/projectManage/project";

const API_CORE = BASE_URL.replace(/\/project$/, "");

const EMPLOYEE_URL = 
  "https://kt-backend-1.onrender.com/api/employee/list"; 

const USER_URL =
  "https://kt-backend-1.onrender.com/api/users/all";

const MILESTONE_BASE_URL =
  "https://kt-backend-1.onrender.com/api/projectManage/milestones";

const MILESTONE_URL = `${MILESTONE_BASE_URL}/all`;

const TASK_URL =
  "https://kt-backend-1.onrender.com/api/projectManage/task";

const TEAM_LEAD_URL =
  "https://kt-backend-1.onrender.com/api/teamLead/team";

export default function Team() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [teamLeadOptions, setTeamLeadOptions] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [projectMilestones, setProjectMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [expandedProjects, setExpandedProjects] = useState({});
  const [expandedMilestones, setExpandedMilestones] = useState({});
  
  // State for daily updates
  const [taskUpdatesById, setTaskUpdatesById] = useState({});
  const [loadingTaskUpdates, setLoadingTaskUpdates] = useState({});
  const [selectedReportMemberByTask, setSelectedReportMemberByTask] = useState({});
  
const [projectTeamMembers, setProjectTeamMembers] = useState({
  tl: null,
  employees: [],
  interns: [],
});

  const [projectForm, setProjectForm] = useState({
    projectName: "",
    projectDescription: "",
    clientName: "",
    clientEmail: "",
    projectBudget: "",
    startDate: "",
    endDate: "",
    priority: "medium",
    status: "pending",
    assignedEmployee: "",
    assignedTL: "",
    assignedIntern: "",
  });

  const defaultProjectForm = {
    projectName: "",
    projectDescription: "",
    clientName: "",
    clientEmail: "",
    projectBudget: "",
    startDate: "",
    endDate: "",
    priority: "medium",
    status: "pending",
    assignedEmployee: "",
    assignedTL: "",
    assignedIntern: "",
  };

  const [milestoneForm, setMilestoneForm] = useState({
    projectId: "",
    title: "",
    description: "",
    dueDate: "",
    progress: 0,
    status: "in-progress",
    reviewComment: "",
    completedAt: "",
  });

  const [taskForm, setTaskForm] = useState({
    projectId: "",
    milestoneId: "",
    taskTitle: "",
    description: "",
    assignedTo: "",
    assignedEmployee: "",
    assignedBy: "",
    startDate: "",
    dueDate: "",
    priority: "medium",
    progress: 0,
    status: "pending",
  });

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
    fetchUsers();
    fetchTeamLeadOptions();
    fetchMilestones();
    fetchTasks();
  }, []);

  // Function to fetch daily updates for a task
  const fetchTaskUpdates = async (taskId) => {
    if (!taskId) return;

    setLoadingTaskUpdates((prev) => ({ ...prev, [taskId]: true }));

    try {
      const response = await axios.get(`${API_CORE}/daily-update/${taskId}`);
      const payload = response.data;
      const updates = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.dailyUpdates)
            ? payload.dailyUpdates
            : Array.isArray(payload?.updates)
              ? payload.updates
              : [];

      const sortedUpdates = [...updates].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setTaskUpdatesById((prev) => ({ ...prev, [taskId]: sortedUpdates }));
    } catch (error) {
      console.error("Error fetching task updates:", error);
      setTaskUpdatesById((prev) => ({ ...prev, [taskId]: [] }));
      alert("Failed to load task updates.");
    } finally {
      setLoadingTaskUpdates((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  const sortTasksByNewest = (tasks = []) => {
    return [...tasks].sort((a, b) => {
      const aTime = new Date(a.createdAt || a.updatedAt || a.startDate || a.dueDate || 0).getTime();
      const bTime = new Date(b.createdAt || b.updatedAt || b.startDate || b.dueDate || 0).getTime();
      return bTime - aTime;
    });
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(USER_URL);
      const userData = res.data.data || res.data.users || res.data;
      setUsers(userData || []);
    } catch (error) {
      console.error("Users fetch error:", error);
    }
  };

  const fetchTeamLeadOptions = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        : {};

      const res = await axios.get(TEAM_LEAD_URL, { headers });
      const payload = res?.data?.data || res?.data?.teamLeads || res?.data?.teamLead || res?.data || [];
      const teamLeadsData = Array.isArray(payload) ? payload : [];

      const normalizedOptions = teamLeadsData
        .map((lead) => {
          const teamLeadRecord = lead?.teamLead || lead?.lead || lead?.user || lead?.employee || null;
          const interns = teamLeadRecord?.interns || lead?.interns || [];
          const employees = teamLeadRecord?.employees || lead?.employees || teamLeadRecord?.teamMembers || [];

          const leadId =
            teamLeadRecord?.userId ||
            teamLeadRecord?.employeeId ||
            teamLeadRecord?._id ||
            teamLeadRecord?.id ||
            lead?.teamLeadId ||
            lead?.teamLead?._id ||
            lead?.teamLead?.id ||
            lead?.teamLead?.userId ||
            lead?.teamLead?.employeeId ||
            lead?.user?._id ||
            lead?.user?.id ||
            lead?._id ||
            lead?.id ||
            null;

          const name =
            teamLeadRecord?.name ||
            teamLeadRecord?.fullName ||
            teamLeadRecord?.displayName ||
            lead?.name ||
            lead?.fullName ||
            lead?.displayName ||
            lead?.user?.name ||
            lead?.user?.fullName ||
            lead?.user?.displayName ||
            [teamLeadRecord?.firstName, teamLeadRecord?.lastName].filter(Boolean).join(" ") ||
            [lead?.firstName, lead?.lastName].filter(Boolean).join(" ") ||
            [lead?.user?.firstName, lead?.user?.lastName].filter(Boolean).join(" ") ||
            "";

          if (!leadId) return null;

          return {
            _id: String(leadId),
            value: String(leadId),
            name: name || "Team Lead",
            interns: Array.isArray(interns) ? interns : [],
            employees: Array.isArray(employees) ? employees : [],
          };
        })
        .filter(Boolean);

      setTeamLeadOptions(normalizedOptions);
    } catch (error) {
      console.error("Team lead options fetch error:", error);
      setTeamLeadOptions([]);
    }
  };

  const extractName = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;

    const name = [
      item.name,
      item.fullName,
      item.username,
      item.employeeName,
      item.userName,
      item.title,
      item.displayName,
      item.firstName && item.lastName ? `${item.firstName} ${item.lastName}` : null,
    ].find(Boolean);

    return name || "";
  };

  const getIdCandidates = (item) => {
    if (!item) return [];
    if (typeof item === "string" || typeof item === "number") return [String(item)];
    if (typeof item !== "object") return [];

    const candidates = [];
    const keys = ["_id", "id", "userId", "employeeId", "teamLeadId", "uniqueID", "uuid"];

    keys.forEach((key) => {
      const value = item[key];
      if (value !== undefined && value !== null && value !== "") {
        candidates.push(String(value));
      }
    });

    if (item.user && typeof item.user === "object") {
      candidates.push(...getIdCandidates(item.user));
    }
    if (item.employee && typeof item.employee === "object") {
      candidates.push(...getIdCandidates(item.employee));
    }
    if (item.teamLead && typeof item.teamLead === "object") {
      candidates.push(...getIdCandidates(item.teamLead));
    }
    if (item.person && typeof item.person === "object") {
      candidates.push(...getIdCandidates(item.person));
    }

    return [...new Set(candidates.filter(Boolean))];
  };

  const findEntity = (collection, value) => {
    if (!collection || !value) return null;

    const targetIds = new Set(getIdCandidates(value));
    if (targetIds.size > 0) {
      return collection.find((item) => {
        const itemIds = getIdCandidates(item);
        return itemIds.some((id) => targetIds.has(id));
      });
    }

    if (typeof value === "object") {
      const targetName = extractName(value);
      if (targetName) {
        return collection.find((item) => {
          const itemName = extractName(item);
          return itemName && itemName.toLowerCase() === targetName.toLowerCase();
        });
      }
    }

    return null;
  };

  const getUserName = (user) => {
    if (!user) return "";
    if (typeof user === "string") return user;

    const direct = extractName(user);
    if (direct) return direct;

    if (user.user) return getUserName(user.user);
    if (user.employee) return getUserName(user.employee);
    if (user.person) return getUserName(user.person);

    return "Unknown";
  };

  const getNamesByIds = (collection, values, type = "user") => {
    if (!values) return "";

    if (!Array.isArray(values)) {
      return type === "employee"
        ? getEmployeeNameById(values)
        : getUserNameById(values);
    }

    return values
      .map((value) => {
        const item = findEntity(collection, value);
        if (item) return extractName(item);
        if (typeof value === "object") return extractName(value) || getUserName(value) || getEmployeeName(value) || "";
        return value;
      })
      .filter(Boolean)
      .join(", ");
  };

  const getUserNameById = (value) => {
    if (!value) return "";
    if (typeof value === "object") return getUserName(value);

    const user = findEntity(users, value) || findEntity(employees, value) || findEntity(teamLeadOptions, value);
    if (user) return getUserName(user);

    return value;
  };

  const normalizeId = (value) => {
    if (!value) return "";
    if (typeof value === "object") {
      const ids = getIdCandidates(value);
      if (ids.length > 0) return String(ids[0]);
      return String(
        value._id ||
        value.id ||
        value.projectId ||
        (value.user && normalizeId(value.user)) ||
        (value.employee && normalizeId(value.employee)) ||
        (value.teamLead && normalizeId(value.teamLead)) ||
        (value.person && normalizeId(value.person)) ||
        value
      );
    }
    return String(value);
  };

  const isSameId = (a, b) => normalizeId(a) === normalizeId(b);

  const getMilestoneProjectId = (milestone) => {
    if (!milestone) return "";
    if (typeof milestone === "object") {
      return (
        milestone?.projectId?._id ||
        milestone?.projectId ||
        milestone?.project?._id ||
        milestone?.project ||
        ""
      );
    }
    return milestone;
  };

  const loadSelectedMilestone = async (milestoneId) => {
    if (!milestoneId) return null;

    let milestoneData = null;
    try {
      const response = await axios.get(`${MILESTONE_URL}/${milestoneId}`);
      milestoneData = response.data?.milestone || response.data?.data || response.data;
    } catch (error) {
      console.warn("Milestone fetch warning:", error?.message || error);
      return null;
    }

    if (!milestoneData) return null;

    let tasks = [];
    try {
      const tasksResponse = await axios.get(`${TASK_URL}/milestone/${milestoneId}`);
      tasks = tasksResponse.data?.data || tasksResponse.data || [];
    } catch (error) {
      tasks = [];
    }

    return { ...milestoneData, tasks };
  };

  const handleSelectMilestone = async (milestone) => {
    if (!milestone) return;
    const id = milestone._id || milestone.id;
    const milestoneProjectId = getMilestoneProjectId(milestone);

    setTaskForm((prev) => ({
      ...prev,
      milestoneId: id,
      projectId: milestoneProjectId || prev.projectId,
    }));

    if (milestoneProjectId) {
      const project = projects.find((p) => isSameId(p._id || p.id, milestoneProjectId));
      if (project) {
        setSelectedProject(project);
        updateProjectTeamMembers(project);
      }
    }

    try {
      const existingMilestone = milestones.find(m => isSameId(m._id || m.id, id));
      
      if (existingMilestone && existingMilestone.tasks) {
        setSelectedMilestone(existingMilestone);
        return;
      }
      
      const response = await axios.get(`${MILESTONE_URL}/${id}`);
      const milestoneData = response.data?.milestone || response.data?.data || response.data;
      
      if (milestoneData) {
        let tasks = [];
        try {
          const tasksResponse = await axios.get(`${TASK_URL}/milestone/${id}`);
          tasks = tasksResponse.data?.data || tasksResponse.data || [];
        } catch (error) {
          tasks = [];
        }

        const milestoneWithTasks = {
          ...milestoneData,
          tasks: tasks
        };
        
        setSelectedMilestone(milestoneWithTasks);
        
        setMilestones(prev => {
          const index = prev.findIndex(m => isSameId(m._id || m.id, id));
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = milestoneWithTasks;
            return updated;
          }
          return [milestoneWithTasks, ...prev];
        });
      }
    } catch (error) {
      console.error('Error loading milestone:', error);
      const existing = milestones.find(m => isSameId(m._id || m.id, id));
      if (existing) {
        setSelectedMilestone(existing);
      }
    }
  };

  const sortByNewest = (items = []) => {
    return [...items].sort((a, b) => {
      const aTime = new Date(
        a.createdAt || a.updatedAt || a.startDate || a.dueDate || a.completedAt || 0
      ).getTime();
      const bTime = new Date(
        b.createdAt || b.updatedAt || b.startDate || b.dueDate || b.completedAt || 0
      ).getTime();

      if (aTime && bTime && aTime !== bTime) {
        return bTime - aTime;
      }

      return String(b._id || "").localeCompare(String(a._id || ""));
    });
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/all`);
      const projectData = res.data.data || res.data.projects || res.data;
      
      const processedProjects = (projectData || []).map(project => {
        let teamLeadName = "";
        if (project.teamLeadUser) {
          teamLeadName = extractName(project.teamLeadUser);
        } else if (project.teamLeadEmployee) {
          teamLeadName = extractName(project.teamLeadEmployee);
        }
        
        return {
          ...project,
          teamLeadName: teamLeadName || "Not Assigned",
          teamLead: project.teamLeadUser || project.teamLeadEmployee
        };
      });
      
      setProjects(sortByNewest(processedProjects || []));
    } catch (error) {
      console.error("Fetch Projects Error:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(EMPLOYEE_URL);
      const employeeData = res.data.data || res.data.employees || res.data;
      setEmployees(employeeData || []);
    } catch (error) {
      console.error("Employee fetch error:", error);
    }
  };

  const fetchMilestones = async () => {
    try {
      const res = await axios.get(MILESTONE_URL);
      const milestoneData = res.data?.data || res.data?.milestones || res.data || [];
      const normalized = Array.isArray(milestoneData) ? milestoneData : [];
      
      const milestonesWithTasks = await Promise.all(
        normalized.map(async (milestone) => {
          try {
            const tasksRes = await axios.get(`${TASK_URL}/milestone/${milestone._id}`);
            return {  
              ...milestone,
              tasks: sortTasksByNewest(tasksRes.data?.data || tasksRes.data || [])
            };
          } catch (error) {
            return { 
              ...milestone,
              tasks: []
            };
          }
        })
      );
      
      setMilestones(sortByNewest(milestonesWithTasks));
    } catch (error) {
      console.error("Milestones fetch error:", error);
      setMilestones([]);
    }
  };

  const fetchMilestonesByProject = async (projectId) => {
    if (!projectId) {
      setProjectMilestones([]);
      return [];
    }

    try {
      const res = await axios.get(`${MILESTONE_URL}/project/${projectId}`);
      const milestoneData = res.data?.data || res.data?.milestones || res.data || [];
      const normalized = Array.isArray(milestoneData) ? milestoneData : [];
      const milestonesWithTasks = await Promise.all(
        normalized.map(async (milestone) => {
          try {
            const tasksRes = await axios.get(`${TASK_URL}/milestone/${milestone._id}`);
            return {
              ...milestone,
              tasks: sortTasksByNewest(tasksRes.data?.data || tasksRes.data || [])
            };
          } catch (error) {
            return {
              ...milestone,
              tasks: []
            };
          }
        })
      );
      setProjectMilestones(sortByNewest(milestonesWithTasks));
      return milestonesWithTasks;
    } catch (error) {
      console.error("Project milestones fetch error:", error);
      setProjectMilestones([]);
      return [];
    }
  };

const fetchTasks = async (projectId = null) => {
  try {
    const url = projectId
      ? `${TASK_URL}/project/${projectId}`
      : `${TASK_URL}/all`;

    const res = await axios.get(url);

    console.log("TASK API RESPONSE:", res.data);

    let taskData = [];

    if (Array.isArray(res.data)) {
      taskData = res.data;
    } else if (Array.isArray(res.data?.data)) {
      taskData = res.data.data;
    } else if (Array.isArray(res.data?.tasks)) {
      taskData = res.data.tasks;
    } else if (Array.isArray(res.data?.data?.tasks)) {
      taskData = res.data.data.tasks;
    } else if (Array.isArray(res.data?.result)) {
      taskData = res.data.result;
    }

    const sortedTasks = sortTasksByNewest(taskData);

    console.log("FINAL TASKS:", sortedTasks);

    setTasks(sortedTasks);

    return sortedTasks;
  } catch (error) {
    console.error(
      "Tasks fetch error:",
      error?.response?.data || error.message
    );

    setTasks([]);
    return [];
  }
};

  const updateProjectTeamMembers = (project) => {
  if (!project) {
    setProjectTeamMembers({
      tl: null,
      employees: [],
      interns: [],
    });
    return;
  }

  const tlId = project.teamLeadUser
    ? normalizeId(project.teamLeadUser)
    : project.teamLeadEmployee
      ? normalizeId(project.teamLeadEmployee)
      : null;

  const tl = tlId
    ? findEntity(teamLeadOptions, tlId) ||
      findEntity(users, tlId) ||
      findEntity(employees, tlId)
    : null;

  const employeeList = Array.isArray(project.employees)
    ? project.employees
        .map((emp) =>
          findEntity(employees, emp) ||
          findEntity(users, emp)
        )
        .filter(Boolean)
    : [];

  const internList = Array.isArray(project.interns)
    ? project.interns
        .map((intern) =>
          findEntity(users, intern) ||
          findEntity(employees, intern)
        )
        .filter(Boolean)
    : [];

  setProjectTeamMembers({
    tl,
    employees: employeeList,
    interns: internList,
  });
};

  const getTeamLeadDisplayName = (lead) => {
    if (!lead) return "";
    if (typeof lead === "string") return lead;

    const direct =
      extractName(lead) ||
      extractName(lead.user) ||
      extractName(lead.teamLead) ||
      extractName(lead.employee) ||
      extractName(lead.person);

    if (direct) return direct;
    if (lead.user && typeof lead.user === "object") return getTeamLeadDisplayName(lead.user);
    if (lead.teamLead && typeof lead.teamLead === "object") return getTeamLeadDisplayName(lead.teamLead);
    if (lead.employee && typeof lead.employee === "object") return getTeamLeadDisplayName(lead.employee);
    if (lead.person && typeof lead.person === "object") return getTeamLeadDisplayName(lead.person);

    return "Team Lead";
  };

  const getTeamLeadNameById = (value) => {
    if (!value) return "";
    if (typeof value === "object") return getTeamLeadDisplayName(value);

    const match = findEntity(teamLeadOptions, value) || findEntity(users, value) || findEntity(employees, value);
    if (match) return getTeamLeadDisplayName(match);

    return getUserNameById(value);
  };

  const getProjectTeamLeadName = (project) => {
    if (!project) return "Not Assigned";
    
    if (project.teamLeadName) return project.teamLeadName;
    if (project.teamLeadUser) return extractName(project.teamLeadUser);
    if (project.teamLeadEmployee) return extractName(project.teamLeadEmployee);
    
    return "Not Assigned";
  };

  const getEmployeeName = (emp) => {
    if (!emp) return "";
    if (typeof emp === "string") return emp;

    const direct = extractName(emp);
    if (direct) return direct;

    if (emp.employee) return getEmployeeName(emp.employee);
    if (emp.user) return getEmployeeName(emp.user);

    return "Unknown";
  };

  const getEmployeeNameById = (value) => {
    if (!value) return "";
    if (typeof value === "object") return getEmployeeName(value);

    const emp = findEntity(employees, value) || findEntity(users, value);
    if (emp) return getEmployeeName(emp);

    return value;
  };

  const getProjectAssignedMembers = (project) => {
    if (!project) return [];

    const members = [];
    const teamLead = findEntity(
      teamLeadOptions,
      project.teamLeadUser || project.teamLeadEmployee
    ) || project.teamLeadUser || project.teamLeadEmployee;

    if (teamLead) {
      members.push({ member: teamLead, role: "Team Lead" });
    }

    (Array.isArray(project.employees) ? project.employees : []).forEach((employee) => {
      const member = findEntity(employees, employee) || findEntity(users, employee) || employee;
      if (member) members.push({ member, role: "Employee" });
    });

    (Array.isArray(project.interns) ? project.interns : []).forEach((intern) => {
      const member = findEntity(users, intern) || findEntity(employees, intern) || intern;
      if (member) members.push({ member, role: "Intern" });
    });

    return members.filter(({ member }, index, allMembers) => {
      const memberId = normalizeId(member);
      return memberId && allMembers.findIndex(({ member: candidate }) => normalizeId(candidate) === memberId) === index;
    });
  };

  const getTaskAssignedMember = (task) => {
    const assignedId = task?.assignedTo || task?.assignedEmployee || task?.assignedIntern;
    if (!assignedId) return null;

    const projectId = task?.projectId?._id || task?.projectId || task?.project?._id || task?.project;
    const project = findEntity(projects, projectId);
    const assignedMember = getProjectAssignedMembers(project).find(({ member }) =>
      isSameId(member, assignedId)
    );

    return assignedMember || {
      member: findEntity(users, assignedId) || findEntity(employees, assignedId) || assignedId,
      role: "Assigned Member",
    };
  };

  const getUpdateMemberId = (update) =>
    normalizeId(update?.userId || update?.user || update?.employeeId || update?.employee);

  const getUpdateMemberName = (update) => {
    const value = update?.userId || update?.user || update?.employee || update?.employeeId;
    if (value && typeof value === "object") return getUserName(value);

    const member = findEntity(users, value) || findEntity(employees, value) || findEntity(teamLeadOptions, value);
    return (member && getUserName(member)) || update?.employeeName || value || "Unknown User";
  };

  const handleReportMemberClick = async (taskId, member) => {
    const memberId = normalizeId(member);
    if (!memberId) return;

    setSelectedReportMemberByTask((prev) => ({ ...prev, [taskId]: memberId }));
    if (!taskUpdatesById[taskId]) {
      await fetchTaskUpdates(taskId);
    }
  };

  const getMilestoneTitle = (milestone) => {
    if (!milestone) return "Untitled Milestone";
    if (typeof milestone === "string") return milestone;

    const direct = (
      milestone.title ||
      milestone.milestoneTitle ||
      milestone.milestoneName ||
      milestone.name ||
      milestone.label ||
      milestone.heading
    );
    if (direct) return direct;

    if (milestone.milestone && typeof milestone.milestone === "object") {
      return getMilestoneTitle(milestone.milestone);
    }
    if (milestone.data && typeof milestone.data === "object") {
      return getMilestoneTitle(milestone.data);
    }
    if (milestone._doc && typeof milestone._doc === "object") {
      return getMilestoneTitle(milestone._doc);
    }

    for (const key of Object.keys(milestone)) {
      const val = milestone[key];
      if (typeof val === "string" && /title|name|label|heading/i.test(key)) {
        return val;
      }
    }

    return "Untitled Milestone";
  };

  const getTaskMilestoneId = (task) => {
    if (!task) return "";
    if (typeof task === "object") {
      return (
        task?.milestoneId?._id ||
        task?.milestoneId ||
        task?.milestone?._id ||
        task?.milestone ||
        ""
      );
    }
    return task;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextForm = {
      ...projectForm,
      [name]: value,
    };

    if (name === "assignedTL") {
      const selectedLead = teamLeadOptions.find(
        (item) => (item.value || item._id) === String(value)
      );

      if (selectedLead) {
        const firstIntern = selectedLead.interns?.[0] || null;
        const firstInternId =
          firstIntern?._id || firstIntern?.id || firstIntern?.employeeId || firstIntern?.userId || "";
        nextForm.assignedIntern = firstInternId ? String(firstInternId) : "";
        const firstEmployee = selectedLead.employees?.[0] || null;
        const firstEmployeeId =
          firstEmployee?._id || firstEmployee?.id || firstEmployee?.employeeId || firstEmployee?.userId || "";
        nextForm.assignedEmployee = firstEmployeeId ? String(firstEmployeeId) : nextForm.assignedEmployee || "";
      } else {
        nextForm.assignedIntern = "";
        nextForm.assignedEmployee = "";
      }
    }

    setProjectForm(nextForm);
  };

  const getProjectParticipants = (task) => {
    if (!task) return { empNames: "", internNames: "", tlName: "" };
    const projId =
      task?.projectId?._id || task?.projectId || task?.project?._id || task?.project || "";
    const project = findEntity(projects, projId) || null;

    const empNames = project ? getNamesByIds(employees, project.employees, "employee") : "";
    const internNames = project ? getNamesByIds(users, project.interns, "user") : "";
    const tlName = project ? getTeamLeadNameById(project.teamLeadUser || project.teamLeadEmployee) : "";

    return { empNames, internNames, tlName };
  };

  const handleMilestoneChange = (e) => {
    setMilestoneForm({
      ...milestoneForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleTaskChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "assignedTo") {
      setTaskForm({
        ...taskForm,
        assignedTo: value,
        assignedEmployee: value,
      });
    } else {
      setTaskForm({
        ...taskForm,
        [name]: value,
      });
    }
  };

  const openAddMilestone = (projectId = null) => {
    setMilestoneForm({
      projectId: projectId || selectedProject?._id || "",
      title: "",
      description: "",
      dueDate: "",
      progress: 0,
      status: "in-progress",
      reviewComment: "",
      completedAt: "",
    });
    setShowMilestoneModal(true);
  };

  const openAddTask = async (projectId = null, milestoneId = null) => {
    let visibleMilestones = milestones;

    if (selectedProject || projectId) {
      const projId = projectId || selectedProject?._id;
      visibleMilestones = await fetchMilestonesByProject(projId);
      const proj = projects.find(p => isSameId(p._id, projId));
      if (proj) {
        setSelectedProject(proj);
        updateProjectTeamMembers(proj);
      }
    }

    const milestoneToUse = milestoneId 
      ? visibleMilestones.find(m => isSameId(m._id, milestoneId)) || selectedMilestone
      : selectedMilestone || visibleMilestones[0] || null;

    if (!milestoneToUse) {
      alert("Please select or create a milestone first");
      return;
    }

    const selected = await loadSelectedMilestone(milestoneToUse._id || milestoneToUse.id);
    setSelectedMilestone(selected || milestoneToUse);
    
    const projId = selectedProject?._id || projectId || "";
    let assignedTo = "";
    
    if (projectTeamMembers.employees[0]) {
      assignedTo = normalizeId(projectTeamMembers.employees[0]);
    } else if (projectTeamMembers.tl) {
      assignedTo = projectTeamMembers.tl._id || projectTeamMembers.tl.id || "";
    } else if (projectTeamMembers.interns[0]) {
      assignedTo = normalizeId(projectTeamMembers.interns[0]);
    }
    
    setTaskForm({
      projectId: projId,
      milestoneId: milestoneToUse?._id || milestoneToUse?.id || "",
      taskTitle: "",
      description: "",
      assignedTo: assignedTo,
      assignedEmployee: assignedTo,
      assignedBy: "",
      startDate: "",
      dueDate: "",
      priority: "medium",
      progress: 0,
      status: "pending",
    });

    setShowTaskModal(true);
  };

  const toggleProject = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
    if (!expandedProjects[projectId]) {
      const project = projects.find(p => isSameId(p._id, projectId));
      if (project) {
        setSelectedProject(project);
        updateProjectTeamMembers(project);
        fetchMilestonesByProject(projectId);
        fetchTasks(projectId);
      }
    }
  };

  const toggleMilestone = (milestoneId) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [milestoneId]: !prev[milestoneId]
    }));
  };

  const addMilestone = async (e) => {
    e.preventDefault();

    const projectId = milestoneForm.projectId || selectedProject?._id || "";
    if (!projectId) {
      alert("Please select a project for this milestone.");
      return;
    }

    if (!milestoneForm.title) {
      alert("Please enter a milestone title.");
      return;
    }

    if (!milestoneForm.dueDate) {
      alert("Please select a due date for the milestone.");
      return;
    }

    try {
      let formattedDueDate = milestoneForm.dueDate;
      if (milestoneForm.dueDate) {
        if (milestoneForm.dueDate.includes('T')) {
          formattedDueDate = new Date(milestoneForm.dueDate).toISOString();
        } else {
          formattedDueDate = new Date(milestoneForm.dueDate + 'T00:00:00').toISOString();
        }
      }

      const payload = {
        projectId,
        title: milestoneForm.title,
        description: milestoneForm.description || "",
        dueDate: formattedDueDate,
        progress: Number(milestoneForm.progress) || 0,
        status: milestoneForm.status || "pending",
        completedAt: milestoneForm.completedAt ? new Date(milestoneForm.completedAt).toISOString() : null,
      };

      const res = await axios.post(`${MILESTONE_BASE_URL}/create`, payload);
      const createdMilestone = res.data?.data || res.data?.milestone || res.data;

      if (createdMilestone) {
        setMilestones((prev) => sortByNewest([createdMilestone, ...prev]));
        if (selectedProject) {
          setProjectMilestones((prev) => sortByNewest([createdMilestone, ...prev]));
        }
      }

      await fetchMilestones();
      if (selectedProject) {
        await fetchMilestonesByProject(selectedProject._id);
      }
      
      setSelectedMilestone(createdMilestone || null);
      setShowMilestoneModal(false);
      
      setMilestoneForm({
        projectId: selectedProject?._id || "",
        title: "",
        description: "",
        dueDate: "",
        progress: 0,
        status: "pending",
        reviewComment: "",
        completedAt: "",
      });
    } catch (error) {
      console.error("Milestone create error:", error);
      alert(`Milestone creation failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();

    try {
      const assignedEmployeeId = taskForm.assignedTo;
      
      const assignedEmployee = users.find(user => 
        isSameId(user._id, assignedEmployeeId)
      );
      
      const payload = {
        projectId: taskForm.projectId || selectedProject?._id || selectedProject?.id || null,
        milestoneId: taskForm.milestoneId || selectedMilestone?._id || selectedMilestone?.id || null,
        taskTitle: taskForm.taskTitle,
        description: taskForm.description,
        assignedEmployee: assignedEmployeeId,
        assignedBy: taskForm.assignedBy || null,
        startDate: taskForm.startDate || null,
        dueDate: taskForm.dueDate || null,
        priority: taskForm.priority,
        progress: Number(taskForm.progress),
        status: taskForm.status,
        assignedEmployeeName: assignedEmployee ? getUserName(assignedEmployee) : "",
      };

      if (!payload.projectId && payload.milestoneId) {
        const milestoneData = await loadSelectedMilestone(payload.milestoneId);
        const milestoneProjectId = getMilestoneProjectId(milestoneData);
        if (milestoneProjectId) {
          payload.projectId = milestoneProjectId;
          setTaskForm((prev) => ({ ...prev, projectId: milestoneProjectId }));

          const project = projects.find((p) => isSameId(p._id || p.id, milestoneProjectId));
          if (project) {
            setSelectedProject(project);
            updateProjectTeamMembers(project);
          }
        }
      }

      if (!payload.projectId || !payload.milestoneId) {
        alert("Please select both a project and a milestone before adding a task.");
        return;
      }

      if (!payload.assignedEmployee) {
        alert("Please select an employee to assign this task.");
        return;
      }

      await axios.post(`${TASK_URL}/create`, payload).catch((error) => {
        if (error?.response?.status === 404 || error?.response?.status === 405) {
          return axios.post(TASK_URL, payload);
        }
        throw error;
      });

      await fetchMilestones();
      await fetchTasks();
      
      setShowTaskModal(false);
      setTaskForm({
        projectId: "",
        milestoneId: "",
        taskTitle: "",
        description: "",
        assignedTo: "",
        assignedEmployee: "",
        assignedBy: "",
        startDate: "",
        dueDate: "",
        priority: "medium",
        progress: 0,
        status: "pending",
      });
    } catch (error) {
      console.error("Task create error:", error);
      alert("Task creation failed: " + (error?.response?.data?.message || error?.message || "Unknown error"));
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(`${TASK_URL}/status/${taskId}`, { status: newStatus });
      await fetchTasks(selectedProject?._id || null);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`${TASK_URL}/delete/${taskId}`);
      await fetchTasks(selectedProject?._id || null);
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task");
    }
  };

  // Open the SAME form used for creating a new project.
  // All project fields are loaded into the form so they can be edited.
  const openEditProject = (project) => {
    setSelectedProject(project);
    updateProjectTeamMembers(project);

    setProjectForm({
      projectName: project?.projectName || "",
      projectDescription: project?.projectDescription || "",
      clientName: project?.clientName || "",
      clientEmail: project?.clientEmail || "",
      projectBudget: project?.projectBudget ?? "",
      startDate: project?.startDate ? String(project.startDate).split("T")[0] : "",
      endDate: project?.endDate ? String(project.endDate).split("T")[0] : "",
      priority: project?.priority || "medium",
      status: project?.status || "pending",
      assignedEmployee:
        Array.isArray(project?.employees) && project.employees.length
          ? normalizeId(project.employees[0])
          : "",
      assignedTL:
        normalizeId(project?.teamLeadUser || project?.teamLeadEmployee) || "",
      assignedIntern:
        Array.isArray(project?.interns) && project.interns.length
          ? normalizeId(project.interns[0])
          : "",
    });

    setShowProjectModal(true);
  };

  const closeProjectModal = () => {
    setShowProjectModal(false);
    setSelectedProject(null);
    setProjectForm({ ...defaultProjectForm });
  };

  const handleAddProject = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        projectName: projectForm.projectName.trim(),
        projectDescription: projectForm.projectDescription?.trim() || "",
        clientName: projectForm.clientName.trim(),
        clientEmail: projectForm.clientEmail?.trim() || "",
        projectBudget: Number(projectForm.projectBudget) || 0,
        startDate: projectForm.startDate || null,
        endDate: projectForm.endDate || null,
        priority: projectForm.priority || "medium",
        status: projectForm.status || "pending",
        employees: projectForm.assignedEmployee ? [projectForm.assignedEmployee] : [],
        teamLeadUser: projectForm.assignedTL || null,
        interns: projectForm.assignedIntern ? [projectForm.assignedIntern] : [],
      };

      if (!projectForm.projectName.trim()) {
        alert("Please enter project name.");
        return;
      }

      if (!projectForm.clientName.trim()) {
        alert("Please enter client name.");
        return;
      }

      if (selectedProject?._id) {
        const id = selectedProject._id;

        // IMPORTANT: Edit uses one single PUT request with the complete
        // project payload, exactly like the New Project form.
        // Backend route expected: PUT /api/projectManage/project/:id
        await axios.put(`${BASE_URL}/${id}`, payload);

        alert("Project updated successfully.");
      } else {
        await axios.post(`${BASE_URL}/create`, payload);
        alert("Project created successfully.");
      }

      await fetchProjects();
      setProjectForm({ ...defaultProjectForm });
      setShowProjectModal(false);
      setSelectedProject(null);
      setProjectTeamMembers({
        tl: null,
        employees: [],
        interns: [],
      });
    } catch (error) {
      console.error("Project save error:", error?.response?.data || error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to save project.";

      alert(`Project ${selectedProject ? "update" : "creation"} failed: ${message}`);
    }
  };

  const getAvailableTaskAssignees = () => {
    const assignees = [];
    
    if (projectTeamMembers.tl) {
      assignees.push({
        ...projectTeamMembers.tl,
        role: 'Team Lead'
      });
    }
    
    projectTeamMembers.employees.forEach((employee) => {
      assignees.push({
        ...employee,
        role: 'Employee'
      });
    });
    
    projectTeamMembers.interns.forEach((intern) => {
      assignees.push({
        ...intern,
        role: 'Intern'
      });
    });
    
    return assignees;
  };

  const getHrAndAdminUsers = () => {
    return users.filter(user => {
      const role = String(user.role || user.userRole || "").trim().toLowerCase();
      return role === 'hr' || role === 'admin' || role === 'human resources';
    });
  };
 
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'in_progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'testing': 'bg-purple-100 text-purple-800 border-purple-200',
      'review': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4" />;
    if (status === 'in-progress' || status === 'in_progress') return <Loader2 className="w-4 h-4 animate-spin" />;
    if (status === 'cancelled') return <X className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FolderOpen className="w-8 h-8 text-blue-600" />
              Project Management
            </h1>
            <p className="text-gray-500 mt-1">Manage projects, milestones, and tasks efficiently</p>
          </div>

          <button
            onClick={() => {
              setSelectedProject(null);
              setProjectForm(defaultProjectForm);
              setShowProjectModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
              <p className="mt-4 text-gray-600">Loading your projects...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.length > 0 ? (
              sortByNewest(projects).map((project) => {
                const isExpanded = expandedProjects[project._id] || false;
                const projectMilestonesList = projectMilestones.filter(m => 
                  isSameId(getMilestoneProjectId(m), project._id)
                );
                
                return (
                  <div key={project._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                    {/* Project Header */}
                    <div 
                      className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => toggleProject(project._id)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <button className="text-gray-500 hover:text-gray-700 p-1">
                              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </button>
                            <h3 className="text-xl font-semibold text-gray-800 truncate">
                              {project.projectName}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                          </div>
                          <div className="mt-2 sm:ml-10 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {project.clientName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              TL: {getProjectTeamLeadName(project)}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                              {project.priority}
                            </span>
                            {project.projectBudget && (
                              <span className="flex items-center gap-1 text-green-600 font-medium">
                                Budget: Rs. {project.projectBudget}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openAddMilestone(project._id);
                            }}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Milestone
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openAddTask(project._id);
                            }}
                            className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Task
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditProject(project);
                            }}
                            className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                        </div>
                      </div>

                      {/* Project Stats */}
                      <div className="mt-3 sm:ml-10 flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-600">Milestones: <span className="font-semibold text-gray-800">{projectMilestonesList.length}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ListTodo className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600">Tasks: <span className="font-semibold text-gray-800">{tasks.filter(t => isSameId(t.projectId, project._id)).length}</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50/50">
                        {/* Milestones Section */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                              <Target className="w-5 h-5 text-blue-500" />
                              Milestones
                            </h4>
                            <button
                              onClick={() => openAddMilestone(project._id)}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              Add Milestone
                            </button>
                          </div>

                          {projectMilestonesList.length > 0 ? (
                            <div className="space-y-3">
                              {sortByNewest(projectMilestonesList).map((milestone) => {
                                const isMilestoneExpanded = expandedMilestones[milestone._id] || false;
                                const milestoneTasks = tasks.filter(t => 
                                  isSameId(t.milestoneId, milestone._id)
                                );
                                
                                return (
                                  <div key={milestone._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <div 
                                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                      onClick={() => toggleMilestone(milestone._id)}
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                          <button className="text-gray-400">
                                            {isMilestoneExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                          </button>
                                          <div className="min-w-0 flex-1">
                                            <h5 className="font-medium text-gray-800 truncate">
                                              {getMilestoneTitle(milestone)}
                                            </h5>
                                            {milestone.description && (
                                              <p className="text-sm text-gray-500 truncate">{milestone.description}</p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(milestone.status)}`}>
                                            {milestone.status}
                                          </span>
                                          {milestone.dueDate && (
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                              <Calendar className="w-3 h-3" />
                                              {new Date(milestone.dueDate).toLocaleDateString()}
                                            </span>
                                          )}
                                          <span className="text-sm font-medium text-gray-700">
                                            {milestone.progress || 0}%
                                          </span>
                                          <div className="w-full sm:w-24 max-w-[120px] h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                              className={`h-full rounded-full ${getProgressColor(milestone.progress || 0)} transition-all duration-300`}
                                              style={{ width: `${milestone.progress || 0}%` }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Milestone Tasks */}
                                    {isMilestoneExpanded && (
                                      <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
                                        <div className="flex items-center justify-between mb-3">
                                          <h6 className="font-medium text-gray-600 flex items-center gap-2">
                                            <ListTodo className="w-4 h-4 text-green-500" />
                                            Tasks ({milestoneTasks.length})
                                          </h6>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openAddTask(project._id, milestone._id);
                                            }}
                                            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                                          >
                                            <Plus className="w-4 h-4" />
                                            Add Task
                                          </button>
                                        </div>

                                        {milestoneTasks.length > 0 ? (
                                          <div className="space-y-2">
                                            {sortTasksByNewest(milestoneTasks).map((task) => {
                                                      const p = getProjectParticipants(task);
                                                      const assignedMember = getTaskAssignedMember(task);
                                                      const selectedReportMemberId = selectedReportMemberByTask[task._id];
                                                      const taskReports = (taskUpdatesById[task._id] || []).filter((update) =>
                                                        !selectedReportMemberId || getUpdateMemberId(update) === selectedReportMemberId
                                                      );
                                              return (
                                                <div key={task._id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                      <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                          {task.priority}
                                                        </span>
                                                        <h6 className="font-medium text-gray-800 truncate">
                                                          {task.taskTitle || task.title || "Untitled Task"}
                                                        </h6>
                                                      </div>
                                                      {task.description && (
                                                        <p className="text-sm text-gray-500 truncate">{task.description}</p>
                                                      )}
                                                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                                                        {assignedMember && (
                                                          <button
                                                            type="button"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              handleReportMemberClick(task._id, assignedMember.member);
                                                            }}
                                                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                                                            title={`View ${assignedMember.role} daily reports`}
                                                          >
                                                            <User className="w-3 h-3" />
                                                            {getUserName(assignedMember.member)} ({assignedMember.role})
                                                          </button>
                                                        )}
                                                        {p.tlName && (
                                                          <span className="flex items-center gap-1">
                                                            <Users className="w-3 h-3" />
                                                            TL: {p.tlName}
                                                          </span>
                                                        )}
                                                        {task.dueDate && (
                                                          <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(task.dueDate).toLocaleDateString()}
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                      <select
                                                        value={task.status || "pending"}
                                                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                                        className={`text-xs px-2 py-1 border rounded font-medium focus:outline-none ${getStatusColor(task.status || "pending")}`}
                                                      >
                                                        <option value="pending">Pending</option>
                                                        <option value="in_progress">In Progress</option>
                                                        <option value="testing">Testing</option>
                                                        <option value="review">Review</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                      </select>
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          if (assignedMember) {
                                                            handleReportMemberClick(task._id, assignedMember.member);
                                                          } else {
                                                            fetchTaskUpdates(task._id);
                                                          }
                                                        }}
                                                        className="text-blue-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
                                                        title="View Daily Updates"
                                                      >
                                                        <MessageSquare className="w-4 h-4" />
                                                      </button>
                                                      <button
                                                        onClick={() => handleDeleteTask(task._id)}
                                                        className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                                                      >
                                                        <Trash2 className="w-4 h-4" />
                                                      </button>
                                                    </div>
                                                  </div>

                                                  <div className="mt-3 border-t border-gray-100 pt-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <h6 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                        Daily Reports
                                                      </h6>
                                                      <button
                                                        type="button"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          fetchTaskUpdates(task._id);
                                                        }}
                                                        className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                                                      >
                                                        Refresh
                                                      </button>
                                                    </div>

                                                    {loadingTaskUpdates[task._id] ? (
                                                      <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                                        Loading reports...
                                                      </div>
                                                    ) : taskReports.length > 0 ? (
                                                      <div className="space-y-2">
                                                        {taskReports.map((update) => (
                                                          <div key={update._id || update.id} className="rounded-lg border border-gray-200 bg-gray-50 p-2.5">
                                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                              <div className="flex items-center gap-2">
                                                                <User className="w-3.5 h-3.5 text-gray-500" />
                                                                <span className="text-sm font-medium text-gray-700">
                                                                  {getUpdateMemberName(update)}
                                                                </span>
                                                              </div>
                                                              <span className="text-[11px] text-gray-500">
                                                                {update.createdAt ? new Date(update.createdAt).toLocaleString() : "No date"}
                                                              </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600">
                                                              {update.updateText || update.message || update.description || "No report details provided."}
                                                            </p>
                                                            {typeof update.progress === "number" && (
                                                              <div className="mt-2 flex items-center gap-2">
                                                                <div className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden">
                                                                  <div
                                                                    className={`h-full rounded-full ${getProgressColor(update.progress)}`}
                                                                    style={{ width: `${Math.max(0, Math.min(100, update.progress))}%` }}
                                                                  />
                                                                </div>
                                                                <span className="text-xs font-medium text-gray-700">{update.progress}%</span>
                                                              </div>
                                                            )}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    ) : (
                                                      <p className="text-sm text-gray-500">
                                                        {selectedReportMemberId
                                                          ? "No daily reports for this assigned member yet."
                                                          : "Click the assigned member name to view daily reports."}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        ) : (
                                          <p className="text-gray-500 text-sm text-center py-4">
                                            No tasks yet. Click "Add Task" to create one.
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                              <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500">No milestones yet</p>
                              <button
                                onClick={() => openAddMilestone(project._id)}
                                className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Create your first milestone
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center">
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Projects Yet</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first project</p>
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setProjectForm(defaultProjectForm);
                    setShowProjectModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Create Project
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Project Modal - SAME FORM for Create + Edit */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl max-h-[95vh] overflow-hidden mx-2 sm:mx-0">
            <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                {selectedProject ? "Edit Project" : "Create New Project"}
              </h2>
              <button
                type="button"
                onClick={closeProjectModal}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="p-4 sm:p-6 overflow-y-auto max-h-[85vh]">
              {/* Project Name + Client Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name *
                  </label>
                  <input
                    name="projectName"
                    placeholder="Enter project name"
                    value={projectForm.projectName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name *
                  </label>
                  <input
                    name="clientName"
                    placeholder="Enter client name"
                    value={projectForm.clientName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Email
                  </label>
                  <input
                    name="clientEmail"
                    type="email"
                    placeholder="client@example.com"
                    value={projectForm.clientEmail}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Budget
                  </label>
                  <input
                    name="projectBudget"
                    type="number"
                    min="0"
                    placeholder="Enter budget"
                    value={projectForm.projectBudget}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={projectForm.startDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={projectForm.endDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Description
                </label>
                <textarea
                  name="projectDescription"
                  placeholder="Describe the project..."
                  value={projectForm.projectDescription}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
              </div>

              {/* Priority + Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={projectForm.priority}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={projectForm.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Team Assignment */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-800">Project Team</h3>
                  {selectedProject && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      Editing existing project
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Team Lead */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Lead
                    </label>
                    <select
                      name="assignedTL"
                      value={projectForm.assignedTL}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Team Lead</option>
                      {(teamLeadOptions.length > 0
                        ? teamLeadOptions
                        : users.filter((user) => {
                            const role = String(user.role || user.userRole || "")
                              .trim()
                              .toLowerCase();
                            return (
                              role === "team lead" ||
                              role === "tl" ||
                              role === "teamlead"
                            );
                          })
                      ).map((item) => (
                        <option
                          key={item.value || item._id || item.id}
                          value={item.value || item._id || item.id}
                        >
                          {item.name || getUserName(item)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Employee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee
                    </label>
                    {(() => {
                      const selectedLead = teamLeadOptions.find(
                        (item) =>
                          String(item.value || item._id) ===
                          String(projectForm.assignedTL)
                      );

                      const employeeOptions =
                        selectedLead &&
                        Array.isArray(selectedLead.employees) &&
                        selectedLead.employees.length > 0
                          ? selectedLead.employees
                          : employees;

                      return (
                        <select
                          name="assignedEmployee"
                          value={projectForm.assignedEmployee}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Employee</option>
                          {employeeOptions.map((emp) => (
                            <option
                              key={emp._id || emp.id || emp.employeeId || emp.userId || emp}
                              value={
                                emp._id ||
                                emp.id ||
                                emp.employeeId ||
                                emp.userId ||
                                emp
                              }
                            >
                              {getEmployeeName(emp)}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>

                  {/* Intern */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Intern
                    </label>
                    {(() => {
                      const selectedLead = teamLeadOptions.find(
                        (item) =>
                          String(item.value || item._id) ===
                          String(projectForm.assignedTL)
                      );

                      const internOptions =
                        selectedLead &&
                        Array.isArray(selectedLead.interns) &&
                        selectedLead.interns.length > 0
                          ? selectedLead.interns
                          : users.filter((user) =>
                              String(user.role || user.userRole || "")
                                .trim()
                                .toLowerCase()
                                .includes("intern")
                            );

                      return (
                        <select
                          name="assignedIntern"
                          value={projectForm.assignedIntern}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Intern</option>
                          {internOptions.map((user) => (
                            <option
                              key={user._id || user.id || user.employeeId || user.userId || user}
                              value={
                                user._id ||
                                user.id ||
                                user.employeeId ||
                                user.userId ||
                                user
                              }
                            >
                              {getUserName(user)}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeProjectModal}
                  className="w-full sm:w-1/3 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-semibold transition-all duration-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {selectedProject ? "Update Project" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative mx-2 sm:mx-0">
            <button
              onClick={() => setShowMilestoneModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <form onSubmit={addMilestone}>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-500" />
                Create Milestone
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                  <select
                    name="projectId"
                    value={milestoneForm.projectId}
                    onChange={handleMilestoneChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.projectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    name="title"
                    placeholder="Milestone title"
                    value={milestoneForm.title}
                    onChange={handleMilestoneChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    placeholder="Describe the milestone..."
                    value={milestoneForm.description}
                    onChange={handleMilestoneChange}
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    value={milestoneForm.dueDate}
                    onChange={handleMilestoneChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      name="progress"
                      placeholder="0"
                      value={milestoneForm.progress}
                      onChange={handleMilestoneChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={milestoneForm.status}
                      onChange={handleMilestoneChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Create Milestone
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative max-h-[80vh] overflow-y-auto mx-2 sm:mx-0">
            <button
              onClick={() => setShowTaskModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <form onSubmit={addTask}>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ListTodo className="w-6 h-6 text-green-500" />
                Create Task
              </h2>

              <div className="space-y-4">
                {selectedProject && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-700">Team Members</p>
                    <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                      {projectTeamMembers.tl && (
                        <p>👤 Team Lead: {getUserName(projectTeamMembers.tl)}</p>
                      )}
                      {projectTeamMembers.employees.map((employee) => (
                        <p key={normalizeId(employee)}>👤 Employee: {getUserName(employee)}</p>
                      ))}
                      {projectTeamMembers.interns.map((intern) => (
                        <p key={normalizeId(intern)}>👤 Intern: {getUserName(intern)}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                  <select
                    name="projectId"
                    value={taskForm.projectId || ""}
                    onChange={async (e) => {
                      const projectId = e.target.value;
                      const project = projects.find(
                        (p) => isSameId(p._id || p.id, projectId)
                      );
                      setSelectedProject(project || null);
                      setSelectedMilestone(null);
                      
                      if (project) {
                        updateProjectTeamMembers(project);
                      }
                      
                      setTaskForm((prev) => ({
                        ...prev,
                        projectId: project?._id || projectId || "",
                        milestoneId: "",
                        assignedTo: project && project.employees?.[0]
                          ? normalizeId(project.employees[0])
                          : prev.assignedTo
                      }));

                      if (projectId) {
                        await fetchMilestonesByProject(projectId);
                      } else {
                        setProjectMilestones([]);
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.projectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Milestone *</label>
                  <select
                    name="milestoneId"
                    value={taskForm.milestoneId || ""}
                    onChange={async (e) => {
                      const mid = e.target.value;
                      setTaskForm((prev) => ({ ...prev, milestoneId: mid }));
                      const milestone = (projectMilestones.length > 0 ? projectMilestones : milestones).find(
                        (m) => isSameId(m._id || m.id, mid)
                      );
                      if (milestone) {
                        await handleSelectMilestone(milestone);
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Milestone</option>
                    {(taskForm.projectId
                      ? projectMilestones.length > 0
                        ? projectMilestones
                        : milestones.filter((milestone) =>
                            isSameId(getMilestoneProjectId(milestone), taskForm.projectId)
                          )
                      : milestones
                    ).map((milestone) => (
                      <option key={milestone._id || milestone.id} value={milestone._id || milestone.id}>
                        {getMilestoneTitle(milestone)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                  <input
                    name="taskTitle"
                    placeholder="Enter task title"
                    value={taskForm.taskTitle}
                    onChange={handleTaskChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    placeholder="Describe the task..."
                    value={taskForm.description}
                    onChange={handleTaskChange}
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
                  <select
                    name="assignedTo"
                    value={taskForm.assignedTo}
                    onChange={handleTaskChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Team Member</option>
                    {getAvailableTaskAssignees().map((member) => (
                      <option key={member._id || member.id} value={member._id || member.id}>
                        {getUserName(member)} ({member.role})
                      </option>
                    ))}
                    {getAvailableTaskAssignees().length === 0 && users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {getUserName(user)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned By (HR/Admin)</label>
                  <select
                    name="assignedBy"
                    value={taskForm.assignedBy}
                    onChange={handleTaskChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Assigner</option>
                    {getHrAndAdminUsers().map((user) => (
                      <option key={user._id} value={user._id}>
                        {getUserName(user)} ({user.role || "HR/Admin"})
                      </option>
                    ))}
                    {getHrAndAdminUsers().length === 0 && (
                      <option value="">No HR/Admin users available</option>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={taskForm.startDate}
                      onChange={handleTaskChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={taskForm.dueDate}
                      onChange={handleTaskChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      name="priority"
                      value={taskForm.priority}
                      onChange={handleTaskChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      name="progress"
                      value={taskForm.progress}
                      onChange={handleTaskChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={taskForm.status}
                    onChange={handleTaskChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}