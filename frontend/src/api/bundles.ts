import { api } from './client'
import type { BundleDetailDto, BundleDto } from '../types/catalog'

export function searchBundles(tags: string[], maxPrice?: number): Promise<BundleDto[]> {
  const params = new URLSearchParams()
  tags.forEach((t) => params.append('tag', t))
  if (maxPrice !== undefined) params.set('maxPrice', String(maxPrice))
  const qs = params.toString()
  return api.get<BundleDto[]>(`/api/bundles${qs ? `?${qs}` : ''}`)
}

export function getBundleDetail(id: number): Promise<BundleDetailDto> {
  return api.get<BundleDetailDto>(`/api/bundles/${id}`)
}
