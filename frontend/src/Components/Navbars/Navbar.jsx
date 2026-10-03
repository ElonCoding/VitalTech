import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import './Navbar.css';
import { FaBars, FaTimes, FaUser } from 'react-icons/fa';


const Navbar = () => {
  const [theme, setTheme] = useState('light');
  const [isOpen, setIsOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const location = useLocation();
  const { userRole } = useUser();

  const navigate = useNavigate();

  const handleclick = () => { 
    navigate('/dashboard');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
          <span className="logo-brand-vitaltech">
            <span className="logo-brand-icon">⚡</span>
            VitalTech
          </span>
        </Link>

        <button
          className="hamburger"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>


        <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <div className="nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Home</NavLink>
            <NavLink to="/services" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Services</NavLink>
            <NavLink to="/prices" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Pricing</NavLink>
            <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Contact</NavLink>
          </div>

          <div className="nav-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            {userRole ? (
              <div className="user-icon" onClick={handleclick}>
                <FaUser size={24} />
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/signup" className="btn btn-primary" onClick={() => setIsOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
        
      </div>
    </nav>
  );
};

export default Navbar;