#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Define replacement rules for em dashes
const replacements = [
  // List items and sentence constructions with em dashes
  {
    pattern: /([a-zA-Z0-9])\s*—\s*([a-zA-Z])/g,
    replace: (match, before, after) => {
      // Context-aware replacement
      if (match.includes(':') || match.toLowerCase().includes('risk') || match.toLowerCase().includes('strength')) {
        return `${before}: ${after}`;
      }
      return `${before}. ${after.charAt(0).toUpperCase()}${after.slice(1)}`;
    }
  },
  // Parenthetical phrases with em dashes
  {
    pattern: /\(([^)]+)\)—/g,
    replace: '($1). '
  },
  {
    pattern: /—([^—]+)—/g,
    replace: ' ($1) '
  }
];

function humanizeText(content) {
  let result = content;
  
  // Skip YAML frontmatter and markdown tables
  const lines = content.split('\n');
  const processedLines = lines.map((line, index) => {
    // Skip YAML frontmatter
    if (line.trim() === '---') return line;
    // Skip markdown table separators
    if (/^\s*\|[-:]+\|/.test(line)) return line;
    // Skip if line is just dashes
    if (/^-+$/.test(line)) return line;
    
    // Process the line for em dashes
    let processedLine = line;
    
    // Replace em dashes with contextual punctuation
    processedLine = processedLine.replace(/([A-Za-z0-9])\s*—\s*([a-z])/g, (match, before, after) => {
      // Check context
      const lowerLine = line.toLowerCase();
      
      // For list items starting with bold labels
      if (line.trim().startsWith('-') && line.includes('**')) {
        return `${before}: ${after}`;
      }
      
      // For definitions or explanations
      if (before.endsWith(')') || before.endsWith('"')) {
        return `${before}, ${after}`;
      }
      
      // Default to colon for clarity
      return `${before}. ${after.charAt(0).toUpperCase()}${after.slice(1)}`;
    });
    
    // Handle parenthetical em dashes
    processedLine = processedLine.replace(/\s+—\s+([^—\n]+)\s+—/g, ' ($1)');
    
    return processedLine;
  });
  
  return processedLines.join('\n');
}

async function main() {
  console.log('🔍 Finding markdown files...');
  
  const files = await glob('src/content/**/*.md', {
    ignore: ['**/node_modules/**', '**/_archive/**']
  });
  
  console.log(`📝 Found ${files.length} files to process\n`);
  
  let totalReplacements = 0;
  
  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const originalDashes = (content.match(/[^-]—[^-]/g) || []).length;
    
    if (originalDashes === 0) continue;
    
    const humanized = humanizeText(content);
    const newDashes = (humanized.match(/[^-]—[^-]/g) || []).length;
    const replaced = originalDashes - newDashes;
    
    if (replaced > 0) {
      writeFileSync(file, humanized, 'utf-8');
      console.log(`✅ ${file}`);
      console.log(`   Replaced ${replaced} em dash(es)\n`);
      totalReplacements += replaced;
    }
  }
  
  console.log(`\n✨ Complete! Replaced ${totalReplacements} em dashes across ${files.length} files`);
}

main().catch(console.error);
