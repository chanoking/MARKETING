import { useEffect, useState } from 'react'

export default function BlogPage() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [keywordStates, setKeywordStates] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [file, setFile] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStates, setEditedStates] = useState([]);
  
  /* =======================
     아이템 목록 로드
  ======================= */
  useEffect(() => {
    async function fetchItems() {
      const res = await fetch("http://localhost:3000/blog/items");
      const data = await res.json();

      setItems(data);
    }
    fetchItems();
  }, []);


  /* =======================
     키워드 목록 로드
  ======================= */
  useEffect(() => {
    async function fetchKeywords() {
      if (!selectedItem) return;

      const res = await fetch(
        `http://localhost:3000/blog/keywords?item_id=${selectedItem._id}`
      );
      const data = await res.json();

      setSelectedKeywords(data);     
    }
    fetchKeywords();
  }, [selectedItem]);


  /* =======================
     키워드 상태 조회
  ======================= */
  const fetchKeywordStates = async (kw) => {
    const res = await fetch(
      `http://localhost:3000/blog/keyword-state?keyword_id=${kw._id}`
    );
    const data = await res.json();
    const states = data[0]?.state || [];

    setKeywordStates(states);
  };


  /* =======================
     아이템 클릭
  ======================= */
  const handleClickItem = (item) => {
    if (item._id === selectedItem?._id){
      setSelectedKeywords([])
      setSelectedItem(null)
    } else {
      setSelectedItem(item);
    }
    setSelectedKeyword(null);
    setKeywordStates([]);
    setPopupOpen(false);
    setIsEditing(false);
  };


  /* =======================
     키워드 클릭
  ======================= */
  const handleClickKeyword = async (kw) => {
    setSelectedKeyword(kw);
    setPopupOpen(true);
    setIsEditing(false);
    await fetchKeywordStates(kw);
  };


  /* =======================
     파일 업로드
  ======================= */
  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadExcel = async () => {
    if (!file) {
      alert("파일 선택");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    const res = await fetch(
      "http://localhost:3000/blog/upload-excel",
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await res.json();

    alert(data.message);
  };


  /* =======================
     저장
  ======================= */
  const handleSave = async () => {
    const res = await fetch(
      "http://localhost:3000/blog/keyword-state-update",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          keyword_id: selectedKeyword._id,
          states: editedStates
        })
      }
    );
    const data = await res.json();

    alert(data.message);
    setKeywordStates(editedStates);
    setIsEditing(false);
  };


  /* =======================
     UI
  ======================= */
return (
    <div style={{ padding: 40, userSelect: "none" }}>

      {/* 업로드 */}
      <input type="file" onChange={handleFileUpload} />

      <button onClick={uploadExcel}>
        upload
      </button>

      {/* 아이템 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(6,1fr)",
        gap: 10,
        marginTop: 30
      }}>

        {items.map(item => (
          <div
            key={item._id}
            onClick={() => handleClickItem(item)}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              cursor: "pointer",
              background:
                selectedItem?._id === item._id
                  ? "#e6f3ff"
                  : "white"
            }}
          >
            {item.item}
          </div>
        ))}

      </div>

      {/* 키워드 */}

      <div style={{ 
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 10,
        marginTop: 20,
         }}>
        {selectedKeywords.map(kw => (
          <div
            key={kw._id}
            onClick={() => handleClickKeyword(kw)}
            style={{
              cursor: "pointer",
              background:
                selectedKeyword?._id === kw._id
                  ? "#d0ebff"
                  : "#f5f5f5"
            }}
          >

            {kw.keyword}

          </div>
        ))}
      </div>


      {/* 팝업 */}

      {popupOpen && selectedKeyword && (

        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"

        }}>

          <div style={{
            background: "white",
            padding: 20,
            width: "70%",
            maxHeight: "80vh",
            overflow: "auto"
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              width: "20%",
              gap: "10px"
            }}>
              <button onClick={() => {
                setPopupOpen(false);
                setIsEditing(false);
              }} 
              style={{
                backgroundColor: "rgba(0, 102, 204, 0.7)",
                color: "white"
                }}
                >
                닫기
              </button>

            {/* 수정 */}
            {!isEditing ? (
              <button
                onClick={() => {
                  setEditedStates(
                    keywordStates.map(s => ({...s}))
                  );
                  setIsEditing(true);
                }} style={{
                  backgroundColor: "rgba(0, 102, 204, 0.7)",
                  color: "white"
                }}>
                  수정
              </button>
            ) : (
              <button onClick={handleSave}>
                저장
              </button>
            )}
            </div>
            <h3>
              {selectedKeyword.keyword}
            </h3>


            {/* header */}

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
              fontWeight: "bold"
            }}>
              <div>Date</div>
              <div>Mobile</div>
              <div>PC</div>
              <div>Competition</div>
              <div>Exposure</div>
              <div>Env</div>
            </div>

            {/* body */}
            {keywordStates.map((state, idx) => (
              <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns:
                "1fr 1fr 1fr 1fr 1fr 1fr",
                  marginTop: 5,
                  marginBottom: 5
                }}
              >

                {isEditing ? (
                  <>
                    <input
                      type="date"
                      value={
                        editedStates[idx]?.date?.slice(0,10) || ""
                      }
                      onChange={(e) => {
                        const copy = [...editedStates];
                        copy[idx].date = e.target.value;
                        setEditedStates(copy);
                      }}
                    />

                    <input
                      value={editedStates[idx]?.mobile || ""}
                      onChange={(e) => {
                        const copy = [...editedStates];
                        copy[idx].mobile =
                          Number(e.target.value);
                        setEditedStates(copy);
                      }}
                    />

                    <input
                      value={editedStates[idx]?.pc || ""}
                      onChange={(e) => {
                        const copy = [...editedStates];
                        copy[idx].pc =
                          Number(e.target.value);
                        setEditedStates(copy);
                      }}
                    />

                    <input
                      value={
                        editedStates[idx]?.competition || ""
                      }
                      onChange={(e) => {
                        const copy = [...editedStates];
                        copy[idx].competition =
                          e.target.value;
                        setEditedStates(copy);
                      }}
                    />

                    <input
                      value={
                        editedStates[idx]?.exposure || ""
                      }
                      onChange={(e) => {
                        const copy = [...editedStates];
                        copy[idx].exposure =
                          Number(e.target.value);
                        setEditedStates(copy);
                      }}

                    />

                    <input
                      value={editedStates[idx]?.env || ""}
                      onChange={(e) => {
                        const copy = [...editedStates];
                        copy[idx].env =
                          e.target.value;
                        setEditedStates(copy);
                      }}
                    />
                  </>

                ) : (

                  <>
                    <div>{state.date?.slice(0,10)}</div>
                    <div>{state.mobile}</div>
                    <div>{state.pc}</div>
                    <div>{state.competition}</div>
                    <div>{state.exposure}</div>
                    <div>{state.env}</div>
                  </>

                )}

              </div>

            ))}


          </div>
        </div>
      )}
    </div>

  );
}