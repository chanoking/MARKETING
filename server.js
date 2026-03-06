import express from "express";
import xlsx from "xlsx";
import fileUpload from "express-fileupload";
import { MongoClient } from "mongodb";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import cors from "cors";
import { ObjectId } from "mongodb";

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

    app.get("/blog/items", async (req, res) => {
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


    app.get("/blog/keywords", async (req, res) => {
      try {
        const { item_id } = req.query;
        const query = {};

        if (item_id) {
          query.item_id = item_id;
        }

        const keywords = await db
          .collection("Keywords")
          .find(query)
          .toArray();

        res.json(keywords);

      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });


    app.get("/blog/keyword-state", async (req, res) => {
      try {
        const { keyword_id } = req.query;
        const query = {};

        if (!keyword_id) {
          return res.status(400).json({ error: "keyword_id 필요" });
        } else {
          query._id = new ObjectId(keyword_id)
        }

        const keyword = await db.collection("Keywords").find(query).toArray();

        res.json(keyword);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
      }
    });

    /* =========================
       EXCEL UPLOAD
    ========================= */
    app.post("/blog/upload-excel", async (req, res) => {
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
          if (!row.keyword || !row.item_id) continue;

          await keywordsCollection.updateOne(
            {
              keyword: row.keyword,
            },
            {
              $setOnInsert: {
                item_id: row.item_id,
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

    app.post("/blog/keyword-state-update", async (req, res) => {
      const { keyword_id, states } = req.body;
      
      await db.collection("Keywords").updateOne(
        { _id: new ObjectId(keyword_id) },
        {
          $set: {
            state: states
          }
        }
      );

      res.json({
        message: "업데이트 완료"
      });

    });
/*------------------------------keychal down here---------------------------*/
    
    app.get("/keychal/influencers", async (req, res) => {
          try {
            const influencers = await db.collection("Keychal_Influencers").find({}).toArray();
            res.json(influencers);
          } catch (err) {
            res.status(500).json({ message: err.message });
          }
        });

    app.get("/keychal/keywords", async (req, res) => {
      try {
        const {influencer_id} = req.query;
        const keywords = await db.collection("Keychal_Keywords")
                                  .find({influencer_id})
                                  .toArray();

        res.json(keywords)
      } catch (err) {
        res.status(500).json({ message: err.message })
      }
    })

    app.get("/keychal/keyword/states", async (req, res) => {
      try {
        const { keyword } = req.query;

        if (!keyword) return res.status(400).json({ message: "keyword required" });

        const states = await db
          .collection("Keychal_States")
          .find({ keyword })
          .toArray();

        res.json(states);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    app.get("/keychal/states/cal", async (req, res) => {
      try{
        const data = await db
          .collection("Keychal_States")
          .find({})
          .toArray();

        const result = {};

        data.forEach(item => {
          let {date, rank} = item;
          
          if (!result[date]) {
            result[date] = [0, 1];
          }else{
            result[date][1] += 1
          }
          if (rank > 0) result[date][0] += 1;
        })

        for(let date in result){
          result[date] = `${result[date][0]} out of ${result[date][1]}`;
        }
        res.json(result)
      }catch(err){
        res.status(500).json({message: err.message})
      }
    })

    app.get("/keychal/statesall", async (req, res) => {
      try{
        const {date} = req.query;
        const data = await db.collection("Keychal_States").find({date}).toArray();

        res.json(data);
      }catch(err){
        res.status(500).json({message: err.message})
      }
    })
    
    app.post("/keychal/keyword_state_update", async (req, res) => {
      try {

        const { editedStates } = req.body;

        for (const doc of editedStates) {

          const { _id, keyword, influencer_id, item, brand, quote } = doc;

          await db.collection("Keychal_Keywords").updateOne(
            { _id: new ObjectId(_id), influencer_id },
            { $set: { keyword, quote, item, brand } }
          );

        }

        res.json({
          message: "update 완료!"
        });

      } catch (err) {

        res.status(500).json({
          message: err.message
        });

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
