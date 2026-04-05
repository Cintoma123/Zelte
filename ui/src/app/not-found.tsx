import Link from 'next/link'
import { Terminal } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <Terminal className="w-12 h-12 text-accent mx-auto mb-6" />
        
        <h1 className="text-6xl font-mono font-bold text-text-primary mb-4">
          404
        </h1>
        
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Page Not Found
        </h2>
        
        <p className="text-text-secondary mb-8">
          The documentation page you're looking for doesn't exist or has been moved.
        </p>

        <div className="bg-background-secondary border border-border rounded-lg p-4 mb-8 font-mono text-sm">
          <span className="text-error">Error:</span> Page not found<br />
          <span className="text-text-muted">Code:</span> 404<br />
          <span className="text-text-muted">Path:</span> unknown
        </div>
        
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
        >
          Back to Documentation
        </Link>
      </div>
    </div>
  )
}