import { validationResult } from "express-validator";

import { verifyAccess } from "../utils/jwt.js";

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      status: "fail",
      message: "Validation errors",
      errors: errors.array()[0].msg,
    });
    return true;
  }
  return false;
}

export function registerAuth(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;
    next();
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

export function loginAuth(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;
    next();
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

export function requireAuth(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;
    const header = req.headers.authorization || "";
    const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;

    const cookieToken = req.cookies?.access_token || null;
    const token = bearer || cookieToken;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = verifyAccess(token);
    req.user = decoded; // { userId, role, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== role) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}