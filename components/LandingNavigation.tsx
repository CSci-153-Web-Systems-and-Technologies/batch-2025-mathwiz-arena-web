"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LandingNavigation({ children }: { children?: React.ReactNode }) {
    const [activeHash, setActiveHash] = useState("");
    const [theme, setTheme] = useState("light");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Initialize theme
    useEffect(() => {
        const savedTheme = localStorage.getItem("mathlete-theme");
        if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            setTheme("dark");
            document.documentElement.classList.add("dark");
        } else {
            setTheme("light");
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("mathlete-theme", newTheme);
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    useEffect(() => {
        // Set initial active state based on current hash
        const handleHashChange = () => {
            setActiveHash(window.location.hash || "");
        };

        // Initial check
        handleHashChange();

        // Listen for hash changes
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isMobileMenuOpen && !target.closest('.mobile-menu-container')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen]);

    const navItems = [
        { name: "Home", href: "/" },
        { name: "Features", href: "#info" },
        { name: "About", href: "#about" },
    ];

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-2 text-slate-600 dark:text-slate-400"
                    aria-label="Toggle theme"
                >
                    {theme === "dark" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                {navItems.map((item) => {
                    const isActive =
                        item.href === "/"
                            ? activeHash === ""
                            : activeHash === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setActiveHash(item.href === "/" ? "" : item.href)}
                            className={cn(
                                "px-5 py-2.5 rounded-full transition-all duration-200",
                                isActive
                                    ? "bg-slate-100 text-[#1B2559] dark:bg-slate-800 dark:text-white font-bold"
                                    : "hover:bg-slate-50 hover:text-[#1B2559] dark:hover:bg-slate-800/50 dark:hover:text-white"
                            )}
                        >
                            {item.name}
                        </Link>
                    );
                })}

                {children && <div className="pl-2">{children}</div>}
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-2 mobile-menu-container">
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
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

                {/* Mobile Dropdown Menu */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            {theme === "dark" ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#F49700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <span className="font-medium">Light Mode</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1B2559]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                    <span className="font-medium">Dark Mode</span>
                                </>
                            )}
                        </button>

                        <div className="border-t border-slate-100 dark:border-slate-800 my-2"></div>

                        {/* Navigation Links */}
                        {navItems.map((item) => {
                            const isActive =
                                item.href === "/"
                                    ? activeHash === ""
                                    : activeHash === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => {
                                        setActiveHash(item.href === "/" ? "" : item.href);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 transition-colors",
                                        isActive
                                            ? "bg-slate-50 dark:bg-slate-800 text-[#1B2559] dark:text-white font-bold"
                                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    )}
                                >
                                    {item.name === "Home" && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                    )}
                                    {item.name === "Features" && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    )}
                                    {item.name === "About" && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Login Button (passed as children) */}
                {children}
            </div>
        </>
    );
}

