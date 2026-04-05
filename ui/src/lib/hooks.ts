'use client'

import { useState, useEffect, useCallback } from 'react'

// Theme hook for dark/light mode toggle
export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('zelte-theme') as 'dark' | 'light'
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('light', savedTheme === 'light')
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    }
  }, [])

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('zelte-theme', newTheme)
    document.documentElement.classList.toggle('light', newTheme === 'light')
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }, [theme])

  // Return default theme during SSR to avoid hydration mismatch
  if (!mounted) {
    return { theme: 'dark', toggleTheme, isDark: true }
  }

  return { theme, toggleTheme, isDark: theme === 'dark' }
}

// Keyboard shortcuts hook
export function useKeyboardShortcuts(shortcuts: { [key: string]: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd/Ctrl + key
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        shortcuts['cmd+k']?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Clipboard hook
export function useClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), timeout)
      return true
    } catch {
      return false
    }
  }, [timeout])

  return { copied, copy }
}

// Search hook for client-side search
export function useSearch<T>(
  items: T[],
  keys: (keyof T)[],
  query: string
) {
  return useCallback(() => {
    if (!query.trim()) return items

    const lowerQuery = query.toLowerCase()
    return items.filter(item =>
      keys.some(key => {
        const value = item[key]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerQuery)
        }
        return false
      })
    )
  }, [items, keys, query])
}