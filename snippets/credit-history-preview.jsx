export const CreditHistoryPreview = () => {
  const FP_THEME = {
    light: {
      surfaceCanvas: 'rgb(255 255 255)',
      surface: 'rgb(255 255 255)',
      content: 'rgb(17 24 39)',
      contentMuted: 'rgb(107 114 128)',
      contentTertiary: 'rgb(75 85 99)',
      line: 'rgb(229 231 235)',
      lineSubtle: 'rgb(243 244 246)',
      accentTealBrand: 'rgb(42 157 144)',
      warning: 'hsl(21 90% 48%)',
    },
    dark: {
      surfaceCanvas: 'rgb(24 24 24)',
      surface: 'rgb(29 29 31)',
      content: 'rgb(238 239 241)',
      contentMuted: 'rgb(138 143 152)',
      contentTertiary: 'rgb(169 173 182)',
      line: 'rgb(41 41 46)',
      lineSubtle: 'rgb(31 31 35)',
      accentTealBrand: 'rgb(63 194 179)',
      warning: 'hsl(30 90% 58%)',
    },
  }
  const [mode, setMode] = useState('light')
  const t = FP_THEME[mode]

  // Real fixtures from the example app's src/demoData.ts (DEMO_CREDIT_TRANSACTIONS), same page
  // size (5) as the example app's <CreditHistory> demo.
  const allTransactions = [
    { id: 1, type: 'credit', label: 'Monthly credit grant', amount: 5000, status: 'completed' },
    { id: 2, type: 'debit', label: 'API usage deduction', amount: -423, status: 'completed' },
    { id: 3, type: 'debit', label: 'API usage deduction', amount: -187.5, status: 'completed' },
    { id: 4, type: 'credit', label: 'Promotional credit', amount: 1000, status: 'completed' },
    { id: 5, type: 'debit', label: 'API usage deduction', amount: -641, status: 'completed' },
    { id: 6, type: 'debit', label: 'Overage charge', amount: -124, status: 'completed' },
    { id: 7, type: 'credit', label: 'Manual top-up', amount: 2500, status: 'completed' },
    { id: 8, type: 'debit', label: 'API usage deduction', amount: -339, status: 'completed' },
    { id: 9, type: 'debit', label: 'Webhook overage', amount: -216, status: 'completed' },
    { id: 10, type: 'credit', label: 'Monthly credit grant', amount: 5000, status: 'completed' },
    { id: 11, type: 'debit', label: 'API usage deduction', amount: -92, status: 'completed' },
    { id: 12, type: 'debit', label: 'Data export fee', amount: -150, status: 'pending' },
  ]
  const pageSize = 5
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(allTransactions.length / pageSize)
  const pageItems = allTransactions.slice((page - 1) * pageSize, page * pageSize)

  return (
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
      <div style={{ border: `1px solid ${t.line}`, borderRadius: 12, overflow: 'hidden', background: t.surface, width: '100%', maxWidth: 340 }}>
        <div style={{ padding: 20, borderBottom: `1px solid ${t.line}` }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 500, color: t.content }}>Transaction History</h3>
        </div>
        <div style={{ padding: '8px 20px' }}>
          {pageItems.map((tx) => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${t.lineSubtle}`, fontSize: 13 }}>
              <span style={{ color: t.content, display: 'flex', alignItems: 'center', gap: 6 }}>
                {tx.label}
                {tx.status === 'pending' && (
                  <span style={{ fontSize: 10, textTransform: 'uppercase', color: t.warning, border: `1px solid ${t.warning}`, borderRadius: 999, padding: '0 6px' }}>
                    pending
                  </span>
                )}
              </span>
              <span style={{ color: tx.type === 'credit' ? t.accentTealBrand : t.content, whiteSpace: 'nowrap', marginLeft: 12 }}>
                {tx.amount > 0 ? '+' : ''}
                {tx.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${t.line}` }}>
          <span style={{ fontSize: 12, color: t.contentMuted }}>
            Page {page} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                fontSize: 12,
                color: t.content,
                background: 'transparent',
                border: `1px solid ${t.line}`,
                borderRadius: 6,
                padding: '4px 10px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.4 : 1,
              }}
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                fontSize: 12,
                color: t.content,
                background: 'transparent',
                border: `1px solid ${t.line}`,
                borderRadius: 6,
                padding: '4px 10px',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                opacity: page === totalPages ? 0.4 : 1,
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
