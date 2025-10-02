import{r as c}from"./index.tsjqkRzM.js";var l={exports:{}},i={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var d;function E(){if(d)return i;d=1;var r=Symbol.for("react.transitional.element"),e=Symbol.for("react.fragment");function s(n,o,t){var u=null;if(t!==void 0&&(u=""+t),o.key!==void 0&&(u=""+o.key),"key"in o){t={};for(var a in o)a!=="key"&&(t[a]=o[a])}else t=o;return o=t.ref,{$$typeof:r,type:n,key:u,ref:o!==void 0?o:null,props:t}}return i.Fragment=e,i.jsx=s,i.jsxs=s,i}var p;function h(){return p||(p=1,l.exports=E()),l.exports}var L=h();/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=r=>r.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),w=r=>r.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,s,n)=>n?n.toUpperCase():s.toLowerCase()),x=r=>{const e=w(r);return e.charAt(0).toUpperCase()+e.slice(1)},f=(...r)=>r.filter((e,s,n)=>!!e&&e.trim()!==""&&n.indexOf(e)===s).join(" ").trim(),k=r=>{for(const e in r)if(e.startsWith("aria-")||e==="role"||e==="title")return!0};/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var A={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=c.forwardRef(({color:r="currentColor",size:e=24,strokeWidth:s=2,absoluteStrokeWidth:n,className:o="",children:t,iconNode:u,...a},m)=>c.createElement("svg",{ref:m,...A,width:e,height:e,stroke:r,strokeWidth:n?Number(s)*24/Number(e):s,className:f("lucide",o),...!t&&!k(a)&&{"aria-hidden":"true"},...a},[...u.map(([R,C])=>c.createElement(R,C)),...Array.isArray(t)?t:[t]]));/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=(r,e)=>{const s=c.forwardRef(({className:n,...o},t)=>c.createElement(j,{ref:t,iconNode:e,className:f(`lucide-${v(x(r))}`,`lucide-${r}`,n),...o}));return s.displayName=x(r),s};export{T as c,L as j};
