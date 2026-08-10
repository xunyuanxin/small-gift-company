import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material'
import theme from '../theme'
import { BundleGallery } from './BundleGallery'
import type { BundleDto } from '../types/catalog'

function renderGallery(bundles: BundleDto[]) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <BundleGallery bundles={bundles} />
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

describe('BundleGallery', () => {
  it('renders a card for each bundle', () => {
    renderGallery([sampleBundle, { ...sampleBundle, id: 2, name: 'Sticker Blast' }])
    expect(screen.getByText('Rainbow Fun Pack')).toBeInTheDocument()
    expect(screen.getByText('Sticker Blast')).toBeInTheDocument()
  })

  it('shows empty state when bundle list is empty', () => {
    renderGallery([])
    expect(screen.getByTestId('no-results')).toBeInTheDocument()
  })

  it('displays formatted price per guest', () => {
    renderGallery([sampleBundle])
    expect(screen.getByText('$8.99 / guest')).toBeInTheDocument()
  })

  it('displays theme line derived from tags', () => {
    renderGallery([sampleBundle])
    expect(screen.getByText('🎨 Creative · Ages 6–8')).toBeInTheDocument()
  })

  it('does NOT expose unit costs of items', () => {
    renderGallery([sampleBundle])
    expect(screen.queryByText(/unitCost/i)).not.toBeInTheDocument()
  })

  it('does NOT expose SKU values', () => {
    renderGallery([sampleBundle])
    expect(screen.queryByText(/sku/i)).not.toBeInTheDocument()
  })
})
