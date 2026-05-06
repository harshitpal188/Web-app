const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, project, assignedTo } = req.body;
    const projectDoc = await Project.findById(project);
    if (!projectDoc) return res.status(404).json({ message: "Project not found" });

    if (projectDoc.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin owner can create tasks" });
    }

    const assignee = await User.findById(assignedTo).select("_id");
    if (!assignee) {
      return res.status(400).json({ message: "Assigned user does not exist" });
    }

    const assigneeIdStr = assignedTo.toString();
    const isMember = projectDoc.members.some((memberId) => memberId.toString() === assigneeIdStr);
    if (!isMember) {
      projectDoc.members.push(assignedTo);
      await projectDoc.save();
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      project,
      assignedTo,
      createdBy: req.user._id,
    });

    const populatedTask = await task.populate([
      { path: "assignedTo", select: "name email role" },
      { path: "project", select: "title" },
    ]);

    return res.status(201).json(populatedTask);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create task", error: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const { status, priority, search, scope } = req.query;

    let filter;
    if (scope === "project") {
      if (req.user.role === "admin") {
        const adminProjectIds = await Project.find({ createdBy: req.user._id }).distinct("_id");
        filter = { project: { $in: adminProjectIds } };
      } else {
        const joinedIds = await Project.find({ members: req.user._id }).distinct("_id");
        filter = { project: { $in: joinedIds } };
      }
    } else {
      filter =
        req.user.role === "admin"
          ? { createdBy: req.user._id }
          : { assignedTo: req.user._id };
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.title = { $regex: search, $options: "i" };

    const tasks = await Task.find(filter)
      .populate("project", "title")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ dueDate: 1 });

    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "title")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isAdminOwner =
      req.user.role === "admin" && task.createdBy._id.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo._id.toString() === req.user._id.toString();

    let isProjectMember = false;
    if (req.user.role === "member") {
      const proj = await Project.findById(task.project._id || task.project).select("members");
      isProjectMember =
        proj?.members?.some((m) => m.toString() === req.user._id.toString()) ?? false;
    }

    const canAccess = isAdminOwner || isAssignee || isProjectMember;
    if (!canAccess) return res.status(403).json({ message: "Forbidden" });

    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch task", error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role === "member") {
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }
      task.status = req.body.status ?? task.status;
      await task.save();
      return res.json(task);
    }

    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.status = status ?? task.status;
    task.priority = priority ?? task.priority;
    task.dueDate = dueDate ?? task.dueDate;

    if (assignedTo !== undefined && assignedTo !== task.assignedTo.toString()) {
      const assignee = await User.findById(assignedTo).select("_id");
      if (!assignee) return res.status(400).json({ message: "Assigned user does not exist" });
      const proj = await Project.findById(task.project);
      if (proj) {
        const aid = assignedTo.toString();
        if (!proj.members.some((m) => m.toString() === aid)) {
          proj.members.push(assignedTo);
          await proj.save();
        }
      }
      task.assignedTo = assignedTo;
    }

    await task.save();
    const updated = await task.populate([
      { path: "project", select: "title" },
      { path: "assignedTo", select: "name email role" },
    ]);

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update task", error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await task.deleteOne();
    return res.json({ message: "Task deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete task", error: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const baseFilter = req.user.role === "admin" ? { createdBy: req.user._id } : { assignedTo: req.user._id };

    const [totalTasks, completedTasks, pendingTasks, overdueTasks] = await Promise.all([
      Task.countDocuments(baseFilter),
      Task.countDocuments({ ...baseFilter, status: "completed" }),
      Task.countDocuments({ ...baseFilter, status: "pending" }),
      Task.countDocuments({
        ...baseFilter,
        status: { $ne: "completed" },
        dueDate: { $lt: now },
      }),
    ]);

    const joinedProjectsFilter = { members: req.user._id };
    const totalProjectsJoined =
      req.user.role === "admin"
        ? await Project.countDocuments({ createdBy: req.user._id })
        : await Project.countDocuments(joinedProjectsFilter);

    const totalProjectsAvailable = await Project.countDocuments({});

    return res.json({
      totalProjects: totalProjectsJoined,
      totalProjectsAvailable,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getDashboardStats,
};
