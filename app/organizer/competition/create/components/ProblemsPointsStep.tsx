"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { MathRenderer } from "@/components/ui/MathInput";

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

type ProblemBank = {
  id: string;
  title: string;
  description: string | null;
};

type FormData = {
  pointSystemType: "auto_level" | "manual";
  easyPoints: string;
  averagePoints: string;
  difficultPoints: string;
};

type Props = {
  formData: FormData;
  setFormData: (data: FormData) => void;
  selectedProblems: SelectedProblem[];
  setSelectedProblems: (problems: SelectedProblem[]) => void;
  isLoading: boolean;
};

export default function ProblemsPointsStep({
  formData,
  setFormData,
  selectedProblems,
  setSelectedProblems,
  isLoading
}: Props) {
  const [problemBanks, setProblemBanks] = useState<ProblemBank[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [bankProblems, setBankProblems] = useState<Problem[]>([]);
  const [isLoadingProblems, setIsLoadingProblems] = useState(false);

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

  // Update points for selected problems when switching to auto_level or when auto_level points change
  useEffect(() => {
    if (formData.pointSystemType === "auto_level" && selectedProblems.length > 0) {
      const hasInvalidPoints = selectedProblems.some((sp) => {
        const expectedPoints = getAutoLevelPoints(sp.problem.difficulty);
        return sp.points !== expectedPoints;
      });

      if (hasInvalidPoints) {
        const updatedProblems = selectedProblems.map((sp) => ({
          ...sp,
          points: getAutoLevelPoints(sp.problem.difficulty),
        }));
        setSelectedProblems(updatedProblems);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.pointSystemType, formData.easyPoints, formData.averagePoints, formData.difficultPoints]);

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

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-200";
      case "average":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "difficult":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case "multiple_choice":
        return "Multiple Choice";
      case "identification":
        return "Identification";
      case "true_false":
        return "True/False";
      default:
        return type;
    }
  };

  const isProblemSelected = (problemId: string): boolean => {
    return selectedProblems.some((sp) => sp.problem.id === problemId);
  };

  const handleToggleProblem = (problem: Problem) => {
    if (isProblemSelected(problem.id)) {
      setSelectedProblems(selectedProblems.filter((sp) => sp.problem.id !== problem.id));
    } else {
      const points = formData.pointSystemType === "auto_level"
        ? getAutoLevelPoints(problem.difficulty)
        : null;

      setSelectedProblems([
        ...selectedProblems,
        {
          problem,
          points,
          orderIndex: selectedProblems.length,
        },
      ]);
    }
  };

  const handleRemoveProblem = (problemId: string) => {
    setSelectedProblems(
      selectedProblems
        .filter((sp) => sp.problem.id !== problemId)
        .map((sp, index) => ({ ...sp, orderIndex: index }))
    );
  };

  const handleUpdatePoints = (problemId: string, points: number) => {
    setSelectedProblems(
      selectedProblems.map((sp) =>
        sp.problem.id === problemId ? { ...sp, points } : sp
      )
    );
  };

  return (
    <div className="space-y-6">
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
              pointSystemType: "auto_level"
            })}
            className={`p-4 border-2 rounded-lg text-sm font-medium transition-all ${formData.pointSystemType === "auto_level"
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
              pointSystemType: "manual"
            })}
            className={`p-4 border-2 rounded-lg text-sm font-medium transition-all ${formData.pointSystemType === "manual"
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
        </div>
      )}

      {/* Manual Points Info */}
      {formData.pointSystemType === "manual" && (
        <div className="pl-4 border-l-2 border-[#f49700]">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-yellow-700">
                <p className="font-medium mb-1">Manual Point Assignment</p>
                <p>You'll assign custom points to each problem when you select them below.</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  className={`p-4 border-2 rounded-lg text-left transition-all ${selectedBankId === bank.id
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
                          <p className="text-sm text-slate-800 mb-2 line-clamp-2"><MathRenderer text={problem.question} /></p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-600 font-medium">Correct Answer:</span>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                              <MathRenderer text={problem.correct_answer.split('|')[0]} />
                            </span>
                          </div>
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
                      <p className="text-sm text-slate-800 mb-2 line-clamp-2"><MathRenderer text={sp.problem.question} /></p>

                      {/* Correct Answer Display */}
                      <div className="flex items-center gap-2 text-xs mb-2">
                        <span className="text-slate-600 font-medium">Correct Answer:</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                          <MathRenderer text={sp.problem.correct_answer.split('|')[0]} />
                        </span>
                      </div>

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
    </div>
  );
}
