# PACT Local-First Data Persistence

This document describes how PACT keeps working when the network is unavailable.
It covers the client-side storage tiers, the local entity cache, the offline
mutation queue, the sync engine, multi-device delta replication, conflict
resolution, and the offline evidence cache.

> [!NOTE]
> All modules below live in [`src/lib/offline/`](../src/lib/offline/). They are
> pure, deterministic, and testable without a live Supabase or Stripe
> connection.

---

## 1. Storage Tiers

PACT degrades gracefully across three storage tiers. Each module probes the
next tier when the previous one is unavailable (for example, in private
browsing or when the quota is exceeded).

| Tier | Backend | Role |
| --- | --- | --- |
| 1 | `IndexedDB` | Durable entity and queue storage where available |
| 2 | `localStorage` | Primary durable tier in the current implementation |
| 3 | In-memory `Map` | Fallback when no durable store is writable |

| Concern | Module | Storage key | Schema version |
| --- | --- | --- | --- |
| Offline mutation queue | [`storage.ts`](../src/lib/offline/storage.ts) | `pact_offline_sync_queue_v1` | 1 |
| Local entity cache | [`local-cache.ts`](../src/lib/offline/local-cache.ts) | `pact_local_entity_cache_v2` | 2 |

Both modules expose a `StorageAdapter` interface with `getItem`, `setItem`, and
`removeItem`. Tests inject a custom adapter through `setStorageAdapter()` /
`setCacheAdapter()` instead of touching the real browser store.

---

## 2. Local Entity Cache

The local cache (`local-cache.ts`) stores reconciliable entities so the UI can
render immediately on load and rehydrate before the server responds.

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | `string` | Entity primary key |
| `type` | `CacheableEntityType` | `tasks` \| `thoughts` \| `habits` \| `preferences` |
| `data` | `object` | Serialized entity payload |
| `version` | `number` | Monotonic entity version |
| `client_updated_at` | ISO 8601 UTC | Last client mutation time |
| `server_updated_at` | ISO 8601 UTC \| null | Last acknowledged server time |
| `is_dirty` | `boolean` | `true` when the local change is not yet synced |

A `LocalCacheSnapshot` groups cached entities by type under a single schema
version, which the migration path uses to upgrade older payloads.

---

## 3. Offline Mutation Queue

Captures made without a connection enter the queue in
[`queue.ts`](../src/lib/offline/queue.ts). Each item carries a deterministic
`idempotency_key`, so a retried flush never creates duplicates.

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | UUID v4 | Client-generated item id |
| `type` | `OfflineItemType` | `quick_task` \| `quick_thought` \| `quick_expense` |
| `payload` | `OfflinePayload` | Typed capture payload |
| `status` | `OfflineItemStatus` | Queue state (below) |
| `client_timestamp` | ISO 8601 UTC | Capture time |
| `retry_count` | `number` | Failed dispatch attempts |
| `last_error` | `string` \| null | Last dispatch error |
| `idempotency_key` | `string` | Deduplication key |

### Queue state machine

| Status | Meaning |
| --- | --- |
| `pending` | Waiting for dispatch |
| `syncing` | Dispatch in flight |
| `synced` | Acknowledged by the server |
| `failed` | Exhausted retries or a terminal error |

---

## 4. Sync Engine

The sync engine ([`sync-engine.ts`](../src/lib/offline/sync-engine.ts))
reconciles the pending queue and dirty cache entities against the backend. It
reports a `SyncState` of `synced`, `syncing`, `offline`, `pending`, `conflict`,
or `failed`.

Failed dispatches retry with exponential backoff:

| `retry_count` | Delay |
| --- | --- |
| 0 | 1000 ms |
| 1 | 2000 ms |
| 2 | 4000 ms |
| … | doubles, capped at 30000 ms |

A `SyncProcessSummary` records how many items were processed, succeeded,
failed, or hit a conflict, plus the updated queue.

---

## 5. Multi-Device Delta Replication

[`delta-engine.ts`](../src/lib/offline/delta-engine.ts) carries changes between
devices as deltas rather than full snapshots.

| Concept | Field | Notes |
| --- | --- | --- |
| Operation id | `opId` | Unique per delta |
| Device id | `deviceId` | Originating device |
| Action | `action` | `UPSERT` \| `DELETE` |
| Logical clock | `logicalClock` | Lamport timestamp for ordering |
| Cursor | `sinceCursor` | Monotonic sync position |
| Tombstone | `tombstone` | Marks a deleted entity |

A `DeltaSyncBatchResponse` returns the `newCursor`, the applied and rejected
`opId`s, any `serverDeltas`, and the conflict count.

---

## 6. Conflict Resolution

[`conflict-engine.ts`](../src/lib/offline/conflict-engine.ts) resolves conflicts
deterministically and never leaks punitive consequences to the client.

| Strategy | When it applies |
| --- | --- |
| `NO_CONFLICT` | No competing change |
| `CLIENT_WINS_LWW` | Client stored the later timestamp |
| `SERVER_WINS_LWW` | Server stored the later timestamp |
| `SAFE_FIELD_MERGE` | Non-overlapping fields can merge |
| `REJECTED_SERVER_AUTHORITATIVE` | The field or type is server-only |
| `MANUAL_RESOLUTION_REQUIRED` | No safe automatic outcome |

### Server-authoritative boundaries

These entity types are never overridden by offline client state:

- `accountability_consequences`
- `accountability_verifications`
- `financial_transactions`
- `partner_verifications`
- `auth_sessions`

Protected fields include `consequence_status`, `breach_declared_at`,
`partner_id`, `amount_cents_verified`, `verification_status`, and
`penalty_executed`. See [SECURITY.md](./SECURITY.md) for the wider zero-trust
model.

---

## 7. Offline Evidence Cache

[`attachment-cache.ts`](../src/lib/offline/attachment-cache.ts) stages
proof-of-work evidence captured offline.

| Rule | Value |
| --- | --- |
| Max size per file | 5 MB |
| Max total staged storage | 25 MB |
| Integrity check | SHA-256 checksum per item |
| Staging lifetime | 7 days, then `EXPIRED` |
| MIME types | Whitelist enforced |

A staged attachment moves from `STAGED_OFFLINE` to `UPLOADING`, then
`UPLOADED`, or to `EXPIRED`. The client can stage evidence but can never
override an accountability consequence, which stays server-authoritative.

---

## 8. Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Data Model Specification](./DATA_MODEL.md)
- [Security Matrix & Zero-Trust Boundaries](./SECURITY.md)
- [Testing & Verification Runbook](./TESTING.md)
