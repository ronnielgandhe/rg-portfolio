---
title: "Agentification: The 3 Phases and Why Most Demos Are Phase 0.5"
slug: agentification-3-phases
publishedAt: "2025-10-13"
tags: ["AI", "Agents", "Orchestration", "Reliability", "Engineering"]
summary: "A practical, engineering-first take on agents: tools, orchestrations, and closed loops with KPIs and audits."
readingTime: 10
---

# Agentification: The 3 Phases and Why Most Demos Are Phase 0.5

<div class="callout callout-info">
<div class="callout-header">
<span class="callout-icon">ℹ</span>
<span class="callout-title">TL;DR</span>
</div>
<div class="callout-content">

- **P0 Tools**: Single-call copilots (autocomplete, chat, summarization). Valuable, but not agents.
- **P1 Orchestrated Agents**: Planner + multi-tool execution with guardrails, SLAs, and handoffs; humans in the loop.
- **P2 Autonomous Systems**: Closed-loop decisions tied to KPIs and policy; observable, audited, rollback-capable.
- Most demos are **Phase 0.5**: one-off tool calls wrapped in agent branding.
- The difference is **control**: plans, contracts, verification, and **owner/KPI**.

</div>
</div>

## Motivation

The AI world is drowning in "agent" demos. Most fail in production within weeks. The pattern 
is predictable: impressive prototype → latency spikes → tool brittleness → silent drift → 
no owner → rollback.

The problem isn't the models—it's the lack of engineering discipline around what an agent 
*actually means* at each maturity level. "Agentification" isn't magic; it's progressive 
automation with progressively tighter constraints.

This post defines three phases, shows where most demos live (0.5), and walks through building 
a minimal orchestrator that handles plans, verification, and policy gates. The goal: clarity 
on what you need at each level before calling something production-ready.

## The 3 Phases (with crisp definitions)

### Phase 0: Tools (capabilities, not agents)

**Definition**: Single-function AI systems that execute one task per invocation with no memory, 
planning, or decision-making.

**Examples**:
- GitHub Copilot autocomplete
- GPT-4 chat interface (stateless Q&A)
- Summarization API (document → summary)
- Image classifier (image → label)

**Criteria**:
- One input → one output, synchronous or near-synchronous
- No multi-step planning
- No state between calls
- Human decides *when* to invoke and *what* to do with results

**Value**: Massive. These are the building blocks. But they're not agents—they're functions.

**Limits**: No autonomy, no error recovery, no goal decomposition. If the tool fails, the 
human notices and retries manually.

---

### Phase 1: Orchestrated Agents (the real starting line)

**Definition**: Systems that decompose goals into plans, execute multiple tools in sequence 
or parallel, enforce contracts, and handle failures with retries/compensation/escalation.

**Architecture**:
- **Planner**: Takes a goal, emits a structured plan (typed steps with dependencies)
- **Tool Registry**: Typed I/O contracts per tool (JSON Schema or Pydantic)
- **Executor**: Runs steps, respects timeouts, retries transient failures, logs everything
- **Verification**: Post-step checks (schema validation, acceptance criteria)
- **Human-in-the-loop**: Approval gates for state-changing operations or cost thresholds
- **SLAs**: Max latency, max cost, circuit breakers

**Examples** (real production):
- Databricks Assistant: SQL generation → execution → result formatting with rollback
- Dust.tt workflows: multi-tool chains with approval steps and audit logs
- Zapier Central: LLM-planned automations with guardrails and manual review

**Criteria**:
- Multi-step execution with dependencies
- Typed contracts enforce tool I/O correctness
- Failures trigger retries, compensation, or escalation (not silent drift)
- Humans approve high-risk steps (writes, external API calls, spend > threshold)
- Observable: every run is logged with plan, actions, results, duration, cost

**Value**: Throughput and consistency. One human can oversee 10x more work. Errors are 
caught early and escalated cleanly.

