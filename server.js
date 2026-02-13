import express from "express";
import xlsx from 'xlsx';
import fileUpload from 'express-fileupload';
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

// MongoDB 연결
const URI = process.env.URI;
const client = new MongoClient(URI);
let db;

async function startServer() {
  try {
    await client.connect();
    db = client.db("LifeNBio");
    console.log("MongoDB connected!");

    // Static files
    app.use(express.static(path.join(__dirname, "frontend")));

    // Get all items
    app.get("/items", async (req, res) => {
      try {
        const data = await db.collection("Items")
          .find({}, { projection: { item: 1 } })
          .toArray();
        res.json(data);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get("/keywords", async (req, res) => {
      try{
        const { date, itemId} = req.query;

        const query = {};
        if (date) query.date = date;
        if (itemId) query.item_id = itemId;
      }
      try{
        const data = await db.collection("Keywords").find({}).toArray();
        res.json(data);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })

    // Get keywords for an item
    app.get("/items/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const keywords = await db.collection("Keywords")
          .find({ item_id: id })
          .toArray();
        res.json(keywords || []);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Upload Excel
    app.post('/upload-excel', async (req, res) => {
      try {
        if (!req.files || !req.files.file) return res.status(400).json({ error: "No file uploaded" });

        const file = req.files.file;
        const workbook = xlsx.read(file.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const keywordsCollection = db.collection("Keywords");

        for (const row of data) {
          // Ensure row has item_id if needed
          await keywordsCollection.updateOne(
            { keyword: row.keyword },
            { $set: { env: row.env, visible: row.visible, mobile: row.mobile, pc: row.pc, competition: row.competition, date: row.date } },
            { upsert: true }
          );
        }

        res.json({ success: true, message: "엑셀 업데이트 완료!" });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // SPA fallback
    app.use((req, res) => {
      res.sendFile(path.join(__dirname, "frontend", "index.html"));
    });

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

startServer();
