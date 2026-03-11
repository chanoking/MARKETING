import { useEffect, useState } from "react";
import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./KeychalPage.css";

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

  useEffect(() => {
    async function fetchInfls() {
      const res = await fetch("http://localhost:3000/keychal/influencers");
      const data = await res.json();
      setInfluencers(data);
    }
    fetchInfls();
  }, []);

  useEffect(() => {
    const fetchSums = async () => {
      const res = await fetch("http://localhost:3000/keychal/states/cal");
      const data = await res.json();
      setVisibleSum(data);
    };
    fetchSums();
  }, []);

  const fetchSeparateKeywords = async (date) => {
    const res = await fetch(`http://localhost:3000/keychal/statesall?date=${date}`);
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
      `http://localhost:3000/keychal/keywords?influencer_id=${infl._id}`
    );
    const data = await res.json();
    setSelectedInflKeywords(data);
  };

  const fetchStateForKeyword = async (keyword) => {
    const res = await fetch(
      `http://localhost:3000/keychal/keyword/states?keyword=${keyword}`
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
      "http://localhost:3000/keychal/keyword_state_update",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
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
    gap: "20px"
  };

  const popupStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "white",
    padding: "20px",
    border: "1px solid #ccc",
    zIndex: 1000
  };

  return (
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

        <div>
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

              <div style={{ display: "flex", gap: 60 }}>
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
                      style={{ cursor: "pointer" }}
                      onClick={() => handleClickKeyword(k.keyword)}
                    >
                      {k.keyword}
                    </div>

                    <div>{k.quote.toLocaleString()}</div>

                    <div>{k.item}</div>

                    <div>{k.brand}</div>

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
  );
}