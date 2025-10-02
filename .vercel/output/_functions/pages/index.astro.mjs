import { a as createComponent, r as renderTemplate, b as renderComponent } from '../chunks/astro/server_CMNnM6uP.mjs';
import 'kleur/colors';
import { N as Nav, m as macBackground1, a as macBackground2, b as macBackground3, $ as $$Layout } from '../chunks/Nav_BaHoY3hY.mjs';
import { c as getImage } from '../chunks/_astro_assets_CMjN20zx.mjs';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { MdWifi } from 'react-icons/md';
import { FaApple } from 'react-icons/fa';
import { IoCellular, IoBatteryHalfOutline, IoSearchSharp } from 'react-icons/io5';
import { VscVscode } from 'react-icons/vsc';
import { FaRegFolderClosed } from 'react-icons/fa6';
import { BsGithub, BsSpotify } from 'react-icons/bs';
import { IoIosCall, IoIosMail } from 'react-icons/io';
import { RiTerminalFill } from 'react-icons/ri';
import { g as getRecentBlogPosts } from '../chunks/blog_DrqDHIsA.mjs';
export { renderers } from '../renderers.mjs';

function MacToolbar() {
  const [currentDateTime, setCurrentDateTime] = useState(/* @__PURE__ */ new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(/* @__PURE__ */ new Date());
    }, 6e4);
    return () => clearInterval(timer);
  }, []);
  const formatMacDate = (date) => {
    const weekday = date.toLocaleString("en-US", { weekday: "short" });
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();
    const hour = date.toLocaleString("en-US", {
      hour: "numeric",
      hour12: true
    });
    const minute = date.getMinutes().toString().padStart(2, "0");
    const period = date.getHours() >= 12 ? "PM" : "AM";
    return `${weekday} ${month} ${day} ${hour.replace(
      /\s?[AP]M/,
      ""
    )}:${minute} ${period}`;
  };
  const formatIPhoneTime = (date) => {
    let hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, "0");
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour}:${minute}`;
  };
  const handleVSCodeClick = () => {
    window.location.href = "vscode:/";
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "sticky top-0 z-50 md:hidden bg-transparent text-white h-12 px-8 flex items-center justify-between text-base font-medium", children: [
      /* @__PURE__ */ jsx("span", { className: "font-semibold", children: formatIPhoneTime(currentDateTime) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(IoCellular, { size: 20 }),
        /* @__PURE__ */ jsx(MdWifi, { size: 20 }),
        /* @__PURE__ */ jsx(IoBatteryHalfOutline, { size: 24 })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "sticky top-0 z-50 hidden md:flex bg-black/20 backdrop-blur-md text-white h-6 px-4 items-center justify-between text-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
        /* @__PURE__ */ jsx(FaApple, { size: 16 }),
        /* @__PURE__ */ jsx("span", { className: "font-semibold cursor-default", children: "John Doe" }),
        /* @__PURE__ */ jsx("span", { className: "cursor-default", children: "File" }),
        /* @__PURE__ */ jsx("span", { className: "cursor-default", children: "Edit" }),
        /* @__PURE__ */ jsx("span", { className: "cursor-default", children: "View" }),
        /* @__PURE__ */ jsx("span", { className: "cursor-default", children: "Go" }),
        /* @__PURE__ */ jsx("span", { className: "cursor-default", children: "Window" }),
        /* @__PURE__ */ jsx("span", { className: "cursor-default", children: "Help" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
        /* @__PURE__ */ jsx(
          VscVscode,
          {
            size: 16,
            className: "cursor-default hover:opacity-80 transition-opacity",
            onClick: handleVSCodeClick,
            title: "Open in VSCode"
          }
        ),
        /* @__PURE__ */ jsx(MdWifi, { size: 16 }),
        /* @__PURE__ */ jsx(IoSearchSharp, { size: 16 }),
        /* @__PURE__ */ jsx("span", { className: "cursor-default", children: formatMacDate(currentDateTime) })
      ] })
    ] })
  ] });
}

function MacTerminal() {
  const welcomeMessage = `Ronniel Gandhe — Software Engineer • Quant Developer

