import { Router } from "express";
import { authRequired, ownerOnly } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { propertySchema } from "../validators/properties.js";
import { query } from "../db.js";

const router = Router();

// Liste & recherche
router.get("/", async (req, res) => {
  const { city, type, min_price, max_price, min_surface, bedrooms, sort } = req.query;
  const clauses = [];
  const params = [];
  const push = (sql, val) => { params.push(val); clauses.push(`${sql} $${params.length}`); };
  if (city) push("lower(city) =", city.toLowerCase());
  if (type) push("type =", type);
  if (min_price) push("price >=", +min_price);
  if (max_price) push("price <=", +max_price);
  if (min_surface) push("surface >=", +min_surface);
  if (bedrooms) push("bedrooms >=", +bedrooms);

  const where = clauses.length ? "where " + clauses.join(" and ") : "";
  const order = sort === "price_asc" ? "price asc"
              : sort === "price_desc" ? "price desc"
              : "date_added desc";

  const { rows } = await query(
    `select p.*,
      coalesce(json_agg(pi.url) filter (where pi.url is not null), '[]') as images
     from properties p
     left join property_images pi on pi.property_id=p.id
     ${where}
     group by p.id
     order by ${order}`
    , params
  );
  res.json(rows);
});

// Détail
router.get("/:id", async (req, res) => {
  const id = +req.params.id;
  const { rows } = await query(
    `select p.*,
      coalesce(json_agg(pi.url) filter (where pi.url is not null), '[]') as images,
      coalesce((
        select json_agg(code) from amenities a
        join property_amenities pa on pa.amenity_id=a.id
        where pa.property_id=p.id
      ), '[]') as amenities,
      coalesce((
        select json_agg(json_build_object('user_id',r.user_id,'stars',r.stars,'comment',r.comment,'date',r.created_at))
        from reviews r where r.property_id=p.id
      ), '[]') as reviews
     from properties p
     left join property_images pi on pi.property_id=p.id
     where p.id=$1
     group by p.id`,
    [id]
  );
  res.json(rows[0] || null);
});

// Créer/Modifier/Supprimer (owner)
router.post("/", authRequired, ownerOnly, validate(propertySchema), async (req, res) => {
  const p = req.validated;
  const { rows } = await query(
    `insert into properties
     (owner_id,title,price,type,status,surface,rooms,bedrooms,bathrooms,address,city,whatsapp,description)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     returning *`,
    [req.user.id, p.title, p.price, p.type, p.status, p.surface, p.rooms, p.bedrooms, p.bathrooms, p.address, p.city, p.whatsapp, p.description]
  );
  const property = rows[0];

  // images
  for (const url of p.images) {
    await query("insert into property_images(property_id,url) values($1,$2)", [property.id, url]);
  }
  // amenities
  if (p.amenities?.length) {
    const { rows: arows } = await query(`select id, code from amenities where code = any($1)`, [p.amenities]);
    for (const a of arows) {
      await query("insert into property_amenities(property_id,amenity_id) values($1,$2) on conflict do nothing", [property.id, a.id]);
    }
  }

  res.status(201).json(property);
});

router.put("/:id", authRequired, ownerOnly, validate(propertySchema), async (req, res) => {
  const p = req.validated; const id = +req.params.id;
  // Ownership check
  const owner = await query("select 1 from properties where id=$1 and owner_id=$2", [id, req.user.id]);
  if (!owner.rowCount) return res.status(403).json({ error: "Not your property" });

  const { rows } = await query(
    `update properties set title=$1, price=$2, type=$3, status=$4, surface=$5, rooms=$6, bedrooms=$7, bathrooms=$8,
      address=$9, city=$10, whatsapp=$11, description=$12 where id=$13 returning *`,
    [p.title, p.price, p.type, p.status, p.surface, p.rooms, p.bedrooms, p.bathrooms, p.address, p.city, p.whatsapp, p.description, id]
  );

  // reset & re-add images/amenities
  await query("delete from property_images where property_id=$1", [id]);
  for (const url of p.images) await query("insert into property_images(property_id,url) values($1,$2)", [id, url]);

  await query("delete from property_amenities where property_id=$1", [id]);
  if (p.amenities?.length) {
    const { rows: arows } = await query(`select id from amenities where code = any($1)`, [p.amenities]);
    for (const a of arows) await query("insert into property_amenities(property_id,amenity_id) values($1,$2)", [id, a.id]);
  }

  res.json(rows[0]);
});

router.delete("/:id", authRequired, ownerOnly, async (req, res) => {
  const id = +req.params.id;
  const owner = await query("select 1 from properties where id=$1 and owner_id=$2", [id, req.user.id]);
  if (!owner.rowCount) return res.status(403).json({ error: "Not your property" });
  await query("delete from properties where id=$1", [id]);
  res.json({ ok: true });
});

// Incrémenter vues
router.post("/:id/view", async (req, res) => {
  const id = +req.params.id;
  await query("update properties set views = coalesce(views,0)+1 where id=$1", [id]);
  res.json({ ok: true });
});

// Avis
router.post("/:id/reviews", authRequired, async (req, res) => {
  const id = +req.params.id;
  const { stars, comment } = req.body;
  if (!stars || !comment) return res.status(400).json({ error: "stars & comment requis" });
  await query("insert into reviews(property_id,user_id,stars,comment) values($1,$2,$3,$4)", [id, req.user.id, stars, comment]);
  res.json({ ok: true });
});

export default router;

