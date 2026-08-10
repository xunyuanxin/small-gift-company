import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@mui/material'
import theme from '../theme'
import { GiftFinder } from './GiftFinder'
import * as generatedBundlesApi from '../api/generatedBundles'
import type { GeneratedBundleResponse } from '../types/catalog'

afterEach(() => vi.restoreAllMocks())

const GENERATED_BUNDLE_STUB: GeneratedBundleResponse = {
  generatedBundleId: 'gb_test123456',
  templateCode: 'GENERAL_4_ITEM',
  standardItemCogsSnapshot: 9.50,
  items: [],
  upgrade: null,
  giftBag: { code: 'CLASSIC_BAG', name: 'Classic Party Bag', retailPriceAdjustment: null, isDefault: true },
}

function renderFinder() {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<GiftFinder />} />
          <Route path="/bundleCustomization/:bundleId" element={<div data-testid="configurator-page" />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('GiftFinder — layout', () => {
  it('renders all five question sections', () => {
    renderFinder()
    expect(screen.getByText(/how old are they/i)).toBeInTheDocument()
    expect(screen.getByText(/what are they into/i)).toBeInTheDocument()
    expect(screen.getByText(/girl or boy/i)).toBeInTheDocument()
    expect(screen.getByText(/what's the celebration/i)).toBeInTheDocument()
    expect(screen.getByText('⑤ Budget?')).toBeInTheDocument()
  })

  it('renders the panel title', () => {
    renderFinder()
    expect(screen.getByText(/let's find their favorites/i)).toBeInTheDocument()
  })

  it('renders age chip options', () => {
    renderFinder()
    expect(screen.getByText('3–5')).toBeInTheDocument()
    expect(screen.getByText('6–8')).toBeInTheDocument()
    expect(screen.getByText('9–12')).toBeInTheDocument()
  })

  it('renders interest chip options', () => {
    renderFinder()
    expect(screen.getByText('🎵 Pop Music')).toBeInTheDocument()
    expect(screen.getByText('🧸 Toys & Play')).toBeInTheDocument()
    expect(screen.getByText('✨ Cute & Magical')).toBeInTheDocument()
    expect(screen.getByText('⚽ Sports')).toBeInTheDocument()
    expect(screen.getByText('📚 Reading & Puzzles')).toBeInTheDocument()
  })

  it('renders audience chip options', () => {
    renderFinder()
    expect(screen.getByText('Girl')).toBeInTheDocument()
    expect(screen.getByText('Boy')).toBeInTheDocument()
    expect(screen.getByText('No Preference')).toBeInTheDocument()
  })

  it('renders party type chip options', () => {
    renderFinder()
    expect(screen.getByText('🎉 Celebration')).toBeInTheDocument()
    expect(screen.getByText('🎃 Halloween')).toBeInTheDocument()
  })

  it('renders budget chip options', () => {
    renderFinder()
    expect(screen.getByText('Budget-Friendly')).toBeInTheDocument()
    expect(screen.getByText('Mid-Range')).toBeInTheDocument()
    expect(screen.getByText('Premium')).toBeInTheDocument()
  })

  it('renders submit button with singular label', () => {
    renderFinder()
    expect(
      screen.getByRole('button', { name: /show me their goodie bag →/i }),
    ).toBeInTheDocument()
  })
})

describe('GiftFinder — chip selection', () => {
  it('age chip is single-select: clicking same chip deselects it', () => {
    renderFinder()
    const chip = screen.getByText('6–8')
    fireEvent.click(chip)
    fireEvent.click(chip)
    expect(screen.getByText('6–8')).toBeInTheDocument()
  })

  it('age chip is single-select: clicking another replaces selection', () => {
    renderFinder()
    fireEvent.click(screen.getByText('6–8'))
    fireEvent.click(screen.getByText('9–12'))
    expect(screen.getByText('6–8')).toBeInTheDocument()
    expect(screen.getByText('9–12')).toBeInTheDocument()
  })

  it('interest chip is single-select', () => {
    renderFinder()
    fireEvent.click(screen.getByText('🎵 Pop Music'))
    fireEvent.click(screen.getByText('⚽ Sports'))
    expect(screen.getByText('🎵 Pop Music')).toBeInTheDocument()
    expect(screen.getByText('⚽ Sports')).toBeInTheDocument()
  })

  it('audience chip is single-select', () => {
    renderFinder()
    fireEvent.click(screen.getByText('Girl'))
    fireEvent.click(screen.getByText('Boy'))
    expect(screen.getByText('Girl')).toBeInTheDocument()
    expect(screen.getByText('Boy')).toBeInTheDocument()
  })

  it('party type chip is single-select', () => {
    renderFinder()
    fireEvent.click(screen.getByText('🎉 Celebration'))
    fireEvent.click(screen.getByText('🎃 Halloween'))
    expect(screen.getByText('🎉 Celebration')).toBeInTheDocument()
    expect(screen.getByText('🎃 Halloween')).toBeInTheDocument()
  })

  it('budget chip is single-select', () => {
    renderFinder()
    fireEvent.click(screen.getByText('Budget-Friendly'))
    fireEvent.click(screen.getByText('Premium'))
    expect(screen.getByText('Budget-Friendly')).toBeInTheDocument()
    expect(screen.getByText('Premium')).toBeInTheDocument()
  })
})

describe('GiftFinder — recommendation navigation', () => {
  it('submit navigates to /bundleCustomization/:publicId after selecting age and interest', async () => {
    vi.spyOn(generatedBundlesApi, 'generateBundle').mockResolvedValue(GENERATED_BUNDLE_STUB)
    renderFinder()
    fireEvent.click(screen.getByText('6–8'))
    fireEvent.click(screen.getByText('🎵 Pop Music'))
    fireEvent.click(screen.getByRole('button', { name: /show me their goodie bag/i }))
    await waitFor(() =>
      expect(screen.getByTestId('configurator-page')).toBeInTheDocument(),
    )
  })

  it('shows error when age/interest not selected and submit is clicked', async () => {
    renderFinder()
    fireEvent.click(screen.getByRole('button', { name: /show me their goodie bag/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.getByRole('alert')).toHaveTextContent(/please select an age range and an interest/i)
  })

  it('shows error when age is selected but interest is not', async () => {
    renderFinder()
    fireEvent.click(screen.getByText('6–8'))
    fireEvent.click(screen.getByRole('button', { name: /show me their goodie bag/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.getByRole('alert')).toHaveTextContent(/please select an age range and an interest/i)
  })

  it('shows error message when API call fails', async () => {
    vi.spyOn(generatedBundlesApi, 'generateBundle').mockRejectedValue(new Error('Network error'))
    renderFinder()
    fireEvent.click(screen.getByText('6–8'))
    fireEvent.click(screen.getByText('🎵 Pop Music'))
    fireEvent.click(screen.getByRole('button', { name: /show me their goodie bag/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.getByRole('alert')).toHaveTextContent(/something went wrong/i)
  })

  it('defaults audiencePreference, partyType, and budgetTierCode when not selected', async () => {
    const spy = vi.spyOn(generatedBundlesApi, 'generateBundle').mockResolvedValue(GENERATED_BUNDLE_STUB)
    renderFinder()
    fireEvent.click(screen.getByText('6–8'))
    fireEvent.click(screen.getByText('🎵 Pop Music'))
    fireEvent.click(screen.getByRole('button', { name: /show me their goodie bag/i }))
    await waitFor(() =>
      expect(screen.getByTestId('configurator-page')).toBeInTheDocument(),
    )
    expect(spy).toHaveBeenCalledWith({
      age: 7,
      interest: 'POP_MUSIC',
      audiencePreference: 'NO_PREFERENCE',
      partyType: 'CELEBRATION',
      budgetTierCode: 'MID',
    })
  })
})
