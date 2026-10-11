# PACT CI Workflow

This document describes the GitHub Actions workflows that run on pull requests
and pushes, the quality gates each one enforces, and how to reproduce those
checks locally before you open a PR.

> [!NOTE]
> This guide covers the workflow **gates**. For the broader pipeline design and
> history, see [CI_PIPELINE.md](./CI_PIPELINE.md).

---

## 1. Workflows

| Workflow | File | Trigger | Purpose |
| --- | --- | --- | --- |
| Continuous Integration | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) | Push and PR to `main`, `phase-6`, `community/**` | Runs the full quality gate |
| Dependency Security Audit | [`.github/workflows/dependency-audit.yml`](../.github/workflows/dependency-audit.yml) | Push/PR to `main`, plus weekly (Mon 09:00 UTC) | Dependency health and vulnerability scan |
| Release Automation | [`.github/workflows/release.yml`](../.github/workflows/release.yml) | Tags matching `v*.*.*`, or manual | Verifies and drafts a release |
| Welcome First-Time Contributor | [`.github/workflows/welcome-contributor.yml`](../.github/workflows/welcome-contributor.yml) | `pull_request_target` opened | Posts a welcome comment for first-time contributors |

---

## 2. Continuous Integration gates

`ci.yml` runs a single `quality-gates` job on `ubuntu-latest` with Node.js 20.x.
The steps run in order and must all pass:

| # | Step | Command |
| --- | --- | --- |
| 1 | Clean install | `npm ci` |
| 2 | Zero-secret scan | `node scratch/secret-scan.mjs` |
| 3 | Markdown relative-link audit | `node scratch/check-links.mjs` |
| 4 | ESLint | `npm run lint` |
| 5 | TypeScript strict typecheck | `npx tsc --noEmit` |
| 6 | Authoritative test matrix (56 suites) | `npm test` |
| 7 | Next.js production build | `npm run build` |

The build step uses dummy Supabase values when repository secrets are absent,
so forks and community branches still build.

Concurrency is keyed on the workflow and ref, and in-progress runs for the same
ref are cancelled when a newer commit arrives.

---

## 3. Dependency audit gates

`dependency-audit.yml` checks dependency health and lockfile sync, then runs a
strict vulnerability gate:

| Step | Command |
| --- | --- |
| Dependency health & lockfile sync | `node scratch/check-dependency-health.mjs` |
| Strict vulnerability gate (high & critical) | `npm audit --audit-level=high` |

The workflow also runs on a weekly schedule so drift is caught even without a
push.

---

## 4. Required status checks

Branch protection on `main` requires the Continuous Integration workflow to
pass before a pull request can be merged. A red CI run blocks the merge until it
is fixed.

---

## 5. Run the gates locally

Reproduce CI on your machine before pushing:

```bash
# 1. Install exactly as CI does
npm ci

# 2. Zero-secret scan
node scratch/secret-scan.mjs

# 3. Markdown relative-link audit
node scratch/check-links.mjs

# 4. Lint
npm run lint

# 5. Type check
npx tsc --noEmit

# 6. Test matrix
npm test

# 7. Production build
npm run build
```

> [!IMPORTANT]
> Documentation-only pull requests do not require the production build, but the
> link audit (`node scratch/check-links.mjs`) must pass. See
> [CONTRIBUTING.md](../CONTRIBUTING.md) §17.

---

## 6. Related documentation

- [CI Pipeline Design](./CI_PIPELINE.md)
- [Testing & Verification Runbook](./TESTING.md)
- [Git Workflow](./GIT_WORKFLOW.md)
- [Dependency Security](./DEPENDENCY_SECURITY.md)
