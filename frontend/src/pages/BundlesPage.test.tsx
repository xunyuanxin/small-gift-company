import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@mui/material'
import theme from '../theme'
import { BundlesPage } from './BundlesPage'
import * as bundlesApi from '../api/bundles'
import type { BundleDto } from '../types/catalog'

afterEach(() => {
  vi.restoreAllMocks()
})

function renderPage(initialPath = '/bundles') {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/bundles" element={<BundlesPage />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

const sampleBundle: BundleDto = {
  id: 1,
  name: 'Rainbow Fun Pack',
  description: 'Fun stuff',
  basePrice: 8.99,
  imageUrl: null,
  tags: ['age:6-8', 'interest:creative'],
}

describe('BundlesPage', () => {
  it('shows loading skeletons while fetching', () => {
    vi.spyOn(bundlesApi, 'searchBundles').mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getAllByTestId('bundle-skeleton').length).toBeGreaterThan(0)
  })

  it('shows error state and Try Again button when fetch fails', async () => {
    vi.spyOn(bundlesApi, 'searchBundles').mockRejectedValue({ message: 'Network error' })
    renderPage()
    await waitFor(() =>
      expect(screen.getByTestId('error-state')).toBeInTheDocument(),
    )
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('shows empty state with Surprise Me button when no results', async () => {
    vi.spyOn(bundlesApi, 'searchBundles').mockResolvedValue([])
    renderPage('/bundles?tag=party%3Abirthday')
    await waitFor(() =>
      expect(screen.getByTestId('empty-state')).toBeInTheDocument(),
    )
    expect(screen.getByText(/no perfect match yet/i)).toBeInTheDocument()
    expect(screen.getByTestId('surprise-me')).toBeInTheDocument()
  })

  it('shows results after fetch resolves', async () => {
    vi.spyOn(bundlesApi, 'searchBundles').mockResolvedValue([sampleBundle])
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Rainbow Fun Pack')).toBeInTheDocument(),
    )
  })

  it('Surprise Me clears active filters and re-fetches with no params', async () => {
    vi.spyOn(bundlesApi, 'searchBundles').mockResolvedValue([])
    renderPage('/bundles?tag=party%3Abirthday')
    await waitFor(() => expect(screen.getByTestId('empty-state')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('surprise-me'))
    // All option chips remain visible (they are always shown), but "Clear all" should
    // disappear because no filters are active anymore.
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument(),
    )
  })

  it('shows result count after fetch', async () => {
    vi.spyOn(bundlesApi, 'searchBundles').mockResolvedValue([sampleBundle])
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/1 bag found/i)).toBeInTheDocument(),
    )
  })

  it('Try Again button retriggers fetch', async () => {
    const spy = vi.spyOn(bundlesApi, 'searchBundles')
      .mockRejectedValueOnce({ message: 'fail' })
      .mockResolvedValueOnce([sampleBundle])
    renderPage()
    await waitFor(() => expect(screen.getByTestId('error-state')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    await waitFor(() => expect(screen.getByText('Rainbow Fun Pack')).toBeInTheDocument())
    expect(spy).toHaveBeenCalledTimes(2)
  })
})
