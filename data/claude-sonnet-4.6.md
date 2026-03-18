CLAUDE SONNET 4.6
14. Model Profile & When to Use Sonnet
Claude Sonnet 4.6 is described by Anthropic as “the best combination of speed and intelligence.”
Released February 17, 2026, it sits between Haiku and Opus, offering nuanced reasoning at
substantially lower cost and higher speed than Opus. For most developers, it is the default choice for
production workloads.
Key Specifications
Context Window 200K tokens (1M in beta)
Max Output 64K tokens
Model String claude-sonnet-4-6
Pricing $3 / $15 per million tokens (input/output)
Thinking Adaptive + Extended thinking (both supported)
Default Effort High
Reliable Knowledge Cutoff August 2025
Sonnet 4.6 is preferred over the previous generation Opus in coding evaluations. It achieved 94%
accuracy on computer use benchmarks. Use Sonnet for complex code generation, multi-step
analysis, research synthesis, creative writing with specific constraints, and any task where getting
the answer right matters more than raw speed.
15. Extended vs. Adaptive Thinking
Sonnet 4.6 uniquely supports both adaptive thinking and manual extended thinking with interleaved
mode. This gives you more control over reasoning behavior than either Opus (adaptive only) or
Haiku.
When to Use Each Mode
Adaptive thinking is best for autonomous multi-step agents, computer use agents, and bimodal
workloads with a mix of easy and hard tasks. Extended thinking with a budget_tokens cap provides
a hard ceiling on thinking costs while preserving quality — best for predictable token usage.
# Extended thinking with budget cap (predictable costs) client.messages.create(
model="claude-sonnet-4-6", max_tokens=16384, thinking={"type": "enabled",
"budget_tokens": 16384}, output_config={"effort": "medium"},
messages=[{"role": "user", "content": "..."}], ) # Adaptive thinking (best for
agents) client.messages.create( model="claude-sonnet-4-6",
max_tokens=64000, thinking={"type": "adaptive"}, output_config={"effort":
"high"}, messages=[{"role": "user", "content": "..."}], )
16. Effort Tuning for Sonnet
Sonnet 4.6 defaults to an effort level of high, which may cause higher latency than expected if you
are migrating from Sonnet 4.5. Anthropic provides clear guidance on tuning this per workload:
Recommended Settings by Use Case
Use Case Effort Notes
Most applications Medium Best balance of quality/speed
High-volume / latency-sensitive Low Similar to Sonnet 4.5 baseline
Agentic coding Medium Start here; raise to High if needed
Chat / content gen Low With extended thinking enabled
Complex research High With 64K max output tokens
IMPORTANT
Set a large max output token budget (64K tokens recommended) at medium or high effort to give Sonnet
room to think and act. Underproviding output tokens can artificially constrain the model.
17. Parallel Tool Calling
Sonnet 4.6 excels at parallel tool execution. It will run multiple speculative searches during research,
read several files at once to build context faster, and execute bash commands in parallel. While the
model has a high success rate without prompting, you can boost this to near-100%:
<use_parallel_tool_calls> If you intend to call multiple tools and there are no
dependencies between the tool calls, make all independent calls in parallel.
Prioritize calling tools simultaneously whenever possible. However, if some tool
calls depend on previous calls, do NOT call these in parallel. Never use
placeholders or guess missing parameters in tool calls. </use_parallel_tool_calls>
18. Coding & Agentic Patterns
Sonnet 4.6 is more responsive to the system prompt than previous models. If your prompts were
designed to reduce under-triggering on tools, Sonnet 4.6 may now overtrigger. The fix is to dial back
aggressive language: where you once said "CRITICAL: You MUST use this tool when...", use more
natural prompting like "Use this tool when...".
Explicit Action vs. Suggestion
If you say "can you suggest some changes," Claude may provide suggestions rather than
implementing them. For action-oriented behavior, be explicit: "Make these edits" instead of "Can you
suggest some changes?"
# Proactive action by default: <default_to_action> By default, implement changes
rather than only suggesting them. If the user's intent is unclear, infer the most
useful likely action and proceed, using tools to discover missing details instead
of guessing. </default_to_action>
Minimizing Hallucinations in Code
<investigate_before_answering> Never speculate about code you have not opened. If
the user references a specific file, you MUST read it before answering.
Investigate and read relevant files BEFORE answering questions about the codebase.
</investigate_before_answering>
19. Sonnet Prompt Templates
Template: Production API Agent
system: "You are a coding assistant. Use tools to read, search, and edit code."
<working_style> - Use this tool when it would enhance your understanding -
Implement changes rather than suggesting them - Read files before proposing
edits - Execute independent tool calls in parallel </working_style>
<output_config> effort: medium thinking: extended (budget_tokens: 16384)
max_tokens: 16384 </output_config>
Template: Content Generation
system: "You are an expert content writer." <task> Write {{CONTENT_TYPE}} about
{{TOPIC}}. </task> <style_guide> {{STYLE_REQUIREMENTS}} </style_guide>
<examples> <example> <input>{{EXAMPLE_BRIEF}}</input>
<output>{{EXAMPLE_OUTPUT}}</output> </example> </examples> <output_config>
effort: low thinking: enabled (budget_tokens: 16384) </output_config>
