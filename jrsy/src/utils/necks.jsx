// Clean line-drawing SVGs of jersey neck styles (recreated, not copied).
// Each is a simple black-outline collar illustration on transparent bg.

const wrap = (children) => (
  <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
    <g stroke="#0B0B0F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
      {/* shoulders */}
      <path d="M8 20 Q100 8 192 20" />
      <path d="M8 20 L8 40" /><path d="M192 20 L192 40" />
      {children}
    </g>
  </svg>
)

export const NECK_DRAWINGS = {
  round: {
    label: 'Round Neck',
    svg: wrap(<>
      <path d="M62 22 Q100 78 138 22" />
      <path d="M66 26 Q100 68 134 26" strokeDasharray="3 3" />
    </>),
  },
  crossRound: {
    label: 'Cross Round Neck',
    svg: wrap(<>
      <path d="M60 22 Q100 82 140 22" />
      <path d="M60 22 L100 46 L140 22" />
      <path d="M66 28 Q100 70 134 28" strokeDasharray="3 3" />
    </>),
  },
  v: {
    label: 'V Neck',
    svg: wrap(<>
      <path d="M64 22 L100 74 L136 22" />
      <path d="M70 24 L100 64 L130 24" strokeDasharray="3 3" />
    </>),
  },
  crossV: {
    label: 'Cross V Neck',
    svg: wrap(<>
      <path d="M62 22 L100 70 L138 22" />
      <path d="M84 22 L116 46" /><path d="M116 22 L84 46" />
    </>),
  },
  doubleV: {
    label: 'Double V Neck',
    svg: wrap(<>
      <path d="M64 22 L100 72 L136 22" />
      <path d="M72 22 L100 60 L128 22" />
    </>),
  },
  polo: {
    label: 'Polo Neck',
    svg: wrap(<>
      <path d="M70 22 L84 60 L100 40 L116 60 L130 22" />
      <path d="M70 22 L60 34 L84 60" /><path d="M130 22 L140 34 L116 60" />
    </>),
  },
}

export const NECK_ORDER = ['doubleV', 'round', 'crossRound', 'v', 'crossV', 'polo']
