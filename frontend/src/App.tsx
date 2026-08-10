import { useEffect, useState } from 'react'
import { api } from './api/client'

type BackendStatus = 'loading' | 'up' | 'down'

function App() {
  const [status, setStatus] = useState<BackendStatus>('loading')

  useEffect(() => {
    api
      .get<{ status: string }>('/api/health')
      .then(() => setStatus('up'))
      .catch(() => setStatus('down'))
  }, [])

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Goodie Bag</h1>
      <p data-testid="backend-status">
        Backend:{' '}
        {status === 'loading' && 'checking…'}
        {status === 'up' && '✓ connected'}
        {status === 'down' && '✗ unavailable'}
      </p>
    </main>
  )
}

export default App
