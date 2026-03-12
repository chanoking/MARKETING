import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";


export default function SignupPage(){
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [manageCode, setManageCode] = useState("");
    
    const navigate = useNavigate();
    
    useEffect(() => {
        document.title = "LifeNBio Sign Up";
    }, [])

    const handleSend = async () => {
        const res = await fetch("http://localhost:3000/auth/signup",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id,
                    password,
                    manageCode
                })
            }
        )

        // const data = await res.json();
        // console.log(data.message);

        if(res.ok){
            const data = await res.json();
            alert(data.message);
            navigate('/login');
        }
    }

    const inputStyle={
        height: 50,
        width: 300,
        fontSize: 17,
        paddingLeft: 5
    }
    return (
        <div
            style={{
                height: "100vh",
                width: "100vw",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                userSelect: "none",
            }}>
                
            <h1
                style={{
                    height: 50,
                    width: 200,
                    fontSize: 40,
                    textAlign: "center",
                    marginBottom: 120
                }}>LifeNBio</h1>

            <div
                style={{
                    display:"flex",
                    flexDirection: "column"
                }}>
                <input 
                    style={inputStyle}
                    placeholder="ID"
                    type = "text"
                    onChange={(e) => setId(e.target.value)}
                />
                <input
                    style={inputStyle}
                    placeholder="PASSWORD"
                    type = "password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    style={inputStyle}
                    placeholder="manageCode"
                    type = "password"
                    onChange={(e) => setManageCode(e.target.value)}
                />
            </div>

            <button
                style={{
                    marginTop: 100,
                    width: 311,
                    background: "#03A94D",
                    color: "white",
                    fontWeight: 1000
                }}
                onClick={() => handleSend()}
                >Send
            </button>


            

        </div>
    )
}