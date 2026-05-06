const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

const createProject = async (req, res) => {
  try {
    const { title, description, members = [] } = req.body;

    const validMembers = await User.find({ _id: { $in: members } }).select("_id");
    const memberIds = [...new Set([req.user._id.toString(), ...validMembers.map((m) => m._id.toString())])];

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      members: memberIds,
    });

    return res.status(201).json(project);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create project", error: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    // All authenticated users see every project; members join to participate.
    const projects = await Project.find({})
      .populate("createdBy", "name email role")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    return res.json(projects);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch projects", error: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("members", "name email role");
    if (!project) return res.status(404).json({ message: "Project not found" });

    const tasks = await Task.find({ project: project._id })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.json({ project, tasks });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch project", error: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    project.title = title ?? project.title;
    project.description = description ?? project.description;

    if (Array.isArray(members)) {
      const validMembers = await User.find({ _id: { $in: members } }).select("_id");
      project.members = [...new Set([req.user._id.toString(), ...validMembers.map((m) => m._id.toString())])];
    }

    await project.save();
    const updated = await project.populate("members", "name email role");
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update project", error: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    return res.json({ message: "Project deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete project", error: error.message });
  }
};

/** Member (or admin) joins a project — adds user to members if not already. */
const joinProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const uid = req.user._id.toString();
    const already = project.members.some((m) => m.toString() === uid);
    if (already) {
      const populated = await project.populate([
        { path: "createdBy", select: "name email role" },
        { path: "members", select: "name email role" },
      ]);
      return res.json({ message: "Already a member", project: populated });
    }

    project.members.push(req.user._id);
    await project.save();
    const populated = await project.populate([
      { path: "createdBy", select: "name email role" },
      { path: "members", select: "name email role" },
    ]);
    return res.json({ message: "Joined project", project: populated });
  } catch (error) {
    return res.status(500).json({ message: "Failed to join project", error: error.message });
  }
};

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject, joinProject };
