import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { GiftFinder } from './GiftFinder'
import * as bundlesApi from '../api/bundles'

// Wrap with router so useSearchParams works
function renderFinder(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<GiftFinder />} />
      </Routes>
    </MemoryRouter>,
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('GiftFinder', () => {
  it('shows loading state then results', async () => {
    vi.spyOn(bundlesApi, 'searchBundles').mockResolvedValue([
      { id: 1, name: 'Rainbow Fun Pack', description: null, basePrice: 8.99, imageUrl: null, tags: [] },
    ])

    renderFinder()
    expect(screen.getByText('Loading\u2026')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Rainbow Fun Pack')).toBeInTheDocument())
  })

  it('shows error message when API fails', async () => {
    vi.spyOn(bundlesApi, 'searchBundles').mockRejectedValue({ message: 'Service Unavailable' })

    renderFinder()
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Service Unavailable'),
    )
  })

  it('shows empty state when no bundles match', async () => {
    vi.spyOn(bundlesApi, 'searchBundles').mockResolvedValue([])

    renderFinder()
    await waitFor(() =>
      expect(screen.getByTestId('no-results')).toBeInTheDocument(),
    )
  })

  it('calls API with selected age tag when chip is clicked', async () => {
    const spy = vi.spyOn(bundlesApi, 'searchBundles').mockResolvedValue([])

    renderFinder()
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1))

    // Click the "4-8" age chip
    fireEvent.click(screen.getByText('4-8'))

    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith(expect.arrayContaining(['age:4-8']), undefined),
    )
  })

  it('clears all filters when "Clear filters" is clicked', async () => {
    const spy = vi.spyOn(bundlesApi, 'searchBundles').mockResolvedValue([])

    renderFinder()
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getByText('4-8'))
    await waitFor(() => expect(screen.getByText('Clear filters')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Clear filters'))
    await waitFor(() =>
      expect(spy).toHaveBeenLastCalledWith([], undefined),
    )
  })

  it('does not show "Clear filters" when no filters are active', async () => {
    vi.spyOn(bundlesApi, 'searchBundles').mockResolvedValue([])

    renderFinder()
    await waitFor(() => expect(screen.queryByText('Clear filters')).not.toBeInTheDocument())
  })
})
