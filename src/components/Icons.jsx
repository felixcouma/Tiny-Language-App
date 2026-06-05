/* Inline SVG icons — no emoji, crisp at any size. Inherit color via currentColor. */
const S = ({ children, size = 24, vb = 24, ...p }) => (
  <svg
    viewBox={`0 0 ${vb} ${vb}`}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    {children}
  </svg>
)

export const HomeIcon = (p) => (
  <S {...p}>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h14V10" />
    <path d="M9 20v-6h6v6" />
  </S>
)

export const ReplayIcon = (p) => (
  <S {...p}>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </S>
)

export const SpeakerIcon = (p) => (
  <S {...p}>
    <path d="M4 9v6h4l5 4V5L8 9H4z" />
    <path d="M16 8a5 5 0 0 1 0 8" />
    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
  </S>
)

export const SpeakerMuteIcon = (p) => (
  <S {...p}>
    <path d="M4 9v6h4l5 4V5L8 9H4z" />
    <path d="M22 9l-6 6" />
    <path d="M16 9l6 6" />
  </S>
)

export const PlayIcon = (p) => (
  <S fill="currentColor" stroke="none" {...p}>
    <path d="M7 5l12 7-12 7V5z" />
  </S>
)

export const StopIcon = (p) => (
  <S fill="currentColor" stroke="none" {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2.5" />
  </S>
)

export const ArrowLeftIcon = (p) => (
  <S {...p}>
    <path d="M15 5l-7 7 7 7" />
  </S>
)

export const ArrowRightIcon = (p) => (
  <S {...p}>
    <path d="M9 5l7 7-7 7" />
  </S>
)
