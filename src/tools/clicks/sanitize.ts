export type ANode =
  | string
  | { tag: 'a'; title: string; children: ANode[] }
  | { tag: 'img'; src: string; alt: string; w?: number; h?: number }
  | { tag: string; children: ANode[] };

const KEEP = new Set(['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'b', 'strong', 'i', 'em', 'blockquote', 'figure', 'figcaption', 'dl', 'dt', 'dd', 'sub', 'sup', 'br', 'small', 'abbr', 'cite', 'q', 'code']);
const UNWRAP = new Set(['div', 'span', 'section', 'bdi', 'font', 'u', 's', 'del', 'ins', 'mark', 'time', 'data', 'center']);
const DROP = new Set(['script', 'style', 'link', 'meta', 'iframe', 'object', 'embed', 'noscript', 'table', 'svg', 'math', 'video', 'audio', 'form', 'input', 'button', 'map', 'area', 'template', 'canvas']);
const DROP_CLASS = /(^|\s)(reference|mw-editsection|navbox|vertical-navbox|infobox|sidebar|hatnote|reflist|references|mw-references-wrap|noprint|metadata|ambox|ombox|tmbox|mbox-small|shortdescription|mw-empty-elt|portalbox|navbar|toc|gallery|mw-cite-backlink|sistersitebox|side-box|mwe-math-element|plainlist|nomobile|printfooter|catlinks|mw-kartographer-maplink|ext-phonos|thumbcaption .magnify)(\s|$)/;
const STOP_SECTIONS = new Set(['see also', 'references', 'notes', 'external links', 'further reading', 'bibliography', 'sources', 'citations', 'footnotes', 'notes and references', 'works cited', 'explanatory notes']);
const NAMESPACES = /^(file|image|category|help|wikipedia|wp|portal|template|talk|user|special|media|module|draft|mediawiki|timedtext|book|education program|gadget|topic)( talk)?:/i;

function linkTitle(el: Element): string | null {
  const href = el.getAttribute('href') || '';
  if ((el.getAttribute('class') || '').split(/\s+/).includes('new')) return null;
  const m = href.match(/^(?:https?:\/\/en\.wikipedia\.org)?\/wiki\/([^?#]+)/) || href.match(/^\.\/([^?#]+)/);
  if (!m) return null;
  let title: string;
  try { title = decodeURIComponent(m[1]).replace(/_/g, ' '); } catch { return null; }
  if (NAMESPACES.test(title) || title.length > 255) return null;
  return title;
}

function imgSrc(el: Element): string | null {
  let src = el.getAttribute('src') || '';
  if (src.startsWith('//')) src = `https:${src}`;
  try {
    const u = new URL(src);
    if (u.protocol !== 'https:' || u.hostname !== 'upload.wikimedia.org') return null;
    return u.href;
  } catch { return null; }
}

function walk(node: Node, out: ANode[], inLink: boolean) {
  if (node.nodeType === 3) {
    const t = node.textContent || '';
    if (t) out.push(t);
    return;
  }
  if (node.nodeType !== 1) return;
  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  if (DROP.has(tag)) return;
  const cls = el.getAttribute('class') || '';
  if (DROP_CLASS.test(cls) || el.getAttribute('role') === 'navigation' || el.getAttribute('role') === 'note' || el.getAttribute('aria-hidden') === 'true') return;
  if (tag === 'style' || (el as HTMLElement).style?.display === 'none') return;

  const kids = (into: ANode[], link = inLink) => { for (const c of Array.from(el.childNodes)) walk(c, into, link); };

  if (tag === 'a') {
    const title = inLink ? null : linkTitle(el);
    if (title) { const children: ANode[] = []; kids(children, true); if (children.length) out.push({ tag: 'a', title, children }); }
    else kids(out);
    return;
  }
  if (tag === 'img') {
    const src = imgSrc(el);
    const w = Number(el.getAttribute('width')) || undefined;
    const h = Number(el.getAttribute('height')) || undefined;
    if (src && (!w || w >= 60)) out.push({ tag: 'img', src, alt: (el.getAttribute('alt') || '').slice(0, 300), w, h });
    return;
  }
  if (tag === 'sup' && /reference|noprint/.test(cls)) return;
  if (KEEP.has(tag)) {
    const children: ANode[] = [];
    kids(children);
    if (tag === 'br' || children.length) out.push({ tag, children });
    return;
  }
  if (tag === 'h5' || tag === 'h6') { const children: ANode[] = []; kids(children); if (children.length) out.push({ tag: 'h4', children }); return; }
  if (tag === 'picture' || tag === 'a' || UNWRAP.has(tag) || tag === 'p') { kids(out); return; }
  kids(out);
}

function headingText(el: Element): string | null {
  const h = el.matches('h2') ? el : el.matches('.mw-heading2') ? el.querySelector('h2') : null;
  return h ? (h.textContent || '').trim().toLowerCase() : null;
}

function hasText(n: ANode): boolean {
  if (typeof n === 'string') return n.trim().length > 0;
  if (n.tag === 'img') return true;
  return 'children' in n && n.children.some(hasText);
}

export function sanitizeArticle(html: string): ANode[] {
  const doc = new DOMParser().parseFromString(`<!doctype html><body>${html}</body>`, 'text/html');
  const root = doc.querySelector('.mw-parser-output') || doc.body;
  const out: ANode[] = [];
  for (const child of Array.from(root.children)) {
    const heading = headingText(child);
    if (heading && STOP_SECTIONS.has(heading)) break;
    const part: ANode[] = [];
    walk(child, part, false);
    for (const n of part) if (hasText(n)) out.push(n);
  }
  return out;
}

export function collectLinks(nodes: ANode[], acc: Map<string, string> = new Map()) {
  for (const n of nodes) {
    if (typeof n === 'string') continue;
    if (n.tag === 'a' && 'title' in n) { if (!acc.has(n.title)) acc.set(n.title, n.title); continue; }
    if ('children' in n) collectLinks(n.children, acc);
  }
  return acc;
}
