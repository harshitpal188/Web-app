const express = require("express");
const { body, param, query } = require("express-validator");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { handleValidationErrors } = require("../middleware/errorMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/stats/dashboard", getDashboardStats);

router.post(
  "/",
  roleMiddleware("admin"),
  [
    body("title").notEmpty().withMessage("Task title is required"),
    body("status")
      .optional()
      .isIn(["pending", "in-progress", "completed"])
      .withMessage("Invalid status"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage("Invalid priority"),
    body("project").isMongoId().withMessage("Valid project ID is required"),
    body("assignedTo").isMongoId().withMessage("Valid assigned user ID is required"),
    body("dueDate").isISO8601().withMessage("Valid due date is required"),
    handleValidationErrors,
  ],
  createTask
);

router.get(
  "/",
  [
    query("status")
      .optional()
      .isIn(["pending", "in-progress", "completed"])
      .withMessage("Invalid status"),
    query("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority"),
    query("scope").optional().isIn(["project"]).withMessage("Invalid scope"),
    handleValidationErrors,
  ],
  getTasks
);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid task ID"), handleValidationErrors],
  getTaskById
);

router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid task ID"),
    body("status")
      .optional()
      .isIn(["pending", "in-progress", "completed"])
      .withMessage("Invalid status"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage("Invalid priority"),
    handleValidationErrors,
  ],
  updateTask
);

router.delete(
  "/:id",
  roleMiddleware("admin"),
  [param("id").isMongoId().withMessage("Invalid task ID"), handleValidationErrors],
  deleteTask
);

module.exports = router;
