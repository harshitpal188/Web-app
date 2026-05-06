import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import StatCard from "../components/StatCard";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, previewTasks] = await Promise.all([
          axiosClient.get("/tasks/stats/dashboard"),
          user?.role === "member"
            ? axiosClient.get("/tasks").then((r) => r.data.slice(0, 8))
            : Promise.resolve([]),
        ]);
        setStats(statsRes.data);
        setMyTasks(previewTasks);
      } catch (error) {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.role]);

  if (loading) return <p>Loading dashboard...</p>;
  if (!stats) return <p>No dashboard data available.</p>;

  const projectsTitle =
    user?.role === "admin" ? "Projects you manage" : "Projects you joined";
  const showBrowseProjects = user?.role === "member" && stats.totalProjectsAvailable != null;

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title={projectsTitle} value={stats.totalProjects} color="indigo" />
        {showBrowseProjects && (
          <StatCard title="All team projects" value={stats.totalProjectsAvailable} color="indigo" />
        )}
        <StatCard title={user?.role === "member" ? "My tasks" : "Total Tasks"} value={stats.totalTasks} color="indigo" />
        <StatCard title="Completed Tasks" value={stats.completedTasks} color="emerald" />
        <StatCard title="Pending Tasks" value={stats.pendingTasks} color="amber" />
        <StatCard title="Overdue Tasks" value={stats.overdueTasks} color="rose" />
      </div>

      {user?.role === "member" && myTasks.length > 0 && (
        <div className="mt-8 rounded-xl border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Tasks assigned to you</h3>
            <Link to="/tasks" className="text-sm text-indigo-600 hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y">
            {myTasks.map((task) => (
              <li key={task._id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-slate-500">
                    {task.project?.title} · Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"} ·{" "}
                    <span className="uppercase">{task.status}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {user?.role === "member" && myTasks.length === 0 && (
        <p className="mt-6 text-sm text-slate-600">
          No tasks assigned yet. Join a project from <Link className="text-indigo-600 hover:underline" to="/projects">Projects</Link>, then your admin can assign work — it will show here and under My tasks.
        </p>
      )}
    </div>
  );
};

export default DashboardPage;
