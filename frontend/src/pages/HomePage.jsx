import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react"
import "../css/homepage.css"

export default function HomePage() {
  const [user, setUser] = useState(useLocation().state?.user);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if(!token){
      navigate("/login")
    }
  }, [])

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  }

  return (
    <>
    <div style={{
      userSelect: "none",
      display: "flex",
      gap: 50
    }}>
      <button
        style={{
          background: "#e74c3c",
          margin: 10,
          color: "white",
          fontWeight: 600
        }}
        onClick={logout}
        >로그아웃
      </button>
      
      <div
        style={{
          padding: 20,
          fontWeight: 700,
          fontSize: 25
        }}>사용자: {user}
      </div>
    </div>


          <div style={{
            display: "flex",
            justifyContent: "center", // 가로 중앙
            alignItems: "center",     // 세로 중앙
            height: "100vh",
            width: "100vw",
            userSelect: "none"
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              maxWidth: "800px"
            }}>

              <div
                className="home-tile blog"
                onClick={() => navigate('/blog', {
                  state:{user}
                })}
              >
                블로그
              </div>

              <div
                className="home-tile keychal"
                onClick={() => navigate('/keychal', {
                  state:{user}
                })}
              >
                키챌
              </div>

              <div
                className="home-tile free"
                onClick={() => navigate("/free")}>
                FREE
              </div>

              <div
                className="home-tile sponsor"
                onClick={() => navigate("/sponsor")}>
                  SPONSOR
              </div>

            </div>
          </div>
        </>
  )
}