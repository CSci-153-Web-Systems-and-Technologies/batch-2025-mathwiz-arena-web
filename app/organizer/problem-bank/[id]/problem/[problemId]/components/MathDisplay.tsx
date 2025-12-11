"use client";

import { MathRenderer } from "@/components/ui/MathInput";

export function MathDisplay({ text, className = "" }: { text: string; className?: string }) {
    return <MathRenderer text={text} className={className} />;
}
