import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import CinematicLoader from './components/CinematicLoader';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ThreeBackground from './components/ThreeBackground';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GameDashboard from './games/pages/Dashboard';
import GameLeaderboard from './games/pages/Leaderboard';
import GameProfile from './games/pages/Profile';
import GameSession from './games/pages/GameSession';
import StoryPath from './games/pages/StoryPath';
import GameLayout from './games/components/GameLayout';

/* ─── Per-route animation variants ────────────────────────────────────────
   Each route gets its own distinct enter/exit animation style.           */
const pageVariants = {
  '/': {
    initial: { opacity: 0, scale: 0.97, filter: 'blur(6px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 1.02, filter: 'blur(4px)' },
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  '/login': {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -60 },
    transition: { duration: 0.38, ease: 'easeInOut' },
  },
  '/signup': {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 60 },
    transition: { duration: 0.38, ease: 'easeInOut' },
  },
  '/dashboard': {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.40, ease: 'easeOut' },
  },
};

const defaultVariant = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: 'easeOut' },
};

function App() {
  const [showLoader, setShowLoader] = useState(true);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const handleLoaderComplete = useCallback(() => setShowLoader(false), []);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let rafId;
    const raf = (time) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
    rafId = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(rafId); lenis.destroy(); };
  }, []);

  const v = pageVariants[location.pathname] ?? defaultVariant;

  return (
    <div className="app-shell overflow-x-hidden">
      <ThreeBackground />

      <AnimatePresence>
        {showLoader && <CinematicLoader onComplete={handleLoaderComplete} />}
      </AnimatePresence>

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: showLoader ? 0 : 1 }}
        transition={{ duration: 0.45, ease: 'easeIn' }}
      >
        <Navbar />

        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={v.initial}
            animate={v.animate}
            exit={v.exit}
            transition={v.transition}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
              <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />} />
              <Route
                path="/dashboard"
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
              />
              {/* Game Routes */}
              <Route path="/games" element={<ProtectedRoute><GameLayout><GameDashboard /></GameLayout></ProtectedRoute>} />
              <Route path="/games/leaderboard" element={<ProtectedRoute><GameLayout><GameLeaderboard /></GameLayout></ProtectedRoute>} />
              <Route path="/games/profile" element={<ProtectedRoute><GameLayout><GameProfile /></GameLayout></ProtectedRoute>} />
              <Route path="/games/path" element={<GameLayout><StoryPath /></GameLayout>} />
              <Route path="/games/play/:game" element={<GameLayout><GameSession /></GameLayout>} />

              <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />} />
            </Routes>
          </motion.main>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default App;
