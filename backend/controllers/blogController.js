import xlsx from "xlsx";
import { ObjectId } from "mongodb"

const createControllers = (db) => {
  // console.log(db)
  const getItems = async (req, res) => {
      try{
          const items = await db.collection("Items").find({}, {projection: {item: 1}})
                          .toArray();
  
          res.json(items)
      }catch(err){
          res.status(500).json({error: err.message})
      }
  }
  
  const getKeywords = async (req, res) => {
      try{
          const {item_id} = req.query;
          const query = {};
  
          if(item_id){
              query.item_id = item_id;
          }
  
          const keywords = await db.collection("Keywords").find(query).toArray();
  
          res.json(keywords);
  
      }catch(err){
          res.status(500).json({error: err.message});
      }
  }
  
  const getKeywordStates = async (req, res) => {
      try{
          const {keyword_id} = req.query;
          const query = {};
  
          if(!keyword_id){
              return res.status(400).json({error: "keyword_id 필요"});
          }else{
              query._id = new ObjectId(keyword_id)
          }
  
          const keyword = await db.collection("Keywords").find(query).toArray();
  
          res.json(keyword)
      }catch(err){
          res.status(500).json({error: err.message})
      }
  }
  
  const upload = async (req, res) => {
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
  }
  
  const keywordStateUpdate = async (req, res) => {
    try{
      const { keyword_id, states } = req.body;           
      await db.collection("Keywords").updateOne(
        { _id: new ObjectId(keyword_id) },
        {$set: {state: states}}
      );
      res.json({message: "업데이트 완료"});

    }catch(err){
      res.status(500).json({error: err.message});
    }
  }
  
  return {
    getItems,
    getKeywords,
    getKeywordStates,
    upload,
    keywordStateUpdate
  };
};

export default createControllers;