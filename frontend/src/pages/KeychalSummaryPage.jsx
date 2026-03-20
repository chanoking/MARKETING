import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../css/keychalSummary.css";
import React from "react";
import * as XLSX from "xlsx";

export default function KeychalSummaryPage(){
    const [summary, setSummary] = useState([]);
    const [selected, setSelected] = useState("선택");
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(useLocation().state?.user);
    const [selectedSearch, setSelectedSearch] = useState(false);

    const navigate = useNavigate();

    const calDailyValForKey = (quote) => {
        if(selected === "선택") return
        const year = selected.slice(0,4);
        const month = selected.slice(5, 7);
        const lastDay = new Date(year, month, 0).getDate();
        
        return Math.round(quote / lastDay);
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const decoded = jwtDecode(token);
            const expireTime = decoded.exp * 1000;
            const now = Date.now();

            const remaining = expireTime - now;

            if (remaining <= 0) {
                logout();
            } else {
                const timer = setTimeout(() => {
                    logout();
                }, remaining);

                return () => clearTimeout(timer);
            }
        } catch (e) {
            logout();
        }
    }, []);

    useEffect(() => {
        const fetchSummary = async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/summary`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            const summary = {};

            const cache = {};
            
            const promises = data.map(async (doc) => {
                if(!cache[doc.keyword]){
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/keywordInfo?keyword=${doc.keyword}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    cache[doc.keyword] = await res.json();                    
                }
                
                return {doc, keywordInfo: cache[doc.keyword]};
            });

            const results = await Promise.all(promises);

            results.forEach(({ doc, keywordInfo }) => {
                const year = doc.date.slice(0, 4);
                const month = doc.date.slice(5, 7);
                const dateKey = `${year}년 ${month}월`;
    
                if (!summary[dateKey]) summary[dateKey] = {}; // 날짜 객체 초기화
                if (!summary[dateKey][doc.keyword]) {
                    summary[dateKey][doc.keyword] = {
                        duration: 0,
                        influencer: doc.influencer,
                        quote: keywordInfo.quote,
                        brand: keywordInfo.brand,
                        item: keywordInfo.item
                    }
                }
                if (doc.rank > 0) summary[dateKey][doc.keyword]["duration"]++;  

            })
            setSummary(summary);
        }
        fetchSummary();
    }, [])

    const download = (obj) => {
        if(!obj[selected]){
            alert("날짜를 선택해주세요");
            return;
        }

        const data = [];
        
        for(let keyword in obj[selected]){
            const quote = obj[selected][keyword]["quote"];
            const dailyValue = calDailyValForKey(quote);
            const duration = obj[selected][keyword]["duration"];
            const value = duration * dailyValue;
            const brand = obj[selected][keyword]["brand"];
            const item = obj[selected][keyword]["item"];
            const influencer = obj[selected][keyword]["influencer"];

            const doc = {
                keyword,
                influencer,
                brand,
                item,
                quote,
                dailyValue,
                duration,
                value
            }
            
            data.push(doc);
        }

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");

        XLSX.writeFile(workbook, "keychal.xlsx");
    }

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
    }

    return (
            <div
                style={{
                    padding: 10,
                    userSelect: "none",
            }}>

                <div
                    style={{
                        display: "flex",
                        gap: 10
                    }}
                >

                    <div style={{
                        width: 150, 
                        position: "relative",
                    }}>

                        <div
                            onClick={() => setIsOpen(prev => !prev)}
                            style={{
                                border: "1px solid #ccc",
                                padding: 10,
                                cursor: "pointer",
                                background: "#fff",
                                fontWeight: "bold",
                                borderRadius: 5
                            }}
                        >
                            {selected}
                        </div>

                        {isOpen && (
                            <div
                                style={{
                                    position: "absolute",
                                    width: "100%",
                                    border: "1px solid #ccc",
                                    background: "#fff",
                                    zIndex: 10
                                }}
                            >
                                <>
                                    <div
                                        style={{
                                            padding:10,
                                            cursor: "pointer",
                                            borderBottom: "1px solid #eee",
                                            fontSize: 14
                                        }}
                                        onClick={() => {
                                            setIsOpen(false);
                                            setSelected("선택");
                                        }}>선택</div>
                                    {Object.keys(summary).map((e, i) => (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                setSelected(e);
                                                setIsOpen(false);
                                            }}
                                            style={{
                                                padding: 10,
                                                cursor: "pointer",
                                                borderBottom: "1px solid #eee",
                                                fontSize: 14
                                            }}
                                        >
                                            {e}
                                        </div>
                                    ))}
                                </>
                            </div>                         
                        )}

                    </div>

                    <button
                        style={{
                            fontWeight: "bold",
                            border: "1px solid #ccc",
                            background: "#3b82f6",
                            color: "white"
                        }}
                        onClick={()=> setSelectedSearch(true)}
                    >
                        조회
                    </button>

                    <button
                        style={{
                            border: "1px solid #ccc",
                            fontWeight: "bold",
                            background: "#2563EB",
                            color: "white"
                        }}
                        onClick={() => {download(summary)}}
                    >
                        다운로드
                    </button>

                    <div
                        style={{
                            padding: 10,
                            border: "1px solid #ccc",
                            borderRadius: 5,
                            fontWeight: "bold",
                            background: "#f3f4f6"
                        }}>
                        {user}
                    </div>
                    
                    <button
                        style={{
                            fontWeight: "bold",
                            border: "1px solid #ccc",
                            background: "#ef4444",
                            color: "white"
                        }}
                        onClick={logout}
                    >
                        로그아웃
                    </button>



                </div>
            
            {selectedSearch && (
                <div
                    style={{
                        display: "grid",
                        fontSize: 14.5,
                        gridTemplateColumns: "repeat(8, 1fr)",
                        placeItems: "center",
                    }}
                >
                    <h3>KEYWORD</h3>
                    <h3>INFLUENCER</h3>
                    <h3>BRAND</h3>
                    <h3>ITEM</h3>
                    <h3>QUOTE</h3>
                    <h3>일별금액</h3>
                    <h3>유지일수</h3>
                    <h3>금액</h3>

                    {summary[selected] && Object.keys(summary[selected]).map((k, idx) => (
                        <React.Fragment
                            key={idx}>
                                <div
                                    className="el">{k}</div>
                                <div
                                    className="el">{summary[selected][k]["influencer"]}</div>
                                <div
                                    className="el">{summary[selected][k]["brand"]}</div>
                                <div
                                    className="el">{summary[selected][k]["item"]}</div>
                                <div
                                    className="el">{summary[selected][k]["quote"].toLocaleString()}</div>
                                <div
                                    className="el">{calDailyValForKey(summary[selected][k]["quote"]).toLocaleString()}</div>
                                <div
                                    className="el">{summary[selected][k]["duration"]}</div>
                                <div
                                    className="els">{(calDailyValForKey(summary[selected][k]["quote"]) * summary[selected][k]["duration"]).toLocaleString()}</div>

                        </React.Fragment>
                    ))}
                    
                </div>

            )}

            </div>
            )
}