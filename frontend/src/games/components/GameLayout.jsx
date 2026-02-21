import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

export default function GameLayout({ children }) {
    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#F0FDFA]">
            <Sidebar />
            <main className="flex-1 overflow-y-auto" data-lenis-prevent>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
