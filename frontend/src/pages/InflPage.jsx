import { useLocation } from "react-router-dom";
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

    const location = useLocation();
    const influencer = location.state?.influencer;
    const infl = influencer?.influencer

    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    useEffect(() => {
        if(!influencer) return;

        const fetchKeywords = async () => {
            const res = await fetch(`http://localhost:3000/keychal/keywords?influencer_id=${influencer._id}`);
            const data = await res.json();
            setKeywords(data);
        }
        fetchKeywords();
    }, [influencer])

    useEffect(() => {
        const fetchStates = async () => {
            const res = await fetch(`http://localhost:3000/keychal/influencer?influencer=${infl}`);
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

    const handleClickKeyword = (keyword, quote) => {
        setSelectedKeyword(keyword);
        setKeywordPopup(true);
        calculate(keyword, quote);
    }
    
    const calculate = async (keyword, quote) => {
        const res = await fetch(
            `http://localhost:3000/keychal/infl/keyword?influencer=${infl}&keyword=${keyword}`);
        const data = await res.json();    
        const len = data.filter(s => +(s.date.slice(0, 4)) === year 
                    && +(s.date.slice(5, 7)) === month
                    && s.rank > 0).length
        const lastDay = new Date(year, month, 0).getDate();
        const dailyV = Math.round(quote / lastDay);
        const currentV = dailyV * len;
            
        setCurrentVal(currentV.toLocaleString());
        setDailyVal(dailyV.toLocaleString());
        setQuote(quote.toLocaleString());
        setLen(len);
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
                            onClick={() => handleClickKeyword(k.keyword, k.quote)}
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
                    copyDate.setDate(copyDate.getDate() + 1)
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
                            
                            <button 
                            style={buttonStyle}
                            onClick={() => setKeywordPopup(false)}>닫기</button>
                    </div>
                )

            }

        </div>
    )
}