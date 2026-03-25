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
            const {influencer_id} = req.params;
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

    const getStatesByInfluencer = async (req, res) => {
        try{    
            const { influencer } = req.query;

            if(!influencer) {
                return res.status(400).json({message: "influencer required!"})
            }
            
            const data = await db.collection("Keychal_States").aggregate([
                {
                    $match:{
                        rank:{$gt: 0},
                        influencer
                    },
                },
                 {
                     $group:{
                        _id: "$date",
                        count: {$sum:1}
                     }
                 },
                 {
                    $project:{
                        date: "$_id",
                        count: 1,
                        _id: 0
                    }
                 }
            ]).toArray();


            res.json(data)
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

    const getAmountByInfluencerAndMonth = async (req, res) => {
        try{
            const { influencer, year, month } = req.query;
            const mm = String(month).padStart(2, "0");
            const lastD = new Date(Number(year), Number(month), 0).getDate();
            const data = await db.collection("Keychal_States").aggregate([
            {
                $match: {
                    rank: { $gt: 0 },
                    date: { $regex: `^${year}-${mm}` },
                    influencer
                }
            },
            {
                $lookup: {
                    from: "Keychal_Keywords",
                    localField: "keyword",
                    foreignField: "keyword",
                    as: "keywordInfo"
                }
            },
            {
                $unwind: "$keywordInfo"
            },
            {
                $group: {
                    _id: null,
                    amount: {
                        $sum: {
                            $divide: ["$keywordInfo.quote", lastD]
                        }
                    },
                    influencer: {$first: "$influencer"}
                }
            },
            {
                $project: {
                    influencer: 1,
                    amount: 1,
                    _id: 0
                }
            }
            ]).toArray();

            
            res.json(data);

        }catch(err){
            res.status(500).json(data);
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

    const isMonthlyAmountFinalized  = async (req, res) => {
        try{
            const {influencer, formattedMonth} = req.query;
            const data = await db.collection("Finalize_Amount").findOne({influencer, formattedMonth});

            res.json(data);
        }catch(err){
            res.status(500).json({error: err.message});
        }
    }

    const finalizeMonthlyAmount = async (req, res) => {
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


    const getKeywordsSummary = async (req, res) => {
        try{
            const {influencer, month, year} = req.query;
            const lastDay = new Date(+year, +month, 0).getDate();
            const mm = String(month).padStart(2, "0");
            const data = await db.collection("Keychal_States").aggregate([
                {
                    $match:{
                        influencer,
                        date:{$regex: `^${year}-${mm}`},
                        rank:{$gt: 0}
                    }   
                },
                {
                    $lookup:{
                        from: "Keychal_Keywords",
                        localField: "keyword",
                        foreignField: "keyword",
                        as: "keywordInfo"
                    }
                },
                {
                    $unwind: "$keywordInfo"
                },
                {
                    $group:{
                        _id: "$keyword",
                        quote: {
                            $first:"$keywordInfo.quote"
                        },
                        duration: {
                            $sum:1
                        },
                        amount: {
                            $sum:{
                                $divide:["$keywordInfo.quote", lastDay]
                            }
                        },
                        durationDays:{
                            $push: "$date"
                        },
                        brand: {
                            $first: "$keywordInfo.brand"
                        },
                        item: {
                            $first: "$keywordInfo.item"
                        },
                        keyword: {
                            $first: "$keywordInfo.keyword"
                        }
                    }
                },
                {
                    $project:{
                        keyword: "$_id",
                        quote: 1,
                        dailyAmount: {$divide: ["$quote", lastDay]},
                        duration: 1,
                        amount: 1,
                        durationDays:{
                            $map:{
                                input: "$durationDays",
                                as: "d",
                                in: {$toInt: {
                                    $substr:[
                                        "$$d", 8 , 2
                                    ]
                                }}
                            }
                        },
                        item: 1,
                        keyword: 1,
                        brand: 1,
                        _id: 0 
                    }
                },
                {
                    $set:{
                        durationDays:{$sortArray:{input: "$durationDays", sortBy: 1}}
                    }
                }
            ]).toArray();
            
            res.json(data);
        }catch(err){
            res.status(500).json({error: err.message});
        }
    }
    
    const getKeywordsByRank = async (req, res) => {
        const {influencer, year, month} = req.query;
        const mm = String(month).padStart(2, "0");
        try{
            const data = await db.collection("Keychal_States").aggregate([
                {
                    $match: {
                        influencer,
                        date:{$regex: `^${year}-${mm}`}
                    }
                },
                {
                    $group:{
                        _id: "$date",
                        positive: {$push: {
                            $cond:[
                                {$gt: ["$rank", 0]},
                                "$keyword",
                                "$$REMOVE"
                            ]
                        }},
                        negative: {
                            $push:{
                                $cond:[
                                    {$lte: ["$rank", 0]},
                                    "$keyword",
                                    "$$REMOVE"
                                ]
                            }
                        }
                    }
                },
                {
                    $project:{
                        date: "$_id",
                        positive: 1,
                        negative: 1,
                        _id: 0
                    }
                }
            ]).toArray();
            res.json(data);
        }catch(err){
            res.status(500).json({error: err.message});
        }
    }

    return {
        getInfluencers,
        getKeywords,
        getKeywordsByInfl,
        getKeywordStates,
        getStatesByInfluencer,
        getInflTheKeywordStates,
        countVisibleKeywords,
        getAllStates,
        updateKeywordStates,
        getAmountByInfluencerAndMonth,
        getSummary,
        getInfoForKeyword,
        isMonthlyAmountFinalized,
        finalizeMonthlyAmount,
        getKeywordsSummary,
        getKeywordsByRank
    }
}

export default createControllers;