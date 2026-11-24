import { useState, useRef, useEffect, useCallback } from 'react';
import type { ProjectDetail, DetailContent } from './DetailPanel';

interface ProjectsProps {
  onCardClick?: (detail: DetailContent) => void;
  windowMode?: boolean;
}

interface FileTab {
  projectIdx: number;
  fileName: string;  // "README.md", "requirements.txt", etc.
  content: string | null;
  loading: boolean;
}

// Extract repo slug from GitHub URL
function repoSlug(url: string): string {
  return url.replace('https://github.com/', '');
}

// Vibrant tech tag color palette for VS Code style
const techColors: Record<string, { bg: string; text: string; border: string }> = {
  'Python':      { bg: 'rgba(78, 154, 66, 0.15)',  text: '#6ab04c', border: 'rgba(78, 154, 66, 0.3)' },
  'PyTorch':     { bg: 'rgba(238, 76, 44, 0.14)',  text: '#ee4c2c', border: 'rgba(238, 76, 44, 0.28)' },
  'Hugging Face': { bg: 'rgba(255, 213, 79, 0.14)', text: '#ffd54f', border: 'rgba(255, 213, 79, 0.28)' },
  'FastAPI':     { bg: 'rgba(0, 150, 136, 0.14)',   text: '#009688', border: 'rgba(0, 150, 136, 0.28)' },
  'TypeScript':  { bg: 'rgba(49, 120, 198, 0.15)',  text: '#4daafc', border: 'rgba(49, 120, 198, 0.3)' },
  'JavaScript':  { bg: 'rgba(247, 223, 30, 0.14)',  text: '#f0db4f', border: 'rgba(247, 223, 30, 0.28)' },
  'React':       { bg: 'rgba(97, 218, 251, 0.12)',  text: '#61dafb', border: 'rgba(97, 218, 251, 0.25)' },
  'Next.js':     { bg: 'rgba(255, 255, 255, 0.08)', text: '#e0e0e0', border: 'rgba(255, 255, 255, 0.18)' },
  'Node.js':     { bg: 'rgba(104, 159, 56, 0.14)',  text: '#8bc34a', border: 'rgba(104, 159, 56, 0.28)' },
  'AWS':         { bg: 'rgba(255, 153, 0, 0.14)',   text: '#ff9900', border: 'rgba(255, 153, 0, 0.28)' },
  'Docker':      { bg: 'rgba(36, 150, 237, 0.14)',  text: '#2496ed', border: 'rgba(36, 150, 237, 0.28)' },
  'PostgreSQL':  { bg: 'rgba(51, 103, 145, 0.15)',  text: '#6296b4', border: 'rgba(51, 103, 145, 0.3)' },
  'Redis':       { bg: 'rgba(220, 50, 47, 0.14)',   text: '#dc382f', border: 'rgba(220, 50, 47, 0.28)' },
  'GraphQL':     { bg: 'rgba(229, 53, 171, 0.14)',  text: '#e535ab', border: 'rgba(229, 53, 171, 0.28)' },
  'Terraform':   { bg: 'rgba(98, 75, 210, 0.14)',   text: '#7b61ff', border: 'rgba(98, 75, 210, 0.28)' },
  'Go':          { bg: 'rgba(0, 173, 216, 0.14)',   text: '#00add8', border: 'rgba(0, 173, 216, 0.28)' },
  'Rust':        { bg: 'rgba(222, 165, 132, 0.14)', text: '#dea584', border: 'rgba(222, 165, 132, 0.28)' },
  'SQL':         { bg: 'rgba(0, 114, 198, 0.14)',   text: '#4daafc', border: 'rgba(0, 114, 198, 0.28)' },
  'MongoDB':     { bg: 'rgba(77, 179, 61, 0.14)',   text: '#4db33d', border: 'rgba(77, 179, 61, 0.28)' },
  'Tailwind CSS': { bg: 'rgba(56, 189, 248, 0.12)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.25)' },
  'Swift':       { bg: 'rgba(240, 81, 56, 0.14)',   text: '#f05138', border: 'rgba(240, 81, 56, 0.28)' },
  'Kotlin':      { bg: 'rgba(127, 82, 255, 0.14)',  text: '#7f52ff', border: 'rgba(127, 82, 255, 0.28)' },
  'C++':         { bg: 'rgba(0, 89, 156, 0.15)',    text: '#659ad2', border: 'rgba(0, 89, 156, 0.3)' },
  'Figma':       { bg: 'rgba(162, 89, 255, 0.14)',  text: '#a259ff', border: 'rgba(162, 89, 255, 0.28)' },
  'Stripe':      { bg: 'rgba(99, 91, 255, 0.14)',   text: '#635bff', border: 'rgba(99, 91, 255, 0.28)' },
  'OpenAI':      { bg: 'rgba(116, 170, 156, 0.14)', text: '#74aa9c', border: 'rgba(116, 170, 156, 0.28)' },
  'Astro':       { bg: 'rgba(255, 93, 1, 0.14)',    text: '#ff5d01', border: 'rgba(255, 93, 1, 0.28)' },
  'Vercel':      { bg: 'rgba(255, 255, 255, 0.08)', text: '#e0e0e0', border: 'rgba(255, 255, 255, 0.18)' },
  'GitHub Actions': { bg: 'rgba(36, 150, 237, 0.14)', text: '#2496ed', border: 'rgba(36, 150, 237, 0.28)' },
  'Grafana':     { bg: 'rgba(240, 134, 31, 0.14)',  text: '#f0861f', border: 'rgba(240, 134, 31, 0.28)' },
  'Datadog':     { bg: 'rgba(99, 44, 166, 0.14)',   text: '#b17fd6', border: 'rgba(99, 44, 166, 0.28)' },
  'LaunchDarkly': { bg: 'rgba(60, 60, 60, 0.2)',    text: '#a0a0a0', border: 'rgba(160, 160, 160, 0.2)' },
  'Supabase':    { bg: 'rgba(62, 207, 142, 0.14)',  text: '#3ecf8e', border: 'rgba(62, 207, 142, 0.28)' },
  'Firebase':    { bg: 'rgba(255, 196, 0, 0.14)',   text: '#ffc400', border: 'rgba(255, 196, 0, 0.28)' },
  'Selenium':    { bg: 'rgba(67, 176, 42, 0.14)',   text: '#43b02a', border: 'rgba(67, 176, 42, 0.28)' },
  'NumPy':       { bg: 'rgba(77, 119, 207, 0.14)',  text: '#4d77cf', border: 'rgba(77, 119, 207, 0.28)' },
  'Pandas':      { bg: 'rgba(21, 2, 101, 0.2)',     text: '#a0a0e0', border: 'rgba(160, 160, 224, 0.25)' },
  'scikit-learn': { bg: 'rgba(249, 130, 57, 0.14)', text: '#f98239', border: 'rgba(249, 130, 57, 0.28)' },
};

// Rotating bright fallback palette for unknown techs
const fallbackColors = [
  { bg: 'rgba(255, 107, 107, 0.14)', text: '#ff6b6b', border: 'rgba(255, 107, 107, 0.28)' },
  { bg: 'rgba(78, 205, 196, 0.14)',  text: '#4ecdc4', border: 'rgba(78, 205, 196, 0.28)' },
  { bg: 'rgba(255, 230, 109, 0.14)', text: '#ffe66d', border: 'rgba(255, 230, 109, 0.28)' },
  { bg: 'rgba(168, 130, 255, 0.14)', text: '#a882ff', border: 'rgba(168, 130, 255, 0.28)' },
  { bg: 'rgba(255, 159, 67, 0.14)',  text: '#ff9f43', border: 'rgba(255, 159, 67, 0.28)' },
  { bg: 'rgba(0, 210, 211, 0.14)',   text: '#00d2d3', border: 'rgba(0, 210, 211, 0.28)' },
];

