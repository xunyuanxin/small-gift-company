import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material'
import type { BundleDto } from '../types/catalog'
import { COLORS } from '../theme'

// ── Tag parsing helpers ──────────────────────────────────────────────────────

const INTEREST_LABELS: Record<string, string> = {
  'interest:creative':  '🎨 Creative',
  'interest:animals':   '🐾 Animals',
  'interest:adventure': '🚀 Adventure',
  'interest:magical':   '✨ Magical',
  'interest:active':    '⚽ Active',
  'interest:games':     '🎲 Games',
}

function parseThemeLine(tags: string[]): string {
  const ageTag      = tags.find((t) => t.startsWith('age:'))
  const interestTag = tags.find((t) => t.startsWith('interest:'))

  const parts: string[] = []
  if (interestTag && INTEREST_LABELS[interestTag]) {
    parts.push(INTEREST_LABELS[interestTag])
  }
  if (ageTag) {
    const range = ageTag.slice('age:'.length).replace('-', '–')
    parts.push(`Ages ${range}`)
  }
  return parts.join(' · ')
}

// ── BundleCard ───────────────────────────────────────────────────────────────

interface Props {
  bundle: BundleDto
  onClick: () => void
}

export function BundleCard({ bundle, onClick }: Props) {
  const themeLine = parseThemeLine(bundle.tags)

  return (
    <Card
      sx={{
        borderRadius: '22px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Image area */}
      <Box sx={{ position: 'relative' }}>
        {bundle.imageUrl ? (
          <Box
            component="img"
            src={bundle.imageUrl}
            alt={bundle.name}
            sx={{
              width: '100%',
              height: 200,
              objectFit: 'cover',
              borderRadius: '22px 22px 0 0',
              display: 'block',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: 200,
              backgroundColor: COLORS.cream,
              borderRadius: '22px 22px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontSize: '3rem' }}>🎁</Typography>
          </Box>
        )}

        {/* Kid Pick badge */}
        <Chip
          label="Kid Pick ♥"
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            backgroundColor: COLORS.coral,
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '0.72rem',
            height: 26,
          }}
        />
      </Box>

      {/* Card content */}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontFamily: '"Fredoka", Nunito, sans-serif',
            color: COLORS.charcoal,
            fontWeight: 600,
            fontSize: '1.1rem',
            mb: 0.5,
          }}
        >
          {bundle.name}
        </Typography>

        {themeLine && (
          <Typography
            variant="body2"
            sx={{ color: COLORS.muted, mb: 1, fontSize: '0.85rem' }}
          >
            {themeLine}
          </Typography>
        )}

        <Typography
          variant="body1"
          sx={{
            color: COLORS.coral,
            fontWeight: 600,
            fontSize: '1rem',
            mb: 2,
            mt: 'auto',
          }}
        >
          ${bundle.basePrice.toFixed(2)} / guest
        </Typography>

        <Button
          variant="outlined"
          fullWidth
          onClick={onClick}
          sx={{
            borderColor: COLORS.border,
            color: COLORS.charcoal,
            '&:hover': {
              borderColor: COLORS.coral,
              color: COLORS.coral,
              backgroundColor: 'transparent',
            },
            fontWeight: 600,
            minHeight: 44,
          }}
        >
          See What's Inside →
        </Button>
      </CardContent>
    </Card>
  )
}
