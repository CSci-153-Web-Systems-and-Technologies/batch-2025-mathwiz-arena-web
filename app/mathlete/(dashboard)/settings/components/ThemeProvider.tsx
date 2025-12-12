"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Get saved theme from localStorage
        const savedTheme = localStorage.getItem("mathlete-theme") as Theme;
        const root = document.documentElement;

        if (savedTheme === "dark") {
            root.classList.add("dark");
        } else if (savedTheme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            if (systemTheme === "dark") {
                root.classList.add("dark");
            }
        }
        // Default is light, so no class needed
    }, []);

    // Prevent flash of wrong theme
    if (!mounted) {
        return <>{children}</>;
    }

    return <>{children}</>;
}

export function ThemeScript() {
    // This script runs before React hydration to prevent flash
    const script = `
        (function() {
            const theme = localStorage.getItem('mathlete-theme');
            const root = document.documentElement;
            
            if (theme === 'dark') {
                root.classList.add('dark');
            } else if (theme === 'system') {
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    root.classList.add('dark');
                }
            }
        })();
    `;

    return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
