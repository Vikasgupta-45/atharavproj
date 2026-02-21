import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, User, Scan, Gamepad2, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

const links = [
    { href: '/games/path', label: 'Adventure Path', icon: Compass },
    { href: '/games', label: 'All Games', icon: Home },
    { href: '/games/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/games/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
    const { pathname } = useLocation();

    return (
        <motion.div
            initial={{ x: -64, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-64 h-full bg-white/90 backdrop-blur-xl border-r border-[#CCFBF1] flex flex-col p-4 shadow-lg"
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-2 py-4 mb-6">
                <motion.div
                    whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-gradient-to-br from-[#0D9488] to-[#5EEAD4] text-white p-2.5 rounded-xl shadow-glow"
                >
                    <Gamepad2 size={22} />
                </motion.div>
                <div>
                    <h1 className="text-lg font-extrabold tracking-tight text-gradient">WriteLingo</h1>
                    <p className="text-[10px] font-medium text-gray-400 tracking-widest uppercase">by Sarthak AI</p>
                </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 space-y-1.5">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                        <motion.div key={link.href} whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                            <Link
                                to={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-[#0D9488] to-[#14B8A6] text-white font-medium shadow-glow'
                                    : 'text-gray-500 hover:bg-[#F0FDFA] hover:text-[#0D9488]'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{link.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-indicator"
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    />
                                )}
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="mt-auto px-4 py-4 border-t border-[#CCFBF1]">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#5EEAD4] animate-pulse-glow" />
                    <span className="text-xs text-gray-400 font-medium">WriteLingo v2.0</span>
                </div>
            </div>
        </motion.div>
    );
}
