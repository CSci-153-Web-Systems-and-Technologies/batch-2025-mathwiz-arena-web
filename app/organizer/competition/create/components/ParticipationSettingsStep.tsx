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
  requireFullTeam: boolean;
};

type Props = {
  formData: FormData;
  setFormData: (data: FormData) => void;
  isLoading: boolean;
};

export default function ParticipationSettingsStep({ formData, setFormData, isLoading }: Props) {
  const handleTeamSizeChange = (requireFull: boolean) => {
    console.log('Team size requirement changed to:', requireFull);
    console.log('Current formData:', formData);
    setFormData({ ...formData, requireFullTeam: requireFull });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Participation Settings</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">Configure how participants will compete</p>
      </div>

      {/* Participation Type */}
      <div className="space-y-2">
        <Label className="text-slate-700 dark:text-slate-300 font-medium">
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
            className={`p-4 border-2 rounded-lg text-sm font-medium transition-all ${formData.participationType === "individual"
                ? "border-[#f49700] bg-[#f49700]/5 text-[#f49700]"
                : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500"
              }`}
            disabled={isLoading}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">👤</div>
              <div className="font-semibold mb-1">Individual</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Participants compete alone</div>
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
            className={`p-4 border-2 rounded-lg text-sm font-medium transition-all ${formData.participationType === "team"
                ? "border-[#f49700] bg-[#f49700]/5 text-[#f49700]"
                : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500"
              }`}
            disabled={isLoading}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-semibold mb-1">Team</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Participants compete in teams</div>
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
              <Label htmlFor="hasMaxParticipants" className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                Set maximum number of participants
              </Label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Leave unchecked for unlimited participants</p>
            </div>
          </div>

          {formData.hasMaxParticipants && (
            <div className="space-y-2">
              <Label htmlFor="maxParticipants" className="text-sm text-slate-600 dark:text-slate-400">
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
            <Label htmlFor="maxTeamMembers" className="text-slate-700 dark:text-slate-300 font-medium">
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
            <p className="text-xs text-slate-500 dark:text-slate-400">Minimum 2 members per team</p>
          </div>

          {/* Team Size Requirement */}
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
            <Label className="text-slate-700 dark:text-slate-300 font-medium">
              Team Size Requirement
            </Label>
            <div className="space-y-3">
              <div
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => handleTeamSizeChange(false)}
              >
                <input
                  type="radio"
                  id="flexibleTeamSize"
                  name="teamSizeRequirement"
                  checked={!formData.requireFullTeam}
                  onChange={() => handleTeamSizeChange(false)}
                  className="mt-1 w-4 h-4 text-[#f49700] focus:ring-[#f49700] cursor-pointer flex-shrink-0"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <div className="text-slate-700 dark:text-slate-300 font-medium">
                    Flexible (Recommended)
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Teams can register with <strong>2 or more members</strong> up to the maximum.
                    Good for competitions where team size flexibility is acceptable.
                  </p>
                </div>
              </div>

              <div
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => handleTeamSizeChange(true)}
              >
                <input
                  type="radio"
                  id="strictTeamSize"
                  name="teamSizeRequirement"
                  checked={formData.requireFullTeam}
                  onChange={() => handleTeamSizeChange(true)}
                  className="mt-1 w-4 h-4 text-[#f49700] focus:ring-[#f49700] cursor-pointer flex-shrink-0"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <div className="text-slate-700 dark:text-slate-300 font-medium">
                    Strict Full Team
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Teams must have <strong>exactly the maximum number</strong> of members to register.
                    Use for relay-style or role-based competitions.
                  </p>
                </div>
              </div>
            </div>
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
              <Label htmlFor="hasMaxTeams" className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                Set maximum number of teams
              </Label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Leave unchecked for unlimited teams</p>
            </div>
          </div>

          {formData.hasMaxTeams && (
            <div className="space-y-2">
              <Label htmlFor="maxTeams" className="text-sm text-slate-600 dark:text-slate-400">
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
