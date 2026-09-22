import * as yup from "yup"; // ✅ ESM-safe import

/* ─── Schemas ────────────────────────────────────────────── */

export const userSchema = yup.object({
  username: yup
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username cannot exceed 50 characters")
    .matches(
      /^[a-zA-Z0-9_ ]+$/,
      "Username can only contain letters, numbers, underscores, and spaces",
    )
    .required("Username is required"),

  email: yup
    .string()
    .trim()
    .lowercase() // ✅ normalize before save
    .email("Please enter a valid email")
    .required("Email is required"),

  password: yup
    .string()
    .min(6, "Password must be at least 6 characters") // ✅ model se match
    .max(64, "Password cannot exceed 64 characters") // ✅ bcrypt 72-char limit
    .required("Password is required"),
});

/* ─── Middleware factory ─────────────────────────────────── */

export const validateUser = (schema) => async (req, res, next) => {
  try {
    // ✅ abortEarly: false — saari errors ek saath
    // ✅ stripUnknown: true — extra fields silently hata do
    req.body = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    next();
  } catch (err) {
    // ✅ Baaki codebase ke saath consistent format
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.errors, // array of all error strings
    });
  }
};
