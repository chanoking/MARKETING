import {useState, useEffect} from "react";
import * as XLSX from "xlsx";
import "../css/freePage.css";

export default function FreePage(){
    const [freeData, setFreeData] = useState([]);
    const [pricing, setPricing] = useState([]);
    const [prefixOfFile, setPrefixOfFile] = useState("");
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");
    const [marketingCost, setMarketingCost] = useState([]);
    const [list, setList] = useState([]);
    const [expenseReportForOutsourcing, setExpenseReportForOutsourcing] = useState([]);

    console.log(marketingCost);

    useEffect(() => {
        const fetchKeywordChallenge = async () => {
            if(month === "" || year === "") return;

            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/amount-by-month-item?year=${year}&month=${month}`, {
                headers:{
                    Authorization:  `Bearer ${token}`
                }
            })
            const data = await res.json();

            if(list.includes("keychal")) return;

            setList([...list, "keychal"]);

            data.forEach((doc) => {
                setMarketingCost((prev) => [...prev, {
                    구분: "Actual",
                    브랜드: modified(doc.brand),
                    제품: doc.item,
                    세목: "01.바이럴_블로그",
                    세세목: "키챌_월보장",
                    적요: "",
                    월: `${month}월`,
                    금액: doc.amount,
                    비고: "",
                    발행수: 1,
                    단가: doc.amount,
                    업무분류: "1.바이럴마케팅",
                    비고: "" 
                }])
            })
        }
        
        fetchKeywordChallenge()
    }, [year, month])
    
    useEffect(() => {
        const fetchSponsor = async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/free/monthly-cost-sponsor`, {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })
            const data = await res.json();
            
            if(list.includes("sponsor")) return;

            setList([...list, "sponsor"]);

            data.forEach((doc) => {
                setMarketingCost(prev => [...prev, {
                    구분: "Actual",
                    브랜드: modified(doc.brand),
                    제품: doc.item,
                    세목: "05.바이럴_협찬",
                    세세목: "블로그_인플협찬",
                    적요: "",
                    월: `${month}월`,
                    금액: doc.amount,
                    비고: "",
                    발행수: doc.cnt,
                    단가: doc.amount / doc.cnt,
                    업무분류: "1.바이럴마케팅",
                    "비고": ""
                }])
            })
        }
        
        fetchSponsor()
    }, [])
    
    useEffect(() => {
        const fetchDataForFreelancer = async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/free/free-monthly-cost-by-item`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
        
            const date = new Date(data[0].전달일.split("T")[0]);
            const year = date.getFullYear();
            const month = date.getMonth();
            const last = date.getDate();

            setYear(year);
            setMonth(month)
            
            const prefix = String(year).slice(2,4)+String(month).padStart(2, "0")+String(last).padStart(2, "0");

            setPrefixOfFile(prefix);

            data.forEach((doc) => {
                setExpenseReportForOutsourcing((prev) => [...prev, {
                    "회사명": "라이프앤바이오",
                    "1": "3.판관비",
                    "2": "2.광고선전비",
                    "3": "1.바이럴마케팅",
                    "코드": "",
                    "세목": `바이럴_${doc.발행종류}_${doc.관리방식}`,
                    "년-월": `${String(year).slice(2)}년 ${month}월`,
                    "일자": date,
                    "적요": `${doc.발행종류} ${doc.관리방식}`,
                    "코드 ": "",
                    "거래처(세금계산서 발행처명)": doc.작성자,
                    "사업자등록번호": "",
                    "세금계산서 :VAT 미포함 / 인건비:세전": doc.amount,
                    "대변": "",
                    "금액": "",
                    "브랜드": doc.브랜드,
                    "품목명": doc.item,
                    "관리부서명": "마케팅팀",
                    "세금계산서 :VAT 포함 / 인건비:세후": doc.amount * 0.967,
                    "키워드": doc.키워드
                }])
            })

            if(marketingCost.includes("free")) return

            setList([...list, "free"]);

            data.forEach((doc) => {
                setMarketingCost((prev) => [...prev, {
                    구분: "Actual",
                    브랜드: modified(doc.브랜드),
                    제품: doc.item,
                    세목: "01.바이럴_블로그",
                    세세목: "프리랜서_원고",
                    적요: "",
                    월: `${month}월`,
                    금액: doc.amount,
                    비고: "",
                    발행수: doc.cnt,
                    단가: "",
                    업무분류: "1.바이럴마케팅",
                    비고: ""
                }])
            })
        }
        fetchDataForFreelancer();
    }, [])
    
    const modified = (value) => {
        switch (value){
            case "파이토뉴트리": return "01. " + value;
            case "혜인서": return "02. " + value;
            case "흑보목": return "03. " + value;
            default: return "05. " + value
        }
    }

    const handleDownloadForExpenseReport = () => {
        if(!(result.length)){
            alert("내용을 가지고 있지 않습니다.");
            return;
        }
        
        const worksheet = XLSX.utils.json_to_sheet(result);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "cost_raw");
        
        XLSX.writeFile(workbook, `${month}월_외주용역 비용정산_마케팅,블로그,모니터링,카페`);
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
                            position: "relative",
                        }}>
                            <div
                                style={{
                                    position: "absolute",
                                    border: "1px solid #fff",
                                    zIndex: 0
                                }}>
                                    <div></div>

                            </div>
                    </div>
                    <button
                        className="free-button"
                        onClick={handleDownloadForExpenseReport}>다운로드 for 지결</button>    
            
                    <button
                        className="free-button"
                        >다운로드 for 마케팅비용</button>
                </div>

        </div>
    )
}

