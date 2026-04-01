"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Terminal, Zap, Code, BookOpen, ArrowRight, Menu, X, Sun, Moon, Copy, Check } from 'lucide-react'
import { useTheme } from '@/lib/hooks'

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [copiedInstall, setCopiedInstall] = useState(false)
  const { isDark, toggleTheme } = useTheme()

  const handleCopyInstall = async () => {
    try {
      await navigator.clipboard.writeText('npm install -g zelte')
      setCopiedInstall(true)
      setTimeout(() => setCopiedInstall(false), 2000)
    } catch {
      setCopiedInstall(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-0 dark:opacity-100 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.05),transparent_42%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.03),transparent_35%)]" />
        <div className="absolute inset-0 opacity-0 dark:opacity-100 bg-[linear-gradient(180deg,rgba(5,6,8,0.92)_0%,rgba(5,6,8,1)_36%)]" />
        <div className="absolute inset-0 opacity-100 dark:opacity-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.16),transparent_52%),linear-gradient(180deg,rgba(234,240,247,0.62)_0%,rgba(233,238,244,0.95)_38%)]" />
      </div>

      <div className="relative z-10">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-6 h-6 text-accent" />
            <span className="font-mono font-bold text-lg">ZELTE</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/docs" className="text-text-secondary hover:text-text-primary transition-colors">
              Documentation
            </Link>
            <Link href="/docs/quick-start" className="text-text-secondary hover:text-text-primary transition-colors">
              Quick Start
            </Link>
            <a 
              href="https://github.com/Cintoma123/Zelte" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              GitHub
            </a>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background-secondary px-6 py-4">
            <div className="flex flex-col gap-4 text-sm">
              <Link
                href="/docs"
                onClick={() => setMobileMenuOpen(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Documentation
              </Link>
              <Link
                href="/docs/quick-start"
                onClick={() => setMobileMenuOpen(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Quick Start
              </Link>
              <a
                href="https://github.com/Cintoma123/Zelte"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle text-accent text-sm mb-6">
            <Zap className="w-4 h-4" />
            <span>v0.1.0 - Now Available on npm</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
            Zero-Config API Testing<br />
            <span className="text-text-secondary">for Backend Engineers</span>
          </h1>
          
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-8">
            The simplest way to test your APIs. Just write tests and run <code className="px-2 py-1 bg-background-secondary rounded font-mono text-accent">zelte run</code>. 
            Everything else is auto-detected.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/docs/quick-start"
              className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/docs"
              className="flex items-center gap-2 px-6 py-3 border border-border hover:border-text-muted text-text-primary font-medium rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Browse Docs
            </Link>
          </div>
        </div>

        {/* Quick Install */}
        <div className="max-w-2xl mx-auto mb-20">
          <div className="bg-background-secondary border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-muted text-sm">Install globally</span>
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-sm font-mono">bash</span>
                <button
                  onClick={handleCopyInstall}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-text-muted hover:text-text-primary hover:bg-background-tertiary transition-colors"
                  aria-label="Copy install command"
                >
                  {copiedInstall ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-success" />
                      <span className="text-success">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <code className="font-mono text-lg text-text-primary">
              npm install -g zelte
            </code>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <div className="w-10 h-10 bg-accent-subtle rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Zero Configuration</h3>
            <p className="text-text-secondary">
              No flags needed - <code className="font-mono text-accent">zelte run</code> just works. 
              Auto-detects config, env files, and collections.
            </p>
          </div>

          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <div className="w-10 h-10 bg-accent-subtle rounded-lg flex items-center justify-center mb-4">
              <Code className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Simple Syntax</h3>
            <p className="text-text-secondary">
              Write tests like you speak, not like code. 
              YAML and JSON both supported with intuitive assertions.
            </p>
          </div>

          <div className="bg-background-secondary border border-border rounded-lg p-6">
            <div className="w-10 h-10 bg-accent-subtle rounded-lg flex items-center justify-center mb-4">
              <Terminal className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold text-lg mb-2">CLI-First</h3>
            <p className="text-text-secondary">
              Terminal-first design, CI/CD ready. 
              Perfect for automation with JSON output and exit codes.
            </p>
          </div>
        </div>

        {/* Quick Example */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Write Tests in Minutes</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-background-secondary border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <span className="text-text-muted text-sm font-mono">collection.yaml</span>
              </div>
              <pre className="p-4 text-sm font-mono overflow-x-auto">
                <code className="text-text-primary">
{`version: '1.0'
name: Login API

tests:
  - id: login
    name: User Login
    request:
      method: POST
      url: \${baseUrl}/auth/login
      body:
        email: test@mail.com
        password: 123456
    assertions:
      - statusCode === 200
      - body.token !== null`}
                </code>
              </pre>
            </div>

            <div className="bg-background-secondary border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <span className="text-text-muted text-sm font-mono">Terminal</span>
              </div>
              <pre className="p-4 text-sm font-mono overflow-x-auto">
                <code className="text-text-primary">
{`$ zelte run collection.yaml

Collection: Login API

Test Results:
──────────────────────────────
ID      Name        Status
──────────────────────────────
login   User Login  ✓ PASSED

Summary:
  1 passed, 0 failed
  Total: 1 tests in 145ms`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2 text-text-secondary">
              <Terminal className="w-4 h-4" />
              <span className="font-mono text-sm">Zelte</span>
              <span className="text-text-muted">·</span>
              <span className="text-sm">Zero-Config API Testing</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-text-secondary">
              <a href="https://github.com/Cintoma123/Zelte" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary">
                GitHub
              </a>
              <a href="https://www.npmjs.com/package/@nnachebe/zelte" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary">
                npm
              </a>
              <span className="text-text-muted">MIT License</span>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}