function getTechColor(tech: string): { bg: string; text: string; border: string } {
  // Direct match
  if (techColors[tech]) return techColors[tech];
  // Partial match (e.g. "AWS (S3, DynamoDB, Lambda, CloudWatch)" → "AWS")
  const key = Object.keys(techColors).find(k => tech.toLowerCase().includes(k.toLowerCase()));
  if (key) return techColors[key];
  // Fallback: deterministic color based on string hash
  let hash = 0;
  for (let i = 0; i < tech.length; i++) hash = ((hash << 5) - hash + tech.charCodeAt(i)) | 0;
  return fallbackColors[Math.abs(hash) % fallbackColors.length];
}

const projects = [
  {
    id: 1,
    title: "LeanFetch",
    description: "a tool that stops startups from losing cash to unnecessary api calls. paste a repo url or drop in your code, it runs static analysis for the patterns that quietly burn money (llm calls in loops, retry storms, oversized contexts, the biggest model doing a tiny job, no caching) and hands back a cost-waste report with estimated savings and the fix for each one.",
    gradient: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)",
    coverImage: "/leanfetch-cover.png",
    repoUrl: "https://github.com/ronnielgandhe/leanfetch",
    pageUrl: "/leanfetch",
    language: "TypeScript",
    files: ["README.md", "how it works.md", "detectors.md", "savings math.md", "takeaways.md"],
    detail: {
      type: 'project' as const,
      id: 1,
      title: "LeanFetch",
      gradient: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)",
      coverImage: "/leanfetch-cover.png",
      architecture: "one next.js app. the repo comes in as a github tarball (or files you upload), gets filtered down to real source files, and runs through a set of deterministic detectors. each finding carries the file, the lines, why it costs money and the fix. the claude pass is optional and stays on the server.",
      technicalChallenges: ["keeping false positives down. a call inside a loop is only a problem if it is really an api call, so every finding needs evidence in the code and ships with a confidence level", "making the savings number honest. the report shows the formula and lets you change the assumptions instead of printing one scary figure", "running a public tool that can call claude without letting strangers drain the key. rate limits per ip, a daily cap, and hard caps on input size"],
      lessonsLearned: ["most api waste is boring. it is the same handful of patterns in every codebase", "a tool that lectures you about llm spend should not need an llm to do its main job. the core scan is free and deterministic", "show the math. people trust an estimate they can poke at"],
      techStack: ["TypeScript", "Next.js", "Node", "Anthropic SDK", "Tailwind"],
      repoUrl: "https://github.com/ronnielgandhe/leanfetch",
      sections: [
        {
          title: "How It Works",
          content: "**1. fetch.** paste a public github repo or upload files. the repo is pulled as a tarball and unpacked in memory, nothing is written to disk.\n\n**2. filter.** vendor folders, lockfiles, build output and minified files are dropped so only real source gets scanned.\n\n**3. detect.** each file runs through the detectors. a few of them look across files, like a loop that calls a wrapper defined somewhere else.\n\n**4. report.** findings are grouped by pattern with the file, the lines, the reason it costs money, the fix, and an estimated monthly saving."
        },
        {
          title: "Detectors",
          content: "the patterns it looks for:\n\n- api and llm calls inside loops\n- no max_tokens, so output is unbounded\n- retry loops with no cap or backoff\n- the most expensive model used for a simple task\n- a big static system prompt sent every time with no prompt caching\n- the whole chat history resent on every turn\n- entire files or documents pasted into a prompt\n- embeddings computed one at a time instead of batched\n- identical calls with no cache\n- offline jobs that could use a batch api"
        },
        {
          title: "Savings Math",
          content: "every estimate comes from a formula you can see: calls per day, tokens per call, and the price of the model in use. you can change the assumptions and the numbers update live.\n\nit is an estimate, not an invoice. the point is to rank what to fix first."
        },
        {
          title: "Takeaways",
          content: "**boring patterns, real money.** nobody decides to waste money on api calls. it happens one convenient loop at a time.\n\n**deterministic first.** the scan is plain static analysis. claude only shows up as an optional second read, on the server, behind rate limits.\n\n**practice what you preach.** the tool caps its own tokens and caches its own prompts."
        }
      ]
    } satisfies ProjectDetail
  },
  {
    id: 5,
    title: "Harvey",
    description: "a voice legal assistant. you call, ask a legal question out loud, and harvey answers by voice and cites the actual statute on screen. it is a livekit voice agent with rag over a 2,806 chunk corpus of ontario and federal law, plus tools for live news and stock quotes.",
    gradient: "linear-gradient(135deg, #0b0b0f 0%, #1a1a24 50%, #2a2a3a 100%)",
    coverImage: "/harvey-cover.png",
    repoUrl: "https://github.com/ronnielgandhe/harvey",
    pageUrl: "/harvey",
    language: "Python",
    files: ["README.md", "architecture.md", "rag.md", "voice pipeline.md", "takeaways.md"],
    detail: {
      type: 'project' as const,
      id: 5,
      title: "Harvey",
      gradient: "linear-gradient(135deg, #0b0b0f 0%, #1a1a24 50%, #2a2a3a 100%)",
      coverImage: "/harvey-cover.png",
      architecture: "next.js frontend joins a livekit room over webrtc. a python agent worker handles the call: deepgram for speech to text, gpt-4o-mini for the llm and tool calling, elevenlabs for the voice, silero for voice activity. tools publish json events over the livekit data channel and the frontend opens a pane for each one.",
      technicalChallenges: ["getting first audio out fast. the greeting is spoken the moment the stream connects, before the llm is warm", "keeping the screen in sync with the voice. every tool call pushes an event over the data channel so the ui shows what he is citing while he talks", "grounding answers in real statute text. retrieval over 2,806 chunks across 7 statutes, so answers point at a section and not a vibe"],
      lessonsLearned: ["in voice, latency is the product. every design choice came back to time to first audio", "tools that draw on screen make a voice agent feel much smarter than one that only talks", "a small, well scoped corpus beats a huge messy one"],
      techStack: ["Python", "LiveKit", "Deepgram", "ElevenLabs", "OpenAI", "Chroma", "Next.js"],
      repoUrl: "https://github.com/ronnielgandhe/harvey",
      sections: [
        {
          title: "Architecture",
          content: "**browser.** next.js app gets a token, joins the livekit room, sends mic audio up and listens on the data channel.\n\n**agent.** a python worker joins the room. deepgram nova-3 streams the transcript, gpt-4o-mini decides whether to answer or call a tool, elevenlabs speaks the reply.\n\n**tools.** six function tools: cite a statute (rag), current events, stock quote, congressional trades, screen control, end call. each one renders its own pane."
        },
        {
          title: "RAG",
          content: "7 statutes, 2,806 chunks, stored in chroma.\n\n- ontario highway traffic act\n- canada criminal code\n- ontario residential tenancies act\n- ontario employment standards act\n- controlled drugs and substances act\n- plus cannabis and consumer protection\n\nwhen you ask a legal question the agent retrieves the closest sections and cites them on screen while answering."
        },
        {
          title: "Voice Pipeline",
          content: "**1.** you hit call and join the room.\n\n**2.** the agent says hello right away with a canned line.\n\n**3.** you talk, deepgram transcribes, vad and turn detection decide when you are done.\n\n**4.** the llm answers or fires a tool.\n\n**5.** the tool publishes an event, the pane appears, harvey keeps talking."
        },
        {
          title: "Takeaways",
          content: "**latency first.** people forgive a wrong answer faster than a slow one.\n\n**show the receipts.** putting the statute on screen while he talks is what makes it trustworthy.\n\n**scope the corpus.** seven statutes that students actually run into covered almost every question."
        }
      ]
    } satisfies ProjectDetail
  },
  {
    id: 6,
    title: "Game Solver Suite",
    description: "one chrome extension that solves the linkedin and nyt daily games. real solvers for queens, tango, zip, mini sudoku, patches, strands and wordle, plus connections, the mini crossword and spelling bee. ten games, two sites, one extension.",
    gradient: "linear-gradient(135deg, #0a66c2 0%, #084d92 50%, #052e57 100%)",
    coverImage: "/linkdensolver.png",
    repoUrl: "https://github.com/ronnielgandhe/linkedin-games-solver",
    pageUrl: "/game-solver-suite",
    language: "JavaScript",
    files: ["README.md", "solvers.md", "reading the game.md", "fixing itself.md", "trusted input.md", "takeaways.md"],
    detail: {
      type: 'project' as const,
      id: 6,
      title: "Game Solver Suite",
      gradient: "linear-gradient(135deg, #0a66c2 0%, #084d92 50%, #052e57 100%)",
      coverImage: "/linkdensolver.png",
      architecture: "class names change every deploy. the shape of the game state almost never does. so the solvers find the react fiber attached to a dom node and walk it: hook state, props and class state, breadth first, depth capped, cycle safe. the linkedin games ship a puzzle, so those get solved. the nyt games ship the answer to your browser, so those get read.",
      technicalChallenges: ["zip and patches ignore synthetic events. the fix was attaching chrome.debugger and dispatching trusted mouse events from the service worker", "the games run inside iframes, so solvers are injected into every frame and the popup takes the result from whichever one finds the board", "wall detection in zip has three fallbacks: react fiber, connector elements, then border widths", "strands needs real drag gestures, so the service worker sends them over the chrome debugger protocol", "finding the strands api endpoint without hardcoding it. the solver reads performance.getEntriesByType('resource') and re-fetches the puzzle"],
      lessonsLearned: ["the dom is an api if you are stubborn enough", "when a page blocks fake input, the debugger protocol is the honest way in", "no build step means it still works a year later", "the answer is almost always already on the page", "dfs with a visited set is enough to trace words through a letter grid"],
      techStack: ["JavaScript", "Chrome Extension API", "Chrome Debugger Protocol", "Manifest V3"],
      repoUrl: "https://github.com/ronnielgandhe/linkedin-games-solver",
      sections: [
        {
          title: "Solvers",
          content: "| game | how | plays |\n|---|---|---|\n| mini sudoku | backtracking, 6x6 with 2x3 boxes | clicks the cell, then the digit |\n| tango | backtracking, board re-checked every step | one click sun, two clicks moon |\n| queens | row by row, column, touch and colour pruning | double click per queen |\n| zip | hamiltonian path, warnsdorff + split check | trusted drag via chrome.debugger |\n| patches | reads the solution out of react state | one trusted drag per rectangle |\n| wordle | fiber, wider fiber scan, globals, api | five keydowns and enter |\n| connections | four groups of four from fiber or api | clicks the cards, easiest first |\n| strands | dfs over 8 neighbours, words fitted | trusted drag through each word |\n| mini crossword | answer grid from fiber, globals or api | clicks each cell, types it |\n| spelling bee | the word list the page already has | pangrams first, then longest |"
        },
        {
          title: "Reading The Game",
          content: "class names change every deploy. the shape of the game state almost never does. so the solvers find the react fiber attached to a dom node and walk it: hook state, props and class state, breadth first, depth capped, cycle safe. the linkedin games ship a puzzle, so those get solved. the nyt games ship the answer to your browser, so those get read."
        },
        {
          title: "Fixing Itself",
          content: "every solver lists the ways it can read its game, in order: react state, page data or api, then dom fallbacks. the runner tries each one, sanity checks it and remembers the winner, so when a site change breaks a read it costs one slow solve and the next run goes straight to what works. the brittle selectors live in a json file the extension pulls from github, so a fix ships without a reinstall."
        },
        {
          title: "Trusted Input",
          content: "most games accept clicks sent from a content script. zip and patches do not. they want real drag gestures.\n\nso the background service worker attaches with chrome.debugger and sends Input.dispatchMouseEvent commands. to the page it looks like a real mouse."
        },
        {
          title: "Takeaways",
          content: "**read state, do not guess it.** walking the react fiber tree is more reliable than reverse engineering class names.\n\n**keep it small.** vanilla js, no dependencies, nothing to break.\n\n**let the page do the work.** it already fetched the answers.\n\n**trusted events matter.** some inputs cannot be faked from a content script."
        }
      ]
    } satisfies ProjectDetail
  },
  {
    id: 4,
    title: "How Many Clicks",
    description: "A Wikipedia pathfinding game where you race against an AI to connect two random articles using only hyperlinks. The AI uses a custom beam search algorithm with semantic scoring, hub page recognition, and related-term expansion to find efficient paths — then you try to beat it. The game visualizes the AI's journey in real-time, showing which links it considered, why it chose each hop, and how its semantic understanding of the target guided its decisions. Built entirely in the browser with React and the Wikipedia MediaWiki API, no backend required.",
    gradient: "linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 50%, #1a1a2e 100%)",
    coverImage: "/howmanyclicks-cover.png",
    repoUrl: "https://github.com/ronnielgandhe/how-many-clicks",
    pageUrl: "/how-many-clicks",
    language: "JavaScript",
    files: ["README.md", "architecture.md", "pathfinding.md", "game design.md", "impact.md", "takeaways.md"],
    detail: {
      type: 'project' as const,
      id: 4,
      title: "How Many Clicks",
      gradient: "linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 50%, #1a1a2e 100%)",
      coverImage: "/howmanyclicks-cover.png",
      demoVideo: "/howmanyclicks-demo.mp4",
      architecture: "How Many Clicks is an entirely client-side React application bundled with Vite — no backend, no database, no server costs. All pathfinding runs in the browser using the Wikipedia MediaWiki API for article content and link extraction. The core algorithm is a beam search that maintains a frontier of the K most promising articles at each step, scoring each outgoing link based on semantic similarity to the target article. The scoring system combines keyword overlap, related-term expansion (generated from the target article's content), and a hub recognition system that identifies high-connectivity 'bridge' articles (like 'United States,' 'Europe,' 'Science') and strategically uses or avoids them depending on context. Two difficulty modes are available: Normal mode uses a narrow beam (K=3) for more human-like exploration, while the wide beam widens the beam (K=8) and enables aggressive related-term expansion for faster, more optimal paths. The game UI renders the AI's journey in real-time with article thumbnail previews, link-by-link reasoning annotations, and an interactive path visualization.",
      technicalChallenges: [
        "The semantic scoring function had to work without any NLP models in the browser — no word embeddings, no transformers, just raw text comparison. The solution uses a multi-signal approach: exact keyword matches, stemmed keyword overlap, related-term expansion from the target article's content, and category-based similarity inferred from Wikipedia categories. This lightweight approach achieves surprisingly good pathfinding with zero model inference",
        "Hub article recognition was critical for pathfinding quality. Articles like 'United States' or 'World War II' link to thousands of other articles and act as bridges between unrelated topics. The algorithm maintains a dynamic hub score based on outgoing link count and topic breadth — it uses hubs strategically when stuck but penalizes them when better semantic paths are available, preventing the degenerate strategy of always routing through 'United States'",
        "Real-time visualization of the AI's decision process required careful state management — each step of the beam search needs to be rendered with the articles considered, scores assigned, and reasoning for the chosen path. This meant making the pathfinding algorithm yield intermediate results rather than running to completion, using an async generator pattern that plays nicely with React's rendering cycle",
        "Wikipedia API rate limiting in the browser was a constraint — the MediaWiki API throttles unauthenticated requests, so the pathfinding algorithm needed to minimize API calls. Caching article link data, batching link-extraction requests, and pruning the search frontier aggressively were all necessary to keep the game responsive"
      ],
      lessonsLearned: [
        "Beam search with semantic scoring dramatically outperforms naive BFS for Wikipedia navigation — BFS treats all links as equal and quickly explodes to thousands of nodes, while beam search focuses on the most promising paths and typically finds connections in 4-6 hops",
        "Related-term expansion is the secret weapon for finding non-obvious paths. When searching for a path to 'Jazz Music,' expanding the target terms to include 'New Orleans,' 'improvisation,' 'saxophone,' and 'blues' helps the algorithm recognize relevant links that do not contain the word 'jazz'",
        "Entirely client-side applications can deliver rich, interactive experiences without any backend infrastructure — the trade-off is working within browser API rate limits and bundle size constraints, but the benefit is zero operational costs and instant deployment",
        "Gamification transforms a technical demo into something people actually want to use. The competitive element of racing the AI made people engage with the pathfinding visualization in a way that a standalone algorithm demo never would"
      ],
      techStack: ["React", "Vite", "JavaScript", "Wikipedia API", "CSS Animations"],
      repoUrl: "https://github.com/ronnielgandhe/how-many-clicks",
      sections: [
        {
          title: "Architecture",
          content: "How Many Clicks is a zero-backend React application with all logic running in the browser:\n\n**Application Layer** — React components manage game state (article selection, turn tracking, score comparison), user navigation through Wikipedia articles, and the AI pathfinding visualization. Vite handles bundling with hot module replacement for development.\n\n**Wikipedia API Layer** — A thin client wrapper around the MediaWiki API handles article content fetching, link extraction, and search. Includes request batching (up to 50 titles per API call), response caching with LRU eviction, and automatic retry with backoff for rate-limited requests.\n\n**Pathfinding Engine** — The beam search algorithm runs as an async generator, yielding intermediate results at each step for real-time visualization. The engine is decoupled from the UI through a clean interface: it accepts a start article, target article, and configuration (beam width, mode), and yields step-by-step results including considered links, scores, and the chosen path.\n\n**Visualization Layer** — Renders the AI's journey as an animated path with article previews, score annotations, and reasoning commentary. CSS animations handle transitions between steps, and the path visualization uses SVG for connection lines between article nodes."
        },
        {
          title: "Pathfinding",
          content: "The pathfinding algorithm is a semantically-guided beam search customized for Wikipedia's link graph:\n\n**Beam Search Core** — At each step, the algorithm fetches all outgoing links from the current frontier articles, scores each link against the target, and keeps the top-K scoring links as the new frontier. K=3 for Normal mode, K=8 for the wide beam.\n\n**Semantic Scoring** — Each candidate link is scored by combining multiple signals:\n- Direct keyword match (40% weight): Does the link text or target article title contain keywords from the target?\n- Stemmed overlap (25% weight): Stemmed versions of link terms matched against stemmed target terms\n- Related-term match (25% weight): Match against an expanded term set generated from the target article's opening paragraph\n- Category proximity (10% weight): Wikipedia categories shared between the candidate and target articles\n\n**Hub Recognition** — The algorithm maintains a dynamic hub database of high-connectivity articles. When the frontier is stuck (no links score above a threshold), hub articles are temporarily prioritized as 'escape hatches' to reach a different region of the link graph. When good semantic paths are available, hubs are penalized to avoid degenerate shortest paths that route everything through 'United States.'\n\n**Related-Term Expansion** — Before pathfinding begins, the algorithm analyzes the target article's first paragraph to extract related terms, synonyms, and associated concepts. For a target of 'Jazz,' the expanded set might include: 'New Orleans,' 'improvisation,' 'blues,' 'swing,' 'bebop,' 'saxophone,' 'Louis Armstrong.' This dramatically improves the algorithm's ability to recognize relevant links that do not explicitly mention the target topic."
        },
        {
          title: "Game Design",
          content: "The game design turns a pathfinding algorithm into a compelling competitive experience:\n\n**Game Flow** — Two random Wikipedia articles are selected. The AI pathfinder runs first, with its journey visualized step-by-step in real time. Once the AI finishes, the user is shown the AI's path length and challenged to match or beat it by manually navigating Wikipedia links.\n\n**Difficulty Modes:**\n- Normal Mode: AI uses beam width K=3 with standard scoring. Produces human-like paths that are challenging but beatable. The AI typically finds paths of 4-6 hops.\n- the wide beam: AI uses beam width K=8 with aggressive related-term expansion and wider semantic matching. Produces near-optimal paths that are very difficult to beat. Fun for experienced players.\n\n**Journey Visualization** — As the AI searches, each step is animated: the current article is shown with a preview snippet, considered links are briefly displayed with their scores, and the chosen link animates into the path. Commentary text explains the AI's reasoning ('Chose \\'Industrial Revolution\\' because it connects manufacturing to the target topic of \\'Steam Engine\\'').\n\n**Scoring** — Players are scored on path length (fewer clicks = better), with bonus recognition for beating the AI. The game tracks personal bests and encourages replaying with different article pairs."
        },
        {
          title: "Impact",
          content: "How Many Clicks demonstrates that sophisticated AI concepts can be made accessible through games:\n\n**Engagement** — The competitive framing makes people genuinely invested in understanding how the pathfinding works. Players naturally develop intuitions about semantic similarity, hub articles, and graph traversal simply by trying to beat the AI.\n\n**Zero Infrastructure** — Running entirely in the browser means zero hosting costs, zero DevOps, and instant deployment via any static hosting provider. The trade-off (Wikipedia API rate limits) is manageable with caching and request batching.\n\n**Educational Value** — The real-time visualization of beam search decisions serves as an intuitive introduction to graph search algorithms, heuristic scoring, and the structure of Wikipedia's link graph — concepts that are typically taught through dry textbook examples."
        },
        {
          title: "Takeaways",
          content: "Key lessons from building a game around a pathfinding algorithm:\n\n**Lightweight NLP can be surprisingly effective.** Without access to word embeddings or language models in the browser, the multi-signal scoring approach (keyword matching, stemming, related-term expansion, category proximity) achieves pathfinding quality that feels intelligent. Sophisticated NLP is not always necessary when you can combine multiple simple signals thoughtfully.\n\n**Hub recognition is essential for graph navigation.** Without it, the algorithm degenerates to routing everything through a handful of super-connected articles. The dynamic hub scoring system — use hubs when stuck, penalize them when better paths exist — was the key to producing interesting, diverse paths.\n\n**Async generators are perfect for visualizable algorithms.** Making the beam search yield intermediate results at each step, rather than returning only the final path, enabled real-time visualization with minimal architectural complexity. The generator pattern separated algorithm logic from rendering concerns cleanly.\n\n**Games make algorithms sticky.** A standalone beam search demo would get a few minutes of attention. Wrapping it in a competitive game with scoring, personal bests, and real-time visualization makes people spend 20-30 minutes exploring how the algorithm works. Gamification is an underrated tool for making technical concepts engaging."
        }
      ]
    } satisfies ProjectDetail
  }
];

