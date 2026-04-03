import {useState, useEffect} from "react";
import * as XLSX from "xlsx";
import "../css/freePage.css";

export default function FreePage(){
    const [year, setYear] = useState(null);
    const [month, setMonth] = useState(null);
    const [date, setDate] = useState(null);
    const [marketingCost, setMarketingCost] = useState([]);
    const [expenseReportForFree, setExpenseReportForFree] = useState([]);
    const [prefixOfFile, setPrefixOfFile] = useState("");
    const [keychalForBusiness, setKeychalForBusiness] = useState([]);
    const [keychalForOutsourcing, setKeychalForOutsourcing] = useState([]);

    // ==================Marketing Cost============================

    // Added to Marketing Cost as keychal
    useEffect(() => {
        const fetchKeywordChallenge = async () => {
            if(!year) return;

            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/expense-report/keychal/monthly-cost-by-item?year=${year}&month=${month}`, {
                headers:{
                    Authorization:  `Bearer ${token}`
                }
            })
            const data = await res.json();
            
            setMarketingCost((prev) => [...prev, ...data]);
        }
        
        fetchKeywordChallenge()
    }, [year])
    
    console.log(marketingCost)
    // Added to Marketing Cost as sponsor
    useEffect(() => {
        const fetchSponsor = async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/expense-report/sponsor/monthly-cost-by-item`, {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })
            const data = await res.json();
            // console.log(data)
            
            setMarketingCost((prev) => [...prev, ...data]);

        }
        
        fetchSponsor()
    }, [])
    
    
    // Added to marketing cost as freelancer
    useEffect(() => {
        const fetchDataForFreelancer = async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/expense-report/free/monthly-cost-by-item`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();

            setMarketingCost((prev) => [...prev, ...data]);
            
        }
        fetchDataForFreelancer();
    }, [])
    
    // ===============================Expense Report=======================================
    
    // settlement for manuscript of freelancers defined as outsourcing
    useEffect(() => {
        const fetchFreeData = async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/expense-report/free`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            const date = new Date(data[0].일자.split("T")[0]);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            
            setDate(date);
            setYear(year);
            setMonth(month);
            setPrefixOfFile(String(year).slice(2) + String(month).padStart(2, "0") + String(day).padStart(2, "0"))
            setExpenseReportForFree(data);
        }
        fetchFreeData();
    }, [])
    
    // settlement for marketing activities of influencers classified as outsourcing and business
    useEffect(() => {
        if(!year) return;
        
        const fetchExpenseReportForKeychal = async (category) => {
            const token = localStorage.getItem("token");
            const params = new URLSearchParams({month, year, category});
            const res = await fetch(`${import.meta.env.VITE_API_URL}/expense-report/keychal?${params}`,{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })
            const data = await res.json();
            
            category === "외주" ? setKeychalForOutsourcing(data) : setKeychalForBusiness(data);
        }
        
        fetchExpenseReportForKeychal("외주");
        fetchExpenseReportForKeychal("세금");
    }, [month, year, date])

    const handleDownload = (data, sheetName, fileName) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        XLSX.writeFile(workbook, fileName);
    }

    return (
        <div
            style={{padding: 10, userSelect: "none"}}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 20
                    }}>
                    
                    <div
                        style={{
                            width: "91%",
                            height: 41,
                            border: "1px solid #ccc",
                            background: "#217346",
                            borderRadius: 5,
                            lineHeight: "41px",
                            textAlign: "center",
                            fontWeight: "bold",
                            color: "white",
                            padding: "5px 10px"
                        }}>
                        다운로드
                    </div>

                    <button
                        className="free-button"
                        onClick={() => {
                            handleDownload(keychalForBusiness, "cost_raw", `${month}월 키워드챌린지 (기업) 비용내역.xlsx`)
                        }}
                        >
                        키워드챌린지 (기업) 비용 내역
                    </button>

                    <button
                        className="free-button"
                        onClick={() => {
                            handleDownload(keychalForOutsourcing, "cost_raw", `${month}월_외주용역 비용정산_마케팅1팀_키워드챌린지.xlsx`)
                        }}
                        >
                        외주용역_비용정산_키워드챌린지
                    </button>

                    <button
                        className="free-button"
                        onClick={() => {
                            handleDownload(expenseReportForFree, "cost_raw", `${month}월_외주용역 비용정산_마케팅_블로그.xlsx`)
                        }}>
                            외주용역 마케팅 블로그</button>    
            
                    <button
                        className="free-button"
                        onClick={() => {
                            handleDownload(marketingCost, "블로그, 협찬_Actual", `${prefixOfFile}_마케팅비용_정리_취합용_v3_진찬호_보고용.xlsx`)
                        }}
                        >마케팅1팀_비용정리 및 취합</button>

                </div>

        </div>
    )
}

