Identify, analyze, and propose fixes for the Top 10 most impactful performance bottlenecks in the frontend React application (AEM-based), focusing on measurable improvements to load times, memory, and CPU utilization.

⚙️ Context

This React application uses AEM as the content management backend. The goal is to ensure measurable improvements in page performance metrics — specifically Time to Interactive (TTI), JS bundle size, and runtime efficiency (CPU & memory).

📋 Task & Scope
1. Initial Page Load (TTI & JS Optimization)

Identify and reduce unused JavaScript for each page/component.

Implement parallel API calls where data dependencies are absent.

Refactor to use ES module libraries instead of monolithic imports.

Check for critical path render blocking assets (fonts, CSS, etc.).

2. CPU & Memory Utilization

Detect and analyze high CPU/memory utilization patterns during runtime.

Identify unnecessary re-renders and excessive diff computations.

Detect memory leaks (event listeners, subscriptions, global state leaks).

Validate useEffect cleanup and ensure proper unmounting.

3. Repository-wide Coverage

Every file, component, and module in the repo should be analyzed.

For each file, log findings → impact → suggested fix in a structured format.

🧩 Instructions

Identify Bottlenecks

Use profiling tools (React Profiler, Lighthouse, Chrome Performance tab, AEM timings).

Identify inefficient rendering, large bundle sizes, redundant states, and memory leaks.

Capture quantitative metrics (before optimization).

Propose Fixes

For each issue, provide a specific and verifiable fix.

Reference exact file, component, and line number.

Include code snippets or pseudo-fixes if relevant.

Do not apply the fixes yet — propose only.

Assign Ownership

Map each page/component to a specific engineer (Person 1, Person 2, etc.).

Each person should have clear ownership of the files and tasks.

Document Thoroughly

Detail the analysis for each bottleneck:

What was found

Root cause

Recommended fix

Expected impact (TTI reduction, CPU %, memory MB saved, etc.)

Maintain consistency in reporting format.

Validate and Iterate

Double-check for analysis errors or missed bottlenecks.

Re-run profiling after fixes are hypothetically applied.

Refine results until confident of accuracy.

✅ Verification Mandate

Create a file:
PERFORMANCE_SNAPSHOT_BEFORE.md

List all findings, per page/component.

Include TTI, bundle size, and CPU/memory stats before fixes.

Mention responsible engineer and specific tasks.

Once fixes are applied, create:
PERFORMANCE_SNAPSHOT_AFTER.md

Capture same metrics for comparison.

Include visual diffs or charts (TTI reduction, bundle size delta).

All proposed fixes must include:

File path + Line number

Category (JS Reduction / CPU / Memory / Re-render)

Severity (High / Medium / Low)

Expected Improvement Metric

Assigned Owner

🧠 Reporting Outcome

This document should serve as a leadership-facing artifact showing:

A quantified view of frontend inefficiencies.

A prioritized action plan for optimizations.

A traceable ownership structure for execution.

A before/after measurable improvement dashboard.
