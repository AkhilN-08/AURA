/**
 * Build marker — lets anyone instantly tell which deploy they're looking at.
 *
 * Vite gives every production bundle a content-hashed filename
 * (`index-nNXgXFOw.js`). We read it back from the script tag that actually
 * loaded the app, so the marker can never drift from what's really running —
 * cached old page = old hash, fresh deploy = new hash.
 *
 * In dev (no hashed bundle) it reports 'dev'.
 */
const cached = { value: '' as string }

export function buildVersion(): string {
  if (cached.value) return cached.value
  let v = 'dev'
  if (typeof document !== 'undefined') {
    const src =
      (document.querySelector('script[type="module"][src]') as HTMLScriptElement | null)?.src ??
      ''
    const m = src.match(/index-([A-Za-z0-9_-]+)\.js/)
    if (m) v = m[1].slice(0, 8)
  }
  cached.value = v
  return v
}
