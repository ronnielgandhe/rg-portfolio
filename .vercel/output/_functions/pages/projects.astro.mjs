import { a as createComponent, r as renderTemplate, b as renderComponent, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_CMNnM6uP.mjs';
import 'kleur/colors';
import { $ as $$Layout, N as Nav } from '../chunks/Nav_BaHoY3hY.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const projects = [
    {
      title: "QuantTerminal",
      slug: "quantterminal",
      year: 2025,
      tech: ["Python", "React", "FastAPI", "PostgreSQL", "Docker", "AWS"],
      summary: "Terminal-style trading dashboard for systematic strategy development and execution.",
      status: "In Development"
    },
    {
      title: "YourNews",
      slug: "yournews",
      year: 2025,
      tech: ["Next.js", "Express", "TypeScript", "Tailwind", "OpenAI"],
      summary: "Personalized news dashboard with TF-IDF + AI summaries and clean infra.",
      status: "Live",
      repoUrl: "https://github.com/ronnielgandhe/yournews"
    }
  ];
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Projects - Ronniel Gandhe", "description": "Software projects by Ronniel Gandhe - systematic trading tools and scalable infrastructure", "canonical": "https://ronnielgandhe.com/projects" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", Nav, { "currentPath": "/projects" })} ${maybeRenderHead()}<main class="min-h-screen bg-bg pt-12"> <div class="max-w-4xl mx-auto px-4 py-12"> <!-- Header --> <div class="mb-12"> <h1 class="text-3xl font-bold text-ink mb-4">Projects</h1> <p class="text-ink-mute">
Software projects focused on systematic trading, infrastructure, and developer tools.
</p> </div> <!-- Projects Grid --> <div class="grid gap-6 md:grid-cols-2"> ${projects.map((project) => renderTemplate`<div class="bg-bg-soft border border-border rounded-xl p-6 hover:border-accent/30 transition-apple"> <div class="flex items-start justify-between mb-4"> <h2 class="text-xl font-semibold text-ink">${project.title}</h2> <div class="flex items-center gap-2"> <span${addAttribute(`text-xs px-2 py-1 rounded-lg ${project.status === "Live" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-accent/10 text-accent border border-accent/20"}`, "class")}> ${project.status} </span> <span class="text-xs text-ink-mute">${project.year}</span> </div> </div> <p class="text-ink-mute mb-4 leading-relaxed"> ${project.summary} </p> <!-- Tech Stack --> <div class="flex flex-wrap gap-2 mb-4"> ${project.tech.map((tech) => renderTemplate`<span class="text-xs px-2 py-1 bg-border/50 text-ink-mute rounded-lg"> ${tech} </span>`)} </div> <!-- Links --> <div class="flex gap-3"> <a${addAttribute(`/projects/${project.slug}`, "href")} class="text-accent hover:text-accent-dim transition-apple text-sm font-medium">
View Details →
</a> ${project.repoUrl && renderTemplate`<a${addAttribute(project.repoUrl, "href")} target="_blank" rel="noopener noreferrer" class="text-ink-mute hover:text-ink transition-apple text-sm">
GitHub ↗
</a>`} </div> </div>`)} </div> </div> </main> ` })}`;
}, "/Users/ronniel/rg-portfolio/src/pages/projects/index.astro", undefined);

const $$file = "/Users/ronniel/rg-portfolio/src/pages/projects/index.astro";
const $$url = "/projects";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
