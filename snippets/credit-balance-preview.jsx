export const CreditBalancePreview = () => {
  const FP_THEME = {
    light: {
      surfaceCanvas: 'rgb(255 255 255)',
      surface: 'rgb(255 255 255)',
      content: 'rgb(17 24 39)',
      contentMuted: 'rgb(107 114 128)',
      contentTertiary: 'rgb(75 85 99)',
      line: 'rgb(229 231 235)',
      accentIndigo: 'rgb(79 70 229)',
      accentIndigoMuted: 'rgb(238 242 255)',
      success: 'hsl(142 76% 36%)',
      warning: 'hsl(21 90% 48%)',
      destructive: 'hsl(0 84.2% 60.2%)',
    },
    dark: {
      surfaceCanvas: 'rgb(24 24 24)',
      surface: 'rgb(29 29 31)',
      content: 'rgb(238 239 241)',
      contentMuted: 'rgb(138 143 152)',
      contentTertiary: 'rgb(169 173 182)',
      line: 'rgb(41 41 46)',
      accentIndigo: 'rgb(138 130 255)',
      accentIndigoMuted: 'rgb(27 27 58)',
      success: 'hsl(142 55% 52%)',
      warning: 'hsl(30 90% 58%)',
      destructive: 'hsl(0 65% 55%)',
    },
  }
  const [mode, setMode] = useState('light')
  const t = FP_THEME[mode]
  // Same scale as the example app's demo fixture (src/demoData.ts): "Primary Wallet", 12,500 credits.
  const [balance, setBalance] = useState(12500)
  const [status, setStatus] = useState('active')
  const [playgroundOpen, setPlaygroundOpen] = useState(false)
  const statusColors = { active: t.success, frozen: t.warning, closed: t.destructive }

  const sliderStyle = { width: '100%', marginTop: 6, accentColor: t.accentIndigo }

  return (
    <div>
      {/* Preview: the real component only. No playground controls in here, so there's never a
          question of whether something on screen is part of CreditBalance or not. */}
      <div
        style={{
          position: 'relative',
          border: `1px solid ${t.line}`,
          borderRadius: 12,
          background: t.surfaceCanvas,
          padding: '64px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: 300,
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

      <div style={{ border: `1px solid ${t.line}`, borderRadius: 12, overflow: 'hidden', background: t.surface, width: '100%', maxWidth: 340 }}>
        <div style={{ padding: 20, borderBottom: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: t.accentIndigoMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              color: t.accentIndigo,
            }}
          >
            $
          </div>
          <div>
            <div style={{ fontSize: 14, color: t.content }}>Primary Wallet</div>
            <span
              style={{
                fontSize: 10,
                textTransform: 'uppercase',
                color: statusColors[status],
                border: `1px solid ${statusColors[status]}`,
                borderRadius: 999,
                padding: '1px 8px',
              }}
            >
              {status}
            </span>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: t.contentMuted, marginBottom: 6 }}>Balance</div>
          <div style={{ fontSize: 28, fontWeight: 600, color: t.content }}>
            {balance.toLocaleString()} <span style={{ fontSize: 14, fontWeight: 400, color: t.contentMuted }}>credits</span>
          </div>
          <div style={{ fontSize: 12, color: t.contentMuted, marginTop: 4 }}>${(balance / 10).toFixed(2)} value</div>
        </div>
      </div>
      </div>

      {/* Playground: collapsed by default, visually and structurally separate from the preview
          above (own box, own border) so it never reads as part of the component itself. */}
      <details open={playgroundOpen} onToggle={(e) => setPlaygroundOpen(e.target.open)} style={{ marginTop: 12 }}>
        <style>{`summary::-webkit-details-marker { display: none; }`}</style>
        <summary
          style={{
            listStyle: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            border: `1px solid ${t.line}`,
            borderRadius: 8,
            background: t.surface,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.contentMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            {playgroundOpen ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: t.content }}>Try it yourself</span>
            <span style={{ fontSize: 11, color: t.contentMuted, fontWeight: 400 }}>Preview controls</span>
          </div>
        </summary>
        <div style={{ marginTop: 10, border: `1px solid ${t.line}`, borderRadius: 10, background: t.surface, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ fontSize: 12, color: t.contentMuted, display: 'block' }}>
            Balance: {balance.toLocaleString()}
            <input type="range" min="0" max="30000" step="100" value={balance} onChange={(e) => setBalance(Number(e.target.value))} style={sliderStyle} />
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['active', 'frozen', 'closed'].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={{
                  fontSize: 11,
                  color: s === status ? t.surface : t.content,
                  background: s === status ? t.content : 'transparent',
                  border: `1px solid ${t.line}`,
                  borderRadius: 6,
                  padding: '4px 10px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </details>
    </div>
  )
}
