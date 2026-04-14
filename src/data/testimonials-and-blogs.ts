// ─── Testimonial/Rating Type ──────────────────────────────────────
export type Testimonial = {
  id: string;
  name: string;
  title: string; // e.g., "Traveler", "Adventure Enthusiast"
  image: string;
  rating: number; // 1-5
  text: string;
  source?: string; // e.g., "Google", "Verified Guest"
  date: string;
};

// ─── Experience/Blog Type ─────────────────────────────────────────
export type Experience = {
  id: string;
  title: string;
  description: string;
  content?: string;
  image: string;
  category: string;
  author?: string;
  readTime?: number;
  date: string;
  featured: boolean;
};

// ─── Sample Testimonials ──────────────────────────────────────────
export const testimonials: Testimonial[] = [
  {
    id: "testimonial-1",
    name: "Sarah Mitchell",
    title: "Adventure Traveler",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    rating: 5,
    text: "Trayati Stays transformed how I travel. The properties are unique, the service is impeccable, and the experiences are truly unforgettable.",
    source: "Verified Guest",
    date: "2024-03-15",
  },
  {
    id: "testimonial-2",
    name: "Raj Kumar",
    title: "Solo Traveler",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    rating: 5,
    text: "Found the perfect retreat at one of the villas. The attention to detail and personalized service made this my best travel experience.",
    source: "Google Review",
    date: "2024-03-10",
  },
  {
    id: "testimonial-3",
    name: "Priya Sharma",
    title: "Wellness Enthusiast",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    rating: 4.8,
    text: "A sanctuary for relaxation and rejuvenation. Trayati's selection of properties truly understands what conscious travelers are looking for.",
    source: "Verified Guest",
    date: "2024-03-05",
  },
  {
    id: "testimonial-4",
    name: "Michael Chen",
    title: "Corporate Retreat Organizer",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    rating: 5,
    text: "Organized a team retreat through Trayati. Every detail was perfect. Our team left rejuvenated and reconnected. Highly recommended!",
    source: "Verified Host",
    date: "2024-02-28",
  },
  {
    id: "testimonial-5",
    name: "Emma Thompson",
    title: "Luxury Travel Blogger",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    rating: 5,
    text: "Trayati curates experiences, not just accommodations. Each property tells a story. Loved every moment of my stay.",
    source: "Influencer",
    date: "2024-02-20",
  },
  {
    id: "testimonial-6",
    name: "Vikram Patel",
    title: "Adventure Entrepreneur",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    rating: 4.9,
    text: "The properties are stunning, but it's the conscious approach to travel that really sets Trayati apart. Will definitely book again.",
    source: "Verified Guest",
    date: "2024-02-12",
  },
];

// ─── Sample Experiences/Blogs ─────────────────────────────────────
export const experiences: Experience[] = [
  {
    id: "experience-1",
    title: "Finding Stillness in Kasar Devi: A Spiritual Retreat Guide",
    description: "Discover how to plan the perfect spiritual getaway in one of India's most sacred destinations. From meditation spots to local ashrams, we guide you through the best experiences.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    category: "Destination Guide",
    author: "Asha Verma",
    readTime: 8,
    date: "2024-03-18",
    featured: true,
  },
  {
    id: "experience-2",
    title: "The Art of Conscious Traveling: 5 Principles to Transform Your Journey",
    description: "Learn how to travel mindfully and sustainably. We explore five key principles that can help you make a positive impact on the places you visit.",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop",
    category: "Travel Tips",
    author: "Marco Rossi",
    readTime: 6,
    date: "2024-03-15",
    featured: true,
  },
  {
    id: "experience-3",
    title: "Heritage Haveli Tours: Exploring Jaisalmer's Golden Architecture",
    description: "Step into history with this comprehensive guide to Jaisalmer's stunning haveli architecture. From carved jharokhas to courtyard secrets, discover the stories within the stone.",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop",
    category: "Story",
    author: "Rakesh Singh",
    readTime: 10,
    date: "2024-03-12",
    featured: true,
  },
  {
    id: "experience-4",
    title: "Monsoon Magic: Best Time to Visit Kerala's Backwaters",
    description: "Why we love monsoon season in Kerala. Experience lush landscapes, rejuvenated wildlife, and a unique side of paradise with fewer crowds.",
    image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=300&fit=crop",
    category: "Destination Guide",
    author: "Divya Das",
    readTime: 7,
    date: "2024-03-08",
    featured: false,
  },
  {
    id: "experience-5",
    title: "Work Retreats: Merging Productivity with Paradise",
    description: "How remote workers are choosing wellness-focused destinations for their work. The rise of 'workations' and how to plan yours.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    category: "Travel Tips",
    author: "Alex Nguyen",
    readTime: 9,
    date: "2024-03-05",
    featured: false,
  },
  {
    id: "experience-6",
    title: "Valley Views and Morning Mist: Dharamshala's Hidden Gems",
    description: "Beyond the temple bells and monasteries, discover Dharamshala's secret spots. A local's guide to experiencing mountain magic.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    category: "Story",
    author: "Tenzin Dorje",
    readTime: 8,
    date: "2024-03-01",
    featured: false,
  },
];
