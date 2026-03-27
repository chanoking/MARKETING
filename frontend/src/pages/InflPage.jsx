import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../css/custom-datepicker.css";
import "../css/inflPage.css";

export default function InflPage(){
    const [keywords, setKeywords] = useState([]);
    const [keywordsSummary, setKeywordsSummary] = useState([]);
    const [date, setDate] = useState(new Date());
    const [memo, setMemo] = useState([]);
    const [popup, setPopup] = useState(false);
    const [keywordPopup, setKeywordPopup] = useState(false);
    const [amountByMonth, setAmountByMonth] = useState(0);
    const [keyword, setKeyword] = useState({});
    const [groupedKeywordsByRank, setGroupedKeywordsByRank] = useState([]);
    const [selectedKeyword, setSelectedKeyword] = useState("");
    
    const location = useLocation();
    const influencer = location.state?.influencer;
    const infl = influencer?.influencer
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const navigate = useNavigate();
    
    const [currentYearMonth, setCurrentYearMonth] = useState(`${year}년 ${month}월`);
    const [beforeYearMonth, setBeforeYearMonth] = useState(`${month - 1 === 0 ? `${year-1}년 12월` : `${year}년 ${month-1}월`}`);
    const [afterYearMonth, setAfterYearMonth] = useState(`${month + 1 === 13 ? `${year + 1}년 1월` : `${year}년 ${month+1}월`}`);

    const curYear = currentYearMonth.slice(0, 4);
    const findIndexOfMonth = currentYearMonth.indexOf("월");
    const curMonth = currentYearMonth.slice(6, findIndexOfMonth);
    
    // fetching keywords
    useEffect(() => {
        if(!influencer) return;
        
        const fetchKeywords = async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/keywords/${influencer._id}`);
            const data = await res.json();
            setKeywords(data);
        }
        fetchKeywords();
    }, [influencer])


    // fetching keywords' summary by year and month
    useEffect(() => {
        const fetchKeywordsSummary = async () => {
            const params = new URLSearchParams({
                influencer: infl,
                month,
                year
            })
            const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/keywords-summary?${params}`)
            const data = await res.json();
            setKeywordsSummary(data)
        }
        fetchKeywordsSummary();
    }, [])
    
    useEffect(() => {
        const fetchStates = async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/states?influencer=${infl}`);
            const data = await res.json();

            setMemo(data);
        }
        fetchStates();
    }, [infl])
    
    useEffect(() => {
        const fetchAmount = async () => {
            const params = new URLSearchParams({ influencer: infl, year: curYear, month: curMonth.trim() });
            const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/influencer/amount?${params}`);
            const data = await res.json();
            
            setAmountByMonth(data[0]?.amount);
        }
        
        fetchAmount();
    }, [infl, curYear, curMonth])

    useEffect(() => {
        const fetchGroupedKeywordsByRank = async () => {
            const params = new URLSearchParams({ influencer: infl, year: curYear, month: curMonth });
            const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/influencer/keywords-grouped-by-rank?${params}`);
            const data = await res.json();
  
            setGroupedKeywordsByRank(data);
        }
        fetchGroupedKeywordsByRank();
    }, [])

    const formatDate = (yearMonth, offset, option) => {
        let year = +yearMonth.slice(0, 4);
        const indexOfMonth = yearMonth.indexOf("월");
        let month = +yearMonth.slice(5, indexOfMonth);

        month += offset;

        while (month > 12) {
            month -= 12;
            year += 1;
        }
        while (month < 1) {
            month += 12;
            year -= 1;
        }

        const result = `${year}년 ${month}월`;

        if(!option){
            setCurrentYearMonth(result);
            formatDate(result, 1, 1);
            formatDate(result, -1, -1);
        }else{
            if(option === 1){
                setAfterYearMonth(result);
            }else{
                setBeforeYearMonth(result);
            }
        }
    };

    const handleClickKeyword = (keyword) => {
        setSelectedKeyword(keyword);
        setKeywordPopup(true);
        setKeyword(keywordsSummary.find(summary => summary.keyword === keyword));
    }

    const handleSummary = () => {
        navigate("/inflSummary",{
            state: {influencer: infl, keywordsSummary, formattedMonth: currentYearMonth, amountByMonth}
        });
    }



    const buttonStyle = {
                    marginTop:10,
                    padding: 5,
                    height: 30,
                    fontSize: 12,
                    background: "#FF4C4C",
                    color: "white"
                }

    return (
        <div
            style={{
                padding: 20,
                userSelect: "none",
            }}>
            <div style={{
                display: "flex",
                gap: 10
            }}>
                <div>
                    {keywords.map(k => (
                        <div
                            key={k._id}
                            style={{
                                border:"2px solid #ccc",
                                padding:10,
                                marginBottom:5,
                                background:"#FFFFF0",
                                fontWeight:600,
                                cursor: "pointer"
                                }}
                            onClick={() => {handleClickKeyword(k.keyword, k.quote)}}
                        >
                            {k.keyword}
                        </div>
                    ))}
                </div>
                
                 <DatePicker
                    className="my-date-picker"
                    selected={date}
                    onChange={(d) => {
                        setDate(d);
                        setPopup(true);
                    }}
                    renderDayContents={(day, date) => {
                        const copyDate = new Date(date);
                        copyDate.setHours(9);
                        const d = copyDate.toISOString().slice(0,10);
                        const val = memo.find(state => state.date === d)?.count;

                        return (
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                height: "100%",  // 하루 cell 안에서만
                                fontSize: 12,
                                overflow: "hidden"  // 길어지면 숨기기
                            }}>
                                <div>{day}</div>
                                {val && <div style={{
                                    fontSize: 9,
                                    lineHeight:1,
                                    color: "blue"
                                    }}>valid: {val}</div>}
                            </div>
                        )
                    }}
                inline />

                <div className="wheel-picker">
                    <button className="arrow up"
                        onClick={() => formatDate(currentYearMonth, -1)}
                    >▲</button>
                        <ul className="picker-list">
                            <li className="faded">{beforeYearMonth}</li>
                            <li className="selected">{currentYearMonth}</li>
                            <li className="faded">{afterYearMonth}</li>
                        </ul>
                    <button className="arrow down"
                        onClick={() => formatDate(currentYearMonth, 1)}>▼</button>
                </div>

                <div
                    style={{padding: "120px 10px"}}>
                    <h2>{currentYearMonth} 금액</h2>
                    <p style={{
                        fontWeight: "bold"
                    }}>{Math.round(amountByMonth).toLocaleString()}</p>
                    <button
                        style={{
                            background: "#F5F5F5",
                            boder: "1px solid #ccc",
                            fontWeight: "bold",
                            border: "1px solid #ccc"
                        }}
                        onClick={handleSummary}
                        >Summary</button>
                </div>
                
                {popup && 
                <div className="popup">
                
                    <p style={{
                        fontSize: 14,
                        fontWeight: 600,
                        }}>{date.toISOString().split("T")[0]}</p>
                    
                    <div
                        style={{
                            display: "flex",
                            gap: 120,
                        }}>
                        <h4>Positive</h4>
                        <h4>Negative</h4>
                    </div>
                    
                    <div style={{ display: "flex", gap: 80 }}>

                        <div>
                            {groupedKeywordsByRank.find((v) => v.date === date.toISOString().split("T")[0])?.positive?.map((k, i) => (
                                <p key={i} style={{ margin: 0, fontSize: 14}}>{k}</p>
                            ))}
                        </div>

                        <div>
                            {groupedKeywordsByRank.find(v => v.date === date.toISOString().split("T")[0])?.negative.map((k, i) => (
                                <p key={i} style={{margin: 0, fontSize: 14}}>{k}</p>
                            ))}
                        </div>

                    </div>

                    <button
                    style={buttonStyle}
                        onClick={() => setPopup(false)}
                        >
                        닫기</button>

                    </div> 
                }

                {
                    keywordPopup && (
                        <div
                            className="popup">
                                
                                <div style={{
                                    display: "flex",
                                    gap: 30,
                                    textAlign: "center"
                                }}>

                                    <div className="quote">
                                        <h3>견적</h3>
                                        <p>{Math.round(keyword.quote).toLocaleString()}</p>
                                    </div>

                                    <div className="dailyAmount">
                                        <h3>일별금액</h3>
                                        <p>{Math.round(keyword.dailyAmount).toLocaleString()}</p>
                                    </div>

                                    <div className="duration">
                                        <h3>유지일수</h3>
                                        <p>{keyword.duration}</p>
                                    </div>

                                    <div className="amount">
                                        <h3>금액</h3>
                                        <p>{Math.round(keyword.amount).toLocaleString()}</p>
                                    </div>

                                </div>

                                <div>
                                    <h3>노출일자</h3>
                                    <div>
                                        {keyword.durationDays.join(" ")}
                                    </div>
                                </div>
                                
                                <button 
                                style={buttonStyle}
                                onClick={() => setKeywordPopup(false)}>닫기</button>
                        </div>
                    )

                }

            </div>
        </div>
    )
}