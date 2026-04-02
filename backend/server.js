// server.js
import express from "express";
import fileUpload from "express-fileupload";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./db.js";
import blogRoutes from "./routes/blogRoutes.js";
import keychalRoutes from "./routes/keychalRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import freeRoutes from "./routes/freeRoutes.js";
import keychalControllers from "./controllers/keychalController.js";
import blogControllers from "./controllers/blogController.js";
import authControllers from "./controllers/authController.js";
import freeControllers from "./controllers/freeController.js";
import { requireToken } from "./middlewares/authMiddleware.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Node ESM에서 __dirname 얻기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =======================
// Middleware
// =======================
app.use(cors({
    origin: [
    "https://chanoking.com",
    "https://www.chanoking.com",
    "http://localhost:5173"
  ]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// =======================
// SPA static
// =======================
const frontendPath = path.join(__dirname, "../frontend");

// =======================
// Start server
// =======================
async function startServer() {
  try {
    // 1️⃣ DB 연결
    const db = await connectDB();
    
    // 2️⃣ 컨트롤러에 DB 주입
    const keychalCtrl = keychalControllers(db);
    const blogCtrl = blogControllers(db);
    const authCtrl = authControllers(db);
    const freeCtrl = freeControllers(db);
    
    // 3️⃣ 라우터 등록 (컨트롤러 주입)
    app.use("/keychal", keychalRoutes(keychalCtrl, requireToken));
    app.use("/blog", blogRoutes(blogCtrl, requireToken));
    app.use("/auth", authRoutes(authCtrl));
    app.use("/free", freeRoutes(freeCtrl, requireToken));
    
    app.use(express.static(frontendPath));
    
    // SPA fallback
    app.use((req, res) => {
      res.sendFile(path.join(frontendPath, "index.html"));
    });
    
    // 4️⃣ 서버 실행
    app.listen(PORT, () =>{
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

// 서버 시작
startServer();