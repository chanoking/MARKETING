import HomePage from "./pages/HomePage.jsx";
import BlogPage from "./pages/BlogPage.jsx"
import KeychalPage from "./pages/KeychalPage.jsx"
import LoginPage from "./pages/LoginPage.jsx";
import InflPage from "./pages/InflPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import KeychalSummaryPage from "./pages/KeychalSummaryPage.jsx";
import InflSummaryPage from "./pages/InflSummaryPage.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/select" element={<HomePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/keychal" element={<KeychalPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/influencer" element={<InflPage />} />
        <Route path="/keychalSummary" element={<KeychalSummaryPage />} />
        <Route path="/inflSummary" element={<InflSummaryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
