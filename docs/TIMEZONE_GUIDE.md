# PACT Timezone Guide

PACT stores every instant in UTC and renders it in the user's timezone. This
guide explains the rules, the helpers in [`src/lib/time.ts`](../src/lib/time.ts),
and how to reason about daylight saving time (DST).

---

## 1. The core rule

| Layer | Representation |
| --- | --- |
| Database and API | UTC, ISO 8601 (e.g. `2026-10-15T13:00:00.000Z`) |
| User interface | Local wall-clock time in the profile's IANA timezone |

Deadlines, habit resets, notifications, and scheduled routines are all computed
from the profile timezone and stored as UTC. Never store a wall-clock string
without its timezone context.

```mermaid
flowchart LR
  A[User picks local time] --> B[localToUtc]
  B --> C[(UTC ISO 8601)]
  C --> D[utcToLocal]
  D --> E[Render in profile timezone]
```

---

## 2. IANA timezone validation

`isValidIanaTimezone` rejects abbreviations and bare offsets, and accepts
canonical IANA identifiers:

```ts
import { isValidIanaTimezone } from '@/lib/time';

isValidIanaTimezone('Asia/Kolkata'); // true
isValidIanaTimezone('America/New_York'); // true
isValidIanaTimezone('UTC'); // true
isValidIanaTimezone('IST'); // false — ambiguous abbreviation
isValidIanaTimezone('+05:30'); // false — offset without a region
```

The helper rejects a value that has no `/` unless it is one of `UTC`, `GMT`,
`Etc/UTC`, or `Etc/GMT`, then verifies the identifier with
`Intl.DateTimeFormat`.

---

## 3. Converting between local time and UTC

`localToUtc` turns a wall-clock string in a timezone into a UTC instant and
reports DST edge cases:

```ts
import { localToUtc } from '@/lib/time';

localToUtc('2026-10-15T18:30', 'Asia/Kolkata');
// {
//   utcIso: '2026-10-15T13:00:00.000Z',
//   isNonexistent: false,
//   isAmbiguous: false,
//   error: null,
// }
```

`localToUtc` returns a `LocalToUtcResult`:

| Field | Meaning |
| --- | --- |
| `utcIso` | The UTC ISO 8601 instant, or `null` on error |
| `isNonexistent` | Local time skipped by a spring-forward DST jump |
| `isAmbiguous` | Local time that occurs twice at a fall-back DST jump |
| `error` | Message when the timezone or input is invalid |

`utcToLocal` performs the reverse conversion for display.

---

## 4. Display helpers

| Helper | Purpose |
| --- | --- |
| `getLocalDateString` | `YYYY-MM-DD` in the profile timezone |
| `getLocalHourAndMinute` | Current local hour and minute |
| `formatCalendarDateHeader` | Human-readable day header |
| `formatWeekRangeHeader` / `formatMonthYearHeader` | Range headers |
| `formatSecondsToHumanReadable` | Durations for focus sessions |

Use these instead of `Date` methods that read the machine's local timezone, so
the UI matches the profile rather than the browser.

---

## 5. Testing timezone logic

Date and time helpers accept a `Clock` so tests can freeze time instead of
depending on the machine clock:

```ts
import { SystemClock } from '@/lib/time';

interface Clock {
  now(): Date;
}

const fixedClock: Clock = { now: () => new Date('2026-10-15T13:00:00.000Z') };
```

Test DST boundaries explicitly by converting a wall-clock time near a
spring-forward or fall-back transition and asserting the `isNonexistent` and
`isAmbiguous` flags. Run the suite with `npm test`.

---

## 6. Checklist for contributors

- [ ] Store instants as UTC ISO 8601, never as naive local strings.
- [ ] Validate every timezone with `isValidIanaTimezone` before use.
- [ ] Route date math through [`src/lib/time.ts`](../src/lib/time.ts).
- [ ] Handle `isNonexistent` and `isAmbiguous` results from `localToUtc`.
- [ ] Use the `Clock` abstraction in tests instead of `Date.now()`.

---

## 7. Related documentation

- [Data Model Specification](./DATA_MODEL.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Testing & Verification Runbook](./TESTING.md)
- [Git Workflow](./GIT_WORKFLOW.md)
