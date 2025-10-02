import 'kleur/colors';
import { e as decodeKey } from './chunks/astro/server_CMNnM6uP.mjs';
import 'clsx';
import 'cookie';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_D-og4BbU.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || undefined,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : undefined,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/ronniel/rg-portfolio/","cacheDir":"file:///Users/ronniel/rg-portfolio/node_modules/.astro/","outDir":"file:///Users/ronniel/rg-portfolio/dist/","srcDir":"file:///Users/ronniel/rg-portfolio/src/","publicDir":"file:///Users/ronniel/rg-portfolio/public/","buildClientDir":"file:///Users/ronniel/rg-portfolio/dist/client/","buildServerDir":"file:///Users/ronniel/rg-portfolio/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/chat","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/chat$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"chat","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/chat.ts","pathname":"/api/chat","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_slug_.DAOciHNp.css"}],"routeData":{"route":"/blog/[slug]","isIndex":false,"type":"page","pattern":"^\\/blog\\/([^/]+?)$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/blog/[slug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_slug_.DAOciHNp.css"}],"routeData":{"route":"/blog","isIndex":true,"type":"page","pattern":"^\\/blog$","segments":[[{"content":"blog","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/index.astro","pathname":"/blog","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_slug_.DAOciHNp.css"}],"routeData":{"route":"/contact","isIndex":true,"type":"page","pattern":"^\\/contact$","segments":[[{"content":"contact","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/contact/index.astro","pathname":"/contact","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_slug_.DAOciHNp.css"}],"routeData":{"route":"/fitness","isIndex":true,"type":"page","pattern":"^\\/fitness$","segments":[[{"content":"fitness","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/fitness/index.astro","pathname":"/fitness","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_slug_.DAOciHNp.css"},{"type":"external","src":"/_astro/index.DRT7dAKZ.css"}],"routeData":{"route":"/pictures","isIndex":true,"type":"page","pattern":"^\\/pictures$","segments":[[{"content":"pictures","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/pictures/index.astro","pathname":"/pictures","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_slug_.DAOciHNp.css"}],"routeData":{"route":"/projects/quantterminal","isIndex":false,"type":"page","pattern":"^\\/projects\\/quantterminal$","segments":[[{"content":"projects","dynamic":false,"spread":false}],[{"content":"quantterminal","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/projects/quantterminal.astro","pathname":"/projects/quantterminal","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_slug_.DAOciHNp.css"}],"routeData":{"route":"/projects/yournews","isIndex":false,"type":"page","pattern":"^\\/projects\\/yournews$","segments":[[{"content":"projects","dynamic":false,"spread":false}],[{"content":"yournews","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/projects/yournews.astro","pathname":"/projects/yournews","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_slug_.DAOciHNp.css"}],"routeData":{"route":"/projects","isIndex":true,"type":"page","pattern":"^\\/projects$","segments":[[{"content":"projects","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/projects/index.astro","pathname":"/projects","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_slug_.DAOciHNp.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}}],"site":"https://ronnielgandhe.com","base":"/","trailingSlash":"never","compressHTML":true,"componentMetadata":[["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["/Users/ronniel/rg-portfolio/src/pages/blog/[slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/blog/[slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["/Users/ronniel/rg-portfolio/src/pages/blog/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/blog/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/ronniel/rg-portfolio/src/pages/projects/quantterminal.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/projects/quantterminal@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/ronniel/rg-portfolio/src/pages/projects/yournews.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/projects/yournews@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/ronniel/rg-portfolio/src/utils/blog.ts",{"propagation":"in-tree","containsHead":false}],["/Users/ronniel/rg-portfolio/src/components/LandingPage.astro",{"propagation":"in-tree","containsHead":false}],["/Users/ronniel/rg-portfolio/src/pages/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/ronniel/rg-portfolio/src/pages/contact/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/contact/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/ronniel/rg-portfolio/src/pages/fitness/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/fitness/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/ronniel/rg-portfolio/src/pages/pictures/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/pictures/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/ronniel/rg-portfolio/src/pages/projects/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astro-page:src/pages/api/chat@_@ts":"pages/api/chat.astro.mjs","\u0000@astro-page:src/pages/blog/[slug]@_@astro":"pages/blog/_slug_.astro.mjs","\u0000@astro-page:src/pages/blog/index@_@astro":"pages/blog.astro.mjs","\u0000@astro-page:src/pages/contact/index@_@astro":"pages/contact.astro.mjs","\u0000@astro-page:src/pages/projects/quantterminal@_@astro":"pages/projects/quantterminal.astro.mjs","\u0000@astro-page:src/pages/projects/yournews@_@astro":"pages/projects/yournews.astro.mjs","\u0000@astro-page:src/pages/projects/index@_@astro":"pages/projects.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/pictures/index@_@astro":"pages/pictures.astro.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:src/pages/fitness/index@_@astro":"pages/fitness.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","/Users/ronniel/rg-portfolio/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_C2wRahjc.mjs","/Users/ronniel/rg-portfolio/.astro/content-assets.mjs":"chunks/content-assets_DleWbedO.mjs","/Users/ronniel/rg-portfolio/.astro/content-modules.mjs":"chunks/content-modules_Dz-S_Wwv.mjs","\u0000astro:data-layer-content":"chunks/_astro_data-layer-content_CcOFH-2b.mjs","\u0000@astrojs-manifest":"manifest_1EXWFzI0.mjs","/Users/ronniel/rg-portfolio/src/components/FitnessCharts":"_astro/FitnessCharts.B_DB3kx8.js","/Users/ronniel/rg-portfolio/src/components/PhotoGallery":"_astro/PhotoGallery.BW0CKQRw.js","/Users/ronniel/rg-portfolio/src/layouts/AppLayout":"_astro/AppLayout.DQiOuxBG.js","@astrojs/react/client.js":"_astro/client.C64n4Fqm.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/mac-background2.DAWzICtV.jpg","/_astro/mac-background1.BN3pAP-K.jpg","/_astro/mac-background3.D2uWT5Yk.jpg","/_astro/_slug_.DAOciHNp.css","/_astro/index.DRT7dAKZ.css","/Ronniel_Gandhe_Resume.pdf.txt","/robots.txt","/_astro/AppLayout.DQiOuxBG.js","/_astro/FitnessCharts.B_DB3kx8.js","/_astro/PhotoGallery.BW0CKQRw.js","/_astro/activity.CD0hnQWN.js","/_astro/calendar.BB1XvF6x.js","/_astro/camera.h34_ioe6.js","/_astro/client.C64n4Fqm.js","/_astro/createLucideIcon.P7Z5cFqg.js","/_astro/index.B7uHD6jA.js","/_astro/index.tsjqkRzM.js"],"buildFormat":"directory","checkOrigin":true,"serverIslandNameMap":[],"key":"r6sXv4SZ2Dl0aoZ/s63y3o1r5DfpkSZqBrB10QKP3Gk="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
