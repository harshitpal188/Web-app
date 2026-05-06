import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  /** default = assigned-to-me (member) or tasks I created (admin); project = tasks in joined/admin projects */
  const [listScope, setListScope] = useState("default");

  const fetchTasks = async () => {
    try {
      const { data } = await axiosClient.get("/tasks", {
        params: {
          status: statusFilter || undefined,
          search: search || undefined,
          scope: listScope === "project" ? "project" : undefined,
        },
      });
      setTasks(data);
    } catch (error) {
      toast.error("Failed to load tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, listScope]);

  const isAssignee = (task) =>
    (task.assignedTo?._id || task.assignedTo)?.toString() === user?.id?.toString();

  const onStatusUpdate = async (taskId, status) => {
    try {
      await axiosClient.put(`/tasks/${taskId}`, { status });
      toast.success("Task updated");
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">Tasks</h2>

      <div className="mb-4 grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-3">
        <input className="input" placeholder="Search by task title" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button className="btn btn-primary" onClick={fetchTasks}>
          Apply Filters
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task._id} className="rounded-xl border bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{task.title}</p>
                <p className="text-sm text-slate-600">
                  {task.project?.title} | Priority: {task.priority} | Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-slate-600">Assigned to: {task.assignedTo?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                {user?.role === "admin" || isAssignee(task) ? (
                  <select
                    className="input"
                    value={task.status}
                    onChange={(e) => onStatusUpdate(task._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                ) : (
                  <span className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
                    Status: {task.status}
                  </span>
                )}
                {user?.role === "admin" && (
                  <button
                    className="btn btn-danger"
                    onClick={async () => {
                      try {
                        await axiosClient.delete(`/tasks/${task._id}`);
                        toast.success("Task deleted");
                        fetchTasks();
                      } catch (error) {
                        toast.error("Delete failed");
                      }
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksPage;
