"use client";

import { useState } from "react";
import { toggleLiveCompetition } from "../actions";
import { Button } from "@/components/ui/button";

type Props = {
    competitionId: string;
    competitionName: string;
    isActive: boolean;
};

export default function StopCompetitionButton({ competitionId, competitionName, isActive }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleToggle = async () => {
        setIsLoading(true);
        setError(null);

        const result = await toggleLiveCompetition(competitionId, !isActive);

        if (!result.success) {
            setError(result.error || "Failed to update competition status");
            setIsLoading(false);
        } else {
            setShowConfirm(false);
            setIsLoading(false);
        }
    };

    if (showConfirm) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full ${isActive ? 'bg-orange-100' : 'bg-green-100'} flex items-center justify-center`}>
                            {isActive ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                {isActive ? "Stop Competition" : "Resume Competition"}
                            </h3>
                            <p className="text-sm text-slate-600 mb-1">
                                Are you sure you want to {isActive ? "stop" : "resume"} <span className="font-semibold text-slate-800">{competitionName}</span>?
                            </p>
                            {isActive ? (
                                <p className="text-sm text-slate-600">
                                    This will hide the competition from mathletes and prevent new attempts. Existing attempts in progress will still be allowed to complete.
                                </p>
                            ) : (
                                <p className="text-sm text-slate-600">
                                    This will make the competition visible to mathletes again and allow new attempts.
                                </p>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowConfirm(false);
                                setError(null);
                            }}
                            disabled={isLoading}
                            className="font-medium"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleToggle}
                            disabled={isLoading}
                            className={`${isActive ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white font-medium`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {isActive ? "Stopping..." : "Resuming..."}
                                </>
                            ) : (
                                isActive ? "Stop Competition" : "Resume Competition"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Button appearance based on active status
    if (isActive) {
        return (
            <button
                onClick={() => setShowConfirm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Stop
            </button>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Resume
        </button>
    );
}
