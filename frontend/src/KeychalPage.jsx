import { useEffect, useState } from 'react'
import React from "react"

export default function KeychalPage(){
    const [influencers, setInfluencers] = useState([]);
    const [selectedInflKeywords, setSelectedInflKeywords] = useState([])
    const [popupOpen, setPopupOpen] = useState(false);
    const [selectedInfl, setSelectedInfl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        async function fetchInfls() {
            const res = await fetch("http://localhost:3000/keychal/influencers");
            const data = await res.json()

            setInfluencers(data)
        }
        fetchInfls();
    }, [])

    const fetchTheInflKeywords = async (infl) => {
        const res = await fetch(`http://localhost:3000/keychal/keywords?influencer_id=${infl._id}`);
        const data = await res.json();
        
        setSelectedInflKeywords(data)
    }

    const handleClickInfl = async (infl) => {
        if(infl._id === selectedInfl?._id){
            setSelectedInflKeywords([])
            setSelectedInfl(null)
        } else{
            setSelectedInfl(infl)
        }
        setSelectedInfl(infl);
        setPopupOpen(true)
        await fetchTheInflKeywords(infl);
    }

    return (
        <div style={{ padding: 40, userSelect: "none"}}>

            <div>
                {influencers.map(infl => (
                    <div
                        key={infl._id}
                        onClick={() => handleClickInfl(infl)}
                        style={{
                            border: "2px solid #ccc",
                            padding: 10,
                            cursor: "pointer",
                            marginBottom: "10px",
                            background:
                                selectedInfl?._id === infl._id
                                    ? "#e6f3ff"
                                    : "white",
                            fontWeight: "bold"
                                
                        }}
                    >
                        {infl.influencer}
                    </div>
                ))}
            </div>

            {popupOpen && selectedInfl && (

                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>

                    <div style={{
                        background: "white",
                        padding: 20,
                        width: "70%",
                        maxHeight: "80vh",
                        overflow: "auto",
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "20px",
                    }}>
                        
                        <div style={{fontWeight:"600"}}>KEYWORD</div>
                        <div style={{fontWeight:"600"}}>QUOTE</div>
                        <div style={{fontWeight:"600"}}>ITEM</div>
                        <div style={{fontWeight:"600"}}>BRAND</div>

                        {selectedInflKeywords.map((k) => (
                            <React.Fragment key={k._id}>
                                <div style={{
                                    fontWeight:"500",
                                    fontSize:"14px"}}>{k.keyword}</div>
                                <div style={{
                                    fontWeight:"500",
                                    fontSize:"14px"}}>{k.quote.toLocaleString()}</div>
                                <div style={{
                                    fontWeight:"500",
                                    fontSize:"14px"}}>{k.item}</div>
                                <div style={{
                                    fontWeight:"500",
                                    fontSize:"14px"}}>{k.brand}</div>
                            </React.Fragment>
                        ))}

                    </div>
                    
                </div>
            )}
        </div>
    )
}