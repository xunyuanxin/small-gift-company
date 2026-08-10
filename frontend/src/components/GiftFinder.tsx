import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Button, Chip, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { searchBundles } from '../api/bundles'
import type { BundleDto } from '../types/catalog'
import { BundleGallery } from './BundleGallery'

const AGE_OPTIONS = ['age:0-3', 'age:4-8', 'age:9-12']
const INTEREST_OPTIONS = ['interest:art', 'interest:crafts', 'interest:science', 'interest:outdoor']
const MAX_PRICE_OPTIONS = [5, 10, 15, 20, 30]

export function GiftFinder() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [bundles, setBundles] = useState<BundleDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeTags = searchParams.getAll('tag')
  const maxPrice = searchParams.get('maxPrice')
    ? Number(searchParams.get('maxPrice'))
    : undefined

  useEffect(() => {
    setLoading(true)
    setError(null)
    searchBundles(activeTags, maxPrice)
      .then(setBundles)
      .catch((e: { message?: string }) => setError(e.message ?? 'Failed to load bundles'))
      .finally(() => setLoading(false))
    // activeTags reference changes on every render; use the serialised string
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()])

  function toggleTag(tag: string) {
    const next = new URLSearchParams(searchParams)
    const current = next.getAll('tag')
    if (current.includes(tag)) {
      next.delete('tag')
      current.filter((t) => t !== tag).forEach((t) => next.append('tag', t))
    } else {
      next.append('tag', tag)
    }
    setSearchParams(next, { replace: true })
  }

  function handleMaxPrice(e: SelectChangeEvent<string>) {
    const next = new URLSearchParams(searchParams)
    if (e.target.value) {
      next.set('maxPrice', e.target.value)
    } else {
      next.delete('maxPrice')
    }
    setSearchParams(next, { replace: true })
  }

  function clearFilters() {
    setSearchParams({}, { replace: true })
  }

  const hasFilters = activeTags.length > 0 || maxPrice !== undefined

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Find the Perfect Gift Bag
      </Typography>

      {/* Age filter */}
      <Stack direction="row" spacing={1} flexWrap="wrap" mb={1} alignItems="center">
        <Typography variant="subtitle2">Age:</Typography>
        {AGE_OPTIONS.map((tag) => (
          <Chip
            key={tag}
            label={tag.replace('age:', '')}
            onClick={() => toggleTag(tag)}
            color={activeTags.includes(tag) ? 'primary' : 'default'}
            variant={activeTags.includes(tag) ? 'filled' : 'outlined'}
          />
        ))}
      </Stack>

      {/* Interest filter */}
      <Stack direction="row" spacing={1} flexWrap="wrap" mb={2} alignItems="center">
        <Typography variant="subtitle2">Interest:</Typography>
        {INTEREST_OPTIONS.map((tag) => (
          <Chip
            key={tag}
            label={tag.replace('interest:', '')}
            onClick={() => toggleTag(tag)}
            color={activeTags.includes(tag) ? 'primary' : 'default'}
            variant={activeTags.includes(tag) ? 'filled' : 'outlined'}
          />
        ))}
      </Stack>

      {/* Price ceiling */}
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="max-price-label">Max price</InputLabel>
          <Select
            labelId="max-price-label"
            label="Max price"
            value={maxPrice !== undefined ? String(maxPrice) : ''}
            onChange={handleMaxPrice}
          >
            <MenuItem value="">Any price</MenuItem>
            {MAX_PRICE_OPTIONS.map((p) => (
              <MenuItem key={p} value={String(p)}>
                Up to ${p}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {hasFilters && (
          <Button size="small" onClick={clearFilters} variant="text">
            Clear filters
          </Button>
        )}
      </Stack>

      {/* Results */}
      {loading && <Typography color="text.secondary">Loading…</Typography>}
      {error && (
        <Typography color="error" role="alert">
          {error}
        </Typography>
      )}
      {!loading && !error && <BundleGallery bundles={bundles} />}
    </Box>
  )
}
