import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Button, Chip, CircularProgress, Stack, Typography,
} from '@mui/material'
import { generateBundle } from '../api/generatedBundles'
import type { Interest, AudiencePreference, PartyType, BudgetTierCode } from '../types/catalog'
import { COLORS } from '../theme'

// ── Option definitions ───────────────────────────────────────────────────────

const AGE_OPTIONS = [
  { value: 4,  label: '3–5'  },
  { value: 7,  label: '6–8'  },
  { value: 10, label: '9–12' },
]

const INTEREST_OPTIONS: { value: Interest; label: string }[] = [
  { value: 'POP_MUSIC',      label: '🎵 Pop Music'        },
  { value: 'TOYS_PLAY',      label: '🧸 Toys & Play'      },
  { value: 'CUTE_MAGICAL',   label: '✨ Cute & Magical'   },
  { value: 'SPORTS',         label: '⚽ Sports'            },
  { value: 'READING_PUZZLE', label: '📚 Reading & Puzzles' },
]

const AUDIENCE_OPTIONS: { value: AudiencePreference; label: string }[] = [
  { value: 'FEMININE',      label: 'Girl'           },
  { value: 'MASCULINE',     label: 'Boy'            },
  { value: 'NO_PREFERENCE', label: 'No Preference'  },
]

const PARTY_OPTIONS: { value: PartyType; label: string }[] = [
  { value: 'CELEBRATION', label: '🎉 Celebration' },
  { value: 'HALLOWEEN',   label: '🎃 Halloween'   },
]

const BUDGET_OPTIONS: { value: BudgetTierCode; label: string }[] = [
  { value: 'LOW',  label: 'Budget-Friendly' },
  { value: 'MID',  label: 'Mid-Range'       },
  { value: 'HIGH', label: 'Premium'         },
]

// ── Shared chip row ──────────────────────────────────────────────────────────

interface ChipRowProps<T extends string | number> {
  options: { value: T; label: string }[]
  selected: T | null
  onSelect: (value: T) => void
}

function ChipRow<T extends string | number>({ options, selected, onSelect }: ChipRowProps<T>) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
      {options.map(({ value, label }) => {
        const isSelected = selected === value
        return (
          <Chip
            key={String(value)}
            label={label}
            onClick={() => onSelect(value)}
            variant={isSelected ? 'filled' : 'outlined'}
            color={isSelected ? 'primary' : 'default'}
            sx={{
              borderColor: isSelected ? undefined : COLORS.border,
              transform: isSelected ? 'scale(1.01)' : 'none',
              cursor: 'pointer',
              minHeight: 36,
            }}
          />
        )
      })}
    </Stack>
  )
}

// ── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="caption"
      component="p"
      sx={{ color: COLORS.muted, fontWeight: 600, mb: 1, mt: 2, fontSize: '0.8rem' }}
    >
      {children}
    </Typography>
  )
}

// ── Session persistence key ──────────────────────────────────────────────────

const SESSION_KEY = 'giftFinderSelections'

interface SavedSelections {
  age:               number | null
  interest:          Interest | null
  audiencePreference: AudiencePreference | null
  partyType:         PartyType | null
  budgetTierCode:    BudgetTierCode | null
}

function loadSelections(): SavedSelections {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw) as SavedSelections
  } catch { /* ignore */ }
  return { age: null, interest: null, audiencePreference: null, partyType: null, budgetTierCode: null }
}

function saveSelections(s: SavedSelections) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

// ── GiftFinder ───────────────────────────────────────────────────────────────

