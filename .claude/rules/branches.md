# Branches

This repo has three long-lived branches with different visual themes and **different dependencies**:

- `main` — dark violet aurora theme, forced dark mode via `next-themes`
- `color-experiments` — personal/custom visual work
- `claude-suggestion` — navy "Blue Flame" theme with `motion`-based UI (NumberTicker, ShimmerButton)

## Always reinstall after switching branches

`main` and `claude-suggestion` depend on different packages (`next-themes` vs `motion`). Switching branches with `git checkout`/`git switch` does **not** update `node_modules` — the previous branch's packages stay installed, which causes `Module not found` build errors.

**After every branch switch, before starting the dev server:**

```bash
pnpm install
```

If you already have a dev server running when you switch branches, stop it, run `pnpm install`, then restart it.
