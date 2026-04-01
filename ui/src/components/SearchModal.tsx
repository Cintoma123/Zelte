'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { X, Search, FileText, ChevronRight } from 'lucide-react'
import { allNavItems } from '@/lib/navigation'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(allNavItems)

  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(allNavItems)
      return
    }

    const lowerQuery = searchQuery.toLowerCase()
    const filtered = allNavItems.filter(item =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.href.toLowerCase().includes(lowerQuery)
    )
    setResults(filtered)
  }, [])

  useEffect(() => {
    handleSearch(query)
  }, [query, handleSearch])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-background-secondary border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation..."
            className="flex-1 bg-transparent text-text-primary placeholder-text-muted outline-none text-lg"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-background-tertiary rounded transition-colors"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-8 text-center text-text-muted">
              <FileText className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-accent-subtle transition-colors group"
                  onClick={onClose}
                >
                  <FileText className="w-4 h-4 text-text-muted group-hover:text-accent flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-text-primary font-medium truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-text-muted truncate font-mono">
                      {item.href}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-background-tertiary">
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background-secondary border border-border rounded font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-background-secondary border border-border rounded font-mono">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background-secondary border border-border rounded font-mono">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <kbd className="px-1.5 py-0.5 bg-background-secondary border border-border rounded font-mono">esc</kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  )
}