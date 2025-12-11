"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import CompetitionDetailsStep from "./CompetitionDetailsStep";
import ParticipationSettingsStep from "./ParticipationSettingsStep";
import ProblemsPointsStep from "./ProblemsPointsStep";

type Problem = {
    id: string;
    question: string;
    type: string;
    difficulty: string;
    correct_answer: string;
    options: string[] | null;
    problem_bank_id: string;
};

type SelectedProblem = {
    problem: Problem;
    points: number | null;
    orderIndex: number;
};

type CompetitionData = {
    id: string;
    name: string;
    description: string | null;
    start_datetime: string;
    duration_minutes: number;
    participation_type: "individual" | "team";
    max_participants: number | null;
    max_teams: number | null;
    max_team_members: number | null;
    point_system_type: "auto_level" | "manual";
    easy_points: number | null;
    average_points: number | null;
    difficult_points: number | null;
    status: string;
};

type CompetitionProblem = {
    points: number;
    order_index: number;
    problems: Problem;
};

type Props = {
    competitionData?: CompetitionData | null;
    competitionProblems?: CompetitionProblem[] | null;
};

export default function CreateCompetitionForm({ competitionData, competitionProblems }: Props) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedProblems, setSelectedProblems] = useState<SelectedProblem[]>([]);
    const [showReview, setShowReview] = useState(false);
    const [competitionId, setCompetitionId] = useState<string | null>(null);
    const [originalStatus, setOriginalStatus] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        startDate: "",
        startTime: "",
        durationHours: "",
        durationMinutes: "",
        participationType: "individual" as "individual" | "team",
        hasMaxParticipants: false,
        maxParticipants: "",
        hasMaxTeams: false,
        maxTeams: "",
        maxTeamMembers: "",
        requireFullTeam: false,
        pointSystemType: "auto_level" as "auto_level" | "manual",
        easyPoints: "",
        averagePoints: "",
        difficultPoints: "",
    });

    // Initialize form with existing competition data
    useEffect(() => {
        if (competitionData) {
            const startDateTime = new Date(competitionData.start_datetime);
            const hours = Math.floor(competitionData.duration_minutes / 60);
            const minutes = competitionData.duration_minutes % 60;

            setFormData({
                name: competitionData.name,
                description: competitionData.description || "",
                startDate: startDateTime.toISOString().split("T")[0],
                startTime: startDateTime.toTimeString().slice(0, 5),
                durationHours: hours.toString(),
                durationMinutes: minutes.toString(),
                participationType: competitionData.participation_type,
                hasMaxParticipants: competitionData.max_participants !== null,
                maxParticipants: competitionData.max_participants?.toString() || "",
                hasMaxTeams: competitionData.max_teams !== null,
                maxTeams: competitionData.max_teams?.toString() || "",
                maxTeamMembers: competitionData.max_team_members?.toString() || "",
                requireFullTeam: (competitionData as any).require_full_team || false,
                pointSystemType: competitionData.point_system_type,
                easyPoints: competitionData.easy_points?.toString() || "",
                averagePoints: competitionData.average_points?.toString() || "",
                difficultPoints: competitionData.difficult_points?.toString() || "",
            });
            setCompetitionId(competitionData.id);
            setOriginalStatus(competitionData.status);
        }
    }, [competitionData]);

    // Initialize selected problems with existing competition problems
    useEffect(() => {
        if (competitionProblems && competitionProblems.length > 0) {
            const loadedProblems: SelectedProblem[] = competitionProblems.map((cp, index) => ({
                problem: cp.problems,
                points: cp.points,
                orderIndex: index,
            }));
            setSelectedProblems(loadedProblems);
        }
    }, [competitionProblems]);

    const validateStep1 = (): boolean => {
        if (!formData.name.trim()) {
            setError("Please enter a competition name");
            return false;
        }
        if (formData.name.trim().length < 3) {
            setError("Competition name must be at least 3 characters long");
            return false;
        }
        if (!formData.startDate || !formData.startTime) {
            setError("Please set the start date and time");
            return false;
        }
        const hours = parseInt(formData.durationHours) || 0;
        const minutes = parseInt(formData.durationMinutes) || 0;
        if (hours === 0 && minutes === 0) {
            setError("Please set a duration for the competition");
            return false;
        }
        return true;
    };

    const validateStep2 = (): boolean => {
        if (formData.participationType === "individual") {
            if (formData.hasMaxParticipants && !formData.maxParticipants) {
                setError("Please enter the maximum number of participants");
                return false;
            }
        } else {
            if (!formData.maxTeamMembers || parseInt(formData.maxTeamMembers) < 2) {
                setError("Please set the maximum team members (minimum 2)");
                return false;
            }
            if (formData.hasMaxTeams && !formData.maxTeams) {
                setError("Please enter the maximum number of teams");
                return false;
            }
        }
        return true;
    };

    const validateStep3 = (): boolean => {
        if (formData.pointSystemType === "auto_level") {
            if (!formData.easyPoints || !formData.averagePoints || !formData.difficultPoints) {
                setError("Please set points for all difficulty levels");
                return false;
            }
        }
        if (selectedProblems.length === 0) {
            setError("Please select at least one problem for the competition");
            return false;
        }
        if (formData.pointSystemType === "manual") {
            const hasInvalidPoints = selectedProblems.some(sp => sp.points === null || sp.points === 0);
            if (hasInvalidPoints) {
                setError("Please assign points to all selected problems");
                return false;
            }
        }
        return true;
    };

    const handleNextStep = () => {
        setError(null);

        if (currentStep === 1 && !validateStep1()) {
            return;
        }
        if (currentStep === 2 && !validateStep2()) {
            return;
        }

        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const handlePreviousStep = () => {
        setError(null);
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate final step
        if (!validateStep3()) {
            return;
        }

        // Show review screen
        setShowReview(true);
    };

    const handleSaveCompetition = async (status: "draft" | "published") => {
        setIsLoading(true);
        setError(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError("You must be logged in to create a competition");
                setIsLoading(false);
                return;
            }

            // Prepare start datetime
            const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
            const hours = parseInt(formData.durationHours) || 0;
            const minutes = parseInt(formData.durationMinutes) || 0;
            const totalMinutes = hours * 60 + minutes;

            // For drafts with auto_level, check if points are filled, otherwise use manual to avoid constraint violation
            const hasAutoLevelPoints = formData.easyPoints && formData.averagePoints && formData.difficultPoints;
            const effectivePointSystemType = formData.pointSystemType === "auto_level" && !hasAutoLevelPoints && status === "draft"
                ? "manual"
                : formData.pointSystemType;

            // Create competition payload
            const competitionPayload = {
                organizer_id: user.id,
                name: formData.name.trim(),
                description: formData.description.trim() || null,
                start_datetime: startDateTime.toISOString(),
                duration_minutes: totalMinutes,
                participation_type: formData.participationType,
                max_participants: formData.participationType === "individual" && formData.hasMaxParticipants
                    ? parseInt(formData.maxParticipants)
                    : null,
                max_teams: formData.participationType === "team" && formData.hasMaxTeams
                    ? parseInt(formData.maxTeams)
                    : null,
                max_team_members: formData.participationType === "team" && formData.maxTeamMembers
                    ? parseInt(formData.maxTeamMembers)
                    : null,
                require_full_team: formData.participationType === "team" ? formData.requireFullTeam : false,
                point_system_type: effectivePointSystemType,
                easy_points: effectivePointSystemType === "auto_level" && formData.easyPoints ? parseInt(formData.easyPoints) : null,
                average_points: effectivePointSystemType === "auto_level" && formData.averagePoints ? parseInt(formData.averagePoints) : null,
                difficult_points: effectivePointSystemType === "auto_level" && formData.difficultPoints ? parseInt(formData.difficultPoints) : null,
                status: status,
            };

            let competition;

            if (competitionId) {
                // Update existing competition
                const { data, error: competitionError } = await supabase
                    .from("competitions")
                    .update(competitionPayload)
                    .eq("id", competitionId)
                    .select()
                    .single();

                if (competitionError) {
                    console.error("Error updating competition:", competitionError);
                    setError(`Failed to update competition: ${competitionError.message}`);
                    setIsLoading(false);
                    return;
                }

                competition = data;

                // Delete existing competition problems
                await supabase
                    .from("competition_problems")
                    .delete()
                    .eq("competition_id", competitionId);
            } else {
                // Create new competition
                const { data, error: competitionError } = await supabase
                    .from("competitions")
                    .insert([competitionPayload])
                    .select()
                    .single();

                if (competitionError) {
                    console.error("Error creating competition:", competitionError);
                    setError(`Failed to create competition: ${competitionError.message}`);
                    setIsLoading(false);
                    return;
                }

                competition = data;
            }

            // Insert competition problems (only if there are selected problems)
            if (selectedProblems.length > 0) {
                const problemsToInsert = selectedProblems.map(sp => ({
                    competition_id: competition.id,
                    problem_id: sp.problem.id,
                    points: sp.points,
                    order_index: sp.orderIndex,
                }));

                const { error: problemsError } = await supabase
                    .from("competition_problems")
                    .insert(problemsToInsert);

                if (problemsError) {
                    console.error("Error adding problems to competition:", problemsError);
                    setError(`Competition created but failed to add problems: ${problemsError.message}`);
                    setIsLoading(false);
                    return;
                }
            }

            // Success! Redirect to admin competitions page
            router.push("/admin/competition");
            router.refresh();
        } catch (err: any) {
            console.error("Unexpected error:", err);
            setError(`An unexpected error occurred: ${err?.message || "Unknown error"}`);
            setIsLoading(false);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "easy": return "bg-green-100 text-green-700 border-green-200";
            case "average": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "difficult": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "multiple_choice": return "Multiple Choice";
            case "true_false": return "True/False";
            case "identification": return "Identification";
            default: return type;
        }
    };

    // If showing review, display review screen
    if (showReview) {
        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
        const hours = parseInt(formData.durationHours) || 0;
        const minutes = parseInt(formData.durationMinutes) || 0;
        const totalMinutes = hours * 60 + minutes;
        const endDateTime = new Date(startDateTime.getTime() + totalMinutes * 60000);

        return (
            <div className="space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Review Competition</h2>
                        <p className="text-sm text-slate-600 mt-1">Review all details before saving or publishing</p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowReview(false)}
                        disabled={isLoading}
                        className="font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                        </svg>
                        Back to Edit
                    </Button>
                </div>

                {/* Basic Information Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h3>
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                            <p className="text-sm text-slate-600">Competition Name</p>
                            <p className="col-span-2 text-sm text-slate-800 font-medium">{formData.name}</p>
                        </div>
                        {formData.description && (
                            <div className="grid grid-cols-3 gap-2">
                                <p className="text-sm text-slate-600">Description</p>
                                <p className="col-span-2 text-sm text-slate-800">{formData.description}</p>
                            </div>
                        )}
                        <div className="grid grid-cols-3 gap-2">
                            <p className="text-sm text-slate-600">Start Date & Time</p>
                            <p className="col-span-2 text-sm text-slate-800 font-medium">
                                {startDateTime.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <p className="text-sm text-slate-600">End Date & Time</p>
                            <p className="col-span-2 text-sm text-slate-800 font-medium">
                                {endDateTime.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <p className="text-sm text-slate-600">Duration</p>
                            <p className="col-span-2 text-sm text-slate-800 font-medium">
                                {hours > 0 && `${hours} hour${hours !== 1 ? 's' : ''}`}
                                {hours > 0 && minutes > 0 && ' '}
                                {minutes > 0 && `${minutes} minute${minutes !== 1 ? 's' : ''}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Participation Settings Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Participation Settings</h3>
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                            <p className="text-sm text-slate-600">Participation Type</p>
                            <p className="col-span-2 text-sm text-slate-800 font-medium capitalize">{formData.participationType}</p>
                        </div>
                        {formData.participationType === "individual" && formData.hasMaxParticipants && (
                            <div className="grid grid-cols-3 gap-2">
                                <p className="text-sm text-slate-600">Max Participants</p>
                                <p className="col-span-2 text-sm text-slate-800 font-medium">{formData.maxParticipants}</p>
                            </div>
                        )}
                        {formData.participationType === "team" && (
                            <>
                                <div className="grid grid-cols-3 gap-2">
                                    <p className="text-sm text-slate-600">Max Team Members</p>
                                    <p className="col-span-2 text-sm text-slate-800 font-medium">{formData.maxTeamMembers}</p>
                                </div>
                                {formData.hasMaxTeams && (
                                    <div className="grid grid-cols-3 gap-2">
                                        <p className="text-sm text-slate-600">Max Teams</p>
                                        <p className="col-span-2 text-sm text-slate-800 font-medium">{formData.maxTeams}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Point System Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Point System</h3>
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                            <p className="text-sm text-slate-600">Point System Type</p>
                            <p className="col-span-2 text-sm text-slate-800 font-medium">
                                {formData.pointSystemType === "auto_level" ? "Auto-Level Points" : "Manual Points"}
                            </p>
                        </div>
                        {formData.pointSystemType === "auto_level" && (
                            <div className="grid grid-cols-3 gap-2">
                                <p className="text-sm text-slate-600">Points by Difficulty</p>
                                <div className="col-span-2 text-sm">
                                    <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 mr-2">Easy: {formData.easyPoints} pts</span>
                                    <span className="inline-block px-2 py-1 rounded bg-yellow-100 text-yellow-700 mr-2">Average: {formData.averagePoints} pts</span>
                                    <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-700">Difficult: {formData.difficultPoints} pts</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Problems Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                        Problems ({selectedProblems.length})
                    </h3>
                    <div className="space-y-3">
                        {selectedProblems.map((sp, index) => (
                            <div key={sp.problem.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-700">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-xs font-medium px-2 py-1 rounded border capitalize ${getDifficultyColor(sp.problem.difficulty)}`}>
                                                {sp.problem.difficulty}
                                            </span>
                                            <span className="text-xs text-slate-500 font-medium">{getTypeLabel(sp.problem.type)}</span>
                                            <span className="text-xs font-semibold text-purple-600">{sp.points} pts</span>
                                        </div>
                                        <p className="text-sm text-slate-800 mb-2">{sp.problem.question}</p>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-slate-600 font-medium">Correct Answer:</span>
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                                                {sp.problem.correct_answer}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 font-medium">Total Points:</span>
                            <span className="text-lg font-bold text-purple-600">
                                {selectedProblems.reduce((sum, sp) => sum + (sp.points || 0), 0)} points
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <Button
                        onClick={() => handleSaveCompetition("published")}
                        disabled={isLoading}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {originalStatus === "published" ? "Updating..." : "Publishing..."}
                            </>
                        ) : (
                            originalStatus === "published" ? "Update Competition" : "Publish Competition"
                        )}
                    </Button>
                    {originalStatus !== "published" && (
                        <Button
                            onClick={() => handleSaveCompetition("draft")}
                            disabled={isLoading}
                            variant="outline"
                            className="font-medium"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                "Save as Draft"
                            )}
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    // Regular multi-step form view
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Step Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${currentStep >= step
                                            ? "bg-purple-600 text-white"
                                            : "bg-slate-200 text-slate-500"
                                        }`}
                                >
                                    {step}
                                </div>
                                <p className={`text-xs mt-2 font-medium transition-colors ${currentStep >= step ? "text-purple-600" : "text-slate-500"
                                    }`}>
                                    {step === 1 && "Competition Details"}
                                    {step === 2 && "Participation Settings"}
                                    {step === 3 && "Problems & Points"}
                                </p>
                            </div>
                            {step < 3 && (
                                <div
                                    className={`h-1 flex-1 mx-2 rounded transition-colors ${currentStep > step ? "bg-purple-600" : "bg-slate-200"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
                {currentStep === 1 && (
                    <CompetitionDetailsStep
                        formData={{
                            name: formData.name,
                            description: formData.description,
                            startDate: formData.startDate,
                            startTime: formData.startTime,
                            durationHours: formData.durationHours,
                            durationMinutes: formData.durationMinutes,
                        }}
                        setFormData={(data) => setFormData({ ...formData, ...data })}
                        isLoading={isLoading}
                    />
                )}

                {currentStep === 2 && (
                    <ParticipationSettingsStep
                        formData={{
                            participationType: formData.participationType,
                            hasMaxParticipants: formData.hasMaxParticipants,
                            maxParticipants: formData.maxParticipants,
                            hasMaxTeams: formData.hasMaxTeams,
                            maxTeams: formData.maxTeams,
                            maxTeamMembers: formData.maxTeamMembers,
                            requireFullTeam: formData.requireFullTeam,
                        }}
                        setFormData={(data) => setFormData({ ...formData, ...data })}
                        isLoading={isLoading}
                    />
                )}

                {currentStep === 3 && (
                    <ProblemsPointsStep
                        formData={{
                            pointSystemType: formData.pointSystemType,
                            easyPoints: formData.easyPoints,
                            averagePoints: formData.averagePoints,
                            difficultPoints: formData.difficultPoints,
                        }}
                        setFormData={(data) => setFormData({ ...formData, ...data })}
                        selectedProblems={selectedProblems}
                        setSelectedProblems={setSelectedProblems}
                        isLoading={isLoading}
                    />
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
                {currentStep > 1 && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePreviousStep}
                        disabled={isLoading}
                        className="font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                    </Button>
                )}

                {currentStep < 3 ? (
                    <Button
                        type="button"
                        onClick={handleNextStep}
                        disabled={isLoading}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6"
                    >
                        Next
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Button>
                ) : (
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6"
                    >
                        Review Competition
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Button>
                )}

                {/* Save as Draft Button - Available on all steps */}
                {originalStatus !== "published" && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSaveCompetition("draft")}
                        disabled={isLoading}
                        className="font-medium"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                                Save as Draft
                            </>
                        )}
                    </Button>
                )}

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/competition")}
                    disabled={isLoading}
                    className="font-medium ml-auto"
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}
