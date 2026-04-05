export interface NavItem {
  title: string
  href: string
  items?: NavItem[]
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const navigation: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/docs/introduction' },
      { title: 'Quick Start', href: '/docs/quick-start' },
      { title: 'Installation', href: '/docs/installation' },
    ],
  },
  {
    title: 'Core Concepts',
    items: [
      { title: 'CLI Commands', href: '/docs/cli-commands' },
      { title: 'Collection Format', href: '/docs/collection-format' },
      { title: 'Assertions', href: '/docs/assertions' },
      { title: 'Environment Variables', href: '/docs/environment-variables' },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { title: 'GraphQL Testing', href: '/docs/graphql-testing' },
    ],
  },
]

export const allNavItems: NavItem[] = navigation.flatMap(section => 
  section.items.flatMap(item => [
    item,
    ...(item.items || [])
  ])
)