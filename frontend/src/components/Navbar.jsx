import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SarthakLogo from './SarthakLogo';

/* Animated nav link with underline slide-in */
function AnimNavLink({ to, end, children, onClick }) {
  return (
    <NavLink to={to} end={end} onClick={onClick}
      className={({ isActive }) =>
        `group relative text-sm font-medium transition-colors duration-200 ${isActive ? 'text-brand-primary' : 'text-[#6B7280] hover:text-brand-primary'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {children}
          <motion.span
            className="absolute -bottom-1 left-0 h-0.5 rounded-full bg-brand-primary"
            initial={false}
            animate={{ width: isActive ? '100%' : '0%' }}
            whileHover={{ width: '100%' }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          />
        </>
      )}
    </NavLink>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  /* Detect scroll to add glass effect */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <motion.header
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b transition-all duration-300"
      style={{
        borderColor: scrolled ? '#5EEAD4' : '#CCFBF1',
        background: scrolled
          ? 'rgba(255,255,255,0.88)'
          : 'rgba(255,255,255,0.96)',
        backdropFilter: scrolled ? 'blur(18px) saturate(180%)' : 'blur(8px)',
        boxShadow: scrolled ? '0 4px 32px rgba(13,148,136,0.10)' : 'none',
      }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">

        {/* ── Logo ────────────────────────────────────── */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: [0, -8, 8, -4, 0], scale: 1.08 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center rounded-xl border border-[#5EEAD4] bg-[#F0FDFA] p-1"
          >
            <SarthakLogo size={30} />
          </motion.div>
          <motion.span
            className="text-base font-bold tracking-wide text-brand-primary"
            whileHover={{ letterSpacing: '0.06em' }}
            transition={{ duration: 0.2 }}
          >
            Sarthak AI
          </motion.span>
        </Link>

        {/* ── Mobile hamburger ───────────────────────── */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          className="text-brand-primary md:hidden"
          onClick={() => setOpen((p) => !p)}
        >
          <motion.div
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </motion.div>
        </motion.button>

        {/* ── Desktop nav ────────────────────────────── */}
        <div className="hidden items-center gap-6 md:flex">
          {!isAuthenticated && (
            <>
              <AnimNavLink to="/" end>Home</AnimNavLink>
              <AnimNavLink to="/login">Login</AnimNavLink>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                <Link to="/signup" className="btn-secondary px-4 py-2 text-sm">
                  Signup
                </Link>
              </motion.div>
            </>
          )}
          {isAuthenticated && (
            <>
              <AnimNavLink to="/" end>Home</AnimNavLink>

              <AnimNavLink to="/games">Games</AnimNavLink>

              <AnimNavLink to="/dashboard">Dashboard</AnimNavLink>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleLogout}
                className="btn-secondary px-4 py-2 text-sm"
              >
                Sign Out
              </motion.button>
            </>
          )}
        </div>
      </nav>

      {/* ── Mobile menu ─────────────────────────────── */}
      <motion.div
        initial={false}
        animate={open ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        className="overflow-hidden border-t md:hidden"
        style={{ borderColor: '#CCFBF1' }}
      >
        <div className="flex flex-col gap-4 px-5 py-4">
          {!isAuthenticated ? (
            <>
              <Link to="/" onClick={() => setOpen(false)} className="text-sm font-medium text-[#6B7280] hover:text-brand-primary transition-colors">Home</Link>
              <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-[#6B7280] hover:text-brand-primary transition-colors">Login</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="text-sm font-semibold text-brand-primary">Signup</Link>
            </>
          ) : (
            <>
              <Link to="/" onClick={() => setOpen(false)} className="text-sm font-medium text-[#6B7280] hover:text-brand-primary transition-colors">Home</Link>
              <Link to="/games" onClick={() => setOpen(false)} className="text-sm font-medium text-[#6B7280] hover:text-brand-primary transition-colors">Games</Link>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="text-sm font-medium text-[#6B7280] hover:text-brand-primary transition-colors">Dashboard</Link>
              <button onClick={handleLogout} className="text-left text-sm font-semibold text-brand-primary">Sign Out</button>
            </>
          )}
        </div>
      </motion.div>
    </motion.header>
  );
}

export default Navbar;
