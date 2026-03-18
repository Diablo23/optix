PART II: CLAUDE OPUS 4.6
7. Model Profile & When to Use Opus
Claude Opus 4.6 is Anthropic's most intelligent model, released February 5, 2026. It is the right
choice for the hardest, longest-horizon problems: large-scale code migrations, deep research,
extended autonomous work, complex architecture decisions, and large codebase analysis.
Key Specifications
Context Window 200K tokens (1M in beta)
Max Output 128K tokens
Model String claude-opus-4-6
Pricing $5 / $25 per million tokens (input/output)
Thinking Adaptive thinking (default)
Reliable Knowledge Cutoff ~Early 2026
Opus Personality & Behavioral Traits
Opus 4.6 does significantly more upfront exploration than previous models. It is more direct and
grounded, providing fact-based progress reports rather than self-celebratory updates. It is more
conversational, slightly more fluent and colloquial. It may skip detailed summaries after tool calls,
jumping directly to the next action. It has a strong predilection for subagent orchestration and may
spawn sub-agents proactively. It can also tend to overengineer solutions.
8. Adaptive Thinking & Effort Control
Opus 4.6 uses adaptive thinking by default, where Claude dynamically decides when and how much
to think. Claude calibrates its thinking based on two factors: the effort parameter and query
complexity. Higher effort elicits more thinking; more complex queries do the same. On easier queries
that don't require thinking, the model responds directly.
Effort Settings for Opus
Use the effort parameter to control thinking depth. Available settings are: max, high, medium, and
low. For Opus, the default behavior at high effort is already quite thorough — in many cases, you
may want to reduce it.
# Adaptive thinking (recommended for Opus 4.6) client.messages.create(
model="claude-opus-4-6", max_tokens=64000, thinking={"type": "adaptive"},
output_config={"effort": "high"}, messages=[{"role": "user", "content":
"..."}], )
Taming Overthinking
If Opus is thinking excessively or inflating thinking tokens, add explicit instructions to constrain its
reasoning. A prompt like the following has proven effective:
"When you're deciding how to approach a problem, choose an approach and commit to
it. Avoid revisiting decisions unless you encounter new information that directly
contradicts your reasoning. If you're weighing two approaches, pick one and see it
through."
Guiding Thinking Behavior
You can instruct Opus to reflect after tool use for better multi-step results. Adding something like
"After receiving tool results, carefully reflect on their quality and determine optimal next steps before
proceeding" helps Opus use interleaved thinking effectively. Conversely, if thinking triggers too often
due to a complex system prompt, add guidance like: "Extended thinking adds latency and should
only be used when it will meaningfully improve answer quality — typically for problems that require
multi-step reasoning."
9. Long-Horizon Agentic Workflows
Opus 4.6 excels at long-horizon reasoning with exceptional state tracking. As of February 2026, it
holds the longest task-completion time horizon of any model, with a 50%-time horizon of 14 hours
and 30 minutes. It maintains orientation across extended sessions by focusing on incremental
progress.
Context Awareness
Opus 4.6 features context awareness, meaning it can track its remaining context window throughout
a conversation. This allows it to manage its own token budget and plan work accordingly.
Multi-Context Window Prompting
For tasks spanning multiple context windows, Anthropic recommends five key practices:
First, use the initial context window to set up a framework (write tests, create setup scripts), then use
future windows to iterate. Second, have the model write tests in a structured format before starting
work. Third, encourage the creation of setup scripts (like init.sh) to prevent repeated work. Fourth,
when a context window is cleared, consider starting with a brand new context rather than
compacting — Opus is extremely effective at discovering state from the local filesystem. Fifth,
provide verification tools like Playwright MCP for testing UIs.
"Your context window will be automatically compacted as it approaches its limit,
allowing you to continue working indefinitely. Therefore, do not stop tasks early
due to token budget concerns. As you approach your token budget limit, save your
current progress and state to memory before the context window refreshes."
State Management
Use structured formats (JSON) for state data like test results and task status. Use unstructured text
for progress notes. Use git for state tracking across multiple sessions — Opus performs especially
well at leveraging git logs to restore context.
10. Subagent Orchestration
Opus 4.6 has a strong predilection for spawning sub-agents. It will recognize when tasks would
benefit from delegation and do so proactively without explicit instruction. This is powerful but can be
excessive.
# If subagent overuse is a problem: "Use subagents when tasks can run in parallel,
require isolated context, or involve independent workstreams that don't need to
share state. For simple tasks, sequential operations, single-file edits, or tasks
where you need to maintain context across steps, work directly rather than
delegating."
11. Taming Overengineering
Opus 4.6 has a documented tendency to overengineer: creating extra files, adding unnecessary
abstractions, building in flexibility that wasn't requested. The official Anthropic fix is explicit
prompting:
<avoid_overengineering> Avoid over-engineering. Only make changes that are
directly requested or clearly necessary. Keep solutions simple and focused: -
Scope: Don't add features, refactor code, or make "improvements" beyond what was
asked. - Documentation: Don't add docstrings, comments, or type annotations to
code you didn't change. - Defensive coding: Don't add error handling, fallbacks,
or validation for scenarios that can't happen. - Abstractions: Don't create
helpers, utilities, or abstractions for one-time operations.
</avoid_overengineering>
12. Safety & Autonomy Guidance
Without guidance, Opus 4.6 may take actions that are difficult to reverse or affect shared systems.
Anthropic recommends adding explicit guardrails:
"Consider the reversibility and potential impact of your actions. You are
encouraged to take local, reversible actions like editing files or running tests,
but for actions that are hard to reverse, affect shared systems, or could be
destructive, ask the user before proceeding. Examples that warrant confirmation:
- Destructive operations: deleting files, rm -rf - Hard to reverse: git push --
force, git reset --hard - Operations visible to others: pushing code, commenting
on PRs"
13. Opus Prompt Templates
Template: Deep Research Task
system: "You are a senior research analyst. Your task is to conduct thorough,
multi-source research and produce a well-structured synthesis." user: <task>
Research {{TOPIC}} and produce a comprehensive analysis. </task> <guidelines> -
Search for information in a structured way - Develop competing hypotheses as you
gather data - Track confidence levels in your findings - Regularly self-
critique your approach - Break down the research systematically - Verify
information across multiple sources </guidelines> <output_format> Produce a structured report with clear sections, evidence-based conclusions, and explicit
confidence ratings for each finding. </output_format>
Template: Complex Coding Task
system: "You are an expert software engineer." <task_instructions>
{{CODING_TASK_DESCRIPTION}} </task_instructions> <working_style> Investigate
before answering: never speculate about code you have not opened. Read relevant
files BEFORE proposing changes. Avoid over-engineering. Keep solutions simple
and focused. </working_style> <quality_standards> Write high-quality, general-
purpose solutions. Do not hard-code values or create solutions that only work
for specific test inputs. If tests are incorrect, inform me rather than working
around them. </quality_standards>