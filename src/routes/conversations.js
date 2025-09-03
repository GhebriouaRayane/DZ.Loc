import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { startConversationSchema, sendMessageSchema } from "../validators/messages.js";
import { query } from "../db.js";

const router = Router();

router.get("/", authRequired, async (req, res) => {
  const { rows } = await query(
    `select c.*, 
      (select row_to_json(p) from (select id,title from properties where id=c.property_id) p) as property
     from conversations c
     where c.user1_id=$1 or c.user2_id=$1
     order by c.last_updated desc`,
    [req.user.id]
  );
  res.json(rows);
});

router.post("/start", authRequired, validate(startConversationSchema), async (req, res) => {
  const { property_id, other_user_id } = req.validated;
  // existe ?
  const { rows } = await query(
    `select * from conversations where property_id=$1 and
     ((user1_id=$2 and user2_id=$3) or (user1_id=$3 and user2_id=$2))`,
    [property_id, req.user.id, other_user_id]
  );
  if (rows[0]) return res.json(rows[0]);

  const inserted = await query(
    `insert into conversations(property_id,user1_id,user2_id) values($1,$2,$3) returning *`,
    [property_id, req.user.id, other_user_id]
  );
  res.status(201).json(inserted.rows[0]);
});

router.get("/:id/messages", authRequired, async (req, res) => {
  const id = +req.params.id;
  const conv = await query("select * from conversations where id=$1 and (user1_id=$2 or user2_id=$2)", [id, req.user.id]);
  if (!conv.rowCount) return res.status(404).json({ error: "Not found" });
  const { rows } = await query("select * from messages where conversation_id=$1 order by timestamp asc", [id]);
  res.json(rows);
});

router.post("/message", authRequired, validate(sendMessageSchema), async (req, res) => {
  const { conversation_id, content } = req.validated;
  const conv = await query("select * from conversations where id=$1 and (user1_id=$2 or user2_id=$2)", [conversation_id, req.user.id]);
  if (!conv.rowCount) return res.status(404).json({ error: "Not found" });
  const { rows } = await query(
    "insert into messages(conversation_id,sender_id,content) values($1,$2,$3) returning *",
    [conversation_id, req.user.id, content]
  );
  await query("update conversations set last_updated=now() where id=$1", [conversation_id]);
  res.status(201).json(rows[0]);
});

export default router;

