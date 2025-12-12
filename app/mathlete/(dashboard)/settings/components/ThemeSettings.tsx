"use client";

import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeOption {
    value: Theme;
    label: string;
    icon: React.ReactNode;
    description: string;
}

const themeOptions: ThemeOption[] = [
    {
        value: "light",
        label: "Light",
        description: "Always use light mode",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
    },
    {
        value: "dark",
        label: "Dark",
        description: "Always use dark mode",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
        ),
    },
    {
        value: "system",
        label: "System",
        description: "Match your device settings",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
    },
];

export default function ThemeSettings() {
    const [theme, setTheme] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    // Load saved theme on mount
    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("mathlete-theme") as Theme;
        if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
            setTheme(savedTheme);
        }
    }, []);

    // Apply theme when it changes
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            root.classList.remove("light", "dark");
            root.classList.add(systemTheme);
        } else {
            root.classList.remove("light", "dark");
            root.classList.add(theme);
        }

        localStorage.setItem("mathlete-theme", theme);
    }, [theme, mounted]);

    // Listen for system theme changes when using system preference
    useEffect(() => {
        if (theme !== "system") return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            const root = document.documentElement;
            root.classList.remove("light", "dark");
            root.classList.add(e.matches ? "dark" : "light");
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
    };

    if (!mounted) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm animate-pulse">
                <div className="px-6 py-4 border-b border-slate-200">
                    <div className="h-6 bg-slate-200 rounded w-32"></div>
                    <div className="h-4 bg-slate-100 rounded w-48 mt-2"></div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Appearance</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Customize how MathWiz Arena looks for you
                </p>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {themeOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleThemeChange(option.value)}
                            className={`relative p-4 rounded-xl border-2 transition-all text-left ${theme === option.value
                                    ? "border-[#25346A] bg-[#25346A]/5 dark:bg-[#25346A]/20"
                                    : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                                }`}
                        >
                            {/* Selected indicator */}
                            {theme === option.value && (
                                <div className="absolute top-2 right-2">
                                    <div className="w-5 h-5 rounded-full bg-[#25346A] flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {/* Icon */}
                            <div className={`mb-3 ${theme === option.value
                                    ? "text-[#25346A] dark:text-blue-400"
                                    : "text-slate-400 dark:text-slate-500"
                                }`}>
                                {option.icon}
                            </div>

                            {/* Label */}
                            <h3 className={`font-semibold ${theme === option.value
                                    ? "text-[#25346A] dark:text-white"
                                    : "text-slate-700 dark:text-slate-300"
                                }`}>
                                {option.label}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {option.description}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Preview Section */}
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium text-slate-900 dark:text-white">Preview:</span> This is how your interface will look with the selected theme.
                    </p>
                </div>
            </div>
        </div>
    );
}
