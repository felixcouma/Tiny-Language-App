/*
 * Redraw the "Head, Shoulders, Knees and Toes" action poses as the SAME character
 * as public/images/song-ready.png (image-conditioning / anchor), so the benchmark
 * animation is one consistent toddler, not five different ones. Vertex image model.
 *
 *   export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/scripts/gcloud-sa-key.json"
 *   export VERTEX_PROJECT="gen-lang-client-0993546173"
 *   node scripts/gen-song-poses.mjs
 */
import { GoogleGenAI } from '@google/genai'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMG = path.join(__dirname, '..', 'public', 'images')
const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.VERTEX_PROJECT,
  location: process.env.VERTEX_LOCATION || 'global',
})
// Anchor on the optimized WebP (the PNG is removed after optimize-images).
const ANCHOR_MIME = 'image/webp'
const base = readFileSync(path.join(IMG, 'song-ready.webp')).toString('base64')
const extract = (r) => (r?.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData?.data)?.inlineData?.data
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const POSES = {
  // Body verse (already generated). Uncomment to re-run.
  // 'song-head': 'both arms raised, both hands placed flat on the top of their head',
  // 'song-shoulders': 'both hands placed on their own two shoulders',
  // 'song-knees': 'bending forward a little, both hands placed on their knees',
  // 'song-toes': 'bending all the way down, both hands touching their toes near the ground',
  // Face verse ("and eyes and ears and mouth and nose")
  'song-eyes': 'pointing to both of their two eyes with two index fingers, big smile',
  'song-ears': 'both hands cupping their two ears',
  'song-mouth': 'pointing to their open smiling mouth with one index finger',
  'song-nose': 'pointing to the tip of their nose with one index finger',
}

for (const [key, action] of Object.entries(POSES)) {
  const prompt =
    'Use the EXACT SAME cartoon toddler character shown in the reference image — identical ' +
    'face, skin tone, hairstyle and hair colour, teal t-shirt, mustard-yellow shorts, shoes, ' +
    'thick dark outlines and flat-vector children’s-book style. Redraw the very same child, ' +
    'whole body from head to feet, centered on a plain solid off-white background, now with ' +
    `${action}. Change ONLY the pose; keep every other detail of the character identical. No text.`
  try {
    const resp = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ role: 'user', parts: [{ inlineData: { mimeType: ANCHOR_MIME, data: base } }, { text: prompt }] }],
      config: { responseModalities: ['IMAGE'] },
    })
    const d = extract(resp)
    if (!d) throw new Error('no image data')
    writeFileSync(path.join(IMG, `${key}.png`), Buffer.from(d, 'base64'))
    console.log(`✓ ${key}.png`)
  } catch (e) {
    console.log(`✗ ${key} — ${String(e.message || e).slice(0, 140)}`)
  }
  await sleep(Number(process.env.PACE_MS || 30000))
}
console.log('done')
