/* Pip the frog — TinyVoice's cheerful mascot. Pure SVG, no assets. */
export default function Mascot({ size = 84 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className="mascot">
      {/* body */}
      <ellipse cx="50" cy="64" rx="34" ry="30" fill="#79c64a" />
      <ellipse cx="50" cy="72" rx="22" ry="16" fill="#bfe89a" />
      {/* eye bumps */}
      <circle cx="34" cy="34" r="16" fill="#79c64a" />
      <circle cx="66" cy="34" r="16" fill="#79c64a" />
      {/* eyes */}
      <circle cx="34" cy="33" r="11" fill="#fff" />
      <circle cx="66" cy="33" r="11" fill="#fff" />
      <circle cx="36" cy="35" r="5.5" fill="#2c3e50" />
      <circle cx="64" cy="35" r="5.5" fill="#2c3e50" />
      <circle cx="38" cy="33" r="1.8" fill="#fff" />
      <circle cx="66" cy="33" r="1.8" fill="#fff" />
      {/* cheeks */}
      <circle cx="28" cy="58" r="6" fill="#f7a8b8" opacity="0.8" />
      <circle cx="72" cy="58" r="6" fill="#f7a8b8" opacity="0.8" />
      {/* smile */}
      <path d="M34 56 Q50 70 66 56" stroke="#2c3e50" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    </svg>
  )
}
