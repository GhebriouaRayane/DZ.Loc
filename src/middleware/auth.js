import jwt from "jsonwebtoken";

export function authRequired(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, user_type }
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function ownerOnly(req, res, next) {
  if (req.user?.user_type !== "owner") return res.status(403).json({ error: "Owners only" });
  next();
}

