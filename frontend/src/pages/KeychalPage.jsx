import { useEffect, useState } from "react";
import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../css/KeychalPage.css";
import {useNavigate, useLocation} from "react-router-dom";

export default function KeychalPage() {

  const today = new Date().toISOString().split("T")[0];

  const [influencers, setInfluencers] = useState([]);
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [user, setUser] = useState(useLocation().state?.user);
  const [keywordsGroupedByRank, setKeywordsGroupedByRank] = useState([]);
  const [selectedKeywordsGroupedByRank, setSelectedKeywordsGroupedByRank] = useState({});
  const [isKeywordPopupOpen, setIsKeywordPopupOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [amountByMonth, setAmountByMonth] = useState([]);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  const [formattedMonth, setFormattedMonth] = useState(`${year}년 ${month}월`);
  const [beforeFormattedMonth, setBeforeFormattedMonth] = useState(`${month - 1 === 0 ? `${year - 1}년 12월` : `${year}년 ${month - 1}월`}`);
  const [afterFormattedMonth, setAfterFormattedMonth] = useState(`${month + 1 === 13 ? `${year + 1}년 1월` : `${year}년 ${month + 1}월`}`);

  useEffect(() => {
    if(!token){
      navigate("/login");
    }
  }, []);
  
  useEffect(() => {
    async function fetchInfls() {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/influencers`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setInfluencers(data);
    }
    fetchInfls();
  }, []);
  
  useEffect(() => {
    const fetchGroupedKeywordsByRank = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/all-keywords-grouped-by-rank`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setKeywordsGroupedByRank(data);
    }
    fetchGroupedKeywordsByRank();
  }, [])

  useEffect(() => {
    const fetchFullAmountByMonth = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/amount-by-month`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json();
      
      setAmountByMonth(data);
      getAmount(data)
      
    }
    
    fetchFullAmountByMonth();
  }, [])
  
  useEffect(() => {
    getAmount(amountByMonth)
  }, [formattedMonth])
  
  const getAmount = (data) => {
    const [year, month] = formattedMonth
      .replace("년 ", "-")
      .replace("월", "")
      .split("-");
  
    const document = data.find((doc) => {
      return (
        doc.date.slice(0, 4) === year &&
        doc.date.slice(5, 7) === month.padStart(2, "0")
      );
    });
  
    setSelectedAmount(Math.round(document?.amount).toLocaleString());
  }

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null)
    navigate("/login")
  }

  const handleClickDay = async (date) => {
    let copyDate = new Date(date);

    copyDate.setDate(copyDate.getDate() + 1);

    copyDate = copyDate.toISOString().split("T")[0];

    setSelectedDate(copyDate);
    setIsKeywordPopupOpen(true);

    setSelectedKeywordsGroupedByRank(keywordsGroupedByRank.find((doc) => doc.date === copyDate));
  };

  const clickArrow = (formattedMonth, offset, option) => {
    let year = +formattedMonth.slice(0, 4);
    const indexOfMonth = formattedMonth.indexOf("월");
    const month = +formattedMonth.slice(6, indexOfMonth);

    let shiftedMonth = month + offset;

    while(shiftedMonth > 12){
      shiftedMonth -= 12;
      year += 1;
    }

    while(shiftedMonth < 1){
      shiftedMonth += 12;
      year -= 1;
    }

    if(!option){
      setFormattedMonth(`${year}년 ${shiftedMonth}월`);
      clickArrow(`${year}년 ${shiftedMonth}월`, -1, -1);
      clickArrow(`${year}년 ${shiftedMonth}월`, 1, 1);
    }else if(offset === -1) {
      setBeforeFormattedMonth(`${year}년 ${shiftedMonth}월`);
    }else{
      setAfterFormattedMonth(`${year}년 ${shiftedMonth}월`);
    }
  }


  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  };

  const popupInnerStyle = {
    background: "white",
    padding: 20,
    width: "70%",
    maxHeight: "80vh",
    overflow: "auto",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    borderRadius: 5
  };

  return (
    <div style={{padding: 20, userSelect: "none"}}>
    
      <div className="keychal-header">
        <button className="logout">로그아웃</button>
        <div className="user">사용자: {user}</div>
        <button className="summary" onClick={() => navigate("/keychalSummary", {state:{user, amountByMonth, influencers}})}>Summary</button>
      </div>

      <div className="keychal-body">
        <div className="influencers">
          {influencers.map((i, idx) => (
            <div 
              key={idx} 
              className="influencer"
              onClick={() => navigate("/influencer", {
                state: {influencer: i}
              })}
              >{i.influencer}</div>
          ))}
        </div>

        <div className="keychal-calendar">
          <Calendar
            value={date}
            onChange={(d) => setDate(d)}
            locale="en-US"
            onClickDay={handleClickDay}
            className="my-calendar"
            tileContent={({date, view}) => {
              if(view === "month"){
                const copyDate = new Date(date);
                copyDate.setDate(copyDate.getDate() + 1)
                const d = copyDate.toISOString().split("T")[0];
                const note = keywordsGroupedByRank.find((doc) => doc.date === d)?.duration;
                return note ? (
                  <div className="tile-note">valid: {note}</div>
                ) : null
              }
            }}
          /> 
        </div>

        <div className="wheel-picker" style={{display: "flex", flexDirection: "column", gap: 20, }}>
            <div
              style={{cursor: "pointer"}}
              onClick={() => clickArrow(formattedMonth, -1, 0)}>▲</div>
        
            <div style={{fontSize: 20, opacity: 0.45}}>{beforeFormattedMonth}</div>
            <div style={{fontSize: 30, fontWeight: "bold"}}>{formattedMonth}</div>
            <div style={{fontSize: 20, opacity: 0.45}}>{afterFormattedMonth}</div>
        
            <div
              style={{cursor: "pointer"}}
              onClick={() => clickArrow(formattedMonth, 1, 0)}>▼</div>
        </div>

        <div className="amount-summary">
            <h2>금액</h2>
            <p style={{fontSize: 25, fontWeight: "bold"}}>{selectedAmount}</p>
        </div>

      </div>

      {isKeywordPopupOpen && (
        <div className="popup">
          <h1 style={{ fontSize: 15 }}>{selectedDate}</h1>
          
          <div
            style={{
              display:"flex",
              gap: 30
            }}>

              <div>
                <h2>Positive</h2>
                <div>
                  {selectedKeywordsGroupedByRank?.positive.map((keyword, idx) => (
                    <div
                      key={idx}
                      style={{
                      fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                      border: "1px solid #ccc"
                      }}>{keyword}</div>
                    ))}
                </div>
              </div>

              <div>
                <h2>Negative</h2>
                <div>
                  {selectedKeywordsGroupedByRank?.negative.map((keyword, idx) => (
                    <div
                      key={idx} 
                      style={{
                      fontFamily: '"Fira code", "JetBrains Mono", monospace',
                      border:"1px solid #ccc"
                      }}>{keyword}</div>
                  ))}
                </div>
              </div>
            
            </div>

            <button className="button" onClick={() => setIsKeywordPopupOpen(false)}>Close</button>

          </div>
        )}

    </div>
  )
}