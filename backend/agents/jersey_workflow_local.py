"""
jersey_workflow_local.py
────────────────────────
Multi-agent CrewAI workflow powered by a LOCAL Ollama model.
No external API keys required – everything stays on your machine.

Agents
------
1. Creative Director   – generates luxury marketing copy for football jerseys.
2. Prompt Engineer     – transforms the copy into image/video generation prompts.
3. Quality Reviewer    – reviews the outputs and returns a final polished brief.

Usage
-----
    python backend/agents/jersey_workflow_local.py
"""

from crewai import Agent, Task, Crew, Process, LLM

# ── Local LLM via Ollama ────────────────────────────────────────────────────
# Using llama3.1 (4.9 GB, best reasoning model available locally).
# CrewAI v2 accepts an `LLM` object with provider/model string.
local_llm = LLM(
    model="ollama/llama3.1",
    base_url="http://localhost:11434",
)

# ── Agents ──────────────────────────────────────────────────────────────────

creative_director = Agent(
    role="Creative Director",
    goal=(
        "Write a luxury, emotionally compelling product description "
        "for a Moroccan football jersey brand targeting premium collectors."
    ),
    backstory=(
        "You are a world-class creative director at a luxury sportswear "
        "atelier in Casablanca. You blend Moroccan heritage with modern "
        "sportswear aesthetics. Your copy evokes emotion, exclusivity, "
        "and national pride."
    ),
    llm=local_llm,
    verbose=True,
)

prompt_engineer = Agent(
    role="AI Prompt Engineer",
    goal=(
        "Convert the creative brief into a detailed, production-ready "
        "image/video generation prompt optimized for Higgsfield or Midjourney."
    ),
    backstory=(
        "You are an expert AI prompt engineer specializing in fashion and "
        "sportswear visuals. You know exactly which keywords produce "
        "cinematic lighting, fabric macro details, and luxury aesthetics "
        "in generative AI tools."
    ),
    llm=local_llm,
    verbose=True,
)

quality_reviewer = Agent(
    role="Quality Assurance Reviewer",
    goal=(
        "Review the creative copy and the AI generation prompt. "
        "Ensure brand consistency, correct any errors, and produce "
        "a final polished output package."
    ),
    backstory=(
        "You are a meticulous QA lead at the brand. You verify tone, "
        "accuracy, and ensure every deliverable meets the luxury standard "
        "before it goes to production."
    ),
    llm=local_llm,
    verbose=True,
)

# ── Tasks ───────────────────────────────────────────────────────────────────

task_creative_brief = Task(
    description=(
        "Write a premium marketing description (3-4 sentences) for the "
        "'Morocco Domicile 2026' football jersey. Highlight: zellige-inspired "
        "geometric embroidery, eco-friendly AeroGrid fabric, limited edition "
        "numbering, and Moroccan national pride. Target audience: premium "
        "collectors aged 25-40."
    ),
    expected_output=(
        "A short, polished marketing paragraph (3-4 sentences) with an "
        "emotional, luxury tone."
    ),
    agent=creative_director,
)

task_generate_prompt = Task(
    description=(
        "Using the creative brief from the previous task, craft a detailed "
        "AI image/video generation prompt. The prompt should specify: "
        "camera angle (macro close-up), lighting (dramatic studio), "
        "fabric texture details, color palette (emerald green, gold accents), "
        "and motion direction (slow cinematic pan). "
        "Format the output as a single prompt string ready to paste into "
        "Higgsfield CLI."
    ),
    expected_output=(
        "A single, detailed AI generation prompt string (1-2 sentences) "
        "optimized for cinematic video generation."
    ),
    agent=prompt_engineer,
)

task_quality_review = Task(
    description=(
        "Review both the marketing copy and the AI generation prompt. "
        "Check for: brand tone consistency, spelling/grammar, prompt "
        "effectiveness, and suggest any improvements. "
        "Return the final approved versions of both."
    ),
    expected_output=(
        "A structured output with two sections:\n"
        "1. FINAL MARKETING COPY: (the approved copy)\n"
        "2. FINAL AI PROMPT: (the approved generation prompt)\n"
        "3. NOTES: (any reviewer comments)"
    ),
    agent=quality_reviewer,
)

# ── Crew ────────────────────────────────────────────────────────────────────

jersey_crew = Crew(
    agents=[creative_director, prompt_engineer, quality_reviewer],
    tasks=[task_creative_brief, task_generate_prompt, task_quality_review],
    process=Process.sequential,
    verbose=True,
)

# ── Execute ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  JERSEY MAROCCO – LOCAL MULTI-AGENT WORKFLOW")
    print("  Powered by CrewAI + Ollama (llama3.1)")
    print("=" * 60 + "\n")

    result = jersey_crew.kickoff()

    print("\n" + "=" * 60)
    print("  FINAL OUTPUT")
    print("=" * 60)
    print(result)
