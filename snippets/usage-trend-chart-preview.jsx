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
  const [seed, setSeed] = useState(1)
  const points = Array.from({ length: 10 }).map((_, i) => {
    const base = 300 + i * 20
    const wiggle = ((i * seed * 37) % 97) - 48
    return Math.max(20, base + wiggle)
  })
  const max = Math.max(...points)
  const width = 300
  const height = 140
  const stepX = width / (points.length - 1)
  const yFor = (p) => height - (p / max) * (height - 20) - 10

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
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 500, color: t.content }}>Usage Trend</h3>
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
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <button
          onClick={() => setSeed((s) => s + 1)}
          style={{ fontSize: 12, color: t.content, background: t.surfaceMuted, border: `1px solid ${t.line}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}
        >
          Randomize data
        </button>
      </div>
    </div>
  )
}
