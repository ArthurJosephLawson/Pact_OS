'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

import {
  type ExportFormat,
  type ExportStatus,
  EXPORT_PROGRESS_TICK_MS,
  nextExportProgress,
  clampExportProgress,
  resolveExportFilename,
} from './data-export-helpers';

export type { ExportFormat, ExportStatus };

/**
 * Downloads the response body as a file attachment and returns its filename.
 * Extracted so the DOM side-effect is testable without mounting a component.
 */
export function downloadExportBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(anchor);
}

export interface DataExportButtonProps {
  /** Requested archive format. `json` returns a structured archive, `csv` a zipped CSV bundle. */
  format?: ExportFormat;
  /** Overrides the idle label; the exporting label is derived from `format`. */
  label?: string;
  /** Endpoint hit to start the export. Defaults to the server-authoritative export route. */
  endpoint?: string;
  /** Invoked after the archive resolves successfully, so callers can drive their own feedback. */
  onExportComplete?: (blob: Blob, filename: string) => void | Promise<void>;
  className?: string;
}

/**
 * DataExportButton
 * Triggers a user data export and reports generation progress while it runs.
 *
 * Generating the archive fans out across every user-owned domain and can take
 * several seconds, so the control shows an animated spinner plus an indeterminate
 * gold progress bar, and stays disabled for the whole request to block duplicate
 * exports. On completion or failure the control returns to its idle appearance.
 */
export function DataExportButton({
  format = 'json',
  label,
  endpoint,
  onExportComplete,
  className = '',
}: DataExportButtonProps) {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (tickTimer.current !== null) {
        clearInterval(tickTimer.current);
        tickTimer.current = null;
      }
    };
  }, []);

  const stopProgressTicker = useCallback(() => {
    if (tickTimer.current !== null) {
      clearInterval(tickTimer.current);
      tickTimer.current = null;
    }
  }, []);

  const isExporting = status === 'exporting';

  const idleLabel = label ?? (format === 'json' ? 'Export JSON' : 'Export CSV');
  const busyLabel = format === 'json' ? 'Generating archive...' : 'Building ZIP archive...';

  const handleExport = useCallback(async () => {
    if (isExporting) {
      return;
    }

    stopProgressTicker();
    setStatus('exporting');
    setProgress(0);
    setErrorMessage(null);

    // Generation is server-side and unbounded, so advance a simulated ticker
    // toward the ceiling while the request is in flight.
    tickTimer.current = setInterval(() => {
      if (!isMounted.current) {
        return;
      }
      setProgress((current) => nextExportProgress(current));
    }, EXPORT_PROGRESS_TICK_MS);

    try {
      const target = endpoint ?? `/api/user/export?format=${format}`;
      const response = await fetch(target, {
        method: 'GET',
        headers: { Accept: format === 'json' ? 'application/json' : 'application/zip' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error || `Export failed with status ${response.status}`
        );
      }

      const blob = await response.blob();
      const filename = resolveExportFilename(response.headers.get('Content-Disposition'), format);

      downloadExportBlob(blob, filename);

      if (!isMounted.current) {
        return;
      }

      stopProgressTicker();
      setProgress(100);
      setStatus('success');
      await onExportComplete?.(blob, filename);
    } catch (err: unknown) {
      if (!isMounted.current) {
        return;
      }
      stopProgressTicker();
      setStatus('error');
      setProgress(0);
      setErrorMessage(
        err instanceof Error ? err.message : 'Export failed. Please try again.'
      );
    }
  }, [endpoint, format, isExporting, onExportComplete, stopProgressTicker]);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Button
        type="button"
        variant={format === 'json' ? 'primary' : 'secondary'}
        size="md"
        loading={isExporting}
        disabled={isExporting}
        onClick={handleExport}
        aria-label={idleLabel}
        data-testid="data-export-button"
      >
        {idleLabel}
      </Button>

      {/* Animated indeterminate gold progress bar, reported to assistive tech. */}
      <div
        role="progressbar"
        aria-label={busyLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={isExporting ? clampExportProgress(progress) : undefined}
        aria-hidden={!isExporting}
        data-testid="data-export-progress"
        className={`h-1.5 w-full overflow-hidden rounded-full border border-white/[0.08] bg-zinc-900/80 transition-opacity duration-200 ${
          isExporting ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          data-testid="data-export-progress-fill"
          className={`h-full rounded-full bg-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.45)] ${
            isExporting ? 'animate-pulse' : ''
          }`}
          style={{
            width: isExporting ? `${clampExportProgress(progress)}%` : '0%',
            transition: 'width 200ms ease-out',
          }}
        />
      </div>

      {/* Spinner + stage caption, also announced politely while generating. */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="data-export-status"
        className="flex items-center gap-2 text-xs text-zinc-400 min-h-[1.25rem]"
      >
        {isExporting && (
          <>
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[#e2c056]" data-testid="icon-exporting" />
            <span className="text-zinc-300">{busyLabel}</span>
          </>
        )}
        {status === 'success' && !isExporting && (
          <>
            <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" data-testid="icon-export-success" />
            <span className="text-emerald-300">Archive ready — download started.</span>
          </>
        )}
        {status === 'error' && !isExporting && (
          <>
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" data-testid="icon-export-error" />
            <span className="text-rose-300">{errorMessage ?? 'Export failed.'}</span>
          </>
        )}
        {status === 'idle' && (
          <span className="sr-only">Idle. Ready to export your account data.</span>
        )}
      </div>
    </div>
  );
}

export default DataExportButton;
