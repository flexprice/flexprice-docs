export const PricingTablePreview = () => {
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
  const [hideFilters, setHideFilters] = useState(false)
  const [period, setPeriod] = useState('monthly')

  // Same shape the real component takes: { type, name }. Icons are picked the same way the real
  // PricingCard does — METERED entitlements get a name-matched icon, everything else a sparkle.
  const plans = [
    {
      name: 'Starter',
      monthly: 0,
      yearly: 0,
      entitlements: [
        { type: 'STATIC', name: '3 seats' },
        { type: 'BOOLEAN', name: 'API access' },
      ],
    },
    {
      name: 'Pro',
      monthly: 49,
      yearly: 470,
      entitlements: [
        { type: 'STATIC', name: '20 seats' },
        { type: 'METERED', name: 'API requests' },
        { type: 'METERED', name: 'Email sends' },
      ],
    },
    {
      name: 'Business',
      monthly: 199,
      yearly: 1910,
      entitlements: [
        { type: 'BOOLEAN', name: 'Unlimited seats' },
        { type: 'METERED', name: 'Voice minutes' },
        { type: 'BOOLEAN', name: 'Priority support' },
      ],
    },
  ]

  function entitlementIcon(type, name) {
    const n = name.toLowerCase()
    if (type === 'METERED') {
      if (n.includes('email') || n.includes('mail')) {
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.iconMail} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        )
      }
      if (n.includes('sms') || n.includes('chat') || n.includes('message')) {
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.iconMessage} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )
      }
      if (n.includes('phone') || n.includes('call') || n.includes('minute')) {
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.iconPhone} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        )
      }
      if (n.includes('api') || n.includes('request') || n.includes('agent')) {
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill={t.iconZap} stroke={t.iconZap} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        )
      }
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.iconGauge} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 14 4-4" />
          <path d="M3.34 19a10 10 0 1 1 17.32 0" />
        </svg>
      )
    }
    // Filled (not stroke-only) so it reads as a clear glyph instead of a faint outline that can
    // look like a stray dot next to the text.
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill={t.iconSparkles} stroke="none">
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .963L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      </svg>
    )
  }

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
            { key: false, label: 'With filters' },
            { key: true, label: 'hideFilters' },
          ].map((opt) => (
            <button
              key={String(opt.key)}
              onClick={() => setHideFilters(opt.key)}
              style={{
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                background: hideFilters === opt.key ? t.content : 'transparent',
                color: hideFilters === opt.key ? t.surface : t.contentMuted,
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
        {!hideFilters && (
          <div style={{ display: 'inline-flex', border: `1px solid ${t.line}`, borderRadius: 10, padding: 2, marginBottom: 20 }}>
            {['monthly', 'yearly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  fontSize: 12,
                  padding: '4px 12px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: period === p ? t.surfaceCool : 'transparent',
                  color: t.content,
                  textTransform: 'capitalize',
                  boxShadow: period === p ? `inset 0 0 0 1px ${t.lineStrong}` : 'none',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                border: `1px solid ${t.lineStrong}`,
                borderRadius: 16,
                padding: 18,
                background: `linear-gradient(180deg, ${t.surface}, ${t.surfaceCool})`,
                width: 170,
              }}
            >
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 300, color: t.content }}>{plan.name}</h4>
              <div style={{ marginTop: 14 }}>
                <span style={{ fontSize: 22, fontWeight: 400, color: t.content }}>${plan[period]}</span>
                <span style={{ marginLeft: 4, fontSize: 11, color: t.contentMuted }}>/{period === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              <button
                style={{
                  marginTop: 14,
                  width: '100%',
                  padding: '8px 0',
                  borderRadius: 10,
                  border: `1px solid ${t.lineStrong}`,
                  background: t.surface,
                  color: t.content,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                View plan
              </button>
              <div style={{ margin: '14px 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plan.entitlements.map((e) => (
                  <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: t.contentTertiary }}>
                    {entitlementIcon(e.type, e.name)}
                    {e.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {hideFilters && (
          <p style={{ marginTop: 16, fontSize: 11, color: t.contentMuted, textAlign: 'center', maxWidth: 320 }}>
            With <code>hideFilters</code>, the period/currency controls are hidden — place your own selectors in the page header instead.
          </p>
        )}
      </div>
    </div>
  )
}
