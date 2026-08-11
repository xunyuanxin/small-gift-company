export type AudiencePreference = 'FEMININE' | 'MASCULINE' | 'NO_PREFERENCE'

export type Interest = 'POP_MUSIC' | 'TOYS_PLAY' | 'CUTE_MAGICAL' | 'SPORTS' | 'READING_PUZZLE'

export type PartyType = 'CELEBRATION' | 'HALLOWEEN'

export type BudgetTierCode = 'LOW' | 'MID' | 'HIGH'

export interface BundleGenerationRequest {
  age: number
  audiencePreference: AudiencePreference
  interest: Interest
  partyType: PartyType
  budgetTierCode: BudgetTierCode
}

export interface GeneratedBundleItemDto {
  slotCode: string
  productName: string
  sku: string
  description: string | null
  formFactor: string
  quantityPerBag: number
  displayOrder: number
}

export interface GeneratedBundleUpgradeDto {
  productName: string
  sku: string
  retailPriceAdjustment: number | null
}

export interface GeneratedBundleGiftBagDto {
  code: string
  name: string
  retailPriceAdjustment: number | null
  isDefault: boolean
}

export interface GeneratedBundleResponse {
  generatedBundleId: string
  templateCode: string
  standardItemCogsSnapshot: number
  items: GeneratedBundleItemDto[]
  upgrade: GeneratedBundleUpgradeDto | null
  giftBag: GeneratedBundleGiftBagDto | null
}
