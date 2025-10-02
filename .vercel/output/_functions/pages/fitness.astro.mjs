import { a as createComponent, r as renderTemplate, b as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_CMNnM6uP.mjs';
import 'kleur/colors';
import { $ as $$Layout, N as Nav } from '../chunks/Nav_BaHoY3hY.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, BarChart, Bar } from 'recharts';
import { Activity, TrendingUp, Target, Calendar } from 'lucide-react';
import { g as getRecentBlogPosts } from '../chunks/blog_DrqDHIsA.mjs';
export { renderers } from '../renderers.mjs';

function FitnessCharts({ runs, lifts }) {
  const [activeTab, setActiveTab] = useState("runs");
  const runningData = runs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((run) => ({
    date: new Date(run.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    distance: run.distanceKm,
    pace: run.durationSec / 60 / run.distanceKm,
    // minutes per km
    duration: run.durationSec / 60
    // minutes
  }));
  const liftingData = lifts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((session) => {
    const totalVolume = session.movements.reduce((total, movement) => {
      const movementVolume = movement.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
      return total + movementVolume;
    }, 0);
    return {
      date: new Date(session.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      volume: Math.round(totalVolume),
      movements: session.movements.length
    };
  });
  const totalDistance = runs.reduce((sum, run) => sum + run.distanceKm, 0);
  const totalSessions = lifts.length;
  const avgPace = runningData.length > 0 ? runningData.reduce((sum, run) => sum + run.pace, 0) / runningData.length : 0;
  const formatPace = (paceMinPerKm) => {
    const minutes = Math.floor(paceMinPerKm);
    const seconds = Math.round((paceMinPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-bg-soft border border-border rounded-xl p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsx(Activity, { className: "w-5 h-5 text-accent" }),
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-ink-mute", children: "Total Distance" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-ink", children: [
          totalDistance.toFixed(1),
          " km"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-bg-soft border border-border rounded-xl p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsx(TrendingUp, { className: "w-5 h-5 text-accent" }),
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-ink-mute", children: "Avg Pace" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-ink", children: [
          formatPace(avgPace),
          "/km"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-bg-soft border border-border rounded-xl p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsx(Target, { className: "w-5 h-5 text-accent" }),
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-ink-mute", children: "Lift Sessions" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-ink", children: totalSessions })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-1 bg-bg-soft border border-border rounded-lg p-1", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("runs"),
          className: `px-4 py-2 rounded-lg text-sm font-medium transition-apple ${activeTab === "runs" ? "bg-accent text-white" : "text-ink-mute hover:text-ink hover:bg-border/50"}`,
          children: [
            /* @__PURE__ */ jsx(Activity, { className: "w-4 h-4 inline mr-2" }),
            "Runs"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("lifts"),
          className: `px-4 py-2 rounded-lg text-sm font-medium transition-apple ${activeTab === "lifts" ? "bg-accent text-white" : "text-ink-mute hover:text-ink hover:bg-border/50"}`,
          children: [
            /* @__PURE__ */ jsx(Target, { className: "w-4 h-4 inline mr-2" }),
            "Lifts"
          ]
        }
      )
    ] }),
    activeTab === "runs" && /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-bg-soft border border-border rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-ink mb-4", children: "Distance Over Time" }),
        /* @__PURE__ */ jsx("div", { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data: runningData, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1b2335" }),
          /* @__PURE__ */ jsx(
            XAxis,
            {
              dataKey: "date",
              stroke: "#aab2c0",
              fontSize: 12
            }
          ),
          /* @__PURE__ */ jsx(
            YAxis,
            {
              stroke: "#aab2c0",
              fontSize: 12,
              label: { value: "Distance (km)", angle: -90, position: "insideLeft", style: { textAnchor: "middle", fill: "#aab2c0" } }
            }
          ),
          /* @__PURE__ */ jsx(
            Tooltip,
            {
              contentStyle: {
                backgroundColor: "#0f1526",
                border: "1px solid #1b2335",
                borderRadius: "8px",
                color: "#e6e9ef"
              }
            }
          ),
          /* @__PURE__ */ jsx(
            Line,
            {
              type: "monotone",
              dataKey: "distance",
              stroke: "#5aa2ff",
              strokeWidth: 2,
              dot: { fill: "#5aa2ff", strokeWidth: 0, r: 4 }
            }
          )
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-bg-soft border border-border rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-ink mb-4", children: "Recent Runs" }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border", children: [
            /* @__PURE__ */ jsx("th", { className: "text-left py-2 text-ink-mute font-medium", children: "Date" }),
            /* @__PURE__ */ jsx("th", { className: "text-left py-2 text-ink-mute font-medium", children: "Distance" }),
            /* @__PURE__ */ jsx("th", { className: "text-left py-2 text-ink-mute font-medium", children: "Duration" }),
            /* @__PURE__ */ jsx("th", { className: "text-left py-2 text-ink-mute font-medium", children: "Pace" }),
            /* @__PURE__ */ jsx("th", { className: "text-left py-2 text-ink-mute font-medium", children: "Notes" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: runs.slice(0, 5).map((run) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/50", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 text-ink", children: new Date(run.date).toLocaleDateString() }),
            /* @__PURE__ */ jsxs("td", { className: "py-2 text-ink", children: [
              run.distanceKm,
              " km"
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "py-2 text-ink", children: [
              Math.floor(run.durationSec / 60),
              ":",
              (run.durationSec % 60).toString().padStart(2, "0")
            ] }),
            /* @__PURE__ */ jsx("td", { className: "py-2 text-ink", children: run.pace || formatPace(run.durationSec / 60 / run.distanceKm) }),
            /* @__PURE__ */ jsx("td", { className: "py-2 text-ink-mute", children: run.notes || "—" })
          ] }, run.id)) })
        ] }) })
      ] })
    ] }),
    activeTab === "lifts" && /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-bg-soft border border-border rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-ink mb-4", children: "Training Volume" }),
        /* @__PURE__ */ jsx("div", { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: liftingData, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1b2335" }),
          /* @__PURE__ */ jsx(
            XAxis,
            {
              dataKey: "date",
              stroke: "#aab2c0",
              fontSize: 12
            }
          ),
          /* @__PURE__ */ jsx(
            YAxis,
            {
              stroke: "#aab2c0",
              fontSize: 12,
              label: { value: "Volume (lbs)", angle: -90, position: "insideLeft", style: { textAnchor: "middle", fill: "#aab2c0" } }
            }
          ),
          /* @__PURE__ */ jsx(
            Tooltip,
            {
              contentStyle: {
                backgroundColor: "#0f1526",
                border: "1px solid #1b2335",
                borderRadius: "8px",
                color: "#e6e9ef"
              }
            }
          ),
          /* @__PURE__ */ jsx(Bar, { dataKey: "volume", fill: "#5aa2ff", radius: [4, 4, 0, 0] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-bg-soft border border-border rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-ink mb-4", children: "Recent Sessions" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: lifts.slice(0, 3).map((session) => /* @__PURE__ */ jsxs("div", { className: "border border-border/50 rounded-lg p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4 text-accent" }),
            /* @__PURE__ */ jsx("span", { className: "text-ink font-medium", children: new Date(session.date).toLocaleDateString() })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: session.movements.map((movement, idx) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-ink font-medium", children: movement.name }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: movement.sets.map((set, setIdx) => /* @__PURE__ */ jsxs("span", { className: "text-ink-mute", children: [
              set.weight,
              "×",
              set.reps
            ] }, setIdx)) })
          ] }, idx)) })
        ] }, session.id)) })
      ] })
    ] })
  ] });
}

