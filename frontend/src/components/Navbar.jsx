import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.svg';
import s from './Navbar.module.scss';

export default function Navbar() {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'MM';

  const links = [
    { to: '/', label: "E'lonlar" },
    { to: '/create', label: "E'lon joylash" },
    { to: '/saved', label: 'Saqlanganlar' },
    { to: '/chat', label: 'Xabarlar' },
  ];

  return (
    <header className={`${s.navbar} ${scrolled ? s.scrolled : ''}`}>
      <div className={s.nav_inner}>
        <Link to="/" className={s.brand}>
          <img src={logo} alt="MotorMarket Logo" className={s.brand_logo} />
        </Link>

        <nav className={s.nav_links}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => isActive ? s.active : ''}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className={s.nav_auth}>
          {isLoggedIn ? (
            <>
              <Link to="/profile" className={s.user_pill}>
                <span className={s.avatar}>{initials}</span>
                <span className={s.email}>{user?.email}</span>
              </Link>
              <button className="btn btn--ghost btn--sm" onClick={handleLogout} style={{ marginLeft: '8px' }}>
                Chiqish
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn btn--primary btn--sm">Kirish</Link>
          )}

          <button
            className={`${s.hamburger} ${mobileOpen ? s.open : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menyu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={s.mobile_menu} onClick={() => setMobileOpen(false)}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => isActive ? s.active : ''}>
              {l.label}
            </NavLink>
          ))}
          {isLoggedIn ? (
            <>
              <NavLink to="/profile">Profil</NavLink>
              <button className="btn btn--ghost" onClick={handleLogout} style={{ justifyContent: 'flex-start', color: '#EF4444' }}>
                Chiqish
              </button>
            </>
          ) : (
            <NavLink to="/auth" style={{ color: '#8B85FF', fontWeight: 600 }}>Kirish / Ro'yxatdan o'tish</NavLink>
          )}
        </div>
      )}
    </header>
  );
}
