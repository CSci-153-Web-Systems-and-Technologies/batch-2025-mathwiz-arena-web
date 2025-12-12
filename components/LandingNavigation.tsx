"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LandingNavigation({ children }: { children?: React.ReactNode }) {
    const [activeHash, setActiveHash] = useState("");

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
