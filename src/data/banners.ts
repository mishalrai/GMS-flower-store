export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
}

export const banners: Banner[] = [
  {
    id: 1,
    title: 'Bring Nature Home',
    subtitle:
      'Discover our hand-picked collection of indoor and outdoor plants, grown with love in Gauradaha, Jhapa.',
    buttonText: 'Shop Now',
    buttonLink: '/products',
    image: '/images/banners/banner-1.jpg',
  },
  {
    id: 2,
    title: 'Monsoon Sale — Up to 30% Off',
    subtitle:
      'Refresh your garden this monsoon season with our vibrant outdoor flowering plants at special prices.',
    buttonText: 'View Offers',
    buttonLink: '/products?category=outdoor-plants',
    image: '/images/banners/banner-2.jpg',
  },
  {
    id: 3,
    title: 'Gift a Plant, Share the Joy',
    subtitle:
      'Looking for the perfect gift? Our curated plant gift sets make every occasion special.',
    buttonText: 'Explore Gifts',
    buttonLink: '/products?category=gift-plants',
    image: '/images/banners/banner-3.jpg',
  },
];