const runsData = [
	{
		id: "r-001",
		date: "2025-09-28",
		distanceKm: 8.2,
		durationSec: 2400,
		notes: "Tempo run along the canal",
		pace: "4:52"
	},
	{
		id: "r-002",
		date: "2025-10-01",
		distanceKm: 5,
		durationSec: 1530,
		notes: "Easy recovery",
		pace: "5:06"
	},
	{
		id: "r-003",
		date: "2025-09-25",
		distanceKm: 12,
		durationSec: 3600,
		notes: "Long run - felt strong",
		pace: "5:00"
	},
	{
		id: "r-004",
		date: "2025-09-22",
		distanceKm: 6.5,
		durationSec: 1950,
		notes: "Threshold intervals",
		pace: "5:00"
	},
	{
		id: "r-005",
		date: "2025-09-20",
		distanceKm: 4,
		durationSec: 1200,
		notes: "Easy shakeout",
		pace: "5:00"
	}
];

const liftsData = [
	{
		id: "l-001",
		date: "2025-09-29",
		movements: [
			{
				name: "Squat",
				sets: [
					{
						weight: 225,
						reps: 5
					},
					{
						weight: 235,
						reps: 5
					},
					{
						weight: 245,
						reps: 3
					}
				]
			},
			{
				name: "Bench Press",
				sets: [
					{
						weight: 165,
						reps: 5
					},
					{
						weight: 175,
						reps: 5
					},
					{
						weight: 185,
						reps: 3
					}
				]
			},
			{
				name: "Deadlift",
				sets: [
					{
						weight: 275,
						reps: 5
					},
					{
						weight: 295,
						reps: 3
					}
				]
			}
		]
	},
	{
		id: "l-002",
		date: "2025-09-26",
		movements: [
			{
				name: "Overhead Press",
				sets: [
					{
						weight: 115,
						reps: 5
					},
					{
						weight: 125,
						reps: 5
					},
					{
						weight: 135,
						reps: 3
					}
				]
			},
			{
				name: "Pull-ups",
				sets: [
					{
						weight: 0,
						reps: 8
					},
					{
						weight: 0,
						reps: 7
					},
					{
						weight: 0,
						reps: 6
					}
				]
			},
			{
				name: "Squat",
				sets: [
					{
						weight: 205,
						reps: 8
					},
					{
						weight: 215,
						reps: 6
					}
				]
			}
		]
	},
	{
		id: "l-003",
		date: "2025-09-24",
		movements: [
			{
				name: "Bench Press",
				sets: [
					{
						weight: 155,
						reps: 8
					},
					{
						weight: 165,
						reps: 6
					},
					{
						weight: 175,
						reps: 4
					}
				]
			},
			{
				name: "Barbell Row",
				sets: [
					{
						weight: 145,
						reps: 8
					},
					{
						weight: 155,
						reps: 6
					}
				]
			}
		]
	}
];

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const recentPosts = await getRecentBlogPosts();
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Fitness - Ronniel Gandhe", "description": "Running and strength training progress tracking", "canonical": "https://ronnielgandhe.com/fitness" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", Nav, { "currentPath": "/fitness", "recentPosts": recentPosts })} ${maybeRenderHead()}<main class="min-h-screen bg-bg pt-12"> <div class="max-w-6xl mx-auto px-4 py-12"> <!-- Header --> <div class="mb-12"> <h1 class="text-3xl font-bold text-ink mb-4">Fitness</h1> <p class="text-ink-mute">
Tracking running and strength training progress with data-driven insights.
</p> </div> <!-- Charts Component --> ${renderComponent($$result2, "FitnessCharts", FitnessCharts, { "runs": runsData, "lifts": liftsData, "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/ronniel/rg-portfolio/src/components/FitnessCharts", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/Users/ronniel/rg-portfolio/src/pages/fitness/index.astro", undefined);

const $$file = "/Users/ronniel/rg-portfolio/src/pages/fitness/index.astro";
const $$url = "/fitness";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
