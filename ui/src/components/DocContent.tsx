'use client'

import { CodeBlock } from './CodeBlock'
import { DocPage } from '@/lib/content'

interface DocContentProps {
  page: DocPage
}

export function DocContent({ page }: DocContentProps) {
  return (
    <div className="prose prose-invert prose-code:text-accent max-w-none">
      {page.content.map((section, index) => (
        <section key={index} className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            {section.heading}
          </h2>
          
          {section.content && (
            <p className="text-text-secondary leading-relaxed mb-4">
              {section.content}
            </p>
          )}

          {section.codeExamples && section.codeExamples.map((example, exIndex) => (
            <div key={exIndex}>
              <CodeBlock
                code={example.code}
                language={example.language}
                filename={example.filename}
              />
              
              {example.output && (
                <div className="mt-2 mb-4">
                  <CodeBlock
                    code={example.output}
                    language="text"
                    filename="Output"
                  />
                </div>
              )}
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}