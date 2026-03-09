import {useState, useEffect} from 'react'

export default function LoginPage(){
    const [idState, setIdState] = useState(null);
    const [pdState, setPdState] = useState(null);

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            userSelect: "none",
            marginLeft: 600
        }}>
          <h1 style={{
            fontSize: 30,
            marginLeft: 200,
            marginBottom: 50
            }}>
                LifeNBio
            </h1>

            <div style={{
                marginLeft: 200,
                width: 310,
            }}>
                <input 
                    type = "text"
                    placeholder = "ID"
                    value= {idState}
                    style={{        
                        border: "1px solid #ccc",
                        width: 310,
                        height: 50,
                        borderRadius: 5,
                        fontSize: 18,
                    }}
                    onChange={(e) => {e.target.value} }
                />
                <input
                    type= "text"
                    placeholder = "password"
                    value={pdState}
                    style={{
                        border: "1px solid #ccc",
                        height: 50,
                        width: 310,
                        borderRadius: 5,
                        fontSize: 19
                    }}
                    onChange={(e) => {e.target.value}}
                />
            </div>

            <div>
                <button
                    style={{
                        marginTop: 20,
                        width: 316,
                        marginLeft: 205,
                        background: "#888888",
                        color: "white"
                    }}>
                        Sign in
                </button>
            </div>

            <div>
                <button
                    style={{
                        marginTop: 30,
                        width: 316,
                        marginLeft: 205,
                        background: "white",
                        border: "1px solid #90EE90",
                        color: "#32CD32",
                        fontWeight: 600
                    }}
                >
                    Sign in with a passkey
                </button>
            </div>

            <div
                style={{
                    marginTop: 100,
                }}>
                <a style={{
                    color: "#32CD32",
                    fontWeight: 500,
                    marginLeft: 200
                }} href="/signup">Sign up</a>
            </div>

        </div>

    )
}