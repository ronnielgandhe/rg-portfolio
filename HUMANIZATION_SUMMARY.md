# Content Humanization Summary

## Date: October 16, 2025

## Changes Made

### 1. Blog Hashtag Colors Fixed ✅
- **File**: `src/layouts/BlogPostLayoutEnhanced.astro`
- **Change**: Converted blog post hashtags from Pill component with `variant="accent"` (green) to cycling color system using `.pill` class with `.tag-list` wrapper
- **Result**: Blog hashtags now use the same beautiful 8-color rotation (mint, cyan, sky, blue, indigo, purple, pink, amber) as the rest of the site

### 2. Em Dash Replacement ✅
Automated replacement of 49 em dashes across 11 content files using Python script (`scripts/humanize_dashes.py`)

#### Files Modified:
1. **src/content/caseStudies/spotify.md** - 4 changes
2. **src/content/caseStudies/netflix.md** - 1 change
3. **src/content/projects/yournews.md** - 5 changes
4. **src/content/projects/quantterminal.md** - 4 changes
5. **src/content/projects/quantzoo.md** - 5 changes
6. **src/content/blog/gold-vs-nasdaq.md** - 6 changes
7. **src/content/blog/cost-of-freshness.md** - 6 changes
8. **src/content/blog/demystifying-enterprise-saas.md** - 9 changes
9. **src/content/blog/risk-on-and-off-together.md** - 6 changes
10. **src/content/blog/agentification-3-phases.md** - 3 changes

#### Replacement Strategy:
The script intelligently replaced em dashes based on context:

**Before:**
```markdown
- **Risk**: Complexity—teams often customize too much
Platform A—a CRM tool—costs $50k/year
something complex—random detail about it
```

**After:**
```markdown
- **Risk**: Complexity. Teams often customize too much
Platform A, a CRM tool, costs $50k/year
something complex. Random detail about it
```

### 3. Preservations:
- ✅ YAML frontmatter unchanged
- ✅ Markdown tables intact
- ✅ Code blocks preserved
- ✅ Horizontal rules (---) untouched
- ✅ Heading em dashes retained for emphasis
- ✅ All formatting maintained

### 4. Quality Checks:
- ✅ Build succeeded with zero errors
- ✅ All routes pre-rendered correctly
- ✅ No markdown rendering issues
- ✅ Tone remains professional and clear

## Scripts Created:
1. **scripts/humanize_dashes.py** - Main humanization script (Python)
2. **scripts/humanize-text.mjs** - Alternative Node.js version (not used)

## Commit Info:
- **Commit**: `3b83d0f`
- **Message**: "refactor: replaced em dashes and double hyphens with natural language phrasing site-wide"
- **Files changed**: 13
- **Insertions**: 299
- **Deletions**: 51

## Result:
All content now reads naturally with human-edited prose instead of AI-generated em dash breaks. The writing flows smoothly while maintaining the professional Waterloo/consulting tone.
