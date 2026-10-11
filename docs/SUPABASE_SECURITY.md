# Supabase Service Role Key & RLS Best Practices

This reference explains how PACT separates privileged server access from
client-safe access, how Row Level Security (RLS) isolates users, and how cron
endpoints are protected. It is aimed at contributors and self-hosters who
manage their own Supabase project.

> [!WARNING]
> The service role key bypasses Row Level Security. Treat it as a root
> credential. It must never reach the browser bundle, a log, a screenshot, or a
> commit.

---

## 1. Two keys, two trust levels

| Key | Env var | Exposure | RLS |
| --- | --- | --- | --- |
| Publishable / anon key | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) | Safe for the browser (`NEXT_PUBLIC_` prefix) | Enforced |
| Service role key | `SUPABASE_SERVICE_ROLE_KEY` | Server only — background jobs, cron | **Bypassed** |

Any variable prefixed with `NEXT_PUBLIC_` is inlined into the client bundle. The
service role key has no such prefix and is read only in server-side code such as
[`src/app/api/cron/sweep-deadlines/route.ts`](../src/app/api/cron/sweep-deadlines/route.ts).

Production validation requires the service role key to be present server-side;
see [`src/lib/config/production-validator.ts`](../src/lib/config/production-validator.ts).

---

## 2. Row Level Security

Every user-owned table enforces ownership in the database, not in application
code. A record is visible only to the user it belongs to.

```sql
CREATE POLICY "owner_select" ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id);
```

The same pattern applies per operation:

| Operation | Policy expression |
| --- | --- |
| `SELECT` | `USING (auth.uid() = user_id)` |
| `INSERT` | `WITH CHECK (auth.uid() = user_id)` |
| `UPDATE` | `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` |
| `DELETE` | `USING (auth.uid() = user_id)` |

`auth.uid()` resolves to the authenticated user from the request's JWT. A client
cannot forge another user's rows because the `WITH CHECK` clause rejects a
mismatched `user_id`.

For related foreign keys, the policy also verifies the parent row's owner:

```sql
WITH CHECK (
  auth.uid() = user_id
  AND (
    goal_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.goals g
      WHERE g.id = goal_id AND g.user_id = auth.uid()
    )
  )
);
```

See [DATA_MODEL.md](./DATA_MODEL.md) for the full schema and
[SECURITY.md](./SECURITY.md) for the wider zero-trust model.

---

## 3. Server-authoritative state

Some state must never be writable by the client, regardless of RLS. Identity and
state transitions are verified on the server with `supabase.auth.getUser()`, and
server-only fields are confined to privileged code paths. The offline layer
treats these as server-authoritative and refuses to override them.

---

## 4. Protecting cron endpoints

Background sweeps are invoked by a scheduler and authenticate with a shared
bearer secret. The comparison is constant-time to prevent timing side channels:

```ts
export function isTimingSafeBearerMatch(
  providedHeader: string | null,
  secret: string
): boolean {
  if (!providedHeader || !secret) return false;
  const expectedAuth = `Bearer ${secret}`;
  const providedBuf = Buffer.from(providedHeader, 'utf8');
  const expectedBuf = Buffer.from(expectedAuth, 'utf8');
  if (providedBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}
```

| Rule | Reason |
| --- | --- |
| Set `CRON_SECRET` in production | Unauthenticated calls are rejected with HTTP 401 |
| Compare with `crypto.timingSafeEqual` | Prevents byte-by-byte timing attacks |
| Return only operational metrics | Never leak user ids, consequence details, or penalties |

---

## 5. Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set only in server environments, never in
      client code or `NEXT_PUBLIC_*` variables.
- [ ] Every user-owned table has RLS enabled with `auth.uid()` policies.
- [ ] `CRON_SECRET` is set and cron endpoints compare it in constant time.
- [ ] `node scratch/secret-scan.mjs` reports zero committed secrets.

---

## 6. Related documentation

- [Security Matrix & Zero-Trust Boundaries](./SECURITY.md)
- [Threat Model](./THREAT_MODEL.md)
- [Data Model Specification](./DATA_MODEL.md)
- [Dependency Security](./DEPENDENCY_SECURITY.md)
