import { c as createAstro, a as createComponent, r as renderTemplate, b as renderComponent, m as maybeRenderHead, F as Fragment } from '../../chunks/astro/server_CMNnM6uP.mjs';
import 'kleur/colors';
import { g as getCollection } from '../../chunks/_astro_content_DHSJqmY8.mjs';
import { $ as $$Layout, N as Nav } from '../../chunks/Nav_BaHoY3hY.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://ronnielgandhe.com");
async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.data.slug },
    props: { post }
  }));
}
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { post } = Astro2.props;
  const { Content } = await post.render();
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `${post.data.title} - Ronniel Gandhe`, "description": post.data.summary, "canonical": `https://ronnielgandhe.com/blog/${post.data.slug}` }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", Nav, { "currentPath": "/blog" })} ${maybeRenderHead()}<main class="min-h-screen bg-bg pt-12"> <div class="max-w-4xl mx-auto px-4 py-12"> <!-- Back Navigation --> <div class="mb-8"> <a href="/blog" class="text-ink-mute hover:text-accent transition-apple text-sm">
← Back to Blog
</a> </div> <!-- Article Header --> <header class="mb-12"> <h1 class="text-3xl font-bold text-ink mb-4 leading-tight"> ${post.data.title} </h1> <div class="flex items-center gap-4 text-ink-mute text-sm mb-6"> <time>${formatDate(post.data.publishedAt)}</time> ${post.data.readingTime && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate` <span>•</span> <span>${post.data.readingTime} min read</span> ` })}`} </div> <!-- Tags --> ${post.data.tags.length > 0 && renderTemplate`<div class="flex flex-wrap gap-2"> ${post.data.tags.map((tag) => renderTemplate`<span class="px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-lg text-sm"> ${tag} </span>`)} </div>`} </header> <!-- Article Content --> <article class="prose prose-invert prose-lg max-w-none"> <div class="text-ink-mute leading-relaxed [&>h1]:text-ink [&>h2]:text-ink [&>h3]:text-ink [&>h4]:text-ink [&>h5]:text-ink [&>h6]:text-ink [&>strong]:text-ink [&>code]:text-accent [&>code]:bg-accent/10 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>pre]:bg-bg-soft [&>pre]:border [&>pre]:border-border [&>pre]:p-4 [&>pre]:rounded-lg [&>blockquote]:border-l-4 [&>blockquote]:border-accent [&>blockquote]:pl-4 [&>blockquote]:italic"> ${renderComponent($$result2, "Content", Content, {})} </div> </article> <!-- Footer --> <footer class="mt-12 pt-8 border-t border-border"> <div class="text-center"> <p class="text-ink-mute mb-4">
Thanks for reading! Have thoughts or questions?
</p> <a href="mailto:ronnielgandhe@gmail.com" class="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dim transition-apple">
Send me an email
</a> </div> </footer> </div> </main> ` })}`;
}, "/Users/ronniel/rg-portfolio/src/pages/blog/[slug].astro", undefined);

const $$file = "/Users/ronniel/rg-portfolio/src/pages/blog/[slug].astro";
const $$url = "/blog/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
