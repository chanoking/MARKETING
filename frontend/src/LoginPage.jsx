import { useState } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom"
import InflPage from './InflPage.jsx'

export default function LoginPage() {
  const [idState, setIdState] = useState("");
  const [pdState, setPdState] = useState("");
  const [passkeyPopup, setPasskeyPopup] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [currentInfl, setCurrentInfl] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {
    console.log(idState, pdState);
  };

  const handlePasskey = async () => {
    try {
      const res = await fetch("http://localhost:3000/login/passkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey })
      });

      // res.ok 체크
      if (!res.ok) {
        const text = await res.text(); // JSON이 아닐 수도 있으니 text로 받아보기
        console.error("Server error:", text);
        throw new Error("Server returned an error");
      }

      const data = await res.json(); // JSON 파싱
      navigate("/influencer", {state: {influencer: data[0]}});
      setPasskeyPopup(false);

    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };


  return (
    <>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        userSelect: "none",
      }}
    >
      <h1
        style={{
          fontSize: 30,
          marginBottom: 50,
        }}
      >
        LifeNBio
      </h1>

      <div
        style={{
          width: 310,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <input
          type="text"
          placeholder="ID"
          value={idState}
          onChange={(e) => setIdState(e.target.value)}
          style={{
            border: "1px solid #ccc",
            height: 50,
            borderRadius: 5,
            fontSize: 18,
            paddingLeft: 10,
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={pdState}
          onChange={(e) => setPdState(e.target.value)}
          style={{
            border: "1px solid #ccc",
            height: 50,
            borderRadius: 5,
            fontSize: 18,
            paddingLeft: 10,
          }}
        />
      </div>

      <button
        onClick={handleLogin}
        style={{
          marginTop: 20,
          width: 310,
          height: 45,
          background: "#888888",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        Sign in
      </button>

      <button
        style={{
          marginTop: 20,
          width: 310,
          height: 45,
          background: "white",
          border: "1px solid #90EE90",
          color: "#32CD32",
          fontWeight: 600,
          borderRadius: 5,
          cursor: "pointer",
        }}
        onClick={() => {
            setPasskeyPopup(true);
        }}
      >
        Sign in with a passkey
      </button>

      <div
        style={{
          marginTop: 60,
        }}
      >
        <a
          href="/signup"
          style={{
            color: "#32CD32",
            fontWeight: 500,
          }}
        >
          Sign up
        </a>
      </div>
    </div>

    {passkeyPopup && (
        <div className="modalOverlay">
            <div className="modalBox">
                <>
                <h2>Passkey</h2>
                <input
                    type="password"
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    style={{
                        height:30,
                        fontSize:18,
                        borderRadius: 5,
                        width: 350
                    }}
                />

                <div style={{
                    marginTop: 10,
                    display: "flex",
                    gap:10
                }}>
                <button
                    style={{
                        background:"rgba(50, 205, 50, 0.5)",
                        color: "white"
                    }}
                    onClick={() => handlePasskey()}
                    >Enter</button>
                <button
                    style={{
                        background:"rgba(50, 205, 50, 0.5)",
                        color:"white"
                    }}
                    onClick={() => setPasskeyPopup(false)}>Cancel</button>
                </div>

                </>
            </div>
        </div>
    )}
    </>
  );
}