import { useEffect, useState } from 'react'
import { Alert, Box, CircularProgress, Paper, Typography } from '@mui/material'
import { adminApi } from '../../api/admin'
import type { AdminDashboard } from '../../api/admin'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import { AdminNav } from './AdminNav'

export function AdminDashboardPage() {
  const { authHeader } = useAdminAuth()
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authHeader) return
    adminApi.getDashboard(authHeader)
      .then(setDashboard)
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [authHeader])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F7F7F5' }}>
      <AdminNav />
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>Dashboard</Typography>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {dashboard && (
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <StatCard label="Finder Completions" value={dashboard.finderCompletions} />
            <StatCard label="Bundle Views" value={dashboard.bundleViews} />
          </Box>
        )}
      </Box>
    </Box>
  )
}

interface StatCardProps {
  label: string
  value: number
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <Paper
      sx={{
        p: 4,
        minWidth: 200,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Typography sx={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1, color: '#1D1D1F' }}>
        {value.toLocaleString()}
      </Typography>
      <Typography sx={{ fontSize: '0.875rem', color: '#6E6E73', textAlign: 'center' }}>
        {label}
      </Typography>
    </Paper>
  )
}
