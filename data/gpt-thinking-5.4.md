Prompting Thinking 5.4 Models
Overview

Thinking models are optimized for reasoning and complex problem solving. They internally analyze problems before producing answers.

Because these models already perform reasoning internally, prompts should be simpler and more direct.

Overly complex instructions can actually degrade performance.

Core Principles
1. Keep Prompts Simple

Thinking models work best with direct problem statements.

Instead of:

Think carefully and explain step by step how to solve this problem.

Use:

Solve the following problem.

The model will perform internal reasoning automatically.

2. Avoid Chain-of-Thought Instructions

Reasoning models already reason internally. Explicit instructions like:

Think step by step

are usually unnecessary.

3. Clearly Define the Goal

The most important element is the objective.

Example:

Design an algorithm that detects fraudulent transactions in a banking system.
4. Provide Only Relevant Context

Too much information can reduce reasoning quality.

Include only data needed to solve the problem.

Example:

Dataset description:
10 million transactions per day
Features: amount, time, location, account ID

Task:
Design a fraud detection strategy.
5. Add Constraints

Constraints guide reasoning without prescribing steps.

Example:

Constraints:
• Must scale to 10 million users
• Prioritize accuracy over speed
• Use explainable methods
Recommended Prompt Structure

For reasoning models, use a minimal structure:

Task
Constraints
Relevant context

Example:

Task:
Determine whether the following argument is logically valid.

Argument:
All mammals are warm-blooded.
Whales are mammals.
Therefore whales are warm-blooded.

Explain the reasoning briefly.
Advanced Reasoning Prompts
Analytical Prompts
Analyze the strengths and weaknesses of this policy proposal.
Planning Prompts
Design a system architecture for a real-time ride sharing platform.
Multi-step Problem Solving

Even without instructions, reasoning models will internally evaluate steps.

Example:

A company wants to reduce logistics costs by 20%.

Given:
- shipping routes
- warehouse locations
- delivery times

Propose an optimization strategy.
Common Mistakes
Overly complex prompts

Bad:

Think step by step, analyze deeply, break down the problem, evaluate all possibilities.

Better:

Analyze the problem and propose the best solution.
Too many examples

Reasoning models usually work well without examples.

Add examples only if necessary.

Excessive formatting instructions

Let the model focus on solving the problem.

Thinking Model Prompt Template
Task:
[problem or question]

Constraints:
[requirements or limits]

Relevant context:
[data or background information]
Best Use Cases for Thinking Models

Thinking models excel at:

mathematics

logical reasoning

coding problems

system design

research analysis

strategy planning

complex decision making