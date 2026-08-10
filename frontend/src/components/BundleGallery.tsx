import { useNavigate } from 'react-router-dom'
import { Grid2, Typography } from '@mui/material'
import type { BundleDto } from '../types/catalog'
import { BundleCard } from './BundleCard'
import { COLORS } from '../theme'

interface Props {
  bundles: BundleDto[]
}

export function BundleGallery({ bundles }: Props) {
  const navigate = useNavigate()

  if (bundles.length === 0) {
    return (
      <Typography color="text.secondary" data-testid="no-results" sx={{ color: COLORS.muted }}>
        No gift bags match your filters. Try broadening your search.
      </Typography>
    )
  }

  return (
    <Grid2 container spacing={3}>
      {bundles.map((bundle) => (
        <Grid2 key={bundle.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <BundleCard
            bundle={bundle}
            onClick={() => navigate(`/bundles/${bundle.id}`)}
          />
        </Grid2>
      ))}
    </Grid2>
  )
}
