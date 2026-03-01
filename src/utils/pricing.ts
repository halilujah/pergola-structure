import type { BOMItem, BOMOverride, PricingConfig } from '../types'

export interface PricingBreakdown {
  materialCost: number
  laborCost: number
  subtotal: number
  overhead: number
  subtotalWithOverhead: number
  markup: number
  priceBeforeDiscount: number
  discount: number
  priceBeforeTax: number
  tax: number
  total: number
}

export function calculatePricing(
  items: BOMItem[],
  overrides: Record<string, BOMOverride>,
  pricing: PricingConfig,
): PricingBreakdown {
  const materialCost = items.reduce((sum, item) => {
    const qty = overrides[item.id]?.quantity ?? item.quantity
    return sum + qty * item.unitPrice
  }, 0)

  const laborCost = pricing.laborRate * pricing.laborHours

  const subtotal = materialCost + laborCost
  const overhead = subtotal * (pricing.overheadPercent / 100)
  const subtotalWithOverhead = subtotal + overhead
  const markup = subtotalWithOverhead * (pricing.markupPercent / 100)
  const priceBeforeDiscount = subtotalWithOverhead + markup
  const discount = priceBeforeDiscount * (pricing.discountPercent / 100)
  const priceBeforeTax = priceBeforeDiscount - discount
  const tax = priceBeforeTax * (pricing.taxPercent / 100)
  const total = priceBeforeTax + tax

  return {
    materialCost: round2(materialCost),
    laborCost: round2(laborCost),
    subtotal: round2(subtotal),
    overhead: round2(overhead),
    subtotalWithOverhead: round2(subtotalWithOverhead),
    markup: round2(markup),
    priceBeforeDiscount: round2(priceBeforeDiscount),
    discount: round2(discount),
    priceBeforeTax: round2(priceBeforeTax),
    tax: round2(tax),
    total: round2(total),
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export interface RevisionDelta {
  itemId: string
  description: string
  oldQty: number
  newQty: number
  oldLineTotal: number
  newLineTotal: number
  delta: number
}

export function compareRevisions(
  items: BOMItem[],
  oldOverrides: Record<string, BOMOverride>,
  newOverrides: Record<string, BOMOverride>,
): RevisionDelta[] {
  return items
    .map(item => {
      const oldQty = oldOverrides[item.id]?.quantity ?? item.quantity
      const newQty = newOverrides[item.id]?.quantity ?? item.quantity
      if (oldQty === newQty) return null
      return {
        itemId: item.id,
        description: item.description,
        oldQty,
        newQty,
        oldLineTotal: oldQty * item.unitPrice,
        newLineTotal: newQty * item.unitPrice,
        delta: (newQty - oldQty) * item.unitPrice,
      }
    })
    .filter((d): d is RevisionDelta => d !== null)
}
