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

    useEffect(() => {
        document.title = "Blog"
    }, [])

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
        setStartDate(start);
        setEndDate(end);
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
                <button className="blog-query-btn">조회</button>
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
                        className={`item ${selectedItem === item.item ? "active" : ""}`}
                        onClick={() => setSelectedItem(item.item)}
                    >
                        {item.item}
                    </button>
                ))}
                </div>
                <button className="scroll-btn" onClick={scrollRightClick}>›</button>
            </div>
        </div> 
        )
}