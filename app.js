import "dotenv/config.js";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import propertyRoutes from "./routes/properties.js";
import conversationRoutes from "./routes/conversations.js";
import visitRoutes from "./routes/visits.js";
import uploadRoutes from "./routes/uploads.js";

const app = express();

// ⚡ Bloc CORS manuel (mettre tout en haut, avant helmet et autres middlewares)
const allowedOrigins = ["https://dzloc.vercel.app"]; // ton frontend Vercel

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    }

    // gérer la requête OPTIONS (preflight)
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// Sécurité & middlewares
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan("tiny"));
app.set("trust proxy", 1);
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

// Route de test
app.get("/", (req, res) => res.json({ ok: true, name: "DZLoc API" }));

// Routes principales
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/properties", propertyRoutes);
app.use("/conversations", conversationRoutes);
app.use("/visits", visitRoutes);
app.use("/uploads", uploadRoutes);

const port = process.env.PORT || 10000;
app.listen(port, () => console.log("API running on", port));
