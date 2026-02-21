"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, User, BookOpen } from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Dashboard", icon: Home },
        { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
        { href: "/profile", label: "Profile", icon: User },
    ];

    return (
        <div className="w-64 h-full bg-surface border-r border-gray-200 flex flex-col p-4 shadow-sm">
            <div className="flex items-center gap-3 px-2 py-4 mb-6">
                <div className="bg-brand text-brand-dark p-2 rounded-lg">
                    <BookOpen size={24} className="text-white" />
                </div>
                <h1 className="text-xl font-bold font-sans text-gray-800 tracking-tight">WriteLingo</h1>
            </div>

            <nav className="flex-1 space-y-2">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                                    ? "bg-brand text-brand-dark font-medium shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <Icon size={20} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto px-4 py-4 border-t border-gray-100">
                <div className="text-sm text-gray-400 font-medium">WriteLingo v2.0</div>
            </div>
        </div>
    );
}