Location: Waterloo, ON
Email: ronnielgandhe@gmail.com
GitHub: github.com/ronnielgandhe

Type /help for commands.`;
  return /* @__PURE__ */ jsxs("div", { className: "glass w-[600px] h-[400px] rounded-lg overflow-hidden shadow-lg mx-4 sm:mx-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 h-6 flex items-center space-x-2 px-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-red-500" }),
      /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-yellow-500" }),
      /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-green-500" }),
      /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-300 flex-grow text-center font-semibold flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsx(FaRegFolderClosed, { size: 14, className: "text-gray-300" }),
        "ronnielgandhe.com — zsh"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 text-gray-200 font-mono text-xs h-[calc(400px-1.5rem)] flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto", children: [
        /* @__PURE__ */ jsx("pre", { className: "whitespace-pre-wrap", children: welcomeMessage }),
        /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-green-400", children: ">" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "Interactive terminal coming soon..." })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2", children: [
        /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap text-gray-400", children: "rg@ronnielgandhe.com root %" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            disabled: true,
            className: "w-full sm:flex-1 bg-transparent outline-none text-white placeholder-gray-400 opacity-50",
            placeholder: "Terminal will be interactive soon..."
          }
        )
      ] }) })
    ] })
  ] });
}

function MobileDock() {
  const handleEmailClick = () => {
    window.location.href = "mailto:ronnielgandhe@gmail.com";
  };
  const handleGithubClick = () => {
    window.open("https://github.com/ronnielgandhe", "_blank");
  };
  const handleSpotifyClick = () => {
    window.open("https://open.spotify.com", "_blank");
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed bottom-0 left-0 right-0 md:hidden", children: /* @__PURE__ */ jsxs("div", { className: "mx-4 mb-4 p-3 bg-gradient-to-t from-gray-700 to-gray-800 backdrop-blur-xl rounded-3xl flex justify-around items-center max-w-[400px] mx-auto", children: [
    /* @__PURE__ */ jsx("a", { href: "tel:+1234567890", className: "flex flex-col items-center", children: /* @__PURE__ */ jsx("div", { className: "w-18 h-18 bg-gradient-to-t from-green-600 to-green-400 rounded-2xl flex items-center justify-center", children: /* @__PURE__ */ jsx(IoIosCall, { size: 60, className: "text-white" }) }) }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleEmailClick,
        className: "flex flex-col items-center cursor-pointer",
        children: /* @__PURE__ */ jsx("div", { className: "w-18 h-18 bg-gradient-to-t from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center", children: /* @__PURE__ */ jsx(IoIosMail, { size: 60, className: "text-white" }) })
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleGithubClick,
        className: "flex flex-col items-center cursor-pointer",
        children: /* @__PURE__ */ jsx("div", { className: "w-18 h-18 bg-gradient-to-t from-black to-black/60 rounded-2xl flex items-center justify-center", children: /* @__PURE__ */ jsx(BsGithub, { size: 55, className: "text-white" }) })
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleSpotifyClick,
        className: "flex flex-col items-center cursor-pointer",
        children: /* @__PURE__ */ jsx("div", { className: "w-18 h-18 bg-gradient-to-t from-black to-black/60 rounded-2xl flex items-center justify-center", children: /* @__PURE__ */ jsx(BsSpotify, { size: 55, className: "text-[#1ED760]" }) })
      }
    )
  ] }) });
}

function DesktopDock() {
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const handleEmailClick = () => {
    window.location.href = "mailto:ronnielgandhe@gmail.com";
  };
  const handleGithubClick = () => {
    window.open("https://github.com/ronnielgandhe", "_blank");
  };
  const handleCalendarClick = () => {
    window.location.href = "/contact";
  };
  const handleSpotifyClick = () => {
    window.open("https://open.spotify.com", "_blank");
  };
  const handleVSCodeClick = () => {
    window.location.href = "vscode:/";
  };
  const Tooltip = ({ text }) => /* @__PURE__ */ jsx("div", { className: "absolute -top-14 left-1/2 -translate-x-1/2", children: /* @__PURE__ */ jsxs("div", { className: "relative px-3 py-1 bg-[#1d1d1f]/80 backdrop-blur-sm text-white text-sm rounded-lg whitespace-nowrap border border-px border-gray-600", children: [
    text,
    /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 -translate-x-1/2 -bottom-[7px] w-3 h-3 bg-[#1d1d1f]/80 backdrop-blur-sm rotate-45 border-b border-r border-gray-600" })
  ] }) });
  return /* @__PURE__ */ jsx("div", { className: "fixed bottom-0 left-1/2 -translate-x-1/2 hidden md:block z-50", children: /* @__PURE__ */ jsx("div", { className: "relative mb-2 p-3 bg-gradient-to-t from-gray-700 to-gray-800 backdrop-blur-2xl rounded-2xl", children: /* @__PURE__ */ jsxs("div", { className: "flex items-end space-x-4", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: handleVSCodeClick,
        onMouseEnter: () => setHoveredIcon("vscode"),
        onMouseLeave: () => setHoveredIcon(null),
        className: "relative",
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg", children: /* @__PURE__ */ jsx(VscVscode, { size: 45, className: "text-blue-500" }) }),
          hoveredIcon === "vscode" && /* @__PURE__ */ jsx(Tooltip, { text: "Launch VS Code" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: handleEmailClick,
        onMouseEnter: () => setHoveredIcon("email"),
        onMouseLeave: () => setHoveredIcon(null),
        className: "relative",
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-14 h-14 bg-gradient-to-t from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg", children: /* @__PURE__ */ jsx(IoIosMail, { size: 45, className: "text-white" }) }),
          hoveredIcon === "email" && /* @__PURE__ */ jsx(Tooltip, { text: "Email Me" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: handleGithubClick,
        onMouseEnter: () => setHoveredIcon("github"),
        onMouseLeave: () => setHoveredIcon(null),
        className: "relative",
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-14 h-14  bg-gradient-to-t from-black to-black/60 rounded-xl flex items-center justify-center shadow-lg", children: /* @__PURE__ */ jsx(BsGithub, { size: 45, className: "text-gray-100" }) }),
          hoveredIcon === "github" && /* @__PURE__ */ jsx(Tooltip, { text: "My GitHub" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: handleCalendarClick,
        onMouseEnter: () => setHoveredIcon("calendar"),
        onMouseLeave: () => setHoveredIcon(null),
        className: "relative",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "w-14 h-14 overflow-hidden shadow-lg", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-white to-gray-200 rounded-xl" }),
            /* @__PURE__ */ jsx("div", { className: "absolute top-0 inset-x-0 h-5 bg-red-500 flex items-center justify-center rounded-t-xl", children: /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-white uppercase", children: (/* @__PURE__ */ new Date()).toLocaleString("en-US", { month: "short" }) }) }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-end justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-3xl font-light text-black", children: (/* @__PURE__ */ new Date()).getDate() }) })
          ] }),
          hoveredIcon === "calendar" && /* @__PURE__ */ jsx(Tooltip, { text: "Book a Call" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: handleSpotifyClick,
        onMouseEnter: () => setHoveredIcon("spotify"),
        onMouseLeave: () => setHoveredIcon(null),
        className: "relative",
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-14 h-14 bg-gradient-to-t from-black to-black/60 rounded-xl flex items-center justify-center shadow-lg", children: /* @__PURE__ */ jsx(BsSpotify, { size: 45, className: "text-[#1ED760]" }) }),
          hoveredIcon === "spotify" && /* @__PURE__ */ jsx(Tooltip, { text: "My Dev Playlist" })
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex items-center", children: /* @__PURE__ */ jsx("div", { className: "w-px h-14 bg-white/20" }) }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onMouseEnter: () => setHoveredIcon("terminal"),
        onMouseLeave: () => setHoveredIcon(null),
        className: "relative",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "w-14 h-14 rounded-2xl overflow-hidden shadow-lg", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-gray-300 to-gray-500 rounded-xl" }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-[2px] rounded-xl bg-black", children: /* @__PURE__ */ jsx("div", { className: "absolute top-1 left-2", children: /* @__PURE__ */ jsx(RiTerminalFill, { size: 20, className: "text-white" }) }) })
          ] }),
          hoveredIcon === "terminal" && /* @__PURE__ */ jsx(Tooltip, { text: "Terminal" })
        ]
      }
    )
  ] }) }) });
}

function Desktop({ initialBg, backgroundMap, recentPosts }) {
  const [currentBg, setCurrentBg] = useState(initialBg);
  useEffect(() => {
    const lastBg = localStorage.getItem("lastBackground");
    if (lastBg === initialBg) {
      const bgKeys = Object.keys(backgroundMap);
      const availableBgs = bgKeys.filter((bg) => bg !== lastBg);
      const newBg = availableBgs[Math.floor(Math.random() * availableBgs.length)];
      setCurrentBg(newBg);
    }
    localStorage.setItem("lastBackground", currentBg);
  }, [initialBg, backgroundMap]);
  return /* @__PURE__ */ jsxs("div", { className: "relative w-screen h-screen overflow-hidden", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0 bg-cover bg-center bg-no-repeat",
        style: {
          backgroundImage: `url(${backgroundMap[currentBg]})`,
          backgroundPosition: "center top",
          backgroundSize: "cover",
          transform: "translateY(-24px)",
          height: "calc(100% + 24px)"
        }
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
      /* @__PURE__ */ jsx(Nav, { currentPath: "/", recentPosts }),
      /* @__PURE__ */ jsx(MacToolbar, {})
    ] }),
    /* @__PURE__ */ jsx("div", { className: "relative z-0 flex items-center justify-center h-[calc(100vh-10rem)] md:h-[calc(100vh-1.5rem)] pt-6", children: /* @__PURE__ */ jsx(MacTerminal, {}) }),
    /* @__PURE__ */ jsx(MobileDock, {}),
    /* @__PURE__ */ jsx(DesktopDock, {})
  ] });
}

const $$LandingPage = createComponent(async ($$result, $$props, $$slots) => {
  const backgrounds = [macBackground1, macBackground2, macBackground3];
  function getRandomBackground() {
    return `bg-${Math.floor(Math.random() * backgrounds.length) + 1}`;
  }
  const optimizedBackgrounds = await Promise.all(
    backgrounds.map(
      (bg) => getImage({
        src: bg,
        width: 3500
      })
    )
  );
  const backgroundMap = Object.fromEntries(
    optimizedBackgrounds.map((bg, index) => [`bg-${index + 1}`, bg.src])
  );
  const recentPosts = await getRecentBlogPosts();
  return renderTemplate`${renderComponent($$result, "AppLayout", Desktop, { "client:load": true, "initialBg": getRandomBackground(), "backgroundMap": backgroundMap, "recentPosts": recentPosts, "client:component-hydration": "load", "client:component-path": "/Users/ronniel/rg-portfolio/src/layouts/AppLayout", "client:component-export": "default" })}`;
}, "/Users/ronniel/rg-portfolio/src/components/LandingPage.astro", undefined);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Ronniel Gandhe - Software Engineer \u2022 Quant Developer", "description": "Software Engineer and Quant Developer based in Waterloo, ON specializing in systematic trading strategies and scalable infrastructure", "canonical": "https://ronnielgandhe.com", "openGraph": {
    url: "https://ronnielgandhe.com",
    title: "Ronniel Gandhe - Software Engineer \u2022 Quant Developer",
    description: "Software Engineer and Quant Developer based in Waterloo, ON specializing in systematic trading strategies and scalable infrastructure",
    site_name: "Ronniel Gandhe"
  } }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "LandingPage", $$LandingPage, {})} ` })}`;
}, "/Users/ronniel/rg-portfolio/src/pages/index.astro", undefined);

const $$file = "/Users/ronniel/rg-portfolio/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
