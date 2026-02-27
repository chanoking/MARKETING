import { useNavigate } from "react-router-dom";

export default function ItemGridPage() {
  const navigate = useNavigate();

  return (
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        padding: "40px",
        maxWidth: "800px",
        margin: "0 auto",
        userSelect: "none",
      }}>

        <div
          style={{
            border: "1px solid #ccc",
            cursor: "pointer",
            padding: "40px",
            backgroundColor: "rgba(0, 102, 204, 0.7)",
            color: "white",
            borderRadius: "5px"
          }}
          onClick={() => navigate('/blog')}
        >
          블로그
        </div>

        <div
          style={{
            border: "1px solid #ccc",
            cursor: "pointer",
            padding: "40px",
            backgroundColor: "rgba(204, 0, 0, 0.7)",
            color: "white",
            borderRadius: "5px"
          }}
          onClick={() => console.log("키챌")}
        >
          키챌
        </div>

      </div>

  )
}