# Next.js App

## Rules Index

Detailed rules live in `.claude/rules/`. When adding, updating, or deleting a rules file, keep this index in sync.

- [branches.md](.claude/rules/branches.md) — Branch themes and reinstalling deps after switching
- [env-vars.md](.claude/rules/env-vars.md) — Environment variable access patterns
- [stack.md](.claude/rules/stack.md) — Framework, language, and tooling overview
- [styling.md](.claude/rules/styling.md) — Tailwind CSS and design token conventions
- [supabase.md](.claude/rules/supabase.md) — Database migrations and RLS patterns

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
