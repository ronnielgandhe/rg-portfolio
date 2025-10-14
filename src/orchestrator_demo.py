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