// File icon by extension/name
function getFileIcon(name: string): { icon: string; color: string } {
  if (name === 'README.md') return { icon: 'M', color: '#519aba' };
  if (name.endsWith('.md')) return { icon: 'M', color: '#519aba' };
  if (name.endsWith('.py')) return { icon: 'Py', color: '#3572A5' };
  if (name.endsWith('.js')) return { icon: 'JS', color: '#f1e05a' };
  if (name.endsWith('.ts') || name.endsWith('.tsx')) return { icon: 'TS', color: '#3178c6' };
  if (name.endsWith('.json')) return { icon: '{ }', color: '#cbcb41' };
  if (name.endsWith('.txt')) return { icon: 'T', color: '#8a8a8a' };
  if (name.endsWith('.html')) return { icon: '<>', color: '#e34c26' };
  if (name.endsWith('/')) return { icon: '📁', color: '' };
  return { icon: '·', color: '#8a8a8a' };
}

// Check if a file name corresponds to a project section
function getSectionContent(projDetail: ProjectDetail, fileName: string): string | null {
  if (!projDetail.sections || fileName === 'README.md') return null;
  const sectionTitle = fileName.replace(/\.md$/, '').toLowerCase();
  const section = projDetail.sections.find(s => s.title.toLowerCase() === sectionTitle);
  return section ? section.content : null;
}

