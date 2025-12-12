"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import MathInput, { MathInputInline } from "@/components/ui/MathInput";

type ProblemType = "multiple_choice" | "true_false" | "identification";
type Difficulty = "easy" | "average" | "difficult";

export default function AddProblemForm({ problemBankId }: { problemBankId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    type: "multiple_choice" as ProblemType,
    difficulty: "average" as Difficulty,
    options: ["", "", "", ""],
    correctAnswer: "",
    correctAnswerIndex: 0,
    alternativeAnswers: [""] as string[], // For identification - multiple acceptable answers
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Validate form
      if (!formData.question.trim()) {
        setError("Please enter a question");
        setIsLoading(false);
        return;
      }

      if (formData.question.trim().length < 5) {
        setError("Question must be at least 5 characters long");
        setIsLoading(false);
        return;
      }

      // Validate based on type
      if (formData.type === "multiple_choice") {
        const filledOptions = formData.options.filter(opt => opt.trim());
        if (filledOptions.length !== 4) {
          setError("Please fill in all 4 options for multiple choice");
          setIsLoading(false);
          return;
        }

        // Check each option has minimum length
        for (let i = 0; i < formData.options.length; i++) {
          if (formData.options[i].trim().length < 1) {
            setError(`Option ${String.fromCharCode(65 + i)} cannot be empty`);
            setIsLoading(false);
            return;
          }
        }

        if (!formData.options[formData.correctAnswerIndex].trim()) {
          setError("Please select a correct answer");
          setIsLoading(false);
          return;
        }
      } else if (formData.type === "true_false") {
        if (!formData.correctAnswer) {
          setError("Please select the correct answer (True or False)");
          setIsLoading(false);
          return;
        }
      } else if (formData.type === "identification") {
        if (!formData.correctAnswer.trim()) {
          setError("Please enter the correct answer");
          setIsLoading(false);
          return;
        }

        if (formData.correctAnswer.trim().length < 1) {
          setError("Correct answer must be at least 1 character long");
          setIsLoading(false);
          return;
        }
      }

      // Prepare data
      let options = null;
      let correctAnswer = "";

      if (formData.type === "multiple_choice") {
        options = formData.options;
        correctAnswer = formData.options[formData.correctAnswerIndex];
      } else if (formData.type === "true_false") {
        correctAnswer = formData.correctAnswer;
      } else {
        // For identification, combine primary + alternative answers with pipe delimiter
        const allAnswers = [formData.correctAnswer.trim(), ...formData.alternativeAnswers.filter(a => a.trim())].join("|");
        correctAnswer = allAnswers;
      }

      // Get the next order_index
      const { data: existingProblems } = await supabase
        .from("problems")
        .select("order_index")
        .eq("problem_bank_id", problemBankId)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrderIndex = existingProblems && existingProblems.length > 0
        ? existingProblems[0].order_index + 1
        : 0;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to add a problem");
        setIsLoading(false);
        return;
      }

      // Create problem
      const { error: insertError } = await supabase
        .from("problems")
        .insert([
          {
            problem_bank_id: problemBankId,
            created_by: user.id,  // Add created_by field
            question: formData.question.trim(),
            type: formData.type,
            difficulty: formData.difficulty,
            options: options,
            correct_answer: correctAnswer,
            order_index: nextOrderIndex,
          },
        ]);

      if (insertError) {
        console.error("Error creating problem:", insertError);
        const errorMessage = insertError.message || insertError.hint || "Unknown error occurred";
        setError(`Failed to create problem: ${errorMessage}`);
        setIsLoading(false);
        return;
      }

      // Redirect back to problem bank
      router.push(`/organizer/problem-bank/${problemBankId}`);
      router.refresh();
    } catch (err: any) {
      console.error("Unexpected error:", err);
      const errorMessage = err?.message || "Unknown error occurred";
      setError(`An unexpected error occurred: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Question */}
      <div className="space-y-2">
        <Label htmlFor="question" className="text-slate-700 dark:text-slate-300 font-medium">
          Question <span className="text-red-500">*</span>
        </Label>
        <MathInput
          id="question"
          value={formData.question}
          onChange={(value) => setFormData({ ...formData, question: value })}
          placeholder="Enter your question here... Use $...$ for math (e.g., $x^2$)"
          disabled={isLoading}
          required
        />
      </div>

      {/* Type Selection */}
      <div className="space-y-2">
        <Label className="text-slate-700 dark:text-slate-300 font-medium">
          Problem Type <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setFormData({
              ...formData,
              type: "multiple_choice",
              correctAnswer: "",
              correctAnswerIndex: 0,
              options: formData.type === "multiple_choice" ? formData.options : ["", "", "", ""]
            })}
            className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${formData.type === "multiple_choice"
              ? "border-[#f49700] bg-[#f49700]/5 dark:bg-[#f49700]/20 text-[#f49700]"
              : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500"
              }`}
            disabled={isLoading}
          >
            Multiple Choice
          </button>
          <button
            type="button"
            onClick={() => setFormData({
              ...formData,
              type: "true_false",
              correctAnswer: "",
              correctAnswerIndex: 0
            })}
            className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${formData.type === "true_false"
              ? "border-[#f49700] bg-[#f49700]/5 dark:bg-[#f49700]/20 text-[#f49700]"
              : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500"
              }`}
            disabled={isLoading}
          >
            True/False
          </button>
          <button
            type="button"
            onClick={() => setFormData({
              ...formData,
              type: "identification",
              correctAnswer: "",
              correctAnswerIndex: 0
            })}
            className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${formData.type === "identification"
              ? "border-[#f49700] bg-[#f49700]/5 dark:bg-[#f49700]/20 text-[#f49700]"
              : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500"
              }`}
            disabled={isLoading}
          >
            Identification
          </button>
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="space-y-2">
        <Label className="text-slate-700 dark:text-slate-300 font-medium">
          Difficulty <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, difficulty: "easy" })}
            className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${formData.difficulty === "easy"
              ? "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500"
              }`}
            disabled={isLoading}
          >
            Easy
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, difficulty: "average" })}
            className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${formData.difficulty === "average"
              ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
              : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500"
              }`}
            disabled={isLoading}
          >
            Average
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, difficulty: "difficult" })}
            className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${formData.difficulty === "difficult"
              ? "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
              : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500"
              }`}
            disabled={isLoading}
          >
            Difficult
          </button>
        </div>
      </div>

      {/* Options/Answer based on type */}
      {formData.type === "multiple_choice" && (
        <div className="space-y-3">
          <Label className="text-slate-700 dark:text-slate-300 font-medium">
            Options <span className="text-red-500">*</span>
          </Label>
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="radio"
                name="correctAnswer"
                checked={formData.correctAnswerIndex === index}
                onChange={() => setFormData({ ...formData, correctAnswerIndex: index })}
                className="w-4 h-4 text-[#f49700] focus:ring-[#f49700]"
                disabled={isLoading}
              />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-6">{String.fromCharCode(65 + index)}.</span>
              <MathInputInline
                value={option}
                onChange={(value) => handleOptionChange(index, value)}
                placeholder={`Option ${String.fromCharCode(65 + index)} (use $...$ for math)`}
                disabled={isLoading}
                required
              />
            </div>
          ))}
          <p className="text-sm text-slate-500 dark:text-slate-400">Select the radio button for the correct answer. Use $...$ for math expressions.</p>
        </div>
      )}

      {formData.type === "true_false" && (
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300 font-medium">
            Correct Answer <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, correctAnswer: "true" })}
              className={`flex-1 p-4 border-2 rounded-lg text-sm font-medium transition-all ${formData.correctAnswer === "true"
                ? "border-[#f49700] bg-[#f49700]/5 dark:bg-[#f49700]/20 text-[#f49700]"
                : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500"
                }`}
              disabled={isLoading}
            >
              True
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, correctAnswer: "false" })}
              className={`flex-1 p-4 border-2 rounded-lg text-sm font-medium transition-all ${formData.correctAnswer === "false"
                ? "border-[#f49700] bg-[#f49700]/5 dark:bg-[#f49700]/20 text-[#f49700]"
                : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500"
                }`}
              disabled={isLoading}
            >
              False
            </button>
          </div>
        </div>
      )}

      {formData.type === "identification" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="correctAnswer" className="text-slate-700 dark:text-slate-300 font-medium">
              Primary Answer <span className="text-red-500">*</span>
            </Label>
            <MathInputInline
              value={formData.correctAnswer}
              onChange={(value) => setFormData({ ...formData, correctAnswer: value })}
              placeholder="Enter the primary correct answer (use $...$ for math)"
              disabled={isLoading}
              required
            />
          </div>

          {/* Alternative Answers */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 font-medium">
              Alternative Acceptable Answers <span className="text-slate-400 dark:text-slate-500 font-normal">(optional)</span>
            </Label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Add variations that should also be accepted (e.g., for "x=17": also accept "17", "x = 17", etc.)
            </p>
            {formData.alternativeAnswers.map((alt, index) => (
              <div key={index} className="flex items-center gap-2">
                <MathInputInline
                  value={alt}
                  onChange={(value) => {
                    const newAlts = [...formData.alternativeAnswers];
                    newAlts[index] = value;
                    setFormData({ ...formData, alternativeAnswers: newAlts });
                  }}
                  placeholder={`Alternative answer ${index + 1}`}
                  disabled={isLoading}
                />
                {formData.alternativeAnswers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newAlts = formData.alternativeAnswers.filter((_, i) => i !== index);
                      setFormData({ ...formData, alternativeAnswers: newAlts });
                    }}
                    className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, alternativeAnswers: [...formData.alternativeAnswers, ""] })}
              className="text-sm text-[#f49700] hover:text-[#d68400] font-medium flex items-center gap-1"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Another Alternative
            </button>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
            💡 <strong className="dark:text-white">Tip:</strong> For quadratic equations with multiple solutions (e.g., x = 2 or x = 3), add each value as an alternative.
            Numeric equivalents (5 = 5.0 = 5.00) are automatically accepted.
          </p>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
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
              Adding...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Add Problem
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/organizer/problem-bank/${problemBankId}`)}
          disabled={isLoading}
          className="font-medium"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
