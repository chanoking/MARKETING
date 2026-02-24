import { useEffect, useState } from "react";

export default function ItemGridPage() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [keywordStates, setKeywordStates] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [allKeywords, setAllKeywords] = useState([]);

  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchMode, setSearchMode] = useState("item"); // item | global

  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  });

  const [popupOpen, setPopupOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedStates, setEditedStates] = useState([]);

  /* =======================
     아이템 목록 로드
  ======================= */
  useEffect(() => {
    async function fetchItems() {
      const res = await fetch("http://localhost:3000/items");
      const data = await res.json();
      setItems(data);
    }
    fetchItems();
  }, []);

  /* =======================
     날짜/아이템 변경 시 키워드 로드
  ======================= */
  useEffect(() => {
    async function fetchKeywords() {
      if (!selectedItem) return;
      const url = `http://localhost:3000/keywords?item_id=${selectedItem._id}`
      const res = await fetch(url);
      const data = await res.json();
      setSelectedKeywords(data);
      setSearchResults([]);
    }
    fetchKeywords();
  }, [selectedItem, dateRange.start]);

  /* =======================
     키워드 상태 조회
  ======================= */
  const fetchKeywordStates = async (kw) => {
    if (!kw) return;
    try {
      const res = await fetch(
        `http://localhost:3000/keyword-state?keyword_id=${kw._id}`
      );
      const data = await res.json();
      setKeywordStates(data);
    } catch (err) {
      console.error("키워드 상태 조회 실패:", err);
    }
  };

  /* =======================
    키워드 클릭
  ======================= */
  const handleClickKeyword = async (kw) => {
    setSelectedKeyword(kw);
    setPopupOpen(true);
    await fetchKeywordStates(kw); // kw를 직접 넘김
  };

  /* =======================
     아이템 클릭
  ======================= */
  const handleClickItem = (item) => {
    if (selectedItem?._id === item._id) {
      setSelectedItem(null);
      setSelectedKeywords([]);
    } else {
      setSelectedItem(item);
    }
    setSelectedKeyword(null);
    setKeywordStates([]);
  };


  /* =======================
     파일 업로드
  ======================= */
  const handleFileUpload = (e) => setFile(e.target.files[0]);

  const uploadExcel = async () => {
    if (!file) return alert("파일 선택 먼저!");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("http://localhost:3000/upload-excel", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    alert(data.message || "업데이트 완료");
  };

  /* =======================
     검색
  ======================= */
  const handleSearch = async () => {
    if (!searchTerm) return alert("검색어를 입력하세요");
    let source = searchMode === "global" ? allKeywords : selectedKeywords;
    const results = source.filter((kw) =>
      kw.keyword.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  };

  return (
    <div style={{ padding: 100, userSelect: "none" }}>
      {/* 파일 업로드 */}
      <div style={{ marginBottom: 20 }}>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        <button onClick={uploadExcel} style={{ marginLeft: 8 }}>
          UPDATE
        </button>
      </div>

      {/* 검색 */}
      <div style={{ marginBottom: 20 }}>
        <select
          value={searchMode}
          onChange={(e) => setSearchMode(e.target.value)}
        >
          <option value="item">아이템 내 검색</option>
          <option value="global">전체 검색</option>
        </select>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="키워드 검색"
          style={{ marginLeft: 10 }}
        />
        <button onClick={handleSearch} style={{ marginLeft: 8 }}>
          검색
        </button>
      </div>

      {/* 아이템 그리드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gap: 12,
        }}
      >
        {items.map((item) => (
          <div
            key={item._id}
            onClick={() => handleClickItem(item)}
            style={{
              border: "1px solid #ccc",
              padding: 12,
              textAlign: "center",
              cursor: "pointer",
              background: selectedItem?._id === item._id ? "#e6f3ff" : "#fff",
            }}
          >
            {item.item}
          </div>
        ))}
      </div>

      {/* 키워드 리스트 */}
      {(selectedItem || searchResults.length > 0) && (
        <div style={{ marginTop: 20 }}>
          {(searchResults.length > 0 ? searchResults : selectedKeywords).map(
            (kw) => (
              <div
                key={kw._id}
                onClick={() => handleClickKeyword(kw)}
                style={{
                  border: "1px solid #ccc",
                  padding: 8,
                  marginBottom: 6,
                  display: "flex",
                  gap: 12,
                  background:
                    selectedKeyword?._id === kw._id ? "#d0ebff" : "#f5f5f5",
                  cursor: "pointer",
                }}
              >
                <span>{kw.keyword}</span>
              </div>
            )
          )}

          {searchResults.length === 0 && searchTerm && (
            <div>검색 결과가 없습니다.</div>
          )}

          {/* 날짜 범위 선택 */}
          {/* {selectedKeyword && (
            <div style={{ marginTop: 20 }}>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
              />
              ~
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
              />
              <button onClick={fetchKeywordStates} style={{ marginLeft: 8 }}>
                조회
              </button>
            </div>
          )} */}

          {/* 선택 키워드 상태값 */}
          {popupOpen && selectedKeyword && (
            <div
              className="modal-overlay" 
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
            <div
              className="modal-content"
              style={{
                width: "66%",
                maxHeight: "80vh",
                background: "#fff",
                padding: "20px",
                overflowY: "auto",
                borderRadius: "8px"
              }}
            >
                <button onClick={() => setPopupOpen(false)}>닫기</button>
                <h4>{keywordStates[0].keyword}</h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr"
                  }}
                >
                  <div>Date</div>
                  <div>Mobile</div>
                  <div>PC</div>
                  <div>Competition</div>
                  <div>Exposure</div>
                  <div>Env</div>
                 </div> 
                {keywordStates.map((kw) => (
                  <div key={kw._id}>
                    {kw.state.map((s, idx) => (
                      <div key={idx} style={{ marginBottom: 10}}>
                        <input
                          type="date"
                          value={s.date.slice(0, 10)}
                          onChange={(e) => {
                            const newStates = [...keywordStates];
                            newState[idx].date = e.target.value;
                            setKeywordStates(newStates);
                          }}
                        />
                        <input
                          type="number"
                          value={s.mobile}
                          onChange={(e) => {
                            const newStates = [...keywordsStates];
                            newStates[idx].mobile = Number(e.target.value);
                            setKeywordStates(newStates);
                          }}
                          placeholder="모바일"
                        />
                        <input
                          type="number"
                          value={s.pc}
                          onChange={(e) => {
                            const newStates = [...keywordsStates]
                            newStates[idx].pc = Number(e.target.value)
                            setKeywordStates(newStates)
                          }}
                          placeholder="PC"
                        />
                       
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}