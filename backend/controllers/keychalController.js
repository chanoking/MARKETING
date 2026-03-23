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

    const getKeywordsByInfl = async (req, res) => {
        try{
            const {influencer, keyword} = req.query;
            const data = await db.collection("Keychal_Keywords").findOne({influencer, keyword});
            res.json(data);
        }catch(err){
            res.status(500).json({error: err.mesage});
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

    const getInflKeywordStates = async (req, res) => {
        try{    
            const { influencer } = req.query;

            if(!influencer) {
                return res.status(400).json({message: "influencer required!"})
            }
            
            const states = await db.collection("Keychal_States").find({ influencer })
                                    .toArray();


            res.json(states);
        }catch(err){
            res.status(500).json({message: err.message})
        }
    }

    const getInflTheKeywordStates = async (req, res) => {
        try{
            const {influencer, keyword} = req.query;

            if(!influencer || !keyword) return res.status(400).json({message: "influencer or keywords needed!"})
            
            const states = await db.collection("Keychal_States").find({influencer, keyword}).toArray();
            
            res.json(states);
        }catch(err){
            res.status(500).json({error: err.message});
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

    const getTotalValueForInflByMonth = async (req, res) => {
        try{
            const {influencer, year, month} = req.query;
            const data = await db.collection("Keychal_States").find({influencer}).toArray();
            const filteredData = data.filter(d => +d.date.slice(0, 4) === +year &&
                                    +d.date.slice(5, 7) === +month);
            
            let sum = 0;

            for(let d of filteredData){
                const days = new Date(year, month, 0).getDate();
                const keyword = await db.collection("Keychal_Keywords").findOne({keyword: d.keyword})
                const quote = keyword.quote;
                const dailyV = quote / days;
                if (d.rank > 0) sum += dailyV
            }
            
            res.json({sum: Math.round(sum).toLocaleString()});

        }catch(err){
            res.status(500).json({error: err.message});
        }
    }

    const getSummary = async (req, res) => {
        try{
            const data = await db.collection("Keychal_States").find({}).toArray();
            res.json(data);
        }catch(err){
            res.status(500).json({error: err.message});
        }
    }

    const getInfoForKeyword = async (req, res) => {
        try{
            const {keyword} = req.query;
            const data = await db.collection("Keychal_Keywords").findOne({keyword});
            
            res.json(data);
        }catch(err){
            res.status(500).json({error: err.message})
        }
    }

    const checkConfirm = async (req, res) => {
        try{
            const {influencer, formattedMonth} = req.query;
            const data = await db.collection("Finalize_Amount").findOne({influencer, formattedMonth});

            res.json(data);
        }catch(err){
            res.status(500).json({error: err.message});
        }
    }

    const confirm = async (req, res) => {
        try{
            const {influencer, formattedMonth, amount} = req.body;
            await db.collection("Finalize_Amount").insertOne({
                formattedMonth,
                influencer,
                amount,
                confirm: true
            })
            res.status(200).json({message: `금액이 확정되었습니다. ${formattedMonth} 고생하셨습니다:)`});
        }catch(err){
            res.status(500).json({error: err.message})
        }
    }

    const getInflSummary = async (req, res) => {
        try{
            const {influencer} = req.query;
            const data = await db.collection("Keychal_States").find({influencer}).toArray();
            const summary = {};
            for(let doc of data){
                const [year, month] = [doc.date.slice(0,4), doc.date.slice(5, 7)];
                const key = `${year}년 ${month}월`
                const result = await db.collection("Keychal_Keywords").findOne({influencer, keyword: doc.keyword});

                if(!summary[key]) summary[key] = {};
                if(!summary[key][doc.keyword]){
                    summary[key][doc.keyword] = {
                        duration: 0,
                        item: result.item,
                        brand: result.brand,
                        quote: result.quote
                    }
                }
                if(doc.rank > 0) summary[key][doc.keyword].duration++;
            }

            res.json(summary);
        }catch(err){
            res.status(500).json({error: err.message});
        }
    }

    return {
        getInfluencers,
        getKeywords,
        getKeywordStates,
        countVisibleKeywords,
        getAllStates,
        updateKeywordStates,
        getInflKeywordStates,
        getInflTheKeywordStates,
        getTotalValueForInflByMonth,
        getSummary,
        getInfoForKeyword,
        getKeywordsByInfl,
        checkConfirm,
        confirm,
        getInflSummary
    }
}

export default createControllers;