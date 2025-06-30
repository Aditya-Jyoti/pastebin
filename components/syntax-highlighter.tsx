"use client"

import { useEffect, useState } from "react"

interface SyntaxHighlighterProps {
  code: string
  language: string
}

export function SyntaxHighlighter({ code, language }: SyntaxHighlighterProps) {
  const [highlightedCode, setHighlightedCode] = useState<string>("")

  useEffect(() => {
    // Simple syntax highlighting for common languages
    const highlightCode = (code: string, lang: string) => {
      if (lang === "javascript" || lang === "typescript") {
        return code
          .replace(
            /\b(const|let|var|function|return|if|else|for|while|class|import|export)\b/g,
            '<span class="text-purple-400">$1</span>',
          )
          .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-orange-400">$1</span>')
          .replace(/"([^"]*)"/g, '<span class="text-green-400">"$1"</span>')
          .replace(/'([^']*)'/g, "<span class=\"text-green-400\">'$1'</span>")
          .replace(/\/\/.*$/gm, '<span class="text-gray-500">$&</span>')
      }

      if (lang === "python") {
        return code
          .replace(
            /\b(def|class|import|from|if|else|elif|for|while|return|try|except|with|as)\b/g,
            '<span class="text-purple-400">$1</span>',
          )
          .replace(/\b(True|False|None)\b/g, '<span class="text-orange-400">$1</span>')
          .replace(/"([^"]*)"/g, '<span class="text-green-400">"$1"</span>')
          .replace(/'([^']*)'/g, "<span class=\"text-green-400\">'$1'</span>")
          .replace(/#.*$/gm, '<span class="text-gray-500">$&</span>')
      }

      return code
    }

    setHighlightedCode(highlightCode(code, language))
  }, [code, language])

  return (
    <pre className="bg-gruvbox-darker p-4 rounded-lg overflow-x-auto">
      <code
        className="text-gruvbox-fg font-mono text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: highlightedCode || code }}
      />
    </pre>
  )
}
