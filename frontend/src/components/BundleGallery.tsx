import { useNavigate } from 'react-router-dom'
import { Card, CardActionArea, CardContent, CardMedia, Chip, Grid2, Stack, Typography } from '@mui/material'
import type { BundleDto } from '../types/catalog'

interface Props {
  bundles: BundleDto[]
}

export function BundleGallery({ bundles }: Props) {
  const navigate = useNavigate()

  if (bundles.length === 0) {
    return (
      <Typography color="text.secondary" data-testid="no-results">
        No gift bags match your filters. Try broadening your search.
      </Typography>
    )
  }

  return (
    <Grid2 container spacing={2}>
      {bundles.map((bundle) => (
        <Grid2 key={bundle.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardActionArea onClick={() => navigate(`/bundles/${bundle.id}`)}>
              {bundle.imageUrl && (
                <CardMedia
                  component="img"
                  height="160"
                  image={bundle.imageUrl}
                  alt={bundle.name}
                />
              )}
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {bundle.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {bundle.description}
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  ${bundle.basePrice.toFixed(2)}
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {bundle.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid2>
      ))}
    </Grid2>
  )
}
