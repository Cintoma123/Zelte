import Link from 'next/link'
import { DocsLayout } from '@/components/DocsLayout'
import { navigation } from '@/lib/navigation'
import { ArrowRight } from 'lucide-react'

export default function DocsPage() {
  return (
    <DocsLayout 
      title="Documentation" 
      description="Learn how to use Zelte"
    >
      <div className="mb-8">
        <p className="text-text-secondary text-lg leading-relaxed">
          Welcome to the Zelte documentation. Here you'll find everything you need 
          to get started with API testing, from basic concepts to advanced features.
        </p>
      </div>

      <div className="grid gap-8">
        {navigation.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
              {section.title}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-start gap-4 p-4 rounded-lg border border-border hover:border-accent bg-background-secondary hover:bg-accent-subtle transition-all"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      {getDescription(item.href)}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors flex-shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DocsLayout>
  )
}

function getDescription(href: string): string {
  const descriptions: Record<string, string> = {
    '/docs/introduction': 'What is Zelte?',
    '/docs/quick-start': 'Get started in 3 commands',
    '/docs/installation': 'Install Zelte on your system',
    '/docs/cli-commands': 'Complete command reference',
    '/docs/collection-format': 'Structure of test collection files',
    '/docs/assertions': 'Validate API responses',
    '/docs/environment-variables': 'Manage configuration and secrets',
    '/docs/graphql-testing': 'Test GraphQL APIs with Zelte',
  }
  
  return descriptions[href] || 'Learn more about this topic'
}