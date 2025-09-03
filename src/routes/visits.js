import { Router } from "express";
import { authRequired, ownerOnly } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { scheduleSchema, respondSchema } from "../validators/visits.js";
import { query } from "../db.js";

const router = Router();

router.get("/", authRequired, async (req, res) => {
  // owner -> demandes pour ses propriétés / tenant -> ses demandes
  if (req.user.user_type === "owner") {
    const { rows } = await query(
      `select v.*, p.title, p.address, p.city from visits v
       join properties p on p.id=v.property_id
       where p.owner_id=$1
       order by v.created_at desc`,
      [req.user.id]
    );
    return res.json(rows);
  } else {
    const { rows } = await query(
      `select v.*, p.title, p.address, p.city from visits v
       join properties p on p.id=v.property_id
       where v.user_id=$1
       order by v.created_at desc`,
      [req.user.id]
    );
    return res.json(rows);
  }
});

router.post("/schedule", authRequired, validate(scheduleSchema), async (req, res) => {
  const { property_id, date, time, message } = req.validated;
  const { rows } = await query(
    `insert into visits(property_id,user_id,date,time,message)
     values($1,$2,$3,$4,$5) returning *`,
    [property_id, req.user.id, date, time, message]
  );
  res.status(201).json(rows[0]);
});

router.post("/respond", authRequired, ownerOnly, validate(respondSchema), async (req, res) => {
  const { visit_id, status, owner_response } = req.validated;
  // Check ownership via property
  const own = await query(
    `select 1 from visits v join properties p on p.id=v.property_id
     where v.id=$1 and p.owner_id=$2`,
    [visit_id, req.user.id]
  );
  if (!own.rowCount) return res.status(403).json({ error: "Not your visit request" });

  const { rows } = await query(
    `update visits set status=$1, owner_response=$2, responded_at=now() where id=$3 returning *`,
    [status, owner_response, visit_id]
  );
  res.json(rows[0]);
});

export default router;

