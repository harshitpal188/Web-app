const { validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(400).json({
    message: "Validation error",
    errors: errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    })),
  });
};

module.exports = { handleValidationErrors };
