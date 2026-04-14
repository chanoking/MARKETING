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

    const scrollRef = useRef();

    const scrollLeft = () => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: -200, behavior: "smooth"});
    };

    const scrollRight = () => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: 200, behavior: "smooth"});
    }

    const onChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

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

    return (
        <div className="blog_body">
            <div className="wrapper">
                <button className="scroll-btn" onClick={scrollLeft}>‹</button>
                <div className="scroll-container" ref={scrollRef}>
                {items.map((item) => (
                    <button
                        key={item._id}
                        className={`item ${selectedItem === item.item ? "active" : ""}`}
                        onClick={() => setSelectedItem(item.item)}
                    >
                        {item.item}
                    </button>
                ))}
                </div>
                <button className="scroll-btn" onClick={scrollRight}>›</button>
            </div>
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
        </div> 
        )
}