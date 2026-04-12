// ─── Room Type Definition ─────────────────────────────────────────
import type { ExperienceType } from "@/data/experience-types";

export type RoomType = {
  id: string;
  name: string;
  category: string;
  units: number;
  bedConfiguration: string;
  bathroom: string;
  extraBedOption?: string | null;
  pricePerNight: number;
  maxOccupancy: number;
};

// ─── Amenities Definition ─────────────────────────────────────────
export type AmenitiesDetail = {
  parking: boolean;
  heaterOnRequest: boolean;
  tv: boolean;
  fridge: boolean;
  washingMachine: boolean;
  powerBackup: boolean;
  airConditioning: boolean;
  geyser: boolean;
  kitchen: boolean;
  garden: boolean;
  balcony: boolean;
  lounge: boolean;
  studyArea: boolean;
  fireplace: boolean;
  pool: boolean;
  spa: boolean;
};

// ─── Meal Options Definition ──────────────────────────────────────
export type MealOption = {
  type: "breakfast" | "lunch" | "dinner" | "packed";
  available: boolean;
  price?: number;
  description?: string;
};

// ─── Cancellation Policy Definition ───────────────────────────────
export type CancellationPolicy = {
  name: string;
  description: string;
  refundPercentage: number;
  daysBeforeCheckin: number;
};

