# CLAUDE.md

## Start of every session

1. Read `ROADMAP.md`. It is the plan for this project: what's done, what's next,
   and the working rules.
2. Follow its **Working rules** section for all work in this repo.
3. When a task is finished or plans change, update `ROADMAP.md` in the same branch
   as the work: tick the box, add a short note if something turned out differently,
   and add new tasks you discovered.

## Project facts

- MCP server: `src/server.js` (tool definitions) calls `src/core.js` (draft logic).
- Tests: `npm test` (Node's built-in runner, no extra dependencies). Keep it that way.
- Skill: `skills/capcut-reels/` (`SKILL.md` plus `references/`).
- Reference projects live outside this repo in `E:\reference\`. Read them for ideas;
  never run their code without a security audit first.
