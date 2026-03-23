import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../css/keychalSummary.css";
import React from "react";


export default function InflSummaryPage(){
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState("선택");
    const [summary, setSummary] = useState({});
    const [search, setSearch] = useState(false);
    const [final, setFinal] = useState(["", "", ""]);
    const [confirm, setConfirm] = useState(false);
    const [isConfirmClicked, setIsConfirmClicked] = useState(false);
    
    const location = useLocation();
    const infl = location.state?.infl;

    useEffect(() => {
        const fetchSummary = async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/inflSummary?influencer=${infl}`);
            const data = await res.json();
            setSummary(data);
        }
        fetchSummary();
    }, [])

    useEffect(() => {
        if(!summary[selected]) return;
        const sum = () => {
            let total = 0;
            Object.keys(summary[selected]).forEach((k) => {
                const quote = summary[selected][k]["quote"];
                const dV = calculateDailyValue(quote);
                const v = dV * summary[selected][k]["duration"];
                total += v;
            })
            const vat = Math.round(total * 0.1);
            const result = total + vat;
            setFinal([total.toLocaleString(), vat.toLocaleString(), result.toLocaleString()])
        }
        sum()
    }, [selected])

    useEffect(() => {
        if(selected === "선택") return;

        const fetchConfirm = async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/confirm?influencer=${infl}&formattedMonth=${selected}`);
            const data = await res.json();
            
            if(data?.confirm) setConfirm(true);
        }
        fetchConfirm()
    }, [selected])

    const calculateDailyValue = (quote) => {
        const year = selected?.slice(0, 4);
        const month = selected?.slice(5, 7);
        const lastDay = new Date(year, month, 0).getDate();

        return Math.round(quote/ lastDay);
    }

    const handleConfirm = async () => {
        try{
            const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/doConfirm`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    influencer: infl,
                    formattedMonth: selected,
                    amount: final[0]
                })
            })

            
            if(!res.ok){
                throw new Error("Server returned an error")
            }
            
            const data = await res.json();
            alert(data.message);
            setConfirm(true);
        }catch(err){
            alert("오류가 발생했습니다!")
        }
    }

    return (
        <div
            style={{
                padding: 10,
                userSelect: "none"
            }}
        >
            <div
                style={{
                    display: "flex",
                    gap: 10,
                    marginBottom: 20
                }}
            >
                <div
                    style={{
                        width: 150,
                        position: "relative"
                    }}
                >
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
                            
                            <div
                                style={{
                                    padding: 10,
                                    cursor: "pointer",
                                    borderBottom: "#fff",
                                    fontSize: 14
                                }}
                                onClick={() => {
                                    setIsOpen(false);
                                    setSelected("선택");
                                }}
                            >
                                선택
                            </div>

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
                                        borderBottom: "#fff",
                                        fontSize: 14
                                    }}
                                >
                                    {e}
                                </div>
                            ))}

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
                    onClick={() => setSearch(true)}
                >
                    조회
                </button>
            </div>

            {search && (
                <>
                    <div
                        style={{
                            display: "grid",
                            fontSize: 14.5,
                            gridTemplateColumns: "repeat(7, 1fr)",
                            placeItems: "center"
                        }}
                    >
                        <h3>KEYWORD</h3>
                        <h3>BRAND</h3>
                        <h3>ITEM</h3>
                        <h3>QUOTE</h3>
                        <h3>일별금액</h3>
                        <h3>유지일수</h3>
                        <h3>금액</h3>

                        {Object.keys(summary[selected]).map((k, ki) => (
                            <React.Fragment
                                key={ki}
                            >
                            <div
                                className="el">{k}</div>
                            <div
                                className="el">{summary[selected][k]["item"]}</div>
                            <div
                                className="el">{summary[selected][k]["brand"]}</div>
                            <div
                                className="el">{summary[selected][k]["quote"].toLocaleString()}</div>
                            <div
                                className="el">{calculateDailyValue(summary[selected][k]["quote"]).toLocaleString()}</div>
                            <div
                                className="el">{summary[selected][k]["duration"]}</div>
                            <div
                                className="els">{(summary[selected][k]["duration"] * calculateDailyValue(summary[selected][k]["quote"])).toLocaleString()}</div>

                            </React.Fragment>
                        ))}
                    </div>

                    <>
                    <div
                        style={{
                            marginTop: 30,
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: 10,
                            padding: "10px 480px",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center"
                    }}>

                        <div
                            className="summary-header">공급가액</div>
                        <div
                            className="summary-header">세액</div>
                        <div
                            className="summary-header">합계금액</div>
                        <div
                            className="summary-header">확인</div>
                   
                        <div>
                            {final[0]}
                        </div>
                        <div>
                            {final[1]}
                        </div>
                        <div>
                            {final[2]}
                        </div>
                
                        {!confirm ? (
                            
                            <button
                            style={{
                                background: "#4CAF50",
                                border: "1px solid #ccc",
                                color: "white",
                                padding: "8px 16px",
                                borderRadius: "4px",
                                minWidth: "100px",
                                cursor: "pointer"
                            }}
                            onClick={() => setIsConfirmClicked(true)}
                            >
                                금액확정
                            </button>

                        ) : (

                            <div
                                style={{
                                    background: "#E0F2F1",
                                    color:"#00796B",
                                    padding: "8px 16px",
                                    borderRadius: "4px",
                                    minWidth: "100px",
                                    textAlign: "center"
                                }}
                            >
                                금액확정
                            </div>

                        )}

                    </div>
                    </> 
                </>
            )}

            {isConfirmClicked && (
                <div
                    style={{
                        background: "rgba(0,0,0,0.5)",
                        position: "fixed",
                        inset: 0
                    }}
                >
                    <div
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "ivory",
                            padding: "20px",
                            border: "1px solid #ccc",
                            zIndex: 1000,
                            width: 400,
                            borderRadius: 5,
                            fontStyle: "italic",
                            fontFamily: "Noto Sans KR, sans-serif"
                        }}>
                            <div
                                style={{
                                    marginBottom: 10,
                                }}>
                                    <p
                                        style={{
                                            fontWeight: 500
                                        }}>해당 금액이 맞습니까?</p>
                                    <p>공급가액: {final[0]}</p>
                                    <p>세액: {final[1]}</p>
                                    <p> 합계금액: {final[2]}</p>
                                    </div>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 5
                                    }}>
                                    <button
                                        className="prompt-button"
                                        onClick={() => {
                                            setIsConfirmClicked(false);
                                            handleConfirm();
                                        }}
                                        >확인</button>
                                    <button
                                        className="prompt-button"
                                        onClick={() => setIsConfirmClicked(false)}
                                        >취소</button>
                                </div>
                        </div>
                    
                </div>
            )}
        </div>
    )

}