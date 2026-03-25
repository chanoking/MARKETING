import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "../css/keychalSummary.css";
import React from "react";


export default function InflSummaryPage(){
    const [isOpen, setIsOpen] = useState(false);
    const [summary, setSummary] = useState({});
    const [search, setSearch] = useState(false);
    const [final, setFinal] = useState(["", "", ""]);
    const [confirm, setConfirm] = useState(false);
    const [isConfirmClicked, setIsConfirmClicked] = useState(false);
    const [isFinalized, setIsFinalized] = useState(false);
    
    const location = useLocation();
    const {influencer, keywordsSummary, formattedMonth, amountByMonth} = location?.state;
    
    useEffect(() => {
        const fetchMonthlyFinalizedStatus = async () => {
            const params = new URLSearchParams({
                influencer, formattedMonth
            })
            const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/monthly-finalization?${params}`);
            const data = await res.json();
            setIsFinalized(data?.confirm)
        }
        fetchMonthlyFinalizedStatus()

    }, [])
    const handleConfirm = async () => {
        try{
            const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/monthly-finalization`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    influencer,
                    formattedMonth,
                    amount: formatNumber(amountByMonth)
                })
            })
            
            if(!res.ok){
                throw new Error("Server returned an error")
            }
            
            const data = await res.json();
            alert(data.message);
            setIsFinalized(true);
            setIsConfirmClicked(false);
        }catch(err){
            alert("오류가 발생했습니다!")
        }
    }

    const formatNumber = (value) => {
        return Math.round(value).toLocaleString();
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
                    fontWeight: "bold",
                    fontSize: 27,
                    marginBottom: 30,
                    padding: 10

                }}>{formattedMonth}</div>
    
            <div
                style={{
                    display: "grid",
                    fontSize: 14.5,
                    gridTemplateColumns: "repeat(7, 1fr)",
                    placeItems: "center"
                    }}
            >
                <h3>KEYWORD</h3>
                <h3>ITEM</h3>
                <h3>BRAND</h3>
                <h3>QUOTE</h3>
                <h3>일별금액</h3>
                <h3>유지일수</h3>
                <h3>금액</h3>

                {keywordsSummary.map((keySummary, keyIdx) => (
                <React.Fragment key={keyIdx}>
                    <div className="el">{keySummary.keyword}</div>
                    <div className="el">{keySummary.item}</div>
                    <div className="el">{keySummary.brand}</div>
                    <div className="el">{formatNumber(keySummary.quote)}</div>
                    <div className="el">{formatNumber(keySummary.dailyAmount)}</div>
                    <div className="el">{formatNumber(keySummary.duration)}</div>
                    <div className="el">{formatNumber(keySummary.amount)}</div>
                </React.Fragment>
                ))}

            </div>

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

                <div className="summary-header">공급가액</div>
                <div className="summary-header">세액</div>
                <div className="summary-header">합계금액</div>
                <div className="summary-header">확인</div>
            
                <div>
                    {formatNumber(amountByMonth)}
                </div>
                <div>
                    {formatNumber(amountByMonth * 0.1)}
                </div>
                <div>
                    {formatNumber(amountByMonth * 1.1)}
                </div>
        
                {!isFinalized ? (
                    
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
                                    <p>공급가액: {formatNumber(amountByMonth)}</p>
                                    <p>세액: {formatNumber(amountByMonth * 0.1)}</p>
                                    <p> 합계금액: {formatNumber(amountByMonth * 1.1)}</p>
                                    </div>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 5
                                    }}>
                                    <button
                                        className="prompt-button"
                                        onClick={handleConfirm}
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