import React, {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";

export default function BlogKeywordsPage() {
    const [keywords, setKeywords] = useState([]);

    const {itemId} = useParams();

    useEffect(() => {
        const fetchKeywords = async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/blog/items/${itemId}/keywords`,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            
            setKeywords(data);
        }
        fetchKeywords();
    }, [])

    return (
        <div className="blog_body">
            <div className="items">
                {keywords.map((keyword, i) => (
                    <React.Fragment key={i}>
                        <div className="item">{keyword.keyword}</div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}