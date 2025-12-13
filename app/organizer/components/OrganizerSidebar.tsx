"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LoginButton from "@/components/LoginLogoutButton";

interface OrganizerSidebarProps {
    notificationCount?: number;
}

export default function OrganizerSidebar({ notificationCount = 0 }: OrganizerSidebarProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isMobileMenuOpen && !target.closest('.sidebar-container') && !target.closest('.mobile-menu-button')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const isActive = (path: string) => {
        if (path === "/organizer") {
            return pathname === "/organizer";
        }
        return pathname.startsWith(path);
    };

    const navItems = [
        {
            href: "/organizer",
            label: "Dashboard",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            href: "/organizer/notifications",
            label: "Notifications",
            badge: notificationCount,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            ),
        },
        {
            href: "/organizer/problem-bank",
            label: "Problem Bank",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
        {
            href: "/organizer/competition",
            label: "Competition",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
            ),
        },
        {
            href: "/organizer/profile",
            label: "Profile",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
        {
            href: "/organizer/settings",
            label: "Settings",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
        {
            href: "/organizer/history",
            label: "History",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    ];


    const SidebarContent = ({ showCloseButton = false }: { showCloseButton?: boolean }) => (
        <div className="p-4 md:p-6">
            {/* Close button for mobile */}
            {showCloseButton && (
                <div className="flex justify-end mb-2 -mr-1">
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Close menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <Link href="/" className="flex items-center gap-3 mb-8">
                <Image src="/icon.svg" alt="Mathwiz Logo" width={40} height={40} className="rounded-md" />
                <div>
                    <h1 className="text-lg font-semibold text-slate-800 dark:text-white">Mathwiz</h1>
                    <p className="text-xs text-[#f49700] font-medium">Organizer</p>
                </div>
            </Link>

            <nav className="space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive(item.href)
                            ? "text-white bg-[#f49700]"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#f49700] dark:hover:text-[#f49700]"
                            }`}
                    >
                        {item.icon}
                        <span className="flex-1">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                                {item.badge > 9 ? "9+" : item.badge}
                            </span>
                        )}
                    </Link>
                ))}



                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                    <LoginButton className="w-full" />
                </div>
            </nav>
        </div>
    );

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="mobile-menu-button p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/icon.svg" alt="Mathwiz Logo" width={32} height={32} className="rounded-md" />
                    <div>
                        <h1 className="text-base font-semibold text-slate-800 dark:text-white">Mathwiz</h1>
                        <p className="text-[10px] text-[#f49700] font-medium -mt-1">Organizer</p>
                    </div>
                </Link>
            </div>

            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`sidebar-container lg:hidden fixed top-0 left-0 h-full w-56 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <SidebarContent showCloseButton={true} />
            </aside>

            {/* Desktop Sidebar */}
            <aside className="sidebar-container hidden lg:block w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed h-full overflow-y-auto transition-colors">
                <SidebarContent />
            </aside>
        </>
    );
}
