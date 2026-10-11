/**
 * Pure helpers for the data export control.
 *
 * Split out of the component so the progress math and filename resolution are
 * testable without mounting React: the suite runner parses plain `.ts` but not
 * JSX.
 */

/** Requested archive format. `json` returns a structured archive, `csv` a zipped CSV bundle. */
export type ExportFormat = 'json' | 'csv';

/** Lifecycle of the control, as the UI renders it. */
export type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

/** Interval in ms between simulated progress ticks while the archive is generated. */
export const EXPORT_PROGRESS_TICK_MS = 120;

/**
 * Progress ceiling (percent) reached by the simulated ticker.
 *
 * Generation time is unknown to the client, so the bar advances toward this
 * ceiling and settles at 100% once the request resolves — it never claims
 * completion before the archive actually exists.
 */
export const EXPORT_PROGRESS_CEILING = 90;

/** Ease-out increments so the bar moves fast early and decelerates as it nears the ceiling. */
export function nextExportProgress(current: number): number {
  if (current >= EXPORT_PROGRESS_CEILING) {
    return EXPORT_PROGRESS_CEILING;
  }
  const remaining = EXPORT_PROGRESS_CEILING - current;
  return Math.min(EXPORT_PROGRESS_CEILING, Math.round(current + Math.max(1, remaining * 0.12)));
}

/** Clamps a progress value into the 0–100 range a `role="progressbar"` element reports. */
export function clampExportProgress(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function defaultFilename(format: ExportFormat, fallback: string): string {
  return format === 'json' ? `${fallback || 'pact-os-export'}.json` : `${fallback || 'pact-os-export'}.zip`;
}

/**
 * Resolves the attachment filename from the response's Content-Disposition header,
 * falling back to a format-appropriate default when the header is absent or malformed.
 */
export function resolveExportFilename(
  contentDisposition: string | null,
  format: ExportFormat
): string {
  if (contentDisposition && contentDisposition.includes('filename=')) {
    const match = contentDisposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) {
      return match[1];
    }
  }
  return defaultFilename(format, 'pact-os-export');
}
