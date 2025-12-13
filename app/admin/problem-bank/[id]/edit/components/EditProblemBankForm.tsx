"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";

interface EditProblemBankFormProps {
    problemBank: {
        id: string;
        title: string;
        description: string | null;
    };
}

export default function EditProblemBankForm({ problemBank }: EditProblemBankFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: problemBank.title,
        description: problemBank.description || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const supabase = createClient();

            if (!formData.title.trim()) {
                setError("Please enter a title");
                setIsLoading(false);
                return;
            }

            const { error: updateError } = await supabase
                .from("problem_banks")
                .update({
                    title: formData.title.trim(),
                    description: formData.description.trim() || null,
                })
                .eq("id", problemBank.id);

            if (updateError) {
                console.error("Error updating problem bank:", updateError);
                setError(`Failed to update problem bank: ${updateError.message}`);
                setIsLoading(false);
                return;
            }

            router.push(`/admin/problem-bank/${problemBank.id}`);
            router.refresh();
        } catch (err: any) {
            console.error("Unexpected error:", err);
            setError(`An unexpected error occurred: ${err?.message || "Unknown error"}`);
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

            <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-700 font-medium">
                    Title <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="title"
                    type="text"
                    placeholder="e.g., Algebra Problems Set 1"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full"
                    required
                    disabled={isLoading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700 font-medium">
                    Description
                </Label>
                <textarea
                    id="description"
                    placeholder="Briefly describe the types of problems in this bank..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full min-h-[120px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                    disabled={isLoading}
                />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6"
                >
                    {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/admin/problem-bank/${problemBank.id}`)}
                    disabled={isLoading}
                    className="font-medium"
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}
