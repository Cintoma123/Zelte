# Zelte Documentation UI

A developer-focused documentation website for Zelte - the zero-config API testing CLI tool.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Navigate to the UI directory
cd ui

# Install dependencies
npm install

# Start development server
npm run dev
```

The site will be available at `http://localhost:3000`.

### Building for Production

```bash
# Build static site
npm run build

# Preview production build
npm start
```

The built files will be in the `out/` directory.

## Project Structure

```
ui/
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── docs/        # Documentation pages
│   │   ├── globals.css  # Global styles
│   │   ├── layout.tsx   # Root layout
│   │   └── page.tsx     # Home page
│   ├── components/      # Reusable UI components
│   │   ├── CodeBlock.tsx       # Code block with copy
│   │   ├── DocsLayout.tsx      # Documentation layout
│   │   ├── DocContent.tsx      # Content renderer
│   │   ├── Header.tsx          # Page header
│   │   ├── SearchModal.tsx     # Search functionality
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   └── TerminalOutput.tsx  # Terminal simulation
│   └── lib/             # Utilities and data
│       ├── content.ts   # Documentation content
│       └── navigation.ts # Navigation config
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS config
├── tsconfig.json        # TypeScript config
└── package.json         # Dependencies
```

## Adding New Documentation

### 1. Add Navigation Entry

Edit `src/lib/navigation.ts` to add your page to the sidebar:

```typescript
export const navigation: NavSection[] = [
  {
    title: 'Your Section',
    items: [
      { title: 'Your Page', href: '/docs/your-page' },
    ],
  },
]
```

### 2. Add Content

Edit `src/lib/content.ts` to add your page content:

```typescript
export const yourPage: DocPage = {
  id: 'your-page',
  title: 'Your Page Title',
  description: 'Page description',
  content: [
    {
      heading: 'Section Title',
      content: 'Section content text...',
      codeExamples: [
        {
          filename: 'example.yaml',
          language: 'yaml',
          code: 'key: value',
          output: 'Expected output...',
        },
      ],
    },
  ],
}

// Add to docPages export
export const docPages: Record<string, DocPage> = {
  // ...existing pages
  'your-page': yourPage,
}
```

## Component Usage

### CodeBlock

```tsx
import { CodeBlock } from '@/components'

<CodeBlock
  code="npm install -g zelte"
  language="bash"
  filename="Terminal"
/>
```

### TerminalOutput

```tsx
import { TerminalOutput } from '@/components'

<TerminalOutput
  output="✓ Test passed (123ms)"
  status="success"
  showTypewriter={true}
/>
```

### CommandSimulator

```tsx
import { CommandSimulator } from '@/components'

<CommandSimulator
  command="zelte run collection.yaml"
  output="Collection: My Tests\n\n✓ 5 passed, 0 failed"
/>
```

## Deployment

### Vercel (Recommended)

The UI is configured for automatic deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set the root directory to `ui`
3. Deploy!

### Static Hosting

The `npm run build` command generates a static site in the `out/` directory that can be hosted on any static hosting service.

## CI/CD Separation

This UI is intentionally separated from the CLI package:

- **CLI Package**: Root directory, published to npm
- **UI Package**: `ui/` directory, deployed to Vercel
- **GitHub Actions**: Configured with `paths-ignore: ['ui/**']` to skip UI changes

## Design Principles

1. **Dark mode first**: Default dark theme optimized for developers
2. **Minimalist**: No marketing fluff, pure utility
3. **Fast navigation**: Client-side routing, instant page loads
4. **Copy-focused**: One-click copy for all code blocks
5. **Terminal-inspired**: Monospace fonts, ANSI-style colors

## Contributing

When making changes:

1. Keep the design minimal and developer-focused
2. Ensure all code blocks have copy functionality
3. Test on both desktop and mobile
4. Maintain accessibility standards

## License

MIT - Same as the main Zelte project