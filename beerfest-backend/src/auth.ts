import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change-me";

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function requireAuth(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
  if (!token) return res.status(401).json({ ok: false, msg: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ ok: false, msg: "Invalid token" });
  }
}

export function requireAdmin(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) {
  if (req.user?.uid === 1) return next();
  return res.status(403).json({ ok: false, msg: "Only admin can do this" });
}
