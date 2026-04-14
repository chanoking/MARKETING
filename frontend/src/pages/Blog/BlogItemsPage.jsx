import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import React from "react";
import "../../css/blogItemsPage.css"

export default function BlogItemsPage(){
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/blog/items`, {
        headers:{
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json();
      setItems(data);
    }
    fetchItems();
  }, [])

  return (
    <div className = "blog_body">
      <div className = "items">
        {items.map((item, i) => (
          <React.Fragment key={i}>
            {/* <div className="item"> */}
              <Link
                className="item"
                key={item._id}
                to={`/blog/items/${item._id}/keywords`}
              >
                {item.item}
              </Link>
            {/* </div> */}
                
          </React.Fragment>
        ))}
      </div>
    </div>

  )
}