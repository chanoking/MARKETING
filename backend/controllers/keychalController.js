import { ObjectId } from "mongodb"

const createControllers = (db) => {
    const getInfluencers = async (req, res) => {
        try {
            const influencers = await db.collection("Keychal_Influencers").find({}).toArray();
            res.json(influencers);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }   
    }
    
    const getKeywords = async (req, res) => {
        try {
            const {influencer_id} = req.query;
            const keywords = await db.collection("Keychal_Keywords")
                                        .find({influencer_id})
                                        .toArray();
    
            res.json(keywords)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }
    
    const getKeywordStates = async (req, res) => {
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
    }
    
    const countVisibleKeywords = async (req, res) => {
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
    }
    
    const getAllStates = async (req, res) => {
        try{
            const {date} = req.query;
            const data = await db.collection("Keychal_States").find({date}).toArray();
    
            res.json(data);
        }catch(err){
            res.status(500).json({message: err.message})
        }
    }
    
    const updateKeywordStates = async (req, res) => {
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
    }
    return {
        getInfluencers,
        getKeywords,
        getKeywordStates,
        countVisibleKeywords,
        getAllStates,
        updateKeywordStates
    }
}

export default createControllers;