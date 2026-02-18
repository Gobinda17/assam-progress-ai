import { verifyAccess } from "../utils/jwt.js";

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;

    const cookieToken = req.cookies?.access_token || null;
    const token = bearer || cookieToken;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = verifyAccess(token);
    req.user = decoded; // { userId, role, email }
    next();
  } catch {
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