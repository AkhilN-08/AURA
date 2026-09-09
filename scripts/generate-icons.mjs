/**
 * AURA PWA icon generator — zero dependencies.
 *
 * Draws the AURA wordmark (rounded monoline strokes) + a small sage leaf
 * on warm ivory, using analytic signed-distance rasterization, then
 * encodes PNGs with Node's built-in zlib. Regenerate:
 *
 *   node scripts/generate-icons.mjs
 *
 * Deliberately NOT a brain/robot/sparkle icon — the brand is the word itself.
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')
mkdirSync(OUT, { recursive: true })

// ── tiny PNG encoder (RGBA, no filtering) ─────────────────────────
function crc32(buf) {
  let table = crc32.table
  if (!table) {
    table = crc32.table = new Int32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
      table[n] = c
    }
  }
  let c = -1
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8; ihdr[9] = 6 // 8-bit RGBA
  // raw scanlines with filter byte 0
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

// ── signed-distance helpers (all coords in a 512-unit space) ──────
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const mix = (a, b, t) => a + (b - a) * t

function sdSegment(px, py, ax, ay, bx, by) {
  const pax = px - ax, pay = py - ay
  const bax = bx - ax, bay = by - ay
  const h = clamp((pax * bax + pay * bay) / (bax * bax + bay * bay || 1), 0, 1)
  const dx = pax - bax * h, dy = pay - bay * h
  return Math.hypot(dx, dy)
}

// quadratic bezier distance via subsampling (accurate enough at icon scale)
function sdQuad(px, py, ax, ay, cx, cy, bx, by) {
  let best = Infinity
  const N = 24
  let prevX = ax, prevY = ay
  for (let i = 1; i <= N; i++) {
    const t = i / N
    const u = 1 - t
    const x = u * u * ax + 2 * u * t * cx + t * t * bx
    const y = u * u * ay + 2 * u * t * cy + t * t * by
    best = Math.min(best, sdSegment(px, py, prevX, prevY, x, y))
    prevX = x; prevY = y
  }
  return best
}

// leaf: two arcs meeting at tip
function sdLeaf(px, py, ax, ay, tipX, tipY, width) {
  const mx = (ax + tipX) / 2, my = (ay + tipY) / 2
  const nx = -(tipY - ay), ny = tipX - ax
  const nl = Math.hypot(nx, ny) || 1
  const c1x = mx + (nx / nl) * width, c1y = my + (ny / nl) * width
  const c2x = mx - (nx / nl) * width, c2y = my - (ny / nl) * width
  return Math.min(sdQuad(px, py, ax, ay, c1x, c1y, tipX, tipY), sdQuad(px, py, ax, ay, c2x, c2y, tipX, tipY))
}

// circle ring
function sdRing(px, py, cx, cy, r, halfW) {
  return Math.abs(Math.hypot(px - cx, py - cy) - r) - halfW
}

// ── the AURA monoline letterforms (mirrors AuraWordmark.tsx) ──────
// stroke list: [type, ...params]; drawn with round caps
const STROKES = [
  // A — apex + two legs (as one flowing polyline via 2 quads)
  { kind: 'seg', a: [76, 356], b: [128, 132] },
  { kind: 'seg', a: [128, 132], b: [180, 356] },
  { kind: 'seg', a: [100, 272], b: [156, 272] },
  // U
  { kind: 'seg', a: [216, 128], b: [216, 288] },
  { kind: 'quad', a: [216, 288], c: [248, 372], b: [280, 288] },
  { kind: 'seg', a: [280, 288], b: [280, 128] },
  // R
  { kind: 'seg', a: [316, 356], b: [316, 128] },
  { kind: 'quad', a: [316, 128], c: [376, 128], b: [376, 190] },
  { kind: 'quad', a: [376, 190], c: [376, 252], b: [316, 252] },
  { kind: 'seg', a: [340, 252], b: [392, 356] },
  // final A
  { kind: 'seg', a: [404, 356], b: [440, 200] },
  { kind: 'seg', a: [440, 200], b: [476, 356] },
  { kind: 'seg', a: [424, 296], b: [456, 296] },
]

function strokeDist(px, py) {
  let d = Infinity
  for (const s of STROKES) {
    if (s.kind === 'seg') d = Math.min(d, sdSegment(px, py, s.a[0], s.a[1], s.b[0], s.b[1]))
    else d = Math.min(d, sdQuad(px, py, s.a[0], s.a[1], s.c[0], s.c[1], s.b[0], s.b[1]))
  }
  return d
}

// palette — warm ivory paper, deep ink, sage leaf, soft rose sun
const PAPER = [253, 249, 240]
const INK = [47, 42, 36]
const SAGE = [124, 154, 109]
const ROSE = [217, 138, 158]

function drawIcon(size, { maskable = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4)
  const S = 512 / size // design units per device pixel
  const halfW = 26 // monoline weight in DESIGN units (px loop is design-space)

  // maskable keeps all content inside the inner 80% safe zone
  const sc = maskable ? 0.72 : 0.86
  const cx = 256, cy = 256
  const map = (x, y) => [cx + (x - cx) * sc, cy + (y - cy) * sc]

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = (x + 0.5) * S, py = (y + 0.5) * S
      let r = PAPER[0], g = PAPER[1], b = PAPER[2]

      // soft rose sun, top right
      const sunD = Math.hypot(px - 400, py - 120) - 70
      if (sunD < 0) {
        const t = clamp(-sunD / 70, 0, 1)
        r = mix(r, ROSE[0], 0.35 * (1 - t) + 0.08)
        g = mix(g, ROSE[1], 0.35 * (1 - t) + 0.08)
        b = mix(b, ROSE[2], 0.35 * (1 - t) + 0.08)
      }

      // ink strokes first
      let ink = Infinity
      for (const s of STROKES) {
        let d
        if (s.kind === 'seg') d = sdSegment(px, py, map(s.a[0], s.a[1])[0], map(s.a[0], s.a[1])[1], map(s.b[0], s.b[1])[0], map(s.b[0], s.b[1])[1])
        else d = sdQuad(px, py, map(s.a[0], s.a[1])[0], map(s.a[0], s.a[1])[1], map(s.c[0], s.c[1])[0], map(s.c[0], s.c[1])[1], map(s.b[0], s.b[1])[0], map(s.b[0], s.b[1])[1])
        ink = Math.min(ink, d)
      }
      if (ink < halfW) {
        const edge = clamp((halfW - ink) / (1.5 * S), 0, 1) // AA edge
        r = mix(r, INK[0], edge)
        g = mix(g, INK[1], edge)
        b = mix(b, INK[2], edge)
      }

      // sage leaf sprouting from the first A's crossbar, drawn over ink
      const [ax, ay] = map(150, 268)
      const [tx, ty] = map(226, 186)
      const leafD = sdLeaf(px, py, ax, ay, tx, ty, 30 * sc)
      if (leafD < halfW * 0.62) {
        r = SAGE[0]; g = SAGE[1]; b = SAGE[2]
      }

      const i = (y * size + x) * 4
      rgba[i] = Math.round(r)
      rgba[i + 1] = Math.round(g)
      rgba[i + 2] = Math.round(b)
      rgba[i + 3] = 255
    }
  }
  return encodePNG(size, size, rgba)
}

function drawFavicon(size) {
  // favicon: just the letter A in ink with a small sage sprout
  const rgba = Buffer.alloc(size * size * 4)
  const S = 512 / size
  const halfW = 38 // design units
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = (x + 0.5) * S, py = (y + 0.5) * S
      let r = PAPER[0], g = PAPER[1], b = PAPER[2]
      const legs = Math.min(
        sdSegment(px, py, 150, 380, 256, 110),
        sdSegment(px, py, 256, 110, 362, 380),
        sdSegment(px, py, 190, 300, 322, 300)
      )
      if (legs < halfW) {
        const edge = clamp((halfW - legs) / (1.5 * S), 0, 1)
        r = mix(r, INK[0], edge); g = mix(g, INK[1], edge); b = mix(b, INK[2], edge)
      }
      // small sprout from the crossbar, to the right
      const leafD = sdLeaf(px, py, 300, 296, 388, 196, 34)
      if (leafD < halfW * 0.55) {
        r = SAGE[0]; g = SAGE[1]; b = SAGE[2]
      }
      const i = (y * size + x) * 4
      rgba[i] = Math.round(r); rgba[i + 1] = Math.round(g); rgba[i + 2] = Math.round(b); rgba[i + 3] = 255
    }
  }
  return encodePNG(size, size, rgba)
}

const files = [
  ['pwa-192.png', drawIcon(192)],
  ['pwa-512.png', drawIcon(512)],
  ['pwa-maskable-192.png', drawIcon(192, { maskable: true })],
  ['pwa-maskable-512.png', drawIcon(512, { maskable: true })],
  ['apple-touch-icon.png', drawIcon(180)],
  ['favicon-32.png', drawFavicon(32)],
]
for (const [name, buf] of files) {
  writeFileSync(join(OUT, name), buf)
  console.log('✓', name, (buf.length / 1024).toFixed(1) + 'KB')
}
console.log('Icons written to public/icons/')
