import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

const isUserInProject = (project, userId) =>
  project?.members?.some((m) => (m._id || m.id)?.toString() === userId?.toString());

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [assignUsers, setAssignUsers] = useState([]);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    assignedTo: "",
  });

  const fetchProject = async () => {
    try {
      const response = await axiosClient.get(`/projects/${id}`);
      setData(response.data);
      if (response.data.project?.members?.length) {
        setTaskForm((prev) => ({ ...prev, assignedTo: response.data.project.members[0]._id }));
      }
    } catch (error) {
      toast.error("Failed to load project details");
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    const loadUsers = async () => {
      if (user?.role !== "admin") return;
      try {
        const { data } = await axiosClient.get("/auth/users");
        setAssignUsers(data);
        setTaskForm((prev) => {
          if (prev.assignedTo) return prev;
          const first = data[0]?._id || data[0]?.id;
          return first ? { ...prev, assignedTo: first } : prev;
        });
      } catch {
        /* ignore — assignment dropdown falls back to project members */
      }
    };
    loadUsers();
  }, [user?.role]);

  const onCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post("/tasks", {
        ...taskForm,
        project: id,
      });
      toast.success("Task created");
      setTaskForm((prev) => ({
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
        assignedTo: prev.assignedTo,
      }));
      fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
    }
  };

  const joinProject = async () => {
    try {
      await axiosClient.post(`/projects/${id}/join`);
      toast.success("Joined project");
      fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not join project");
    }
  };

  if (!data) return <p>Loading project...</p>;

  const joined = isUserInProject(data.project, user?.id);
  const assignOptions =
    assignUsers.length > 0 ? assignUsers : data.project.members || [];

  return (
    <div>
      <h2 className="text-2xl font-semibold">{data.project.title}</h2>
      <p className="mt-1 text-slate-600">{data.project.description}</p>

      {user?.role === "member" && (
        <div className="mt-4">
          {joined ? (
            <p className="text-sm font-medium text-emerald-600">You have joined this project.</p>
          ) : (
            <button type="button" className="btn btn-primary" onClick={joinProject}>
              Join this project
            </button>
          )}
        </div>
      )}

      {user?.role === "admin" && (
        <form onSubmit={onCreateTask} className="mt-6 rounded-xl border bg-white p-4">
          <h3 className="mb-3 font-medium">Create Task</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="input"
              placeholder="Task title"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              required
            />
            <input
              type="date"
              className="input"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              required
            />
            <input
              className="input"
              placeholder="Description"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            />
            <select
              className="input"
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select
              className="input md:col-span-2"
              value={taskForm.assignedTo}
              onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
            >
              {assignOptions.map((u) => {
                const uid = u._id || u.id;
                return (
                  <option key={uid} value={uid}>
                    {u.name} ({u.role}) {u.email ? `— ${u.email}` : ""}
                  </option>
                );
              })}
            </select>
          </div>
          <button className="btn btn-primary mt-3">Create Task</button>
        </form>
      )}

      <div className="mt-6 rounded-xl border bg-white p-4">
        <h3 className="mb-3 text-lg font-medium">Tasks</h3>
        <div className="space-y-3">
          {data.tasks.map((task) => (
            <div key={task._id} className="rounded-lg border p-3">
              <p className="font-medium">{task.title}</p>
              <p className="text-sm text-slate-600">
                {task.status} | {task.priority} | Assigned: {task.assignedTo?.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
