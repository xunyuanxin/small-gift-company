import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Box, Button, Chip, Container, FormControl, Grid2,
  MenuItem, Select, Skeleton, Stack, Typography,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { searchBundles } from '../api/bundles'
import type { BundleDto } from '../types/catalog'
import { BundleGallery } from '../components/BundleGallery'
import { COLORS } from '../theme'

// ── Tag display labels ───────────────────────────────────────────────────────

const TAG_LABELS: Record<string, string> = {
  'age:3-5':              '3–5',
  'age:6-8':              '6–8',
  'age:9-12':             '9–12',
  'interest:creative':    '🎨 Creative',
  'interest:animals':     '🐾 Animals',
  'interest:adventure':   '🚀 Adventure',
  'interest:magical':     '✨ Magical',
  'interest:active':      '⚽ Active',
  'interest:games':       '🎲 Games',
  'party:birthday':       '🎂 Birthday',
  'party:school':         '🏫 School Party',
  'party:celebration':    '🎉 Celebration',
  'party:other':          '🎁 Other',
}

function tagLabel(tag: string): string {
  return TAG_LABELS[tag] ?? tag
}

const MAX_PRICE_OPTIONS = [5, 10, 15, 20, 30]

// ── Component ────────────────────────────────────────────────────────────────

export function BundlesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [bundles,      setBundles]      = useState<BundleDto[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [retryCount,   setRetryCount]   = useState(0)

  const activeTags = searchParams.getAll('tag')
  const maxPrice   = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
  const hasFilters = activeTags.length > 0 || maxPrice !== undefined

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    searchBundles(activeTags, maxPrice)
      .then((data) => { if (!cancelled) setBundles(data) })
      .catch((e: { message?: string }) => {
        if (!cancelled) setError(e.message ?? 'Failed to load bundles')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString(), retryCount])

  // ── Filter helpers ─────────────────────────────────────────────────────────

  function removeTag(tag: string) {
    const next = new URLSearchParams(searchParams)
    const remaining = next.getAll('tag').filter((t) => t !== tag)
    next.delete('tag')
    remaining.forEach((t) => next.append('tag', t))
    setSearchParams(next)
  }

  function removeLastTag() {
    const tags = searchParams.getAll('tag')
    if (tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  function clearAll() {
    setSearchParams(new URLSearchParams())
  }

  function handleMaxPrice(e: SelectChangeEvent<string>) {
    const next = new URLSearchParams(searchParams)
    if (e.target.value) next.set('maxPrice', e.target.value)
    else next.delete('maxPrice')
    setSearchParams(next)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ backgroundColor: COLORS.cream, minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {/* Header */}
        <Typography
          variant="h2"
          component="h1"
          sx={{ mb: 3, color: COLORS.charcoal, fontSize: { xs: '1.8rem', md: '2.2rem' } }}
        >
          Goodie Bags for You ✨
        </Typography>

        {/* Filters row */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          alignItems={{ sm: 'center' }}
          sx={{ mb: 2 }}
        >
          {activeTags.map((tag) => (
            <Chip
              key={tag}
              label={tagLabel(tag)}
              onDelete={() => removeTag(tag)}
              sx={{
                backgroundColor: COLORS.coral,
                color: '#FFFFFF',
                '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.8)' },
              }}
            />
          ))}

          {maxPrice !== undefined && (
            <Chip
              label={`Up to $${maxPrice}`}
              onDelete={() => {
                const next = new URLSearchParams(searchParams)
                next.delete('maxPrice')
                setSearchParams(next)
              }}
              sx={{
                backgroundColor: COLORS.coral,
                color: '#FFFFFF',
                '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.8)' },
              }}
            />
          )}

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={maxPrice !== undefined ? String(maxPrice) : ''}
              onChange={handleMaxPrice}
              displayEmpty
              renderValue={(v) => (v ? `Up to $${v}` : 'Any price')}
              sx={{ borderRadius: 9999, fontSize: '0.875rem' }}
            >
              <MenuItem value="">Any price</MenuItem>
              {MAX_PRICE_OPTIONS.map((p) => (
                <MenuItem key={p} value={String(p)}>Up to ${p}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {hasFilters && (
            <Button
              variant="text"
              size="small"
              onClick={clearAll}
              sx={{ color: COLORS.muted, fontSize: '0.875rem', minHeight: 36 }}
            >
              Clear all
            </Button>
          )}
        </Stack>

        {/* Result count */}
        {!loading && !error && (
          <Typography variant="body2" sx={{ color: COLORS.muted, mb: 3 }}>
            {bundles.length} {bundles.length === 1 ? 'bag' : 'bags'} found
          </Typography>
        )}

        {/* Loading skeletons */}
        {loading && (
          <Grid2 container spacing={3}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid2 key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Skeleton
                  variant="rounded"
                  height={340}
                  sx={{ borderRadius: '22px' }}
                  data-testid="bundle-skeleton"
                />
              </Grid2>
            ))}
          </Grid2>
        )}

        {/* Error state */}
        {!loading && error && (
          <Box sx={{ textAlign: 'center', py: 8 }} data-testid="error-state">
            <Typography variant="h5" sx={{ color: COLORS.charcoal, mb: 1 }}>
              We couldn't load the goodies right now.
            </Typography>
            <Typography sx={{ color: COLORS.muted, mb: 3 }}>
              Please try again.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setRetryCount((c) => c + 1)}
              sx={{ backgroundColor: COLORS.coral, '&:hover': { backgroundColor: '#e06b57' } }}
            >
              Try Again
            </Button>
          </Box>
        )}

        {/* Empty state */}
        {!loading && !error && bundles.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }} data-testid="empty-state">
            <Typography variant="h5" sx={{ color: COLORS.charcoal, mb: 1 }}>
              No perfect match yet ✨
            </Typography>
            <Typography sx={{ color: COLORS.muted, mb: 3 }}>
              Try removing one filter or let us surprise you.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={removeLastTag}
                sx={{ borderColor: COLORS.border, color: COLORS.charcoal, minHeight: 44 }}
              >
                Clear a Filter
              </Button>
              <Button
                variant="contained"
                onClick={clearAll}
                data-testid="surprise-me"
                sx={{ backgroundColor: COLORS.coral, '&:hover': { backgroundColor: '#e06b57' }, minHeight: 44 }}
              >
                Surprise Me
              </Button>
            </Stack>
          </Box>
        )}

        {/* Results */}
        {!loading && !error && bundles.length > 0 && (
          <BundleGallery bundles={bundles} />
        )}
      </Container>
    </Box>
  )
}
