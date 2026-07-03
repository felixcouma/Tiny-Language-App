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
  // "Head, Shoulders" verses — already generated (kept for reference):
  //   song-head/shoulders/knees/toes, song-eyes/ears/mouth/nose
  // "I'm a Little Teapot" poses (same child role-playing a teapot):
  'song-teapot-handle': 'standing, one arm bent with that hand on their hip to make a teapot HANDLE shape, big happy smile',
  'song-teapot-spout': 'standing, one hand on their hip (the handle) and the OTHER arm stretched straight out to the side, hand bent upward at the wrist like a teapot SPOUT',
  'song-teapot-tip': 'leaning their whole body over to one side like a teapot tipping to pour, one arm raised and angled downward like a pouring spout, the other hand on the hip',
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
