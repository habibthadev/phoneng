import { useEffect, useState, useCallback, useRef } from "react";
import { create, search as oramaSearch, insertMultiple } from "@orama/orama";
import type { AnyOrama } from "@orama/orama";
import {
  Search,
  FileText,
  ArrowRight,
  CornerDownLeft,
  Hash,
} from "lucide-react";

interface SearchDocument {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  headings: Array<{ level: number; text: string; id: string }>;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  preview: string;
  breadcrumb?: string;
  type: "page" | "heading";
}

function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return text;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  return text.replace(
    regex,
    '<mark class="bg-transparent text-[var(--color-accent)] font-medium underline decoration-[var(--color-accent)]/40 underline-offset-2">$1</mark>',
  );
}

function extractPreview(
  content: string,
  query: string,
  maxLen: number = 150,
): string {
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerContent.indexOf(lowerQuery);

  if (idx === -1) {
    return content.slice(0, maxLen) + (content.length > maxLen ? "..." : "");
  }

  const start = Math.max(0, idx - 50);
  const end = Math.min(content.length, idx + query.length + 100);
  let preview = content.slice(start, end);

  if (start > 0) preview = "..." + preview;
  if (end < content.length) preview = preview + "...";

  return preview;
}

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [db, setDb] = useState<AnyOrama | null>(null);
  const [documents, setDocuments] = useState<SearchDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const initializeSearch = useCallback(async () => {
    if (db) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/search-index.json");
      if (!response.ok) {
        throw new Error("Search index not available");
      }

      const docs: SearchDocument[] = await response.json();
      setDocuments(docs);

      const database = await create({
        schema: {
          id: "string",
          title: "string",
          description: "string",
          content: "string",
          url: "string",
        },
      });

      await insertMultiple(database, docs);
      setDb(database);
    } catch {
      setError("Run pnpm build to enable search");
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!db || !searchQuery.trim()) {
        setResults([]);
        setSelectedIndex(0);
        return;
      }

      const searchResults = await oramaSearch(
        db as AnyOrama,
        {
          term: searchQuery,
          properties: ["title", "description", "content"],
          limit: 6,
        } as Parameters<typeof oramaSearch>[1],
      );

      const mappedResults: SearchResult[] = [];
      const lowerQuery = searchQuery.toLowerCase();

      for (const hit of searchResults.hits) {
        const hitDoc = hit.document as SearchDocument;
        const doc = documents.find((d) => d.id === hitDoc.id);
        const content = (doc?.content || hitDoc.content) as string;
        const preview = extractPreview(content, searchQuery);
        const pageTitle = hitDoc.title as string;
        const pageUrl = hitDoc.url as string;

        mappedResults.push({
          id: hitDoc.id as string,
          title: pageTitle,
          description: hitDoc.description as string,
          url: pageUrl,
          preview,
          breadcrumb: "Documentation",
          type: "page",
        });

        if (doc?.headings) {
          const matchingHeadings = doc.headings.filter((h: { text: string }) =>
            h.text.toLowerCase().includes(lowerQuery),
          );

          for (const heading of matchingHeadings.slice(0, 2)) {
            mappedResults.push({
              id: `${hitDoc.id}-${heading.id}`,
              title: heading.text,
              description: "",
              url: `${pageUrl}#${heading.id}`,
              preview: "",
              breadcrumb: `Documentation > ${pageTitle}`,
              type: "heading",
            });
          }
        }
      }

      setResults(mappedResults.slice(0, 10));
      setSelectedIndex(0);
    },
    [db, documents],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      initializeSearch();
      setTimeout(() => inputRef.current?.focus(), 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen, initializeSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 80);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  useEffect(() => {
    const selected = resultsRef.current?.querySelector(
      `[data-result-index="${selectedIndex}"]`,
    ) as HTMLElement | null;
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const itemCount = query.trim() === "" ? quickLinks.length : results.length;

    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, itemCount - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (query.trim() === "") {
          if (quickLinks[selectedIndex]) {
            window.location.href = quickLinks[selectedIndex].url;
          }
        } else if (results[selectedIndex]) {
          window.location.href = results[selectedIndex].url;
        }
        break;
    }
  };

  const quickLinks = [
    {
      title: "Getting Started",
      description: "Install and use phoneng",
      url: "/docs/getting-started",
    },
    {
      title: "API Reference",
      description: "Complete function docs",
      url: "/docs/api-reference",
    },
    {
      title: "Network Detection",
      description: "Identify carriers",
      url: "/docs/network-coverage",
    },
    {
      title: "TypeScript",
      description: "Type-safe parsing",
      url: "/docs/typescript",
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-secondary-label)] transition-colors hover:bg-[var(--color-fill)] hover:text-[var(--color-label)]"
        aria-label="Search documentation (⌘K)"
      >
        <Search size={18} strokeWidth={2} aria-hidden="true" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100] bg-[var(--color-bg)]/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-x-0 top-0 z-[101] mx-auto w-full max-w-[600px] px-4 pt-4"
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-label="Search documentation"
          >
            <div className="overflow-hidden rounded-xl border border-[var(--color-separator)] bg-[var(--color-bg)]">
              <div className="flex items-center gap-3 px-4 py-3">
                <Search
                  size={18}
                  strokeWidth={2}
                  className="shrink-0 text-[var(--color-tertiary-label)]"
                  aria-hidden="true"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search documentation..."
                  className="flex-1 bg-transparent font-display text-[16px] text-[var(--color-label)] outline-none placeholder:text-[var(--color-tertiary-label)]"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="shrink-0 rounded-md border border-[var(--color-separator)] bg-[var(--color-bg-secondary)] px-2 py-1 font-mono text-[11px] text-[var(--color-tertiary-label)] transition-colors hover:bg-[var(--color-fill)]"
                >
                  ESC
                </button>
              </div>

              <div
                className="max-h-[min(380px,60vh)] overflow-y-auto border-t border-[var(--color-separator)]"
                ref={resultsRef}
              >
                {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
                  </div>
                )}

                {error && (
                  <p className="px-4 py-12 text-center font-display text-sm text-[var(--color-tertiary-label)]">
                    {error}
                  </p>
                )}

                {!isLoading && !error && query.trim() === "" && (
                  <div className="p-3">
                    <p className="mb-2 px-2 font-display text-[11px] font-medium uppercase tracking-wider text-[var(--color-tertiary-label)]">
                      Documentation
                    </p>
                    {quickLinks.map((link, index) => (
                      <a
                        key={link.url}
                        href={link.url}
                        data-result-index={index}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${index === selectedIndex ? "bg-[var(--color-accent)] text-white" : "hover:bg-[var(--color-fill)]"}`}
                        onClick={() => setIsOpen(false)}
                      >
                        <FileText
                          size={16}
                          strokeWidth={2}
                          className={
                            index === selectedIndex
                              ? "text-white/70"
                              : "text-[var(--color-tertiary-label)]"
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate font-display text-sm font-medium ${index === selectedIndex ? "" : "text-[var(--color-label)]"}`}
                          >
                            {link.title}
                          </p>
                          <p
                            className={`truncate font-display text-xs ${index === selectedIndex ? "text-white/70" : "text-[var(--color-secondary-label)]"}`}
                          >
                            {link.description}
                          </p>
                        </div>
                        <ArrowRight
                          size={14}
                          strokeWidth={2}
                          className={
                            index === selectedIndex
                              ? "text-white/70"
                              : "text-[var(--color-quaternary-label)]"
                          }
                        />
                      </a>
                    ))}
                  </div>
                )}

                {!isLoading &&
                  !error &&
                  query.trim() !== "" &&
                  results.length === 0 && (
                    <p className="px-4 py-12 text-center font-display text-sm text-[var(--color-tertiary-label)]">
                      No results for "{query}"
                    </p>
                  )}

                {!isLoading && !error && results.length > 0 && (
                  <div className="p-2">
                    {results.map((result, index) => (
                      <a
                        key={`${result.id}-${index}`}
                        href={result.url}
                        data-result-index={index}
                        onClick={() => setIsOpen(false)}
                        className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                          index === selectedIndex
                            ? "bg-[var(--color-fill)]"
                            : "hover:bg-[var(--color-fill)]/50"
                        }`}
                      >
                        {result.type === "heading" ? (
                          <Hash
                            size={14}
                            strokeWidth={2}
                            className="mt-0.5 shrink-0 text-[var(--color-tertiary-label)]"
                          />
                        ) : (
                          <FileText
                            size={14}
                            strokeWidth={2}
                            className="mt-0.5 shrink-0 text-[var(--color-tertiary-label)]"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-tertiary-label)] mb-0.5">
                            <span className="font-display truncate">
                              {result.breadcrumb}
                            </span>
                          </div>
                          <div
                            className="font-display text-[14px] font-medium text-[var(--color-label)] truncate"
                            dangerouslySetInnerHTML={{
                              __html: highlightMatch(result.title, query),
                            }}
                          />
                          {result.preview && (
                            <p
                              className="line-clamp-1 font-display text-[12px] leading-relaxed text-[var(--color-secondary-label)] mt-0.5"
                              dangerouslySetInnerHTML={{
                                __html: highlightMatch(result.preview, query),
                              }}
                            />
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-[var(--color-separator)] bg-[var(--color-bg-secondary)] px-4 py-2">
                <div className="flex items-center gap-4 font-mono text-[10px] text-[var(--color-tertiary-label)]">
                  <span className="flex items-center gap-1">
                    <CornerDownLeft size={11} strokeWidth={2} />
                    select
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="flex">↑↓</span>
                    navigate
                  </span>
                </div>
                <span className="font-display text-[10px] text-[var(--color-quaternary-label)]">
                  Search by Orama
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
