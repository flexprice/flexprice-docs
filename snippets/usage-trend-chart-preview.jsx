export const UsageTrendChartPreview = () => {
  const FP_THEME = {
    light: {
      surfaceCanvas: 'rgb(255 255 255)',
      surface: 'rgb(255 255 255)',
      surfaceMuted: 'rgb(244 244 245)',
      content: 'rgb(17 24 39)',
      contentMuted: 'rgb(107 114 128)',
      contentTertiary: 'rgb(75 85 99)',
      line: 'rgb(229 231 235)',
      accentIndigo: 'rgb(79 70 229)',
    },
    dark: {
      surfaceCanvas: 'rgb(24 24 24)',
      surface: 'rgb(29 29 31)',
      surfaceMuted: 'rgb(37 37 40)',
      content: 'rgb(238 239 241)',
      contentMuted: 'rgb(138 143 152)',
      contentTertiary: 'rgb(169 173 182)',
      line: 'rgb(41 41 46)',
      accentIndigo: 'rgb(138 130 255)',
    },
  }
  const [mode, setMode] = useState('light')
  const t = FP_THEME[mode]

  // Real 14-day fixtures from the example app's src/demoData.ts (DEMO_USAGE_TREND_SERIES), one
  // point per day, 2026-07-28 through 2026-08-10.
  const SERIES = {
    'API calls': [48200, 51030, 49870, 61420, 58990, 44310, 39850, 62770, 65140, 60990, 71230, 68450, 74010, 76580],
    'Webhook events': [21400, 22980, 20150, 26330, 25010, 18720, 16990, 27440, 28100, 26650, 30920, 29710, 32050, 33480],
    'Storage (GB)': [98, 101, 103, 106, 108, 109, 110, 113, 116, 118, 121, 124, 126, 128],
  }
  const [seriesName, setSeriesName] = useState('API calls')
  const [playgroundOpen, setPlaygroundOpen] = useState(false)
  const points = SERIES[seriesName]

  const max = Math.max(...points)
  const min = Math.min(...points)
  const width = 300
  const height = 140
  const stepX = width / (points.length - 1)
  const yFor = (p) => height - ((p - min) / (max - min || 1)) * (height - 20) - 10

  return (
    <div>
      {/* Preview: the real component only. No playground controls in here, so there's never a
          question of whether something on screen is part of UsageTrendChart or not. */}
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

      <div style={{ border: `1px solid ${t.line}`, borderRadius: 12, overflow: 'hidden', background: t.surface, width: '100%', maxWidth: 340 }}>
        <div style={{ padding: 20, borderBottom: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 500, color: t.content }}>Usage Trend</h3>
          <span style={{ fontSize: 11, color: t.contentMuted }}>14 days</span>
        </div>
        <div style={{ padding: 20 }}>
          <svg width={width} height={height} style={{ display: 'block' }}>
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={0} x2={width} y1={(height / 4) * i} y2={(height / 4) * i} stroke={t.surfaceMuted} strokeWidth="1" />
            ))}
            <polyline points={points.map((p, i) => `${i * stepX},${yFor(p)}`).join(' ')} fill="none" stroke={t.accentIndigo} strokeWidth="2" />
            {points.map((p, i) => (
              <circle key={i} cx={i * stepX} cy={yFor(p)} r="3" fill={t.accentIndigo} />
            ))}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: t.contentMuted }}>
            <span>{min.toLocaleString()}</span>
            <span>{max.toLocaleString()}</span>
          </div>
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
          <div style={{ fontSize: 12, color: t.contentMuted, marginBottom: 8 }}>Series (real 14-day fixtures)</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.keys(SERIES).map((name) => (
              <button
                key={name}
                onClick={() => setSeriesName(name)}
                style={{
                  fontSize: 12,
                  color: name === seriesName ? t.surface : t.content,
                  background: name === seriesName ? t.accentIndigo : 'transparent',
                  border: `1px solid ${name === seriesName ? t.accentIndigo : t.line}`,
                  borderRadius: 8,
                  padding: '6px 12px',
                  cursor: 'pointer',
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </details>
    </div>
  )
}
