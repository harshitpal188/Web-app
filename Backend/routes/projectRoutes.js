const express = require("express");
const { body, param } = require("express-validator");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  joinProject,
} = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { handleValidationErrors } = require("../middleware/errorMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  roleMiddleware("admin"),
  [
    body("title").notEmpty().withMessage("Project title is required"),
    body("description").optional().isString(),
    body("members").optional().isArray().withMessage("Members must be an array"),
    handleValidationErrors,
  ],
  createProject
);

router.get("/", getProjects);

router.post(
  "/:id/join",
  [param("id").isMongoId().withMessage("Invalid project ID"), handleValidationErrors],
  joinProject
);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid project ID"), handleValidationErrors],
  getProjectById
);

router.put(
  "/:id",
  roleMiddleware("admin"),
  [
    param("id").isMongoId().withMessage("Invalid project ID"),
    body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    body("members").optional().isArray().withMessage("Members must be an array"),
    handleValidationErrors,
  ],
  updateProject
);

router.delete(
  "/:id",
  roleMiddleware("admin"),
  [param("id").isMongoId().withMessage("Invalid project ID"), handleValidationErrors],
  deleteProject
);

module.exports = router;
