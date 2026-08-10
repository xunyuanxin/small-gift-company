import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

afterEach(() => {
  vi.restoreAllMocks()
})

function renderApp(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App smoke test', () => {
  it('renders the GiftFinder heading on the root route', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    }))

    renderApp('/')
    expect(
      screen.getByRole('heading', { name: /find the perfect gift bag/i }),
    ).toBeInTheDocument()
    // drain async bundle fetch
    await waitFor(() => expect(screen.queryByText('Loading\u2026')).not.toBeInTheDocument())
  })
})

describe('API failure-state', () => {
  it('shows error alert when bundle search fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: () => Promise.resolve({ detail: 'Service Unavailable' }),
    }))

    renderApp('/')

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Service Unavailable'),
    )
  })

  it('shows error alert when fetch rejects (network error)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    renderApp('/')

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Network error'),
    )
  })

  it('shows empty state when bundle search returns an empty list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    }))

    renderApp('/')

    await waitFor(() =>
      expect(screen.getByTestId('no-results')).toBeInTheDocument(),
    )
  })
})
