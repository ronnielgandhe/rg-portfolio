import { a as createComponent, r as renderTemplate, b as renderComponent, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_CMNnM6uP.mjs';
import 'kleur/colors';
import { g as getCollection } from '../chunks/_astro_content_DHSJqmY8.mjs';
import { $ as $$Layout, N as Nav } from '../chunks/Nav_BaHoY3hY.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const posts = await getCollection("blog");
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime()
  );
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Blog - Ronniel Gandhe", "description": "Technical writing on systematic trading, infrastructure, and software engineering", "canonical": "https://ronnielgandhe.com/blog" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", Nav, { "currentPath": "/blog" })} ${maybeRenderHead()}<main class="min-h-screen bg-bg pt-12"> <div class="max-w-4xl mx-auto px-4 py-12"> <!-- Header --> <div class="mb-12"> <h1 class="text-3xl font-bold text-ink mb-4">Blog</h1> <p class="text-ink-mute">
Technical writing on systematic trading, infrastructure, and software engineering.
</p> </div> <!-- Posts --> <div class="space-y-8"> ${sortedPosts.map((post) => renderTemplate`<article class="group"> <a${addAttribute(`/blog/${post.data.slug}`, "href")} class="block p-6 bg-bg-soft border border-border rounded-xl hover:border-accent/30 transition-apple"> <div class="flex items-start justify-between mb-3"> <h2 class="text-xl font-semibold text-ink group-hover:text-accent transition-apple"> ${post.data.title} </h2> <time class="text-ink-mute text-sm whitespace-nowrap ml-4"> ${formatDate(post.data.publishedAt)} </time> </div> <p class="text-ink-mute leading-relaxed mb-4"> ${post.data.summary} </p> <div class="flex items-center justify-between"> <div class="flex flex-wrap gap-2"> ${post.data.tags.map((tag) => renderTemplate`<span class="text-xs px-2 py-1 bg-border/50 text-ink-mute rounded-lg"> ${tag} </span>`)} </div> ${post.data.readingTime && renderTemplate`<span class="text-xs text-ink-mute"> ${post.data.readingTime} min read
</span>`} </div> </a> </article>`)} </div> ${sortedPosts.length === 0 && renderTemplate`<div class="text-center py-12"> <p class="text-ink-mute">No posts yet. Check back soon!</p> </div>`} </div> </main> ` })}`;
}, "/Users/ronniel/rg-portfolio/src/pages/blog/index.astro", undefined);

const $$file = "/Users/ronniel/rg-portfolio/src/pages/blog/index.astro";
const $$url = "/blog";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
