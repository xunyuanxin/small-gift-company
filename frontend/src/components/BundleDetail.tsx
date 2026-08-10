import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Button, Chip, CircularProgress, Divider,
  List, ListItem, ListItemText, Stack, Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { getBundleDetail } from '../api/bundles'
import type { BundleDetailDto } from '../types/catalog'

export function BundleDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [bundle, setBundle] = useState<BundleDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getBundleDetail(Number(id))
      .then(setBundle)
      .catch((e: { message?: string }) => setError(e.message ?? 'Bundle not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <CircularProgress />

  if (error) {
    return (
      <Box>
        <Typography color="error" role="alert">{error}</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
      </Box>
    )
  }

  if (!bundle) return null

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>{bundle.name}</Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>{bundle.description}</Typography>
      <Typography variant="h5" color="primary" gutterBottom>${bundle.basePrice.toFixed(2)}</Typography>

      <Stack direction="row" spacing={0.5} flexWrap="wrap" mb={2}>
        {bundle.tags.map((tag) => <Chip key={tag} label={tag} size="small" />)}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>What's inside</Typography>
      <List dense>
        {bundle.items.map((item) => (
          <ListItem key={item.sku} disableGutters>
            <ListItemText
              primary={item.name}
              secondary={`Qty: ${item.quantityPerBundle}${item.replaceable ? ' (swappable)' : ''}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
