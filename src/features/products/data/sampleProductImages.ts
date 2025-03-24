// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
/**
 * Sample product images for demonstration purposes
 */

export const productImageCategories = {
  electronics: [
    '/images/products/electronics-1.jpg',
    '/images/products/electronics-2.jpg',
    '/images/products/electronics-3.jpg',
    '/images/products/electronics-4.jpg',
  ],
  clothing: [
    '/images/products/clothing-1.jpg',
    '/images/products/clothing-2.jpg',
    '/images/products/clothing-3.jpg',
    '/images/products/clothing-4.jpg',
  ],
  furniture: [
    '/images/products/furniture-1.jpg',
    '/images/products/furniture-2.jpg',
    '/images/products/furniture-3.jpg',
  ],
  food: [
    '/images/products/food-1.jpg',
    '/images/products/food-2.jpg',
    '/images/products/food-3.jpg',
  ],
  beauty: [
    '/images/products/beauty-1.jpg',
    '/images/products/beauty-2.jpg',
    '/images/products/beauty-3.jpg',
  ],
  default: [
    '/images/products/default-1.jpg',
    '/images/products/default-2.jpg',
  ],
};

/**
 * Get sample images for a product based on its category
 * @param category Product category
 * @param count Number of images to return
 * @returns Array of image URLs
 */
export function getSampleProductImages(category?: string, count: number = 3): string[] {
  // Default placeholder images if no real images are available yet
  const placeholders = [
    'https://placehold.co/600x400?text=Product+Image+1',
    'https://placehold.co/600x400?text=Product+Image+2',
    'https://placehold.co/600x400?text=Product+Image+3',
    'https://placehold.co/600x400?text=Product+Image+4',
  ];
  
  // Map the category to our sample categories
  let categoryKey: keyof typeof productImageCategories = 'default';
  
  if (category) {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('electron')) categoryKey = 'electronics';
    else if (lowerCategory.includes('cloth') || lowerCategory.includes('apparel')) categoryKey = 'clothing';
    else if (lowerCategory.includes('furni')) categoryKey = 'furniture';
    else if (lowerCategory.includes('food') || lowerCategory.includes('grocery')) categoryKey = 'food';
    else if (lowerCategory.includes('beauty') || lowerCategory.includes('cosmetic')) categoryKey = 'beauty';
  }
  
  // Return placeholder images for now since we don't have real images yet
  return placeholders.slice(0, count);
}
