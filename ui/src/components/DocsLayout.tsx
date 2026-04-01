import { Sidebar } from './Sidebar'
import { Header } from '@/components/Header'

interface DocsLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function DocsLayout({ children, title, description }: DocsLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} description={description} />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}