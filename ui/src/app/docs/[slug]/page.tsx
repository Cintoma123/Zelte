import { notFound } from 'next/navigation'
import { DocsLayout } from '@/components/DocsLayout'
import { DocContent } from '@/components/DocContent'
import { docPages } from '@/lib/content'

interface PageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  const slugs = Object.keys(docPages)
  return slugs.map((slug) => ({ slug }))
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = params
  const page = docPages[slug as keyof typeof docPages]

  if (!page) {
    notFound()
  }

  return (
    <DocsLayout 
      title={page.title} 
      description={page.description}
    >
      <DocContent page={page} />
    </DocsLayout>
  )
}