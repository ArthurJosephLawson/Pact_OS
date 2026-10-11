# Contributing to PACT on Windows

Most of PACT's toolchain assumes a POSIX shell. This guide covers the common
Windows friction points so you can get to a pull request without fighting your
environment.

> [!TIP]
> If anything here doesn't match your setup, see
> [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for general diagnostics.

---

## 1. Choose your shell

| Option | When to use it | Notes |
| --- | --- | --- |
| **WSL2** (recommended) | Default choice for contributing | Linux behaviour matches CI; `npm` and Git behave as documented |
| PowerShell | Quick, one-off commands | Quoting and `&&` differ from bash |
| Git Bash | Git-only commands | Ships with Git for Windows; not a full environment |

PACT's scripts (`scratch/*.mjs`) and CI run on Linux with Node.js 20.x. Working
inside WSL2 avoids almost every path and line-ending problem below.

---

## 2. Git line endings (`CRLF` vs `LF`)

Windows checks out files with `CRLF` line endings by default, while the
repository uses `LF`. This shows up as whole-file diffs or as warnings when you
commit.

Configure Git to normalize line endings:

```sh
# Recommended on Windows: convert to LF on commit, keep CRLF in the working tree
git config --global core.autocrlf true
```

| `core.autocrlf` | Working tree | Repository | Best for |
| --- | --- | --- | --- |
| `true` | `CRLF` | `LF` | Windows contributors |
| `input` | `LF` | `LF` | WSL2 and Linux |
| `false` | unchanged | unchanged | When you manage endings yourself |

If a file already has the wrong endings, renormalize it:

```sh
git add --renormalize .
git status
```

---

## 3. PowerShell execution policy

New PowerShell sessions can block `.ps1` scripts (including some `npm` shims)
with an execution policy error. Check the current policy:

```powershell
Get-ExecutionPolicy
```

Allow scripts for your user only (no admin required):

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

> [!WARNING]
> Avoid `Set-ExecutionPolicy Unrestricted` machine-wide. `RemoteSigned` at the
> `CurrentUser` scope is enough to run local scripts.

---

## 4. Running the npm scripts

The validation commands from [CONTRIBUTING.md](../CONTRIBUTING.md) (§17) are the
same on every platform, but the shell you type them in changes the syntax.

| Task | In WSL2 / bash | In PowerShell |
| --- | --- | --- |
| Install | `npm ci` | `npm ci` |
| Lint | `npm run lint` | `npm run lint` |
| Type check | `npx tsc --noEmit` | `npx tsc --noEmit` |
| Tests | `npm test` | `npm test` |
| Secret scan | `node scratch/secret-scan.mjs` | `node scratch/secret-scan.mjs` |

Chaining differs: bash uses `&&`, older PowerShell versions do not.

```sh
# bash / WSL2
npm run lint && npx tsc --noEmit
```

```powershell
# PowerShell 7+
npm run lint; npx tsc --noEmit
```

---

## 5. Common issues

| Symptom | Cause | Fix |
| --- | --- | --- |
| Entire file shows as changed | `CRLF` vs `LF` | Set `core.autocrlf` and run `git add --renormalize .` |
| `npm` script "cannot be loaded" | Execution policy | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Path errors in scripts | Windows paths leaking into a POSIX script | Run inside WSL2 |
| `node` not found | Node.js not installed in that shell | Install Node.js 20.x, or use WSL2 |

---

## 6. Related documentation

- [Contributing Guide](../CONTRIBUTING.md)
- [Beginner's Contribution Guide](./CONTRIBUTING-BEGINNERS.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Development Guide](./DEVELOPMENT.md)
