import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BundleGallery } from './BundleGallery'
import type { BundleDto } from '../types/catalog'

function renderGallery(bundles: BundleDto[]) {
  return render(
    <MemoryRouter>
      <BundleGallery bundles={bundles} />
    </MemoryRouter>,
  )
}

const sampleBundle: BundleDto = {
  id: 1,
  name: 'Rainbow Fun Pack',
  description: 'Fun stuff',
  basePrice: 8.99,
  imageUrl: null,
  tags: ['age:4-8', 'interest:art'],
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

  it('displays formatted price', () => {
    renderGallery([sampleBundle])
    expect(screen.getByText('$8.99')).toBeInTheDocument()
  })

  it('renders tags as chips', () => {
    renderGallery([sampleBundle])
    expect(screen.getByText('age:4-8')).toBeInTheDocument()
    expect(screen.getByText('interest:art')).toBeInTheDocument()
  })

  it('does NOT expose unit costs of items', () => {
    renderGallery([sampleBundle])
    // unitCost is an internal server-authoritative field; must never appear in list view
    expect(screen.queryByText(/unitCost/i)).not.toBeInTheDocument()
  })
})
