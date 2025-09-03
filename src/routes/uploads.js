import { Router } from "express";
import multer from "multer";
import { authRequired } from "../middleware/auth.js";
import { v2 as cloudinary } from "cloudinary";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.post("/image", authRequired, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Aucun fichier" });
  const b64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(b64, { folder: "dzloc" });
  res.json({ url: result.secure_url });
});

export default router;

