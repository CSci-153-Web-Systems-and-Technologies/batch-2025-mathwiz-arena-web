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

        // Remove any existing theme class first
        root.classList.remove("light", "dark");

        if (savedTheme === "dark") {
            root.classList.add("dark");
        } else if (savedTheme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            root.classList.add(systemTheme);
        } else {
            // Default to light
            root.classList.add("light");
        }
    }, []);

    // Listen for storage changes (when theme is changed in another tab)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "mathlete-theme") {
                const newTheme = e.newValue as Theme;
                const root = document.documentElement;
                root.classList.remove("light", "dark");

                if (newTheme === "dark") {
                    root.classList.add("dark");
                } else if (newTheme === "system") {
                    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                    root.classList.add(systemTheme);
                } else {
                    root.classList.add("light");
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
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
            try {
                const theme = localStorage.getItem('mathlete-theme');
                const root = document.documentElement;
                
                root.classList.remove('light', 'dark');
                
                if (theme === 'dark') {
                    root.classList.add('dark');
                } else if (theme === 'system') {
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        root.classList.add('dark');
                    } else {
                        root.classList.add('light');
                    }
                } else {
                    root.classList.add('light');
                }
            } catch (e) {}
        })();
    `;

    return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
