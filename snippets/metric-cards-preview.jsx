export const MetricCardsPreview = () => {
  const FP_THEME = {
    light: {
      surfaceCanvas: 'rgb(255 255 255)',
      surface: 'rgb(255 255 255)',
      content: 'rgb(17 24 39)',
      contentTertiary: 'rgb(75 85 99)',
      contentMuted: 'rgb(107 114 128)',
      line: 'rgb(229 231 235)',
      success: 'rgb(22 163 74)',
      danger: 'rgb(220 38 38)',
      accent: 'rgb(79 70 229)',
    },
    dark: {
      surfaceCanvas: 'rgb(24 24 24)',
      surface: 'rgb(29 29 31)',
      content: 'rgb(238 239 241)',
      contentTertiary: 'rgb(169 173 182)',
      contentMuted: 'rgb(138 143 152)',
      line: 'rgb(41 41 46)',
      success: 'rgb(46 200 148)',
      danger: 'rgb(232 100 100)',
      accent: 'rgb(138 130 255)',
    },
  }
  const [mode, setMode] = useState('light')
  const t = FP_THEME[mode]
  const [revenue, setRevenue] = useState(48250.75)
  const [cost, setCost] = useState(12180.4)
  const [customers, setCustomers] = useState(214)
  const [playgroundOpen, setPlaygroundOpen] = useState(false)
  const margin = revenue - cost
  const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0

  // Same shape as the real component: { titleKey/customLabel, value, isPercent, showChangeIndicator,
  // isNegative }. Data scaled to the demo fixtures in the example app's src/demoData.ts.
  const cards = [
    { label: 'Revenue', value: `$${revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, showChangeIndicator: true, isNegative: false },
    { label: 'Cost', value: `$${cost.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, showChangeIndicator: true, isNegative: true },
    { label: 'Margin', value: `$${margin.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, showChangeIndicator: true, isNegative: margin < 0 },
    { label: 'Margin %', value: `${marginPercent.toFixed(1)}%`, showChangeIndicator: true, isNegative: marginPercent < 0 },
    { label: 'Active customers', value: customers.toLocaleString(), showChangeIndicator: true, isNegative: false },
  ]

  const sliderStyle = { width: '100%', marginTop: 6, accentColor: t.accent }
  const labelStyle = { fontSize: 12, color: t.contentTertiary, display: 'block' }

  return (
    <div>
      {/* Preview: the real component only. No playground controls in here, so there's never a
          question of whether something on screen is part of MetricCards or not. */}
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
          minHeight: 340,
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, width: '100%', maxWidth: 380 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ border: `1px solid ${t.line}`, borderRadius: 6, padding: 16, background: t.surface }}>
            <div style={{ fontSize: 12, color: t.contentTertiary, marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: t.content, display: 'flex', alignItems: 'center' }}>
              {c.value}
              {c.showChangeIndicator && (
                <span style={{ display: 'inline-flex', marginLeft: 10, color: c.isNegative ? t.danger : t.success }}>
                  {c.isNegative ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
                      <polyline points="16 17 22 17 22 11" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                      <polyline points="16 7 22 7 22 13" />
                    </svg>
                  )}
                </span>
              )}
            </div>
          </div>
        ))}
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
          <label style={labelStyle}>
            Revenue: ${revenue.toLocaleString()}
            <input type="range" min="0" max="80000" step="250" value={revenue} onChange={(e) => setRevenue(Number(e.target.value))} style={sliderStyle} />
          </label>
          <label style={labelStyle}>
            Cost: ${cost.toLocaleString()}
            <input type="range" min="0" max="40000" step="100" value={cost} onChange={(e) => setCost(Number(e.target.value))} style={sliderStyle} />
          </label>
          <label style={labelStyle}>
            Active customers: {customers.toLocaleString()}
            <input type="range" min="0" max="1000" step="1" value={customers} onChange={(e) => setCustomers(Number(e.target.value))} style={sliderStyle} />
          </label>
        </div>
      </details>
    </div>
  )
}
