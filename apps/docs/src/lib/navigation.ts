export type NavItem = {
  title: string;
  href: string;
  badge?: "new" | "beta";
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const navigation: NavSection[] = [
  {
    title: "Introduction",
    items: [
      { title: "Getting Started", href: "/docs/getting-started" },
      { title: "Installation", href: "/docs/installation" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { title: "API Reference", href: "/docs/api-reference" },
      { title: "Formats & Output", href: "/docs/formats-output" },
      { title: "Error Codes", href: "/docs/error-codes" },
    ],
  },
  {
    title: "Features",
    items: [
      { title: "Network Coverage", href: "/docs/network-coverage" },
      { title: "Batch Processing", href: "/docs/batch-processing" },
      { title: "Zod Integration", href: "/docs/zod-integration" },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "Framework Integrations", href: "/docs/framework-integrations" },
      { title: "Validation Patterns", href: "/docs/validation-patterns" },
      { title: "TypeScript", href: "/docs/typescript" },
    ],
  },
  {
    title: "Resources",
    items: [
      { title: "FAQ", href: "/docs/faq" },
      { title: "Migration Guide", href: "/docs/migration-guide" },
      { title: "Changelog", href: "/docs/changelog" },
    ],
  },
  {
    title: "Interactive",
    items: [{ title: "Playground", href: "/playground" }],
  },
];

export function getAllNavItems(): NavItem[] {
  return navigation.flatMap((section) => section.items);
}

export function getPrevNext(currentPath: string): {
  prev: NavItem | null;
  next: NavItem | null;
} {
  const items = getAllNavItems();
  const currentIndex = items.findIndex((item) => item.href === currentPath);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: currentIndex > 0 ? items[currentIndex - 1] : null,
    next: currentIndex < items.length - 1 ? items[currentIndex + 1] : null,
  };
}
