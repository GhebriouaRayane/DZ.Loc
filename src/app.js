import "dotenv/config.js";
import express from "express";
import helmet from "helmet";
import cors from "cors";
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

// Sécurité & middlewares
app.use(helmet());


// Configuration CORS sécurisée pour ton frontend Vercel
const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];

app.use(cors({
    origin: function(origin, callback){
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            const msg = `La politique CORS bloque cette origine: ${origin}`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
}));

app.options('*', cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
}));



app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan("tiny"));
app.set("trust proxy", 1);
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

app.get("/", (req, res) => res.json({ ok: true, name: "DZLoc API" }));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/properties", propertyRoutes);
app.use("/conversations", conversationRoutes);
app.use("/visits", visitRoutes);
app.use("/uploads", uploadRoutes);

const port = process.env.PORT || 10000;
app.listen(port, () => console.log("API running on", port));

