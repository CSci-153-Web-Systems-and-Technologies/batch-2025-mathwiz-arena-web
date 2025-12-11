"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const errorMessages: Record<string, string> = {
    not_registered: "You are not registered for this competition. Please register first.",
    competition_not_started: "This competition has not started yet. Please wait until the scheduled start time.",
    competition_ended: "This competition has already ended. You can view the results in your history.",
    unauthorized: "You are not authorized to access this competition.",
};

export default function ErrorAlert() {
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const errorCode = searchParams.get("error");
        if (errorCode && errorMessages[errorCode]) {
            setError(errorMessages[errorCode]);
            setIsVisible(true);

            // Auto-dismiss after 10 seconds
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    if (!error || !isVisible) return null;

    return (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in-right">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-red-800">Competition Access Error</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="flex-shrink-0 text-red-400 hover:text-red-600"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
