---
title: "Agentification: The 3 Phases and Why Most Demos Are Phase 0.5"
slug: agentification-3-phases
publishedAt: "2025-10-13"
tags: ["Learning", "AI", "Agents", "Systems", "Exploration"]
summary: "Trying to understand what makes an AI system a real 'agent' vs. just a fancy API call."
readingTime: 7
---

# Agentification: The 3 Phases and Why Most Demos Are Phase 0.5

<div class="callout callout-info">
<div class="callout-header">
<span class="callout-icon">ℹ</span>
<span class="callout-title">What I'm Exploring</span>
</div>
<div class="callout-content">

- Everyone's building "AI agents" but they mean very different things
- I'm trying to map out a spectrum: simple tools → orchestrated systems → autonomous agents
- Most demos I see are just single function calls with "agent" branding
- The interesting part is coordination: how do you chain multiple tools reliably?

</div>
</div>

## Why This Interests Me

Every AI demo lately claims to be an "agent." But when I look closer, a lot of them are just:
- A chatbot that calls one API
- A code autocomplete tool
- A summarizer with a fancy UI

Those are super useful, but calling them "agents" feels like a stretch. Real agents should be able to:
- Break down complex goals into steps
- Use multiple tools in sequence
- Handle failures and retry
- Know when to ask for human help

I wanted to map out what that progression actually looks like, from simple to sophisticated.

## The 3 Phases (My Mental Model)

### Phase 0: Simple Tools

These are single-purpose AI features:
- GitHub Copilot (autocomplete one line of code)
- ChatGPT answering one question
- A summarizer that turns a document into bullet points

**Why it's not an "agent"**: It does one thing when you ask. No planning, no memory, no autonomy. Super useful, but it's basically a smart function call.

### Phase 1: Orchestrated Systems

This is where it gets interesting. The system can:
- Break your goal into steps ("Find research papers, summarize each, write a report")
- Call multiple tools in sequence
- Handle failures (retry if API times out, ask human if unsure)
- Verify results (check that the API returned valid data before continuing)

**Example**: You ask "Create a briefing on gold prices." It:
1. Searches for recent articles
2. Verifies it found at least 2 results
3. Summarizes them
4. Writes the results to a file
5. If any step fails, it logs the error and stops

This requires real engineering. Typed inputs/outputs for each tool, retry logic, logging. most "agent" demos skip this and break in production.

### Phase 2: Autonomous Systems

This is the sci-fi level (rare in practice):
- The agent decides what goals to pursue based on KPIs
- It runs continuously, measuring outcomes and adjusting
- Humans set policies ("never spend more than $X" or "always get approval for writes")
- Everything is audited for compliance

**Example**: A self-driving car deciding routes, monitoring safety metrics, and handing control back to the driver if something goes wrong.

Most companies aren't here yet. Even phase 1 is challenging.

**Definition**: Agents that set their own subgoals within a policy-constrained envelope, 
optimize toward KPIs, and operate in closed loops with continuous measurement and adjustment.

**Architecture** (all of P1, plus):
- **KPI binding**: Every run tied to a business metric (e.g., reduce support ticket backlog 
  by 20%, maintain SLA > 95%)
- **Policy engine**: Budget/risk/scope guardrails (max $X/day, no PII writes, rollback if 
  error rate > Y%)
- **Continuous optimization**: Agent adjusts plans based on observed KPI deltas
- **Change management**: Canary deployments, A/B tests, automated rollbacks
- **Audit & compliance**: Immutable logs of decisions, approvals, outcomes for SOC2/GDPR

**Examples** (rare, but real):
- Waymo: Autonomous driving with safety policies, real-time KPI monitoring (disengagements 
  per mile), and rollback to human takeover
- Anduril Lattice: Multi-drone coordination with mission success KPIs and policy constraints 
  (no-fly zones, ROE)
- Some supply chain optimizers: inventory agents that reorder based on demand forecasts, 
  constrained by budget and lead time SLAs

**Criteria**:
- Agent *proposes* goals based on KPI gaps
- Human/policy approves goals before execution
- Closed loop: plan → act → measure → adjust
- KPI deviations trigger alerts or automatic rollbacks
- Every decision auditable (who, what, why, outcome)

**Value**: Scale beyond human oversight. Systems that operate 24/7, adapting to changing 
conditions while staying within safety bounds.

**Limits**: Requires mature observability, policy infrastructure, and organizational trust. 
Most companies aren't ready for this—Phase 1 is already a big lift.

---

## Where most demos live: Phase 0.5

**The pattern**: A chatbot that calls a few tools (web search, calculator, note-taking) but 
has no plan verification, no retries, no contracts, no human approval gates, and no logging 

---

## A Simple Orchestrator (Phase 1)

Here's a minimal example showing how you'd chain tools with basic error handling:

```python
import time
from typing import List, Dict, Any

class Tool:
    """Base tool with timeout and retry logic"""
    def __init__(self, name: str, max_retries: int = 2):
        self.name = name
        self.max_retries = max_retries
    
    def execute(self, input_data: Any) -> Dict[str, Any]:
        """Override this in real tools"""
        raise NotImplementedError

class SearchTool(Tool):
    def execute(self, query: str) -> Dict[str, Any]:
        # Simulate API call
        time.sleep(0.5)
        return {
            "status": "success",
            "results": [f"Result 1 for '{query}'", f"Result 2 for '{query}'"]
        }

class Orchestrator:
    def __init__(self, tools: List[Tool]):
        self.tools = {tool.name: tool for tool in tools}
    
    def run_plan(self, steps: List[Dict[str, Any]]) -> List[Any]:
        """Execute a plan: list of {tool, input} dicts"""
        results = []
        for step in steps:
            tool_name = step["tool"]
            tool_input = step["input"]
            
            tool = self.tools[tool_name]
            for attempt in range(tool.max_retries):
                try:
                    result = tool.execute(tool_input)
                    if result["status"] == "success":
                        results.append(result)
                        break
                    else:
                        print(f"[Retry {attempt+1}] {tool_name} returned error")
                except Exception as e:
                    print(f"[Error] {tool_name}: {e}")
            else:
                # All retries failed
                results.append({"status": "failed", "tool": tool_name})
        
        return results

# Usage
search = SearchTool("search")
orchestrator = Orchestrator([search])

plan = [
    {"tool": "search", "input": "gold price trends"},
    {"tool": "search", "input": "NASDAQ correlation"}
]

results = orchestrator.run_plan(plan)
print(results)
```

This is barebones, no typed schemas, no approval gates, no cost tracking. But it shows the core idea: a plan is just a list of steps, and the orchestrator handles retries and errors.

---

## What I'm Still Figuring Out

- **When does Phase 1 actually make sense?** Most demos use agents for tasks a simple script could handle. What's the threshold where orchestration pays off?
- **How do you verify AI-generated plans?** The planner might emit steps that *look* valid but violate business rules. Do you need a separate validation layer?
- **What happens when tools change?** If you update a tool's API, how do you ensure the orchestrator's registry stays in sync?
- **Phase 2 governance**: Who audits the agent's decisions? How do you debug when it autonomously optimizes toward the wrong proxy metric?

If you've built a real Phase 1 system, I'd love to hear what actually broke in production.
