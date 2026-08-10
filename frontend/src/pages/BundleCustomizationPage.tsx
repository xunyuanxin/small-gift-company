import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Button, Container, Grid2, Stack, Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { getGeneratedBundle } from '../api/generatedBundles'
import type { GeneratedBundleResponse, GeneratedBundleItemDto } from '../types/catalog'
import { ConfiguratorVisual } from '../components/ConfiguratorVisual'
import { IncludedItemCard }   from '../components/IncludedItemCard'
import { OptionCard }         from '../components/OptionCard'

// ── Configurator palette (spec §14) ─────────────────────────────────────────

const C = {
  bg:     '#F7F7F5',
  text:   '#1D1D1F',
  meta:   '#6E6E73',
  accent: '#F47F6B',
}

// ── Template code → display name ────────────────────────────────────────────

function bundleDisplayName(templateCode: string): string {
  if (templateCode === 'PRESCHOOL_4_ITEM')     return "Little One's Bundle"
  if (templateCode === 'READING_PUZZLE_4_ITEM') return 'Reading & Puzzle Bundle'
  return 'Your Custom Bundle'
}

// ── BundleCustomizationPage ──────────────────────────────────────────────────

export function BundleCustomizationPage() {
  const { bundleId } = useParams<{ bundleId: string }>()
  const navigate     = useNavigate()

  const [bundle,    setBundle]    = useState<GeneratedBundleResponse | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [continued, setContinued] = useState(false)

  const [highlightedSku,  setHighlightedSku]  = useState<string | null>(null)
  const [upgradeOptionId, setUpgradeOptionId] = useState<string>('standard')
  const [giftBagOptionId, setGiftBagOptionId] = useState<string>('classic')

  useEffect(() => {
    if (!bundleId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getGeneratedBundle(bundleId)
      .then((b) => {
        if (!cancelled) {
          setBundle(b)
          setGiftBagOptionId(b.giftBag?.code ?? 'classic')
        }
      })
      .catch((e: { message?: string }) => {
        if (!cancelled) setError(e.message ?? 'Bundle not found')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [bundleId])

  function handleItemClick(sku: string) {
    setHighlightedSku((prev) => (prev === sku ? null : sku))
  }

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box
        sx={{ backgroundColor: C.bg, minHeight: '100vh', display: 'flex',
          alignItems: 'center', justifyContent: 'center' }}
        data-testid="configurator-loading"
      >
        <Typography sx={{ color: C.meta }}>Loading your goodie bag…</Typography>
      </Box>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────

  if (error || !bundle) {
    return (
      <Box sx={{ backgroundColor: C.bg, minHeight: '100vh' }} data-testid="configurator-error">
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Typography color="error" role="alert" sx={{ mb: 2 }}>
            {error ?? 'Bundle not found'}
          </Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Container>
      </Box>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const displayedItems: GeneratedBundleItemDto[] = bundle.items
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)

  const upgradeOptions = [
    { id: 'standard', label: 'Standard', description: 'The original curated set', meta: 'Included' },
    ...(bundle.upgrade
      ? [{ id: 'upgraded', label: bundle.upgrade.productName, description: 'Premium upgrade', meta: 'Pricing coming soon' }]
      : []),
  ]

  const giftBagOptions = bundle.giftBag
    ? [{ id: bundle.giftBag.code, label: bundle.giftBag.name, description: 'Ready-to-fill gift bag', meta: 'Included' }]
    : [{ id: 'classic', label: 'Classic Party Bag', description: 'Our standard ready-to-fill gift bag', meta: 'Included' }]

  return (
    <Box sx={{ backgroundColor: C.bg, minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: { xs: 2, md: 3 }, color: C.meta }}
        >
          Back
        </Button>

        <Grid2 container spacing={{ xs: 3, md: 6 }} alignItems="flex-start">

          {/* ── Left column: geometric visual ────────────────────────────── */}
          <Grid2
            size={{ xs: 12, md: 6 }}
            sx={{ position: { md: 'sticky' }, top: { md: 24 } }}
          >
            <ConfiguratorVisual
              items={displayedItems.map((item) => ({ sku: item.sku }))}
              highlightedSku={highlightedSku}
              onShapeClick={(sku) => setHighlightedSku((prev) => prev === sku ? null : sku)}
            />
          </Grid2>

          {/* ── Right column: configurator panel ─────────────────────────── */}
          <Grid2 size={{ xs: 12, md: 6 }}>

            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: C.text,
                fontFamily: '"DM Sans", Inter, sans-serif',
                fontWeight: 700,
                fontSize: { xs: '1.75rem', md: '2rem' },
                mb: 0.5,
              }}
            >
              {bundleDisplayName(bundle.templateCode)}
            </Typography>

            {/* ── Included section ────────────────────────────────────────── */}
            <Typography
              component="h2"
              sx={{ fontWeight: 700, fontSize: '1.15rem', color: C.text, mb: 0.5, mt: 3 }}
            >
              Included
            </Typography>
            <Typography sx={{ color: C.meta, fontSize: '0.875rem', mb: 1.5 }}>
              Four kid-picked favorites — tap any to see where it fits.
            </Typography>

            <Stack
              spacing={1.5}
              sx={{ mb: 3 }}
              role="group"
              aria-label="Included items"
            >
              {displayedItems.map((item) => (
                <IncludedItemCard
                  key={item.sku}
                  sku={item.sku}
                  name={item.productName}
                  description={item.description}
                  highlighted={highlightedSku === item.sku}
                  onClick={() => handleItemClick(item.sku)}
                />
              ))}
            </Stack>

            {/* ── Upgrade section ─────────────────────────────────────────── */}
            <Typography
              component="h2"
              sx={{ fontWeight: 700, fontSize: '1.15rem', color: C.text, mb: 0.5 }}
            >
              Upgrade
            </Typography>
            <Typography sx={{ color: C.meta, fontSize: '0.875rem', mb: 1.5 }}>
              Choose the version that fits your party.
            </Typography>

            <Stack
              spacing={1.5}
              sx={{ mb: 3 }}
              role="radiogroup"
              aria-label="Upgrade options"
              data-testid="upgrade-group"
            >
              {upgradeOptions.map((opt) => (
                <OptionCard
                  key={opt.id}
                  id={opt.id}
                  label={opt.label}
                  description={opt.description}
                  meta={opt.meta}
                  selected={upgradeOptionId === opt.id}
                  onClick={() => setUpgradeOptionId(opt.id)}
                />
              ))}
            </Stack>

            {/* ── Gift Bag section ─────────────────────────────────────────── */}
            <Typography
              component="h2"
              sx={{ fontWeight: 700, fontSize: '1.15rem', color: C.text, mb: 1.5 }}
            >
              Gift Bag
            </Typography>

            <Stack
              spacing={1.5}
              sx={{ mb: 3 }}
              role="radiogroup"
              aria-label="Gift bag options"
              data-testid="giftbag-group"
            >
              {giftBagOptions.map((opt) => (
                <OptionCard
                  key={opt.id}
                  id={opt.id}
                  label={opt.label}
                  description={opt.description}
                  meta={opt.meta}
                  selected={giftBagOptionId === opt.id}
                  onClick={() => setGiftBagOptionId(opt.id)}
                />
              ))}
            </Stack>

            {/* ── Continue CTA ─────────────────────────────────────────────── */}
            {continued ? (
              <Box
                sx={{
                  backgroundColor: '#F0F4FA',
                  border: '1px solid #D2D2D7',
                  borderRadius: '12px',
                  p: 2,
                }}
                data-testid="continue-confirmation"
              >
                <Typography sx={{ color: C.text, fontWeight: 600 }}>
                  Your selection is saved!
                </Typography>
                <Typography sx={{ color: C.meta, fontSize: '0.875rem', mt: 0.5 }}>
                  Checkout arrives in Phase 3.{' '}
                  Configuration: <strong>{upgradeOptionId}</strong> · <strong>{giftBagOptionId}</strong>.
                </Typography>
              </Box>
            ) : (
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => setContinued(true)}
                data-testid="continue-btn"
                sx={{
                  backgroundColor: C.accent,
                  '&:hover': { backgroundColor: '#e06b57' },
                  fontSize: '1rem',
                  py: 1.75,
                  minHeight: 52,
                }}
              >
                Continue with This Bag
              </Button>
            )}
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  )
}
