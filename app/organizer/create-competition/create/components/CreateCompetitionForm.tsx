"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateCompetitionForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

      // For now, just log the data (we'll implement actual save later)
      console.log("Form data:", {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDateTime: startDateTime.toISOString(),
        durationMinutes: totalMinutes,
        ...participationData,
        ...pointSystemData,
      });

      // Temporary success message
      alert("All settings validated! Next step: Problem selection");
      
      // TODO: Save to database and navigate to next step
      // router.push("/organizer/create-competition");

    } catch (err: any) {
      console.error("Unexpected error:", err);
      const errorMessage = err?.message || "Unknown error occurred";
      setError(`An unexpected error occurred: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

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
              Continue
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
