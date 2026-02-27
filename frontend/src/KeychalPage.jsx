import { useEffect, useState } from 'react'

export default function KeychalPage(){
    const [influencers, setInfluencers] = useState([]);

    useEffect(() => {
        async function fetchInfls() {
            const res = await fetch("http://localhost:3000/keychal/influencers");
            const data = await res.json()

            setInfluencers(data)
        }
        fetchInfls();
    }, [])

    return (
        <div style={{ padding: 40, userSelect: "none"}}>

            <div>
                {influencers.map(infl => (
                    <div
                        key={infl._id}
                        style={{
                            border: "1px solid #ccc",
                            padding: 10,
                            cursor: "pointer"
                        }}
                    >
                        {infl.influencer}
                    </div>
                ))}
            </div>
        </div>
    )
}