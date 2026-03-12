import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar      from "./components/Navbar";
import AdminBanner from "./components/AdminBanner";
import Footer      from "./components/Footer";

export default function Layout() {
  const { pathname } = useLocation();

  /* scroll to top on every route change */
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <>
      {/* ── always visible ── */}
      <Navbar />
      <AdminBanner />

      {/* ── page content pushed below fixed navbar (72px) ── */}
      <main style={{ paddingTop: "72px", minHeight: "100vh" }}>
        <Outlet />
      </main>

      <Footer />
    </>
  );
}
