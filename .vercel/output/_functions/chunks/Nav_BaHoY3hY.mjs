import { c as createAstro, a as createComponent, r as renderTemplate, b as renderComponent, u as unescapeHTML, F as Fragment, d as addAttribute, i as renderHead, j as renderSlot } from './astro/server_CMNnM6uP.mjs';
import 'kleur/colors';
/* empty css                          */
import { escape } from 'html-escaper';
import { c as getImage } from './_astro_assets_CMjN20zx.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useRef, useEffect } from 'react';
import { User, Activity, Camera, Mail, FileText } from 'lucide-react';

const createMetaTag = (attributes) => {
  const attrs = Object.entries(attributes).map(([key, value]) => `${key}="${escape(value)}"`).join(" ");
  return `<meta ${attrs}>`;
};
const createLinkTag = (attributes) => {
  const attrs = Object.entries(attributes).map(([key, value]) => `${key}="${escape(value)}"`).join(" ");
  return `<link ${attrs}>`;
};
const createOpenGraphTag = (property, content) => {
  return createMetaTag({ property: `og:${property}`, content });
};
const buildOpenGraphMediaTags = (mediaType, media) => {
  let tags = "";
  const addTag = (tag) => {
    tags += tag + "\n";
  };
  media.forEach((medium) => {
    addTag(createOpenGraphTag(mediaType, medium.url));
    if (medium.alt) {
      addTag(createOpenGraphTag(`${mediaType}:alt`, medium.alt));
    }
    if (medium.secureUrl) {
      addTag(createOpenGraphTag(`${mediaType}:secure_url`, medium.secureUrl));
    }
    if (medium.type) {
      addTag(createOpenGraphTag(`${mediaType}:type`, medium.type));
    }
    if (medium.width) {
      addTag(createOpenGraphTag(`${mediaType}:width`, medium.width.toString()));
    }
    if (medium.height) {
      addTag(
        createOpenGraphTag(`${mediaType}:height`, medium.height.toString())
      );
    }
  });
  return tags;
};
const buildTags = (config) => {
  let tagsToRender = "";
  const addTag = (tag) => {
    tagsToRender += tag + "\n";
  };
  if (config.title) {
    const formattedTitle = config.titleTemplate ? config.titleTemplate.replace("%s", config.title) : config.title;
    addTag(`<title>${escape(formattedTitle)}</title>`);
  }
  if (config.description) {
    addTag(createMetaTag({ name: "description", content: config.description }));
  }
  let robotsContent = [];
  if (typeof config.noindex !== "undefined") {
    robotsContent.push(config.noindex ? "noindex" : "index");
  }
  if (typeof config.nofollow !== "undefined") {
    robotsContent.push(config.nofollow ? "nofollow" : "follow");
  }
  if (config.robotsProps) {
    const {
      nosnippet,
      maxSnippet,
      maxImagePreview,
      noarchive,
      unavailableAfter,
      noimageindex,
      notranslate
    } = config.robotsProps;
    if (nosnippet) robotsContent.push("nosnippet");
    if (typeof maxSnippet === "number") robotsContent.push(`max-snippet:${maxSnippet}`);
    if (maxImagePreview)
      robotsContent.push(`max-image-preview:${maxImagePreview}`);
    if (noarchive) robotsContent.push("noarchive");
    if (unavailableAfter)
      robotsContent.push(`unavailable_after:${unavailableAfter}`);
    if (noimageindex) robotsContent.push("noimageindex");
    if (notranslate) robotsContent.push("notranslate");
  }
  if (robotsContent.length > 0) {
    addTag(createMetaTag({ name: "robots", content: robotsContent.join(",") }));
  }
  if (config.canonical) {
    addTag(createLinkTag({ rel: "canonical", href: config.canonical }));
  }
  if (config.mobileAlternate) {
    addTag(
      createLinkTag({
        rel: "alternate",
        media: config.mobileAlternate.media,
        href: config.mobileAlternate.href
      })
    );
  }
  if (config.languageAlternates && config.languageAlternates.length > 0) {
    config.languageAlternates.forEach((languageAlternate) => {
      addTag(
        createLinkTag({
          rel: "alternate",
          hreflang: languageAlternate.hreflang,
          href: languageAlternate.href
        })
      );
    });
  }
  if (config.openGraph) {
    const title = config.openGraph?.title || config.title;
    if (title) {
      addTag(createOpenGraphTag("title", title));
    }
    const description = config.openGraph?.description || config.description;
    if (description) {
      addTag(createOpenGraphTag("description", description));
    }
    if (config.openGraph.url) {
      addTag(createOpenGraphTag("url", config.openGraph.url));
    }
    if (config.openGraph.type) {
      addTag(createOpenGraphTag("type", config.openGraph.type));
    }
    if (config.openGraph.images && config.openGraph.images.length) {
      addTag(buildOpenGraphMediaTags("image", config.openGraph.images));
    }
    if (config.openGraph.videos && config.openGraph.videos.length) {
      addTag(buildOpenGraphMediaTags("video", config.openGraph.videos));
    }
    if (config.openGraph.locale) {
      addTag(createOpenGraphTag("locale", config.openGraph.locale));
    }
    if (config.openGraph.site_name) {
      addTag(createOpenGraphTag("site_name", config.openGraph.site_name));
    }
    if (config.openGraph.profile) {
      if (config.openGraph.profile.firstName) {
        addTag(
          createOpenGraphTag(
            "profile:first_name",
            config.openGraph.profile.firstName
          )
        );
      }
      if (config.openGraph.profile.lastName) {
        addTag(
          createOpenGraphTag(
            "profile:last_name",
            config.openGraph.profile.lastName
          )
        );
      }
      if (config.openGraph.profile.username) {
        addTag(
          createOpenGraphTag(
            "profile:username",
            config.openGraph.profile.username
          )
        );
      }
      if (config.openGraph.profile.gender) {
        addTag(
          createOpenGraphTag("profile:gender", config.openGraph.profile.gender)
        );
      }
    }
    if (config.openGraph.book) {
      if (config.openGraph.book.authors && config.openGraph.book.authors.length) {
        config.openGraph.book.authors.forEach((author) => {
          addTag(createOpenGraphTag("book:author", author));
        });
      }
      if (config.openGraph.book.isbn) {
        addTag(createOpenGraphTag("book:isbn", config.openGraph.book.isbn));
      }
      if (config.openGraph.book.releaseDate) {
        addTag(
          createOpenGraphTag(
            "book:release_date",
            config.openGraph.book.releaseDate
          )
        );
      }
      if (config.openGraph.book.tags && config.openGraph.book.tags.length) {
        config.openGraph.book.tags.forEach((tag) => {
          addTag(createOpenGraphTag("book:tag", tag));
        });
      }
    }
    if (config.openGraph.article) {
      if (config.openGraph.article.publishedTime) {
        addTag(
          createOpenGraphTag(
            "article:published_time",
            config.openGraph.article.publishedTime
          )
        );
      }
      if (config.openGraph.article.modifiedTime) {
        addTag(
          createOpenGraphTag(
            "article:modified_time",
            config.openGraph.article.modifiedTime
          )
        );
      }
      if (config.openGraph.article.expirationTime) {
        addTag(
          createOpenGraphTag(
            "article:expiration_time",
            config.openGraph.article.expirationTime
          )
        );
      }
      if (config.openGraph.article.authors && config.openGraph.article.authors.length) {
        config.openGraph.article.authors.forEach((author) => {
          addTag(createOpenGraphTag("article:author", author));
        });
      }
      if (config.openGraph.article.section) {
        addTag(
          createOpenGraphTag(
            "article:section",
            config.openGraph.article.section
          )
        );
      }
      if (config.openGraph.article.tags && config.openGraph.article.tags.length) {
        config.openGraph.article.tags.forEach((tag) => {
          addTag(createOpenGraphTag("article:tag", tag));
        });
      }
    }
    if (config.openGraph.video) {
      if (config.openGraph.video.actors && config.openGraph.video.actors.length) {
        config.openGraph.video.actors.forEach((actor) => {
          addTag(createOpenGraphTag("video:actor", actor.profile));
          if (actor.role) {
            addTag(createOpenGraphTag("video:actor:role", actor.role));
          }
        });
      }
      if (config.openGraph.video.directors && config.openGraph.video.directors.length) {
        config.openGraph.video.directors.forEach((director) => {
          addTag(createOpenGraphTag("video:director", director));
        });
      }
      if (config.openGraph.video.writers && config.openGraph.video.writers.length) {
        config.openGraph.video.writers.forEach((writer) => {
          addTag(createOpenGraphTag("video:writer", writer));
        });
      }
      if (config.openGraph.video.duration) {
        addTag(
          createOpenGraphTag(
            "video:duration",
            config.openGraph.video.duration.toString()
          )
        );
      }
      if (config.openGraph.video.releaseDate) {
        addTag(
          createOpenGraphTag(
            "video:release_date",
            config.openGraph.video.releaseDate
          )
        );
      }
      if (config.openGraph.video.tags && config.openGraph.video.tags.length) {
        config.openGraph.video.tags.forEach((tag) => {
          addTag(createOpenGraphTag("video:tag", tag));
        });
      }
      if (config.openGraph.video.series) {
        addTag(
          createOpenGraphTag("video:series", config.openGraph.video.series)
        );
      }
    }
  }
  if (config.facebook && config.facebook.appId) {
    addTag(
      createMetaTag({ property: "fb:app_id", content: config.facebook.appId })
    );
  }
  if (config.twitter) {
    if (config.twitter.cardType) {
      addTag(
        createMetaTag({
          name: "twitter:card",
          content: config.twitter.cardType
        })
      );
    }
    if (config.twitter.site) {
      addTag(
        createMetaTag({ name: "twitter:site", content: config.twitter.site })
      );
    }
    if (config.twitter.handle) {
      addTag(
        createMetaTag({
          name: "twitter:creator",
          content: config.twitter.handle
        })
      );
    }
  }
  if (config.additionalMetaTags && config.additionalMetaTags.length > 0) {
    config.additionalMetaTags.forEach((metaTag) => {
      const attributes = {
        content: metaTag.content
      };
      if ("name" in metaTag && metaTag.name) {
        attributes.name = metaTag.name;
      } else if ("property" in metaTag && metaTag.property) {
        attributes.property = metaTag.property;
      } else if ("httpEquiv" in metaTag && metaTag.httpEquiv) {
        attributes["http-equiv"] = metaTag.httpEquiv;
      }
      addTag(createMetaTag(attributes));
    });
  }
  if (config.additionalLinkTags && config.additionalLinkTags.length > 0) {
    config.additionalLinkTags.forEach((linkTag) => {
      const attributes = {
        rel: linkTag.rel,
        href: linkTag.href
      };
      if (linkTag.sizes) {
        attributes.sizes = linkTag.sizes;
      }
      if (linkTag.media) {
        attributes.media = linkTag.media;
      }
      if (linkTag.type) {
        attributes.type = linkTag.type;
      }
      if (linkTag.color) {
        attributes.color = linkTag.color;
      }
      if (linkTag.as) {
        attributes.as = linkTag.as;
      }
      if (linkTag.crossOrigin) {
        attributes.crossorigin = linkTag.crossOrigin;
      }
      addTag(createLinkTag(attributes));
    });
  }
  return tagsToRender.trim();
};

