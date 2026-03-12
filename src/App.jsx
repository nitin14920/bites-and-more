import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminProvider } from "./context/AdminContext";
import { ToastProvider } from "./components/Toast";
import Layout from "./Layout";
import Home from "./pages/Home/index";
import Menu from "./pages/Menu/index";
import Gallery from "./pages/Gallery/index";
import About from "./pages/About/index";
import "./styles/global.css";
import "./styles/animations.css";

export default function App() {
  return (
    <AdminProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="menu" element={<Menu />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="about" element={<About />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AdminProvider>
  );
}
