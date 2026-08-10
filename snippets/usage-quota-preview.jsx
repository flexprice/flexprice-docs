export const UsageQuotaPreview = () => {
  const FP_THEME = {
    light: {
      surfaceCanvas: 'rgb(255 255 255)',
      surface: 'rgb(255 255 255)',
      surfaceMuted: 'rgb(244 244 245)',
      content: 'rgb(17 24 39)',
      contentSecondary: 'rgb(55 65 81)',
      contentMuted: 'rgb(107 114 128)',
      contentTertiary: 'rgb(75 85 99)',
      line: 'rgb(229 231 235)',
      destructive: 'hsl(0 84.2% 60.2%)',
      brand: 'hsl(201 77% 15%)',
    },
    dark: {
      surfaceCanvas: 'rgb(24 24 24)',
      surface: 'rgb(29 29 31)',
      surfaceMuted: 'rgb(37 37 40)',
      content: 'rgb(238 239 241)',
      contentSecondary: 'rgb(208 210 215)',
      contentMuted: 'rgb(138 143 152)',
      contentTertiary: 'rgb(169 173 182)',
      line: 'rgb(41 41 46)',
      destructive: 'hsl(0 65% 55%)',
      brand: 'hsl(356 56% 60%)',
    },
  }
  const [mode, setMode] = useState('light')
  const t = FP_THEME[mode]
  const [used, setUsed] = useState(720)
  const [limit, setLimit] = useState(1000)
  const [unlimited, setUnlimited] = useState(false)

  const percentage = unlimited ? 0 : Math.min(Math.ceil((used / limit) * 100), 100)
  const isOverLimit = !unlimited && used > limit

  return (
    <div>
      <div
        style={{
          position: 'relative',
          border: `1px solid ${t.line}`,
          borderRadius: 12,
          background: t.surfaceCanvas,
          padding: '80px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 420,
        }}
      >
        <button
          onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          aria-label="Toggle theme"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: `1px solid ${t.line}`,
            background: t.surface,
            color: t.contentTertiary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {mode === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          )}
        </button>
        <div style={{ border: `1px solid ${t.line}`, borderRadius: 12, overflow: 'hidden', background: t.surface, width: 340 }}>
          <div style={{ padding: 20, borderBottom: `1px solid ${t.line}` }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 500, color: t.content }}>Usage Quota</h3>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: t.content }}>API Calls</span>
              <span style={{ fontSize: 13, color: t.contentMuted }}>
                {used.toLocaleString()} / {unlimited ? 'Unlimited' : limit.toLocaleString()}
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: t.surfaceMuted, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: unlimited ? '0%' : `${percentage}%`,
                  borderRadius: 999,
                  background: isOverLimit ? t.destructive : t.brand,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 340 }}>
        <label style={{ fontSize: 12, color: t.contentMuted }}>
          Used: {used.toLocaleString()}
          <input type="range" min="0" max="1500" value={used} onChange={(e) => setUsed(Number(e.target.value))} style={{ width: '100%', marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 12, color: t.contentMuted }}>
          Limit: {limit.toLocaleString()}
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={limit}
            disabled={unlimited}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{ width: '100%', marginTop: 4, opacity: unlimited ? 0.4 : 1 }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: t.contentMuted }}>
          <input type="checkbox" checked={unlimited} onChange={(e) => setUnlimited(e.target.checked)} />
          Unlimited
        </label>
      </div>
    </div>
  )
}
