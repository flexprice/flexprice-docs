export const UsageBreakdownPreview = () => {
  const FP_THEME = {
    light: {
      surfaceCanvas: 'rgb(255 255 255)',
      surface: 'rgb(255 255 255)',
      content: 'rgb(17 24 39)',
      contentSecondary: 'rgb(55 65 81)',
      contentMuted: 'rgb(107 114 128)',
      contentTertiary: 'rgb(75 85 99)',
      line: 'rgb(229 231 235)',
    },
    dark: {
      surfaceCanvas: 'rgb(24 24 24)',
      surface: 'rgb(29 29 31)',
      content: 'rgb(238 239 241)',
      contentSecondary: 'rgb(208 210 215)',
      contentMuted: 'rgb(138 143 152)',
      contentTertiary: 'rgb(169 173 182)',
      line: 'rgb(41 41 46)',
    },
  }
  const [mode, setMode] = useState('light')
  const t = FP_THEME[mode]
  const [sortField, setSortField] = useState('cost')
  const rows = [
    { name: 'API Calls', usage: '8,200', cost: 41 },
    { name: 'Storage', usage: '42 GB', cost: 12.5 },
    { name: 'Webhook events', usage: '1,204', cost: 6.2 },
  ]
  const sorted = [...rows].sort((a, b) => (sortField === 'cost' ? b.cost - a.cost : a.name.localeCompare(b.name)))

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
        <div style={{ border: `1px solid ${t.line}`, borderRadius: 12, overflow: 'hidden', background: t.surface, width: 380 }}>
          <div style={{ padding: 20, borderBottom: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 500, color: t.content }}>Usage Breakdown</h3>
            <button
              onClick={() => setSortField((f) => (f === 'cost' ? 'name' : 'cost'))}
              style={{ fontSize: 11, color: t.contentMuted, background: 'transparent', border: `1px solid ${t.line}`, borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
            >
              Sort: {sortField === 'cost' ? 'Cost' : 'Name'}
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 20px', color: t.contentMuted, fontWeight: 500, fontSize: 12 }}>Feature</th>
                <th style={{ textAlign: 'right', padding: '10px 20px', color: t.contentMuted, fontWeight: 500, fontSize: 12 }}>Usage</th>
                <th style={{ textAlign: 'right', padding: '10px 20px', color: t.contentMuted, fontWeight: 500, fontSize: 12 }}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.name} style={{ borderTop: `1px solid ${t.line}` }}>
                  <td style={{ padding: '10px 20px', color: t.content }}>{r.name}</td>
                  <td style={{ padding: '10px 20px', color: t.contentSecondary, textAlign: 'right' }}>{r.usage}</td>
                  <td style={{ padding: '10px 20px', color: t.contentSecondary, textAlign: 'right' }}>${r.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
