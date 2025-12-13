"use client";

type Props = {
    competitionMode: "scheduled" | "live";
    setCompetitionMode: (mode: "scheduled" | "live") => void;
    isLoading: boolean;
    isEditing: boolean;
};

export default function CompetitionModeStep({
    competitionMode,
    setCompetitionMode,
    isLoading,
    isEditing
}: Props) {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Choose Competition Type
                </h3>
                <p className="text-sm text-slate-600">
                    Select how participants will join and compete in this competition
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scheduled Competition Option */}
                <button
                    type="button"
                    onClick={() => setCompetitionMode("scheduled")}
                    disabled={isLoading || isEditing}
                    className={`relative p-6 rounded-xl border-2 text-left transition-all ${competitionMode === "scheduled"
                            ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        } ${isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                    {/* Selected indicator */}
                    {competitionMode === "scheduled" && (
                        <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${competitionMode === "scheduled" ? "bg-purple-100" : "bg-slate-100"
                        }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 ${competitionMode === "scheduled" ? "text-purple-600" : "text-slate-500"
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h4 className={`text-lg font-semibold mb-2 ${competitionMode === "scheduled" ? "text-purple-800" : "text-slate-800"
                        }`}>
                        Scheduled Competition
                    </h4>

                    {/* Description */}
                    <p className="text-sm text-slate-600 mb-4">
                        Set a specific date and time. All participants compete during the same scheduled window.
                    </p>

                    {/* Features */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Fixed start date and time
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Pre-registration required
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Single attempt per participant
                        </div>
                    </div>
                </button>

                {/* Live Competition Option */}
                <button
                    type="button"
                    onClick={() => setCompetitionMode("live")}
                    disabled={isLoading || isEditing}
                    className={`relative p-6 rounded-xl border-2 text-left transition-all ${competitionMode === "live"
                            ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        } ${isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                    {/* Selected indicator */}
                    {competitionMode === "live" && (
                        <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${competitionMode === "live" ? "bg-purple-100" : "bg-slate-100"
                        }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 ${competitionMode === "live" ? "text-purple-600" : "text-slate-500"
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h4 className={`text-lg font-semibold mb-2 ${competitionMode === "live" ? "text-purple-800" : "text-slate-800"
                        }`}>
                        Live Competition
                    </h4>

                    {/* Description */}
                    <p className="text-sm text-slate-600 mb-4">
                        Participants can register and start competing immediately, anytime the competition is active.
                    </p>

                    {/* Features */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Start anytime after registration
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Set or unlimited attempts
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Best score tracked
                        </div>
                    </div>

                    {/* Live badge */}
                    <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Available 24/7
                    </div>
                </button>
            </div>

            {/* Info note for editing */}
            {isEditing && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Competition mode cannot be changed after creation.</span>
                </div>
            )}
        </div>
    );
}
