const express = require("express");
const { body } = require("express-validator");
const { signup, login, me, listUsers } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { handleValidationErrors } = require("../middleware/errorMiddleware");

const router = express.Router();

router.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["admin", "member"])
      .withMessage("Role must be either admin or member"),
    handleValidationErrors,
  ],
  signup
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    handleValidationErrors,
  ],
  login
);

router.get("/me", authMiddleware, me);

router.get("/users", authMiddleware, roleMiddleware("admin"), listUsers);

module.exports = router;
