// Copy code functionality for code blocks

export function initCopyButtons() {
  const copyButtons = document.querySelectorAll('[data-code-copy]');

  copyButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      // Find the code block
      const codeBlock = button.closest('.code-block');
      if (!codeBlock) return;

      // Find the pre > code element
      const codeElement = codeBlock.querySelector('pre code');
      if (!codeElement) return;

      const code = codeElement.textContent || '';

      try {
        await navigator.clipboard.writeText(code);

        // Update button text
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');

        // Reset after 2 seconds
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
        button.textContent = 'Error';

        setTimeout(() => {
          button.textContent = 'Copy';
        }, 2000);
      }
    });
  });
}

// Initialize on DOMContentLoaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCopyButtons);
  } else {
    initCopyButtons();
  }
}
