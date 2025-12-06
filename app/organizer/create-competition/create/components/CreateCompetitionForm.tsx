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

      // For now, just log the data (we'll implement actual save later)
      console.log("Form data:", {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDateTime: startDateTime.toISOString(),
        durationMinutes: totalMinutes,
        ...participationData,
      });

      // Temporary success message
      alert("Basic info and participation settings validated! Next step: Point system");
      
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
