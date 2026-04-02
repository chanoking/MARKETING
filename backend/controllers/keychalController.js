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

    const getFullAmountByMonth = async (req, res) => {
        try{
            const data = await db.collection("Keychal_States").aggregate([
                {
                    $match:{
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
                    $unwind:"$keywordInfo"
                },
                {
                    $addFields:{
                        dateObj: {$toDate: "$date"}
                    }
                },
                {
                    $addFields:{
                        lastDay: {
                            $dayOfMonth: {
                                $dateSubtract:{
                                    startDate:{
                                        $dateAdd:{
                                            startDate:{
                                                $dateFromParts:{
                                                    year:{$year: "$dateObj"},
                                                    month:{$month: "$dateObj"},
                                                    day: 1
                                                }
                                            },
                                            unit: "month",
                                            amount: 1
                                        }
                                    },
                                    unit: "day",
                                    amount: 1
                                }
                            }
                        }
                    }
                },
                {
                    $group:{
                        _id: {
                            $dateToString:{
                                format: "%Y-%m",
                                date: "$dateObj"
                            }
                        },
                        amount: {$sum: {
                            $divide: ["$keywordInfo.quote", "$lastDay"]
                        }}
                    }
                },
                {
                    $project:{
                        _id: 0,
                        date: "$_id",
                        amount : 1
                    }
                },
                {
                    $sort: {
                        date: 1
                    }
                }
            ]).toArray();

            res.json(data);
        }catch(err){
            res.status(500).json({error: err.message});
        }
    }

    const getSummaryByMonth = async (req, res) => {
        try{
            const data = await db.collection("Keychal_States").aggregate([
                {
                    $match:{rank: {$gt: 0}}
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
                    $unwind:"$keywordInfo"
                },
                {
                    $addFields:{
                        dateObj: {$toDate: "$date"}
                    }
                },
                {
                    $addFields:{
                        lastDay:{
                            $dayOfMonth:{
                                $dateSubtract:{
                                    startDate:{
                                        $dateAdd:{
                                            startDate:{
                                                $dateFromParts:{
                                                    year:{$year: "$dateObj"},
                                                    month: {$month: "$dateObj"},
                                                    day: 1
                                                }
                                            },
                                            unit: "month",
                                            amount: 1
                                        }
                                    },
                                    unit: "day",
                                    amount: 1
                                }
                            }
                        }
                    }
                },
                {
                    $group:{
                        _id:{
                            formattedMonth: {$dateToString:{format: "%Y-%m",date: "$dateObj"}},
                            keyword: "$keyword"
                        },
                        amount: {$sum: {$divide:["$keywordInfo.quote", "$lastDay"]}},
                        keyword: {$first: "$keyword"},
                        brand: {$first: "$keywordInfo.brand"},
                        item: {$first: "$keywordInfo.item"},
                        quote: {$first: "$keywordInfo.quote"},
                        influencer: {$first: "$keywordInfo.influencer"},
                        dailyAmount: {$first: {$divide: ["$keywordInfo.quote", "$lastDay"]}},
                        duration: {$sum: 1}
                    }
                },
                {
                    $project:{
                        formattedMonth: "$_id.formattedMonth",
                        amount: 1,
                        keyword: 1,
                        brand: 1,
                        item: 1,
                        quote: 1,
                        influencer: 1,
                        dailyAmount: 1,
                        duration: 1,
                        _id: 0
                    }
                },
                {
                    $sort:{
                        formattedMonth: 1
                    }
                }
            ]).toArray();

            res.json(data)
        }catch(err){
            res.status(500).json({error: err.message});
        }
    }

    const getAmountGroupedByMonthAndInfluencer = async (req, res) => {
        try{
            const data = await db.collection("Keychal_States").aggregate([
                {
                    $match:{
                        rank: {$gt: 0}
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
                    $addFields:{
                        dateObj: {$toDate: "$date"}
                    }
                },
                {
                    $addFields:{
                        lastDay:{
                            $dayOfMonth:{
                                $dateSubtract:{
                                    startDate:{
                                        $dateAdd:{
                                            startDate:{
                                                $dateFromParts:{
                                                    year: {$year: "$dateObj"},
                                                    month: {$month: "$dateObj"},
                                                    day: 1
                                                }
                                            },
                                            unit: "month",
                                            amount: 1
                                        }
                                    },
                                    unit: "day",
                                    amount: 1
                                }
                            }
                        }
                    }
                },
                {
                    $group:{
                        _id:{
                            formattedMonth:{$dateToString:{
                                format: "%Y-%m", date: "$dateObj"
                            }},
                            influencer: "$influencer"
                        },
                        amount: {
                            $sum:{
                                $divide:["$keywordInfo.quote", "$lastDay"]
                            }
                        }
                    }    
                },
                {
                    $project:{
                        formattedMonth: "$_id.formattedMonth",
                        influencer: "$_id.influencer",
                        amount: 1,
                        _id: 0
                    }
                },{
                    $sort:{
                        formattedMonth: 1,
                        influencer: 1
                    }
                }
            ]).toArray();

            res.json(data);
        }catch(err){
            res.status(500).json({error: err.message})
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
    
    const getAllKeywordsByRank = async (req, res) => {
        try {
            const data = await db.collection("Keychal_States").aggregate([
            {
                $group: {
                _id: "$date",
                positive: {$push:{
                    $cond:[{$gt: ["$rank", 0]}, {
                        $concat: ["$keyword", "_", "$influencer"]
                    }, "$$REMOVE"]
                }},
                negative: {$push:{
                    $cond:[{$lte: ["$rank", 0]}, {
                        $concat:["$keyword", "_", "$influencer"]
                    }, "$$REMOVE"]
                }},
                duration: {$sum: {
                    $cond:[
                    {$gt: ["$rank", 0]},
                    1,
                    0
                ]}
                }
                }
            },
            {
                $project:{
                    date: "$_id",
                    positive: 1,
                    negative: 1,
                    duration: 1,
                    _id: 0
                }
            }
            ]).toArray();

            res.json(data);
          }catch(err){
            res.status(500).json({message: err.message})
        }
    }
    
    const getAmountByMonthAndInfluencer = async (req, res) => {
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

    const getAmountByMonthAndItem = async (req, res) => {
        try{
            const {year, month} = req.query;
            const mm = String(month).padStart(2, "0");
            const data = await db.collection("Keychal_States").aggregate([
                {
                    $match:{
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
                    $addFields:{
                        dateObj : {$toDate: "$date"}
                    }
                },
                {
                    $addFields:{
                        lastDay:{
                            $dayOfMonth:{
                                $dateSubtract:{
                                    startDate:{
                                        $dateAdd:{
                                            startDate:{
                                                $dateFromParts:{
                                                    year: {$year: "$dateObj"},
                                                    month: {$month: "$dateObj"},
                                                    day: 1
                                                }
                                            },
                                            unit: "month",
                                            amount: 1,
                                        }
                                    },
                                    unit: "day",
                                    amount: 1
                                }
                            }
                        }
                    }
                },
                {
                    $group:{
                        _id: "$keywordInfo.item",
                        amount: {$sum: {$divide:["$keywordInfo.quote", "$lastDay"]}},
                        brand: {$first: "$keywordInfo.brand"}
                    }
                },
                {
                    $project: {
                        item: "$_id",
                        amount: 1,
                        brand: 1,
                        _id: 0
                    }
                }
            ]).toArray();

            res.json(data);

        }catch(err){
            res.status(500).json({message: err.message})
        }
    }

    return {
        getInfluencers,
        getKeywords,
        getStatesByInfluencer,
        getAllKeywordsByRank,
        getAmountByMonthAndInfluencer,
        isMonthlyAmountFinalized,
        finalizeMonthlyAmount,
        getKeywordsSummary,
        getKeywordsByRank,
        getFullAmountByMonth,
        getSummaryByMonth,
        getAmountGroupedByMonthAndInfluencer,
        getAmountByMonthAndItem
    }
}

export default createControllers;