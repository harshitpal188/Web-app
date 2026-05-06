import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

const isUserInProject = (project, userId) =>
  project?.members?.some((m) => (m._id || m.id)?.toString() === userId?.toString());

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const fetchProjects = async () => {
    try {
      const { data } = await axiosClient.get("/projects");
      setProjects(data);
    } catch (error) {
      toast.error("Failed to load projects");
    }
  };

  const joinProject = async (projectId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await axiosClient.post(`/projects/${projectId}/join`);
      toast.success("Joined project");
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not join project");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post("/projects", { title, description });
      setTitle("");
      setDescription("");
      toast.success("Project created");
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project");
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">Projects</h2>

      {user?.role === "admin" && (
        <form onSubmit={onCreate} className="mb-6 rounded-xl border bg-white p-4">
          <h3 className="mb-3 font-medium">Create Project</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="input" placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <input
              className="input"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button className="btn btn-primary mt-3">Create</button>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => {
          const joined = isUserInProject(project, user?.id);
          return (
            <div key={project._id} className="rounded-xl border bg-white p-4 shadow-sm">
              <Link to={`/projects/${project._id}`} className="block">
                <h3 className="font-semibold">{project.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{project.description || "No description"}</p>
                <p className="mt-2 text-xs text-slate-500">Members: {project.members?.length || 0}</p>
              </Link>
              {user?.role === "member" && (
                <div className="mt-3 flex items-center gap-2 border-t pt-3">
                  {joined ? (
                    <span className="text-xs font-medium text-emerald-600">You are a member</span>
                  ) : (
                    <button type="button" className="btn btn-primary text-sm" onClick={(e) => joinProject(project._id, e)}>
                      Join project
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectsPage;
