"use client";

import { useState, useRef, useEffect } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathInputProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    minHeight?: string;
    className?: string;
}

// Common math symbols organized by category
const MATH_SYMBOLS = {
    "Basic": [
        { label: "×", latex: "\\times", title: "Multiplication" },
        { label: "÷", latex: "\\div", title: "Division" },
        { label: "±", latex: "\\pm", title: "Plus/Minus" },
        { label: "≠", latex: "\\neq", title: "Not Equal" },
        { label: "≤", latex: "\\leq", title: "Less or Equal" },
        { label: "≥", latex: "\\geq", title: "Greater or Equal" },
        { label: "∞", latex: "\\infty", title: "Infinity" },
    ],
    "Powers & Roots": [
        { label: "x²", latex: "^{2}", title: "Squared" },
        { label: "xⁿ", latex: "^{n}", title: "Power" },
        { label: "√", latex: "\\sqrt{}", title: "Square Root" },
        { label: "ⁿ√", latex: "\\sqrt[n]{}", title: "Nth Root" },
    ],
    "Fractions": [
        { label: "a/b", latex: "\\frac{a}{b}", title: "Fraction" },
    ],
    "Greek Letters": [
        { label: "π", latex: "\\pi", title: "Pi" },
        { label: "θ", latex: "\\theta", title: "Theta" },
        { label: "α", latex: "\\alpha", title: "Alpha" },
        { label: "β", latex: "\\beta", title: "Beta" },
        { label: "Σ", latex: "\\Sigma", title: "Sigma (Sum)" },
        { label: "Δ", latex: "\\Delta", title: "Delta" },
    ],
    "Calculus": [
        { label: "∫", latex: "\\int", title: "Integral" },
        { label: "∑", latex: "\\sum", title: "Summation" },
        { label: "∏", latex: "\\prod", title: "Product" },
        { label: "lim", latex: "\\lim_{x \\to }", title: "Limit" },
    ],
    "Sets": [
        { label: "∈", latex: "\\in", title: "Element Of" },
        { label: "∉", latex: "\\notin", title: "Not Element Of" },
        { label: "⊂", latex: "\\subset", title: "Subset" },
        { label: "∪", latex: "\\cup", title: "Union" },
        { label: "∩", latex: "\\cap", title: "Intersection" },
    ],
};

function renderLatex(text: string): string {
    // Replace $...$ with rendered latex
    return text.replace(/\$([^$]+)\$/g, (match, latex) => {
        try {
            return katex.renderToString(latex, {
                throwOnError: false,
                displayMode: false,
            });
        } catch {
            return match; // Return original if rendering fails
        }
    });
}

export default function MathInput({
    id,
    value,
    onChange,
    placeholder = "Enter text... Use $...$ for math (e.g., $x^2$)",
    disabled = false,
    required = false,
    minHeight = "100px",
    className = "",
}: MathInputProps) {
    const [showPreview, setShowPreview] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertSymbol = (latex: string) => {
        if (!textareaRef.current || disabled) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = value;

        // Wrap in $ if not already in a math context
        let insertText = latex;

        // Check if we're inside a $...$ block
        const beforeCursor = text.substring(0, start);
        const dollarCount = (beforeCursor.match(/\$/g) || []).length;
        const insideMath = dollarCount % 2 === 1;

        if (!insideMath) {
            insertText = `$${latex}$`;
        }

        const newValue = text.substring(0, start) + insertText + text.substring(end);
        onChange(newValue);

        // Set cursor position after insert
        setTimeout(() => {
            const newPos = start + insertText.length;
            textarea.focus();
            textarea.setSelectionRange(newPos, newPos);
        }, 0);
    };

    const previewHtml = renderLatex(value);

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border border-slate-200 rounded-t-md">
                {Object.entries(MATH_SYMBOLS).map(([category, symbols]) => (
                    <div key={category} className="relative">
                        <button
                            type="button"
                            onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                            disabled={disabled}
                            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${activeCategory === category
                                    ? "bg-[#25346A] text-white"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                                } disabled:opacity-50`}
                        >
                            {category}
                        </button>

                        {activeCategory === category && (
                            <div className="absolute top-full left-0 mt-1 z-10 bg-white border border-slate-200 rounded-md shadow-lg p-2 flex flex-wrap gap-1 min-w-[200px]">
                                {symbols.map((symbol, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            insertSymbol(symbol.latex);
                                            setActiveCategory(null);
                                        }}
                                        title={symbol.title}
                                        className="w-8 h-8 flex items-center justify-center text-sm font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                                    >
                                        {symbol.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                <div className="flex-1" />

                <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${showPreview
                            ? "bg-green-600 text-white"
                            : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                        }`}
                >
                    {showPreview ? "Hide Preview" : "Show Preview"}
                </button>
            </div>

            {/* Textarea */}
            <textarea
                ref={textareaRef}
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                className={`w-full px-3 py-2 border border-slate-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-[#f49700] focus:border-transparent resize-none`}
                style={{ minHeight }}
                onClick={() => setActiveCategory(null)}
            />

            {/* Helper Text */}
            <p className="text-xs text-slate-500">
                💡 Tip: Wrap math expressions in dollar signs. Example: <code className="bg-slate-100 px-1 rounded">$x^2 + y^2 = z^2$</code>
            </p>

            {/* Preview */}
            {showPreview && value && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs font-medium text-blue-700 mb-2">Preview:</p>
                    <div
                        className="text-slate-800 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                </div>
            )}
        </div>
    );
}

// Utility function to render LaTeX in display (read-only) contexts
export function MathRenderer({ text, className = "" }: { text: string; className?: string }) {
    const [html, setHtml] = useState("");

    useEffect(() => {
        setHtml(renderLatex(text));
    }, [text]);

    return (
        <span
            className={className}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
