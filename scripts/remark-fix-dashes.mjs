/**
 * remark-fix-dashes.mjs
 * Remark plugin to convert double hyphens to em dashes in markdown.
 */

import { visit } from 'unist-util-visit';

/**
 * Remark plugin that converts -- to — in text nodes.
 * Respects code blocks and inline code.
 */
export default function remarkFixDashes() {
  return (tree) => {
    visit(tree, 'text', (node) => {
      if (node.value && typeof node.value === 'string') {
        // Pattern 1: " -- " → " — "
        node.value = node.value.replace(/ -- /g, ' — ');
        
        // Pattern 2: "word--word" → "word—word"
        // Avoid HTML comments (<!--, -->)
        node.value = node.value.replace(/([^\s<-])--([^\s>-])/g, '$1—$2');
      }
    });
  };
}
