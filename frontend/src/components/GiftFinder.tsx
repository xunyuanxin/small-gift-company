import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import { COLORS } from '../theme'

// ── Tag option definitions ───────────────────────────────────────────────────

const AGE_OPTIONS = [
  { tag: 'age:3-5',  label: '3–5' },
  { tag: 'age:6-8',  label: '6–8' },
  { tag: 'age:9-12', label: '9–12' },
]

const INTEREST_OPTIONS = [
  { tag: 'interest:creative',  label: '🎨 Creative' },
  { tag: 'interest:animals',   label: '🐾 Animals' },
  { tag: 'interest:adventure', label: '🚀 Adventure' },
  { tag: 'interest:magical',   label: '✨ Magical' },
  { tag: 'interest:active',    label: '⚽ Active' },
  { tag: 'interest:games',     label: '🎲 Games' },
]

const OCCASION_OPTIONS = [
  { tag: 'party:birthday',    label: '🎂 Birthday' },
  { tag: 'party:school',      label: '🏫 School Party' },
  { tag: 'party:celebration', label: '🎉 Celebration' },
  { tag: 'party:other',       label: '🎁 Other' },
]

// ── Shared chip row ──────────────────────────────────────────────────────────

interface ChipRowProps {
  options: { tag: string; label: string }[]
  selected: string[]
  onToggle: (tag: string) => void
}

function ChipRow({ options, selected, onToggle }: ChipRowProps) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
      {options.map(({ tag, label }) => {
        const isSelected = selected.includes(tag)
        return (
          <Chip
            key={tag}
            label={label}
            onClick={() => onToggle(tag)}
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

// ── GiftFinder ───────────────────────────────────────────────────────────────

export function GiftFinder() {
  const navigate = useNavigate()
  const [ageTag,       setAgeTag]       = useState<string | null>(null)
  const [interestTags, setInterestTags] = useState<string[]>([])
  const [occasionTag,  setOccasionTag]  = useState<string | null>(null)

  function toggleAge(tag: string) {
    setAgeTag((prev) => (prev === tag ? null : tag))
  }

  function toggleInterest(tag: string) {
    setInterestTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  function toggleOccasion(tag: string) {
    setOccasionTag((prev) => (prev === tag ? null : tag))
  }

  function handleSubmit() {
    const params = new URLSearchParams()
    if (ageTag) params.append('tag', ageTag)
    interestTags.forEach((t) => params.append('tag', t))
    if (occasionTag) params.append('tag', occasionTag)
    navigate('/bundles?' + params.toString())
  }

  const ageSelected      = ageTag      ? [ageTag]      : []
  const occasionSelected = occasionTag ? [occasionTag] : []

  return (
    <Box
      sx={{
        backgroundColor: '#FFFFFF',
        border: `1px solid ${COLORS.border}`,
        borderRadius: '22px',
        p: { xs: 3, sm: 4 },
      }}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        Let's find their favorites ✨
      </Typography>

      <SectionLabel>① How old are they?</SectionLabel>
      <ChipRow
        options={AGE_OPTIONS}
        selected={ageSelected}
        onToggle={toggleAge}
      />

      <SectionLabel>② What are they into?</SectionLabel>
      <ChipRow
        options={INTEREST_OPTIONS}
        selected={interestTags}
        onToggle={toggleInterest}
      />

      <SectionLabel>③ What's the celebration?</SectionLabel>
      <ChipRow
        options={OCCASION_OPTIONS}
        selected={occasionSelected}
        onToggle={toggleOccasion}
      />

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={handleSubmit}
        sx={{
          mt: 3,
          backgroundColor: COLORS.coral,
          '&:hover': { backgroundColor: '#e06b57' },
          fontSize: '1rem',
          py: 1.5,
        }}
      >
        Show Me Their Goodie Bags →
      </Button>
    </Box>
  )
}
