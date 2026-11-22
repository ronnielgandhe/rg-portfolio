import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ProjectDetail, DetailContent } from './DetailPanel';
import { SYS_FONT, Icon, MacStyles } from './mac';

interface ProjectsProps {
  onCardClick?: (detail: DetailContent) => void;
  windowMode?: boolean;
}

interface FileTab {
  projectIdx: number;
  fileName: string;
}

const VSC = {
  editor: '#1f1f1f',
  chrome: '#181818',
  border: '#2b2b2b',
  text: '#cccccc',
  dim: '#9d9d9d',
  heading: '#e6e6e6',
  body: '#b8b8b8',
  link: '#4daafc',
  accent: '#0078d4',
  hover: '#2a2d2e',
  selFocus: '#04395e',
  selFocusRing: '#007fd4',
  selBlur: '#37373d',
  md: '#519aba',
};

const repoName = (url: string) => url.split('/').pop() || url;

const projects: {
  id: number;
  title: string;
  description: string;
  gradient: string;
  coverImage?: string;
  covers?: string[];
  coverInvert?: boolean;
  repoUrl: string;
  language: string;
  files: string[];
  detail: ProjectDetail;
}[] = [
  {
    id: 1,
    title: "LeanFetch",
    coverInvert: true,
    description: "a tool that stops startups from losing cash to unnecessary api calls. paste a repo url or drop in your code, it runs static analysis for the patterns that quietly burn money (llm calls in loops, retry storms, oversized contexts, the biggest model doing a tiny job, no caching) and hands back a cost-waste report with estimated savings and the fix for each one.",
    gradient: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)",
    coverImage: "/leanfetch-cover.png",
    repoUrl: "https://github.com/ronnielgandhe/leanfetch",
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
    description: "chrome extensions that solve the linkedin and nyt daily games in real time. on linkedin: sudoku, tango, queens, zip and patches. on nyt: wordle, connections, strands, the mini crossword and spelling bee. vanilla js, no frameworks, no ai, no server. it reads the board or finds the answer in the game's own data, then plays it for you.",
    gradient: "linear-gradient(135deg, #0a66c2 0%, #084d92 50%, #052e57 100%)",
    coverImage: "/linkdensolver.png",
    covers: ["/linkdensolver.png", "/nytsolver.png"],
    repoUrl: "https://github.com/ronnielgandhe/game-solver-suite",
    language: "JavaScript",
    files: ["README.md", "linkedin solvers.md", "nyt solvers.md", "trusted input.md", "strands.md", "takeaways.md"],
    detail: {
      type: 'project' as const,
      id: 6,
      title: "Game Solver Suite",
      gradient: "linear-gradient(135deg, #0a66c2 0%, #084d92 50%, #052e57 100%)",
      coverImage: "/linkdensolver.png",
      architecture: "manifest v3 extensions with one solver per game. each solver reads the board from the dom (or from react fiber internals when the dom is not enough), or pulls the answer from the puzzle api the page already calls, then enters it with keyboard events and clicks. zip, patches and strands need real drag gestures, so the background service worker sends them through the chrome debugger protocol.",
      technicalChallenges: ["zip, patches and strands ignore synthetic events. the fix was attaching chrome.debugger and dispatching trusted mouse events from the service worker", "the games run inside iframes, some on other subdomains, so solvers are injected into every frame and the popup takes the result from whichever one finds the board", "wall detection in zip has three fallbacks: react fiber, connector elements, then border widths", "finding the strands api endpoint without hardcoding it. the solver reads performance.getEntriesByType('resource') and re-fetches the puzzle"],
      lessonsLearned: ["the dom is an api if you are stubborn enough", "when a page blocks fake input, the debugger protocol is the honest way in", "the answer is almost always already on the page", "one shared pattern across both sets of games made the second one a weekend", "dfs with a visited set is enough to trace words through a letter grid", "no build step means it still works a year later"],
      techStack: ["JavaScript", "Chrome Extension API", "Chrome Debugger Protocol", "Manifest V3"],
      repoUrl: "https://github.com/ronnielgandhe/game-solver-suite",
      sections: [
        {
          title: "LinkedIn Solvers",
          content: "| game | how |\n|---|---|\n| sudoku | backtracking on a 6x6 grid with box constraints |\n| tango | constraint propagation, then backtracking |\n| queens | backtracking with region and adjacency pruning |\n| zip | hamiltonian path search with wall detection |\n| patches | reads the solution from react fiber game state |"
        },
        {
          title: "NYT Solvers",
          content: "| game | answer source | input |\n|---|---|---|\n| wordle | react fiber or the wordle api | letter keys and enter |\n| connections | react fiber or the connections api | click the cards, submit |\n| strands | re-fetched puzzle data | trusted mouse drags |\n| mini crossword | react fiber or the crossword api | click a cell, type |\n| spelling bee | react fiber or embedded page data | type and enter |"
        },
        {
          title: "Trusted Input",
          content: "most games accept clicks sent from a content script. zip, patches and strands do not. they want real drag gestures.\n\nso the background service worker attaches with chrome.debugger and sends Input.dispatchMouseEvent commands. to the page it looks like a real mouse."
        },
        {
          title: "Strands",
          content: "strands is the hard one. the solver gets the word list, then uses depth first search with 8 direction adjacency to trace each word through the grid, tracking used cells so paths never overlap. then the service worker drags the path with real mouse events."
        },
        {
          title: "Takeaways",
          content: "**read state, do not guess it.** walking the react fiber tree is more reliable than reverse engineering class names.\n\n**let the page do the work.** it already fetched the answers.\n\n**trusted events matter.** some inputs cannot be faked from a content script.\n\n**keep it small.** vanilla js, no dependencies, nothing to break."
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
    language: "JavaScript",
    files: ["README.md", "architecture.md", "pathfinding.md", "game design.md", "impact.md", "takeaways.md"],
    detail: {
      type: 'project' as const,
      id: 4,
      title: "How Many Clicks",
      gradient: "linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 50%, #1a1a2e 100%)",
      coverImage: "/howmanyclicks-cover.png",
      demoVideo: "/howmanyclicks-demo.mp4",
      architecture: "How Many Clicks is an entirely client-side React application bundled with Vite — no backend, no database, no server costs. All pathfinding runs in the browser using the Wikipedia MediaWiki API for article content and link extraction. The core algorithm is a beam search that maintains a frontier of the K most promising articles at each step, scoring each outgoing link based on semantic similarity to the target article. The scoring system combines keyword overlap, related-term expansion (generated from the target article's content), and a hub recognition system that identifies high-connectivity 'bridge' articles (like 'United States,' 'Europe,' 'Science') and strategically uses or avoids them depending on context. Two difficulty modes are available: Normal mode uses a narrow beam (K=3) for more human-like exploration, while God Mode widens the beam (K=8) and enables aggressive related-term expansion for faster, more optimal paths. The game UI renders the AI's journey in real-time with article thumbnail previews, link-by-link reasoning annotations, and an interactive path visualization.",
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
          content: "The pathfinding algorithm is a semantically-guided beam search customized for Wikipedia's link graph:\n\n**Beam Search Core** — At each step, the algorithm fetches all outgoing links from the current frontier articles, scores each link against the target, and keeps the top-K scoring links as the new frontier. K=3 for Normal mode, K=8 for God Mode.\n\n**Semantic Scoring** — Each candidate link is scored by combining multiple signals:\n- Direct keyword match (40% weight): Does the link text or target article title contain keywords from the target?\n- Stemmed overlap (25% weight): Stemmed versions of link terms matched against stemmed target terms\n- Related-term match (25% weight): Match against an expanded term set generated from the target article's opening paragraph\n- Category proximity (10% weight): Wikipedia categories shared between the candidate and target articles\n\n**Hub Recognition** — The algorithm maintains a dynamic hub database of high-connectivity articles. When the frontier is stuck (no links score above a threshold), hub articles are temporarily prioritized as 'escape hatches' to reach a different region of the link graph. When good semantic paths are available, hubs are penalized to avoid degenerate shortest paths that route everything through 'United States.'\n\n**Related-Term Expansion** — Before pathfinding begins, the algorithm analyzes the target article's first paragraph to extract related terms, synonyms, and associated concepts. For a target of 'Jazz,' the expanded set might include: 'New Orleans,' 'improvisation,' 'blues,' 'swing,' 'bebop,' 'saxophone,' 'Louis Armstrong.' This dramatically improves the algorithm's ability to recognize relevant links that do not explicitly mention the target topic."
        },
        {
          title: "Game Design",
          content: "The game design turns a pathfinding algorithm into a compelling competitive experience:\n\n**Game Flow** — Two random Wikipedia articles are selected. The AI pathfinder runs first, with its journey visualized step-by-step in real time. Once the AI finishes, the user is shown the AI's path length and challenged to match or beat it by manually navigating Wikipedia links.\n\n**Difficulty Modes:**\n- Normal Mode: AI uses beam width K=3 with standard scoring. Produces human-like paths that are challenging but beatable. The AI typically finds paths of 4-6 hops.\n- God Mode: AI uses beam width K=8 with aggressive related-term expansion and wider semantic matching. Produces near-optimal paths that are very difficult to beat. Fun for experienced players.\n\n**Journey Visualization** — As the AI searches, each step is animated: the current article is shown with a preview snippet, considered links are briefly displayed with their scores, and the chosen link animates into the path. Commentary text explains the AI's reasoning ('Chose \\'Industrial Revolution\\' because it connects manufacturing to the target topic of \\'Steam Engine\\'').\n\n**Scoring** — Players are scored on path length (fewer clicks = better), with bonus recognition for beating the AI. The game tracks personal bests and encourages replaying with different article pairs."
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

function getSection(detail: ProjectDetail, fileName: string) {
  const t = fileName.replace(/\.md$/, '').toLowerCase();
  return detail.sections?.find(s => s.title.toLowerCase() === t) || null;
}

function renderInline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} style={{ color: VSC.heading, fontWeight: 600 }}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

function renderMarkdown(content: string) {
  return content.split('\n\n').map((para, pi) => {
    const trimmed = para.trim();
    if (!trimmed) return null;
    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.every(l => l.startsWith('|'))) {
      const rows = lines.filter(l => !/^\|[-|\s]+\|$/.test(l)).map(l => l.slice(1, -1).split('|').map(c => c.trim()));
      const [head, ...body] = rows;
      return (
        <table key={pi} style={{ borderCollapse: 'collapse', margin: '0 0 16px', fontSize: '13px' }}>
          <thead>
            <tr>{head.map((c, i) => <th key={i} style={{ textAlign: 'left', padding: '4px 14px 4px 0', color: VSC.heading, fontWeight: 600, borderBottom: `1px solid ${VSC.border}` }}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {body.map((r, ri) => (
              <tr key={ri}>{r.map((c, i) => <td key={i} style={{ padding: '4px 14px 4px 0', borderBottom: `1px solid ${VSC.border}` }}>{renderInline(c)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (lines.every(l => l.startsWith('- '))) {
      return (
        <ul key={pi} style={{ paddingLeft: '20px', margin: '0 0 16px' }}>
          {lines.map((l, li) => <li key={li} style={{ marginBottom: '4px' }}>{renderInline(l.slice(2))}</li>)}
        </ul>
      );
    }
    return <p key={pi} style={{ margin: '0 0 16px' }}>{renderInline(trimmed.replace(/\n/g, ' '))}</p>;
  });
}

function H2({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} style={{
      fontSize: '20px', fontWeight: 600, color: VSC.heading, margin: '24px 0 10px',
      paddingBottom: '6px', borderBottom: '1px solid #333', fontFamily: SYS_FONT, lineHeight: 1.3,
    }}>{children}</h2>
  );
}

const bodyStyle = { color: VSC.body, fontSize: '13px', lineHeight: 1.6, fontFamily: SYS_FONT } as const;

function MdIcon() {
  return <Icon.Doc size={16} color={VSC.md} />;
}

const Projects = (_props: ProjectsProps) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 0: true });
  const [tabs, setTabs] = useState<FileTab[]>([{ projectIdx: 0, fileName: 'README.md' }]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [treeFocused, setTreeFocused] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const activeTab: FileTab | undefined = tabs[activeIdx];
  const project = activeTab ? projects[activeTab.projectIdx] : null;
  const detail = project?.detail;

  const openFile = (projectIdx: number, fileName: string) => {
    const existing = tabs.findIndex(t => t.projectIdx === projectIdx && t.fileName === fileName);
    if (existing >= 0) { setActiveIdx(existing); return; }
    setTabs([...tabs, { projectIdx, fileName }]);
    setActiveIdx(tabs.length);
  };

  const closeTab = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = tabs.filter((_, i) => i !== idx);
    setTabs(next);
    if (activeIdx === idx) setActiveIdx(Math.max(0, Math.min(idx, next.length - 1)));
    else if (activeIdx > idx) setActiveIdx(activeIdx - 1);
  };

  useEffect(() => { editorRef.current?.scrollTo(0, 0); }, [activeIdx, tabs.length]);

  const section = detail && activeTab && activeTab.fileName !== 'README.md' ? getSection(detail, activeTab.fileName) : null;
  const covers = project ? (project.covers ?? (project.coverImage ? [project.coverImage] : [])) : [];

  const row = (selected: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    height: '22px',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    color: VSC.text,
    background: selected ? (treeFocused ? VSC.selFocus : VSC.selBlur) : undefined,
    boxShadow: selected && treeFocused ? `inset 0 0 0 1px ${VSC.selFocusRing}` : undefined,
  });

  return (
    <div className="vsc-root" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      fontFamily: SYS_FONT,
      fontSize: '13px',
      color: VSC.text,
      background: VSC.editor,
      overflow: 'hidden',
    }}>
      <MacStyles />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{
          width: '48px', minWidth: '48px', background: VSC.chrome,
          borderRight: `1px solid ${VSC.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div title="Explorer" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', position: 'relative' }}>
            <Icon.Explorer size={24} />
            <div style={{ position: 'absolute', left: 0, top: 12, bottom: 12, width: '2px', background: VSC.accent }} />
          </div>
        </div>

        <div
          tabIndex={0}
          onFocus={() => setTreeFocused(true)}
          onBlur={() => setTreeFocused(false)}
          style={{
            width: '220px', minWidth: '220px', background: VSC.chrome, borderRight: `1px solid ${VSC.border}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden', outline: 'none',
          }}
        >
          <div style={{ ...row(false), height: '35px', padding: '0 8px 0 4px', fontSize: '11px', fontWeight: 700, cursor: 'default' }}>
            <Icon.ChevronDown size={16} />
            <span>PROJECTS</span>
          </div>
          <div className="mac-scroll mac-dark" style={{ flex: 1, paddingBottom: '8px' }}>
            {projects.map((proj, idx) => {
              const isOpen = !!expanded[idx];
              const name = repoName(proj.repoUrl);
              return (
                <div key={proj.id}>
                  <div
                    className="vsc-tree-item"
                    onClick={() => setExpanded(prev => ({ ...prev, [idx]: !isOpen }))}
                    style={{ ...row(false), paddingLeft: '12px' }}
                  >
                    {isOpen ? <Icon.ChevronDown size={16} /> : <Icon.ChevronRight size={16} />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                  </div>
                  {isOpen && proj.files.map(file => {
                    const selected = activeTab?.projectIdx === idx && activeTab?.fileName === file;
                    return (
                      <div
                        key={file}
                        className={selected ? undefined : 'vsc-tree-item'}
                        onClick={() => openFile(idx, file)}
                        style={{ ...row(selected), paddingLeft: '42px' }}
                      >
                        <MdIcon />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{file}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div className="vsc-tab-bar" style={{
            display: 'flex', alignItems: 'stretch', height: '35px', minHeight: '35px',
            background: VSC.chrome, borderBottom: `1px solid ${VSC.border}`, overflow: 'hidden',
          }}>
            {tabs.map((tab, i) => {
              const isActive = i === activeIdx;
              return (
                <div
                  key={`${tab.projectIdx}-${tab.fileName}`}
                  onClick={() => setActiveIdx(i)}
                  className="vsc-tab"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '0 8px 0 12px',
                    fontSize: '13px', cursor: 'pointer', position: 'relative', whiteSpace: 'nowrap', minWidth: 0,
                    background: isActive ? VSC.editor : VSC.chrome,
                    color: isActive ? '#ffffff' : VSC.dim,
                    borderRight: `1px solid ${VSC.border}`,
                    marginBottom: isActive ? '-1px' : 0,
                  }}
                >
                  <MdIcon />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{tab.fileName}</span>
                  <span style={{ color: '#8b8b8b', fontSize: '12px' }}>{repoName(projects[tab.projectIdx].repoUrl)}</span>
                  <span
                    onClick={(e) => closeTab(i, e)}
                    className="vsc-tab-close"
                    title="Close"
                    style={{
                      width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '4px', marginLeft: '2px', opacity: isActive ? 1 : 0,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15" /></svg>
                  </span>
                  {isActive && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: VSC.accent }} />}
                </div>
              );
            })}
            <div style={{ flex: 1 }} />
          </div>

          {project && activeTab && (
            <div style={{
              height: '22px', minHeight: '22px', padding: '0 16px', fontSize: '13px', color: '#a9a9a9',
              background: VSC.editor, display: 'flex', alignItems: 'center', gap: '2px',
            }}>
              <span>{repoName(project.repoUrl)}</span>
              <Icon.ChevronRight size={14} color="#7a7a7a" />
              <MdIcon />
              <span style={{ marginLeft: '4px' }}>{activeTab.fileName}</span>
            </div>
          )}

          <div ref={editorRef} className="mac-scroll mac-dark" style={{ flex: 1, background: VSC.editor, padding: '12px 32px 32px', minHeight: 0 }}>
            {!project || !detail || !activeTab ? null : activeTab.fileName === 'README.md' ? (
              <div style={{ maxWidth: '760px' }}>
                {detail.demoVideo ? (
                  <div key={detail.demoVideo} style={{ borderRadius: '6px', overflow: 'hidden', margin: '8px 0 20px', background: '#000', border: `1px solid ${VSC.border}` }}>
                    <video autoPlay loop muted playsInline style={{ width: '100%', display: 'block' }}>
                      <source src={detail.demoVideo} type="video/mp4" />
                    </video>
                  </div>
                ) : covers.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${covers.length}, 1fr)`, gap: '8px', margin: '8px 0 20px' }}>
                    {covers.map(src => (
                      <div key={src} style={{
                        height: project.coverInvert ? '96px' : '180px', borderRadius: '6px', overflow: 'hidden',
                        background: '#252526', border: `1px solid ${VSC.border}`,
                      }}>
                        <img src={src} alt={detail.title} style={{
                          width: '100%', height: '100%', display: 'block',
                          objectFit: 'cover', objectPosition: project.coverInvert ? 'center' : 'top',
                          filter: project.coverInvert ? 'invert(0.88)' : undefined,
                        }} />
                      </div>
                    ))}
                  </div>
                )}
                <h1 style={{ fontSize: '26px', fontWeight: 600, color: VSC.heading, margin: '0 0 4px', lineHeight: 1.25 }}>
                  {detail.title}
                </h1>
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '13px', color: VSC.link, textDecoration: 'none' }}>
                  {project.repoUrl.replace('https://', '')}
                </a>
                <p style={{ ...bodyStyle, color: '#c8c8c8', fontSize: '14px', margin: '14px 0 14px' }}>
                  {project.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {detail.techStack.map(tech => (
                    <span key={tech} style={{
                      padding: '2px 8px', fontSize: '12px', borderRadius: '4px',
                      background: 'rgba(255,255,255,0.06)', color: VSC.text, border: `1px solid ${VSC.border}`,
                    }}>{tech}</span>
                  ))}
                </div>
                {detail.architecture && (
                  <>
                    <H2>Architecture</H2>
                    <p style={{ ...bodyStyle, margin: 0 }}>{detail.architecture}</p>
                  </>
                )}
                {detail.technicalChallenges.length > 0 && (
                  <>
                    <H2>Technical Challenges</H2>
                    <ul style={{ ...bodyStyle, margin: 0, paddingLeft: '20px' }}>
                      {detail.technicalChallenges.map((c, i) => <li key={i} style={{ marginBottom: '4px' }}>{c}</li>)}
                    </ul>
                  </>
                )}
                {detail.lessonsLearned.length > 0 && (
                  <>
                    <H2>Lessons Learned</H2>
                    <ul style={{ ...bodyStyle, margin: 0, paddingLeft: '20px' }}>
                      {detail.lessonsLearned.map((l, i) => <li key={i} style={{ marginBottom: '4px' }}>{l}</li>)}
                    </ul>
                  </>
                )}
              </div>
            ) : section ? (
              <div style={{ maxWidth: '760px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 600, color: VSC.heading, margin: '8px 0 14px', paddingBottom: '8px', borderBottom: '1px solid #333', lineHeight: 1.25 }}>
                  {section.title}
                </h1>
                <div style={bodyStyle}>{renderMarkdown(section.content)}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div style={{
        height: '22px', minHeight: '22px', background: VSC.chrome, borderTop: `1px solid ${VSC.border}`,
        display: 'flex', alignItems: 'center', fontSize: '12px', color: VSC.text,
      }}>
        <span title="Remote" style={{ height: '100%', width: '34px', background: VSC.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4 2.5 8.5 7 13M13 7l4.5 4.5L13 16" /></svg>
        </span>
        <div style={{ flex: 1 }} />
        {activeTab && (
          <>
            <span style={{ padding: '0 8px' }}>UTF-8</span>
            <span style={{ padding: '0 10px 0 8px' }}>Markdown</span>
          </>
        )}
      </div>

      <style>{`
        .vsc-tree-item:hover { background: ${VSC.hover}; }
        .vsc-tab:hover { color: #ffffff !important; }
        .vsc-tab:hover .vsc-tab-close { opacity: 1 !important; }
        .vsc-tab-close:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};

export default Projects;
