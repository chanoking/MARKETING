import { useEffect, useState } from "react";
import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../css/KeychalPage.css";
import {useNavigate, useLocation} from "react-router-dom";

export default function KeychalPage() {

  const today = new Date().toISOString().split("T")[0];

  const [influencers, setInfluencers] = useState([]);
  const [selectedInflKeywords, setSelectedInflKeywords] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedInfl, setSelectedInfl] = useState(null);
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [keywordStates, setKeywordStates] = useState([]);
  const [popupOpenForState, setPopupOpenForState] = useState(false);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [date, setDate] = useState(new Date());
  const [visibleSum, setVisibleSum] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showPopup, setShowPopup] = useState(null);
  const [states, setStates] = useState([[], []]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStates, setEditedStates] = useState([]);
  const [user, setUser] = useState(useLocation().state?.user);
  const [clickedSummary, setClickedSummary] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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
    const fetchSums = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/states/cal`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setVisibleSum(data);
    };
    fetchSums();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null)
    navigate("/login")
  }

  const fetchSeparateKeywords = async (date) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/keychal/statesall?date=${date}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();

    const result = [[], []];

    data.forEach((doc) => {
      if (date === doc["date"]) {
        if (doc["rank"] > 0) {
          result[0].push([doc["keyword"], doc["influencer"]]);
        } else {
          result[1].push([doc["keyword"], doc["influencer"]]);
        }
      }
    });

    setStates(result);
  };

  const handleClickDay = async (date) => {
    let copyDate = new Date(date);

    copyDate.setDate(copyDate.getDate() + 1);

    copyDate = copyDate.toISOString().split("T")[0];

    setSelectedDate(copyDate);
    setShowPopup(true);

    await fetchSeparateKeywords(copyDate);
  };

  const handleStartChange = (e) => {
    const value = e.target.value;
    setStartDate(value);

    if (endDate && value > endDate) {
      setEndDate(value);
    }
  };

  const handleEndChange = (e) => {
    const value = e.target.value;
    setEndDate(value);

    if (startDate && startDate > endDate) {
      setStartDate(value);
    }
  };

  const fetchInflKeywords = async (infl) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/keychal/keywords?influencer_id=${infl._id}`, {
        headers:{
          Authorization: `Bearer ${token}`
        }
      }
    );
    const data = await res.json();
    setSelectedInflKeywords(data);
  };

  const fetchStateForKeyword = async (keyword) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/keychal/keyword/states?keyword=${keyword}`, {
        headers:{
          Authorization: `Bearer ${token}`
        }
      }
    );
    const data = await res.json();

    setKeywordStates(data);
  };

  const handleClickInfl = async (infl) => {
    setSelectedInfl(infl);
    setPopupOpen(true);
    await fetchInflKeywords(infl);
  };

  const handleClickKeyword = async (keyword) => {
    setSelectedKeyword(keyword);
    setPopupOpenForState(true);
    await fetchStateForKeyword(keyword);
  };

  const handleSave = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/keychal/keyword_state_update`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`

        },
        body: JSON.stringify({
          editedStates
        })
      }
    );

    const data = await res.json();

    alert(data.message);
    setSelectedInflKeywords(editedStates);
    setIsEditing(false);
  };

  const handleSummary = () => {
    navigate("/keychalSummary", {
      state: {user}
    })
  }

  const buttonStyle = {
    height: "22px",
    fontSize: "12px",
    padding: "0px",
    width: "60px",
    border: "1px solid #000",
    margin: 2
  };

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

  const popupStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "ivory",
    padding: "20px",
    border: "1px solid #ccc",
    zIndex: 1000,
    width: 600,
    borderRadius: 5,
    fontStyle: "italic"
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 200,
        userSelect: "none"
      }}>
      
      <div
        style={{
          display: "flex",
          gap: 20
        }}>

        <button
          style={{
            padding: 10,
            width: 100,
            height: 40,
            background: "#e74c3c",
            color: "white",
            fontWeight: 1000,
            marginLeft: 40 
          }}
          onClick={logout}
          >로그아웃</button>

        <div
          style={{
            padding: 8,
            fontWeight: 1000,
            fontSize: 16
          }}>사용자: {user}</div>

        <button
          style={{
            border: "1px solid #ccc",
            background: "#E0F7FA",
            fontWeight: "bold"
          }}
          onClick={handleSummary}>Summary</button>

        </div>

    <div style={{ padding: 40, userSelect: "none" }}>

      <div style={{ display: "flex" }}>

        <div style={{ marginRight: 20 }}>
          {influencers.map((infl) => (
            <div
              key={infl._id}
              onClick={() => handleClickInfl(infl)}
              style={{
                border: "2px solid #ccc",
                padding: 10,
                cursor: "pointer",
                marginBottom: "10px",
                background: selectedInfl?._id === infl._id ? "#e6f3ff" : "white",
                fontWeight: "bold"
              }}
            >
              {infl.influencer}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10
          }}>
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
                const note = visibleSum[d];
                return note ? (
                  <div className="tile-note">{note}</div>
                ) : null
              }
            }}
          />

          {showPopup && (
            <div style={popupStyle}>

              <h1 style={{ fontSize: 15 }}>{selectedDate}</h1>

              <div style={{ display: "flex", gap: 130 }}>
                <h2>Positive</h2>
                <h2>Negative</h2>
              </div>

              <div style={{ display: "flex", gap: 40 }}>

                <div>
                  {states[0]?.map((key_infl) => (
                    <p key={key_infl[0]}>{key_infl[0]}_{key_infl[1]}</p>
                  ))}
                </div>

                <div>
                  {states[1]?.map((key_infl) => (
                    <p key={key_infl[0]}>{key_infl[0]}_{key_infl[1]}</p>
                  ))}
                </div>

              </div>

              <button onClick={() => setShowPopup(false)} style={buttonStyle}>닫기</button>

            </div>
          )}
        </div>

      </div>

      {popupOpen && selectedInfl && (
        <div style={overlayStyle}>
          <div style={popupInnerStyle}>

            <div style={{fontWeight: 600}}>KEYWORD</div>
            <div style={{fontWeight: 600}}>QUOTE</div>
            <div style={{fontWeight: 600}}>ITEM</div>
            <div style={{fontWeight: 600}}>BRAND</div>

            {!isEditing ? (

              <>
                {selectedInflKeywords.map((k) => (

                  <React.Fragment key={k._id}>

                    <div
                      style={{ 
                        cursor: "pointer",
                        fontSize: 14 }}
                      onClick={() => handleClickKeyword(k.keyword)}
                    >
                      {k.keyword}
                    </div>

                    <div
                      style={{
                        fontSize: 14
                      }}>{k.quote.toLocaleString()}</div>

                    <div
                      style={{
                        fontSize: 14
                      }}>{k.item}</div>

                    <div
                      style={{
                        fontSize: 14
                      }}>{k.brand}</div>

                  </React.Fragment>

                ))}

                <div>

                  <button
                    style={buttonStyle}
                    onClick={() => {
                      setPopupOpen(false);
                      setSelectedInfl(null);
                    }}
                  >
                    cancel
                  </button>

                  <button
                    style={buttonStyle}
                    onClick={() => {
                      setEditedStates(selectedInflKeywords.map((k) => ({ ...k })));
                      setIsEditing(true);
                    }}
                  >
                    FIX
                  </button>

                </div>

              </>

            ) : (

              <>
                {editedStates.map((k, idx) => (

                  <React.Fragment key={k._id}>

                    <input
                      value={k.keyword}
                      onChange={(e) => {
                        const copy = [...editedStates];
                        copy[idx].keyword = e.target.value;
                        setEditedStates(copy);
                      }}
                    />

                    <input
                      value={k.quote}
                      onChange={(e) => {
                        const copy = [...editedStates];
                        copy[idx].quote = e.target.value;
                        setEditedStates(copy);
                      }}
                    />

                    <input
                      value={k.item}
                      onChange={(e) => {
                        const copy = [...editedStates];
                        copy[idx].item = e.target.value;
                        setEditedStates(copy);
                      }}
                    />

                    <input
                      value={k.brand}
                      onChange={(e) => {
                        const copy = [...editedStates];
                        copy[idx].brand = e.target.value;
                        setEditedStates(copy);
                      }}
                    />

                  </React.Fragment>

                ))}

                <div>

                  <button
                    style={buttonStyle}
                    onClick={() => setIsEditing(false)}
                  >
                    취소
                  </button>

                  <button
                    style={buttonStyle}
                    onClick={handleSave}
                  >
                    Save
                  </button>

                </div>

              </>

            )}

          </div>
        </div>
      )}

    </div>
    </div>
  );
}