"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

interface LiveEditorProps {
  content: string;
  onChange: (content: string) => void;
  language: string;
}

export function LiveEditor({ content, onChange, language }: LiveEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    const lines = content.split("\n");
    setLineCount(Math.max(lines.length, 1));
  }, [content]);

  useEffect(() => {
    if (!highlightRef.current) return;

    const highlightCode = (code: string, lang: string) => {
      if (!code) return "";

      // Escape HTML entities first
      let highlighted = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

      if (lang === "javascript" || lang === "typescript") {
        highlighted = highlighted
          .replace(
            /\b(const|let|var|function|return|if|else|for|while|class|import|export|async|await|try|catch|finally)\b/g,
            '<span class="syntax-keyword">$1</span>'
          )
          .replace(
            /\b(true|false|null|undefined)\b/g,
            '<span class="syntax-boolean">$1</span>'
          )
          .replace(
            /&quot;([^&]*)&quot;/g,
            '<span class="syntax-string">&quot;$1&quot;</span>'
          )
          .replace(
            /&#39;([^&]*)&#39;/g,
            '<span class="syntax-string">&#39;$1&#39;</span>'
          )
          .replace(/\/\/.*$/gm, '<span class="syntax-comment">$&</span>');
      } else if (lang === "python") {
        highlighted = highlighted
          .replace(
            /\b(def|class|import|from|if|else|elif|for|while|return|try|except|with|as|lambda|and|or|not|in|is|print)\b/g,
            '<span class="syntax-keyword">$1</span>'
          )
          .replace(
            /\b(True|False|None)\b/g,
            '<span class="syntax-boolean">$1</span>'
          )
          .replace(
            /&quot;([^&]*)&quot;/g,
            '<span class="syntax-string">&quot;$1&quot;</span>'
          )
          .replace(
            /&#39;([^&]*)&#39;/g,
            '<span class="syntax-string">&#39;$1&#39;</span>'
          )
          .replace(/#.*$/gm, '<span class="syntax-comment">$&</span>');
      } else if (lang === "html") {
        highlighted = highlighted
          .replace(
            /&lt;(\/?[a-zA-Z][^&]*?)&gt;/g,
            '<span class="syntax-tag">&lt;$1&gt;</span>'
          )
          .replace(/(\w+)=/g, '<span class="syntax-attribute">$1</span>=')
          .replace(
            /&quot;([^&]*)&quot;/g,
            '<span class="syntax-string">&quot;$1&quot;</span>'
          );
      } else if (lang === "css") {
        highlighted = highlighted
          .replace(
            /([a-zA-Z-]+)(\s*:\s*)/g,
            '<span class="syntax-property">$1</span>$2'
          )
          .replace(
            /(#[a-fA-F0-9]{3,6})/g,
            '<span class="syntax-value">$1</span>'
          )
          .replace(
            /\/\*[\s\S]*?\*\//g,
            '<span class="syntax-comment">$&</span>'
          );
      } else if (lang === "json") {
        highlighted = highlighted
          .replace(
            /&quot;([^&]*)&quot;(\s*:)/g,
            '<span class="syntax-key">&quot;$1&quot;</span>$2'
          )
          .replace(
            /:\s*&quot;([^&]*)&quot;/g,
            ': <span class="syntax-string">&quot;$1&quot;</span>'
          )
          .replace(
            /:\s*(true|false|null)/g,
            ': <span class="syntax-boolean">$1</span>'
          )
          .replace(/:\s*(\d+)/g, ': <span class="syntax-number">$1</span>');
      }

      return highlighted;
    };

    // Update the highlight overlay
    highlightRef.current.innerHTML = highlightCode(content, language);
  }, [content, language]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const lineNumbers = document.getElementById("line-numbers");
    if (lineNumbers && highlightRef.current) {
      lineNumbers.scrollTop = e.currentTarget.scrollTop;
      highlightRef.current.scrollTop = e.currentTarget.scrollTop;
      highlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        content.substring(0, start) + "  " + content.substring(end);
      onChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex h-full w-full bg-gruvbox-bg">
      {/* Add CSS styles for syntax highlighting */}
      <style jsx>{`
        .syntax-keyword {
          color: #b16286;
        }
        .syntax-boolean {
          color: #d65d0e;
        }
        .syntax-string {
          color: #98971a;
        }
        .syntax-comment {
          color: #928374;
        }
        .syntax-tag {
          color: #458588;
        }
        .syntax-attribute {
          color: #b16286;
        }
        .syntax-property {
          color: #458588;
        }
        .syntax-value {
          color: #d65d0e;
        }
        .syntax-key {
          color: #458588;
        }
        .syntax-number {
          color: #d79921;
        }
      `}</style>

      {/* Line Numbers */}
      <div
        id="line-numbers"
        className="w-16 bg-gruvbox-dark border-r border-gruvbox-gray text-gruvbox-gray text-sm font-mono leading-6 py-4 px-2 overflow-hidden select-none flex-shrink-0"
        style={{ fontSize: "14px" }}
      >
        {Array.from({ length: Math.max(lineCount, 50) }, (_, i) => (
          <div key={i + 1} className="text-right pr-2 h-6">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Syntax Highlight Overlay */}
        <pre
          ref={highlightRef}
          className="absolute inset-0 p-4 font-mono text-sm leading-6 pointer-events-none overflow-auto whitespace-pre-wrap break-words"
          style={{
            fontSize: "14px",
            color: language === "plaintext" ? "#ebdbb2" : "inherit",
            margin: 0,
            border: "none",
            background: "transparent",
            zIndex: 1,
          }}
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          placeholder="Start typing your code here..."
          className="absolute inset-0 w-full h-full p-4 bg-transparent font-mono text-sm leading-6 resize-none outline-none border-none"
          style={{
            fontSize: "14px",
            color: language === "plaintext" ? "#ebdbb2" : "transparent",
            caretColor: "#d79921",
            margin: 0,
            background: "transparent",
            zIndex: 2,
          }}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  );
}
