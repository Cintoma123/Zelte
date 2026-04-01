'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight, Terminal } from 'lucide-react'
import { navigation, NavSection } from '@/lib/navigation'

export function Sidebar() {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Getting Started': true,
  })

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border bg-background-secondary h-full overflow-y-auto">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2 text-text-primary hover:text-accent transition-colors">
          <Terminal className="w-5 h-5 text-accent" />
          <span className="font-mono font-bold">ZELTE</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        {navigation.map((section: NavSection) => (
          <div key={section.title} className="mb-6">
            <button
              onClick={() => toggleSection(section.title)}
              className="flex items-center gap-2 w-full text-left text-text-secondary hover:text-text-primary transition-colors mb-2"
            >
              {openSections[section.title] ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <span className="text-sm font-semibold uppercase tracking-wider">
                {section.title}
              </span>
            </button>

            {openSections[section.title] && (
              <ul className="ml-6 space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                        pathname === item.href
                          ? 'bg-accent-subtle text-accent font-medium'
                          : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
                      }`}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border mt-auto">
        <div className="text-xs text-text-muted">
          <p className="mb-1">
            <span className="font-mono">v0.1.0</span>
          </p>
          <a 
            href="https://github.com/Cintoma123/Zelte" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-text-secondary transition-colors"
          >
            GitHub →
          </a>
        </div>
      </div>
    </aside>
  )
}