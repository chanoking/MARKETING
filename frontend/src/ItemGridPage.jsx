import { useEffect, useState } from "react";

export default function ItemGridPage() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [allKeywords, setAllKeywords] = useState([])
  const [file, setFile] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [searchMode, setSearchMode] = useState("item");

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("http://localhost:3000/items");
      const data = await res.json();
      setItems(data);
    }
    fetchData();
  }, []);

  const handleClick = async (item) => {
    if (selectedItem && selectedItem._id === item._id){
      setSelectedItem(null);
      setSelectedKeywords([]);
      return;
    }

    setSelectedItem(item);
    const res = await fetch(`http://localhost:3000/items/${item._id}`);
    const keywords = await res.json();
    setSelectedKeywords(keywords);
  };

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  }

  const uploadExcel = async () => {
    if (!file) return alert("파일 선택 먼저!")

    const formData = new FormData();
    formData.append("file", file)

    try {
      const res = await fetch("http://localhost:3000/upload-excel", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success){
        alert(data.message);
        if (selectedItem) handleClick(selectedItem);
      }else{
        alert("업데이트 실패: " + data.error);
      }
    }catch(err){
      console.log(err);
      alert("업로드 중 오류 발생")
    }
  }

  const handleSearch = async () => {
    if (!searchTerm) return alert("검색어를 입력하세요!");

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


    return (
  <>
    {/* Upload Section */}
    <div style={{ marginBottom: 20, marginLeft: 20, userSelect:"none" }}>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
      />
      <button onClick={uploadExcel} style={{ marginLeft: 8 }}>
        UPDATE
      </button>
    </div>

    <div style={{ marginBottom: 20, marginLeft: 20, userSelect: "none"}}>  
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="키워드 검색"
        />
      <button onClick={handleSearch} style={{ marginLeft: 8}}>
        검색
      </button>
    </div>

    {/* Items Grid */}
    <div style={{ padding: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 12 }}>
        {items.map((item) => (
          <div
            key={item._id}
            style={{
              border: "1px solid #ccc",
              padding: 16,
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              userSelect: "none"
            }}
            onClick={() => handleClick(item)}
          >
            {item.item}
          </div>
        ))}
      </div>

    {/* Keywords List*/}
    {(selectedItem || searchResults.length > 0) && (
      <div className="keywords-list" style={{ marginTop: 20}}>
        {(searchResults.length > 0 ? searchResults : selectedKeywords).map(
          (kw) => (
            <div
              key={kw._id}
              style={{
                border: "1px solid #ccc",
                padding: "8px 12px",
                marginBottom: "8px",
                borderRadius: "4px",
                backgroundColor: "#f0f0f0",
                userSelect: "none",
                display: "flex",
                gap: "12px"
              }}
            >
              <span>{kw.keyword}</span>
              <span>{kw.env}</span>
              <span>{kw.visible ? "노출" : "미노출"}</span>
              <span>{kw.mobile}</span>
              <span>{kw.pc}</span>
              <span>{kw.competition}</span>
            </div>
          )
        )}
        {searchResults.length === 0 && searchTerm && (
          <div>검색 결과가 없습니다. 키워드를 확인해주세요!</div>
        )}
          </div>
    )}

      </div>
    </>
  );
}