// Get the section title (original casing) from a file name
function getSectionTitle(projDetail: ProjectDetail, fileName: string): string | null {
  if (!projDetail.sections || fileName === 'README.md') return null;
  const sectionTitle = fileName.replace(/\.md$/, '').toLowerCase();
  const section = projDetail.sections.find(s => s.title.toLowerCase() === sectionTitle);
  return section ? section.title : null;
}

// Render markdown-like content with bold, paragraphs, and lists
function renderMarkdownContent(content: string) {
  const paragraphs = content.split('\n\n');
  return paragraphs.map((para, pi) => {
    const trimmed = para.trim();
    if (!trimmed) return null;

    // Check if this is a list (lines starting with -)
    const lines = trimmed.split('\n');
    const isList = lines.every(l => l.trim().startsWith('- ') || l.trim() === '');
    if (isList) {
      return (
        <ul key={pi} style={{ paddingLeft: '20px', margin: '0 0 16px' }}>
          {lines.filter(l => l.trim().startsWith('- ')).map((line, li) => (
            <li key={li} style={{ marginBottom: '4px' }}>{renderInlineMarkdown(line.trim().slice(2))}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={pi} style={{ margin: '0 0 16px' }}>
        {renderInlineMarkdown(trimmed.replace(/\n/g, ' '))}
      </p>
    );
  });
}

// Render inline markdown (bold text with **)
function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#e6e6e6', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function getLangColor(lang: string): string {
  if (lang === 'Python') return '#3572A5';
  if (lang === 'JavaScript') return '#f1e05a';
  if (lang === 'TypeScript') return '#3178c6';
  return '#8a8a8a';
}

const Projects = ({ onCardClick, windowMode }: ProjectsProps) => {
  const [selectedProject, setSelectedProject] = useState(0);
  const [expandedFolders, setExpandedFolders] = useState<Record<number, boolean>>({ 0: true });
  const [fileTabs, setFileTabs] = useState<FileTab[]>([{ projectIdx: 0, fileName: 'README.md', content: null, loading: false }]);
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [terminalHeight, setTerminalHeight] = useState(120);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const [sidebarWidth] = useState(220);
  const [fileCache, setFileCache] = useState<Record<string, string>>({});
  const editorRef = useRef<HTMLDivElement>(null);

  const activeTab = fileTabs[activeTabIdx] || fileTabs[0];

  // Fetch file content from GitHub
  const fetchFileContent = useCallback(async (projIdx: number, fileName: string) => {
    const cacheKey = `${projIdx}:${fileName}`;
    if (fileCache[cacheKey]) return fileCache[cacheKey];

    const repo = repoSlug(projects[projIdx].repoUrl);
    try {
      const res = await fetch(`/api/github?repo=${encodeURIComponent(repo)}&file=${encodeURIComponent(fileName)}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.content) {
        setFileCache(prev => ({ ...prev, [cacheKey]: data.content }));
        return data.content as string;
      }
    } catch {}
    return null;
  }, [fileCache]);

  // Open a file tab
  const openFile = useCallback((projIdx: number, fileName: string) => {
    // Check if tab already exists
    const existingIdx = fileTabs.findIndex(t => t.projectIdx === projIdx && t.fileName === fileName);
    if (existingIdx >= 0) {
      setActiveTabIdx(existingIdx);
      setSelectedProject(projIdx);
      return;
    }

    // Check if this is a section file (non-README .md file matching a section title)
    const sectionContent = getSectionContent(projects[projIdx].detail, fileName);
    if (sectionContent !== null) {
      const newTab: FileTab = { projectIdx: projIdx, fileName, content: sectionContent, loading: false };
      const newTabs = [...fileTabs, newTab];
      const newIdx = newTabs.length - 1;
      setFileTabs(newTabs);
      setActiveTabIdx(newIdx);
      setSelectedProject(projIdx);
      return;
    }

    // Create new tab
    const newTab: FileTab = { projectIdx: projIdx, fileName, content: null, loading: true };
    const newTabs = [...fileTabs, newTab];
    const newIdx = newTabs.length - 1;
    setFileTabs(newTabs);
    setActiveTabIdx(newIdx);
    setSelectedProject(projIdx);

    // Fetch content
    const cacheKey = `${projIdx}:${fileName}`;
    if (fileCache[cacheKey]) {
      setFileTabs(prev => prev.map((t, i) => i === newIdx ? { ...t, content: fileCache[cacheKey], loading: false } : t));
    } else {
      fetchFileContent(projIdx, fileName).then(content => {
        setFileTabs(prev => prev.map((t, i) => i === newIdx ? { ...t, content: content || '# File not found\n\nCould not load this file from GitHub.', loading: false } : t));
      });
    }
  }, [fileTabs, fileCache, fetchFileContent]);

  // Select project (opens README tab)
  const selectProject = (idx: number) => {
    setSelectedProject(idx);
    // Check if a README tab for this project exists
    const readmeIdx = fileTabs.findIndex(t => t.projectIdx === idx && t.fileName === 'README.md');
    if (readmeIdx >= 0) {
      setActiveTabIdx(readmeIdx);
    } else {
      openFile(idx, 'README.md');
    }
  };

  const closeTab = (tabIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTabs = fileTabs.filter((_, i) => i !== tabIdx);
    setFileTabs(newTabs);
    if (activeTabIdx === tabIdx) {
      const newActive = Math.min(tabIdx, newTabs.length - 1);
      setActiveTabIdx(Math.max(0, newActive));
      if (newTabs[newActive]) setSelectedProject(newTabs[newActive].projectIdx);
    } else if (activeTabIdx > tabIdx) {
      setActiveTabIdx(activeTabIdx - 1);
    }
  };

  const project = projects[selectedProject];
  const detail = project.detail;

  // Auto-fetch content for the active tab if it hasn't been loaded yet
  useEffect(() => {
    const tab = fileTabs[activeTabIdx];
    if (!tab || tab.content !== null || tab.loading) return;

    // Section files should already have content set — don't fetch from GitHub
    const sectionContent = getSectionContent(projects[tab.projectIdx].detail, tab.fileName);
    if (sectionContent !== null) {
      setFileTabs(prev => prev.map((t, i) => i === activeTabIdx ? { ...t, content: sectionContent, loading: false } : t));
      return;
    }

    // Mark as loading
    setFileTabs(prev => prev.map((t, i) => i === activeTabIdx ? { ...t, loading: true } : t));

    const repo = repoSlug(projects[tab.projectIdx].repoUrl);
    const cacheKey = `${tab.projectIdx}:${tab.fileName}`;

    if (fileCache[cacheKey]) {
      setFileTabs(prev => prev.map((t, i) => i === activeTabIdx ? { ...t, content: fileCache[cacheKey], loading: false } : t));
      return;
    }

    fetch(`/api/github?repo=${encodeURIComponent(repo)}&file=${encodeURIComponent(tab.fileName)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const content = data?.content || null;
        if (content) setFileCache(prev => ({ ...prev, [cacheKey]: content }));
        setFileTabs(prev => prev.map((t, i) => i === activeTabIdx ? { ...t, content: content || `# Could not load ${tab.fileName}`, loading: false } : t));
      })
      .catch(() => {
        setFileTabs(prev => prev.map((t, i) => i === activeTabIdx ? { ...t, content: `# Could not load ${tab.fileName}`, loading: false } : t));
      });
  }, [activeTabIdx, fileTabs.length]);

  // Scroll editor to top when switching tabs
  useEffect(() => {
    editorRef.current?.scrollTo(0, 0);
  }, [activeTabIdx]);

  return (
    <div className="vsc-root" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      fontFamily: 'var(--os-font)', fontVariantNumeric: 'tabular-nums',
      fontSize: '13px',
      color: '#cccccc',
      background: '#1e1e1e',
      overflow: 'hidden',
    }}>
      {/* Main area: activity bar + sidebar + editor */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* ── Activity Bar ── */}
        <div style={{
          width: '48px',
          minWidth: '48px',
          background: '#333333',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '4px',
          gap: '2px',
          borderRight: '1px solid #252526',
        }}>
          <ActivityIcon active label="Explorer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7V5a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </ActivityIcon>
          <ActivityIcon label="Search">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="10" r="6" />
              <line x1="14.5" y1="14.5" x2="20" y2="20" />
            </svg>
          </ActivityIcon>
          <ActivityIcon label="Source Control">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="6" r="2.5" />
              <circle cx="18" cy="10" r="2.5" />
              <circle cx="6" cy="18" r="2.5" />
              <path d="M6 8.5v7M8.5 6h5.5a2 2 0 012 2v2" />
            </svg>
          </ActivityIcon>
          <ActivityIcon label="Extensions">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="8" height="8" rx="1" />
              <rect x="13" y="3" width="8" height="8" rx="1" />
              <rect x="3" y="13" width="8" height="8" rx="1" />
              <rect x="13" y="13" width="8" height="8" rx="1" />
            </svg>
          </ActivityIcon>

          <div style={{ flex: 1 }} />

          <ActivityIcon label="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </ActivityIcon>
        </div>

        {/* ── Explorer Sidebar ── */}
        <div style={{
          width: `${sidebarWidth}px`,
          minWidth: `${sidebarWidth}px`,
          background: '#252526',
          borderRight: '1px solid #1e1e1e',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Sidebar header */}
          <div style={{
            padding: '10px 16px 8px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: '#bbbbbb',
            fontFamily: 'var(--os-font)',
          }}>
            Explorer
          </div>

          {/* File tree */}
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '8px' }}>
            {projects.map((proj, idx) => {
              const isExpanded = expandedFolders[idx] || false;
              const folderSlug = proj.title.toUpperCase().replace(/\s+/g, '-');
              return (
                <div key={proj.id}>
                  {/* Folder row */}
                  <div
                    onClick={() => {
                      if (selectedProject === idx && expandedFolders[idx]) {
                        // Already selected + expanded: just collapse
                        setExpandedFolders(prev => ({ ...prev, [idx]: false }));
                      } else {
                        // Select + expand
                        setExpandedFolders(prev => ({ ...prev, [idx]: true }));
                        selectProject(idx);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px 3px 12px',
                      cursor: 'pointer',
                      background: selectedProject === idx ? 'rgba(255,255,255,0.06)' : 'transparent',
                      color: '#cccccc',
                      fontSize: '13px',
                      userSelect: 'none',
                    }}
                    className="vsc-tree-item"
                  >
                    <span style={{
                      fontSize: '10px',
                      width: '14px',
                      textAlign: 'center',
                      color: '#888',
                      transition: 'transform 0.15s',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      display: 'inline-block',
                    }}>▶</span>
                    <span style={{ fontSize: '14px' }}>📁</span>
                    <span style={{
                      fontWeight: 600,
                      fontSize: '12px',
                    }}>{folderSlug}</span>
                  </div>

                  {/* Files */}
                  {isExpanded && proj.files.map((file, fi) => {
                    const { icon, color } = getFileIcon(file);
                    const isDir = file.endsWith('/');
                    const isReadme = file === 'README.md';
                    const isActiveFile = activeTab?.projectIdx === idx && activeTab?.fileName === file;

                    const isSectionFile = file.endsWith('.md') && file !== 'README.md' && getSectionContent(proj.detail, file) !== null;

                    const handleFileClick = () => {
                      if (isDir) return;
                      if (isSectionFile) {
                        // Section .md files scroll to that section within the README view
                        // First, make sure the README tab is active for this project
                        const readmeIdx = fileTabs.findIndex(t => t.projectIdx === idx && t.fileName === 'README.md');
                        if (readmeIdx >= 0) {
                          setActiveTabIdx(readmeIdx);
                          setSelectedProject(idx);
                        } else {
                          openFile(idx, 'README.md');
                        }
                        // Scroll to the section heading after a short delay to allow tab switch
                        const sectionTitle = getSectionTitle(proj.detail, file);
                        if (sectionTitle) {
                          const sectionId = `section-${sectionTitle.toLowerCase().replace(/\s+/g, '-')}`;
                          setTimeout(() => {
                            const el = document.getElementById(sectionId);
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 50);
                        }
                      } else if (isReadme) {
                        // README opens as a tab
                        openFile(idx, file);
                      } else {
                        // All other files open the GitHub repo directly
                        window.open(proj.repoUrl, '_blank');
                      }
                    };

                    return (
                      <div
                        key={fi}
                        onClick={handleFileClick}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px 2px 38px',
                          cursor: isDir ? 'default' : 'pointer',
                          color: isDir ? '#888' : '#cccccc',
                          fontSize: '13px',
                          userSelect: 'none',
                          background: isActiveFile ? 'rgba(255,255,255,0.08)' : 'transparent',
                        }}
                        className="vsc-tree-item"
                      >
                        {isDir ? (
                          <span style={{ fontSize: '10px', width: '14px', textAlign: 'center', color: '#666' }}>▶</span>
                        ) : (
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            width: '14px',
                            textAlign: 'center',
                            color: color,
                          }}>{icon}</span>
                        )}
                        <span>{file}</span>
                        {!isDir && !isReadme && !isSectionFile && (
                          <span style={{ fontSize: '10px', color: '#555', marginLeft: 'auto' }}>↗</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Editor + Terminal ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Tab bar */}
          <div className="vsc-tab-bar" style={{
            display: 'flex',
            alignItems: 'stretch',
            height: '35px',
            background: '#252526',
            borderBottom: '1px solid #1e1e1e',
            overflow: 'hidden',
          }}>
            {fileTabs.map((tab, tabIdx) => {
              const p = projects[tab.projectIdx];
              const isActive = tabIdx === activeTabIdx;
              const { icon, color } = getFileIcon(tab.fileName);
              return (
                <div
                  key={`${tab.projectIdx}-${tab.fileName}`}
                  onClick={() => { setActiveTabIdx(tabIdx); setSelectedProject(tab.projectIdx); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    background: isActive ? '#1e1e1e' : '#2d2d2d',
                    borderRight: '1px solid #1e1e1e',
                    position: 'relative',
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                  }}
                  className={`vsc-tab ${isActive ? 'vsc-tab-active' : 'vsc-tab-inactive'}`}
                >
                  <span style={{ fontSize: '9px', fontWeight: 700, color }}>{icon}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{tab.fileName}</span>
                  <span style={{ fontSize: '10px', color: '#666', marginLeft: '2px' }}>— {p.title}</span>
                  <span
                    onClick={(e) => closeTab(tabIdx, e)}
                    style={{
                      marginLeft: '6px',
                      fontSize: '14px',
                      lineHeight: 1,
                      color: '#666',
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '3px',
                    }}
                    className="vsc-tab-close"
                  >×</span>
                  {isActive && <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: '#007acc',
                  }} />}
                </div>
              );
            })}
            <div style={{ flex: 1, background: '#252526' }} />
          </div>

          {/* Breadcrumb */}
          <div style={{
            padding: '4px 16px',
            fontSize: '12px',
            color: '#888',
            background: '#1e1e1e',
            borderBottom: '1px solid #252526',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <span>{project.title.toUpperCase().replace(/\s+/g, '-')}</span>
            <span style={{ color: '#555' }}>/</span>
            <span style={{ color: '#cccccc' }}>{activeTab?.fileName || 'README.md'}</span>
          </div>

          {/* Editor content */}
          <div
            ref={editorRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              background: '#1e1e1e',
              padding: '20px 32px 32px',
              minHeight: 0,
            }}
          >
            {/* README.md — always show the rich project view with demos & details */}
            {activeTab?.fileName === 'README.md' ? (
              <div className="vsc-readme">
                  <>
                    {detail.demoVideo && (
                      <div key={detail.demoVideo} style={{
                        width: '100%', borderRadius: '8px', overflow: 'hidden',
                        marginBottom: '24px', background: '#000', border: '1px solid #333',
                      }}>
                        <video autoPlay loop muted playsInline style={{ width: '100%', display: 'block', borderRadius: '8px' }}>
                          <source src={detail.demoVideo} type="video/mp4" />
                          <source src={detail.demoVideo} type="video/quicktime" />
                        </video>
                      </div>
                    )}
                    {!detail.demoVideo && detail.coverImage && (
                      <div style={{
                        width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden',
                        marginBottom: '24px', background: detail.gradient,
                      }}>
                        <img src={detail.coverImage} alt={detail.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                      </div>
                    )}
                    <h1 style={{
                      fontSize: '26px', fontWeight: 600, color: '#e6e6e6', margin: '0 0 8px',
                      fontFamily: 'var(--os-font-display)',
                      display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                      {detail.title}
                      {detail.repoUrl && (
                        <a href={detail.repoUrl} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: '13px', fontWeight: 400, color: '#4daafc', textDecoration: 'none', fontFamily: 'var(--os-font)', fontVariantNumeric: 'tabular-nums' }}>
                          ↗ GitHub
                        </a>
                      )}
                      {project.pageUrl && (
                        <a href={project.pageUrl}
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: '13px', fontWeight: 400, color: '#4daafc', textDecoration: 'none', fontFamily: 'var(--os-font)' }}>
                          ↗ Project page
                        </a>
                      )}
                    </h1>
                    <p style={{ color: '#c8c8c8', fontSize: '14px', lineHeight: 1.7, margin: '0 0 20px', fontFamily: 'var(--os-font)' }}>
                      {project.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                      {detail.techStack.map((tech, i) => {
                        const tc = getTechColor(tech);
                        return (
                          <span key={i} style={{
                            padding: '3px 10px', fontSize: '11px', fontWeight: 500, borderRadius: '4px',
                            background: tc.bg, color: tc.text,
                            border: `1px solid ${tc.border}`, fontFamily: 'var(--os-font)', fontVariantNumeric: 'tabular-nums',
                          }}>{tech}</span>
                        );
                      })}
                    </div>
                    {detail.architecture && (
                      <>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#e6e6e6', margin: '0 0 8px', fontFamily: 'var(--os-font)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#4daafc' }}>#</span> Architecture
                        </h2>
                        <p style={{ color: '#b8b8b8', fontSize: '13px', lineHeight: 1.8, margin: '0 0 20px', fontFamily: 'var(--os-font)' }}>
                          {detail.architecture}
                        </p>
                      </>
                    )}
                    {detail.technicalChallenges?.length > 0 && (
                      <>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#e6e6e6', margin: '0 0 8px', fontFamily: 'var(--os-font)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#f1b73a' }}>#</span> Technical Challenges
                        </h2>
                        <ul style={{ color: '#b8b8b8', fontSize: '13px', lineHeight: 1.8, margin: '0 0 20px', paddingLeft: '20px', fontFamily: 'var(--os-font)' }}>
                          {detail.technicalChallenges.map((c, i) => <li key={i} style={{ marginBottom: '4px' }}>{c}</li>)}
                        </ul>
                      </>
                    )}
                    {detail.lessonsLearned?.length > 0 && (
                      <>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#e6e6e6', margin: '0 0 8px', fontFamily: 'var(--os-font)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#4ec9b0' }}>#</span> Lessons Learned
                        </h2>
                        <ul style={{ color: '#b8b8b8', fontSize: '13px', lineHeight: 1.8, margin: '0 0 20px', paddingLeft: '20px', fontFamily: 'var(--os-font)' }}>
                          {detail.lessonsLearned.map((l, i) => <li key={i} style={{ marginBottom: '4px' }}>{l}</li>)}
                        </ul>
                      </>
                    )}
                    {/* Sections */}
                    {detail.sections?.map((section, si) => (
                      <div key={si} id={`section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#e6e6e6', margin: '0 0 8px', fontFamily: 'var(--os-font)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: ['#4daafc', '#f1b73a', '#4ec9b0', '#c586c0', '#ce9178'][si % 5] }}>#</span> {section.title}
                        </h2>
                        <div style={{ color: '#b8b8b8', fontSize: '13px', lineHeight: 1.8, margin: '0 0 20px', fontFamily: 'var(--os-font)' }}>
                          {renderMarkdownContent(section.content)}
                        </div>
                      </div>
                    ))}
                  </>
              </div>
            ) : activeTab?.fileName?.endsWith('.md') && activeTab.fileName !== 'README.md' && getSectionContent(detail, activeTab.fileName) !== null ? (
              /* Section .md file — rich rendered view */
              <div className="vsc-readme">
                <h1 style={{
                  fontSize: '24px', fontWeight: 600, color: '#e6e6e6', margin: '0 0 6px',
                  fontFamily: 'var(--os-font-display)',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <span style={{ color: '#4daafc' }}>#</span> {activeTab.fileName.replace(/\.md$/, '')}
                </h1>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 20px', fontFamily: 'var(--os-font)' }}>
                  {detail.title} / {activeTab.fileName}
                </p>
                <div style={{ color: '#b8b8b8', fontSize: '13px', lineHeight: 1.8, fontFamily: 'var(--os-font)' }}>
                  {renderMarkdownContent(activeTab.content || '')}
                </div>
              </div>
            ) : (
              /* Non-README file: show as code/text */
              <div>
                {activeTab?.loading ? (
                  <div style={{ color: '#666', fontSize: '13px', padding: '20px 0' }}>
                    Loading {activeTab.fileName}...
                  </div>
                ) : (
                  <pre style={{
                    color: '#d4d4d4',
                    fontSize: '13px',
                    lineHeight: 1.65,
                    fontFamily: 'var(--os-mono)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0,
                    padding: 0,
                  }}>
                    {activeTab?.content?.split('\n').map((line, i) => (
                      <div key={i} style={{ display: 'flex', minHeight: '20px' }}>
                        <span style={{
                          width: '48px',
                          minWidth: '48px',
                          textAlign: 'right',
                          paddingRight: '16px',
                          color: '#545454',
                          userSelect: 'none',
                          fontSize: '12px',
                        }}>{i + 1}</span>
                        <span style={{ flex: 1 }}>{colorizeCode(line, activeTab?.fileName || '')}</span>
                      </div>
                    ))}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* ── Terminal Panel (draggable) ── */}
          {terminalOpen && (
            <div style={{
              height: `${terminalHeight}px`,
              minHeight: '28px',
              maxHeight: '300px',
              borderTop: '1px solid #333',
              display: 'flex',
              flexDirection: 'column',
              background: '#1e1e1e',
              transition: isDragging ? 'none' : 'height 0.15s ease',
            }}>
              {/* Drag handle */}
              <div
                style={{
                  height: '4px',
                  cursor: 'ns-resize',
                  background: isDragging ? 'rgba(0, 122, 204, 0.5)' : 'transparent',
                  transition: 'background 0.15s',
                  position: 'relative',
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                  dragStartY.current = e.clientY;
                  dragStartHeight.current = terminalHeight;
                  const onMove = (ev: MouseEvent) => {
                    const delta = dragStartY.current - ev.clientY;
                    const newH = Math.max(28, Math.min(300, dragStartHeight.current + delta));
                    if (newH <= 32) {
                      setTerminalOpen(false);
                      setIsDragging(false);
                      document.removeEventListener('mousemove', onMove);
                      document.removeEventListener('mouseup', onUp);
                      return;
                    }
                    setTerminalHeight(newH);
                  };
                  const onUp = () => {
                    setIsDragging(false);
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                  };
                  document.addEventListener('mousemove', onMove);
                  document.addEventListener('mouseup', onUp);
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0, 122, 204, 0.3)'; }}
                onMouseLeave={(e) => { if (!isDragging) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              />
              {/* Terminal tabs */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                height: '28px',
                minHeight: '28px',
                background: '#252526',
                borderBottom: '1px solid #333',
                gap: '16px',
              }}>
                <span style={{ fontSize: '11px', color: '#cccccc', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Terminal</span>
                <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Problems</span>
                <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Output</span>
                <div style={{ flex: 1 }} />
                <span
                  onClick={() => setTerminalOpen(false)}
                  style={{ color: '#666', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}
                  title="Close terminal"
                >×</span>
              </div>

              {/* Terminal content */}
              {terminalHeight > 40 && (
                <div style={{
                  flex: 1,
                  padding: '6px 14px',
                  fontSize: '12px',
                  lineHeight: 1.7,
                  overflowY: 'auto',
                  color: '#cccccc',
                  fontFamily: 'var(--os-mono)',
                }}>
                  <div>
                    <span style={{ color: '#4ec9b0' }}>ronniel@MacBookPro</span>
                    <span style={{ color: '#666' }}>:</span>
                    <span style={{ color: '#569cd6' }}>~/{project.title.toLowerCase().replace(/\s+/g, '-')}</span>
                    <span style={{ color: '#666' }}> $ </span>
                    <span style={{ color: '#cccccc' }}>git log --oneline -3</span>
                  </div>
                  <div style={{ color: '#ce9178' }}>
                    <span style={{ color: '#f1b73a' }}>a3f2e1d</span> feat: initial project setup
                  </div>
                  <div style={{ color: '#ce9178' }}>
                    <span style={{ color: '#f1b73a' }}>b7c4a2e</span> docs: add README
                  </div>
                  <div style={{ color: '#ce9178' }}>
                    <span style={{ color: '#f1b73a' }}>c8d5b3f</span> chore: configure build pipeline
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div style={{
        height: '22px',
        minHeight: '22px',
        background: '#007acc',
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        gap: '14px',
        fontSize: '11.5px',
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'var(--os-font)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" opacity="0.9">
            <path d="M13.5 3.5L8 1 2.5 3.5v4c0 3.5 2.5 6.5 5.5 7.5 3-1 5.5-4 5.5-7.5v-4z" fillRule="evenodd" />
          </svg>
          main
        </span>
        <span>○ 0 △ 0</span>
        {!terminalOpen && (
          <span
            onClick={() => { setTerminalOpen(true); setTerminalHeight(120); }}
            style={{ cursor: 'pointer', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Open terminal"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            Terminal
          </span>
        )}
        <div style={{ flex: 1 }} />
        <span>Ln 1, Col 1</span>
        <span>Spaces: 2</span>
        <span>UTF-8</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: getLangColor(project.language),
          }} />
          {project.language}
        </span>
      </div>

      <style>{`
        .vsc-root ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .vsc-root ::-webkit-scrollbar-track {
          background: transparent;
        }
        .vsc-root ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 0;
        }
        .vsc-root ::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
        .vsc-tree-item:hover {
          background: rgba(255,255,255,0.05) !important;
        }
        .vsc-tab-active {
          color: #ffffff;
          transition: color 0.15s ease;
        }
        .vsc-tab-inactive {
          color: #969696;
          transition: color 0.15s ease;
        }
        /* When hovering any tab, that tab glows white */
        .vsc-tab:hover {
          color: #ffffff !important;
        }
        /* When hovering over the tab bar, fade the active tab... */
        .vsc-tab-bar:hover .vsc-tab-active {
          color: #969696 !important;
        }
        /* ...unless the active tab itself is being hovered */
        .vsc-tab-bar:hover .vsc-tab-active:hover {
          color: #ffffff !important;
        }
        .vsc-tab:hover .vsc-tab-close {
          color: #ccc !important;
        }
        .vsc-tab-close:hover {
          background: rgba(255,255,255,0.1) !important;
          color: #fff !important;
        }
        .vsc-readme h2 {
          border-bottom: 1px solid #333;
          padding-bottom: 6px;
        }
      `}</style>
    </div>
  );
};

// ── Simple Markdown Renderer for README files ──

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = '';

  const renderInline = (text: string): React.ReactNode => {
    // Bold
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.*?)\*\*|`(.*?)`|\[(.*?)\]\((.*?)\)/g;
    let lastIdx = 0;
    let match;
    let key = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index));
      if (match[1]) parts.push(<strong key={key++} style={{ color: '#e6e6e6', fontWeight: 600 }}>{match[1]}</strong>);
      if (match[2]) parts.push(<code key={key++} style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '3px', fontSize: '12px', color: '#ce9178' }}>{match[2]}</code>);
      if (match[3] && match[4]) parts.push(<a key={key++} href={match[4]} target="_blank" rel="noopener noreferrer" style={{ color: '#4daafc', textDecoration: 'none' }}>{match[3]}</a>);
      lastIdx = match.index + match[0].length;
    }
    if (lastIdx < text.length) parts.push(text.slice(lastIdx));
    return parts.length > 0 ? parts : text;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={i} style={{
            background: '#0d1117',
            border: '1px solid #333',
            borderRadius: '6px',
            padding: '12px 16px',
            margin: '8px 0 16px',
            fontSize: '12px',
            lineHeight: 1.6,
            overflowX: 'auto',
            color: '#d4d4d4',
          }}>
            {codeLines.join('\n')}
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} style={{ fontSize: '24px', fontWeight: 600, color: '#e6e6e6', margin: '24px 0 8px', fontFamily: 'var(--os-font)', borderBottom: '1px solid #333', paddingBottom: '8px' }}>{renderInline(line.slice(2))}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontSize: '20px', fontWeight: 600, color: '#e6e6e6', margin: '20px 0 8px', fontFamily: 'var(--os-font)', borderBottom: '1px solid #333', paddingBottom: '6px' }}>{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontSize: '16px', fontWeight: 600, color: '#e6e6e6', margin: '16px 0 6px', fontFamily: 'var(--os-font)' }}>{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(<div key={i} style={{ color: '#a0a0a0', fontSize: '13px', lineHeight: 1.7, paddingLeft: '20px', margin: '2px 0', fontFamily: 'var(--os-font)' }}>• {renderInline(line.slice(2))}</div>);
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\.\s/)?.[1];
      elements.push(<div key={i} style={{ color: '#a0a0a0', fontSize: '13px', lineHeight: 1.7, paddingLeft: '20px', margin: '2px 0', fontFamily: 'var(--os-font)' }}>{num}. {renderInline(line.replace(/^\d+\.\s/, ''))}</div>);
    } else if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: '8px' }} />);
    } else if (line.startsWith('> ')) {
      elements.push(<blockquote key={i} style={{ borderLeft: '3px solid #4daafc', paddingLeft: '12px', margin: '8px 0', color: '#a0a0a0', fontStyle: 'italic', fontSize: '13px' }}>{renderInline(line.slice(2))}</blockquote>);
    } else if (line.startsWith('![')) {
      // Image — skip rendering but show placeholder
      const alt = line.match(/!\[(.*?)\]/)?.[1] || 'image';
      elements.push(<div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid #333', margin: '8px 0', color: '#666', fontSize: '12px', textAlign: 'center' }}>📷 {alt}</div>);
    } else {
      elements.push(<p key={i} style={{ color: '#a0a0a0', fontSize: '13px', lineHeight: 1.7, margin: '4px 0', fontFamily: 'var(--os-font)' }}>{renderInline(line)}</p>);
    }
  }

  return <div className="vsc-readme">{elements}</div>;
}

// ── Simple syntax coloring for code files ──

function colorizeCode(line: string, fileName: string): React.ReactNode {
  // Python files
  if (fileName.endsWith('.py') || fileName.endsWith('.txt')) {
    return line
      .replace(/^(import |from |class |def |return |if |else|elif |for |while |try|except|with |as |in |not |and |or |raise |yield |async |await )/g, '___KW___$1')
      .split('___KW___')
      .map((part, i) => {
        if (/^(import |from |class |def |return |if |else|elif |for |while |try|except|with |as |in |not |and |or |raise |yield |async |await )/.test(part)) {
          return <span key={i} style={{ color: '#c586c0' }}>{part}</span>;
        }
        return part;
      });
  }
  // For other files just return plain text
  return line;
}

// ── Activity Bar Icon ──

function ActivityIcon({ children, active, label }: { children: React.ReactNode; active?: boolean; label: string }) {
  return (
    <div
      title={label}
      style={{
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: active ? '#ffffff' : '#858585',
        position: 'relative',
        transition: 'color 0.15s',
      }}
    >
      {children}
      {active && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '2px',
          height: '24px',
          background: '#ffffff',
          borderRadius: '0 1px 1px 0',
        }} />
      )}
    </div>
  );
}

export default Projects;
