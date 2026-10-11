# 🔧 PACT Troubleshooting Guide

This guide provides practical solutions for common errors and setup roadblocks when developing or contributing to **PACT**.

---

## Quick Navigation

1. [Node.js & npm Issues](#1-nodejs--npm-issues)
2. [Development Server & Next.js Issues](#2-development-server--nextjs-issues)
3. [Environment Variables & Configuration](#3-environment-variables--configuration)
4. [Git & GitHub Issues](#4-git--github-issues)
5. [TypeScript Type Checking Errors](#5-typescript-type-checking-errors)
6. [ESLint Code Quality Errors](#6-eslint-code-quality-errors)
7. [Test Runner Failures](#7-test-runner-failures)
8. [Secret Scanner Warnings](#8-secret-scanner-warnings)
9. [Production Build Failures](#9-production-build-failures)
10. [Windows PowerShell & OS Tips](#10-windows-powershell--os-tips)
11. [Database & Supabase Issues](#11-database--supabase-issues)
12. [Local Storage & Quota Issues](#12-local-storage--quota-issues)
13. [How to Request Support](#13-how-to-request-support)

---

## 1. Node.js & npm Issues

### 1.1 Node.js Version Incompatibility

**Symptoms**:
Terminal displays syntax errors, `unsupported engine`, or errors regarding React 19 / Next.js 16 requirements.

**Likely Causes**:
You are running an older version of Node.js (e.g., Node 16.x or 18.x). PACT requires Node.js `v20.x` or `v22.x` LTS.

**Try This**:
1. Check your active Node.js version:
   ```bash
   node --version
   ```
2. If your version is lower than `v20.0.0`, download and install the current LTS release from [nodejs.org](https://nodejs.org/) or use a Node version manager (like `nvm` or `fnm`):
   ```bash
   # Using nvm (macOS/Linux) or nvm-windows:
   nvm install 20
   nvm use 20
   ```

---

### 1.2 Dependency Installation Fails (`npm install`)

**Symptoms**:
`npm install` terminates with `EACCES`, `ERESOLVE`, or corrupted package cache errors.

**Likely Causes**:
Stale `node_modules` cache or lockfile desynchronization.

**Try This**:
Perform a clean installation:

**macOS / Linux / Git Bash:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Windows PowerShell:**
```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force
npm install
```

---

## 2. Development Server & Next.js Issues

### 2.1 Port 3000 Is Already in Use (`EADDRINUSE`)

**Symptoms**:
`npm run dev` fails with `Error: listen EADDRINUSE: address already in use :::3000` or automatically switches to port 3001.

**Likely Causes**:
A previous instance of the Next.js server or another background application is already running on port 3000.

**Try This**:
- **Option A**: Run PACT on an alternative port:
  ```bash
  npm run dev -- -p 3001
  ```
- **Option B**: Terminate the process using port 3000:
  - **Windows PowerShell**:
    ```powershell
    Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
    ```
  - **macOS / Linux**:
    ```bash
    kill -9 $(lsof -t -i:3000)
    ```

---

### 2.2 Stale Build Cache or Inconsistent UI State

**Symptoms**:
Changes to styling or layout do not appear in the browser, or build fails with `ENOENT` inside `.next/`.

**Likely Causes**:
Next.js compilation cache in `.next/` has become stale.

**Try This**:
Clear the `.next` build folder and restart:

**macOS / Linux / Git Bash:**
```bash
rm -rf .next
npm run dev
```

**Windows PowerShell:**
```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

---

## 3. Environment Variables & Configuration

### 3.1 Missing `.env.local` File

**Symptoms**:
Browser or terminal outputs warnings that environment variables like `NEXT_PUBLIC_APP_URL` or `NEXT_PUBLIC_SUPABASE_URL` are undefined.

**Likely Causes**:
The local environment template has not been copied into `.env.local`.

**Try This**:
Copy `.env.example` to `.env.local`:
```bash
# macOS / Linux / Git Bash / PowerShell:
cp .env.example .env.local

# Windows Command Prompt:
copy .env.example .env.local
```
Restart `npm run dev`.

---

### 3.2 Missing Supabase URL or Publishable Key

**Symptoms**:
The browser logs `Supabase public environment variables missing. Auth features require valid credentials.`, or sign-in fails after local setup. The current Supabase clients fall back to placeholder credentials when a required variable is missing, so the app can start even though authentication does not work.

**Likely Causes**:
`NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is missing, empty, misspelled, or still contains the template value. Copying `.env.example` alone does not configure a real Supabase project. The development server may also still be using values loaded before the file was edited.

**Try This**:
1. If `.env.local` is missing, create it as described in Section 3.1. If it already exists, edit it without overwriting your other settings. Keep it in the project root beside `package.json`.
2. Set both variables to the URL and publishable key from the same Supabase project, using the exact names from [`.env.example`](../.env.example):
   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
   ```
   Replace these example values with your project's values. PACT reads `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, not `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never put a service role key in a `NEXT_PUBLIC_` variable; those variables are exposed to the browser.
3. Stop the development server, run `npm run dev` again, and reload the page. Confirm that the missing-variable warning is gone and retry sign-in. Keep `.env.local` untracked and do not paste credentials into issues or logs.

---

## 4. Git & GitHub Issues

### 4.1 Permission Denied When Pushing (`403` / `Publickey`)

**Symptoms**:
`git push` fails with `Permission to TheVicky1/Pact_OS.git denied to <user>` or `Authentication failed`.

**Likely Causes**:
You are trying to push directly to the upstream repository (`TheVicky1/Pact_OS`) instead of your personal fork (`<your-username>/Pact_OS`).

**Try This**:
1. Verify your remotes:
   ```bash
   git remote -v
   ```
2. Ensure `origin` points to your personal fork URL:
   ```bash
   git remote set-url origin https://github.com/<your-username>/Pact_OS.git
   ```
3. Push to your fork:
   ```bash
   git push -u origin <your-branch-name>
   ```

---

### 4.2 Branch Out of Sync With Upstream `main`

**Symptoms**:
Git warns about conflicts or your pull request shows hundreds of unrelated commits.

**Likely Causes**:
Your local branch was created from an outdated `main` branch.

**Try This**:
Sync with upstream and rebase your topic branch:
```bash
# 1. Fetch latest commits from upstream
git fetch upstream

# 2. Rebase your current branch on top of upstream main
git rebase upstream/main
```
If merge conflicts appear, resolve them in VS Code, stage the resolved files (`git add .`), and continue (`git rebase --continue`).

---

## 5. TypeScript Type Checking Errors

### 5.1 `npx tsc --noEmit` Reports Type Errors

**Symptoms**:
TypeScript compiler reports `TS2322`, `TS2339`, or `TS7006` errors.

**Likely Causes**:
- A component is receiving a prop that is not defined in its TypeScript interface.
- A variable has an implicit `any` type.
- An optional property is accessed without optional chaining (`?.`).

**Try This**:
1. Check the exact file and line number output by:
   ```bash
   npx tsc --noEmit
   ```
2. Open the file in your code editor and inspect the type signature.
3. Import the canonical interfaces from `src/types/` rather than re-declaring ad-hoc types.
4. Avoid casting with `as any`. Define explicit types or interfaces.

---

## 6. ESLint Code Quality Errors

### 6.1 `npm run lint` Fails

**Symptoms**:
ESLint reports unused variables, missing React Hook dependencies, or unescaped HTML entities.

**Likely Causes**:
Code violates project linting rules configured in `eslint.config.mjs`.

**Try This**:
1. Run ESLint to inspect error locations:
   ```bash
   npm run lint
   ```
2. Common fixes:
   - Remove unused variable imports or prefix them with an underscore (e.g., `_event`).
   - Wrap dynamic dependencies in `useCallback` or add required dependencies to `useEffect` dependency arrays.
   - Use standard typography replacements in JSX (`&apos;` instead of raw single quotes in text).

---

## 7. Test Runner Failures

### 7.1 `node scratch/run-tests.mjs` Fails on a Specific Suite

**Symptoms**:
The test runner terminates with `✖ <suite-name>.test.ts FAILED`.

**Likely Causes**:
A domain validation rule, timestamp constraint, or state machine expectation was violated by your recent code modification.

**Try This**:
1. Run the targeted failing suite directly for faster isolated output:
   ```bash
   npm run test:file -- tests/<failing-suite>.test.ts
   # (or: npm test)
   ```
2. Open `tests/<failing-suite>.test.ts` to see the exact assertion that failed.
3. Verify whether your change altered the expected return type or state machine transition.
4. Remember: PACT unit tests do NOT require a live database. Mock dependencies are automatically injected by the test harnesses.

---

## 8. Secret Scanner Warnings

### 8.1 `node scratch/secret-scan.mjs` Detects a Secret

**Symptoms**:
The secret scanner reports: `✖ Secret Scan FAILED: Sensitive credentials detected`.

**Likely Causes**:
A real API key, private token, service role secret, or `.env.local` file was accidentally saved or referenced in tracked project files.

**Try This**:
1. **Do NOT disable or bypass the scanner.**
2. Inspect the file reported by the scanner output.
3. Replace the actual secret with a mock placeholder (e.g., `your-api-key-here`).
4. Ensure your actual keys remain only in `.env.local`, which is ignored by Git.
5. If a real private key was ever committed and pushed to a remote repository, **immediately revoke/rotate that key** in its respective provider dashboard (Supabase, Google Cloud, etc.).

---

## 9. Production Build Failures

### 9.1 `npm run build` Fails

**Symptoms**:
`npm run build` terminates with static page generation errors or server module resolution errors.

**Likely Causes**:
- Browser-only APIs (like `window`, `document`, or `localStorage`) are accessed at the top level of a Server Component without a `'use client'` directive or `useEffect` guard.
- A missing export on a route or page file.

**Try This**:
1. Check if the failing component uses client-only hooks (`useState`, `useEffect`) and ensure it has `'use client';` at the very first line of the file.
2. Guard direct browser global access:
   ```typescript
   if (typeof window !== 'undefined') {
     // Safe browser-only code
   }
   ```
3. Re-run `npm run build` to verify that all routes build cleanly.

---

## 10. Windows PowerShell & OS Tips

### 10.1 PowerShell Execution Policy Restriction

**Symptoms**:
Running `npm` or local scripts outputs: `File ... cannot be loaded because running scripts is disabled on this system`.

**Try This**:
Open PowerShell and enable script execution for your current user session:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

---

### 10.2 Line Endings (CRLF vs. LF)

**Symptoms**:
Git marks every line of a file as modified due to Windows CRLF line endings.

**Try This**:
Configure Git to automatically handle line endings:
```bash
git config --global core.autocrlf true
```

---

## 11. Database & Supabase Issues

### 11.1 Supabase RLS Infinite Recursion (`42P17`)

**Symptoms**:
A Supabase request fails with HTTP 500 and PostgreSQL error `42P17`: `infinite recursion detected in policy for relation "profiles"` (or another table).

**Likely Causes**:
A Row Level Security (RLS) policy reads its own table, causing PostgreSQL to evaluate the same policy again. This can also happen across tables: a policy on table A queries table B, whose policy queries table A (`A → B → A`). Adding an `auth.uid()` filter inside the recursive subquery does not break that cycle.

**Try This**:
1. Inspect the policies on the reported table and any tables they query. Follow both `USING` and `WITH CHECK` expressions until you find the circular dependency.
2. Where access depends only on row ownership, replace the recursive lookup with a direct comparison against the current row. PACT's `profiles.id` references `auth.users.id`, so its ownership check uses `id`; tables such as `tasks` use `user_id` instead.

   ```sql
   -- ❌ Recursive: reading profiles invokes the profiles policy again.
   CREATE POLICY "Select profile" ON public.profiles FOR SELECT
   TO authenticated
   USING (id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

   -- ✅ Alternative: check the current row without querying profiles.
   CREATE POLICY "Select profile" ON public.profiles FOR SELECT
   TO authenticated
   USING (auth.uid() = id);
   ```

   These are alternative examples, not statements to run together. In a migration, alter or replace the offending existing policy; adding another policy does not remove the recursive one. PACT's existing profile policies already use direct identity checks.
3. If authorization genuinely needs a lookup that would otherwise create a cycle, consider a narrowly scoped `SECURITY DEFINER` helper. It runs as its owner; it only avoids re-entering the lookup table's RLS policies if that owner's privileges actually bypass them. `SECURITY DEFINER` alone is not a recursion fix. Keep the helper in a non-exposed schema, set a safe `search_path` (for example, empty with schema-qualified references), and restrict execution to the roles that need it. Have it check the caller's identity and return only the required authorization result. See the [Supabase RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security) before using this pattern.
4. Retest the failing query as an authenticated user, including attempts to access another user's rows. Confirm both that recursion is gone and that unauthorized access remains denied; testing only as a privileged database role can hide RLS problems. Keep RLS enabled.

---

## 12. Local Storage & Quota Issues

PACT stores offline state in the browser through a small adapter layer
(`src/lib/offline/storage.ts`, `local-cache.ts`, `attachment-cache.ts`). When the
browser storage quota is full, a write throws a `QuotaExceededError`
(`DOMException` name `QuotaExceededError`). The adapters probe storage at load
and silently fall back to an in-memory store on failure, so in a private window
or a full-quota profile offline data will not survive a reload.

The three client storage keys are:

| Key | Holds |
| :--- | :--- |
| `pact_offline_sync_queue_v1` | Pending offline mutations |
| `pact_local_entity_cache_v2` | Cached server entities (schema v2) |
| `pact_staged_proof_attachments_v1` | Staged proof attachments (5 MB/file, 25 MB total) |

### Resolving Local Storage Quota Exceeded Errors

1. **Confirm the cause.** Open DevTools → **Application → Storage** and check the
   usage against the quota. The console shows errors such as
   `Failed to execute 'setItem' on 'Storage': Setting the value of 'pact_staged_proof_attachments_v1' exceeded the quota.`

2. **Preserve pending work first.** Before clearing anything, copy the offline
   queue so unsynced mutations are not lost:

   ```js
   // Run in the DevTools console.
   copy(localStorage.getItem('pact_offline_sync_queue_v1'));
   ```

   Paste the result somewhere safe, or trigger a sync while online so the queue
   drains before you clear caches.

3. **Purge staged proof attachments.** Staged attachments are re-capturable, so
   they are the safest thing to remove:

   ```js
   localStorage.removeItem('pact_staged_proof_attachments_v1');
   ```

4. **Purge the entity cache if needed.** The cache is rebuilt from the server on
   the next load:

   ```js
   localStorage.removeItem('pact_local_entity_cache_v2');
   ```

5. **Do not clear the queue while items are pending.** Deleting
   `pact_offline_sync_queue_v1` discards unsynced mutations permanently. Drain it
   while online, or back it up in step 2, before removing the key.

6. **Then reload.** Because the adapter may have switched to the in-memory
   fallback, freeing space alone does not restore persistence; reload the page so
   the adapter re-probes storage and re-selects `localStorage`.

If quota pressure recurs, reduce the size or number of staged proof attachments
before uploading (each file is capped at 5 MB and the staged total at 25 MB).

---

## 13. How to Request Support

If your problem is not covered in this guide, our community is here to help!

Before opening an issue or asking for help, please gather the following information:

| Information | Example |
| :--- | :--- |
| **Operating System** | Windows 11 / macOS Sonoma / Ubuntu 22.04 |
| **Node.js & npm Version** | `node -v` $\rightarrow$ `v20.11.0`, `npm -v` $\rightarrow$ `10.2.4` |
| **Command Executed** | `npm run dev` or `npm run build` |
| **Exact Error Message** | Full terminal error output or screenshot |
| **Reproduction Steps** | 1. Cloned repo, 2. Ran `npm install`, 3. Ran `npm run dev` |

Once gathered, please open an issue on the [PACT GitHub Issues page](https://github.com/TheVicky1/Pact_OS/issues) or consult [SUPPORT.md](../SUPPORT.md).
