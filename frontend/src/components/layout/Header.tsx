import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, Sun, Moon } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem('urbancool-theme') || 'dark'
  );

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('urbancool-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <header>
      <div className="container nav">
        <Link to="/" className="logo">
          <span className="logo-mark">U</span>
          <span>UrbanCool Twin</span>
        </Link>
        <nav className="navlinks">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>
          <NavLink to="/map" className={({ isActive }) => (isActive ? 'active' : '')}>Live Map</NavLink>
          <NavLink to="/air-quality" className={({ isActive }) => (isActive ? 'active' : '')}>Air Quality</NavLink>
          <NavLink to="/environment" className={({ isActive }) => (isActive ? 'active' : '')}>Environment</NavLink>
          <NavLink to="/data-explorer" className={({ isActive }) => (isActive ? 'active' : '')}>Data Explorer</NavLink>
        </nav>
        <div className="actions">
          <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-btn menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu size={18} />
          </button>
        </div>
        <nav className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
          <NavLink to="/" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>
          <NavLink to="/map" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>Live Map</NavLink>
          <NavLink to="/air-quality" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>Air Quality</NavLink>
          <NavLink to="/environment" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>Environment</NavLink>
          <NavLink to="/data-explorer" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>Data Explorer</NavLink>
        </nav>
      </div>
    </header>
  );
}
