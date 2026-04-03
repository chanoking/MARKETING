const createControllers = (db) => {
    const getExpenseReportForFree = async (req, res) => {
        try{
            const data = await db.collection("Free").aggregate([
                {
                    $addFields: {
                        key: {$concat: ["$작성자", "$발행종류", "$정보/후기"]}
                    }
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
                    $addFields:{
                        회사명: "라이프앤바이오",
                        "1": "3.판관비",
                        "2": "2.광고선전비",
                        "3": "1.바이럴마케팅",
                        "코드": "",
                        "세목": {$concat: ["바이럴_", "$발행종류", "_", "$관리방식"]},
                        "년-월": {
                            $dateToString:{
                                format: "%Y년 %m월",
                                date: "$전달일"
                            }
                        },
                        "일자": {
                            $dateSubtract:{
                                startDate:{
                                    $dateAdd:{
                                        startDate:{
                                            $dateFromParts:{
                                                year: {$year: "$전달일"},
                                                month: {$month: "$전달일"},
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
                        },
                        "적요": {$concat: ["$발행종류", "_", "$관리방식"]},
                        "거래처(세금계산서 발행처명)": "$작성자",
                        "사업자등록번호": "",
                        "세금계산서: VAT 미포함 / 인건비:세전": "$pricing.value",
                        "대변": "",
                        "금액": "",
                        관리부서명: "마케팅팀",
                        "세금계산서: VAT 포함 / 인건비: 세후": {$multiply:["$pricing.value", 0.967]}
                    }
                },
                {
                    $project:{
                        회사명: 1,
                        "1": 1,
                        "2": 1,
                        "3": 1,
                        코드: 1,
                        세목: 1,
                        "년-월": 1,
                        일자: 1,
                        적요: 1,
                        "거래처(세금계산서 발행처명)": 1,
                        "사업자등록번호": 1,
                        "세금계산서: VAT 미포함 / 인건비:세전": 1,
                        "대변": 1,
                        "금액": 1,
                        "브랜드": 1,
                        "품목명": "$제품",
                        "관리부서명": 1,
                        "세금계산서: VAT 포함 / 인건비: 세후": 1,
                        "키워드": 1,
                        _id: 0
                    }
                }
            ]).toArray();

            res.json(data);
        }catch(err){
            res.status(500).json({error: err.message})
        }
    }

    const getExpenseReportForKeychal = async (req, res) => {
        try{
            const {year, month, category} = req.query;
            const mm = String(month).padStart(2, "0");
            const data = await db.collection("Keychal_States").aggregate([
                {
                    $match:{
                        date:{$regex:`^${year}-${mm}`},
                        rank:{$gt: 0},
                    }
                },
                {
                    $lookup:{
                        from: "Keychal_Influencers",
                        localField: "influencer",
                        foreignField: "influencer",
                        as: "influencerInfo"
                    }
                },
                {
                    $unwind:"$influencerInfo"
                },
                {
                    $match:{
                        "influencerInfo.classification": category
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
                        _id: "$keyword",
                        amount: {$sum: {$divide: ["$keywordInfo.quote", "$lastDay"]}},
                        influencer: {$first:"$influencer"},
                        item: {$first: "$keywordInfo.item"},
                        brand: {$first: "$keywordInfo.brand"},
                        date: {$first: "$dateObj"},
                        lastD: {$first: "$lastDay"}
                    }
                },
                {
                    $project:{
                        회사명: "라이프앤바이오",
                        "1": "3.판관비",
                        "2": "2.광고선전비",
                        "3": "1.바이럴마케팅",
                        코드: "",
                        세목: "바이럴_키챌월보장",
                        "년-월": {$concat:[year, "년 ", month, "월"]},
                        일자: {$dateFromParts:{
                            year: {$year: "$date"},
                            month: {$month: "$date"},
                            day: "$lastD"
                        }},
                        적요: "",
                        "거래처(세금계산서 발행처명)": {
                            $switch:{
                                branches:[
                                    {case: {$eq: ["$influencer", "모모둥이"]}, then: "(주)모모둥이"},
                                    {case: {$eq: ["$influencer", "푸들ol"]}, then: "(주)엠케이푸"},
                                    {case: {$eq: ["$influencer", "수미지"]}, then: "수미지(이지연)"}
                            ]
                            }
                        },
                        사업자등록번호: "",
                        "세금계산서: VAT 미포함 / 인건비:세전": "$amount",
                        대변: "",
                        금액: "",
                        품목명: "$item",
                        브랜드: "$brand",
                        관리부서명: "마케팅팀",
                        "세금계산서: VAT 포함 / 인건비:세후": {$multiply:["$amount", {$switch:{
                            branches:[
                                {case: {$eq:[category, "외주"]}, then: 0.967},
                                {case: {$eq:[category, "세금"]}, then: 1.1}
                        ]
                        }}]},
                        url: "",
                        제목: "",
                        업체명: "$influencer",
                        _id: 0
                    }
                }
            ]).toArray()

            res.json(data)

        }catch(err){
            res.status(500).json({error: err.message})
        }

    }
    const getMonthlyCostByItemForFree = async (req, res) => {
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
                        브랜드: {$first: "$브랜드"},
                        키워드: {$first: "$키워드"},
                        전달일: {$first: "$전달일"},
                        cnt: {$sum: 1}
                    }
                },
                {
                    $project:{
                        구분: "Actual",
                        브랜드: {
                                $switch:{
                                    branches:[
                                        {case: {$eq: ["$브랜드", "파이토뉴트리"]}, then: "01. 파이토뉴트리"},
                                        {case: {$eq: ["$브랜드", "혜인서"]}, then: "02. 혜인서"},
                                        {case: {$eq: ["$브랜드", "흑보목"]}, then: "03. 흑보목"}
                                    ],
                                    default: "$브랜드"
                                }
                                },
                        제품: "$_id",
                        세목: "01.바이럴_블로그",
                        세세목: "프리랜서_원고",
                        적요: "",
                        월: {
                            $dateToString:{
                                format: "%m월",
                                date: "$전달일"
                            }
                        },
                        금액: "$amount",
                        비고: "",
                        발행수: "$cnt",
                        단가: {$divide:["$amount", "$cnt"]},
                        업무분류: "1.바이럴마케팅",
                        _id: 0
                    }
                }
            ]).toArray();
            
            res.json(data)
        }catch(err){
            res.status(500).json({message: err.message})
        }
    }

    const getMonthlyCostByItemForSponsor = async (req, res) => {
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
                        금액: {$sum: "$세금계산서 :VAT 미포함 / 인건비:세전"},
                        발행수: {$sum: 1},
                        브랜드: {$first: "$브랜드"},
                        year_date: {$first: "$년-월"},
                    }
                },
                {
                    $project:{
                        구분: "Actual",
                        브랜드: {
                            $switch:{
                                branches:[
                                    {case: {$eq: ["$브랜드", "파이토뉴트리"]}, then: "01. 파이토뉴트리"},
                                    {case: {$eq: ["$브랜드", "혜인서"]}, then: "02. 혜인서"},
                                    {case: {$eq: ["$브랜드", "흑보목"]}, then: "03. 흑보목"},
                                    {case: {$eq: ["$브랜드", "시즈노프"]}, then: "05. 시즈노프"}
                                ],
                                default: "$브랜드"
                            }
                        },
                        제품: "$_id",
                        세목: "05.바이럴_협찬",
                        세세목: "블로그_인플협찬",
                        적요: "",
                        월: {$arrayElemAt: [{$split:["$year_date", " "]}, 1]},
                        금액: 1,
                        비고: "",
                        발행수: 1,
                        단가: {$divide:["$금액", "$발행수"]},
                        업무분류: "1.바이럴마케팅",
                        _id: 0
                    }
                }
            ]).toArray();
            
            res.json(data);
        }catch(err){
            res.status(500).json({message: err.message})
        }
    }

    const getMonthlyCostByItemForKeychal = async (req, res) => {
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
                        brand: {$first: "$keywordInfo.brand"},
                        cnt: {$sum: 1}
                    }
                },
                {
                    $project: {
                        구분: "Actual",
                        브랜드: {$switch:{
                            branches:[{case: {$eq: ["$brand", "파이토뉴트리"]}, then: "01. 파이토뉴트리"},
                                {case: {$eq:["$brand", "혜인서"]}, then: "02. 혜인서"},
                                {case: {$eq: ["$brand", "흑보목"]}, then: "03. 흑보목"}
                            ]
                        }},
                        제품: "$_id",
                        세목: "01.바이럴_블로그",
                        세세목: "키챌_월보장",
                        적요: "",
                        월: {$concat:[mm, "월"]},
                        금액: "$amount",
                        비고: "",
                        발행수: "$cnt",
                        단가: {$divide: ["$amount", "$cnt"]},
                        업무분류: "1.바이럴마케팅",
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
        getExpenseReportForFree,
        getExpenseReportForKeychal,
        getMonthlyCostByItemForFree,
        getMonthlyCostByItemForSponsor,
        getMonthlyCostByItemForKeychal
    }
}

export default createControllers;