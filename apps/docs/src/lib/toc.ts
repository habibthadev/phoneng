export type Heading = {
  depth: number;
  slug: string;
  text: string;
};

export function filterHeadings(headings: Heading[]): Heading[] {
  return headings.filter((h) => h.depth === 2 || h.depth === 3);
}
