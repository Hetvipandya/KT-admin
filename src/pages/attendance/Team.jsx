import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL =
  "https://kt-backend-1.onrender.com/api/projectManage/project";

const API_CORE = BASE_URL.replace(/\/project$/, "");

const EMPLOYEE_URL = 
  "https://kt-backend-1.onrender.com/api/employee/list"; 

const USER_URL =
  "https://kt-backend-1.onrender.com/api/users/all";

const MILESTONE_URL =
  "https://kt-backend-1.onrender.com/api/milestone";

const TASK_URL =
  "https://kt-backend-1.onrender.com/api/task";

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
    ].find(Boolean);

    if (name) return name;

    if (item.firstName || item.lastName) {
      return `${item.firstName || ""} ${item.lastName || ""}`.trim();
    }

    return "";
  };

  const findEntity = (collection, value) => {
    if (!collection || !value) return null;
    if (typeof value === "object") {
      const id = value._id || value.id || value.uniqueID;
      if (!id) return null;
      value = id;
    }

    return collection.find(
      (item) =>
        item._id === value ||
        item.id === value ||
        String(item._id) === String(value) ||
        String(item.id) === String(value)
    );
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
        if (!item) return value;
        return extractName(item);
      })
      .filter(Boolean)
      .join(", ");
  };

  const getUserNameById = (value) => {
    if (!value) return "";
    if (typeof value === "object") return getUserName(value);

    const user = findEntity(users, value);
    if (user) return getUserName(user);

    return value;
  };

  const normalizeId = (value) => {
    if (!value) return "";
    if (typeof value === "object") {
      return String(value._id || value.id || value.projectId || value);
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
      setProjects(sortByNewest(projectData || []));
    } catch (error) {
      console.error(error);
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
              tasks: tasksRes.data?.data || tasksRes.data || []
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
              tasks: tasksRes.data?.data || tasksRes.data || []
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

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${TASK_URL}/all`);
      const taskData = res.data?.data || res.data?.tasks || res.data || [];
      const normalized = Array.isArray(taskData) ? taskData : [];
      setTasks(normalized);
    } catch (error) {
      console.error("Tasks fetch error:", error);
      setTasks([]);
    }
  };

  const getTeamLeadDisplayName = (lead) => {
    if (!lead) return "";
    if (typeof lead === "string") return lead;

    const direct =
      lead?.name ||
      lead?.fullName ||
      lead?.displayName ||
      lead?.user?.name ||
      lead?.user?.fullName ||
      lead?.user?.displayName ||
      [lead?.firstName, lead?.lastName].filter(Boolean).join(" ") ||
      [lead?.user?.firstName, lead?.user?.lastName].filter(Boolean).join(" ") ||
      "";

    if (direct) return direct;

    return "Team Lead";
  };

  const getTeamLeadNameById = (value) => {
    if (!value) return "";
    if (typeof value === "object") return getTeamLeadDisplayName(value);

    const match = teamLeadOptions.find(
      (item) => (item.value || item._id) === String(value)
    );
    if (match) return match.name;

    return getUserNameById(value);
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

    const emp = findEntity(employees, value);
    if (emp) return getEmployeeName(emp);

    return value;
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
    if (!task) return { empNames: "", internNames: "" };
    const projId =
      task?.projectId?._id || task?.projectId || task?.project?._id || task?.project || "";
    const project = findEntity(projects, projId) || null;

    const empNames = project ? getNamesByIds(employees, project.employees, "employee") : "";
    const internNames = project ? getNamesByIds(users, project.interns, "user") : "";

    return { empNames, internNames };
  };

  const handleMilestoneChange = (e) => {
    setMilestoneForm({
      ...milestoneForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleTaskChange = (e) => {
    setTaskForm({
      ...taskForm,
      [e.target.name]: e.target.value,
    });
  };

  const openAddMilestone = () => {
    setMilestoneForm({
      projectId: selectedProject?._id || "",
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

  const openAddTask = async () => {
    let visibleMilestones = milestones;

    if (selectedProject) {
      visibleMilestones = await fetchMilestonesByProject(selectedProject._id);
    }

    const milestoneToUse = selectedMilestone || visibleMilestones[0] || null;

    if (!milestoneToUse) {
      alert("Please select or create a milestone first");
      return;
    }

    const selected = await loadSelectedMilestone(milestoneToUse._id || milestoneToUse.id);
    setSelectedMilestone(selected || milestoneToUse);
    setTaskForm({
      projectId: selectedProject?._id || "",
      milestoneId: milestoneToUse?._id || milestoneToUse?.id || "",
      taskTitle: "",
      description: "",
      assignedTo: "",
      assignedBy: "",
      startDate: "",
      dueDate: "",
      priority: "medium",
      progress: 0,
      status: "pending",
    });

    setShowTaskModal(true);
  };

  const addMilestone = async (e) => {
    e.preventDefault();

    const projectId = milestoneForm.projectId || selectedProject?._id || "";
    if (!projectId) {
      alert("Please select a project for this milestone.");
      return;
    }

    try {
      const payload = {
        projectId,
        title: milestoneForm.title,
        description: milestoneForm.description,
        dueDate: milestoneForm.dueDate || null,
        progress: Number(milestoneForm.progress) || 0,
        status: milestoneForm.status,
        completedAt: milestoneForm.completedAt || null,
      };

      const res = await axios.post(`${MILESTONE_URL}/create`, payload).catch((error) => {
        if (error?.response?.status === 404 || error?.response?.status === 405) {
          return axios.post(MILESTONE_URL, payload);
        }
        throw error;
      });
      const createdMilestone = res.data?.data || res.data?.milestone || res.data;

      if (createdMilestone) {
        setMilestones((prev) => sortByNewest([createdMilestone, ...prev]));
      }

      await fetchMilestones();
      setSelectedMilestone(createdMilestone || null);
      setShowMilestoneModal(false);
    } catch (error) {
      console.error("Milestone create error:", error);
      alert("Milestone create failed");
    }
  };

  const addTask = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        projectId: taskForm.projectId || selectedProject?._id || selectedProject?.id || null,
        milestoneId: taskForm.milestoneId || selectedMilestone?._id || selectedMilestone?.id || null,
        taskTitle: taskForm.taskTitle,
        description: taskForm.description,
        assignedTo: taskForm.assignedTo,
        assignedBy: taskForm.assignedBy || null,
        startDate: taskForm.startDate || null,
        dueDate: taskForm.dueDate || null,
        priority: taskForm.priority,
        progress: Number(taskForm.progress),
        status: taskForm.status,
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
          }
        }
      }

      if (!payload.projectId || !payload.milestoneId) {
        alert("Please select both a project and a milestone before adding a task.");
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
    } catch (error) {
      console.error("Task create error:", error?.response?.data || error?.message || error);
      alert("Task creation failed: " + (error?.response?.data?.message || error?.message || "Unknown error"));
    }
  };

  const openEditProject = (project) => {
    setSelectedProject(project);

    setProjectForm({
      projectName: project.projectName || "",
      projectDescription: project.projectDescription || "",
      clientName: project.clientName || "",
      clientEmail: project.clientEmail || "",
      projectBudget: project.projectBudget || "",
      startDate: project.startDate ? project.startDate.split("T")[0] : project.startDate || "",
      endDate: project.endDate ? project.endDate.split("T")[0] : project.endDate || "",
      priority: project.priority || "medium",
      status: project.status || "pending",
      assignedEmployee: Array.isArray(project.employees) && project.employees.length > 0 ? (project.employees[0]._id || project.employees[0] || "") : "",
      assignedTL: project.teamLead?._id || project.teamLead || "",
      assignedIntern: Array.isArray(project.interns) && project.interns.length > 0 ? (project.interns[0]._id || project.interns[0] || "") : "",
    });

    setShowProjectModal(true);
  };

  const handleAddProject = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        projectName: projectForm.projectName,
        projectDescription: projectForm.projectDescription,
        clientName: projectForm.clientName,
        clientEmail: projectForm.clientEmail,
        projectBudget: Number(projectForm.projectBudget) || 0,
        startDate: projectForm.startDate || null,
        endDate: projectForm.endDate || null,
        priority: projectForm.priority,
        status: projectForm.status,
        employees: projectForm.assignedEmployee ? [projectForm.assignedEmployee] : [],
        teamLead: projectForm.assignedTL || null,
        interns: projectForm.assignedIntern ? [projectForm.assignedIntern] : [],
      };

      if (selectedProject && selectedProject._id) {
        const id = selectedProject._id;

        const currentTL = selectedProject.teamLead?._id || selectedProject.teamLead || "";
        const currentEmployee = Array.isArray(selectedProject.employees) && selectedProject.employees.length > 0 ? (selectedProject.employees[0]._id || selectedProject.employees[0] || "") : "";
        const currentIntern = Array.isArray(selectedProject.interns) && selectedProject.interns.length > 0 ? (selectedProject.interns[0]._id || selectedProject.interns[0] || "") : "";
        const currentStatus = selectedProject.status || "";

        if (
          (projectForm.status || "") !== currentStatus ||
          (projectForm.priority || "") !== (selectedProject.priority || "")
        ) {
          await axios.put(`${API_CORE}/project/status/${id}`, {
            status: projectForm.status,
            priority: projectForm.priority,
          });
        }

        if ((projectForm.assignedTL || "") !== (currentTL || "")) {
          await axios.put(`${API_CORE}/project/teamlead/${id}`, { teamLead: projectForm.assignedTL || null });
        }

        if ((projectForm.assignedEmployee || "") !== (currentEmployee || "")) {
          await axios.put(`${API_CORE}/project/employees/${id}`, { employees: projectForm.assignedEmployee ? [projectForm.assignedEmployee] : [] });
        }

        if ((projectForm.assignedIntern || "") !== (currentIntern || "")) {
          await axios.put(`${API_CORE}/project/interns/${id}`, { interns: projectForm.assignedIntern ? [projectForm.assignedIntern] : [] });
        }
      } else {
        await axios.post(`${BASE_URL}/create`, payload);
      }

      await fetchProjects();
      setProjectForm(defaultProjectForm);
      setShowProjectModal(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Add Project Error:", error);
      alert("Project add failed");
    }
  };

  const visibleTasks = selectedMilestone
    ? tasks.filter((task) => isSameId(getTaskMilestoneId(task), selectedMilestone?._id || selectedMilestone?.id))
    : tasks;

  return (
    <div className="p-4 sm:p-6 border bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Task Management</h1>

        <button
          onClick={() => {
            setSelectedProject(null);
            setProjectForm(defaultProjectForm);
            setShowProjectModal(true);
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 border focus:outline-none"
        >
          <span className="text-lg">+</span>
          <span>Add Project</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin border-2 border-t-2 border-blue-600 h-12 w-12 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Projects Column */}
          <div className="border p-4 h-[400px] sm:h-[500px] flex flex-col">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Projects</h2>

            <div className="space-y-3 overflow-y-auto pr-2 flex-1">
              {projects.length > 0 ? (
                sortByNewest(projects).map((project) => (
                  <div
                    key={project._id}
                    className="border p-4 cursor-pointer hover:bg-gray-50 relative"
                    onClick={async () => {
                      setSelectedProject(project);
                      setSelectedMilestone(null);
                      setProjectMilestones([]);
                      await fetchMilestonesByProject(project._id);
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditProject(project);
                      }}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100"
                      aria-label="Edit project"
                    >
                      ✎
                    </button>

                    <h3 className="font-bold text-sm sm:text-base">{project.projectName}</h3>
                    <p className="text-sm text-gray-600">{project.clientName}</p>
                    <div className="mt-2 space-y-1 text-xs sm:text-sm">
                      <p>Status: <span className="font-medium">{project.status}</span></p>
                      <p>Priority: <span className="font-medium">{project.priority}</span></p>
                      <p>Employee: {getNamesByIds(employees, project.employees, "employee")}</p>
                      <p>TL: {getTeamLeadNameById(project.teamLead)}</p>
                      <p>Intern: {getNamesByIds(users, project.interns, "user")}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No Projects Found</p>
              )}
            </div>
          </div>

          {/* Milestones Column */}
          <div className="border p-4 h-[400px] sm:h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Milestones</h2>
              <button
                type="button"
                onClick={openAddMilestone}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base border"
              >
                <span className="text-lg">+</span>
                <span>Add</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              {selectedProject ? (
                <div className="space-y-3">
                  {(() => {
                    const projectMilestones = sortByNewest(
                      milestones.filter((milestone) =>
                        isSameId(getMilestoneProjectId(milestone), selectedProject?._id)
                      )
                    );

                    return projectMilestones.length > 0 ? (
                      projectMilestones.map((milestone) => (
                        <div
                          key={milestone._id}
                          className="border p-3 sm:p-4 cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSelectMilestone(milestone)}
                        >
                          <h3 className="font-semibold text-sm sm:text-base">
                            {getMilestoneTitle(milestone)}
                          </h3>
                          <p className="text-xs sm:text-sm">Status: {milestone.status}</p>
                          {milestone.description && (
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">{milestone.description}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">No milestones found</p>
                    );
                  })()}
                </div>
              ) : (
                <div className="space-y-3">
                  {milestones.length > 0 ? (
                    sortByNewest(milestones).map((milestone) => (
                      <div
                        key={milestone._id}
                        className="border p-3 sm:p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSelectMilestone(milestone)}
                      >
                        <h3 className="font-semibold text-sm sm:text-base">
                          {getMilestoneTitle(milestone)}
                        </h3>
                        <p className="text-xs sm:text-sm">Status: {milestone.status}</p>
                        {milestone.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">{milestone.description}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No milestones found</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tasks Column */}
          <div className="border p-4 h-[400px] sm:h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Tasks</h2>
              <button
                type="button"
                onClick={openAddTask}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base border"
              >
                <span className="text-lg">+</span>
                <span>Add</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              {selectedMilestone ? (
                <div className="space-y-3">
                  {visibleTasks.length > 0 ? (
                    visibleTasks.map((task) => (
                      <div key={task._id} className="border p-3 sm:p-4">
                        <h3 className="font-semibold text-sm sm:text-base">{task.taskTitle || task.title || "Untitled Task"}</h3>
                        <p className="text-xs sm:text-sm">Assigned: {getUserNameById(task.assignedTo)}</p>
                        <p className="text-xs sm:text-sm">Status: {task.status || "pending"}</p>
                        {task.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        {(() => {
                          const p = getProjectParticipants(task);
                          return (
                            <>
                              <p className="text-xs sm:text-sm">Employee: {p.empNames || "—"}</p>
                              <p className="text-xs sm:text-sm">Intern: {p.internNames || "—"}</p>
                            </>
                          );
                        })()}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No tasks found for this milestone</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleTasks.length > 0 ? (
                    visibleTasks.map((task) => (
                      <div key={task._id} className="border p-3 sm:p-4">
                        <h3 className="font-semibold text-sm sm:text-base">{task.taskTitle || task.title || "Untitled Task"}</h3>
                        <p className="text-xs sm:text-sm">Assigned: {getUserNameById(task.assignedTo)}</p>
                        <p className="text-xs sm:text-sm">Status: {task.status || "pending"}</p>
                        {task.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        {(()=>{
                          const p = getProjectParticipants(task);
                          return (
                            <>
                              <p className="text-xs sm:text-sm">Employee: {p.empNames || "—"}</p>
                              <p className="text-xs sm:text-sm">Intern: {p.internNames || "—"}</p>
                            </>
                          );
                        })()}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No tasks found</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl shadow-2xl max-h-[95vh] overflow-hidden">
            <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b bg-blue-600 text-white">
              <h2 className="text-xl sm:text-2xl font-semibold">
                {selectedProject ? "Edit Project" : "Add Project"}
              </h2>
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="text-2xl hover:scale-110"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddProject} className="p-4 sm:p-6 overflow-y-auto max-h-[85vh]">
              {!selectedProject ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      name="projectName"
                      placeholder="Project Name"
                      value={projectForm.projectName}
                      onChange={handleChange}
                      className="border px-4 py-3 w-full"
                      required
                    />
                    <input
                      name="clientName"
                      placeholder="Client Name"
                      value={projectForm.clientName}
                      onChange={handleChange}
                      className="border px-4 py-3 w-full"
                      required
                    />
                    <input
                      name="clientEmail"
                      type="email"
                      placeholder="Client Email"
                      value={projectForm.clientEmail}
                      onChange={handleChange}
                      className="border px-4 py-3 w-full"
                    />
                    <input
                      name="projectBudget"
                      type="number"
                      placeholder="Project Budget"
                      value={projectForm.projectBudget}
                      onChange={handleChange}
                      className="border px-4 py-3 w-full"
                    />
                    <input
                      type="date"
                      name="startDate"
                      value={projectForm.startDate}
                      onChange={handleChange}
                      className="border px-4 py-3 w-full"
                    />
                    <input
                      type="date"
                      name="endDate"
                      value={projectForm.endDate}
                      onChange={handleChange}
                      className="border px-4 py-3 w-full"
                    />
                  </div>

                  <textarea
                    name="projectDescription"
                    placeholder="Project Description"
                    value={projectForm.projectDescription}
                    onChange={handleChange}
                    rows={4}
                    className="border px-4 py-3 w-full mt-4"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <select
                      name="priority"
                      value={projectForm.priority}
                      onChange={handleChange}
                      className="border px-4 py-3"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <select
                      name="status"
                      value={projectForm.status}
                      onChange={handleChange}
                      className="border px-4 py-3"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    {(() => {
                      const selectedLead = teamLeadOptions.find(
                        (item) => (item.value || item._id) === String(projectForm.assignedTL)
                      );
                      const employeeOptions =
                        selectedLead && Array.isArray(selectedLead.employees) && selectedLead.employees.length > 0
                          ? selectedLead.employees
                          : employees;

                      return (
                        <select
                          name="assignedEmployee"
                          value={projectForm.assignedEmployee}
                          onChange={handleChange}
                          className="border px-4 py-3"
                        >
                          <option value="">Select Employee</option>
                          {employeeOptions.map((emp) => (
                            <option key={emp._id || emp.id || emp} value={emp._id || emp.id || emp}>
                              {getEmployeeName(emp)}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                    <select
                      name="assignedTL"
                      value={projectForm.assignedTL}
                      onChange={handleChange}
                      className="border px-4 py-3"
                    >
                      <option value="">Select TL</option>
                      {(teamLeadOptions.length > 0
                        ? teamLeadOptions
                        : users.filter((user) => {
                            const role = String(user.role || "").trim().toLowerCase();
                            return role === "team lead" || role === "tl" || role === "teamlead";
                          })
                      ).map((item) => (
                        <option key={item.value || item._id} value={item.value || item._id}>
                          {item.name || getUserName(item)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(() => {
                    const selectedLead = teamLeadOptions.find(
                      (item) => (item.value || item._id) === String(projectForm.assignedTL)
                    );

                    const internOptions =
                      selectedLead && Array.isArray(selectedLead.interns) && selectedLead.interns.length > 0
                        ? selectedLead.interns
                        : users.filter((user) => String(user.role || "").trim().toLowerCase().includes("intern"));

                    return (
                      <select
                        name="assignedIntern"
                        value={projectForm.assignedIntern}
                        onChange={handleChange}
                        className="border px-4 py-3 w-full mt-4"
                      >
                        <option value="">Select Intern</option>
                        {internOptions.map((user) => (
                          <option key={user._id || user.id || user} value={user._id || user.id || user}>
                            {getUserName(user)}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </>
              ) : (
                <div className="space-y-4">
                  <select
                    name="priority"
                    value={projectForm.priority}
                    onChange={handleChange}
                    className="border px-4 py-3 w-full"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <select
                    name="status"
                    value={projectForm.status}
                    onChange={handleChange}
                    className="border px-4 py-3 w-full"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold"
              >
                {selectedProject ? "Update Project" : "Save Project"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex justify-center items-center p-4">
          <div className="bg-white p-4 sm:p-6 w-full max-w-lg relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowMilestoneModal(false)}
              className="absolute top-4 right-4 text-2xl"
            >
              ×
            </button>

            <form onSubmit={addMilestone}>
              <h2 className="text-xl sm:text-2xl font-bold mb-5">Add Milestone</h2>

              <label className="block text-sm font-medium mb-1">Project</label>
              <select
                name="projectId"
                value={milestoneForm.projectId}
                onChange={handleMilestoneChange}
                className="w-full border p-3 mb-3"
                required
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.projectName}
                  </option>
                ))}
              </select>

              <input
                name="title"
                placeholder="Milestone Title"
                value={milestoneForm.title}
                onChange={handleMilestoneChange}
                className="w-full border p-3 mb-3"
                required
              />

              <textarea
                name="description"
                placeholder="Description"
                value={milestoneForm.description}
                onChange={handleMilestoneChange}
                className="w-full border p-3 mb-3"
                rows="3"
              />

              <input
                type="datetime-local"
                name="dueDate"
                value={milestoneForm.dueDate}
                onChange={handleMilestoneChange}
                className="w-full border p-3 mb-3"
              />

              <input
                type="number"
                min="0"
                max="100"
                name="progress"
                placeholder="Progress (%)"
                value={milestoneForm.progress}
                onChange={handleMilestoneChange}
                className="w-full border p-3 mb-3"
              />

              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={milestoneForm.status}
                onChange={handleMilestoneChange}
                className="w-full border p-3 mb-3"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <input
                type="datetime-local"
                name="completedAt"
                value={milestoneForm.completedAt}
                onChange={handleMilestoneChange}
                className="w-full border p-3 mb-3"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                Save Milestone
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex justify-center items-center overflow-auto py-10 p-4">
          <div className="bg-white p-4 sm:p-6 w-full max-w-md relative">
            <button
              type="button"
              onClick={() => setShowTaskModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
              aria-label="Close"
            >
              ×
            </button>
            <form onSubmit={addTask}>
              <h2 className="text-xl font-bold mb-4">Add Task</h2>

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
                  setTaskForm((prev) => ({
                    ...prev,
                    projectId: project?._id || projectId || "",
                    milestoneId: "",
                  }));

                  if (projectId) {
                    await fetchMilestonesByProject(projectId);
                  } else {
                    setProjectMilestones([]);
                  }
                }}
                className="w-full border p-2 mb-3"
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.projectName}
                  </option>
                ))}
              </select>

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
                className="w-full border p-2 mb-3"
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

              <input
                name="taskTitle"
                placeholder="Task Title"
                value={taskForm.taskTitle}
                onChange={handleTaskChange}
                className="w-full border p-2 mb-3"
                required
              />

              <textarea
                name="description"
                placeholder="Description"
                value={taskForm.description}
                onChange={handleTaskChange}
                className="w-full border p-2 mb-3"
                rows="3"
              />

              <select
                name="assignedTo"
                value={taskForm.assignedTo}
                onChange={handleTaskChange}
                className="w-full border p-2 mb-3"
                required
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {getUserName(user)}
                  </option>
                ))}
              </select>

              <select
                name="assignedBy"
                value={taskForm.assignedBy}
                onChange={handleTaskChange}
                className="w-full border p-2 mb-3"
              >
                <option value="">Assigned By</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {getUserName(user)}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  name="startDate"
                  value={taskForm.startDate}
                  onChange={handleTaskChange}
                  className="w-full border p-2 mb-3"
                />
                <input
                  type="date"
                  name="dueDate"
                  value={taskForm.dueDate}
                  onChange={handleTaskChange}
                  className="w-full border p-2 mb-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  name="priority"
                  value={taskForm.priority}
                  onChange={handleTaskChange}
                  className="w-full border p-2 mb-3"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input
                  type="number"
                  min="0"
                  max="100"
                  name="progress"
                  value={taskForm.progress}
                  onChange={handleTaskChange}
                  className="w-full border p-2 mb-3"
                />
              </div>

              <select
                name="status"
                value={taskForm.status}
                onChange={handleTaskChange}
                className="w-full border p-2 mb-3"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2"
              >
                Save Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}