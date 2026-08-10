export const MetricCardsPreview = () => {
  const FP_THEME = {
    light: { surfaceCanvas: 'rgb(255 255 255)', surface: 'rgb(255 255 255)', content: 'rgb(17 24 39)', contentTertiary: 'rgb(75 85 99)', line: 'rgb(229 231 235)' },
    dark: { surfaceCanvas: 'rgb(24 24 24)', surface: 'rgb(29 29 31)', content: 'rgb(238 239 241)', contentTertiary: 'rgb(169 173 182)', line: 'rgb(41 41 46)' },
  }
  const [mode, setMode] = useState('light')
  const t = FP_THEME[mode]
  const [revenue, setRevenue] = useState(12500)
  const [cost, setCost] = useState(4200)
  const margin = revenue - cost
  const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0

  const cards = [
    { label: 'Revenue', value: `$${revenue.toLocaleString()}` },
    { label: 'Cost', value: `$${cost.toLocaleString()}` },
    { label: 'Margin', value: `$${margin.toLocaleString()}` },
    { label: 'Margin %', value: `${marginPercent.toFixed(1)}%` },
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, width: 340 }}>
          {cards.map((c) => (
            <div key={c.label} style={{ border: `1px solid ${t.line}`, borderRadius: 6, padding: 16, background: t.surface }}>
              <div style={{ fontSize: 12, color: t.contentTertiary, marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: t.content }}>{c.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 340 }}>
        <label style={{ fontSize: 12, color: t.contentTertiary }}>
          Revenue: ${revenue.toLocaleString()}
          <input type="range" min="0" max="30000" step="100" value={revenue} onChange={(e) => setRevenue(Number(e.target.value))} style={{ width: '100%', marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 12, color: t.contentTertiary }}>
          Cost: ${cost.toLocaleString()}
          <input type="range" min="0" max="20000" step="100" value={cost} onChange={(e) => setCost(Number(e.target.value))} style={{ width: '100%', marginTop: 4 }} />
        </label>
      </div>
    </div>
  )
}
