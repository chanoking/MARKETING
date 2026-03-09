import ItemGridPage from "./ItemGridPage";
import BlogPage from "./BlogPage"
import KeychalPage from "./KeychalPage"
import LoginPage from "./LoginPage";
import { BrowserRouter, Routes, Route } from "react-router-dom"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ItemGridPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/keychal" element={<KeychalPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
