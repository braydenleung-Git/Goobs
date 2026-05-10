export function AgentAvatar({ color, colors, size = 48 }: { color: string; colors?: { skin: string; shirt: string; pants: string }; size?: number }) {
  const c = colors ?? { skin: "#f5c2e7", shirt: color || "#89b4fa", pants: "#6c7086" }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <rect x="10" y="20" width="28" height="18" rx="6" fill={c.shirt} />
      <circle cx="24" cy="14" r="10" fill={c.skin} />
      <circle cx="19" cy="13" r="1.5" fill="#1e1e2e" />
      <circle cx="29" cy="13" r="1.5" fill="#1e1e2e" />
      <path d="M20 17 Q24 20 28 17" fill="none" stroke="#1e1e2e" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="12" y="36" width="24" height="8" rx="3" fill={c.pants} />
      <rect x="14" y="42" width="8" height="4" rx="2" fill={c.pants} />
      <rect x="26" y="42" width="8" height="4" rx="2" fill={c.pants} />
    </svg>
  )
}
