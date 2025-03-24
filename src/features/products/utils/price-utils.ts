export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

export const calculateDiscountPercentage = (
  originalPrice: number,
  discountedPrice: number
): number => {
  return ((originalPrice - discountedPrice) / originalPrice) * 100
}

export const calculateDiscountedPrice = (
  originalPrice: number,
  discountPercentage: number
): number => {
  return originalPrice * (1 - discountPercentage / 100)
}

export const calculateBulkPrice = (
  basePrice: number,
  quantity: number,
  discountTiers: { quantity: number; discount: number }[]
): number => {
  const applicableTier = discountTiers
    .sort((a, b) => b.quantity - a.quantity)
    .find((tier) => quantity >= tier.quantity)

  if (!applicableTier) return basePrice

  return calculateDiscountedPrice(basePrice, applicableTier.discount)
}
