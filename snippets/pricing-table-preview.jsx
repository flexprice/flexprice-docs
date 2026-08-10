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
  const [hideFilters, setHideFilters] = useState(false)
  const [period, setPeriod] = useState('monthly')
  const plans = [
    { name: 'Starter', monthly: 0, yearly: 0, entitlements: ['3 seats', 'API access'] },
    { name: 'Pro', monthly: 49, yearly: 470, entitlements: ['20 seats', 'API access', '100K events / mo'] },
    { name: 'Business', monthly: 199, yearly: 1910, entitlements: ['Unlimited seats', 'Priority support'] },
  ]

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
              <ul style={{ listStyle: 'none', margin: '14px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plan.entitlements.map((e) => (
                  <li key={e} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: t.contentTertiary }}>
                    <span style={{ color: t.success }}>✓</span>
                    {e}
                  </li>
                ))}
              </ul>
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
