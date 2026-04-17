import React, { useEffect, useState, useRef } from "react";
import "../../css/blogPage.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BlogPage() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dateColumns, setDateColumns] = useState([]);
  const [metrics, setMetrics] = useState(new Map());
  const [filter, setFilter] = useState(false);
  const [isFilterClicked, setIsFilterClicked] = useState(false);
  const [selectedHeader, setSelectedHeader] = useState("");

  const [columnWidths, setColumnWidths] = useState({
    keyword: 180,
    env: 100,
    volume: 100,
  });

  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState(null);

  useEffect(() => {
    document.title = "Blog";
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/blog/items`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      setItems(data);
    };
    fetchItems();
  }, []);

  useEffect(() => {
    const fetchKeywords = async () => {
      if (!selectedItem) return;
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/blog/items/${selectedItem}/keywords`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setKeywords(data);
    };
    fetchKeywords();
  }, [selectedItem]);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!selectedItem || !startDate || !endDate) return;

      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      });

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/blog/items/${selectedItem}/keywords/metrics?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        const metricsMap = new Map(data.map((item) => [item.keyword, item]));

        setMetrics(metricsMap);
      } catch (err) {
        console.error("fetch error:", err);
      }
    };

    fetchMetrics();
  }, [selectedItem, startDate, endDate]);

  const scrollRef = useRef();
  const tableRef = useRef();

  const scrollLeftClick = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRightClick = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };

  const onChange = (dates) => {
    const [start, end] = dates;

    start?.setHours(9);
    if (end) end?.setHours(9);

    setStartDate(start);
    setEndDate(end);

    if (!start || !end) {
      setDateColumns([]);
      return;
    }

    const days = (end - start) / (24 * 60 * 60 * 1000);
    const columns = [];

    for (let i = 0; i <= days; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      columns.push(current);
    }

    setDateColumns(columns);
  };

  const handleMouseDown = (e) => {
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;

    e.preventDefault();

    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;

    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseDownForTable = (columnKey) => {
    setIsResizing(true);
    setResizingColumn(columnKey);
  };

  useEffect(() => {
    const handleMouseMoveForTable = (e) => {
      if (!isResizing || !resizingColumn || !tableRef.current) return;

      const tableLeft = tableRef.current.getBoundingClientRect().left;

      let newWidth = 0;

      if (resizingColumn === "keyword") {
        newWidth = e.clientX - tableLeft;
      }

      if (resizingColumn === "env") {
        newWidth = e.clientX - tableLeft - columnWidths.keyword;
      }

      if (resizingColumn === "volume") {
        newWidth =
          e.clientX - tableLeft - columnWidths.keyword - columnWidths.env;
      }

      setColumnWidths((prev) => ({
        ...prev,
        [resizingColumn]: Math.max(60, newWidth),
      }));
    };

    const handleMouseUpForTable = () => {
      setIsResizing(false);
      setResizingColumn(null);
    };

    window.addEventListener("mousemove", handleMouseMoveForTable);
    window.addEventListener("mouseup", handleMouseUpForTable);

    return () => {
      window.removeEventListener("mousemove", handleMouseMoveForTable);
      window.removeEventListener("mouseup", handleMouseUpForTable);
    };
  }, [isResizing, resizingColumn, columnWidths]);

  const dateFormat = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return "";

    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${month}/${day}`;
  };

  return (
    <div className="blog-body">
      <div className="wrapper">
        <button 
            className = {filter ? "btn-filter on": "btn-filter"}
            onClick={() => setFilter((prev) => !prev)}>{filter ? "필터 사용중" : "필터"}</button>
        <div className="blog-datepicker">
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={onChange}
            isClearable={true}
            dateFormat="yyyy-MM-dd"
            placeholderText="날짜 범위를 선택하세요"
          />
        </div>

        <button className="scroll-btn" onClick={scrollLeftClick}>
          ‹
        </button>

        <div
          className="scroll-container"
          ref={scrollRef}
          style={{
            cursor: isDown ? "grabbing" : "grab",
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          {items.map((item) => (
            <button
              key={item._id}
              className={`item ${selectedItem === item._id ? "active" : ""}`}
              onClick={() => setSelectedItem(item._id)}
            >
              {item.item}
            </button>
          ))}
        </div>

        <button className="scroll-btn" onClick={scrollRightClick}>
          ›
        </button>
      </div>

      <div
        className="blog-table"
        ref={tableRef}
        style={{
          gridTemplateColumns: `${columnWidths.keyword}px ${columnWidths.env}px ${columnWidths.volume}px repeat(${
            dateColumns.length > 0 ? dateColumns.length : 1
          }, ${!filter ? "80px" : "90px"})`,
        }}
      >
        <div className="cell blog-header resizable-header">
          키워드: {keywords.length}
          {filter && (
            <div className="filter-mark" onClick={() => {
                setIsFilterClicked((prev) => !prev);
                setSelectedHeader("키워드");
                }}>
                ▿
            </div>
          )}

          <div
            className="resize-handle"
            onMouseDown={() => handleMouseDownForTable("keyword")}
          />
        </div>

        <div className="cell blog-header resizable-header">
          검색환경
          {filter && (
            <div className="filter-mark" onClick={() => {
                setIsFilterClicked((prev) => !prev);
                setSelectedHeader("검색환경");
                }}>
                ▿
            </div>
          )}
          <div
            className="resize-handle"
            onMouseDown={() => handleMouseDownForTable("env")}
          />
        </div>

        <div className="cell blog-header resizable-header">
          검색량
          {filter && (
            <div className="filter-mark" onClick={() => {
                setIsFilterClicked((prev) => !prev)
                setSelectedHeader("검색량")
                }}>
                ▿
            </div>
          )}
          <div
            className="resize-handle"
            onMouseDown={() => handleMouseDownForTable("volume")}
          />
        </div>

        {endDate &&
          startDate &&
          dateColumns.map((dateCol, i) => (
            <>
            <div className="cell blog-header resizable-header" key={i}>
              {dateFormat(dateCol)}
                {filter && (
                <div className="filter-mark" onClick={() => {
                    setIsFilterClicked((prev) => !prev);
                    setSelectedHeader(`${dateFormat(dateCol)} ${i+1}`);
                    }}>
                    ▿
                </div>
                )}
            </div>
            </>
          ))}

        {endDate &&
          startDate &&
          keywords.map((keyword, i) => {
            return (
              <React.Fragment key={i}>
                <div className="cell" style={{ fontSize: 14 }}>
                  {keyword.keyword}
                </div>
                <div className="cell" style={{ fontSize: 14 }}>
                  {
                    metrics.get(keyword.keyword)?.values[
                      dateColumns[dateColumns.length - 1]
                        ?.toISOString()
                        .split("T")[0]
                    ]?.env
                  }
                </div>
                <div className="cell" style={{ fontSize: 14 }}>
                  {metrics
                    .get(keyword.keyword)
                    ?.values[
                      dateColumns[dateColumns.length - 1]
                        ?.toISOString()
                        .split("T")[0]
                    ]
                    ?.volume?.toLocaleString()}
                </div>
                {dateColumns.map((dateCol, dateIdx) => (
                  <div className="cell date" key={dateIdx} style={{ fontSize: 14 }}>
                    {
                      metrics.get(keyword.keyword)?.values[
                        dateColumns[dateIdx]?.toISOString().split("T")[0]
                      ]?.cnt
                    }
                  </div>
                ))}
              </React.Fragment>
            );
          })}
        {isFilterClicked && selectedHeader && (
            <div className="filtering-popup" style={
                selectedHeader === "검색환경" ? 
                {left: columnWidths.keyword - (220 - columnWidths.env)} 
                : selectedHeader === "검색량" ?
                {left: (columnWidths.keyword + columnWidths.env) - (220 - columnWidths.volume)}
                : selectedHeader.split(" ").length > 1 ?
                {left: (columnWidths.keyword + columnWidths.env + columnWidths.volume) - (220 - (90 * Number(selectedHeader.split(" ")[1])))}
                : {}
            }></div>

        )}
      </div>
    </div>
  );
}