"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormData = {
  participationType: "individual" | "team";
  hasMaxParticipants: boolean;
  maxParticipants: string;
  hasMaxTeams: boolean;
  maxTeams: string;
  maxTeamMembers: string;
};

type Props = {
  formData: FormData;
  setFormData: (data: FormData) => void;
  isLoading: boolean;
};

export default function ParticipationSettingsStep({ formData, setFormData, isLoading }: Props) {
  return (
    <div className="space-y-6">
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
  );
}
