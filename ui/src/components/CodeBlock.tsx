'use client'

import { Check, Copy } from 'lucide-react'
import { useClipboard } from '@/lib/hooks'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
  highlightLines?: number[]
}

export function CodeBlock({
  code,
  language = 'bash',
  filename,
  showLineNumbers = false,
  highlightLines = [],
}: CodeBlockProps) {
  const { copied, copy } = useClipboard(2000)

  const handleCopy = async () => {
    await copy(code)
  }

  const lines = code.split('\n')

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-background-secondary my-4">
      {/* Header */}
      {(filename || language) && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background-tertiary">
          <div className="flex items-center gap-2">
            {filename && (
              <span className="text-sm text-text-secondary font-mono">
                {filename}
              </span>
            )}
            {language && !filename && (
              <span className="text-xs text-text-muted uppercase font-mono">
                {language}
              </span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-text-muted hover:text-text-secondary transition-colors rounded-md hover:bg-background-secondary"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-success" />
                <span className="text-success">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Code content */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono leading-relaxed">
          <code>
            {showLineNumbers ? (
              <div className="flex">
                <div className="flex-shrink-0 pr-4 text-right select-none">
                  {lines.map((_, i) => (
                    <div
                      key={i}
                      className={`${
                        highlightLines.includes(i + 1)
                          ? 'text-accent bg-accent-subtle'
                          : 'text-text-muted'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <div className="flex-1">
                  {lines.map((line, i) => (
                    <div
                      key={i}
                      className={
                        highlightLines.includes(i + 1)
                          ? 'bg-accent-subtle -mx-4 px-4'
                          : ''
                      }
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              code
            )}
          </code>
        </pre>
      </div>
    </div>
  )
}