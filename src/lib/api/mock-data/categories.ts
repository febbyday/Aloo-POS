import { generateId } from '@/lib/utils';

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  parentId?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Generate mock categories
export const categories: Category[] = [
  {
    id: 'cat_electronics',
    name: 'Electronics',
    description: 'Electronic devices and gadgets',
    slug: 'electronics',
    image: '/images/categories/electronics.jpg',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: 'cat_computers',
    name: 'Computers & Laptops',
    description: 'Desktop computers, laptops, and accessories',
    slug: 'computers-laptops',
    parentId: 'cat_electronics',
    image: '/images/categories/computers.jpg',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: 'cat_phones',
    name: 'Smartphones & Tablets',
    description: 'Mobile phones, tablets, and accessories',
    slug: 'smartphones-tablets',
    parentId: 'cat_electronics',
    image: '/images/categories/smartphones.jpg',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: 'cat_audio',
    name: 'Audio & Headphones',
    description: 'Speakers, headphones, and audio accessories',
    slug: 'audio-headphones',
    parentId: 'cat_electronics',
    image: '/images/categories/audio.jpg',
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: 'cat_wearables',
    name: 'Wearable Technology',
    description: 'Smartwatches, fitness trackers, and wearable devices',
    slug: 'wearable-technology',
    parentId: 'cat_electronics',
    image: '/images/categories/wearables.jpg',
    isActive: true,
    sortOrder: 4,
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: 'cat_home_appliances',
    name: 'Home Appliances',
    description: 'Kitchen appliances, home electronics, and household items',
    slug: 'home-appliances',
    image: '/images/categories/home-appliances.jpg',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: 'cat_kitchen',
    name: 'Kitchen Appliances',
    description: 'Appliances for kitchen use',
    slug: 'kitchen-appliances',
    parentId: 'cat_home_appliances',
    image: '/images/categories/kitchen.jpg',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: 'cat_cleaning',
    name: 'Cleaning Appliances',
    description: 'Vacuum cleaners, washing machines, and cleaning devices',
    slug: 'cleaning-appliances',
    parentId: 'cat_home_appliances',
    image: '/images/categories/cleaning.jpg',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: 'cat_furniture',
    name: 'Furniture',
    description: 'Home and office furniture',
    slug: 'furniture',
    image: '/images/categories/furniture.jpg',
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: 'cat_office_furniture',
    name: 'Office Furniture',
    description: 'Desks, chairs, and office storage solutions',
    slug: 'office-furniture',
    parentId: 'cat_furniture',
    image: '/images/categories/office-furniture.jpg',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: 'cat_home_furniture',
    name: 'Home Furniture',
    description: 'Living room, bedroom, and dining room furniture',
    slug: 'home-furniture',
    parentId: 'cat_furniture',
    image: '/images/categories/home-furniture.jpg',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: 'cat_accessories',
    name: 'Accessories',
    description: 'Various accessories for electronics and appliances',
    slug: 'accessories',
    image: '/images/categories/accessories.jpg',
    isActive: true,
    sortOrder: 4,
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString(),
  },
];

export default categories;
