import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function InflSummaryPage(){
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState("선택");

    return (
        <div
            style={{
                padding: 10,
                userSelect: "none"
            }}
            >
            <div
                style={{
                    display: "flex",
                    gap: 10
                }}
            >
                <div
                    style={{
                        width: 150,
                        position: "relative"
                    }}
                >
                    <div
                        onClick={() => setIsOpen(prev => !prev)}
                        style={{
                            border: "1px solid #ccc",
                            padding: 10,
                            cursor: "pointer",
                            background: "#fff",
                            fontWeight: "bold",
                            borderRadius: 5
                        }}
                    >
                        {selected}
                    </div>

                </div>
            </div>
        </div>
    )

}