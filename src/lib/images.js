/*
 * Real-photo resolver. No emoji, ever.
 *
 * Provider order:
 *   1. item.image            — explicit override URL (highest quality control)
 *   2. Unsplash / Pexels     — IF an API key is set (see .env.example); curated, gorgeous
 *   3. Wikimedia summary     — keyless, CORS-enabled, friendly representative photo
 *
 * Results are cached in localStorage so each item resolves once per device.
 * If everything fails, returns null and the UI shows a clean typographic card
 * (never a broken image, never an emoji).
 */

// v3: bump again after converting the bundled illustrations to WebP and deleting
// the PNGs, so returning visitors re-resolve to the .webp (their cached .png
// URLs would now 404 and fall back to the typographic card).
const LS_KEY = 'tv_img_cache_v3'
const mem = (() => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}')
  } catch {
    return {}
  }
})()

function remember(key, url) {
  mem[key] = url
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(mem))
  } catch {
    /* storage full / private mode — ignore */
  }
}

// Optional keys (Vite exposes import.meta.env.VITE_*). Empty by default.
const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY || ''
const PEXELS_KEY = import.meta.env.VITE_PEXELS_KEY || ''

// Bump a Wikimedia thumbnail to a crisper width (…/320px-Name.jpg → …/640px-…).
function upscaleWiki(url) {
  return url.replace(/\/\d+px-/, '/640px-')
}

async function fromWikimedia(title) {
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    { headers: { Accept: 'application/json' } },
  )
  if (!res.ok) return null
  const data = await res.json()
  if (data.type === 'disambiguation') return null
  const thumb = data.thumbnail && data.thumbnail.source
  if (thumb) return upscaleWiki(thumb)
  if (data.originalimage && data.originalimage.source) return data.originalimage.source
  return null
}

async function fromUnsplash(query) {
  const res = await fetch(
    `https://api.unsplash.com/search/photos?per_page=1&orientation=squarish&content_filter=high&query=${encodeURIComponent(
      query,
    )}&client_id=${UNSPLASH_KEY}`,
  )
  if (!res.ok) return null
  const data = await res.json()
  const first = data.results && data.results[0]
  return first ? `${first.urls.raw}&w=640&h=640&fit=crop` : null
}

async function fromPexels(query) {
  const res = await fetch(
    `https://api.pexels.com/v1/search?per_page=1&size=medium&query=${encodeURIComponent(query)}`,
    { headers: { Authorization: PEXELS_KEY } },
  )
  if (!res.ok) return null
  const data = await res.json()
  const first = data.photos && data.photos[0]
  return first ? first.src.large : null
}

// Bundled illustration shipped in public/images/<key>.<ext> (e.g. from nano-banana).
// This is the highest-quality, on-brand, offline source when present.
const BASE = import.meta.env.BASE_URL || '/'
const LOCAL_EXTS = ['webp', 'png', 'jpg'] // prefer optimized WebP when present
async function fromLocal(key) {
  if (!key) return null
  for (const ext of LOCAL_EXTS) {
    const url = `${BASE}images/${key}.${ext}`
    try {
      const res = await fetch(url, { method: 'HEAD' })
      // Must be a real image — the Vite dev server (and SPA hosts) answer 200 with
      // index.html for missing paths, so check the content-type, not just res.ok.
      const type = res.headers.get('content-type') || ''
      if (res.ok && type.startsWith('image/')) return url
    } catch {
      /* keep trying */
    }
  }
  return null
}

/**
 * Resolve a real image URL for an item, or null.
 * Order: explicit override → bundled illustration → Unsplash/Pexels → Wikimedia.
 * @param {{word:string, wiki?:string, image?:string, imageQuery?:string, sound?:string}} item
 */
export async function resolveImage(item) {
  if (item.image) return item.image
  const query = item.imageQuery || item.wiki || item.word
  const key = (item.wiki || item.word).toLowerCase()

  if (key in mem) return mem[key] // cached (may be null → typographic card)

  let url = null
  try {
    url = await fromLocal(item.sound) // bundled illustration first
    if (!url && UNSPLASH_KEY) url = await fromUnsplash(query)
    if (!url && PEXELS_KEY) url = await fromPexels(query)
    if (!url) url = await fromWikimedia(item.wiki || item.word)
  } catch {
    url = null
  }
  remember(key, url)
  return url
}
