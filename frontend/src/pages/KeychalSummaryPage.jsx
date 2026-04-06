import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../css/keychalSummary.css";
import React from "react";
import * as XLSX from "xlsx";

export default function KeychalSummaryPage(){
    const [selected, setSelected] = useState("선택");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedInfluencer, setSelectedInfluencer] = useState("전체")
    const [isOpenB, setIsOpenB] = useState(false);
    const [formattedMonths, setFormattedMonths] = useState([]);
    const [summaryByMonth, setSummaryByMonth] = useState([]);
    const [selectedSummaryByMonth, setSelectedSummaryByMonth] = useState([]);
    const [isSearchClicked, setIsSearchClicked] = useState(false);
    const [amountByMonth, setAmountByMonth] = useState([]);
    const [amount, setAmount] = useState(0);
    const [influencers, setInfluencers] = useState([]);
    const [summaryByMonthAndInfluencer, setSummaryByMonthAndInfluencer] = useState([]);
    const [amountGroupedByMonthAndInfluencer, setAmountGroupedByMonthAndInfluencer] = useState([]);
    const [selectedAmountGroupedByMonthAndInfluencer, setSelectedAmountGroupedByMonthAndInfluencer] = useState([]);
    
    const location = useLocation();
    const navigate = useNavigate();
    const {user} = location.state || {};

    useEffect(() => {
        const makeFormattedMonths = () => {
            const {amountByMonth} = location.state;
            const formattedMonths = amountByMonth.map(doc => doc["date"]);

            setAmountByMonth(amountByMonth);
            setFormattedMonths(formattedMonths);
        }

        const makeInfluencers = () => {
            const {influencers} = location.state;
            setInfluencers(influencers);
        }

        makeFormattedMonths();
        makeInfluencers();
    }, [])

    useEffect(() => {
        const token = localStorage.getItem("token");
        const fetchSummaryByMonth = async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/summary-by-month`,{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })
            const data = await res.json();

            setSummaryByMonth(data)
        }
        fetchSummaryByMonth();
    }, [])

    useEffect(() => {
        const token = localStorage.getItem("token");
        const fetchAmountByMonthAndInfluencer = async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/amount-by-month-influencer`,{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();

            setAmountGroupedByMonthAndInfluencer(data);
        }

        fetchAmountByMonthAndInfluencer();
    }, [])



    const handleSearch = () => {
        if(selected === "선택"){
            alert("날짜를 선택해주세요.")
            return
        }

        setIsSearchClicked(true);

        const filtered = summaryByMonth.filter((doc) => doc.formattedMonth === selected);
 
        setSelectedSummaryByMonth(filtered);
        
        const found = amountByMonth.find((doc) => doc.date === selected);

        if(selectedInfluencer === "전체"){    
            setAmount(found ? found.amount : 0);
        }else if(selectedInfluencer === "Group By"){
            const filtered = amountGroupedByMonthAndInfluencer.filter((doc) => doc.formattedMonth === selected);

            setAmount(found ? found.amount : 0);
            setSelectedAmountGroupedByMonthAndInfluencer(filtered);
        }else{
            const filteredByInfluencer = filtered.filter((doc) => doc.influencer === selectedInfluencer);
            
            setSummaryByMonthAndInfluencer(filteredByInfluencer);
            
            const amount = filteredByInfluencer.reduce((acc, cur) => acc + (cur.amount || 0), 0);

            setAmount(amount);
        }

    }

    const handleDownload = () => {
        if(!isSearchClicked){
            alert("요청하신 내용이 없습니다.");
            return;
        }
        const data = selectedInfluencer === "전체" ? 
                    selectedSummaryByMonth : selectedInfluencer === "Group By" ? 
                    selectedAmountGroupedByMonthAndInfluencer : summaryByMonthAndInfluencer;
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        XLSX.writeFile(workbook, "data.xlsx")
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login")
    }

    const numberFormat = (value) => {
        return Math.round(value).toLocaleString();
    }

    return (
            <div className="home">
                <div className="keychal-summary-header">
                    <div className="form">
                        <div 
                            className="selection"
                            onClick={() => setIsOpen(prev => !prev)}>
                                {selected}
                        </div>
                        {isOpen && (
                            <div className="drop-down">
                                <div 
                                    className="li"
                                    onClick={() => {
                                        setIsOpen(false)
                                        setIsSearchClicked(false)
                                        setSelected("선택")
                                    }}>선택</div>

                                {formattedMonths.map((v, i) => (
                                    <React.Fragment
                                        key={i}>
                                            <div 
                                                className="li"
                                                onClick={() => {
                                                    setIsOpen(false)
                                                    setIsSearchClicked(false)
                                                    setSelected(v)
                                                }}>
                                                {v}
                                            </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="form">
                        <div 
                            className="selection"
                            onClick={() => setIsOpenB(prev => !prev)}>
                                {selectedInfluencer}
                        </div>
                        {isOpenB && (
                            <div className="drop-down">
                                <div 
                                    className="li"
                                    onClick={() => {
                                        setIsOpenB(false)
                                        setIsSearchClicked(false)
                                        setSelectedInfluencer("전체")
                                    }}>전체</div>

                                <div 
                                    className="li"
                                    onClick={() => {
                                        setIsOpenB(false)
                                        setIsSearchClicked(false)
                                        setSelectedInfluencer("Group By")
                                    }}>Group By</div>

                                {influencers?.map((v, i) => (
                                    <div
                                        key={i}>
                                            <div 
                                                className="li"
                                                onClick={() => {
                                                    setIsOpenB(false)
                                                    setIsSearchClicked(false)
                                                    setSelectedInfluencer(v.influencer)
                                                }}>
                                                {v.influencer}
                                            </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        className="summary-button search"
                        onClick={handleSearch}>
                            조회
                    </button>

                    <button
                        className="summary-button download"
                        onClick={handleDownload}>
                            다운로드
                    </button>

                    <div className="summary-user">{user}</div>

                    <button
                        className="summary-button summary-logout"
                        onClick={handleLogout}>
                            로그아웃
                    </button>

                </div>

                <div className="keychal-summary-body">
                    {isSearchClicked && (
                        selectedInfluencer === "Group By" ? (
                            <>
                            <div className="keychal-table-by-influencer">
                                <h2 style={{textAlign: "center"}}>INFLUENCER</h2>
                                <h2 style={{textAlign: "center"}}>AMOUNT</h2>

                                    {selectedAmountGroupedByMonthAndInfluencer.map((data, i) => (
                                        <React.Fragment
                                            key={i}>
                                                <div style={{border:"1px solid #ccc", textAlign: "center", height: 30, lineHeight: "30px"}}>
                                                    {data.influencer}</div>
                                                <div style={{border:"1px solid #ccc", textAlign: "center", height: 30, lineHeight: "30px"}}>
                                                    {numberFormat(data.amount)}</div>
                                        </React.Fragment>
                                    ))}
                            </div>

                            <div className="footer-amount">
                                <div style={{fontSize: 25, fontWeight: 600, textAlign:"center"}}>금액</div>
                                <div style={{fontSize: 22, fontWeight: 500, paddingLeft: 5}}>{numberFormat(amount)}</div>
                            </div>
                            </>
                        ) : (
                            <>
                            <div className="keychal-table">
                                <h2>KEYWORD</h2>
                                <h2>INFLUENCER</h2>
                                <h2>ITEM</h2>
                                <h2>BRAND</h2>
                                <h2>QUOTE</h2>
                                <h2>DAILY AMOUNT</h2>
                                <h2>DURATION</h2>
                                <h2>AMOUNT</h2>

                                <>
                                    {(selectedInfluencer === "전체" ? (
                                        selectedSummaryByMonth.map((summary, idx) => (
                                            <React.Fragment
                                                key={idx}>
                                                    <div className="summary-tile">{summary.keyword}</div>
                                                    <div className="summary-tile">{summary.influencer}</div>
                                                    <div className="summary-tile">{summary.item}</div>
                                                    <div className="summary-tile">{summary.brand}</div>
                                                    <div className="summary-tile">{numberFormat(summary.quote)}</div>
                                                    <div className="summary-tile">{numberFormat(summary.dailyAmount)}</div>
                                                    <div className="summary-tile">{summary.duration}</div>
                                                    <div className="summary-tile">{numberFormat(summary.amount)}</div>
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        summaryByMonthAndInfluencer.map((summary, idx) => (
                                            <React.Fragment
                                                key={idx}>
                                                    <div className="summary-tile">{summary.keyword}</div>
                                                    <div className="summary-tile">{summary.influencer}</div>
                                                    <div className="summary-tile">{summary.item}</div>
                                                    <div className="summary-tile">{summary.brand}</div>
                                                    <div className="summary-tile">{numberFormat(summary.quote)}</div>
                                                    <div className="summary-tile">{numberFormat(summary.dailyAmount)}</div>
                                                    <div className="summary-tile">{summary.duration}</div>
                                                    <div className="summary-tile">{numberFormat(summary.amount)}</div>
                                            </React.Fragment>                   
                                        ))
                                    ))
                                    }
                                </>
                            </div>

                            <div className="keychal-summary">
                                <h2>전체금액</h2>
                                <p style={{
                                    display: "flex",
                                    alignItems: "center",
                                    fontSize: 23,
                                    fontWeight: "bold"}}>{numberFormat(amount)}</p>
                            </div>
                            </>
                        )
                    )}
                </div>
        </div>
    )
}