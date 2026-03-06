import { useEffect, useState } from "react";
import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import './KeychalPage.css'

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
    }
    fetchSums()
  }, [])

  const fetchSeparateKeywords = async (date) => {
    const res = await fetch(`http://localhost:3000/keychal/statesall?date=${date}`);
    const data = await res.json();  
    // console.log(data);
    
    const result = [[], []]

    data.forEach((doc) => {
      if(date === doc["date"]){
        if(doc["rank"] > 0){
          result[0].push(doc["keyword"]);
        }else{
          result[1].push(doc["keyword"]);
        }
      }
    })

    // console.log(result);
    
    setStates(result)
  }
  const handleClickDay = async (date) => { 
    let copyDate = new Date(date);
    
    copyDate.setDate(copyDate.getDate() + 1);
    
    copyDate = copyDate.toISOString().split("T")[0];

    // console.log(copyDate);
    
    setSelectedDate(copyDate);
    setShowPopup(true);

    await fetchSeparateKeywords(copyDate)
  }

  const handleStartChange = (e) => {
    const value = e.target.value;
    setStartDate(value);

    if(endDate && value > endDate){
        setEndDate(value)
    }
  }

  const handleEndChange = (e) => {
    const value = e.target.value;
    setEndDate(value)

    if (startDate && startDate > endDate){
        setStartDate(value);
    }
  }

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

 

  // 공통 스타일
  const buttonStyle = { height: "22px", fontSize: "12px", padding: "0px",
     width: "60px", border:"1px solid #000",
    margin: 2 };

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
  };

  const stateStyle = {
    background: "white",
    padding: 20,
    margin: 20,
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    justifyContent: "center",
    alignItems: "center",
    gap: 60
  }

  const popupStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "white",
    padding: "20px",
    border: "1px solid #ccc",
    zIndex: 1000,
};
  return (
    <div style={{ padding: 40, userSelect: "none" }}>

        <div style={{
            display:"flex",
            
        }}>

            <div style={{marginRight: 20}}>
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
                        fontWeight: "bold",
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
                className="my-calendar"
                locale="en-US"
                onClickDay={handleClickDay}
                tileContent={({date, view}) => {
                  if (view === "month") {
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
                  <h1 style={{fontSize:15}}>{selectedDate}</h1>
                  
                  <div className="header-container">
                    <h2>Positive</h2>
                    <h2>Negative</h2>
                  </div>

                  <div className="keywords-container">
                    
                    <div className="keywords">
                      {states[0]?.map(keyword => (
                        <p key={keyword}
                        style={{padding: 0, margin: "2px 0"}}>{keyword}</p>
                      ))}
                    </div>

                    <div className="keywords">
                      {states[1]?.map(keyword => (
                        <p key={keyword}
                        style={{padding: 0, margin: "2px 0"}}>{keyword}</p>
                      ))}
                    </div>

                  </div>

                  <button onClick={() => setShowPopup(false)}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: 45, 
                      height: 20, 
                      padding: 10, 
                      fontSize: 10, 
                      textAlign: "center"}}>닫기</button>
                </div>
              )}   
            </div>

        </div>

      {/* 팝업 */}
      {popupOpen && selectedInfl && (
        <>
          {/* 인플루언서 키워드 팝업 */}
          <div style={overlayStyle}>
            <div style={popupInnerStyle}>
              <div style={{ fontWeight: 600 }}>KEYWORD</div>
              <div style={{ fontWeight: 600 }}>QUOTE</div>
              <div style={{ fontWeight: 600 }}>ITEM</div>
              <div style={{ fontWeight: 600 }}>BRAND</div>

              {selectedInflKeywords.map((k) => (
                <React.Fragment key={k._id}>
                  <div
                    style={{ fontWeight: 500, fontSize: "14px", cursor: "pointer" }}
                    onClick={() => handleClickKeyword(k.keyword)}
                  >
                    {k.keyword}
                  </div>
                  <div style={{ fontWeight: 500, fontSize: "14px" }}>
                    {k.quote.toLocaleString()}
                  </div>
                  <div style={{ fontWeight: 500, fontSize: "14px" }}>{k.item}</div>
                  <div style={{ fontWeight: 500, fontSize: "14px" }}>{k.brand}</div>
                </React.Fragment>
              ))}
      
              <div>
                <button style={buttonStyle} onClick={() => {
                    setPopupOpen(false)
                    setSelectedInfl(null)
                    }}>
                    cancel
                </button>
                <button style={buttonStyle}>FIX</button>
                <button style={buttonStyle}>ADD</button>
              </div>
      
            </div>
          </div>

          {/* 키워드 상태 팝업 */}
          {selectedKeyword && popupOpenForState && (
            <div style={{ ...overlayStyle, zIndex: 1000 }}>
              <div style={{ background: "white", width: "70%", maxHeight: "80vh", overflow: "auto" }}>
          
                {keywordStates.map((state) => (
                    <>
                    <div style={{
                        fontSize: 17,
                        fontStyle: "Arial, sans-serif",
                        padding: 5,
                        fontWeight: 600,
                        color: "rgba(0,0,0,0.6)",
                        display: "flex",
                    }}>
                        <div>{selectedKeyword}</div>
                        <div
                            style={{
                                marginLeft: 680,
                                border: "1px groove #ccc",
                                padding: "0px 2px 5px 1px", 
                                height: 20,
                                cursor: "pointer"}}
                            onClick={()=>{
                                setSelectedKeyword(false)
                                setPopupOpenForState(false)
                            }}
                        >X</div>
                    </div>
                    <div
                        style={{
                            background: "white",
                            padding: 20,
                            width: "50%",
                            margin: "20px auto",
                            borderRadius: 8,
                            display: "flex",
                            gap: "10px",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                    >
                            <div style={{
                                fontWeight: 600
                            }}>기간</div>
                            
                            <div>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={handleStartChange}
                                    max={endDate || undefined}
                                    style={{fontWeight: 500, fontFamily: "Arial, sans-serif"}}
                                    />
                            </div>
                            
                            <div>~</div>

                            <div style={{fontWeight: 500}}>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={handleEndChange}
                                    min={startDate || undefined}
                                    style={{fontWeight: 500, fontFamily: "Arial, sans-serif"}}
                                />
                            </div>

                        <div>
                            <button style={{...buttonStyle, fontWeight:600}}>조회</button>
                        </div>

                    </div>
                    
                    
                    <div style={{...stateStyle, fontWeight: 600}}>
                        <div> 날짜 </div>
                        <div> MOB </div>
                        <div> PC </div>
                        <div> Y </div>
                        <div> Competition </div>
                        <div> 순위 </div>
                    </div>
                    
                    <div style={{...stateStyle, fontSize:14, fontWeight: 500}}>
                        {keywordStates.map(state => (
                        <>
                            <div>{state?.date.split("T")[0]}</div>
                            <div>{state?.mobile.toLocaleString()}</div>
                            <div>{state?.pc.toLocaleString()}</div>
                            <div>{state?.y.toLocaleString()}</div>
                            <div>{state?.competition}</div>
                            <div>{state?.rank}</div>
                        </>
                        ))}
                    </div>

                    </>
                    
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
    
  );
}

