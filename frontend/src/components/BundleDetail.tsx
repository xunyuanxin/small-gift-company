import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Button, Chip, CircularProgress, Container,
  Divider, List, ListItem, ListItemText, Stack, Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { getBundleDetail } from '../api/bundles'
import type { BundleDetailDto } from '../types/catalog'
import { COLORS } from '../theme'

// ── Tag chip accent colors ───────────────────────────────────────────────────

function tagChipColor(tag: string): string {
  if (tag.startsWith('age:'))      return COLORS.blue
  if (tag.startsWith('interest:')) return COLORS.sage
  if (tag.startsWith('party:'))    return COLORS.lavender
  return COLORS.yellow
}

// ── BundleDetail ─────────────────────────────────────────────────────────────

export function BundleDetail() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const [bundle,  setBundle]  = useState<BundleDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getBundleDetail(Number(id))
      .then(setBundle)
      .catch((e: { message?: string }) => setError(e.message ?? 'Bundle not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress sx={{ color: COLORS.coral }} />
      </Box>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography color="error" role="alert" sx={{ mb: 2 }}>{error}</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Container>
    )
  }

  if (!bundle) return null

  return (
    <Box sx={{ backgroundColor: COLORS.cream, minHeight: '100vh' }}>
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3, color: COLORS.muted, minHeight: 44 }}
        >
          Back
        </Button>

        {/* Hero image */}
        {bundle.imageUrl ? (
          <Box
            component="img"
            src={bundle.imageUrl}
            alt={bundle.name}
            sx={{
              width: '100%',
              height: { xs: 280, md: 380 },
              objectFit: 'cover',
              borderRadius: '16px',
              display: 'block',
              mb: 3,
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: { xs: 280, md: 380 },
              backgroundColor: '#F0EDE8',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Typography sx={{ fontSize: '5rem' }}>🎁</Typography>
          </Box>
        )}

        {/* Name */}
        <Typography
          variant="h4"
          component="h1"
          sx={{ color: COLORS.charcoal, mb: 0.5 }}
        >
          {bundle.name}
        </Typography>

        {/* Price */}
        <Typography
          variant="h5"
          sx={{ color: COLORS.coral, fontWeight: 700, mb: 1.5 }}
        >
          ${bundle.basePrice.toFixed(2)} / guest
        </Typography>

        {/* Description */}
        {bundle.description && (
          <Typography
            variant="body1"
            sx={{ color: COLORS.muted, mb: 2, lineHeight: 1.7 }}
          >
            {bundle.description}
          </Typography>
        )}

        {/* Tag chips */}
        {bundle.tags.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
            {bundle.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  backgroundColor: tagChipColor(tag),
                  color: COLORS.charcoal,
                  fontWeight: 500,
                }}
              />
            ))}
          </Stack>
        )}

        <Divider sx={{ my: 3, borderColor: COLORS.border }} />

        {/* What's Inside */}
        <Typography variant="h6" component="h2" sx={{ mb: 1.5, color: COLORS.charcoal }}>
          What's Inside
        </Typography>

        <List dense disablePadding>
          {bundle.items.map((item) => (
            <ListItem key={item.sku} disableGutters sx={{ py: 0.75 }}>
              <ListItemText
                primary={
                  <Typography variant="body1" sx={{ color: COLORS.charcoal }}>
                    • {item.name}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" sx={{ color: COLORS.muted }}>
                    Qty: {item.quantityPerBundle}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Container>
    </Box>
  )
}
