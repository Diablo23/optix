Gemini 3.1 Pro: The Reasoning Engine

Gemini 3.1 Pro is optimized for complex, multi-step tasks and long-context analysis (up to 1M tokens). It prefers directness over conversational "fluff."

The "Direct Execution" Framework
Context First, Instructions Last: When uploading large files (PDFs, codebases), place the data first and your specific question at the very end. This "anchors" the model’s focus.

Define the "Thinking Level": For critical tasks, you can explicitly ask the model to "show its reasoning" or use the thinking_level parameter in the API to ensure it explores edge cases.

The Signature Loop: If using the API for multi-turn tasks (like booking a flight and a hotel), ensure you pass back the thoughtSignature from the previous response. This maintains the model's internal state.

Example Prompt:
"[Uploaded 500-page Legal Document]
Based on the information above, identify any clauses related to 'Force Majeure' that apply to pandemic-related delays. List them in a table with the page number and a brief summary of the impact."