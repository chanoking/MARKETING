import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../css/custom-datepicker.css";

export default function InflPage(){
    const [keywords, setKeywords] = useState([]);
    const [date, setDate] = useState(new Date());
    const [memo, setMemo] = useState({});
    const [popup, setPopup] = useState(false);
    const [keywordStates, setKeywordStates] = useState([]);
    const [keywordPopup, setKeywordPopup] = useState(false);
    const [selectedKeyword, setSelectedKeyword] = useState(null);
    const [len, setLen] = useState(0);
    const [dailyVal, setDailyVal] = useState(0);
    const [quote, setQuote] = useState(0);
    const [currentVal, setCurrentVal] = useState(0);
    const [keywordVisibleDays, setKeywordVisibleDays] = useState([]);
    const [totalValueByMonth, setTotalValueByMonth] = useState(0);
    
    const location = useLocation();
    const influencer = location.state?.influencer;
    const infl = influencer?.influencer
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const navigate = useNavigate();
    
    const [currentYearMonth, setCurrentYearMonth] = useState(`${year}년 ${month}월`);
    const [beforeYearMonth, setBeforeYearMonth] = useState("");
    const [afterYearMonth, setAfterYearMonth] = useState("");

    const curYear = currentYearMonth.slice(0, 4);
    const findIndexOfMonth = curYear.indexOf("월")
    const curMonth = currentYearMonth.slice(5, findIndexOfMonth);
    
    useEffect(() => {
        if(!influencer) return;

        const fetchKeywords = async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/keywords?influencer_id=${influencer._id}`);
            const data = await res.json();
            setKeywords(data);
        }
        fetchKeywords();
    }, [influencer])
    
    useEffect(() => {
        const fetchStates = async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/influencer?influencer=${infl}`);
            const data = await res.json();
            
            setKeywordStates(data);
            
            const map = {};
            
            for(let state of data){
                const d = state["date"];
                const r = state["rank"];
                if(!map[d]){
                    if (r > 0){
                        map[d] = 1;
                    }else{
                        map[d] = 0;
                    }
                }else{
                    if (r > 0){
                        map[d]++;
                    }
                }
            }
            
            setMemo(map);
        }
        fetchStates();
    }, [infl])

    useEffect(() => {
        const fetchTotalValue = async () => {
            const params = new URLSearchParams({ influencer: infl, year: curYear, month: curMonth.trim() });
            const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/inflTotalValue?${params}`);
            const data = await res.json();   
            
            setTotalValueByMonth(data.sum);
        }
        
        fetchTotalValue();
    }, [infl, curYear, curMonth])
    
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

    const handleClickKeyword = (keyword, quote) => {
        setSelectedKeyword(keyword);
        setKeywordPopup(true);
        calculate(keyword, quote);
    }

    const calculate = async (keyword, quote) => {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/keychal/infl/keyword?influencer=${infl}&keyword=${keyword}`);
        const data = await res.json();    
        const filteredData = data.filter(s => +(s.date.slice(0, 4)) === year 
                    && +(s.date.slice(5, 7)) === month
                    && s.rank > 0)
        const len = filteredData.length;    
        const visibleDays = filteredData.map(d => +(d?.date?.slice(8, 10)));
        
        visibleDays.sort((a,b) => a - b)

        const lastDay = new Date(year, month, 0).getDate();
        const dailyV = Math.round(quote / lastDay);
        const currentV = dailyV * len;
            
        setCurrentVal(currentV.toLocaleString());
        setDailyVal(dailyV.toLocaleString());
        setQuote(quote.toLocaleString());
        setLen(len);
        setKeywordVisibleDays(visibleDays);
    }

    const handleSummary = () => {
        navigate("/inflSummary",{
            state: {infl}
        });
    }

    const paint = (item) => {
        switch(item){
            case "그로우뉴":
            case "지니어스뉴":
                return "#BFFFC0";
            case "블러드플로우케어":
                return "#F08080";
            case "흑본전탕":
                return "#DCDCDC";
            case "파미로겐":
                return "#FA8072"
            case "185커큐민":
                return "#C68642"
            case "위이지케어":
                return "#B0E0E6"
            default:
                return "#fff";
        }
    }
    
    const paintText = (bg) => {
        switch(bg){
            case "#BFFFC0": return "#004E00";
            case "#F08080": return "#610000";
            case "#DCDCDC": return "#333333";
            case "#FA8072": return "#5A1D17";
            case "#C68642": return "#FFFFF0";
            case "#B0E0E6": return "#004E6E";
            default: return "#000";
        }
    };

    const popupStyle = {
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "#EDEDED",
                padding: 20,
                border: "1px solid #ccc",
                zIndex: 1000,
                borderRadius: 5
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
        <div style={{
            userSelect: "none",
            marginLeft: 10,
            display: "flex",
        }}>
            <div>
                {keywords.map(k => {
                    const bg = paint(k.item);

                    return (
                        <div
                            key={k._id}
                            style={{
                                    border:"2px solid #ccc",
                                    padding:10,
                                    marginBottom:5,
                                    marginRight:10,
                                    background:bg,
                                    color:paintText(bg),
                                    fontWeight:600,
                                    cursor: "pointer"
                                    }}
                            onClick={() => {handleClickKeyword(k.keyword, k.quote)}}
                                    >
                            {k.keyword}
                        </div>
                        )
                    })}
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
                    const val = memo[d]; // val은 문자열 또는 배열

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
                }}>{totalValueByMonth}</p>
                <button
                    style={{
                        background: "#F5F5F5",
                        boder: "1px solid #ccc",
                        fontWeight: "bold"
                    }}
                    onClick={handleSummary}
                    >Summary</button>
            </div>
            
            {popup && 
            <div style={popupStyle}>
            
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
                    {keywordStates.filter(k => k.rank > 0 && 
                        k.date === date.toISOString().split("T")[0]).map(k => (
                        <p key={k._id} style={{ margin: 0, fontSize: 14 }}>{k.keyword}</p>
                    ))}
                </div>

                <div>
                    {keywordStates.filter(k => k.rank === 0 &&
                        k.date === date.toISOString().split("T")[0]).map(k => (
                        <p key={k._id} style={{ margin: 0, fontSize: 14 }}>{k.keyword}</p>
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
                        style={popupStyle}>
                            
                            <div style={{
                                display: "flex",
                                gap: 30,
                                textAlign: "center"
                            }}>

                                <div className="duration">
                                    <h3>유지일수</h3>
                                    <p>{len}</p>
                                </div>

                                <div className="dailyVal">
                                    <h3>일별금액</h3>
                                    <p>{dailyVal}</p>
                                </div>

                                <div className="quote">
                                    <h3>견적</h3>
                                    <p>{quote}</p>
                                </div>

                                <div className="currentVal">
                                    <h3>현재금액</h3>
                                    <p>{currentVal}</p>
                                </div>

                            </div>

                            <div>
                                <h3>노출 날짜</h3>
                                <div>
                                    {keywordVisibleDays.join(", ")}
                                </div>
                            </div>
                            
                            <button 
                            style={buttonStyle}
                            onClick={() => setKeywordPopup(false)}>닫기</button>
                    </div>
                )

            }

        </div>
    )
}