export function GiftFinder() {
  const navigate = useNavigate()

  const saved = loadSelections()
  const [age,                setAge]                = useState<number | null>(saved.age)
  const [interest,           setInterest]           = useState<Interest | null>(saved.interest)
  const [audiencePreference, setAudiencePreference] = useState<AudiencePreference | null>(saved.audiencePreference)
  const [partyType,          setPartyType]          = useState<PartyType | null>(saved.partyType)
  const [budgetTierCode,     setBudgetTierCode]     = useState<BudgetTierCode | null>(saved.budgetTierCode)
  const [submitting,         setSubmitting]         = useState(false)
  const [submitError,        setSubmitError]        = useState<string | null>(null)

  async function handleSubmit() {
    if (!age || !interest) {
      setSubmitError('Please select an age range and an interest.')
      return
    }

    saveSelections({ age, interest, audiencePreference, partyType, budgetTierCode })

    setSubmitting(true)
    setSubmitError(null)
    try {
      const response = await generateBundle({
        age,
        interest,
        audiencePreference: audiencePreference ?? 'NO_PREFERENCE',
        partyType:          partyType          ?? 'CELEBRATION',
        budgetTierCode:     budgetTierCode     ?? 'MID',
      })
      navigate(`/bundleCustomization/${response.generatedBundleId}`)
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const hasAnySelection = age !== null || interest !== null || audiencePreference !== null
    || partyType !== null || budgetTierCode !== null

  function handleClearAll() {
    setAge(null)
    setInterest(null)
    setAudiencePreference(null)
    setPartyType(null)
    setBudgetTierCode(null)
    setSubmitError(null)
    saveSelections({ age: null, interest: null, audiencePreference: null, partyType: null, budgetTierCode: null })
  }

  return (
    <Box
      sx={{
        backgroundColor: '#FFFFFF',
        borderRadius: '22px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        p: { xs: 3, sm: 4 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="h6" component="h2">
          Let's find their favorites ✨
        </Typography>
        {hasAnySelection && (
          <Box
            component="button"
            onClick={handleClearAll}
            sx={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: COLORS.muted,
              fontSize: '0.75rem',
              fontWeight: 500,
              fontFamily: '"DM Sans", Inter, sans-serif',
              px: 1,
              py: 0.25,
              borderRadius: '6px',
              flexShrink: 0,
              ml: 2,
              '&:hover': { color: COLORS.coral, backgroundColor: 'rgba(244,127,107,0.07)' },
              '&:focus-visible': { outline: `2px solid ${COLORS.coral}`, outlineOffset: 2 },
            }}
          >
            Clear all
          </Box>
        )}
      </Box>

      <SectionLabel>① How old are they? <Box component="span" sx={{ color: COLORS.muted, fontSize: '0.75rem', verticalAlign: 'super' }}>*</Box></SectionLabel>
      <ChipRow options={AGE_OPTIONS} selected={age} onSelect={setAge} />

      <SectionLabel>② What are they into? <Box component="span" sx={{ color: COLORS.muted, fontSize: '0.75rem', verticalAlign: 'super' }}>*</Box></SectionLabel>
      <ChipRow options={INTEREST_OPTIONS} selected={interest} onSelect={setInterest} />

      <SectionLabel>③ Girl or boy?</SectionLabel>
      <ChipRow options={AUDIENCE_OPTIONS} selected={audiencePreference} onSelect={setAudiencePreference} />

      <SectionLabel>④ What's the celebration?</SectionLabel>
      <ChipRow options={PARTY_OPTIONS} selected={partyType} onSelect={setPartyType} />

      <SectionLabel>⑤ Budget?</SectionLabel>
      <ChipRow options={BUDGET_OPTIONS} selected={budgetTierCode} onSelect={setBudgetTierCode} />

      {submitError && (
        <Typography
          role="alert"
          sx={{ color: COLORS.muted, fontSize: '0.875rem', mt: 2 }}
        >
          {submitError}
        </Typography>
      )}

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={handleSubmit}
        disabled={submitting}
        sx={{
          mt: 3,
          backgroundColor: COLORS.coral,
          '&:hover': { backgroundColor: '#e06b57' },
          fontSize: '1rem',
          py: 1.5,
        }}
      >
        {submitting ? (
          <CircularProgress size={20} sx={{ color: '#fff' }} />
        ) : (
          'Ready, Set, Gift! →'
        )}
      </Button>
    </Box>
  )
}
