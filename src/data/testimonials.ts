export interface Testimonial {
  id: number;
  name: string;
  location: string;
  text: string;
  rating: number;
  avatar: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sita Sharma',
    location: 'Gauradaha, Jhapa',
    text: 'I ordered a set of indoor plants from GMS and they arrived in perfect condition. The money plant and snake plant are thriving in my living room. Highly recommend for anyone in Jhapa!',
    rating: 5,
    avatar: '/images/avatars/avatar-1.jpg',
  },
  {
    id: 2,
    name: 'Rajesh Thapa',
    location: 'Biratnagar, Morang',
    text: 'Excellent quality plants at very reasonable prices. I bought rose and jasmine plants for my garden, and they started blooming within weeks. The delivery to Biratnagar was fast too.',
    rating: 5,
    avatar: '/images/avatars/avatar-2.jpg',
  },
  {
    id: 3,
    name: 'Anita Rai',
    location: 'Kathmandu',
    text: 'As someone living in Kathmandu, I was worried about shipping. But the plants arrived healthy and well-packaged. The peace lily has become the centerpiece of my apartment!',
    rating: 4,
    avatar: '/images/avatars/avatar-3.jpg',
  },
  {
    id: 4,
    name: 'Bikram Limbu',
    location: 'Damak, Jhapa',
    text: 'GMS Flower Store is the best nursery in the Jhapa area. I have been buying plants from them for over a year now and the quality is always consistent. Great customer service too.',
    rating: 5,
    avatar: '/images/avatars/avatar-4.jpg',
  },
  {
    id: 5,
    name: 'Puja Adhikari',
    location: 'Birtamode, Jhapa',
    text: 'Bought gift plants for my sister\'s housewarming and she absolutely loved them. The jade plant and aloe vera came in beautiful pots. Will definitely order again!',
    rating: 4,
    avatar: '/images/avatars/avatar-5.jpg',
  },
  {
    id: 6,
    name: 'Sunil Karki',
    location: 'Itahari, Sunsari',
    text: 'The bougainvillea and marigolds I purchased have completely transformed my garden. My neighbors keep asking where I got such beautiful plants. Thank you, GMS!',
    rating: 5,
    avatar: '/images/avatars/avatar-6.jpg',
  },
];
