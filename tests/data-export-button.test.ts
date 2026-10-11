import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  nextExportProgress,
  clampExportProgress,
  resolveExportFilename,
  EXPORT_PROGRESS_CEILING,
} from '../src/components/settings/data-export-helpers';

describe('DataExportButton — export progress helpers', () => {
  describe('nextExportProgress', () => {
    it('advances progress from zero by at least one percent', () => {
      const next = nextExportProgress(0);
      assert.ok(next > 0, `expected progress to advance, got ${next}`);
      assert.ok(next <= EXPORT_PROGRESS_CEILING);
    });

    it('never exceeds the ceiling', () => {
      let value = 0;
      for (let i = 0; i < 200; i++) {
        value = nextExportProgress(value);
        assert.ok(
          value <= EXPORT_PROGRESS_CEILING,
          `progress exceeded ceiling: ${value}`,
        );
      }
      assert.equal(value, EXPORT_PROGRESS_CEILING);
    });

    it('is monotonically non-decreasing', () => {
      let previous = 0;
      let value = 0;
      for (let i = 0; i < 100; i++) {
        value = nextExportProgress(value);
        assert.ok(value >= previous, 'progress went backwards');
        previous = value;
      }
    });
  });

  describe('clampExportProgress', () => {
    it('clamps values into the 0-100 range', () => {
      assert.equal(clampExportProgress(-5), 0);
      assert.equal(clampExportProgress(150), 100);
      assert.equal(clampExportProgress(42.6), 43);
    });
  });

  describe('resolveExportFilename', () => {
    it('reads the filename from a quoted Content-Disposition header', () => {
      const name = resolveExportFilename(
        'attachment; filename="pact-export-2026.json"',
        'json',
      );
      assert.equal(name, 'pact-export-2026.json');
    });

    it('reads an unquoted filename', () => {
      const name = resolveExportFilename(
        'attachment; filename=pact-export.csv',
        'csv',
      );
      assert.equal(name, 'pact-export.csv');
    });

    it('falls back to the format-appropriate default when the header is absent', () => {
      assert.equal(resolveExportFilename(null, 'json'), 'pact-os-export.json');
      assert.equal(resolveExportFilename(null, 'csv'), 'pact-os-export.zip');
    });

    it('falls back when the header has no filename token', () => {
      assert.equal(resolveExportFilename('attachment', 'json'), 'pact-os-export.json');
    });
  });
});
