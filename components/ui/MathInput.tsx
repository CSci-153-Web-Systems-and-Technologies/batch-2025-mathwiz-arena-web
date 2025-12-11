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
    "Equations": [
        // Fractions & Powers
        { label: "a/b", latex: "\\frac{a}{b}", title: "Fraction" },
        { label: "x²", latex: "^{2}", title: "Squared" },
        { label: "x³", latex: "^{3}", title: "Cubed" },
        { label: "xⁿ", latex: "^{n}", title: "Power" },
        { label: "xₙ", latex: "_{n}", title: "Subscript" },
        { label: "√", latex: "\\sqrt{}", title: "Square Root" },
        { label: "³√", latex: "\\sqrt[3]{}", title: "Cube Root" },
        { label: "ⁿ√", latex: "\\sqrt[n]{}", title: "Nth Root" },
        // Brackets
        { label: "|x|", latex: "\\left|x\\right|", title: "Absolute Value" },
        { label: "⌊x⌋", latex: "\\lfloor x \\rfloor", title: "Floor" },
        { label: "⌈x⌉", latex: "\\lceil x \\rceil", title: "Ceiling" },
        // Trigonometry
        { label: "sin", latex: "\\sin", title: "Sine" },
        { label: "cos", latex: "\\cos", title: "Cosine" },
        { label: "tan", latex: "\\tan", title: "Tangent" },
        { label: "sin⁻¹", latex: "\\sin^{-1}", title: "Inverse Sine" },
        { label: "cos⁻¹", latex: "\\cos^{-1}", title: "Inverse Cosine" },
        { label: "tan⁻¹", latex: "\\tan^{-1}", title: "Inverse Tangent" },
        // Logarithms
        { label: "log", latex: "\\log", title: "Logarithm" },
        { label: "ln", latex: "\\ln", title: "Natural Log" },
        { label: "logₐ", latex: "\\log_{a}", title: "Log Base a" },
        // Calculus
        { label: "∫", latex: "\\int", title: "Integral" },
        { label: "∫ₐᵇ", latex: "\\int_{a}^{b}", title: "Definite Integral" },
        { label: "∑", latex: "\\sum", title: "Summation" },
        { label: "∑ₙ", latex: "\\sum_{n=1}^{}", title: "Sum from n" },
        { label: "∏", latex: "\\prod", title: "Product" },
        { label: "lim", latex: "\\lim_{x \\to }", title: "Limit" },
        { label: "d/dx", latex: "\\frac{d}{dx}", title: "Derivative" },
        // Combinatorics
        { label: "n!", latex: "n!", title: "Factorial" },
        { label: "nCr", latex: "\\binom{n}{r}", title: "Combination" },
        // Geometry
        { label: "⃗", latex: "\\vec{}", title: "Vector" },
        { label: "‾", latex: "\\overline{}", title: "Line Segment" },
    ],
    "Symbols": [
        // Basic operators
        { label: "×", latex: "\\times", title: "Multiplication" },
        { label: "÷", latex: "\\div", title: "Division" },
        { label: "±", latex: "\\pm", title: "Plus/Minus" },
        { label: "·", latex: "\\cdot", title: "Dot" },
        // Comparisons
        { label: "≠", latex: "\\neq", title: "Not Equal" },
        { label: "≈", latex: "\\approx", title: "Approximately" },
        { label: "≤", latex: "\\leq", title: "Less or Equal" },
        { label: "≥", latex: "\\geq", title: "Greater or Equal" },
        { label: "∞", latex: "\\infty", title: "Infinity" },
        // Geometry
        { label: "∠", latex: "\\angle", title: "Angle" },
        { label: "°", latex: "^{\\circ}", title: "Degree" },
        { label: "△", latex: "\\triangle", title: "Triangle" },
        { label: "□", latex: "\\square", title: "Square" },
        { label: "⊥", latex: "\\perp", title: "Perpendicular" },
        { label: "∥", latex: "\\parallel", title: "Parallel" },
        { label: "≅", latex: "\\cong", title: "Congruent" },
        { label: "∼", latex: "\\sim", title: "Similar" },
        // Greek Letters
        { label: "π", latex: "\\pi", title: "Pi" },
        { label: "θ", latex: "\\theta", title: "Theta" },
        { label: "α", latex: "\\alpha", title: "Alpha" },
        { label: "β", latex: "\\beta", title: "Beta" },
        { label: "γ", latex: "\\gamma", title: "Gamma" },
        { label: "δ", latex: "\\delta", title: "Delta" },
        { label: "Δ", latex: "\\Delta", title: "Delta (big)" },
        { label: "ε", latex: "\\epsilon", title: "Epsilon" },
        { label: "λ", latex: "\\lambda", title: "Lambda" },
        { label: "σ", latex: "\\sigma", title: "Sigma" },
        { label: "Σ", latex: "\\Sigma", title: "Sigma (big)" },
        { label: "φ", latex: "\\phi", title: "Phi" },
        { label: "ω", latex: "\\omega", title: "Omega" },
        // Sets & Logic
        { label: "∈", latex: "\\in", title: "Element Of" },
        { label: "∉", latex: "\\notin", title: "Not Element Of" },
        { label: "⊂", latex: "\\subset", title: "Subset" },
        { label: "∪", latex: "\\cup", title: "Union" },
        { label: "∩", latex: "\\cap", title: "Intersection" },
        { label: "∅", latex: "\\emptyset", title: "Empty Set" },
        { label: "∀", latex: "\\forall", title: "For All" },
        { label: "∃", latex: "\\exists", title: "Exists" },
        { label: "∴", latex: "\\therefore", title: "Therefore" },
        // Number Sets
        { label: "ℕ", latex: "\\mathbb{N}", title: "Natural Numbers" },
        { label: "ℤ", latex: "\\mathbb{Z}", title: "Integers" },
        { label: "ℚ", latex: "\\mathbb{Q}", title: "Rationals" },
        { label: "ℝ", latex: "\\mathbb{R}", title: "Real Numbers" },
        { label: "ℂ", latex: "\\mathbb{C}", title: "Complex" },
        // Arrows
        { label: "→", latex: "\\rightarrow", title: "Right Arrow" },
        { label: "←", latex: "\\leftarrow", title: "Left Arrow" },
        { label: "⇒", latex: "\\Rightarrow", title: "Implies" },
        { label: "⇔", latex: "\\Leftrightarrow", title: "If and Only If" },
        // Partial
        { label: "∂", latex: "\\partial", title: "Partial" },
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

// Inline Math Input for single-line fields (options, answers)
interface MathInputInlineProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

export function MathInputInline({
    value,
    onChange,
    placeholder = "Enter value... Use $...$ for math",
    disabled = false,
    required = false,
    className = "",
}: MathInputInlineProps) {
    const [showPreview, setShowPreview] = useState(false);
    const previewHtml = renderLatex(value);

    return (
        <div className={`flex-1 ${className}`}>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className="flex-1 h-10 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f49700] focus:border-transparent text-sm"
                />
                {value && value.includes("$") && (
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${showPreview
                            ? "bg-green-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                    >
                        {showPreview ? "Hide" : "Preview"}
                    </button>
                )}
            </div>
            {showPreview && value && (
                <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                    <MathRenderer text={value} />
                </div>
            )}
        </div>
    );
}

// Math Answer Input specifically for mathletes during competitions
interface MathAnswerInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function MathAnswerInput({
    value,
    onChange,
    placeholder = "Type your answer here... Use $...$ for math (e.g., $x^2$)",
    disabled = false,
}: MathAnswerInputProps) {
    const [showPreview, setShowPreview] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const insertSymbol = (latex: string) => {
        if (!inputRef.current || disabled) return;

        const input = inputRef.current;
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
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
            input.focus();
            input.setSelectionRange(newPos, newPos);
        }, 0);
    };

    return (
        <div className="space-y-2">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1">
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
                                        title={`${symbol.title} (${symbol.latex})`}
                                        disabled={disabled}
                                        className="px-2 py-1 text-sm bg-slate-50 hover:bg-slate-100 rounded transition-colors flex items-center gap-1 disabled:opacity-50"
                                    >
                                        <span className="font-medium">{symbol.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Preview Toggle */}
                <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    disabled={disabled}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${showPreview
                        ? "bg-green-600 text-white"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                        } disabled:opacity-50`}
                >
                    {showPreview ? "Hide Preview" : "Show Preview"}
                </button>
            </div>

            {/* Input Field */}
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full px-4 py-3 text-lg bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:border-[#25346A] disabled:opacity-50 transition-colors"
            />

            {/* Preview */}
            {showPreview && value && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-medium text-blue-700 mb-2">Preview:</p>
                    <div className="text-lg text-slate-800">
                        <MathRenderer text={value} />
                    </div>
                </div>
            )}
        </div>
    );
}