const $$Astro$2 = createAstro("https://ronnielgandhe.com");
const $$AstroSeo = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$AstroSeo;
  const {
    title,
    titleTemplate,
    noindex,
    nofollow,
    robotsProps,
    description,
    canonical,
    mobileAlternate,
    languageAlternates,
    openGraph,
    facebook,
    twitter,
    additionalMetaTags,
    additionalLinkTags
  } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${unescapeHTML(buildTags({
    title,
    titleTemplate,
    noindex,
    nofollow,
    robotsProps,
    description,
    canonical,
    mobileAlternate,
    languageAlternates,
    openGraph,
    facebook,
    twitter,
    additionalMetaTags,
    additionalLinkTags
  }))}` })}`;
}, "/Users/ronniel/rg-portfolio/node_modules/@astrolib/seo/src/AstroSeo.astro", undefined);

const macBackground1 = new Proxy({"src":"/_astro/mac-background1.BN3pAP-K.jpg","width":6016,"height":3384,"format":"jpg","orientation":1}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/ronniel/rg-portfolio/src/assets/images/mac-background1.jpg";
							}
							
							return target[name];
						}
					});

const macBackground2 = new Proxy({"src":"/_astro/mac-background2.DAWzICtV.jpg","width":6016,"height":3384,"format":"jpg","orientation":1}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/ronniel/rg-portfolio/src/assets/images/mac-background2.jpg";
							}
							
							return target[name];
						}
					});

