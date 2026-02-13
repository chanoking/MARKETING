import express from "express";
import xlsx from "xlsx";
import fileUpload from "express-fileupload";
import { MongoClient } from "mongodb";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB
const URI = process.env.URI;
const client = new MongoClient(URI);
let db;

async function startServer() {
  try {
    await client.connect();
    db = client.db("LifeNBio");
    console.log("✅ MongoDB connected");

    /* =========================
       Static (React build)
    ========================= */
    app.use(express.static(path.join(__dirname, "frontend")));

    /* =========================
       ITEMS
    ========================= */
    app.get("/items", async (req, res) => {
      try {
        const items = await db
          .collection("Items")
          .find({}, { projection: { item: 1 } })
          .toArray();
        res.json(items);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    /* =========================
       KEYWORDS (date / item filter)
       /keywords?date=YYYY-MM-DD&itemId=xxx
    ========================= */
    app.get("/keywords", async (req, res) => {
      try {
        const { date, itemId } = req.query;
        const query = {};

        if (date) query.date = date;
        if (itemId) query.item_id = itemId;

        const keywords = await db
          .collection("Keywords")
          .find(query)
          .toArray();

        res.json(keywords);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    /* =========================
       EXCEL UPLOAD
    ========================= */
    app.post("/upload-excel", async (req, res) => {
      try {
        if (!req.files || !req.files.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        const file = req.files.file;
        const workbook = xlsx.read(file.data, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(sheet);

        const keywordsCollection = db.collection("Keywords");

        let successCount = 0;

        for (const row of rows) {
          // 최소 유효성 검사
          if (!row.keyword || !row.item_id || !row.date) continue;

          const normalizedDate = String(row.date).slice(0, 10);

          await keywordsCollection.updateOne(
            {
              keyword: row.keyword,
              item_id: row.item_id,
              date: normalizedDate,
            },
            {
              $set: {
                env: row.env ?? "",
                visible: Boolean(row.visible),
                mobile: row.mobile ?? "",
                pc: row.pc ?? "",
                competition: row.competition ?? "",
              },
            },
            { upsert: true }
          );

          successCount++;
        }

        res.json({
          success: true,
          message: `엑셀 업로드 완료 (${successCount}건 처리)`,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
      }
    });

    /* =========================
       SPA Fallback
    ========================= */
    app.use((req, res) => {
      res.sendFile(path.join(__dirname, "frontend", "index.html"));
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

startServer();
