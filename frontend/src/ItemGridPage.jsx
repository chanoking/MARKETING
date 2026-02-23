import { useEffect, useState } from "react";

export default function ItemGridPage() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [allKeywords, setAllKeywords] = useState([]);

  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchMode, setSearchMode] = useState("item"); // item | global

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  /* =======================
     아이템 목록 로드 (최초 1회)
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
     날짜 or 아이템 변경 시 키워드 로드
  ======================= */
  useEffect(() => {
    async function fetchKeywords() {
      if (!selectedDate) return;
      const formattedDate = selectedDate.toISOString().split("T")[0];

      const url = selectedItem
        ? `http://localhost:3000/keywords?item_id=${selectedItem._id}&date=${formattedDate}`
        : `http://localhost:3000/keywords?date=${formattedDate}`;

      const res = await fetch(url);
      const data = await res.json();

      setSelectedKeywords(data);
      setSearchResults([]); // 날짜 변경 시 검색 초기화
    }

    fetchKeywords();
  }, [selectedDate, selectedItem]);

  /* =======================
     아이템 클릭 (토글)
  ======================= */
  const handleClick = (item) => {
    if (selectedItem && selectedItem._id === item._id) {
      setSelectedItem(null);
      setSelectedKeywords([]);
    } else {
      setSelectedItem(item);
    }
  };

  /* =======================
     날짜 이동
  ======================= */
  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  /* =======================
     파일 업로드
  ======================= */
  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

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

    // 현재 상태 다시 로드
    if (selectedItem || selectedDate) {
      setSelectedItem((prev) => prev);
    }
  };

  /* =======================
     검색
  ======================= */
  const handleSearch = async () => {
    if (!searchTerm) return alert("검색어를 입력하세요");

    let source = [];

    if (searchMode === "global") {
      if (allKeywords.length === 0) {
        const res = await fetch("http://localhost:3000/keywords");
        const data = await res.json();
        setAllKeywords(data);
        source = data;
      } else {
        source = allKeywords;
      }
    } else {
      if (!selectedItem) {
        alert("아이템을 먼저 선택하세요");
        return;
      }
      source = selectedKeywords;
    }

    const results = source.filter((kw) =>
      kw.keyword.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSearchResults(results);
  };

  /* =======================
     화면
  ======================= */
  return (
    <>
      {/* 업로드 */}
      <div style={{ margin: 20, userSelect: "none" }}>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        <button onClick={uploadExcel} style={{ marginLeft: 8, userSelect: "none" }}>
          UPDATE
        </button>
      </div>

      {/* 날짜 컨트롤 */}
      <div style={{ marginLeft: 20, userSelect: "none" }}>
        <button onClick={() => changeDate(-1)}>◀</button>
        <span style={{ margin: "0 10px" }}>{selectedDate}</span>
        <button onClick={() => changeDate(1)}>▶</button>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ marginLeft: 10 }}
        />
      </div>

      {/* 검색 */}
      <div style={{ margin: 20, userSelect: "none" }}>
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
          style={{ marginLeft: 8 }}
        />
        <button onClick={handleSearch} style={{ marginLeft: 8, userSelect: "none"}}>
          검색
        </button>
      </div>

      {/* 아이템 그리드 */}
      <div style={{ padding: 20 }}>
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
              onClick={() => handleClick(item)}
              style={{
                border: "1px solid #ccc",
                padding: 12,
                textAlign: "center",
                cursor: "pointer",
                background:
                  selectedItem?._id === item._id ? "#e6f3ff" : "#fff",
                userSelect: "none",
              }}
            >
              {item.item}
            </div>
          ))}
        </div>

        {/* 키워드 리스트 */}
        {(selectedItem || searchResults.length > 0) && (
          <div style={{ marginTop: 20 }}>
            {(searchResults.length > 0
              ? searchResults
              : selectedKeywords
            ).map((kw) => (
              <div
                key={kw._id}
                style={{
                  border: "1px solid #ccc",
                  padding: 8,
                  marginBottom: 6,
                  display: "flex",
                  gap: 12,
                  background: "#f5f5f5",
                }}
              >
                <span>{kw.keyword}</span>
                <span>{kw.mobile}</span>
                <span>{kw.pc}</span>
                <span>{kw.visible ? "노출" : "미노출"}</span>
                <span>{kw.competition}</span>
              </div>
            ))}

            {searchResults.length === 0 && searchTerm && (
              <div>검색 결과가 없습니다.</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
