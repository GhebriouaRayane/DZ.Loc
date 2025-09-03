import { Router } from "express";
import { query } from "../db.js";
import jwt from "jsonwebtoken";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/auth.js";

const router = Router();

router.post("/register", validate(registerSchema), async (req, res) => {
  const { full_name, email, phone, password, user_type } = req.validated;
  const exists = await query("select 1 from users where email=$1", [email]);
  if (exists.rowCount) return res.status(409).json({ error: "Email déjà utilisé" });

  const password_hash = await hashPassword(password);
  const { rows } = await query(
    `insert into users (full_name,email,phone,password_hash,user_type)
     values ($1,$2,$3,$4,$5) returning id, full_name, email, phone, user_type, avatar_url, bio, created_at`,
    [full_name, email, phone, password_hash, user_type]
  );
  const user = rows[0];
  const token = jwt.sign({ id: user.id, user_type: user.user_type }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user });
});

router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.validated;
  const { rows } = await query("select * from users where email=$1", [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: "Identifiants invalides" });
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Identifiants invalides" });
  const token = jwt.sign({ id: user.id, user_type: user.user_type }, process.env.JWT_SECRET, { expiresIn: "7d" });
  delete user.password_hash;
  res.json({ token, user });
});

export default router;

