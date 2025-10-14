#!/usr/bin/env node
/**
 * fix-dashes.ts
 * Recursively converts double hyphens to em dashes in blog markdown files.
 * 
 * Usage: npm run fix:dashes
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, extname } from 'path';

const BLOG_DIR = './src/content/blog';
const DRY_RUN = false; // Set to true to preview changes without writing

interface Change {
  file: string;
  linesBefore: number;
  linesAfter: number;
  occurrences: number;
}

/**
 * Recursively find all .md files in a directory.
 */
async function findMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        return findMarkdownFiles(path);
      } else if (entry.isFile() && extname(entry.name) === '.md') {
        return [path];
      }
      return [];
    })
  );
  return files.flat();
}

/**
 * Convert double hyphens to em dashes in text.
 * 
 * Rules:
 * 1. " -- " (space-dash-dash-space) → " — " (space-emdash-space)
 * 2. "word--word" → "word—word" (no spaces)
 * 3. Avoid touching code blocks (lines starting with 4+ spaces or within ```)
 * 4. Avoid touching frontmatter (lines between --- markers)
 */
function fixDashes(content: string): { fixed: string; count: number } {
  const lines = content.split('\n');
  const fixedLines: string[] = [];
  let count = 0;
  let inCodeBlock = false;
  let inFrontmatter = false;
  let frontmatterCount = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Track frontmatter (YAML between --- markers)
    if (line.trim() === '---') {
      frontmatterCount++;
      if (frontmatterCount <= 2) {
        inFrontmatter = !inFrontmatter;
        fixedLines.push(line);
        continue;
      }
    }

    // Track code blocks (```)
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      fixedLines.push(line);
      continue;
    }

    // Skip lines in code blocks, frontmatter, or indented code (4+ spaces)
    if (inCodeBlock || inFrontmatter || line.startsWith('    ')) {
      fixedLines.push(line);
      continue;
    }

    // Apply transformations
    const before = line;

    // Pattern 1: " -- " → " — "
    line = line.replace(/ -- /g, ' — ');

    // Pattern 2: "word--word" → "word—word" (avoid HTML comments <!-- -->)
    // Negative lookbehind/lookahead to avoid HTML comments
    line = line.replace(/([^\s<-])--([^\s>-])/g, '$1—$2');

    if (line !== before) {
      count++;
    }

    fixedLines.push(line);
  }

  return { fixed: fixedLines.join('\n'), count };
}

/**
 * Process a single markdown file.
 */
async function processFile(filePath: string): Promise<Change | null> {
  const content = await readFile(filePath, 'utf-8');
  const { fixed, count } = fixDashes(content);

  if (count === 0) {
    return null; // No changes needed
  }

  if (!DRY_RUN) {
    await writeFile(filePath, fixed, 'utf-8');
  }

  return {
    file: filePath,
    linesBefore: content.split('\n').length,
    linesAfter: fixed.split('\n').length,
    occurrences: count,
  };
}

/**
 * Main execution.
 */
async function main() {
  console.log('🔍 Scanning for markdown files...');
  const files = await findMarkdownFiles(BLOG_DIR);
  console.log(`   Found ${files.length} files\n`);

  console.log('🔧 Processing files...');
  const changes: Change[] = [];

  for (const file of files) {
    const change = await processFile(file);
    if (change) {
      changes.push(change);
      const status = DRY_RUN ? '[DRY RUN]' : '✓';
      console.log(`   ${status} ${change.file} (${change.occurrences} changes)`);
    }
  }

  console.log('\n📊 Summary:');
  if (changes.length === 0) {
    console.log('   No double hyphens found. All files are clean!');
  } else {
    const totalOccurrences = changes.reduce((sum, c) => sum + c.occurrences, 0);
    console.log(`   Files changed: ${changes.length}`);
    console.log(`   Total occurrences fixed: ${totalOccurrences}`);

    if (DRY_RUN) {
      console.log('\n   [DRY RUN MODE] No files were modified.');
      console.log('   Set DRY_RUN = false to apply changes.');
    } else {
      console.log('\n   ✅ All changes applied successfully!');
    }
  }
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