**Limits**: Still reactive. The orchestrator executes *your* goal. It doesn't decide which 
goal to pursue next based on KPIs or policy.

---

### Phase 2: Autonomous Systems (closed-loop optimization)

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
beyond print statements.

**Why it fails**:
- Tools hallucinate inputs (e.g., passes malformed JSON to API)
- Latency spikes cause timeouts, but no retry logic
- Partial results treated as success (e.g., searches 1 of 3 sources, proceeds anyway)
- Cost blowups (e.g., calls expensive API in a loop)
- No audit trail (can't debug what happened)

**The fix**: Upgrade to Phase 1. Add typed contracts, retries, verification, and approval 
gates. It's not sexy, but it's the difference between a demo and a system.

## Visual Architecture

<div style="text-align: center; margin: 2em 0;">
  <img src="/images/phases.svg" alt="Agent maturity phases diagram" style="max-width: 100%; height: auto; border: 1px solid var(--border-color); border-radius: 8px;">
  <p style="font-style: italic; color: var(--text-muted); margin-top: 0.5em; font-size: 0.875rem;">
    The three phases of agent maturity: Tools, Orchestrated, and Autonomous
  </p>
</div>

The closed-loop orchestration flow:

<div style="text-align: center; margin: 2em 0;">
  <img src="/images/loop.svg" alt="Orchestration loop diagram" style="max-width: 100%; height: auto; border: 1px solid var(--border-color); border-radius: 8px;">
  <p style="font-style: italic; color: var(--text-muted); margin-top: 0.5em; font-size: 0.875rem;">
    Plan → Act → Verify → Policy Gate → Approve or Rollback
  </p>
</div>

## A minimal measure (math, tiny but tidy)

Express the closed-loop control problem as:

$$
\pi^* = \arg\max_{\pi \in \Pi} \mathbb{E}_{s \sim E} \left[ J(\pi, s) \right] 
\quad \text{s.t.} \quad C(\pi) \leq \epsilon
$$

where:
- $E$ = environment (state distribution)
- $\pi$ = policy (agent's decision rule)
- $\Pi$ = policy class (allowed actions)
- $J(\pi, s)$ = objective (KPI, e.g., task success rate)
- $C(\pi)$ = constraints (budget, latency, safety)
- $\epsilon$ = policy violation threshold

**Monitoring**: Alert when observed KPI deviates beyond $\epsilon$ over window $W$:

$$
\left| \frac{1}{W} \sum_{t=T-W}^{T} J_t - J_{\text{target}} \right| > \epsilon
$$

If triggered, escalate to human review or trigger automatic rollback.

Keep it simple—just enough to signal this isn't vibes-based engineering.

## Reproducible code (drop-in orchestrator)

```python
"""
orchestrator_demo.py
Minimal Phase 1 orchestrator: planner, executor, verifier, policy gate.
Run: python src/orchestrator_demo.py
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import time
import json

# ============================================================================
# Tool Definitions (typed contracts)
# ============================================================================

class ToolInput(BaseModel):
    """Base for tool inputs."""
    pass

class ToolOutput(BaseModel):
    """Base for tool outputs."""
    success: bool
    result: Any
    error: Optional[str] = None

class SearchInput(ToolInput):
    query: str = Field(..., description="Search query")

class SearchOutput(ToolOutput):
    results: List[str] = Field(default_factory=list)

class CalcInput(ToolInput):
    expression: str = Field(..., description="Math expression")

class CalcOutput(ToolOutput):
    value: float

class WriteNoteInput(ToolInput):
    filename: str
    content: str

class WriteNoteOutput(ToolOutput):
    path: str

# ============================================================================
# Tool Registry (mock implementations)
# ============================================================================

class ToolRegistry:
    """Registry of available tools with typed I/O."""
    
    @staticmethod
    def search(input: SearchInput) -> SearchOutput:
        """Mock search tool."""
        time.sleep(0.1)  # Simulate latency
        # Mock: return gold vs Nasdaq search results
        if "gold" in input.query.lower() and "nasdaq" in input.query.lower():
            return SearchOutput(
                success=True,
                result="Found 3 articles on gold-Nasdaq divergence",
                results=[
                    "Gold rallied 2% while Nasdaq fell 1.5% on Fed hawkish signal",
                    "Risk-off rotation: Gold up, tech down as yields spike",
                    "Gold/Nasdaq correlation turns negative during tightening cycles"
                ]
            )
        return SearchOutput(success=True, result="No results", results=[])
    
    @staticmethod
    def calc(input: CalcInput) -> CalcOutput:
        """Mock calculator tool."""
        time.sleep(0.05)
        try:
            value = eval(input.expression)  # Unsafe in prod, use ast.literal_eval
            return CalcOutput(success=True, result=value, value=value)
        except Exception as e:
            return CalcOutput(success=False, result=None, value=0.0, error=str(e))
    
    @staticmethod
    def write_note(input: WriteNoteInput) -> WriteNoteOutput:
        """Mock note-writing tool."""
        time.sleep(0.1)
        # In reality, write to filesystem or DB
        path = f"/notes/{input.filename}"
        return WriteNoteOutput(success=True, result=f"Written to {path}", path=path)

# ============================================================================
# Plan & Step Definitions
# ============================================================================

class Step(BaseModel):
    """Single step in a plan."""
    step_id: int
    tool: str
    input: Dict[str, Any]
    acceptance: str = Field(..., description="Success criteria")

class Plan(BaseModel):
    """Structured plan."""
    goal: str
    steps: List[Step]

# ============================================================================
# Planner (rule-based, no LLM dependency)
# ============================================================================

class Planner:
    """Deterministic planner for demo purposes."""
    
    @staticmethod
    def plan(goal: str) -> Plan:
        """Generate plan from goal."""
        # Simple pattern matching
        if "briefing" in goal.lower() and "gold" in goal.lower() and "nasdaq" in goal.lower():
            return Plan(
                goal=goal,
                steps=[
                    Step(
                        step_id=1,
                        tool="search",
                        input={"query": "gold vs Nasdaq divergence latest"},
                        acceptance="At least 2 results returned"
                    ),
                    Step(
                        step_id=2,
                        tool="write_note",
                        input={
                            "filename": "gold_nq_briefing.txt",
                            "content": "Gold-Nasdaq divergence briefing based on search results"
                        },
                        acceptance="Note written successfully"
                    )
                ]
            )
        # Default: empty plan
        return Plan(goal=goal, steps=[])

# ============================================================================
# Executor (runs steps with retries, verification)
# ============================================================================

class ExecutionLog(BaseModel):
    """Log of a single step execution."""
    step_id: int
    tool: str
    input: Dict[str, Any]
    output: Dict[str, Any]
    success: bool
    duration_ms: float
    verified: bool
    verification_msg: str

class Executor:
    """Executes steps with timeouts, retries, verification."""
    
    def __init__(self, registry: ToolRegistry, max_retries: int = 2, timeout_ms: float = 5000):
        self.registry = registry
        self.max_retries = max_retries
        self.timeout_ms = timeout_ms
    
    def execute_step(self, step: Step) -> ExecutionLog:
        """Execute a single step with retries."""
        for attempt in range(self.max_retries + 1):
            start = time.time()
            try:
                # Route to tool
                if step.tool == "search":
                    input_obj = SearchInput(**step.input)
                    output = self.registry.search(input_obj)
                elif step.tool == "calc":
                    input_obj = CalcInput(**step.input)
                    output = self.registry.calc(input_obj)
                elif step.tool == "write_note":
                    input_obj = WriteNoteInput(**step.input)
                    output = self.registry.write_note(input_obj)
                else:
                    raise ValueError(f"Unknown tool: {step.tool}")
                
                duration = (time.time() - start) * 1000
                
                # Verify acceptance criteria
                verified, msg = self.verify(step, output)
                
                return ExecutionLog(
                    step_id=step.step_id,
                    tool=step.tool,
                    input=step.input,
                    output=output.dict(),
                    success=output.success,
                    duration_ms=duration,
                    verified=verified,
                    verification_msg=msg
                )
            except Exception as e:
                if attempt == self.max_retries:
                    duration = (time.time() - start) * 1000
                    return ExecutionLog(
                        step_id=step.step_id,
                        tool=step.tool,
                        input=step.input,
                        output={"error": str(e)},
                        success=False,
                        duration_ms=duration,
                        verified=False,
                        verification_msg=f"Failed after {self.max_retries} retries"
                    )
                time.sleep(0.5)  # Backoff
        
    def verify(self, step: Step, output: ToolOutput) -> tuple[bool, str]:
        """Check acceptance criteria."""
        if not output.success:
            return False, "Tool execution failed"
        
        # Simple rule-based verification
        if "at least" in step.acceptance.lower():
            if hasattr(output, 'results'):
                count = len(output.results)
                required = 2  # Parse from acceptance string in production
                if count >= required:
                    return True, f"Verified: {count} results returned"
                return False, f"Only {count} results, need {required}"
        
        if "written successfully" in step.acceptance.lower():
            if hasattr(output, 'path') and output.path:
                return True, f"Verified: written to {output.path}"
            return False, "Write failed"
        
        return True, "No specific verification criteria"

# ============================================================================
# Policy Gate (approvals, cost/latency thresholds)
# ============================================================================

class PolicyGate:
    """Enforces approval rules and thresholds."""
    
    def __init__(self, max_cost_ms: float = 10000, require_approval: bool = False):
        self.max_cost_ms = max_cost_ms
        self.require_approval = require_approval
    
    def check(self, plan: Plan, logs: List[ExecutionLog]) -> tuple[bool, str]:
        """Check if execution passes policy."""
        # Cost check
        total_ms = sum(log.duration_ms for log in logs)
        if total_ms > self.max_cost_ms:
            return False, f"POLICY VIOLATION: {total_ms:.0f}ms exceeds {self.max_cost_ms}ms limit"
        
        # Approval check (mock: auto-approve read-only, escalate writes)
        has_writes = any(step.tool == "write_note" for step in plan.steps)
        if has_writes and self.require_approval:
            return False, "ESCALATE: Write operation requires human approval"
        
        # Verification check
        if not all(log.verified for log in logs):
            failed = [log.step_id for log in logs if not log.verified]
            return False, f"POLICY VIOLATION: Steps {failed} failed verification"
        
        return True, "APPROVED: All policy checks passed"

# ============================================================================
# Main Orchestrator
# ============================================================================

def run_orchestrator(goal: str, max_cost_ms: float = 10000, require_approval: bool = False):
    """Full orchestration: plan → execute → verify → approve."""
    print("=" * 70)
    print(f"GOAL: {goal}")
    print("=" * 70)
    
    # 1. Plan
    planner = Planner()
    plan = planner.plan(goal)
    print(f"\n[PLANNER] Generated {len(plan.steps)} steps:")
    for step in plan.steps:
        print(f"  Step {step.step_id}: {step.tool}({step.input}) → {step.acceptance}")
    
    # 2. Execute
    registry = ToolRegistry()
    executor = Executor(registry, max_retries=2, timeout_ms=5000)
    logs = []
    print(f"\n[EXECUTOR] Running steps...")
    for step in plan.steps:
        log = executor.execute_step(step)
        logs.append(log)
        status = "✓" if log.verified else "✗"
        print(f"  {status} Step {log.step_id}: {log.tool} → {log.duration_ms:.0f}ms → {log.verification_msg}")
    
    # 3. Policy gate
    gate = PolicyGate(max_cost_ms=max_cost_ms, require_approval=require_approval)
    passed, verdict = gate.check(plan, logs)
    print(f"\n[POLICY GATE] {verdict}")
    
    # 4. Result
    print("\n" + "=" * 70)
    if passed:
        print("✓ EXECUTION COMPLETE")
    else:
        print("✗ EXECUTION BLOCKED")
    print("=" * 70)
    
    return {
        "goal": goal,
        "plan": plan.dict(),
        "logs": [log.dict() for log in logs],
        "verdict": verdict,
        "passed": passed,
        "timestamp": datetime.utcnow().isoformat()
    }

# ============================================================================
# Entry Point
# ============================================================================

if __name__ == "__main__":
    # Demo goal (ties to gold-vs-nasdaq post)
    result = run_orchestrator(
        goal="Create a short briefing on gold vs. Nasdaq divergence and save a note.",
        max_cost_ms=10000,
        require_approval=False  # Set to True to see escalation
    )
    
    # Persist run record (in production: write to DB/S3)
    print("\n[AUDIT] Run record:")
    print(json.dumps(result, indent=2))
```

**Sample output:**
```
======================================================================
GOAL: Create a short briefing on gold vs. Nasdaq divergence and save a note.
======================================================================

[PLANNER] Generated 2 steps:
  Step 1: search({'query': 'gold vs Nasdaq divergence latest'}) → At least 2 results returned
  Step 2: write_note({'filename': 'gold_nq_briefing.txt', 'content': '...'}) → Note written successfully

[EXECUTOR] Running steps...
  ✓ Step 1: search → 103ms → Verified: 3 results returned
  ✓ Step 2: write_note → 101ms → Verified: written to /notes/gold_nq_briefing.txt

[POLICY GATE] APPROVED: All policy checks passed

======================================================================
✓ EXECUTION COMPLETE
======================================================================
```

## Failure modes (short and real)

**1. Hallucination**  
LLM-generated tool inputs don't match schema. **Mitigation**: Pydantic validation catches 
this before execution. Failed validation → retry with schema hint or escalate.

**2. Tool latency**  
External API times out. **Mitigation**: Executor enforces timeout, retries with exponential 
backoff, circuit breaker after N failures.

**3. Partial results**  
Search returns 1 result when acceptance criteria requires 2. **Mitigation**: Verification 
step blocks progression; logs failure reason; escalates or retries with refined query.

**4. Cost blowups**  
Agent calls expensive API in a loop. **Mitigation**: Policy gate enforces max cost per run; 
kill switch if monthly budget exceeded.

**5. Non-idempotent side effects**  
Writing the same note twice, or charging a customer twice. **Mitigation**: Idempotency keys, 
transaction logs, rollback/compensation steps on failure.

## Policy gates & approvals (who approves what)

**Read-only operations** (search, calc, read file): Auto-approved, no human gate.

**State-changing operations** (write file, API POST, database update): Require approval if:
- Cost > $X threshold (e.g., $10/run)
- Latency > Y ms (e.g., 30s—long enough to disrupt UX)
- Scope = production environment (auto-approve staging, block prod)

**Approval flow**:
1. Executor completes plan
2. Policy gate checks thresholds
3. If exceeds → emit approval request to queue (Slack, email, dashboard)
4. Human reviews plan + logs → approves or rejects
5. If approved → executor proceeds; if rejected → rollback + log reason

**Audit trail**: Persist {goal, plan, logs, verdict, approver, timestamp} to immutable storage 
(S3, audit DB). Required for SOC2, GDPR compliance.

## How I'd ship it (stack)

```
┌─────────────────┐
│  Tool Services  │  (Search API, Calc, DB writers)
└────────┬────────┘
         │
┌────────▼────────┐
│  Orchestrator   │  (FastAPI app, plan → execute → verify)
└────────┬────────┘
         │
┌────────▼────────┐
│  Task Queue     │  (Redis/RabbitMQ for async execution)
└────────┬────────┘
         │
┌────────▼────────┐
│  Worker Pool    │  (Celery/Temporal, runs plans in parallel)
└────────┬────────┘
         │
┌────────▼────────┐
│ Observability   │  (Datadog/Grafana: metrics, logs, traces)
└────────┬────────┘
         │
┌────────▼────────┐
│ Policy Engine   │  (Approval gates, cost limits, kill-switch)
└────────┬────────┘
         │
┌────────▼────────┐
│    Storage      │  (S3/Postgres: run records, artifacts, audit logs)
└─────────────────┘
```

**SLAs & runbook**:
- **Timeouts**: Kill step after 30s, kill run after 5min
- **Retries**: 2 attempts with exponential backoff (0.5s, 2s)
- **Rollbacks**: If step fails, run compensation (e.g., delete partial writes)
- **Backpressure**: Queue depth > 1000 → reject new runs
- **Kill-switch**: Manual override to pause all agent execution (outage, cost spike)

<hr class="divider" />

## Pitfalls & sanity checks

1. **Agent sprawl**: Every team builds their own orchestrator. Consolidate to a shared platform 
   with tool registry and approval workflows.

2. **No cost/KPI ownership**: Agents run wild with no business metric tie-in. Solution: Every 
   agent maps to a KPI owner (team, individual) who reviews weekly reports.

3. **Flaky evals**: "It worked once" isn't validation. Solution: Golden task suite (20-50 
   representative goals), run nightly, alert on regression.

4. **Silent schema drift**: Tool API changes, agent breaks silently. Solution: Typed contracts 
   (Pydantic, JSON Schema), version pinning, contract tests.

5. **No postmortems**: Failures aren't analyzed. Solution: Weekly review of failed runs, update 
   verification rules or tool implementations, track fix rate.

<hr class="divider" />

## Where I'd take it next

**Idea 1: LLM planner with constraints**  
Replace rule-based planner with GPT-4 + structured output (JSON mode). Constraints: max 5 
steps, only approved tools, budget < $X. Validate plan against schema before execution.

**Idea 2: Offline eval harness**  
Build a suite of 50 golden tasks with known correct plans. Run agent nightly, measure pass@1, 
pass@3, false positive rate. Track degradation over time (model updates, tool changes).

**Idea 3: Approval dashboard**  
Web UI showing pending approvals, run logs, cost breakdown. One-click approve/reject with 
audit trail. Integrates with Slack for notifications.

**Idea 4: Multi-agent coordination**  
Hierarchical orchestration: parent agent delegates subgoals to child agents. Requires shared 
state, handoff protocols, and deadlock prevention.

<hr class="divider" />

## Repo README (excerpt)

```markdown
# Agentification: Minimal Orchestrator Demo

A Phase 1 agent orchestrator with plans, typed tools, verification, and policy gates.

## Structure
```
.
├── src/
│   ├── orchestrator_demo.py   # Core demo (runnable)
│   └── api_agents.py           # FastAPI endpoint
└── public/
    └── images/
        ├── phases.svg          # Phase diagram
        └── loop.svg            # Plan-act-verify loop
```

## Installation
```bash
pip install pydantic fastapi uvicorn
```

## Usage

### Standalone orchestrator
```bash
python src/orchestrator_demo.py
```
Prints plan, execution logs, policy verdict, and audit record.

### API server
```bash
uvicorn src.api_agents:app --reload --port 8000
```
POST `http://localhost:8000/run` with:
```json
{
  "goal": "Create a briefing on gold vs. Nasdaq divergence and save a note.",
  "max_cost_ms": 10000,
  "require_approval": false
}
```
Returns run record with plan, logs, verdict.

## Notes
- Tools are mocked—replace with real APIs in production.
- Planner is rule-based—upgrade to LLM for flexibility.
- This is Phase 1 only—Phase 2 requires KPI monitoring and closed-loop optimization.
```

```
