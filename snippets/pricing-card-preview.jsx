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
      iconMail: 'rgb(2 132 199)',
      iconMessage: 'rgb(124 58 237)',
      iconPhone: 'rgb(5 150 105)',
      iconZap: 'rgb(217 119 6)',
      iconGauge: 'rgb(79 70 229)',
      iconSparkles: 'rgb(5 150 105)',
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
      iconMail: 'rgb(56 169 232)',
      iconMessage: 'rgb(161 118 245)',
      iconPhone: 'rgb(46 200 148)',
      iconZap: 'rgb(232 154 60)',
      iconGauge: 'rgb(138 130 255)',
      iconSparkles: 'rgb(46 200 148)',
    },
  }
  const [mode, setMode] = useState('light')
  const t = FP_THEME[mode]
  const [modern, setModern] = useState(true)
  const [price, setPrice] = useState(49)
  const [playgroundOpen, setPlaygroundOpen] = useState(false)

  // Same shape the real component takes: { type, name, value }. The icon next to each row is
  // picked by `getEntitlementVisual(type, name)` in the real PricingCard — METERED entitlements
  // get a name-matched icon (email/sms/phone/api keywords), everything else gets a sparkle.
  const entitlements = [
    { type: 'STATIC', name: 'Team seats', value: '20' },
    { type: 'METERED', name: 'API requests', value: '100,000' },
    { type: 'METERED', name: 'Email sends', value: '5,000' },
    { type: 'METERED', name: 'Voice minutes', value: '1,000' },
  ]

  function entitlementIcon(type, name) {
    const n = name.toLowerCase()
    if (type === 'METERED') {
      if (n.includes('email') || n.includes('mail')) {
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.iconMail} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        )
      }
      if (n.includes('sms') || n.includes('chat') || n.includes('message')) {
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.iconMessage} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )
      }
      if (n.includes('phone') || n.includes('call') || n.includes('minute')) {
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.iconPhone} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        )
      }
      if (n.includes('api') || n.includes('request') || n.includes('agent')) {
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill={t.iconZap} stroke={t.iconZap} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        )
      }
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.iconGauge} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 14 4-4" />
          <path d="M3.34 19a10 10 0 1 1 17.32 0" />
        </svg>
      )
    }
    // Filled (not stroke-only) so it reads as a clear glyph at 16px instead of a faint outline
    // that can look like a stray dot next to the text.
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill={t.iconSparkles} stroke="none">
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .963L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      </svg>
    )
  }

  function entitlementLabel(e) {
    if (e.type === 'STATIC') return `${e.value} ${e.name}`
    if (e.type === 'METERED') return `${e.value} ${e.name}`
    return e.name
  }

  return (
    <div>
      {/* Preview: the real component, plus the Modern chrome / Classic toggle since that's a real
          documented prop (useModernChrome), not a playground affordance. No fake-data controls
          in here, so there's never a question of whether something on screen is part of
          PricingCard or not. */}
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
          minHeight: 420,
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
          {modern && (
            <p style={{ margin: '20px 0 10px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: t.contentMuted }}>
              Included
            </p>
          )}
          <div
            style={{
              margin: modern ? '0' : '28px 0 0',
              display: 'flex',
              flexDirection: 'column',
              gap: modern ? 10 : 14,
            }}
          >
            {entitlements.map((e) => (
              <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: modern ? 8 : 10, fontSize: modern ? 12 : 14, color: t.contentTertiary }}>
                {modern ? (
                  entitlementIcon(e.type, e.name)
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
                {entitlementLabel(e)}
              </div>
            ))}
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
        <div style={{ marginTop: 10, border: `1px solid ${t.line}`, borderRadius: 10, background: t.surface, padding: 16 }}>
          <label style={{ fontSize: 12, color: t.contentMuted, display: 'block' }}>
            Price: ${price}/month
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              style={{ width: '100%', marginTop: 6, accentColor: t.iconGauge }}
            />
          </label>
        </div>
      </details>
    </div>
  )
}
