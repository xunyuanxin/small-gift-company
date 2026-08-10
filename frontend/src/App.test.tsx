import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import App from './App'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('App smoke test', () => {
  it('renders the page heading', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'UP' }),
    }))

    render(<App />)
    expect(screen.getByRole('heading', { name: /goodie bag/i })).toBeInTheDocument()
    // drain the async state update so React doesn't warn about act()
    await waitFor(() =>
      expect(screen.getByTestId('backend-status')).toHaveTextContent('connected'),
    )
  })
})

describe('API failure-state', () => {
  it('shows unavailable when the backend health call fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: () => Promise.resolve({ detail: 'Service Unavailable' }),
    }))

    render(<App />)

    await waitFor(() =>
      expect(screen.getByTestId('backend-status')).toHaveTextContent('unavailable'),
    )
  })

  it('shows unavailable when fetch rejects (network error)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    render(<App />)

    await waitFor(() =>
      expect(screen.getByTestId('backend-status')).toHaveTextContent('unavailable'),
    )
  })

  it('shows connected when the backend returns status UP', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'UP' }),
    }))

    render(<App />)

    await waitFor(() =>
      expect(screen.getByTestId('backend-status')).toHaveTextContent('connected'),
    )
  })
})
