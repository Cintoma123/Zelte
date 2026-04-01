'use client'

import { useState, useEffect } from 'react'
import { Check, X, Clock, Play } from 'lucide-react'

interface TerminalOutputProps {
  output: string
  status?: 'success' | 'error' | 'running'
  showTypewriter?: boolean
  filename?: string
}

export function TerminalOutput({ 
  output, 
  status = 'success', 
  showTypewriter = false,
  filename = 'Terminal'
}: TerminalOutputProps) {
  const [displayedOutput, setDisplayedOutput] = useState('')
  const [isTyping, setIsTyping] = useState(showTypewriter)

  useEffect(() => {
    if (!showTypewriter) {
      setDisplayedOutput(output)
      return
    }

    setIsTyping(true)
    let index = 0
    const interval = setInterval(() => {
      if (index < output.length) {
        setDisplayedOutput(output.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        setIsTyping(false)
      }
    }, 20)

    return () => clearInterval(interval)
  }, [output, showTypewriter])

  const statusConfig = {
    success: {
      icon: <Check className="w-4 h-4 text-success" />,
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
    },
    error: {
      icon: <X className="w-4 h-4 text-error" />,
      bgColor: 'bg-error/10',
      borderColor: 'border-error/30',
    },
    running: {
      icon: <Clock className="w-4 h-4 text-warning animate-pulse" />,
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
    },
  }

  const config = statusConfig[status]

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-background-secondary my-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background-tertiary">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-error/80" />
            <div className="w-3 h-3 rounded-full bg-warning/80" />
            <div className="w-3 h-3 rounded-full bg-success/80" />
          </div>
          <span className="text-sm text-text-secondary font-mono ml-2">
            {filename}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs ${config.bgColor} ${config.borderColor} border`}>
          {config.icon}
          <span className={status === 'success' ? 'text-success' : status === 'error' ? 'text-error' : 'text-warning'}>
            {status === 'success' ? 'Completed' : status === 'error' ? 'Failed' : 'Running'}
          </span>
        </div>
      </div>

      {/* Output content */}
      <div className="p-4 font-mono text-sm overflow-x-auto">
        <pre className="text-text-primary whitespace-pre-wrap">
          {displayedOutput}
          {isTyping && (
            <span className="inline-block w-2 h-4 bg-accent animate-pulse ml-1 align-middle" />
          )}
        </pre>
      </div>
    </div>
  )
}

// Interactive command simulator
interface CommandSimulatorProps {
  command: string
  output: string
  onExecute?: () => void
}

export function CommandSimulator({ command, output, onExecute }: CommandSimulatorProps) {
  const [executed, setExecuted] = useState(false)
  const [showOutput, setShowOutput] = useState(false)

  const handleExecute = () => {
    setExecuted(true)
    setShowOutput(true)
    onExecute?.()
  }

  return (
    <div className="space-y-4">
      {/* Command input simulation */}
      <div className="flex items-center gap-3 p-4 bg-background-secondary border border-border rounded-lg">
        <span className="text-success font-mono">$</span>
        <code className="flex-1 font-mono text-text-primary">
          {command}
        </code>
        {!executed ? (
          <button
            onClick={handleExecute}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Run
          </button>
        ) : (
          <span className="text-text-muted text-sm">✓ Executed</span>
        )}
      </div>

      {/* Output */}
      {showOutput && (
        <TerminalOutput 
          output={output} 
          status="success" 
          showTypewriter={true}
        />
      )}
    </div>
  )
}