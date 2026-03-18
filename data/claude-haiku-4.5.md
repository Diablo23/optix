CLAUDE HAIKU 4.5

20. Model Profile & When to Use Haiku
Claude Haiku 4.5 is Anthropic's speed champion, released October 15, 2025. It delivers near-
frontier intelligence at the lowest price point in the lineup. At $1/$5 per million tokens, it is the most
cost-efficient model while performing comparably to what was state-of-the-art just months before its
release.
Key Specifications
Context Window 200K tokens
Max Output 64K tokens
Model String claude-haiku-4-5-20251001
Pricing $1 / $5 per million tokens (input/output)
Thinking Extended thinking supported
Reliable Knowledge Cutoff February 2025
Special Capabilities Computer use, context awareness
Haiku's Sweet Spot
Haiku 4.5 is the first Haiku model to include extended thinking, computer use, and context
awareness. It runs 4-5 times faster than Sonnet 4.5 at a fraction of the cost. It is ideal for real-time
applications, intent detection, classification, data extraction, high-volume processing, and sub-agent
tasks.
21. Speed-First Prompting Strategies
Prompting Haiku is fundamentally about efficiency. Every token in your prompt costs processing
time, and Haiku's strength is speed. Optimize your prompts for directness and brevity without
sacrificing clarity.
Keep Prompts Lean
Haiku responds extremely well to concise, focused instructions. While Opus benefits from rich
context and guidelines, Haiku performs best when you strip your prompt down to essentials. Give it
exactly what it needs and nothing more.
# Efficient Haiku prompt for classification system: "Classify support requests
into one category." user: "Classify this request into exactly one of these
categories: billing, technical, account, feature_request, other. Request:
{{USER_MESSAGE}} Respond with ONLY the category name, nothing else."
Use Short, Direct System Prompts
Where Opus can digest a multi-page system prompt, Haiku performs optimally with compact
instructions. Focus on the essential role, the specific task, and the output format. Skip elaborate
guidelines that Haiku may not fully leverage.
Extended Thinking with Haiku
Haiku supports extended thinking, which is billed as output tokens at $5 per million. Use it selectively
for tasks where the extra reasoning quality justifies the latency and cost trade-off. For most Haiku
workloads (classification, extraction, routing), thinking is unnecessary and adds unwanted latency.
22. Sub-Agent & Routing Patterns
Haiku's greatest strategic value is as a front-line model in multi-model architectures. Sonnet 4.5 or
Opus can break down a complex problem into multi-step plans, then orchestrate a team of multiple
Haiku instances to complete subtasks in parallel.
Intent Detection Layer
Use Haiku as the first layer of processing in AI systems. A company running an AI support platform
might use Haiku to quickly determine user intent before routing the request to Sonnet or Opus for
deeper analysis.
# Haiku as intent router system: "You are an intent classifier." user: "Given the
following user message, classify the intent as one of: simple_question,
complex_analysis, coding_task, creative_writing, other. Message:
{{USER_INPUT}} Respond with ONLY the intent label."
Parallel Sub-Agent Execution
Haiku's speed makes it ideal for fan-out tasks. An orchestrator (Sonnet or Opus) can dispatch many
Haiku instances simultaneously, each handling an independent subtask. The results are then
aggregated by the orchestrator.
23. Working Within Haiku's Constraints
While Haiku is remarkably capable for its tier, it has real limitations compared to Sonnet and Opus
that you should design around.
Context Retention
In longer sessions, Haiku may lose track of variable names, class names, or earlier context. It is best
for short, focused tasks rather than long conversational sessions. If your task requires multi-turn
context retention, consider Sonnet instead.
Reasoning Depth
Haiku handles structured workflows well but may struggle with highly complex architectural
reasoning or ambiguous multi-step problems. For tasks that a competent junior developer or analyst could handle, Haiku is excellent. For tasks requiring senior-level judgment, escalate to Sonnet or
Opus.
Example Quality Matters More
Because Haiku has less capacity for inference than Opus, providing clear, precise examples
becomes even more important. Where Opus might correctly interpret a vague prompt, Haiku needs
explicit demonstration of the exact output format and style you expect.
PRO TIP
When using Haiku, provide one clean, unambiguous example rather than many diverse examples. Haiku
excels at pattern matching from clear templates.
24. Haiku Prompt Templates
Template: Fast Classification
system: "Classify inputs into categories. Respond with ONLY the category label."
user: "Categories: {{CATEGORY_LIST}} Input: {{INPUT_TEXT}} Category:"
Template: Data Extraction
system: "Extract structured data from text. Return valid JSON only." user:
"Extract the following fields from this text: - name, email, phone, company
Text: {{INPUT_TEXT}} Return JSON with these fields. Use null for missing
values."
Template: Quick Code Generation
system: "You are a fast, efficient coding assistant." user: "Write a {{LANGUAGE}}
function that {{TASK_DESCRIPTION}}. Include only the function code, no
explanation. <example> Input: Python function that reverses a string
Output: def reverse_string(s): return s[::-1] </example>"