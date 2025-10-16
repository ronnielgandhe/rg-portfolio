#!/usr/bin/env python3
"""
Script to replace em dashes with natural language connectors.
Preserves markdown formatting, YAML frontmatter, and code blocks.
"""

import re
import sys
from pathlib import Path

def humanize_line(line: str) -> str:
    """Replace em dashes with contextual punctuation."""
    
    # Skip YAML frontmatter, markdown tables, and horizontal rules
    if line.strip() == '---' or re.match(r'^\s*\|[-:| ]+\|', line) or re.match(r'^-{3,}$', line):
        return line
    
    # Skip code blocks
    if line.strip().startswith('```') or line.strip().startswith('`'):
        return line
    
    original = line
    
    # Pattern 1: Bold label followed by em dash (list items)
    # Example: "**Risk**: Complexity—teams often..." -> "**Risk**: Complexity. Teams often..."
    line = re.sub(
        r'(\*\*[^*]+\*\*:\s+[A-Za-z][^—]+)—([a-z])',
        lambda m: f'{m.group(1)}. {m.group(2).capitalize()}',
        line
    )
    
    # Pattern 2: Em dash after closing parenthesis/quote
    # Example: "(too complex)—something between" -> "(too complex), something between"
    line = re.sub(r'([)\"])—([a-z])', r'\1, \2', line)
    
    # Pattern 3: Em dash in titles (keep for emphasis)
    if line.strip().startswith('#'):
        return line  # Keep em dashes in headings
    
    # Pattern 4: Em dash as definition/explanation
    # Example: "word—definition" -> "word: definition" OR "word. Definition"
    def replace_em_dash(match):
        before, after = match.groups()
        
        # If it's clearly a list item definition
        if line.strip().startswith('-') and '**' in line:
            return f'{before}: {after}'
        
        # If before ends with parenthetical or is a single word
        if before.strip().endswith(')') or len(before.strip().split()) <= 3:
            return f'{before}, {after}'
        
        # Default: make it two sentences
        return f'{before}. {after.capitalize()}'
    
    line = re.sub(
        r'([A-Za-z0-9][^—\n]{1,50})—([a-z][^—\n]*)',
        replace_em_dash,
        line
    )
    
    # Pattern 5: Parenthetical em dashes
    # Example: "text — parenthetical — more" -> "text (parenthetical) more"
    line = re.sub(r'\s+—\s+([^—\n]+?)\s+—\s+', r' (\1) ', line)
    
    return line

def process_file(filepath: Path):
    """Process a markdown file and replace em dashes."""
    print(f"Processing: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    in_code_block = False
    in_frontmatter = False
    frontmatter_count = 0
    processed_lines = []
    changes = 0
    
    for line in lines:
        # Track YAML frontmatter
        if line.strip() == '---':
            frontmatter_count += 1
            if frontmatter_count <= 2:
                in_frontmatter = not in_frontmatter
                processed_lines.append(line)
                continue
        
        # Track code blocks
        if line.strip().startswith('```'):
            in_code_block = not in_code_block
            processed_lines.append(line)
            continue
        
        # Skip processing inside code blocks or frontmatter
        if in_code_block or in_frontmatter:
            processed_lines.append(line)
            continue
        
        # Process the line
        original = line
        humanized = humanize_line(line)
        
        if original != humanized:
            changes += 1
        
        processed_lines.append(humanized)
    
    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(processed_lines)
        print(f"  ✅ Made {changes} changes\n")
        return changes
    else:
        print(f"  ⏭️  No em dashes found\n")
        return 0

def main():
    content_dir = Path('src/content')
    
    # Find all markdown files, excluding archive
    md_files = [
        f for f in content_dir.rglob('*.md')
        if '_archive' not in str(f)
    ]
    
    print(f"Found {len(md_files)} markdown files to process\n")
    print("=" * 60)
    print()
    
    total_changes = 0
    for md_file in md_files:
        changes = process_file(md_file)
        total_changes += changes
    
    print("=" * 60)
    print(f"\n✨ Complete! Made {total_changes} total changes across {len(md_files)} files")

if __name__ == '__main__':
    main()
