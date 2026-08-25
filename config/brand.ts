/**
 * Brand configuration for the auto detailing business.
 * Update these values when deploying for the actual client.
 */

export const brand = {
  // Business identity
  name: "Tony's Magic Car Wash",
  tagline: "Premium mobile auto detailing in Southern California",
  description: "Professional car detailing that comes to you. We bring showroom shine to your driveway.",
  
  // Contact information
  phone: "(555) 123-4567",
  email: "hello@tonysmagiccarwash.com",
  
  // Service area (update for real deployment)
  city: "San Diego",
  state: "CA",
  region: "Southern California",
  serviceArea: "Southern California",
  
  // Business hours (used for display and slot generation)
  hours: {
    monday: "Closed",
    tuesday: "8:00 AM - 6:00 PM",
    wednesday: "8:00 AM - 6:00 PM",
    thursday: "8:00 AM - 6:00 PM",
    friday: "8:00 AM - 6:00 PM",
    saturday: "8:00 AM - 6:00 PM",
    sunday: "Closed"
  },
  
  // Structured hours for slot generation
  workingHours: {
    monday: null,
    tuesday: { start: "08:00", end: "18:00" },
    wednesday: { start: "08:00", end: "18:00" },
    thursday: { start: "08:00", end: "18:00" },
    friday: { start: "08:00", end: "18:00" },
    saturday: { start: "08:00", end: "18:00" },
    sunday: null
  },
  
  // Timezone for the business
  timezone: "America/Los_Angeles",
  
  // Travel buffer between appointments (in minutes) - time to drive between customer locations
  bufferMinutes: 60,
  
  // Social media (optional)
  instagram: "",
  facebook: "",
  
  // Note about placeholder content
  isPlaceholder: true,
  placeholderNote: "This is placeholder branding for Tony's Magic Car Wash. Replace with actual business information before deployment."
} as const;

export const services = [
  {
    id: "exterior-wash",
    name: "Exterior Wash",
    description: "Complete exterior hand wash with premium products. Includes wheels, tires, and windows.",
    duration: 45, // minutes
    price: 49, // dollars
    isAddon: false,
    features: [
      "Hand wash & dry",
      "Wheel & tire cleaning",
      "Window cleaning",
      "Tire shine"
    ]
  },
  {
    id: "interior-detail",
    name: "Interior Detail",
    description: "Deep cleaning of your vehicle's interior. Vacuum, surfaces, leather conditioning.",
    duration: 90,
    price: 129,
    isAddon: false,
    features: [
      "Full vacuum",
      "Dashboard & console cleaning",
      "Leather conditioning",
      "Window cleaning (interior)",
      "Door jambs"
    ]
  },
  {
    id: "full-detail",
    name: "Full Detail",
    description: "Complete interior and exterior transformation. The ultimate treatment for your vehicle.",
    duration: 180,
    price: 249,
    isAddon: false,
    features: [
      "Everything in Exterior Wash",
      "Everything in Interior Detail",
      "Clay bar treatment",
      "Polish & wax",
      "Engine bay cleaning"
    ]
  },
  {
    id: "ceramic-spray",
    name: "Ceramic Spray Coating",
    description: "Professional ceramic spray protection. Adds months of protection and shine.",
    duration: 30,
    price: 79,
    isAddon: true,
    features: [
      "6-month protection",
      "Enhanced shine",
      "Water beading",
      "UV protection"
    ]
  }
] as const;