// ─── Featured Stay Definition (Expanded) ──────────────────────────
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
  reviewCount?: number;
  pricePerNight: number;
  basePrice: number;
  image: string;
  alt: string;
  tag: string;
  type: string;
  experienceType: ExperienceType;
  amenities: string[];
  photos: string[];
  roomTypes: RoomType[];
  amenitiesDetail: AmenitiesDetail;
  mealOptions: MealOption[];
  cancellationPolicies: CancellationPolicy[];
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
    basePrice: 12500,
    image: "/samar-villa.png",
    alt: "Samar Villa – Himalayan panorama from Kasar Devi, Uttarakhand",
    tag: "Private Villa",
    type: "Private Villa",
    experienceType: "Villas",
    amenities: [
      "Himalayan views",
      "Private garden",
      "Fully equipped kitchen",
      "High-speed WiFi",
      "Bonfire area",
    ],
    photos: [
      "/samar-villa.png",
      "/property-view.jpg",
      "/property-bedroom.jpg",
      "/property-balcony.jpg",
    ],
    roomTypes: [
      {
        id: "samar-master",
        name: "Master Suite",
        category: "Premium",
        units: 2,
        bedConfiguration: "King bed + sofa",
        bathroom: "Ensuite with bathtub & shower",
        extraBedOption: "Available on request",
        pricePerNight: 12500,
        maxOccupancy: 3,
      },
      {
        id: "samar-cottage",
        name: "Garden Cottage",
        category: "Deluxe",
        units: 1,
        bedConfiguration: "Queen bed",
        bathroom: "Attached bathroom with shower",
        extraBedOption: null,
        pricePerNight: 9200,
        maxOccupancy: 2,
      },
    ],
    amenitiesDetail: {
      parking: true,
      heaterOnRequest: true,
      tv: false,
      fridge: true,
      washingMachine: true,
      powerBackup: true,
      airConditioning: true,
      geyser: true,
      kitchen: true,
      garden: true,
      balcony: true,
      lounge: true,
      studyArea: true,
      fireplace: true,
      pool: false,
      spa: false,
    },
    mealOptions: [
      {
        type: "breakfast",
        available: true,
        price: 800,
        description: "Organic continental & Indian breakfast",
      },
      {
        type: "lunch",
        available: true,
        price: 1500,
        description: "Farm-to-table lunch (pre-book)",
      },
      {
        type: "dinner",
        available: true,
        price: 1800,
        description: "Multi-cuisine dinner experience",
      },
      {
        type: "packed",
        available: true,
        price: 600,
        description: "Packed picnic lunch",
      },
    ],
    cancellationPolicies: [
      {
        name: "Flexible",
        description: "Free cancellation until 7 days before check-in",
        refundPercentage: 100,
        daysBeforeCheckin: 7,
      },
      {
        name: "Moderate",
        description: "50% refund until 3 days before check-in",
        refundPercentage: 50,
        daysBeforeCheckin: 3,
      },
      {
        name: "Strict",
        description: "Non-refundable booking",
        refundPercentage: 0,
        daysBeforeCheckin: 0,
      },
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
    basePrice: 9800,
    image: "/property-exterior.jpg",
    alt: "Orchid Nest – Mountain cottage in Dharamsala, Himachal Pradesh",
    tag: "Mountain Cottage",
    type: "Cottage",
    experienceType: "Folklore Homestays",
    amenities: [
      "Valley views",
      "Meditation deck",
      "Organic breakfast",
      "Bonfire",
      "Cultural tours",
    ],
    photos: [
      "/property-exterior.jpg",
      "/property-view.jpg",
      "/property-bedroom.jpg",
      "/property-lounge.jpg",
    ],
    roomTypes: [
      {
        id: "orchid-deluxe",
        name: "Deluxe Room",
        category: "Premium",
        units: 2,
        bedConfiguration: "Queen bed with valley view",
        bathroom: "Attached bathroom with rain shower",
        extraBedOption: "Available",
        pricePerNight: 9800,
        maxOccupancy: 3,
      },
      {
        id: "orchid-standard",
        name: "Standard Room",
        category: "Standard",
        units: 2,
        bedConfiguration: "Twin beds",
        bathroom: "Shared bathroom",
        extraBedOption: null,
        pricePerNight: 6800,
        maxOccupancy: 2,
      },
    ],
    amenitiesDetail: {
      parking: true,
      heaterOnRequest: true,
      tv: false,
      fridge: true,
      washingMachine: true,
      powerBackup: true,
      airConditioning: false,
      geyser: true,
      kitchen: false,
      garden: true,
      balcony: true,
      lounge: true,
      studyArea: true,
      fireplace: true,
      pool: false,
      spa: false,
    },
    mealOptions: [
      {
        type: "breakfast",
        available: true,
        price: 600,
        description: "Organic vegetable breakfast included",
      },
      {
        type: "lunch",
        available: true,
        price: 1000,
        description: "Thali and light meals",
      },
      {
        type: "dinner",
        available: true,
        price: 1200,
        description: "Home-cooked dinner",
      },
    ],
    cancellationPolicies: [
      {
        name: "Flexible",
        description: "Free cancellation until 7 days before check-in",
        refundPercentage: 100,
        daysBeforeCheckin: 7,
      },
      {
        name: "Moderate",
        description: "50% refund until 3 days before check-in",
        refundPercentage: 50,
        daysBeforeCheckin: 3,
      },
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
    basePrice: 14200,
    image: "/property-lounge.jpg",
    alt: "Saffron Haveli – Heritage stay in Jaisalmer fort",
    tag: "Heritage Haveli",
    type: "Heritage Property",
    experienceType: "Folklore Homestays",
    amenities: [
      "Fort views",
      "Heritage architecture",
      "Rooftop dining",
      "Desert safari",
      "Cultural performances",
    ],
    photos: [
      "/property-lounge.jpg",
      "/property-view.jpg",
      "/property-exterior.jpg",
      "/property-bedroom.jpg",
    ],
    roomTypes: [
      {
        id: "saffron-royal",
        name: "Royal Suite",
        category: "Luxury",
        units: 1,
        bedConfiguration: "Four-poster king bed",
        bathroom: "Luxe ensuite with traditional hammam",
        extraBedOption: "Available",
        pricePerNight: 14200,
        maxOccupancy: 3,
      },
      {
        id: "saffron-heritage",
        name: "Heritage Room",
        category: "Premium",
        units: 2,
        bedConfiguration: "Queen bed with fort views",
        bathroom: "Ensuite with marble fixtures",
        extraBedOption: null,
        pricePerNight: 10500,
        maxOccupancy: 2,
      },
    ],
    amenitiesDetail: {
      parking: true,
      heaterOnRequest: true,
      tv: true,
      fridge: true,
      washingMachine: true,
      powerBackup: true,
      airConditioning: true,
      geyser: true,
      kitchen: false,
      garden: false,
      balcony: true,
      lounge: true,
      studyArea: true,
      fireplace: true,
      pool: false,
      spa: true,
    },
    mealOptions: [
      {
        type: "breakfast",
        available: true,
        price: 700,
        description: "Traditional Rajasthani breakfast",
      },
      {
        type: "lunch",
        available: true,
        price: 1400,
        description: "Authentic Rajasthani cuisine",
      },
      {
        type: "dinner",
        available: true,
        price: 2000,
        description: "Multi-course desert experience with performances",
      },
    ],
    cancellationPolicies: [
      {
        name: "Flexible",
        description: "Free cancellation until 14 days before check-in",
        refundPercentage: 100,
        daysBeforeCheckin: 14,
      },
      {
        name: "Moderate",
        description: "75% refund until 7 days before check-in",
        refundPercentage: 75,
        daysBeforeCheckin: 7,
      },
      {
        name: "Strict",
        description: "50% refund until 3 days before check-in",
        refundPercentage: 50,
        daysBeforeCheckin: 3,
      },
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
    basePrice: 16500,
    image: "/property-balcony.jpg",
    alt: "Blue Tide Villa – Beachfront villa in Varkala, Kerala",
    tag: "Beachfront Villa",
    type: "Beach Villa",
    experienceType: "Villas",
    amenities: [
      "Sea views",
      "Private balcony",
      "Infinity pool",
      "Ayurvedic spa",
      "Beach access",
    ],
    photos: [
      "/property-balcony.jpg",
      "/property-view.jpg",
      "/property-bedroom.jpg",
      "/property-exterior.jpg",
    ],
    roomTypes: [
      {
        id: "blue-master",
        name: "Master Oceanview Suite",
        category: "Luxury",
        units: 1,
        bedConfiguration: "King bed with sea view balcony",
        bathroom: "Spa ensuite with soaking tub",
        extraBedOption: "Available",
        pricePerNight: 16500,
        maxOccupancy: 2,
      },
      {
        id: "blue-guest",
        name: "Guest Suite",
        category: "Premium",
        units: 1,
        bedConfiguration: "Queen bed with partial sea view",
        bathroom: "Attached bathroom with rain shower",
        extraBedOption: null,
        pricePerNight: 12800,
        maxOccupancy: 2,
      },
    ],
    amenitiesDetail: {
      parking: true,
      heaterOnRequest: false,
      tv: true,
      fridge: true,
      washingMachine: true,
      powerBackup: true,
      airConditioning: true,
      geyser: true,
      kitchen: true,
      garden: false,
      balcony: true,
      lounge: true,
      studyArea: false,
      fireplace: false,
      pool: true,
      spa: true,
    },
    mealOptions: [
      {
        type: "breakfast",
        available: true,
        price: 900,
        description: "Kerala specialty breakfast with coconut & spices",
      },
      {
        type: "lunch",
        available: true,
        price: 1600,
        description: "Fresh seafood & traditional Kerala dishes",
      },
      {
        type: "dinner",
        available: true,
        price: 2200,
        description: "Sunset dinner with Ayurvedic menu options",
      },
      {
        type: "packed",
        available: true,
        price: 800,
        description: "Beach picnic packages",
      },
    ],
    cancellationPolicies: [
      {
        name: "Flexible",
        description: "Free cancellation until 14 days before check-in",
        refundPercentage: 100,
        daysBeforeCheckin: 14,
      },
      {
        name: "Moderate",
        description: "75% refund until 7 days before check-in",
        refundPercentage: 75,
        daysBeforeCheckin: 7,
      },
      {
        name: "Strict",
        description: "50% refund until 3 days before check-in",
        refundPercentage: 50,
        daysBeforeCheckin: 3,
      },
    ],
  },
];
