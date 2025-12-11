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
};

type Props = {
    formData: FormData;
    setFormData: (data: FormData) => void;
    isLoading: boolean;
};

export default function CompetitionDetailsStep({ formData, setFormData, isLoading }: Props) {
    return (
        <div className="space-y-6">
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
        </div>
    );
}
