import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material'
import theme from './theme'
import App from './App'

afterEach(() => {
  vi.restoreAllMocks()
})

function renderApp(initialPath = '/') {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[initialPath]}>
        <App />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('App routing smoke tests', () => {
  it('renders the homepage hero on the root route', () => {
    renderApp('/')
    expect(
      screen.getByRole('heading', { name: /goodie bags/i }),
    ).toBeInTheDocument()
  })

  it('renders the Gift Finder panel on the root route', () => {
    renderApp('/')
    expect(screen.getByText(/let's find their favorites/i)).toBeInTheDocument()
  })

  it('renders the BundlesPage gallery at /bundles with no params (loading)', () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    }))
    renderApp('/bundles')
    expect(screen.getByText(/goodie bags for you/i)).toBeInTheDocument()
  })

  it('shows bundles gallery when /bundles has tag params', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    }))
    renderApp('/bundles?tag=party%3Abirthday')
    await waitFor(() => expect(screen.getByTestId('empty-state')).toBeInTheDocument())
  })

  it('shows error state when bundle search fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: () => Promise.resolve({ detail: 'Service Unavailable' }),
    }))
    renderApp('/bundles?tag=party%3Abirthday')
    await waitFor(() =>
      expect(screen.getByTestId('error-state')).toBeInTheDocument(),
    )
  })

  it('shows empty state when search returns no results', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    }))
    renderApp('/bundles?tag=party%3Abirthday')
    await waitFor(() =>
      expect(screen.getByTestId('empty-state')).toBeInTheDocument(),
    )
  })
})