const macBackground3 = new Proxy({"src":"/_astro/mac-background3.D2uWT5Yk.jpg","width":6016,"height":3384,"format":"jpg","orientation":1}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/ronniel/rg-portfolio/src/assets/images/mac-background3.jpg";
							}
							
							return target[name];
						}
					});

const $$Astro$1 = createAstro("https://ronnielgandhe.com");
const $$BaseHead = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$BaseHead;
  const backgrounds = await Promise.all([
    getImage({ src: macBackground1, width: 3500 }),
    getImage({ src: macBackground2, width: 3500 }),
    getImage({ src: macBackground3, width: 3500 })
  ]);
  return renderTemplate`<!-- Core meta tags --><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"><meta name="author" content="Ronniel Gandhe"><!-- Software Engineer • Quant Developer --><!-- SEO Configuration - customize these values -->${renderComponent($$result, "AstroSeo", $$AstroSeo, { "title": Astro2.props.title || "Ronniel Gandhe - Software Engineer \u2022 Quant Developer", "description": Astro2.props.description || "Software Engineer and Quant Developer based in Waterloo, ON specializing in systematic trading strategies and scalable infrastructure", "canonical": Astro2.props.canonical || "https://ronnielgandhe.com", "openGraph": {
    url: Astro2.props.openGraph?.url || "https://ronnielgandhe.com",
    title: Astro2.props.openGraph?.title || "Ronniel Gandhe - Software Engineer \u2022 Quant Developer",
    description: Astro2.props.openGraph?.description || "Software Engineer and Quant Developer based in Waterloo, ON specializing in systematic trading strategies and scalable infrastructure",
    images: [
      {
        url: ""
        // og image here
      }
    ],
    site_name: Astro2.props.openGraph?.site_name || "Ronniel Gandhe"
  } })}<!-- Add your favicon files in public/images/ --><link rel="apple-touch-icon" sizes="180x180" href="/images/YOUR_FAVICON.svg"><link rel="icon" type="image/png" sizes="32x32" href="/images/YOUR_FAVICON.svg"><link rel="icon" type="image/png" sizes="16x16" href="/images/YOUR_FAVICON.svg"><!-- Theme colors for browsers --><meta name="msapplication-TileColor" content="YOUR_COLOR_HEX"><meta name="theme-color" content="YOUR_COLOR_HEX"><!-- Auto-generated sitemap --><link rel="sitemap" href="/sitemap-index.xml"><!-- Preload background images for performance -->${backgrounds.map((bg) => renderTemplate`<link rel="preload"${addAttribute(bg.src, "href")} as="image" type="image/webp" fetchpriority="high">`)}`;
}, "/Users/ronniel/rg-portfolio/src/components/global/BaseHead.astro", undefined);

