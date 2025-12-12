"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LandingNavigation({ children }: { children?: React.ReactNode }) {
    const [activeHash, setActiveHash] = useState("");
    const [theme, setTheme] = useState("light");

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

    const navItems = [
        { name: "Home", href: "/" },
        { name: "Features", href: "#info" },
        { name: "About", href: "#about" },
    ];

    return (
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
    );
}
