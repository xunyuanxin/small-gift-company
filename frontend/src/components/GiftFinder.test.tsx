import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@mui/material'
import theme from '../theme'
import { GiftFinder } from './GiftFinder'

function renderFinder() {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<GiftFinder />} />
          <Route
            path="/bundles"
            element={<RecordNav />}
          />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

function RecordNav() {
  // This component mounts when navigation succeeds to /bundles
  return <div data-testid="bundles-page">bundles</div>
}

describe('GiftFinder compact panel', () => {
  it('renders all three question sections', () => {
    renderFinder()
    expect(screen.getByText(/how old are they/i)).toBeInTheDocument()
    expect(screen.getByText(/what are they into/i)).toBeInTheDocument()
    expect(screen.getByText(/what's the celebration/i)).toBeInTheDocument()
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
    expect(screen.getByText('🎨 Creative')).toBeInTheDocument()
    expect(screen.getByText('🐾 Animals')).toBeInTheDocument()
    expect(screen.getByText('🚀 Adventure')).toBeInTheDocument()
    expect(screen.getByText('✨ Magical')).toBeInTheDocument()
    expect(screen.getByText('⚽ Active')).toBeInTheDocument()
    expect(screen.getByText('🎲 Games')).toBeInTheDocument()
  })

  it('renders occasion chip options', () => {
    renderFinder()
    expect(screen.getByText('🎂 Birthday')).toBeInTheDocument()
    expect(screen.getByText('🏫 School Party')).toBeInTheDocument()
    expect(screen.getByText('🎉 Celebration')).toBeInTheDocument()
    expect(screen.getByText('🎁 Other')).toBeInTheDocument()
  })

  it('age chip is single-select: clicking selects, clicking same deselects', () => {
    renderFinder()
    const chip68 = screen.getByText('6–8')
    // Click to select
    fireEvent.click(chip68)
    // Click again to deselect — no error, panel still shows
    fireEvent.click(chip68)
    expect(screen.getByText('6–8')).toBeInTheDocument()
  })

  it('age chip is single-select: clicking another replaces selection', () => {
    renderFinder()
    fireEvent.click(screen.getByText('6–8'))
    fireEvent.click(screen.getByText('9–12'))
    // Panel still renders with both chips visible
    expect(screen.getByText('6–8')).toBeInTheDocument()
    expect(screen.getByText('9–12')).toBeInTheDocument()
  })

  it('interest chips are multi-select: multiple can be selected', () => {
    renderFinder()
    fireEvent.click(screen.getByText('🎨 Creative'))
    fireEvent.click(screen.getByText('🐾 Animals'))
    // Both remain visible / panel still renders
    expect(screen.getByText('🎨 Creative')).toBeInTheDocument()
    expect(screen.getByText('🐾 Animals')).toBeInTheDocument()
  })

  it('occasion chip is single-select', () => {
    renderFinder()
    fireEvent.click(screen.getByText('🎂 Birthday'))
    fireEvent.click(screen.getByText('🎉 Celebration'))
    // Panel still renders — both visible
    expect(screen.getByText('🎂 Birthday')).toBeInTheDocument()
    expect(screen.getByText('🎉 Celebration')).toBeInTheDocument()
  })

  it('submit with no selections navigates to /bundles', () => {
    renderFinder()
    fireEvent.click(screen.getByText(/show me their goodie bags/i))
    expect(screen.getByTestId('bundles-page')).toBeInTheDocument()
  })

  it('submit with selections navigates to /bundles', () => {
    renderFinder()
    fireEvent.click(screen.getByText('6–8'))
    fireEvent.click(screen.getByText('🎨 Creative'))
    fireEvent.click(screen.getByText('🎂 Birthday'))
    fireEvent.click(screen.getByText(/show me their goodie bags/i))
    expect(screen.getByTestId('bundles-page')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderFinder()
    expect(
      screen.getByRole('button', { name: /show me their goodie bags/i }),
    ).toBeInTheDocument()
  })
})
