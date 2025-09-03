import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { query } from "../db.js";

const router = Router();

router.get("/me", authRequired, async (req, res) => {
  const { rows } = await query(
    "select id, full_name, email, phone, user_type, avatar_url, bio, created_at from users where id=$1",
    [req.user.id]
  );
  res.json(rows[0]);
});

router.put("/me", authRequired, async (req, res) => {
  const { full_name, phone, email, bio, avatar_url } = req.body;
  // Empêcher collision email
  const existing = await query("select 1 from users where email=$1 and id<>$2", [email, req.user.id]);
  if (existing.rowCount) return res.status(409).json({ error: "Cet email est déjà utilisé" });

  const { rows } = await query(
    `update users set full_name=$1, phone=$2, email=$3, bio=$4, avatar_url=coalesce($5, avatar_url)
     where id=$6 returning id, full_name, email, phone, user_type, avatar_url, bio`,
    [full_name, phone, email, bio, avatar_url, req.user.id]
  );
  res.json(rows[0]);
});

router.post("/me/favorites/:propertyId", authRequired, async (req, res) => {
  const propertyId = +req.params.propertyId;
  await query("insert into favorites(user_id,property_id) values($1,$2) on conflict do nothing", [req.user.id, propertyId]);
  res.json({ ok: true });
});

router.delete("/me/favorites/:propertyId", authRequired, async (req, res) => {
  const propertyId = +req.params.propertyId;
  await query("delete from favorites where user_id=$1 and property_id=$2", [req.user.id, propertyId]);
  res.json({ ok: true });
});

router.get("/me/favorites", authRequired, async (req, res) => {
  const { rows } = await query(
    `select p.*,
      coalesce(json_agg(pi.url) filter (where pi.url is not null), '[]') as images
     from favorites f
     join properties p on p.id=f.property_id
     left join property_images pi on pi.property_id=p.id
     where f.user_id=$1
     group by p.id
     order by p.date_added desc`,
    [req.user.id]
  );
  res.json(rows);
});

export default router;

