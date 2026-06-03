"use client";

import React from "react";
import Editor from "@monaco-editor/react";

interface MonacoEditorProps {
  language: string;
  theme: string;
  value: string;
  onChange: (val: string) => void;
  fontSize: number;
  minimapEnabled: boolean;
  lineNumbers: "on" | "off";
  wordWrap: "on" | "off";
  tabSize: number;
}

export default function MonacoEditor({
  language,
  theme,
  value,
  onChange,
  fontSize,
  minimapEnabled,
  lineNumbers,
  wordWrap,
  tabSize
}: MonacoEditorProps) {
  // Convert standard dynamic slugs to Monaco syntax language mappings
  const monacoLanguage = language === "cpp" ? "cpp" : language;

  return (
    <div className="absolute inset-0 rounded-xl overflow-hidden border border-white/[0.03]">
      <Editor
        height="100%"
        language={monacoLanguage}
        theme={theme}
        value={value}
        onChange={(val) => onChange(val || "")}
        options={{
          fontSize: fontSize,
          minimap: { enabled: minimapEnabled },
          lineNumbers: lineNumbers,
          wordWrap: wordWrap,
          tabSize: tabSize,
          roundedSelection: true,
          scrollBeyondLastLine: false,
          readOnly: false,
          automaticLayout: true,
          fontFamily: "var(--font-mono, monospace)",
          cursorStyle: "line",
          cursorBlinking: "smooth",
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
