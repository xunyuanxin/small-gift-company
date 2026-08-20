import { Box, Typography } from '@mui/material'

// Spec §16 — shared reusable selection card for Upgrade and Gift Bag sections.
// Rendered as a radio option: use a wrapping radiogroup for accessibility.

interface Props {
  id: string
  label: string
  description: string
  meta?: string       // e.g. "Included", "+$2.50 per bag", "Coming soon"
  selected: boolean
  onClick: () => void
}

export function OptionCard({ label, description, meta, selected, onClick }: Props) {
  return (
    <Box
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() }
      }}
      sx={{
        border: selected
          ? '2px solid #4A6FA5'
          : '1px solid #D2D2D7',
        borderRadius: '14px',
        padding: { xs: '14px 16px', sm: '16px 20px' },
        backgroundColor: selected ? '#F0F4FA' : '#FFFFFF',
        cursor: 'pointer',
        outline: 'none',
        transition: 'border-color 150ms ease, background-color 150ms ease',
        '&:focus-visible': { boxShadow: '0 0 0 3px #4A6FA540' },
        '&:hover':         { borderColor: selected ? '#4A6FA5' : '#A0A0A8' },
      }}
    >
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#1D1D1F', mb: 0.25 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: '#6E6E73' }}>
          {description}
        </Typography>
        {meta && (
          <Typography sx={{ fontSize: '0.82rem', color: '#6E6E73', mt: 0.5, fontWeight: 500 }}>
            {meta}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
