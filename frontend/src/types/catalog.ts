export interface BundleDto {
  id: number
  name: string
  description: string | null
  basePrice: number
  imageUrl: string | null
  tags: string[]
}

export interface BundleItemDto {
  sku: string
  name: string
  quantityPerBundle: number
  replaceable: boolean
  unitCost: number
}

export interface BundleDetailDto extends BundleDto {
  items: BundleItemDto[]
}
