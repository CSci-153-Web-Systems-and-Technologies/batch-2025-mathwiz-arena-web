"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormData = {
    name: string;
    description: string;
    startDate: string;
    startTime: string;
    durationHours: string;
    durationMinutes: string;
    // Live competition specific
    attemptType: "set" | "unlimited";
    maxAttempts: string;
};

type Props = {
    formData: FormData;
    setFormData: (data: FormData) => void;
    isLoading: boolean;
    competitionMode: "scheduled" | "live";
};

export default function CompetitionDetailsStep({ formData, setFormData, isLoading, competitionMode }: Props) {
    return (
        <div className="space-y-6">
            {/* Mode indicator */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${competitionMode === "scheduled"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}>
                {competitionMode === "scheduled" ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Scheduled Competition
                    </>
                ) : (
                    <>
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Live Competition
                    </>
                )}
            </div>

            {/* Competition Name */}
            <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">
                    Competition Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Math Olympiad 2025"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full"
                    required
                    disabled={isLoading}
                />
                <p className="text-sm text-slate-500">Give your competition a clear and descriptive name</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700 font-medium">
                    Description
                </Label>
                <textarea
                    id="description"
                    placeholder="Describe your competition, its goals, and what participants can expect..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full min-h-[120px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    disabled={isLoading}
                />
                <p className="text-sm text-slate-500">Optional: Add details about the competition</p>
            </div>

            {/* Scheduled: Start Date and Time */}
            {competitionMode === "scheduled" && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-slate-700 font-medium">
                            Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full"
                            required
                            disabled={isLoading}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="startTime" className="text-slate-700 font-medium">
                            Start Time <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="startTime"
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            className="w-full"
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>
            )}

            {/* Duration (for both modes) */}
            <div className="space-y-2">
                <Label className="text-slate-700 font-medium">
                    {competitionMode === "scheduled" ? "Duration" : "Time Limit per Attempt"} <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="durationHours" className="text-sm text-slate-600">
                            Hours
                        </Label>
                        <Input
                            id="durationHours"
                            type="number"
                            placeholder="0"
                            value={formData.durationHours}
                            onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                            className="w-full"
                            min="0"
                            max="48"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="durationMinutes" className="text-sm text-slate-600">
                            Minutes
                        </Label>
                        <Input
                            id="durationMinutes"
                            type="number"
                            placeholder="0"
                            value={formData.durationMinutes}
                            onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                            className="w-full"
                            min="0"
                            max="59"
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <p className="text-sm text-slate-500">
                    {competitionMode === "scheduled"
                        ? "Set how long the competition will run (e.g., 2 hours 30 minutes)"
                        : "Set how long each attempt will last (e.g., 30 minutes per attempt)"
                    }
                </p>
            </div>

            {/* Live: Attempt Settings */}
            {competitionMode === "live" && (
                <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                        <Label className="text-slate-700 font-medium mb-3 block">
                            Attempt Settings <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, attemptType: "set", maxAttempts: formData.maxAttempts || "3" })}
                                disabled={isLoading}
                                className={`p-4 rounded-lg border-2 text-left transition-all ${formData.attemptType === "set"
                                        ? "border-purple-500 bg-purple-50"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.attemptType === "set" ? "border-purple-600" : "border-slate-300"
                                        }`}>
                                        {formData.attemptType === "set" && (
                                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                        )}
                                    </div>
                                    <span className="font-medium text-slate-800">Set Attempts</span>
                                </div>
                                <p className="text-xs text-slate-500 ml-6">
                                    Limit to specific number (e.g., "2/3")
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, attemptType: "unlimited", maxAttempts: "" })}
                                disabled={isLoading}
                                className={`p-4 rounded-lg border-2 text-left transition-all ${formData.attemptType === "unlimited"
                                        ? "border-purple-500 bg-purple-50"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.attemptType === "unlimited" ? "border-purple-600" : "border-slate-300"
                                        }`}>
                                        {formData.attemptType === "unlimited" && (
                                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                        )}
                                    </div>
                                    <span className="font-medium text-slate-800">Unlimited</span>
                                </div>
                                <p className="text-xs text-slate-500 ml-6">
                                    No limit (e.g., "7 attempts")
                                </p>
                            </button>
                        </div>
                    </div>

                    {/* Max attempts input (only for "set" type) */}
                    {formData.attemptType === "set" && (
                        <div className="space-y-2">
                            <Label htmlFor="maxAttempts" className="text-slate-700 font-medium">
                                Maximum Attempts <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="maxAttempts"
                                type="number"
                                placeholder="3"
                                value={formData.maxAttempts}
                                onChange={(e) => setFormData({ ...formData, maxAttempts: e.target.value })}
                                className="w-full max-w-[150px]"
                                min="1"
                                max="100"
                                disabled={isLoading}
                            />
                            <p className="text-sm text-slate-500">
                                Each participant can compete up to {formData.maxAttempts || "N"} times
                            </p>
                        </div>
                    )}

                    {/* Info about best score tracking */}
                    <div className="flex items-start gap-2 text-sm text-purple-700 bg-purple-50 p-3 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                            <strong>Best score tracked:</strong> The leaderboard will show each participant's highest score across all their attempts.
                        </span>
                    </div>
                </div>
            )}

            {/* Preview - Scheduled */}
            {competitionMode === "scheduled" && formData.startDate && formData.startTime && (formData.durationHours || formData.durationMinutes) && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-purple-800">Competition Schedule</p>
                            <p className="text-sm text-purple-700 mt-1">
                                <span className="font-medium">Starts:</span> {new Date(`${formData.startDate}T${formData.startTime}`).toLocaleString('en-US', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                })}
                            </p>
                            <p className="text-sm text-purple-700">
                                <span className="font-medium">Ends:</span> {new Date(
                                    new Date(`${formData.startDate}T${formData.startTime}`).getTime() +
                                    ((parseInt(formData.durationHours) || 0) * 60 + (parseInt(formData.durationMinutes) || 0)) * 60000
                                ).toLocaleString('en-US', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview - Live */}
            {competitionMode === "live" && (formData.durationHours || formData.durationMinutes) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-green-800">Live Competition Settings</p>
                            <p className="text-sm text-green-700 mt-1">
                                <span className="font-medium">Time per attempt:</span> {
                                    ((parseInt(formData.durationHours) || 0) > 0 ? `${formData.durationHours} hour${parseInt(formData.durationHours) !== 1 ? 's' : ''} ` : '') +
                                    ((parseInt(formData.durationMinutes) || 0) > 0 ? `${formData.durationMinutes} minute${parseInt(formData.durationMinutes) !== 1 ? 's' : ''}` : '')
                                }
                            </p>
                            <p className="text-sm text-green-700">
                                <span className="font-medium">Attempts:</span> {
                                    formData.attemptType === "unlimited"
                                        ? "Unlimited"
                                        : `${formData.maxAttempts || "N"} attempts max`
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
