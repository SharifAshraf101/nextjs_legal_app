// Small generic helpers ported verbatim from the source where the source name
// was global. Renamed only when the source name was too generic (e.g. `clone`
// is kept as `clone`; `escapeHtml`/`escapeAttr` keep their names).

/** Deep clone via JSON. Source: line 3083. */
export function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

/** Pad a number to 2 digits. Source: line 4397. */
export function pad(n: number | string): string {
  return String(n).padStart(2, '0');
}

/** HTML attribute escape. Source: line 4400. */
export function escapeAttr(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** HTML body escape. Source: line 4401. */
export function escapeHtml(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Returns true when a value is not null/undefined/whitespace. Source pattern from the
 * v88 loader (line 5250) `const nonEmpty=...`. Kept available here for reuse. */
export function isNonEmpty(v: unknown): boolean {
  return v !== undefined && v !== null && String(v).trim() !== '';
}

/** Pick the first non-empty value among candidate field names. Same as the source's
 *  `first(obj, names, def)` helper (line 5251). */
export function firstNonEmpty<T = string>(
  obj: Record<string, unknown> | null | undefined,
  names: string[],
  fallback: T,
): T | unknown {
  if (!obj) return fallback;
  for (const n of names) {
    if (isNonEmpty(obj[n])) return obj[n] as unknown;
  }
  return fallback;
}

/**
 * Double-confirm for destructive (delete) actions. Shows the supplied warning
 * first, and only if the user accepts it shows a second "are you really sure"
 * confirmation. Returns true ONLY when both prompts are accepted.
 *
 * The second prompt's text is localized:
 *   - he (default): "האם את/ה בטוח/ה לחלוטין? פעולה זו אינה ניתנת לביטול."
 *   - ar:           "هل أنت متأكد تماماً؟ لا يمكن التراجع عن هذا الإجراء."
 */
export function confirmDeleteTwice(
  firstMessage: string,
  lang: 'he' | 'ar' = 'he',
): boolean {
  if (typeof window === 'undefined') return false;
  if (!window.confirm(firstMessage)) return false;
  const second =
    lang === 'ar'
      ? 'هل أنت متأكد تماماً؟ لا يمكن التراجع عن هذا الإجراء.'
      : 'האם את/ה בטוח/ה לחלוטין? פעולה זו אינה ניתנת לביטול.';
  return window.confirm(second);
}