const $$Astro = createAstro("https://ronnielgandhe.com");
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  return renderTemplate`<html lang="en" class="scroll-smooth selection:bg-gray-900 selection:text-white overflow-x-hidden"> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": Astro2.props.title, "description": Astro2.props.description, "canonical": Astro2.props.canonical, "openGraph": Astro2.props.openGraph })}${renderHead()}</head> <body class="overflow-x-hidden bg-gray-900"> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/Users/ronniel/rg-portfolio/src/layouts/Layout.astro", undefined);

function AppleMenu({
  triggerLabel,
  sections,
  align = "left",
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const itemRefs = useRef([]);
  const allItems = sections.flatMap(
    (section) => section.items.filter((item) => !item.isDivider && !item.disabled)
  );
  const openMenu = () => {
    setIsOpen(true);
    setFocusedIndex(-1);
  };
  const closeMenu = () => {
    setIsOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  };
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openMenu();
        if (allItems.length > 0) {
          setFocusedIndex(0);
        }
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        closeMenu();
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev + 1 >= allItems.length ? 0 : prev + 1;
          return next;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev <= 0 ? allItems.length - 1 : prev - 1;
          return next;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
          itemRefs.current[focusedIndex]?.click();
        }
        break;
    }
  };
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && menuRef.current && triggerRef.current && !menuRef.current.contains(event.target) && !triggerRef.current.contains(event.target)) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);
  useEffect(() => {
    itemRefs.current = new Array(allItems.length).fill(null);
  }, [allItems.length]);
  const renderMenuItems = () => {
    let itemIndex = 0;
    return sections.map((section, sectionIndex) => /* @__PURE__ */ jsxs("div", { children: [
      section.items.map((item, itemIndexInSection) => {
        if (item.isDivider) {
          return /* @__PURE__ */ jsx("div", { className: "menu-divider" }, `divider-${itemIndexInSection}`);
        }
        const isFocused = focusedIndex === itemIndex;
        const currentItemIndex = itemIndex;
        if (!item.disabled) {
          itemIndex++;
        }
        const ItemWrapper = item.href ? "a" : "button";
        const itemProps = item.href ? {
          href: item.href,
          ...item.external && {
            target: "_blank",
            rel: "noopener noreferrer"
          }
        } : { onClick: item.onClick, type: "button" };
        return /* @__PURE__ */ jsxs(
          ItemWrapper,
          {
            ref: (el) => {
              if (!item.disabled) {
                itemRefs.current[currentItemIndex] = el;
              }
            },
            className: `menu-item ${item.disabled ? "disabled" : ""}`,
            role: "menuitem",
            tabIndex: isFocused ? 0 : -1,
            disabled: item.disabled,
            onClick: () => {
              if (!item.disabled) {
                item.onClick?.();
                if (item.href) closeMenu();
              }
            },
            ...itemProps,
            children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: item.label }),
              item.description && /* @__PURE__ */ jsx("div", { className: "menu-item-description", children: item.description })
            ]
          },
          itemIndexInSection
        );
      }),
      sectionIndex < sections.length - 1 && /* @__PURE__ */ jsx("div", { className: "menu-divider" })
    ] }, sectionIndex));
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        ref: triggerRef,
        onClick: () => isOpen ? closeMenu() : openMenu(),
        onKeyDown: handleKeyDown,
        className: `flex items-center gap-1 px-3 py-2 text-sm text-ink-mute hover:text-ink transition-apple focus:outline-none focus:ring-1 focus:ring-white/20 rounded ${className}`,
        "aria-haspopup": "menu",
        "aria-expanded": isOpen,
        "aria-controls": isOpen ? "apple-menu" : undefined,
        children: [
          triggerLabel,
          /* @__PURE__ */ jsx(
            "svg",
            {
              width: "8",
              height: "5",
              viewBox: "0 0 8 5",
              className: `fill-current transition-apple ${isOpen ? "rotate-180" : ""}`,
              children: /* @__PURE__ */ jsx("path", { d: "M0 0l4 4 4-4H0z" })
            }
          )
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsx(
      "div",
      {
        ref: menuRef,
        id: "apple-menu",
        role: "menu",
        className: `absolute top-full mt-1 min-w-[200px] glass-menu z-50 ${align === "right" ? "right-0" : "left-0"} menu-enter-active`,
        onKeyDown: handleKeyDown,
        children: renderMenuItems()
      }
    )
  ] });
}

function Nav({ currentPath = "/", recentPosts = [] }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const projectSections = [
    {
      items: [
        {
          label: "QuantTerminal",
          href: "/projects/quantterminal",
          description: "Real-time trading dashboard"
        },
        {
          label: "YourNews",
          href: "https://github.com/ronnielgandhe/yournews",
          external: true,
          description: "News aggregation platform"
        }
      ]
    },
    {
      items: [
        {
          label: "All projects",
          href: "/projects"
        }
      ]
    }
  ];
  const blogSections = [
    {
      items: recentPosts.length > 0 ? recentPosts.map((post) => ({
        label: post.title,
        href: `/blog/${post.slug}`,
        description: `${formatDate(post.publishedAt)} • ${post.readingTime} min read`
      })) : [
        {
          label: "Building a Terminal Portfolio",
          href: "/blog/building-terminal-portfolio",
          description: "Oct 1, 2025 • 8 min read"
        },
        {
          label: "Sharpe Without Illusions",
          href: "/blog/sharpe-without-illusions",
          description: "Sep 15, 2025 • 12 min read"
        }
      ]
    },
    {
      items: [
        {
          label: "All posts",
          href: "/blog"
        }
      ]
    }
  ];
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }
  return /* @__PURE__ */ jsx("nav", { className: "fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 h-12 flex items-center justify-between", children: [
    /* @__PURE__ */ jsxs(
      "a",
      {
        href: "/",
        className: "font-medium text-ink hover:text-accent transition-apple flex items-center gap-2",
        children: [
          /* @__PURE__ */ jsx(User, { size: 16 }),
          "Ronniel Gandhe"
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(
        AppleMenu,
        {
          triggerLabel: "Projects",
          sections: projectSections
        }
      ),
      /* @__PURE__ */ jsx(
        AppleMenu,
        {
          triggerLabel: "Blog",
          sections: blogSections
        }
      ),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "/fitness",
          className: "flex items-center gap-1 px-3 py-2 text-sm text-ink-mute hover:text-ink transition-apple focus:outline-none focus:ring-1 focus:ring-white/20 rounded",
          children: [
            /* @__PURE__ */ jsx(Activity, { size: 16 }),
            "Fitness"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "/pictures",
          className: "flex items-center gap-1 px-3 py-2 text-sm text-ink-mute hover:text-ink transition-apple focus:outline-none focus:ring-1 focus:ring-white/20 rounded",
          children: [
            /* @__PURE__ */ jsx(Camera, { size: 16 }),
            "Pictures"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "/contact",
          className: "flex items-center gap-1 px-3 py-2 text-sm text-ink-mute hover:text-ink transition-apple focus:outline-none focus:ring-1 focus:ring-white/20 rounded",
          children: [
            /* @__PURE__ */ jsx(Mail, { size: 16 }),
            "Contact"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "/Ronniel_Gandhe_Resume.pdf",
          target: "_blank",
          rel: "noopener noreferrer",
          className: "flex items-center gap-1 px-3 py-2 text-sm text-accent hover:bg-accent/10 transition-apple focus:outline-none focus:ring-1 focus:ring-accent/50 rounded",
          children: [
            /* @__PURE__ */ jsx(FileText, { size: 16 }),
            "Résumé"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "md:hidden", children: /* @__PURE__ */ jsx(
      AppleMenu,
      {
        triggerLabel: "Menu",
        align: "right",
        sections: [
          {
            items: [
              { label: "Projects", href: "/projects" },
              { label: "Blog", href: "/blog" }
            ]
          },
          {
            items: [
              { label: "Fitness", href: "/fitness" },
              { label: "Pictures", href: "/pictures" },
              { label: "Contact", href: "/contact" }
            ]
          },
          {
            items: [
              {
                label: "Résumé",
                href: "/Ronniel_Gandhe_Resume.pdf",
                external: true
              }
            ]
          }
        ],
        className: "md:hidden"
      }
    ) })
  ] }) });
}

export { $$Layout as $, Nav as N, macBackground2 as a, macBackground3 as b, macBackground1 as m };
