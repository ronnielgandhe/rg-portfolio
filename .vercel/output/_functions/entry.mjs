import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_C_4g8n_r.mjs';
import { manifest } from './manifest_1EXWFzI0.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/chat.astro.mjs');
const _page2 = () => import('./pages/blog/_slug_.astro.mjs');
const _page3 = () => import('./pages/blog.astro.mjs');
const _page4 = () => import('./pages/contact.astro.mjs');
const _page5 = () => import('./pages/fitness.astro.mjs');
const _page6 = () => import('./pages/pictures.astro.mjs');
const _page7 = () => import('./pages/projects/quantterminal.astro.mjs');
const _page8 = () => import('./pages/projects/yournews.astro.mjs');
const _page9 = () => import('./pages/projects.astro.mjs');
const _page10 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/chat.ts", _page1],
    ["src/pages/blog/[slug].astro", _page2],
    ["src/pages/blog/index.astro", _page3],
    ["src/pages/contact/index.astro", _page4],
    ["src/pages/fitness/index.astro", _page5],
    ["src/pages/pictures/index.astro", _page6],
    ["src/pages/projects/quantterminal.astro", _page7],
    ["src/pages/projects/yournews.astro", _page8],
    ["src/pages/projects/index.astro", _page9],
    ["src/pages/index.astro", _page10]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "ce1f046e-e280-4574-85b8-a283c74d560a",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
