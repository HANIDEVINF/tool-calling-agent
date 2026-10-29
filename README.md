# Rule-Based Tool-Calling Prototype

This repository is an interactive UI that demonstrates keyword routing into three local tool fixtures. It is **not currently an LLM-driven agent**.

> **Simulation notice:** the weather function reads from a small hard-coded city table, product data is a local in-memory list, and routing uses keyword matching. No weather service, external database or language model is called.

## Run locally

~~~bash
npm ci
npm run dev
~~~

Open http://localhost:3000.

## What is implemented

- Keyword-based choice among a calculator, weather fixture and product fixture.
- A recursive-descent arithmetic parser supporting numbers, parentheses and +, -, * and / without using JavaScript eval.
- A UI that shows the selected tool, input and returned fixture data.

## Limitations and next steps

- The weather table contains only sample values and must not be used as a source of current forecasts.
- The product catalog is hard-coded and is not connected to a real database.
- Tool selection is deterministic and cannot perform general reasoning.
- Add unit tests for arithmetic precedence, unary signs, malformed expressions and division by zero.
- To build a real agent, connect a model through a server-side endpoint, enforce JSON-schema validation, isolate tools, use real adapters where appropriate, and record tool errors and timing.

Do not describe the current version as an autonomous or production-ready AI agent.
