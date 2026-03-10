import { useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./custom-datepicker.css";

export default function InflPage(){
    const [keywords, setKeywords] = useState([]);
    const [date, setDate] = useState(new Date());

    const location = useLocation();
    const influencer = location.state?.influencer;

    useEffect(() => {
        const fetchKeywords = async () => {
            const res = await fetch(`http://localhost:3000/keychal/keywords?influencer_id=${influencer._id}`);
            const data = await res.json();
            setKeywords(data);
        }
        fetchKeywords()
    }, [])

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

    return (
        <div style={{
            userSelect: "none",
            marginLeft: 10,
            display: "flex",
        }}>
            <div>
            {keywords.map(k => (
                <div
                style={{
                    border:"2px solid #ccc",
                    padding: 10,
                    marginBottom: 5,
                    marginRight: 10,
                    background: paint(k.item),
                    color: paintText(paint(k.item)),
                    fontWeight: 600
                }}
                >{k.keyword}</div>
            ))}
            </div>
            
            <DatePicker
                className="my-date-picker"
                selected={date}
                onChange={(d) => setDate(d)}
                inline />
        </div>
    )
}