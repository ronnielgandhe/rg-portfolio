"""
api_agents.py
FastAPI endpoint for agent orchestration.
Run: uvicorn src.api_agents:app --reload --port 8000
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

# Import orchestrator (in production, this would be a separate module)
# For demo, we'll define a simplified version here

app = FastAPI(title="Agent Orchestration API", version="1.0.0")

# CORS: Allow all origins for local dev (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Request/Response Models
# ============================================================================

class RunRequest(BaseModel):
    """Request to run an agent."""
    goal: str = Field(..., description="Natural language goal for the agent")
    max_cost_ms: float = Field(10000, description="Max allowed execution time in ms")
    require_approval: bool = Field(False, description="Whether to require human approval for writes")

class RunResponse(BaseModel):
    """Response from agent run."""
    run_id: str
    goal: str
    status: str  # "completed", "blocked", "failed"
    verdict: str
    passed: bool
    plan_steps: int
    total_duration_ms: float
    timestamp: str
    logs: list[Dict[str, Any]]

# ============================================================================
# Mock Orchestrator (simplified for API demo)
# ============================================================================

def mock_orchestrate(goal: str, max_cost_ms: float, require_approval: bool) -> RunResponse:
    """
    Mock orchestration for API demo.
    In production, this would call the full orchestrator from orchestrator_demo.py
    """
    run_id = str(uuid.uuid4())
    
    # Simple pattern matching for demo
    if "gold" in goal.lower() and "nasdaq" in goal.lower():
        # Success case
        logs = [
            {
                "step_id": 1,
                "tool": "search",
                "input": {"query": "gold vs Nasdaq divergence"},
                "success": True,
                "verified": True,
                "duration_ms": 103.5,
                "verification_msg": "Verified: 3 results returned"
            },
            {
                "step_id": 2,
                "tool": "write_note",
                "input": {"filename": "gold_nq_briefing.txt", "content": "..."},
                "success": True,
                "verified": True,
                "duration_ms": 101.2,
                "verification_msg": "Verified: written to /notes/gold_nq_briefing.txt"
            }
        ]
        
        total_duration = sum(log["duration_ms"] for log in logs)
        
        # Check policy
        if require_approval:
            status = "blocked"
            verdict = "ESCALATE: Write operation requires human approval"
            passed = False
        elif total_duration > max_cost_ms:
            status = "blocked"
            verdict = f"POLICY VIOLATION: {total_duration:.0f}ms exceeds {max_cost_ms}ms limit"
            passed = False
        else:
            status = "completed"
            verdict = "APPROVED: All policy checks passed"
            passed = True
        
        return RunResponse(
            run_id=run_id,
            goal=goal,
            status=status,
            verdict=verdict,
            passed=passed,
            plan_steps=len(logs),
            total_duration_ms=total_duration,
            timestamp=datetime.utcnow().isoformat(),
            logs=logs
        )
    else:
        # Empty plan case
        return RunResponse(
            run_id=run_id,
            goal=goal,
            status="failed",
            verdict="No plan generated for goal",
            passed=False,
            plan_steps=0,
            total_duration_ms=0,
            timestamp=datetime.utcnow().isoformat(),
            logs=[]
        )

# ============================================================================
# Endpoints
# ============================================================================

@app.get("/")
def root():
    """Health check."""
    return {
        "service": "Agent Orchestration API",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/run", response_model=RunResponse)
def run_agent(request: RunRequest):
    """
    Execute an agent with the given goal.
    
    Returns a run record with plan, logs, and policy verdict.
    """
    try:
        result = mock_orchestrate(
            goal=request.goal,
            max_cost_ms=request.max_cost_ms,
            require_approval=request.require_approval
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Orchestration failed: {str(e)}")

@app.get("/runs/{run_id}")
def get_run(run_id: str):
    """
    Retrieve details of a past run.
    
    In production, this would query a database.
    For demo, we return a mock response.
    """
    return {
        "run_id": run_id,
        "status": "completed",
        "message": "Run record retrieval not implemented in demo. In production, query from DB."
    }

# ============================================================================
# Development Notes
# ============================================================================

"""
USAGE:
  1. Start server: uvicorn src.api_agents:app --reload --port 8000
  2. Test with curl:
     
     curl -X POST http://localhost:8000/run \
       -H "Content-Type: application/json" \
       -d '{
         "goal": "Create a briefing on gold vs. Nasdaq divergence and save a note.",
         "max_cost_ms": 10000,
         "require_approval": false
       }'

  3. Expected response:
     {
       "run_id": "...",
       "goal": "...",
       "status": "completed",
       "verdict": "APPROVED: All policy checks passed",
       "passed": true,
       "plan_steps": 2,
       "total_duration_ms": 204.7,
       "timestamp": "2025-10-13T...",
       "logs": [...]
     }

PRODUCTION UPGRADES:
  - Replace mock_orchestrate with full orchestrator from orchestrator_demo.py
  - Add authentication (API keys, OAuth)
  - Persist run records to database (Postgres, MongoDB)
  - Add async task queue (Celery, Temporal) for long-running plans
  - Add rate limiting (slowapi, Redis)
  - Add structured logging (structlog, send to Datadog/Splunk)
  - Add metrics (Prometheus, Grafana)
  - Restrict CORS origins to known frontends
"""
