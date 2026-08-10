export const PricingCardPreview = () => {
  const FP_THEME = {
    light: {
      surfaceCanvas: 'rgb(255 255 255)',
      surface: 'rgb(255 255 255)',
      surfaceCool: 'rgb(248 250 252)',
      content: 'rgb(17 24 39)',
      contentTertiary: 'rgb(75 85 99)',
      contentMuted: 'rgb(107 114 128)',
      line: 'rgb(229 231 235)',
      lineStrong: 'rgb(209 213 219)',
      success: 'hsl(142 76% 36%)',
    },
    dark: {
      surfaceCanvas: 'rgb(24 24 24)',
      surface: 'rgb(29 29 31)',
      surfaceCool: 'rgb(26 26 29)',
      content: 'rgb(238 239 241)',
      contentTertiary: 'rgb(169 173 182)',
      contentMuted: 'rgb(138 143 152)',
      line: 'rgb(41 41 46)',
      lineStrong: 'rgb(53 53 59)',
      success: 'hsl(142 55% 52%)',
    },
  }
  const [mode, setMode] = useState('light')
  const t = FP_THEME[mode]
  const [modern, setModern] = useState(true)
  const [price, setPrice] = useState(49)
  const entitlements = ['20 team seats', 'API access', '100,000 events / mo']

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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 460,
        }}
      >
        <div style={{ position: 'absolute', top: 16, left: 16, display: 'inline-flex', border: `1px solid ${t.line}`, borderRadius: 999, padding: 2 }}>
          {[
            { key: true, label: 'Modern chrome' },
            { key: false, label: 'Classic' },
          ].map((opt) => (
            <button
              key={String(opt.key)}
              onClick={() => setModern(opt.key)}
              style={{
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                background: modern === opt.key ? t.content : 'transparent',
                color: modern === opt.key ? t.surface : t.contentMuted,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
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
        <div
          style={{
            border: `1px solid ${modern ? t.lineStrong : t.line}`,
            borderRadius: modern ? 16 : 24,
            padding: modern ? 20 : 28,
            background: modern ? `linear-gradient(180deg, ${t.surface}, ${t.surfaceCool})` : t.surface,
            width: 260,
          }}
        >
          <h3 style={{ margin: 0, fontSize: modern ? 18 : 20, fontWeight: 300, color: t.content }}>Pro</h3>
          <div style={{ marginTop: modern ? 20 : 24 }}>
            <span style={{ fontSize: modern ? 28 : 34, fontWeight: 400, color: t.content }}>${price}</span>
            <span style={{ marginLeft: 6, fontSize: 12, color: t.contentMuted }}>/month</span>
          </div>
          <button
            style={{
              marginTop: modern ? 20 : 24,
              width: '100%',
              padding: '10px 0',
              borderRadius: modern ? 12 : 16,
              border: `1px solid ${t.lineStrong}`,
              background: modern ? t.surface : t.surfaceCool,
              color: t.content,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            View plan
          </button>
          <ul style={{ listStyle: 'none', margin: modern ? '20px 0 0' : '28px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: modern ? 12 : 14 }}>
            {entitlements.map((e) => (
              <li key={e} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: modern ? 13 : 14, color: t.contentTertiary }}>
                <span style={{ color: t.success }}>✓</span>
                {e}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div style={{ marginTop: 16, maxWidth: 260 }}>
        <label style={{ fontSize: 12, color: t.contentMuted }}>
          Price: ${price}/month
          <input type="range" min="0" max="500" step="10" value={price} onChange={(e) => setPrice(Number(e.target.value))} style={{ width: '100%', marginTop: 4 }} />
        </label>
      </div>
    </div>
  )
}
