"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";

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

      // Validate based on type
      if (formData.type === "multiple_choice") {
        const filledOptions = formData.options.filter(opt => opt.trim());
        if (filledOptions.length !== 4) {
          setError("Please fill in all 4 options for multiple choice");
          setIsLoading(false);
          return;
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
        correctAnswer = formData.correctAnswer.trim();
      }

      // Create problem with timestamp-based order to avoid race conditions
      // Using created_at timestamp ensures uniqueness even with concurrent inserts
      const { error: insertError } = await supabase
        .from("problems")
        .insert([
          {
            problem_bank_id: problemBankId,
            question: formData.question.trim(),
            type: formData.type,
            difficulty: formData.difficulty,
            options: options,
            correct_answer: correctAnswer,
            order_index: Date.now(), // Use timestamp to avoid race conditions
          },
        ]);

      if (insertError) {
        console.error("Error creating problem:", insertError);
        setError("Failed to create problem. Please try again.");
        setIsLoading(false);
        return;
      }

      // Redirect back to problem bank
      router.push(`/organizer/problem-bank/${problemBankId}`);
      router.refresh();
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Question */}
      <div className="space-y-2">
        <Label htmlFor="question" className="text-slate-700 font-medium">
          Question <span className="text-red-500">*</span>
        </Label>
        <textarea
          id="question"
          placeholder="Enter your question here..."
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          className="w-full min-h-[100px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f49700] focus:border-transparent resize-none"
          required
          disabled={isLoading}
        />
      </div>

      {/* Type Selection */}
      <div className="space-y-2">
        <Label className="text-slate-700 font-medium">
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
            className={`p-4 border-2 rounded-lg text-sm font-medium transition-all ${
              formData.type === "multiple_choice"
                ? "border-[#f49700] bg-[#f49700]/5 text-[#f49700]"
                : "border-slate-200 text-slate-700 hover:border-slate-300"
            }`}
            disabled={isLoading}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">📝</div>
              Multiple Choice
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ 
              ...formData, 
              type: "true_false", 
              correctAnswer: "",
              correctAnswerIndex: 0
            })}
            className={`p-4 border-2 rounded-lg text-sm font-medium transition-all ${
              formData.type === "true_false"
                ? "border-[#f49700] bg-[#f49700]/5 text-[#f49700]"
                : "border-slate-200 text-slate-700 hover:border-slate-300"
            }`}
            disabled={isLoading}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">✓✗</div>
              True/False
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ 
              ...formData, 
              type: "identification", 
              correctAnswer: "",
              correctAnswerIndex: 0
            })}
            className={`p-4 border-2 rounded-lg text-sm font-medium transition-all ${
              formData.type === "identification"
                ? "border-[#f49700] bg-[#f49700]/5 text-[#f49700]"
                : "border-slate-200 text-slate-700 hover:border-slate-300"
            }`}
            disabled={isLoading}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">✍️</div>
              Identification
            </div>
          </button>
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="space-y-2">
        <Label className="text-slate-700 font-medium">
          Difficulty <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, difficulty: "easy" })}
            className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
              formData.difficulty === "easy"
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-slate-200 text-slate-700 hover:border-slate-300"
            }`}
            disabled={isLoading}
          >
            Easy
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, difficulty: "average" })}
            className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
              formData.difficulty === "average"
                ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                : "border-slate-200 text-slate-700 hover:border-slate-300"
            }`}
            disabled={isLoading}
          >
            Average
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, difficulty: "difficult" })}
            className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
              formData.difficulty === "difficult"
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-slate-200 text-slate-700 hover:border-slate-300"
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
          <Label className="text-slate-700 font-medium">
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
              <Input
                type="text"
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-1"
                required
                disabled={isLoading}
              />
            </div>
          ))}
          <p className="text-sm text-slate-500">Select the radio button for the correct answer</p>
        </div>
      )}

      {formData.type === "true_false" && (
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">
            Correct Answer <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, correctAnswer: "true" })}
              className={`flex-1 p-4 border-2 rounded-lg text-sm font-medium transition-all ${
                formData.correctAnswer === "true"
                  ? "border-[#f49700] bg-[#f49700]/5 text-[#f49700]"
                  : "border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
              disabled={isLoading}
            >
              True
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, correctAnswer: "false" })}
              className={`flex-1 p-4 border-2 rounded-lg text-sm font-medium transition-all ${
                formData.correctAnswer === "false"
                  ? "border-[#f49700] bg-[#f49700]/5 text-[#f49700]"
                  : "border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
              disabled={isLoading}
            >
              False
            </button>
          </div>
        </div>
      )}

      {formData.type === "identification" && (
        <div className="space-y-2">
          <Label htmlFor="correctAnswer" className="text-slate-700 font-medium">
            Correct Answer <span className="text-red-500">*</span>
          </Label>
          <Input
            id="correctAnswer"
            type="text"
            placeholder="Enter the correct answer"
            value={formData.correctAnswer}
            onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
            className="w-full"
            required
            disabled={isLoading}
          />
          <p className="text-sm text-slate-500">
            For numeric answers, equivalent formats will be accepted (e.g., 5, 5.0, 5.00)
          </p>
        </div>
      )}

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
