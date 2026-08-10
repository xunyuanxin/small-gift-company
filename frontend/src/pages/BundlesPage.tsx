import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Box, Button, Chip, Container, Fade, FormControl, Grid2,
  MenuItem, Select, Skeleton, Stack, Typography,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { searchBundles } from '../api/bundles'
import type { BundleDto } from '../types/catalog'
import { BundleGallery } from '../components/BundleGallery'
import { COLORS } from '../theme'

// ── Tag option definitions ───────────────────────────────────────────────────

const AGE_OPTIONS = [
  { tag: 'age:3-5',  label: '3–5' },
  { tag: 'age:6-8',  label: '6–8' },
  { tag: 'age:9-12', label: '9–12' },
]

const INTEREST_OPTIONS = [
  { tag: 'interest:creative',  label: '🎨 Creative' },
  { tag: 'interest:animals',   label: '🐾 Animals' },
  { tag: 'interest:adventure', label: '🚀 Adventure' },
  { tag: 'interest:magical',   label: '✨ Magical' },
  { tag: 'interest:active',    label: '⚽ Active' },
  { tag: 'interest:games',     label: '🎲 Games' },
]

const OCCASION_OPTIONS = [
  { tag: 'party:birthday',    label: '🎂 Birthday' },
  { tag: 'party:school',      label: '🏫 School Party' },
  { tag: 'party:celebration', label: '🎉 Celebration' },
  { tag: 'party:other',       label: '🎁 Other' },
]

const ALL_OPTIONS = [...AGE_OPTIONS, ...INTEREST_OPTIONS, ...OCCASION_OPTIONS]

const MAX_PRICE_OPTIONS = [5, 10, 15, 20, 30]

function tagLabel(tag: string): string {
  return ALL_OPTIONS.find((o) => o.tag === tag)?.label ?? tag
}

// ── Component ────────────────────────────────────────────────────────────────

export function BundlesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [bundles,      setBundles]      = useState<BundleDto[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [retryCount,   setRetryCount]   = useState(0)

  // Filter panel open state — hover on desktop, tap on mobile
  const [panelOpen,  setPanelOpen]  = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // ── Filter panel hover/tap helpers ─────────────────────────────────────────

  function keepOpen() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setPanelOpen(true)
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setPanelOpen(false), 150)
  }

  // ── Filter value helpers ────────────────────────────────────────────────────

  function toggleTag(tag: string) {
    const next = new URLSearchParams(searchParams)
    const current = next.getAll('tag')
    next.delete('tag')
    if (current.includes(tag)) {
      current.filter((t) => t !== tag).forEach((t) => next.append('tag', t))
    } else {
      current.forEach((t) => next.append('tag', t))
      next.append('tag', tag)
    }
    setSearchParams(next)
  }

  function removeLastTag() {
    const tags = searchParams.getAll('tag')
    if (tags.length > 0) toggleTag(tags[tags.length - 1])
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

  // ── Shared chip row (used inside the dropdown panel) ────────────────────────

  function FilterChipRow({
    label,
    options,
  }: {
    label: string
    options: { tag: string; label: string }[]
  }) {
    return (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center" mb={1.5}>
        <Typography variant="caption" sx={{ color: COLORS.muted, fontWeight: 600, minWidth: 64 }}>
          {label}
        </Typography>
        {options.map(({ tag, label: chipLabel }) => (
          <Chip
            key={tag}
            label={chipLabel}
            onClick={() => toggleTag(tag)}
            variant={activeTags.includes(tag) ? 'filled' : 'outlined'}
            color={activeTags.includes(tag) ? 'primary' : 'default'}
            sx={{ borderColor: activeTags.includes(tag) ? undefined : COLORS.border, cursor: 'pointer' }}
          />
        ))}
      </Stack>
    )
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

        {/* ── Filter section ─────────────────────────────────────────────────── */}
        <Box sx={{ position: 'relative', mb: 3 }}>

          {/* Collapsed bar — always visible */}
          <Stack
            direction="row"
            flexWrap="wrap"
            useFlexGap
            alignItems="center"
            spacing={1}
            onMouseEnter={keepOpen}
            onMouseLeave={scheduleClose}
            onClick={() => setPanelOpen((p) => !p)}
            data-testid="filter-bar"
            sx={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '12px',
              px: 2,
              py: 1,
              minHeight: 44,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, color: COLORS.muted }}>
              Filters {panelOpen ? '▴' : '▾'}
            </Typography>

            {activeTags.map((tag) => (
              <Chip
                key={tag}
                label={tagLabel(tag)}
                size="small"
                onDelete={(e) => { e.stopPropagation(); toggleTag(tag) }}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  backgroundColor: COLORS.coral,
                  color: '#FFFFFF',
                  height: 24,
                  fontSize: '0.75rem',
                  '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' },
                }}
              />
            ))}

            {maxPrice !== undefined && (
              <Chip
                label={`Up to $${maxPrice}`}
                size="small"
                onDelete={(e) => {
                  e.stopPropagation()
                  const next = new URLSearchParams(searchParams)
                  next.delete('maxPrice')
                  setSearchParams(next)
                }}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  backgroundColor: COLORS.coral,
                  color: '#FFFFFF',
                  height: 24,
                  fontSize: '0.75rem',
                  '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' },
                }}
              />
            )}

            {!hasFilters && (
              <Typography variant="caption" sx={{ color: COLORS.muted }}>
                Tap to add filters
              </Typography>
            )}

            {hasFilters && (
              <Button
                variant="text"
                size="small"
                onClick={(e) => { e.stopPropagation(); clearAll() }}
                sx={{ color: COLORS.muted, fontSize: '0.75rem', minHeight: 0, px: 1, ml: 'auto' }}
              >
                Clear all
              </Button>
            )}
          </Stack>

          {/* Expanded panel — overlays bundle cards, appears on hover/tap */}
          <Fade in={panelOpen}>
            <Box
              onMouseEnter={keepOpen}
              onMouseLeave={scheduleClose}
              onClick={(e) => e.stopPropagation()} // prevent bar's toggle from firing
              data-testid="filter-panel"
              sx={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                zIndex: 100,
                backgroundColor: '#FFFFFF',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '16px',
                p: { xs: 2, sm: 3 },
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }}
            >
              <FilterChipRow label="Age"      options={AGE_OPTIONS}      />
              <FilterChipRow label="Interest" options={INTEREST_OPTIONS} />
              <FilterChipRow label="Occasion" options={OCCASION_OPTIONS} />

              {/* Price + Clear all */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                <Typography variant="caption" sx={{ color: COLORS.muted, fontWeight: 600, minWidth: 64 }}>
                  Price
                </Typography>
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
              </Stack>
            </Box>
          </Fade>
        </Box>

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
            <Typography sx={{ color: COLORS.muted, mb: 3 }}>Please try again.</Typography>
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
