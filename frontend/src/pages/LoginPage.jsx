import { useState, useEffect } from "react";
import "../css/LoginPage.css";
import { useNavigate } from "react-router-dom";
import InflPage from './InflPage.jsx';

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [passkeyPopup, setPasskeyPopup] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [currentInfl, setCurrentInfl] = useState("");

  useEffect(() => {
    document.title = "LifeNBio Log in"
  }, [])

  const navigate = useNavigate();

  const handlePasskey = async () => {
    try {
      const res = await fetch("http://localhost:3000/auth/passkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey })
      });
      
      const data = await res.json();

      // res.ok 체크
      if (!res.ok) {
        alert(data.message);
        throw new Error("Server returned an error");
      }

      navigate("/influencer", {state: {influencer: data}});
      setPasskeyPopup(false);

    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  const handleLogin = async () => {
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8}$/;
    const isValid = regex.test(password);

    if(!isValid) {
      alert("비밀번호는 정확히 문자, 숫자를 포함하여 8자여야 합니다!");
      return;
    }

    const res = await fetch(
      "http://localhost:3000/auth/login",
      { 
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id,
          password
        })
      }
    )

    if(res.ok){
      const data = await res.json();
      localStorage.setItem("token", data.token);
      navigate('/select', {state: {user: data.id }});
    }else{
      alert(data.message);
    }
  }

  const handleSignup = async () => {
    navigate("/signup");
  }


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
          value={id}
          onChange={(e) => setId(e.target.value)}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        <span
          onClick={() => navigate("/signup")}
          style={{
            color: "#32CD32",
            fontWeight: 500,
            cursor:"pointer"
          }}
        >
          Sign up
        </span>
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
                    onClick={handlePasskey}
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