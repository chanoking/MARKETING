import React, {useEffect, useState, useRef} from "react";
import "../../css/blogPage.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BlogPage() {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState("");
    const [keywords, setKeywords] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isDown, setIsDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [dateColumns, setDateColumns] = useState([]);
    const [metrics, setMetrics] = useState(new Map());
    
    useEffect(() => {
        document.title = "Blog"
    }, [])
    
    useEffect(() => {
        const fetchItems = async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/blog/items`, {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
        
            setItems(data);
        }
        fetchItems();
    }, [])

    useEffect(() => {
        const fetchKeywords = async () => {
            if(!selectedItem) return;
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/blog/items/${selectedItem}/keywords`,{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            setKeywords(data);
        }
        fetchKeywords();

    }, [selectedItem])

    useEffect(() => {
        const fetchMetrics = async () => {
            if(!selectedItem || !startDate || !endDate) return;

            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                startDate: startDate?.toISOString(), endDate: endDate?.toISOString()
            })
            try{
                const res = await fetch(`${import.meta.env.VITE_API_URL}/blog/items/${selectedItem}/keywords/metrics?${params}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                const data = await res.json();
                const metricsMap = new Map(
                    data.map(item => [item.keyword, item])
                )

                setMetrics(metricsMap);
            }catch(err){
                console.error("fetch error:", err);
            }
        }

        fetchMetrics();
    }, [selectedItem, startDate, endDate])

    const scrollRef = useRef();

    const scrollLeftClick = () => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: -200, behavior: "smooth"});
    };

    const scrollRightClick = () => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: 200, behavior: "smooth"});
    }

    const onChange = (dates) => {
        const [start, end] = dates;
        
        start?.setHours(9);

        if(end) end?.setHours(9);
        
        setStartDate(start);
        setEndDate(end);

        const days = (end - start) / (24 * 60 * 60 * 1000);
        const columns = [];
        
        for(let i = 0; i <= days; i++){
            const current = new Date(start);

            current.setDate(start?.getDate() + i);
            columns.push(current);
        }

        setDateColumns(columns);

    };

    const handleMouseDown = (e) => {
        setIsDown(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    }

    const handleMouseUp = () => {
        setIsDown(false);
    }

    const handleMouseLeave = () => {
        setIsDown(false);
    }

    const handleMouseMove = (e) => {
        if(!isDown) return;

        e.preventDefault();

        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = x - startX;

        scrollRef.current.scrollLeft = scrollLeft - walk;
    }

    const dateFormat = (date) => {
        if (!(date instanceof Date) || isNaN(date.getTime())) return;

        const month = date.getMonth() + 1;
        const day = date.getDate();

        return `${month}/${day}`;
    };


    return (
        <div className="blog-body">
            <div className="wrapper">
                <div className = "blog-datepicker">
                    <DatePicker
                        selectsRange
                        startDate={startDate}
                        endDate={endDate}
                        onChange={onChange}
                        isClearable={true}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="날짜 범위를 선택하세요"
                    />
                </div>
                <button 
                    className="scroll-btn" 
                    onClick={scrollLeftClick} 
                    >‹</button>

                <div 
                    className="scroll-container"
                    ref={scrollRef}
                    style={{
                        cursor: isDown ? "grabbing" : "grab"
                     }}
                     onMouseDown={handleMouseDown}
                     onMouseUp={handleMouseUp}
                     onMouseLeave={handleMouseLeave}
                     onMouseMove={handleMouseMove}
                >
                {items.map((item) => (
                    <button
                        key={item._id}
                        className={`item ${selectedItem === item._id ? "active" : ""}`}
                        onClick={() => setSelectedItem(item._id)}
                    >
                        {item.item}
                    </button>
                ))}
                </div>
                <button className="scroll-btn" onClick={scrollRightClick}>›</button>
            </div>

            <div
                className="blog-table"
                style={{
                    gridTemplateColumns: `180px 100px 100px repeat(${dateColumns.length > 0 ? dateColumns.length : 1}, 80px)`
                }}
            >
                {/* header */}
                <div className="cell blog-header">키워드: {keywords.length}</div>
                <div className="cell blog-header">검색환경</div>
                <div className="cell blog-header">검색량</div>

                {endDate && startDate && (
                    <>
                    {dateColumns.map((dateCol, i) => (
                        <div className="cell blog-header" key={i}>{dateFormat(dateCol)}</div>
                    ))}
    
                    {/* body */}
                    {keywords.map((keyword, i) => {
                        return (
                            <React.Fragment key={i}>
                                <div className="cell" style={{fontSize: 14}}>{keyword.keyword}</div>
                                <div className="cell" style={{fontSize: 14}}>{metrics.get(keyword.keyword)?.values[dateColumns[dateColumns.length - 1]?.toISOString().split("T")[0]]?.env}</div>
                                <div className="cell" style={{fontSize: 14}}>{metrics.get(keyword.keyword)?.values[dateColumns[dateColumns.length - 1]?.toISOString().split("T")[0]]?.volume.toLocaleString()}</div>
                                {dateColumns.map((dateCol, dateIdx) => (
                                    <div className="cell" key={dateIdx} style={{fontSize: 14}}>{metrics.get(keyword.keyword)?.values[dateColumns[dateIdx]?.toISOString().split("T")[0]]?.cnt}</div>
                                ))}
                            </React.Fragment>
                        )
                    })}
                    </>
                )}
            </div>

        </div> 
        )
}