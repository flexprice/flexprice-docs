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

  // Real fixtures from the example app's src/demoData.ts (DEMO_USAGE_BREAKDOWN_ROWS), grouped by
  // environment (matches the real component's groupId/groupName grouping) plus one ungrouped row.
  const rows = [
    { name: 'API Gateway', group: 'Production', usage: '612.4K calls', cost: 4286.8 },
    { name: 'Auth Service', group: 'Production', usage: '189.9K calls', cost: 1139.4 },
    { name: 'Notifications', group: 'Production', usage: '40K events', cost: 480 },
    { name: 'API Gateway', group: 'Staging', usage: '22.5K calls', cost: 157.5 },
    { name: 'Legacy Integration', group: null, usage: '8.1K calls', cost: 56.84 },
  ]

  const groups = {}
  const ungrouped = []
  for (const r of rows) {
    if (r.group) {
      groups[r.group] = groups[r.group] || []
      groups[r.group].push(r)
    } else {
      ungrouped.push(r)
    }
  }
  const sortRows = (list) => [...list].sort((a, b) => (sortField === 'cost' ? b.cost - a.cost : a.name.localeCompare(b.name)))
  const groupTotal = (list) => list.reduce((sum, r) => sum + r.cost, 0)

  return (
    <div
      style={{
        position: 'relative',
        border: `1px solid ${t.line}`,
        borderRadius: 12,
        background: t.surfaceCanvas,
        padding: '64px 40px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 460,
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
      <div style={{ border: `1px solid ${t.line}`, borderRadius: 12, overflow: 'hidden', background: t.surface, width: '100%', maxWidth: 380 }}>
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
            {Object.entries(groups).flatMap(([groupName, items]) => [
              <tr key={`${groupName}-header`} style={{ borderTop: `1px solid ${t.line}`, background: t.surfaceCanvas }}>
                <td colSpan="2" style={{ padding: '8px 20px', fontWeight: 600, fontSize: 12, color: t.content }}>
                  {groupName}
                </td>
                <td style={{ padding: '8px 20px', textAlign: 'right', fontSize: 12, color: t.contentMuted }}>${groupTotal(items).toFixed(2)}</td>
              </tr>,
              ...sortRows(items).map((r) => (
                <tr key={`${groupName}-${r.name}`} style={{ borderTop: `1px solid ${t.line}` }}>
                  <td style={{ padding: '10px 20px 10px 32px', color: t.content }}>{r.name}</td>
                  <td style={{ padding: '10px 20px', color: t.contentSecondary, textAlign: 'right' }}>{r.usage}</td>
                  <td style={{ padding: '10px 20px', color: t.contentSecondary, textAlign: 'right' }}>${r.cost.toFixed(2)}</td>
                </tr>
              )),
            ])}
            {sortRows(ungrouped).map((r) => (
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
  )
}
