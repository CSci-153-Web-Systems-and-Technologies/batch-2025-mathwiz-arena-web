"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";

type ProblemBank = {
  id: string;
  title: string;
  description: string | null;
};

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

export default function CreateCompetitionForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [problemBanks, setProblemBanks] = useState<ProblemBank[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [bankProblems, setBankProblems] = useState<Problem[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<SelectedProblem[]>([]);
  const [isLoadingProblems, setIsLoadingProblems] = useState(false);
  const [showReview, setShowReview] = useState(false);
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
    pointSystemType: "auto_level" as "auto_level" | "manual",
    easyPoints: "",
    averagePoints: "",
    difficultPoints: "",
  });

  // Fetch problem banks on mount
  useEffect(() => {
    const fetchProblemBanks = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from("problem_banks")
            .select("id, title, description")
            .eq("organizer_id", user.id)
            .order("created_at", { ascending: false });

          if (!error && data) {
            setProblemBanks(data);
          }
        }
      } catch (err) {
        console.error("Error fetching problem banks:", err);
      }
    };

    fetchProblemBanks();
  }, []);

  // Fetch problems when a bank is selected
  useEffect(() => {
    const fetchBankProblems = async () => {
      if (!selectedBankId) {
        setBankProblems([]);
        return;
      }

      setIsLoadingProblems(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("problems")
          .select("*")
          .eq("problem_bank_id", selectedBankId)
          .order("order_index", { ascending: true });

        if (!error && data) {
          setBankProblems(data);
        }
      } catch (err) {
        console.error("Error fetching problems:", err);
      } finally {
        setIsLoadingProblems(false);
      }
    };

    fetchBankProblems();
  }, [selectedBankId]);

  const getAutoLevelPoints = (difficulty: string): number => {
    switch (difficulty) {
      case "easy":
        return parseInt(formData.easyPoints) || 0;
      case "average":
        return parseInt(formData.averagePoints) || 0;
      case "difficult":
        return parseInt(formData.difficultPoints) || 0;
      default:
        return 0;
    }
  };

  const isProblemSelected = (problemId: string): boolean => {
    return selectedProblems.some(sp => sp.problem.id === problemId);
  };

  const handleToggleProblem = (problem: Problem) => {
    if (isProblemSelected(problem.id)) {
      // Remove problem
      setSelectedProblems(prev => prev.filter(sp => sp.problem.id !== problem.id));
    } else {
      // Add problem
      const points = formData.pointSystemType === "auto_level" 
        ? getAutoLevelPoints(problem.difficulty)
        : null;
      
      setSelectedProblems(prev => [
        ...prev,
        {
          problem,
          points,
          orderIndex: prev.length,
        }
      ]);
    }
  };

  const handleUpdatePoints = (problemId: string, points: number) => {
    setSelectedProblems(prev =>
      prev.map(sp =>
        sp.problem.id === problemId
          ? { ...sp, points }
          : sp
      )
    );
  };

  const handleRemoveProblem = (problemId: string) => {
    setSelectedProblems(prev => 
      prev
        .filter(sp => sp.problem.id !== problemId)
        .map((sp, index) => ({ ...sp, orderIndex: index }))
    );
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice": return "Multiple Choice";
      case "true_false": return "True/False";
      case "identification": return "Identification";
      default: return type;
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

      // Create competition
      const competitionData = {
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
        max_team_members: formData.participationType === "team" 
          ? parseInt(formData.maxTeamMembers) 
          : null,
        point_system_type: formData.pointSystemType,
        easy_points: formData.pointSystemType === "auto_level" ? parseInt(formData.easyPoints) : null,
        average_points: formData.pointSystemType === "auto_level" ? parseInt(formData.averagePoints) : null,
        difficult_points: formData.pointSystemType === "auto_level" ? parseInt(formData.difficultPoints) : null,
        status: status,
      };

      const { data: competition, error: competitionError } = await supabase
        .from("competitions")
        .insert([competitionData])
        .select()
        .single();

      if (competitionError) {
        console.error("Error creating competition:", competitionError);
        const errorMessage = competitionError.message || competitionError.hint || "Unknown error occurred";
        setError(`Failed to create competition: ${errorMessage}`);
        setIsLoading(false);
        return;
      }

      // Insert competition problems
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
        const errorMessage = problemsError.message || problemsError.hint || "Unknown error occurred";
        setError(`Competition created but failed to add problems: ${errorMessage}`);
        setIsLoading(false);
        return;
      }

      // Success! Redirect to competitions page
      router.push("/organizer/create-competition");
      router.refresh();
    } catch (err: any) {
      console.error("Unexpected error:", err);
      const errorMessage = err?.message || "Unknown error occurred";
      setError(`An unexpected error occurred: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name.trim()) {
        setError("Please enter a competition name");
        setIsLoading(false);
        return;
      }

      if (formData.name.trim().length < 3) {
        setError("Competition name must be at least 3 characters long");
        setIsLoading(false);
        return;
      }

      if (!formData.startDate) {
        setError("Please select a start date");
        setIsLoading(false);
        return;
      }

      if (!formData.startTime) {
        setError("Please select a start time");
        setIsLoading(false);
        return;
      }

      // Validate that start datetime is in the future
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      if (startDateTime <= new Date()) {
        setError("Start date and time must be in the future");
        setIsLoading(false);
        return;
      }

      // Validate duration
      const hours = parseInt(formData.durationHours) || 0;
      const minutes = parseInt(formData.durationMinutes) || 0;
      const totalMinutes = hours * 60 + minutes;

      if (totalMinutes <= 0) {
        setError("Please set a valid duration (must be greater than 0)");
        setIsLoading(false);
        return;
      }

      // Validate participation settings
      if (formData.participationType === "individual") {
        if (formData.hasMaxParticipants) {
          const maxPart = parseInt(formData.maxParticipants);
          if (isNaN(maxPart) || maxPart <= 0) {
            setError("Maximum participants must be a positive number");
            setIsLoading(false);
            return;
          }
        }
      } else {
        // Team mode validations
        if (!formData.maxTeamMembers.trim()) {
          setError("Please set the maximum team members");
          setIsLoading(false);
          return;
        }

        const maxMembers = parseInt(formData.maxTeamMembers);
        if (isNaN(maxMembers) || maxMembers < 2) {
          setError("Maximum team members must be at least 2");
          setIsLoading(false);
          return;
        }

        if (formData.hasMaxTeams) {
          const maxTeamsNum = parseInt(formData.maxTeams);
          if (isNaN(maxTeamsNum) || maxTeamsNum <= 0) {
            setError("Maximum teams must be a positive number");
            setIsLoading(false);
            return;
          }
        }
      }

      // Validate point system
      if (formData.pointSystemType === "auto_level") {
        const easyPts = parseInt(formData.easyPoints);
        const avgPts = parseInt(formData.averagePoints);
        const difficultPts = parseInt(formData.difficultPoints);

        if (!formData.easyPoints.trim() || isNaN(easyPts) || easyPts < 0) {
          setError("Please set valid points for Easy difficulty (must be 0 or greater)");
          setIsLoading(false);
          return;
        }

        if (!formData.averagePoints.trim() || isNaN(avgPts) || avgPts < 0) {
          setError("Please set valid points for Average difficulty (must be 0 or greater)");
          setIsLoading(false);
          return;
        }

        if (!formData.difficultPoints.trim() || isNaN(difficultPts) || difficultPts < 0) {
          setError("Please set valid points for Difficult difficulty (must be 0 or greater)");
          setIsLoading(false);
          return;
        }
      }

      // Validate problem selection
      if (selectedProblems.length === 0) {
        setError("Please select at least one problem for the competition");
        setIsLoading(false);
        return;
      }

      // Validate manual points if manual system
      if (formData.pointSystemType === "manual") {
        const problemsWithoutPoints = selectedProblems.filter(sp => 
          sp.points === null || sp.points === undefined || isNaN(sp.points) || sp.points < 0
        );
        
        if (problemsWithoutPoints.length > 0) {
          setError("Please set valid points (0 or greater) for all selected problems");
          setIsLoading(false);
          return;
        }
      }

      // Prepare participation data
      const participationData = {
        participationType: formData.participationType,
        maxParticipants: formData.participationType === "individual" && formData.hasMaxParticipants 
          ? parseInt(formData.maxParticipants) 
          : null,
        maxTeams: formData.participationType === "team" && formData.hasMaxTeams 
          ? parseInt(formData.maxTeams) 
          : null,
        maxTeamMembers: formData.participationType === "team" 
          ? parseInt(formData.maxTeamMembers) 
          : null,
      };

      // Prepare point system data
      const pointSystemData = {
        pointSystemType: formData.pointSystemType,
        easyPoints: formData.pointSystemType === "auto_level" ? parseInt(formData.easyPoints) : null,
        averagePoints: formData.pointSystemType === "auto_level" ? parseInt(formData.averagePoints) : null,
        difficultPoints: formData.pointSystemType === "auto_level" ? parseInt(formData.difficultPoints) : null,
      };

      // Prepare selected problems data
      const problemsData = selectedProblems.map(sp => ({
        problemId: sp.problem.id,
        points: sp.points,
        orderIndex: sp.orderIndex,
      }));

      // All validation passed, show review
      setShowReview(true);
      setError(null);
      
    } catch (err: any) {
      console.error("Unexpected error:", err);
      const errorMessage = err?.message || "Unknown error occurred";
      setError(`An unexpected error occurred: ${errorMessage}`);
    } finally {
      setIsLoading(false);
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

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Review Competition</h2>
          <button
            type="button"
            onClick={() => setShowReview(false)}
            className="text-sm text-slate-600 hover:text-[#f49700] transition-colors"
            disabled={isLoading}
          >
            ← Edit Details
          </button>
        </div>

        {/* Basic Info */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Competition Name</p>
              <p className="font-medium text-slate-800">{formData.name}</p>
            </div>
            {formData.description && (
              <div>
                <p className="text-sm text-slate-600">Description</p>
                <p className="text-slate-800">{formData.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Start Date & Time</p>
                <p className="font-medium text-slate-800">
                  {startDateTime.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">End Date & Time</p>
                <p className="font-medium text-slate-800">
                  {endDateTime.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600">Duration</p>
              <p className="font-medium text-slate-800">
                {hours > 0 && `${hours} hour${hours !== 1 ? 's' : ''}`}
                {hours > 0 && minutes > 0 && ' '}
                {minutes > 0 && `${minutes} minute${minutes !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>

        {/* Participation Settings */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Participation Settings</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Participation Type</p>
              <p className="font-medium text-slate-800 capitalize">{formData.participationType}</p>
            </div>
            {formData.participationType === "individual" ? (
              <div>
                <p className="text-sm text-slate-600">Maximum Participants</p>
                <p className="font-medium text-slate-800">
                  {formData.hasMaxParticipants ? formData.maxParticipants : "Unlimited"}
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm text-slate-600">Maximum Team Members</p>
                  <p className="font-medium text-slate-800">{formData.maxTeamMembers}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Maximum Teams</p>
                  <p className="font-medium text-slate-800">
                    {formData.hasMaxTeams ? formData.maxTeams : "Unlimited"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Point System */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Point System</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Point Assignment Method</p>
              <p className="font-medium text-slate-800">
                {formData.pointSystemType === "auto_level" ? "Auto-Level Points" : "Manual Points"}
              </p>
            </div>
            {formData.pointSystemType === "auto_level" && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Easy</p>
                  <p className="font-medium text-green-700">{formData.easyPoints} points</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Average</p>
                  <p className="font-medium text-yellow-700">{formData.averagePoints} points</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Difficult</p>
                  <p className="font-medium text-red-700">{formData.difficultPoints} points</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Problems */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Problems ({selectedProblems.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedProblems.map((sp, index) => (
              <div key={sp.problem.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium text-slate-700">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border capitalize ${getDifficultyColor(sp.problem.difficulty)}`}>
                      {sp.problem.difficulty}
                    </span>
                    <span className="text-xs text-slate-500">{getTypeLabel(sp.problem.type)}</span>
                  </div>
                  <p className="text-sm text-slate-800 line-clamp-1">{sp.problem.question}</p>
                </div>
                <div className="flex-shrink-0 text-sm font-semibold text-[#f49700]">
                  {sp.points} pts
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-slate-700">Total Points</p>
              <p className="text-lg font-bold text-[#f49700]">
                {selectedProblems.reduce((sum, sp) => sum + (sp.points || 0), 0)} points
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            onClick={() => handleSaveCompetition("draft")}
            disabled={isLoading}
            variant="outline"
            className="font-medium px-6"
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
          <Button
            type="button"
            onClick={() => handleSaveCompetition("published")}
            disabled={isLoading}
            className="bg-[#f49700] hover:bg-[#d68400] text-white font-medium px-6"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publishing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Publish Competition
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/organizer/create-competition")}
            disabled={isLoading}
            className="font-medium"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Regular form view
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

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
          className="w-full min-h-[120px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f49700] focus:border-transparent resize-none"
          disabled={isLoading}
        />
        <p className="text-sm text-slate-500">Optional: Add details about the competition</p>
      </div>

      {/* Start Date and Time */}
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

      {/* Duration */}
      <div className="space-y-2">
        <Label className="text-slate-700 font-medium">
          Duration <span className="text-red-500">*</span>
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
          Set how long the competition will run (e.g., 2 hours 30 minutes)
        </p>
      </div>

      {/* Preview End Time */}
      {formData.startDate && formData.startTime && (formData.durationHours || formData.durationMinutes) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800">Competition Schedule</p>
              <p className="text-sm text-blue-700 mt-1">
                <span className="font-medium">Starts:</span> {new Date(`${formData.startDate}T${formData.startTime}`).toLocaleString('en-US', { 
                  dateStyle: 'medium', 
                  timeStyle: 'short' 
                })}
              </p>
              <p className="text-sm text-blue-700">
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

      {/* Participation Settings */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Participation Settings</h3>
          <p className="text-sm text-slate-600">Configure how participants will compete</p>
        </div>

        {/* Participation Type */}
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">
            Participation Type <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ 
                ...formData, 
                participationType: "individual",
                hasMaxTeams: false,
                maxTeams: "",
                maxTeamMembers: ""
              })}
              className={`p-4 border-2 rounded-lg text-sm font-medium transition-all ${
                formData.participationType === "individual"
                  ? "border-[#f49700] bg-[#f49700]/5 text-[#f49700]"
                  : "border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
              disabled={isLoading}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">👤</div>
                <div className="font-semibold mb-1">Individual</div>
                <div className="text-xs text-slate-600">Participants compete alone</div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData({ 
                ...formData, 
                participationType: "team",
                hasMaxParticipants: false,
                maxParticipants: ""
              })}
              className={`p-4 border-2 rounded-lg text-sm font-medium transition-all ${
                formData.participationType === "team"
                  ? "border-[#f49700] bg-[#f49700]/5 text-[#f49700]"
                  : "border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
              disabled={isLoading}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">👥</div>
                <div className="font-semibold mb-1">Team</div>
                <div className="text-xs text-slate-600">Participants compete in teams</div>
              </div>
            </button>
          </div>
        </div>

        {/* Individual Settings */}
        {formData.participationType === "individual" && (
          <div className="space-y-3 pl-4 border-l-2 border-[#f49700]">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="hasMaxParticipants"
                checked={formData.hasMaxParticipants}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  hasMaxParticipants: e.target.checked,
                  maxParticipants: e.target.checked ? formData.maxParticipants : ""
                })}
                className="mt-1 w-4 h-4 text-[#f49700] focus:ring-[#f49700] rounded"
                disabled={isLoading}
              />
              <div className="flex-1">
                <Label htmlFor="hasMaxParticipants" className="text-slate-700 font-medium cursor-pointer">
                  Set maximum number of participants
                </Label>
                <p className="text-xs text-slate-500 mt-1">Leave unchecked for unlimited participants</p>
              </div>
            </div>

            {formData.hasMaxParticipants && (
              <div className="space-y-2">
                <Label htmlFor="maxParticipants" className="text-sm text-slate-600">
                  Maximum Participants
                </Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                  className="w-full max-w-xs"
                  min="1"
                  disabled={isLoading}
                />
              </div>
            )}
          </div>
        )}

        {/* Team Settings */}
        {formData.participationType === "team" && (
          <div className="space-y-4 pl-4 border-l-2 border-[#f49700]">
            {/* Max Team Members */}
            <div className="space-y-2">
              <Label htmlFor="maxTeamMembers" className="text-slate-700 font-medium">
                Maximum Team Members <span className="text-red-500">*</span>
              </Label>
              <Input
                id="maxTeamMembers"
                type="number"
                placeholder="e.g., 5"
                value={formData.maxTeamMembers}
                onChange={(e) => setFormData({ ...formData, maxTeamMembers: e.target.value })}
                className="w-full max-w-xs"
                min="2"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-slate-500">Minimum 2 members per team</p>
            </div>

            {/* Max Teams Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="hasMaxTeams"
                checked={formData.hasMaxTeams}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  hasMaxTeams: e.target.checked,
                  maxTeams: e.target.checked ? formData.maxTeams : ""
                })}
                className="mt-1 w-4 h-4 text-[#f49700] focus:ring-[#f49700] rounded"
                disabled={isLoading}
              />
              <div className="flex-1">
                <Label htmlFor="hasMaxTeams" className="text-slate-700 font-medium cursor-pointer">
                  Set maximum number of teams
                </Label>
                <p className="text-xs text-slate-500 mt-1">Leave unchecked for unlimited teams</p>
              </div>
            </div>

            {formData.hasMaxTeams && (
              <div className="space-y-2">
                <Label htmlFor="maxTeams" className="text-sm text-slate-600">
                  Maximum Teams
                </Label>
                <Input
                  id="maxTeams"
                  type="number"
                  placeholder="e.g., 20"
                  value={formData.maxTeams}
                  onChange={(e) => setFormData({ ...formData, maxTeams: e.target.value })}
                  className="w-full max-w-xs"
                  min="1"
                  disabled={isLoading}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Point System */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Point System</h3>
          <p className="text-sm text-slate-600">Choose how points will be assigned to problems</p>
        </div>

        {/* Point System Type */}
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">
            Point Assignment Method <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ 
                ...formData, 
                pointSystemType: "auto_level",
                easyPoints: formData.easyPoints || "1",
                averagePoints: formData.averagePoints || "3",
                difficultPoints: formData.difficultPoints || "5"
              })}
              className={`p-4 border-2 rounded-lg text-sm font-medium transition-all ${
                formData.pointSystemType === "auto_level"
                  ? "border-[#f49700] bg-[#f49700]/5 text-[#f49700]"
                  : "border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
              disabled={isLoading}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-xl">⚡</div>
                  <div className="font-semibold">Auto-Level Points</div>
                </div>
                <div className="text-xs text-slate-600">
                  Set points once for each difficulty level. Points are automatically assigned based on problem difficulty.
                </div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData({ 
                ...formData, 
                pointSystemType: "manual",
                easyPoints: "",
                averagePoints: "",
                difficultPoints: ""
              })}
              className={`p-4 border-2 rounded-lg text-sm font-medium transition-all ${
                formData.pointSystemType === "manual"
                  ? "border-[#f49700] bg-[#f49700]/5 text-[#f49700]"
                  : "border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
              disabled={isLoading}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-xl">✏️</div>
                  <div className="font-semibold">Manual Points</div>
                </div>
                <div className="text-xs text-slate-600">
                  Set custom points for each individual problem. More control, more flexibility.
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Auto-Level Settings */}
        {formData.pointSystemType === "auto_level" && (
          <div className="space-y-4 pl-4 border-l-2 border-[#f49700]">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-700">
                  With Auto-Level Points, all Easy problems will receive the same points, all Average problems will receive the same points, and so on.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Easy Points */}
              <div className="space-y-2">
                <Label htmlFor="easyPoints" className="text-slate-700 font-medium flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-green-100 text-green-700 border border-green-200">
                    Easy
                  </span>
                  Points <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="easyPoints"
                  type="number"
                  placeholder="e.g., 1"
                  value={formData.easyPoints}
                  onChange={(e) => setFormData({ ...formData, easyPoints: e.target.value })}
                  className="w-full"
                  min="0"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Average Points */}
              <div className="space-y-2">
                <Label htmlFor="averagePoints" className="text-slate-700 font-medium flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-yellow-100 text-yellow-700 border border-yellow-200">
                    Average
                  </span>
                  Points <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="averagePoints"
                  type="number"
                  placeholder="e.g., 3"
                  value={formData.averagePoints}
                  onChange={(e) => setFormData({ ...formData, averagePoints: e.target.value })}
                  className="w-full"
                  min="0"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Difficult Points */}
              <div className="space-y-2">
                <Label htmlFor="difficultPoints" className="text-slate-700 font-medium flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-700 border border-red-200">
                    Difficult
                  </span>
                  Points <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="difficultPoints"
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.difficultPoints}
                  onChange={(e) => setFormData({ ...formData, difficultPoints: e.target.value })}
                  className="w-full"
                  min="0"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Points Preview */}
            {(formData.easyPoints || formData.averagePoints || formData.difficultPoints) && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-800 mb-2">Points Summary:</p>
                <div className="flex gap-4 text-sm">
                  {formData.easyPoints && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-semibold">{formData.easyPoints} pts</span>
                      <span className="text-slate-600">per Easy problem</span>
                    </div>
                  )}
                  {formData.averagePoints && (
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-600 font-semibold">{formData.averagePoints} pts</span>
                      <span className="text-slate-600">per Average problem</span>
                    </div>
                  )}
                  {formData.difficultPoints && (
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-semibold">{formData.difficultPoints} pts</span>
                      <span className="text-slate-600">per Difficult problem</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Points Info */}
        {formData.pointSystemType === "manual" && (
          <div className="pl-4 border-l-2 border-[#f49700]">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-yellow-700">
                  <p className="font-medium mb-1">Manual Point Assignment</p>
                  <p>You'll assign custom points to each problem when you select them in the next step.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Problem Selection */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Problem Selection</h3>
          <p className="text-sm text-slate-600">Choose problems from your problem banks</p>
        </div>

        {/* Selected Problems Summary */}
        {selectedProblems.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {selectedProblems.length} problem{selectedProblems.length !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-xs text-green-700">
                    Total Points: {selectedProblems.reduce((sum, sp) => sum + (sp.points || 0), 0)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProblems([])}
                className="text-sm text-green-700 hover:text-green-800 font-medium"
                disabled={isLoading}
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Problem Bank Selection */}
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">
            Select Problem Bank
          </Label>
          {problemBanks.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
              <div className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium">No problem banks found</p>
                  <p className="mt-1">Create a problem bank first to add problems to your competition.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {problemBanks.map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => setSelectedBankId(bank.id === selectedBankId ? null : bank.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedBankId === bank.id
                      ? "border-[#f49700] bg-[#f49700]/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  disabled={isLoading}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{bank.title}</h4>
                      {bank.description && (
                        <p className="text-sm text-slate-600 mt-1 line-clamp-1">{bank.description}</p>
                      )}
                    </div>
                    {selectedBankId === bank.id && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#f49700] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Problems List */}
        {selectedBankId && (
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">
              Available Problems
            </Label>
            {isLoadingProblems ? (
              <div className="text-center py-8 text-slate-500">
                <svg className="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading problems...
              </div>
            ) : bankProblems.length === 0 ? (
              <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                <p className="text-sm">No problems in this bank</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 max-h-96 overflow-y-auto">
                {bankProblems.map((problem) => {
                  const isSelected = isProblemSelected(problem.id);
                  return (
                    <div
                      key={problem.id}
                      className={`p-4 ${isSelected ? "bg-[#f49700]/5" : "bg-white hover:bg-slate-50"} transition-colors`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleProblem(problem)}
                          className="mt-1 w-4 h-4 text-[#f49700] focus:ring-[#f49700] rounded"
                          disabled={isLoading}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded border capitalize ${getDifficultyColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {getTypeLabel(problem.type)}
                            </span>
                            {formData.pointSystemType === "auto_level" && (
                              <span className="text-xs font-semibold text-[#f49700]">
                                {getAutoLevelPoints(problem.difficulty)} pts
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-800 line-clamp-2">{problem.question}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Selected Problems Management */}
        {selectedProblems.length > 0 && (
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">
              Selected Problems ({selectedProblems.length})
            </Label>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 max-h-96 overflow-y-auto">
              {selectedProblems.map((sp, index) => (
                <div key={sp.problem.id} className="p-4 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-medium text-slate-600">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded border capitalize ${getDifficultyColor(sp.problem.difficulty)}`}>
                          {sp.problem.difficulty}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {getTypeLabel(sp.problem.type)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-800 mb-2 line-clamp-2">{sp.problem.question}</p>
                      
                      {/* Points Input for Manual System */}
                      {formData.pointSystemType === "manual" && (
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`points-${sp.problem.id}`} className="text-xs text-slate-600">
                            Points:
                          </Label>
                          <Input
                            id={`points-${sp.problem.id}`}
                            type="number"
                            value={sp.points ?? ""}
                            onChange={(e) => handleUpdatePoints(sp.problem.id, parseInt(e.target.value) || 0)}
                            className="w-20 h-8 text-sm"
                            min="0"
                            placeholder="0"
                            disabled={isLoading}
                          />
                        </div>
                      )}

                      {/* Auto Points Display */}
                      {formData.pointSystemType === "auto_level" && (
                        <div className="text-sm text-[#f49700] font-semibold">
                          {sp.points} points
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProblem(sp.problem.id)}
                      className="flex-shrink-0 text-red-600 hover:text-red-700 p-1"
                      disabled={isLoading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#f49700] hover:bg-[#d68400] text-white font-medium px-6"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validating...
            </>
          ) : (
            <>
              Review Competition
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/organizer/create-competition")}
          disabled={isLoading}
          className="font-medium"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
