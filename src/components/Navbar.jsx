import { useState, useEffect } from "react";
import { NavLink }             from "react-router-dom";
import { useAdmin }            from "../context/AdminContext";
import AuthModal               from "./AuthModal";
import "../styles/navbar.css";

const NAV_LINKS = [
  { to: "/",        label: "Home"    },
  { to: "/menu",    label: "Menu"    },
  { to: "/gallery", label: "Gallery" },
  { to: "/about",   label: "About"   },
];

export default function Navbar() {
  const { isAdmin, logout }         = useAdmin();
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen,   setAuthOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAdminBtn = () => {
    if (isAdmin) logout();
    else setAuthOpen(true);
  };

  return (
    <>
      <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
        <NavLink to="/" className="navbar__logo" end>
          Bites <em>&amp; More</em>
        </NavLink>

        <ul className="navbar__links">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `navbar__link${isActive ? " navbar__link--active" : ""}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={handleAdminBtn}
              className={`navbar__admin-btn${isAdmin ? " navbar__admin-btn--active" : ""}`}
            >
              <span className={`navbar__admin-dot${isAdmin ? " navbar__admin-dot--active" : ""}`} />
              {isAdmin ? "Admin ✓" : "Admin"}
            </button>
          </li>
        </ul>

        <button
          className="navbar__hamburger"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className={`navbar__bar${mobileOpen ? " navbar__bar--1-open" : ""}`} />
          <span className={`navbar__bar${mobileOpen ? " navbar__bar--2-open" : ""}`} />
          <span className={`navbar__bar${mobileOpen ? " navbar__bar--3-open" : ""}`} />
        </button>
      </nav>

      {mobileOpen && (
        <div className="navbar__overlay" onClick={() => setMobileOpen(false)} />
      )}

      <div className={`navbar__drawer${mobileOpen ? " navbar__drawer--open" : ""}`}>
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `navbar__drawer-link${isActive ? " navbar__drawer-link--active" : ""}`
            }
          >
            {label}
          </NavLink>
        ))}
        <button
          onClick={() => { setMobileOpen(false); handleAdminBtn(); }}
          className={`navbar__drawer-admin${isAdmin ? " navbar__drawer-admin--active" : ""}`}
        >
          {isAdmin ? "🛡️ Admin Mode — Logout" : "🔐 Admin Login"}
        </button>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
