export interface Product {
  id: number;
  name: string;
  slug: string;
  category: 'indoor' | 'outdoor';
  price: number;
  salePrice?: number;
  image: string;
  description: string;
  size: 'small' | 'medium' | 'large';
  badge: 'NEW' | 'HOT' | 'SALE' | null;
  rating: number;
  inStock: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export const products: Product[] = [
  // Indoor Plants
  {
    id: 1,
    name: 'Money Plant',
    slug: 'money-plant',
    category: 'indoor',
    price: 350,
    image: '/images/plants/plant-1.jpg',
    description:
      'A beautiful and easy-to-care-for money plant that brings prosperity and good luck to your home. Thrives in indirect sunlight and requires minimal watering.',
    size: 'small',
    badge: 'HOT',
    rating: 4.8,
    inStock: true,
  },
  {
    id: 2,
    name: 'Snake Plant',
    slug: 'snake-plant',
    category: 'indoor',
    price: 650,
    salePrice: 550,
    image: '/images/plants/plant-2.jpg',
    description:
      'Also known as Sansevieria, the snake plant is one of the best air-purifying plants. Perfect for bedrooms as it releases oxygen at night.',
    size: 'medium',
    badge: 'SALE',
    rating: 4.7,
    inStock: true,
  },
  {
    id: 3,
    name: 'Peace Lily',
    slug: 'peace-lily',
    category: 'indoor',
    price: 800,
    image: '/images/plants/plant-3.jpg',
    description:
      'An elegant flowering indoor plant known for its white blooms and excellent air-purifying qualities. Ideal for low-light environments.',
    size: 'medium',
    badge: 'NEW',
    rating: 4.9,
    inStock: true,
  },
  {
    id: 4,
    name: 'Spider Plant',
    slug: 'spider-plant',
    category: 'indoor',
    price: 300,
    image: '/images/plants/plant-4.jpg',
    description:
      'A hardy and adaptable plant with arching green and white striped leaves. Great for hanging baskets and known for removing indoor pollutants.',
    size: 'small',
    badge: null,
    rating: 4.5,
    inStock: true,
  },
  {
    id: 5,
    name: 'Pothos',
    slug: 'pothos',
    category: 'indoor',
    price: 250,
    image: '/images/plants/plant-5.jpg',
    description:
      'A trailing vine plant that is nearly impossible to kill. Perfect for beginners and looks stunning in hanging pots or climbing on a moss pole.',
    size: 'small',
    badge: 'HOT',
    rating: 4.6,
    inStock: true,
  },
  {
    id: 6,
    name: 'Jade Plant',
    slug: 'jade-plant',
    category: 'indoor',
    price: 500,
    salePrice: 420,
    image: '/images/plants/plant-6.jpg',
    description:
      'A beautiful succulent with thick, woody stems and oval-shaped leaves. Symbolizes good luck and prosperity in many Asian cultures.',
    size: 'small',
    badge: 'SALE',
    rating: 4.4,
    inStock: true,
  },
  {
    id: 7,
    name: 'Aloe Vera',
    slug: 'aloe-vera',
    category: 'indoor',
    price: 400,
    image: '/images/plants/plant-7.jpg',
    description:
      'A medicinal succulent known for its healing gel. Easy to grow and perfect for sunny windowsills. Great for treating minor burns and skin irritations.',
    size: 'small',
    badge: null,
    rating: 4.7,
    inStock: true,
  },
  {
    id: 8,
    name: 'Rubber Plant',
    slug: 'rubber-plant',
    category: 'indoor',
    price: 1500,
    image: '/images/plants/plant-8.jpg',
    description:
      'A striking indoor tree with large, glossy dark green leaves. Makes a bold statement in any room and is excellent at purifying indoor air.',
    size: 'large',
    badge: 'NEW',
    rating: 4.6,
    inStock: true,
  },

  // Outdoor Plants
  {
    id: 9,
    name: 'Marigold',
    slug: 'marigold',
    category: 'outdoor',
    price: 200,
    image: '/images/plants/plant-9.jpg',
    description:
      'Bright and cheerful marigolds are a staple in Nepali gardens and festivals. Easy to grow and blooms abundantly throughout the season.',
    size: 'small',
    badge: null,
    rating: 4.5,
    inStock: true,
  },
  {
    id: 10,
    name: 'Dahlia',
    slug: 'dahlia',
    category: 'outdoor',
    price: 750,
    salePrice: 600,
    image: '/images/plants/plant-10.jpg',
    description:
      'Stunning flowers with intricate petal patterns available in vibrant colors. A showstopper in any garden throughout the Terai region.',
    size: 'medium',
    badge: 'SALE',
    rating: 4.8,
    inStock: true,
  },
  {
    id: 11,
    name: 'Rose',
    slug: 'rose',
    category: 'outdoor',
    price: 1200,
    image: '/images/plants/plant-11.jpg',
    description:
      'The queen of flowers, our rose plants produce fragrant blooms in deep red. Perfect for gardens in the Jhapa climate and makes wonderful cut flowers.',
    size: 'medium',
    badge: 'HOT',
    rating: 4.9,
    inStock: true,
  },
  {
    id: 12,
    name: 'Hibiscus',
    slug: 'hibiscus',
    category: 'outdoor',
    price: 900,
    image: '/images/plants/plant-12.jpg',
    description:
      'Tropical flowering plant with large, colorful blooms. Thrives in the warm climate of Gauradaha and attracts butterflies and hummingbirds.',
    size: 'medium',
    badge: null,
    rating: 4.6,
    inStock: true,
  },
  {
    id: 13,
    name: 'Jasmine',
    slug: 'jasmine',
    category: 'outdoor',
    price: 550,
    image: '/images/plants/plant-13.jpg',
    description:
      'Fragrant white flowers that fill your garden with a sweet aroma, especially in the evening. A beloved plant in Nepali households for puja and decoration.',
    size: 'small',
    badge: 'NEW',
    rating: 4.7,
    inStock: true,
  },
  {
    id: 14,
    name: 'Bougainvillea',
    slug: 'bougainvillea',
    category: 'outdoor',
    price: 1800,
    salePrice: 1500,
    image: '/images/plants/plant-14.jpg',
    description:
      'A vigorous climbing plant covered in vibrant magenta bracts. Perfect for walls, fences, and pergolas. Drought-tolerant once established.',
    size: 'large',
    badge: 'SALE',
    rating: 4.5,
    inStock: true,
  },
  {
    id: 15,
    name: 'Chrysanthemum',
    slug: 'chrysanthemum',
    category: 'outdoor',
    price: 450,
    image: '/images/plants/plant-15.jpg',
    description:
      'Beautiful autumn-blooming flowers in shades of yellow, white, and purple. Popular during Tihar festival for garlands and decoration.',
    size: 'small',
    badge: null,
    rating: 4.4,
    inStock: false,
  },
  {
    id: 16,
    name: 'Sunflower',
    slug: 'sunflower',
    category: 'outdoor',
    price: 2500,
    image: '/images/plants/plant-16.jpg',
    description:
      'Tall and majestic sunflowers that brighten up any garden. Grows well in the fertile soil of Jhapa and produces edible seeds when mature.',
    size: 'large',
    badge: 'HOT',
    rating: 4.8,
    inStock: true,
  },
];

export const categories: Category[] = [
  {
    id: 1,
    name: 'Indoor Plants',
    slug: 'indoor-plants',
    image: '/images/categories/indoor-plants.jpg',
    description:
      'Transform your living space with our collection of beautiful indoor plants, perfect for homes and offices in Nepal.',
  },
  {
    id: 2,
    name: 'Outdoor Plants',
    slug: 'outdoor-plants',
    image: '/images/categories/outdoor-plants.jpg',
    description:
      'Hardy and vibrant outdoor plants suited for the Terai climate, ideal for gardens, balconies, and patios.',
  },
  {
    id: 3,
    name: 'Succulents',
    slug: 'succulents',
    image: '/images/categories/succulents.jpg',
    description:
      'Low-maintenance succulents and cacti that thrive with minimal care. Perfect for busy plant parents.',
  },
  {
    id: 4,
    name: 'Flowering Plants',
    slug: 'flowering-plants',
    image: '/images/categories/flowering-plants.jpg',
    description:
      'Add a splash of color to your space with our gorgeous flowering plants, from roses to jasmine and beyond.',
  },
  {
    id: 5,
    name: 'Air Purifying',
    slug: 'air-purifying',
    image: '/images/categories/air-purifying.jpg',
    description:
      'Breathe cleaner air with our selection of NASA-recommended air-purifying plants for healthier indoor living.',
  },
  {
    id: 6,
    name: 'Gift Plants',
    slug: 'gift-plants',
    image: '/images/categories/gift-plants.jpg',
    description:
      'Thoughtful and unique plant gifts for every occasion — birthdays, housewarmings, festivals, and more.',
  },
];
