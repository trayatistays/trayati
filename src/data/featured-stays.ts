export type FeaturedStay = {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  city: string;
  state: string;
  country: string;
  pin: string;
  googleMapsUrl?: string;
  address: string;
  description: string;
  rating: number;
  pricePerNight: number;
  image: string;
  alt: string;
  tag: string;
  type: string;
  amenities: string[];
};

export const featuredStays: FeaturedStay[] = [
  {
    id: "samar-villa-trayati-stays",
    title: "Samar Villa",
    subtitle: "Trayati Stays",
    location: "Kasar Devi, Uttarakhand",
    city: "Matena, Kasar Devi",
    state: "Uttarakhand",
    country: "India",
    pin: "263601",
    googleMapsUrl: "https://maps.app.goo.gl/Z3UHG2sZdFTKbqEq6",
    address: "MM6M+W8 Matena, Uttarakhand",
    description:
      "A serene private villa nestled in the sacred hills of Kasar Devi. Wake up to Himalayan panoramas, breathe pine-fresh air, and find stillness in one of India's most spiritually charged landscapes.",
    rating: 4.9,
    pricePerNight: 12500,
    image: "/samar-villa.png",
    alt: "Samar Villa – Himalayan panorama from Kasar Devi, Uttarakhand",
    tag: "Private Villa",
    type: "Private Villa",
    amenities: [
      "Himalayan views",
      "Private garden",
      "Fully equipped kitchen",
      "High-speed WiFi",
      "Bonfire area",
    ],
  },
  {
    id: "orchid-nest-retreat",
    title: "Orchid Nest",
    subtitle: "Trayati Stays",
    location: "Dharamsala, Himachal Pradesh",
    city: "Dharamsala",
    state: "Himachal Pradesh",
    country: "India",
    pin: "176057",
    address: "Upper Dharamsala, McLeod Ganj Road",
    description:
      "A tranquil mountain cottage above the clouds in Dharamsala. Sweeping views of the Dhauladhar range and the gentle sound of temple bells — this retreat is where the spirit recalibrates.",
    rating: 4.8,
    pricePerNight: 9800,
    image: "/property-exterior.jpg",
    alt: "Orchid Nest – Mountain cottage in Dharamsala, Himachal Pradesh",
    tag: "Mountain Cottage",
    type: "Cottage",
    amenities: [
      "Valley views",
      "Meditation deck",
      "Organic breakfast",
      "Bonfire",
      "Cultural tours",
    ],
  },
  {
    id: "saffron-haveli",
    title: "Saffron Haveli",
    subtitle: "Trayati Stays",
    location: "Jaisalmer, Rajasthan",
    city: "Jaisalmer",
    state: "Rajasthan",
    country: "India",
    pin: "345001",
    address: "Old City, Jaisalmer Fort Road",
    description:
      "A lovingly restored 200-year-old haveli inside Jaisalmer's golden fort walls. Hand-carved sandstone jharokhas, courtyard evenings, and rooftop sunsets over the Thar Desert.",
    rating: 4.7,
    pricePerNight: 14200,
    image: "/property-lounge.jpg",
    alt: "Saffron Haveli – Heritage stay in Jaisalmer fort",
    tag: "Heritage Haveli",
    type: "Heritage Property",
    amenities: [
      "Fort views",
      "Heritage architecture",
      "Rooftop dining",
      "Desert safari",
      "Cultural performances",
    ],
  },
  {
    id: "blue-tide-villa",
    title: "Blue Tide Villa",
    subtitle: "Trayati Stays",
    location: "Varkala, Kerala",
    city: "Varkala",
    state: "Kerala",
    country: "India",
    pin: "695141",
    address: "North Cliff, Varkala Beach",
    description:
      "A sun-drenched villa atop Varkala's dramatic red laterite cliffs. The Arabian Sea unfolds below — watch sunsets from your private deck over uninterrupted natural infinity views.",
    rating: 4.8,
    pricePerNight: 16500,
    image: "/property-balcony.jpg",
    alt: "Blue Tide Villa – Beachfront villa in Varkala, Kerala",
    tag: "Beachfront Villa",
    type: "Beach Villa",
    amenities: [
      "Sea views",
      "Private balcony",
      "Infinity pool",
      "Ayurvedic spa",
      "Beach access",
    ],
  },
];
