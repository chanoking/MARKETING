const createControllers = (db) => {
    const getFreeMonthlyCostByItem = async (req, res) => {
        try{
            const data = await db.collection("Free").aggregate([
                {
                    $addFields:{
                        cleanItem: {
                            $replaceAll:{
                                input: "$제품",
                                find: " ",
                                replacement: ""
                            }
                        },
                        key: {
                            $concat: ["$작성자", "$발행종류", "$정보/후기"]
                        },
                    },
                },
                {
                    $lookup:{
                        from: "Free_Pricing",
                        localField: "key",
                        foreignField: "key",
                        as: "pricing"
                    }
                },
                {
                    $unwind: "$pricing"
                },
                {
                    $group:{
                        _id: "$cleanItem",
                        amount: {$sum: "$pricing.value"},
                        발행종류: {$first: "$발행종류"},
                        관리방식: {$first: "$관리방식"},
                        브랜드: {$first: "$브랜드"},
                        작성자: {$first: "$작성자"},
                        키워드: {$first: "$키워드"},
                        작성일: {$first: "$작성일"},
                        전달일: {$first: "$전달일"},
                        cnt: {$sum: 1}
                    }
                },
                {
                    $project:{
                        item: "$_id",
                        amount: 1,
                        발행종류: 1,
                        관리방식: 1,
                        브랜드: 1,
                        작성자: 1,
                        키워드: 1,
                        작성일: 1,
                        cnt: 1,
                        전달일:1,
                        _id: 0
                    }
                }
            ]).toArray();
            
            res.json(data)
        }catch(err){
            res.status(500).json({message: err.message})
        }
    }

    const getMonthlyCostForSponsor = async (req, res) => {
        try{
            const data = await db.collection("sponsored_monthly_fee").aggregate([
                {
                    $addFields:{
                        cleanItem:{
                            $replaceAll:{
                                input: "$품목명",
                                find: " ",
                                replacement: ""
                            }
                        }
                    }
                },
                {
                    $group:{
                        _id: "$cleanItem",
                        amount: {$sum: "$세금계산서 :VAT 미포함 / 인건비:세전"},
                        cnt: {$sum: 1},
                        brand: {$first: "$브랜드"}
                    }
                },
                {
                    $project:{
                        item: "$_id",
                        amount: 1,
                        cnt: 1,
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
        getFreeMonthlyCostByItem,
        getMonthlyCostForSponsor
    }
}

export default createControllers;