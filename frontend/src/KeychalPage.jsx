import { useEffect, useState } from "react";
import React from "react";

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

  useEffect(() => {
    async function fetchInfls() {
      const res = await fetch("http://localhost:3000/keychal/influencers");
      const data = await res.json();
      setInfluencers(data);
    }
    fetchInfls();
  }, []);

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
      `http://localhost:3000/keychal/states?keyword=${keyword}`
    );
    const data = await res.json();
    console.log(data)
    setKeywordStates(data[0].state);
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
  const buttonStyle = { height: "22px", fontSize: "12px", padding: "0px", width: "60px" };
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

  return (
    <div style={{ padding: 40, userSelect: "none" }}>
      {/* 인플루언서 리스트 */}
      <div>
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

              <button style={buttonStyle} onClick={() => setPopupOpen(false)}>
                cancel
              </button>
              <button style={buttonStyle}>수정</button>
              <button style={buttonStyle}>add</button>
            </div>
          </div>

          {/* 키워드 상태 팝업 */}
          {selectedKeyword && popupOpenForState && (
            <div style={{ ...overlayStyle, zIndex: 1000 }}>
              <div style={{ background: "white", width: "70%", maxHeight: "80vh", overflow: "auto" }}>
                {/* 키워드 상태 내용 여기에 넣기 */}
                {keywordStates.map((state) => (
                    <>
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

                    <div
                        style={{
                            background: "white",
                            padding: 20,
                            margin: 20,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 60,
                            fontWeight: 600
                        }}
                    >
                        <div> 날짜 </div>
                        <div> MOB </div>
                        <div> PC </div>
                        <div> Y </div>
                        <div> Competition </div>
                        <div> 순위 </div>
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