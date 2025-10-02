import { a as createComponent, r as renderTemplate, b as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_CMNnM6uP.mjs';
import 'kleur/colors';
import { $ as $$Layout, N as Nav } from '../chunks/Nav_BaHoY3hY.mjs';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
/* empty css                                 */
import { Camera, Calendar } from 'lucide-react';
import { g as getRecentBlogPosts } from '../chunks/blog_DrqDHIsA.mjs';
export { renderers } from '../renderers.mjs';

function PhotoGallery({ photos }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };
  const lightboxSlides = photos.map((photo) => ({
    src: photo.src,
    alt: photo.alt,
    caption: photo.caption || photo.alt
  }));
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6", children: photos.map((photo, index) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "break-inside-avoid bg-bg-soft border border-border rounded-xl overflow-hidden group cursor-pointer hover:border-accent/30 transition-apple",
        onClick: () => openLightbox(index),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: photo.src,
                alt: photo.alt,
                className: "w-full h-auto object-cover group-hover:scale-105 transition-apple duration-300",
                loading: "lazy"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-apple flex items-center justify-center", children: /* @__PURE__ */ jsx(Camera, { className: "w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-apple" }) })
          ] }),
          (photo.caption || photo.createdAt) && /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
            photo.caption && /* @__PURE__ */ jsx("p", { className: "text-ink text-sm font-medium mb-2 leading-relaxed", children: photo.caption }),
            photo.createdAt && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-ink-mute text-xs", children: [
              /* @__PURE__ */ jsx(Calendar, { className: "w-3 h-3" }),
              /* @__PURE__ */ jsx("time", { children: new Date(photo.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              }) })
            ] })
          ] })
        ]
      },
      index
    )) }),
    /* @__PURE__ */ jsx(
      Lightbox,
      {
        open: lightboxOpen,
        close: () => setLightboxOpen(false),
        slides: lightboxSlides,
        index: currentIndex,
        styles: {
          container: { backgroundColor: "rgba(11, 18, 32, 0.95)" },
          button: { color: "#e6e9ef" },
          navigationPrev: { color: "#e6e9ef" },
          navigationNext: { color: "#e6e9ef" }
        }
      }
    ),
    photos.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-24", children: [
      /* @__PURE__ */ jsx(Camera, { className: "w-12 h-12 text-ink-mute mx-auto mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-ink-mute", children: "No photos yet. Check back soon!" })
    ] })
  ] });
}

const photos = [
  {
    src: "/gallery/setup-v3.jpg",
    alt: "Home office setup v3",
    createdAt: "2025-09-10",
    caption: "Latest iteration of the home office - minimal and focused"
  },
  {
    src: "/gallery/canal-run.jpg",
    alt: "Morning run along the canal",
    createdAt: "2025-09-15",
    caption: "Early morning tempo run - perfect weather"
  },
  {
    src: "/gallery/coffee-code.jpg",
    alt: "Coffee and code session",
    createdAt: "2025-09-20",
    caption: "Saturday morning debugging with good coffee"
  },
  {
    src: "/gallery/waterloo-sunset.jpg",
    alt: "Sunset over Waterloo",
    createdAt: "2025-09-25",
    caption: "Golden hour from the office window"
  },
  {
    src: "/gallery/gym-pr.jpg",
    alt: "Personal record celebration",
    createdAt: "2025-09-28",
    caption: "New squat PR - 245lbs for a triple"
  },
  {
    src: "/gallery/weekend-project.jpg",
    alt: "Weekend coding project",
    createdAt: "2025-10-01",
    caption: "Building something new - always experimenting"
  }
];

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const recentPosts = await getRecentBlogPosts();
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Pictures - Ronniel Gandhe", "description": "Photo gallery showcasing life, work, and travel moments", "canonical": "https://ronnielgandhe.com/pictures" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", Nav, { "currentPath": "/pictures", "recentPosts": recentPosts })} ${maybeRenderHead()}<main class="min-h-screen bg-bg pt-12"> <div class="max-w-6xl mx-auto px-4 py-12"> <!-- Header --> <div class="mb-12"> <h1 class="text-3xl font-bold text-ink mb-4">Pictures</h1> <p class="text-ink-mute">
Moments from life, work, and adventures around Waterloo and beyond.
</p> </div> <!-- Gallery Component --> ${renderComponent($$result2, "PhotoGallery", PhotoGallery, { "photos": photos, "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/ronniel/rg-portfolio/src/components/PhotoGallery", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/Users/ronniel/rg-portfolio/src/pages/pictures/index.astro", undefined);

const $$file = "/Users/ronniel/rg-portfolio/src/pages/pictures/index.astro";
const $$url = "/pictures";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
