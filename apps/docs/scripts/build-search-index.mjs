import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, relative, basename } from "node:path";
import { existsSync } from "node:fs";

const CONTENT_DIR = join(process.cwd(), "src/content/docs");
const OUTPUT_DIR = join(process.cwd(), "public");
const OUTPUT_FILE = join(OUTPUT_DIR, "search-index.json");

async function getAllMdxFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllMdxFiles(fullPath)));
    } else if (entry.name.endsWith(".mdx") || entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { title: "", description: "" };

  const frontmatter = match[1];
  const title = frontmatter.match(/title:\s*["']?([^"'\n]+)["']?/)?.[1] || "";
  const description =
    frontmatter.match(/description:\s*["']?([^"'\n]+)["']?/)?.[1] || "";

  return { title: title.trim(), description: description.trim() };
}

function extractTextContent(content) {
  let text = content.replace(/^---\n[\s\S]*?\n---\n?/, "");

  text = text.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/`[^`]+`/g, "");
  text = text.replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, "");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  text = text.replace(/#{1,6}\s+/g, "");
  text = text.replace(/[*_~]+/g, "");
  text = text.replace(/\n{2,}/g, "\n");
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

function generateSlug(filePath) {
  const relativePath = relative(CONTENT_DIR, filePath);
  const slug = relativePath
    .replace(/\.mdx?$/, "")
    .replace(/index$/, "")
    .replace(/\\/g, "/");

  if (!slug || slug === "/") return "/docs";
  return `/docs/${slug}`;
}

function extractHeadings(content) {
  const headings = [];
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  let match;

  const bodyContent = content.replace(/^---\n[\s\S]*?\n---\n?/, "");

  while ((match = headingRegex.exec(bodyContent)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    headings.push({ level, text, id });
  }

  return headings;
}

async function buildSearchIndex() {
  console.log("Building search index...");

  if (!existsSync(CONTENT_DIR)) {
    console.error(`Content directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }

  const files = await getAllMdxFiles(CONTENT_DIR);
  console.log(`Found ${files.length} documentation files`);

  const documents = [];

  for (const filePath of files) {
    const content = await readFile(filePath, "utf-8");
    const { title, description } = extractFrontmatter(content);
    const textContent = extractTextContent(content);
    const slug = generateSlug(filePath);
    const headings = extractHeadings(content);

    if (title) {
      documents.push({
        id: slug,
        title,
        description,
        content: textContent.slice(0, 2000),
        url: slug,
        headings,
      });
    }
  }

  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  await writeFile(OUTPUT_FILE, JSON.stringify(documents, null, 2));
  console.log(`Search index built: ${documents.length} documents`);
  console.log(`Output: ${OUTPUT_FILE}`);
}

buildSearchIndex().catch(console.error);
