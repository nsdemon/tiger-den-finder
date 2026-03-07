// context/ListingsContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const RENTCAST_API_KEY = process.env.EXPO_PUBLIC_RENTCAST_API_KEY || "";

const PHOTOS = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=700&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=700&q=80",
  "https://images.unsplash.com/photo-1592595896616-c37162298647?w=700&q=80",
  "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=700&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=700&q=80",
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=700&q=80",
  "https://images.unsplash.com/photo-1576941342680-a4c43b37de0e?w=700&q=80",
  "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=700&q=80",
  "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=700&q=80",
  "https://images.unsplash.com/photo-1622372738946-62e02505feb3?w=700&q=80",
];

const LSU_LAT = 30.4133;
const LSU_LNG = -91.1800;

function distanceFromLSU(lat: number, lng: number): string {
  const R = 3959;
  const dLat = (lat - LSU_LAT) * Math.PI / 180;
  const dLng = (lng - LSU_LNG) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(LSU_LAT * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  if (dist < 0.3) return "On Campus";
  return `${dist.toFixed(1)} mi from LSU`;
}

function hashStr(str: string): number {
  return str.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

export function transformListing(item: any, index: number) {
  const fallbackPhoto = PHOTOS[hashStr(item.formattedAddress || String(index)) % PHOTOS.length];
  return {
    id: item.id || String(index),
    name: item.formattedAddress || `Property ${index + 1}`,
    type: item.propertyType || "Apartment",
    address: item.formattedAddress || "",
    distance: item.latitude && item.longitude ? distanceFromLSU(item.latitude, item.longitude) : "Near LSU",
    lat: item.latitude || LSU_LAT,
    lng: item.longitude || LSU_LNG,
    price: item.price || item.rentPrice || 0,
    beds: item.bedrooms || 0,
    baths: item.bathrooms || 1,
    sqft: item.squareFootage || 0,
    rating: parseFloat((4.0 + (hashStr(item.id || "") % 10) / 10).toFixed(1)),
    reviews: (hashStr(item.id || "") % 80) + 10,
    color: "#2D0B6B",
    verified: !!item.listedDate,
    available: item.status === "Active",
    photo: (item.photoUrls && item.photoUrls.length > 0 && item.photoUrls[0].startsWith("http")) ? item.photoUrls[0] : fallbackPhoto,
    tags: [item.propertyType || "Rental", item.bedrooms === 0 ? "Studio" : `${item.bedrooms} Bed`, item.daysOnMarket < 7 ? "New Listing" : "Available"].filter(Boolean),
    amenities: item.features || ["Contact for details"],
    contact: { name: item.listedByName || "Property Manager", phone: item.listedByPhone || "Contact via app", email: item.listedByEmail || "Contact via app", hours: "Contact for hours" },
    nearbyFood: [],
    studentReviews: [],
    description: item.description || `${item.propertyType || "Rental"} located at ${item.formattedAddress}. Contact for more details.`,
  };
}

const FALLBACK_LISTINGS = [
  { id: "f1", name: "The Ogden on Highland", type: "Apartment", address: "4120 Highland Rd, Baton Rouge, LA 70808", distance: "0.3 mi from LSU", lat: 30.4086, lng: -91.1737, price: 850, beds: 1, baths: 1, sqft: 650, rating: 4.6, reviews: 84, color: "#2D0B6B", verified: true, available: true, photo: PHOTOS[0], tags: ["Apartment", "1 Bed", "Available"], amenities: ["Pool", "Gym", "Pet Friendly"], contact: { name: "Property Manager", phone: "Contact via app", email: "Contact via app", hours: "9am-5pm" }, nearbyFood: [], studentReviews: [], description: "Modern apartment near LSU." },
  { id: "f2", name: "Nicholson Gateway", type: "Apartment", address: "3715 Nicholson Dr, Baton Rouge, LA 70802", distance: "On Campus", lat: 30.4076, lng: -91.1744, price: 1120, beds: 2, baths: 2, sqft: 900, rating: 4.8, reviews: 120, color: "#2D0B6B", verified: true, available: true, photo: PHOTOS[1], tags: ["Apartment", "2 Bed", "New Listing"], amenities: ["Study Rooms", "Furnished", "On Campus"], contact: { name: "Property Manager", phone: "Contact via app", email: "Contact via app", hours: "9am-5pm" }, nearbyFood: [], studentReviews: [], description: "On-campus housing near Tiger Stadium." },
  { id: "f3", name: "Stadium View Lofts", type: "Condo", address: "111 Stadium Dr, Baton Rouge, LA 70803", distance: "0.1 mi from LSU", lat: 30.4122, lng: -91.1838, price: 1350, beds: 2, baths: 2, sqft: 1100, rating: 4.7, reviews: 56, color: "#2D0B6B", verified: true, available: false, photo: PHOTOS[2], tags: ["Condo", "2 Bed", "Available"], amenities: ["Views", "New Build", "Premium"], contact: { name: "Property Manager", phone: "Contact via app", email: "Contact via app", hours: "9am-5pm" }, nearbyFood: [], studentReviews: [], description: "Premium condo with stadium views." },
  { id: "f4", name: "Magnolia Commons", type: "Townhouse", address: "5590 Magnolia St, Baton Rouge, LA 70808", distance: "1.8 mi from LSU", lat: 30.3902, lng: -91.1358, price: 980, beds: 3, baths: 2, sqft: 1350, rating: 4.3, reviews: 31, color: "#2D0B6B", verified: false, available: true, photo: PHOTOS[3], tags: ["Townhouse", "3 Bed", "Available"], amenities: ["Yard", "Spacious", "Quiet"], contact: { name: "Property Manager", phone: "Contact via app", email: "Contact via app", hours: "9am-5pm" }, nearbyFood: [], studentReviews: [], description: "Spacious townhouse with yard." },
  { id: "f5", name: "Purple Pines Apartments", type: "Apartment", address: "2245 Bienville Dr, Baton Rouge, LA 70808", distance: "1.2 mi from LSU", lat: 30.4010, lng: -91.1555, price: 675, beds: 1, baths: 1, sqft: 550, rating: 4.1, reviews: 28, color: "#2D0B6B", verified: false, available: true, photo: PHOTOS[4], tags: ["Apartment", "1 Bed", "Available"], amenities: ["Budget", "Utilities Included"], contact: { name: "Property Manager", phone: "Contact via app", email: "Contact via app", hours: "9am-5pm" }, nearbyFood: [], studentReviews: [], description: "Affordable apartment near LSU." },
  { id: "f6", name: "The Varsity Baton Rouge", type: "Apartment", address: "3989 Nicholson Dr, Baton Rouge, LA 70802", distance: "0.5 mi from LSU", lat: 30.4055, lng: -91.1750, price: 795, beds: 1, baths: 1, sqft: 680, rating: 4.4, reviews: 67, color: "#2D0B6B", verified: true, available: true, photo: PHOTOS[5], tags: ["Apartment", "1 Bed", "Available"], amenities: ["Study Lounge", "Fast WiFi", "Social Events"], contact: { name: "Property Manager", phone: "Contact via app", email: "Contact via app", hours: "9am-5pm" }, nearbyFood: [], studentReviews: [], description: "Student-focused apartment community." },
  { id: "f7", name: "Cloverland Commons", type: "Apartment", address: "3320 Cloverland Ave, Baton Rouge, LA 70808", distance: "1.6 mi from LSU", lat: 30.4000, lng: -91.1510, price: 620, beds: 1, baths: 1, sqft: 520, rating: 4.0, reviews: 19, color: "#2D0B6B", verified: false, available: true, photo: PHOTOS[6], tags: ["Apartment", "1 Bed", "Available"], amenities: ["Budget", "Near Bus Stop"], contact: { name: "Property Manager", phone: "Contact via app", email: "Contact via app", hours: "9am-5pm" }, nearbyFood: [], studentReviews: [], description: "Budget-friendly apartment." },
  { id: "f8", name: "The Beau Rivage", type: "Condo", address: "820 Convention St, Baton Rouge, LA 70802", distance: "2.3 mi from LSU", lat: 30.4483, lng: -91.1873, price: 1650, beds: 2, baths: 2, sqft: 1400, rating: 4.9, reviews: 45, color: "#2D0B6B", verified: true, available: true, photo: PHOTOS[7], tags: ["Condo", "2 Bed", "Available"], amenities: ["Luxury", "Concierge", "Rooftop Pool"], contact: { name: "Property Manager", phone: "Contact via app", email: "Contact via app", hours: "9am-5pm" }, nearbyFood: [], studentReviews: [], description: "Luxury condo in downtown Baton Rouge." },
  { id: "f9", name: "Tiger Crossing Apartments", type: "Apartment", address: "4234 Burbank Dr, Baton Rouge, LA 70808", distance: "0.8 mi from LSU", lat: 30.4025, lng: -91.1680, price: 740, beds: 2, baths: 1, sqft: 780, rating: 4.2, reviews: 52, color: "#2D0B6B", verified: true, available: true, photo: PHOTOS[8], tags: ["Apartment", "2 Bed", "Available"], amenities: ["Pool", "Laundry", "Gated"], contact: { name: "Property Manager", phone: "Contact via app", email: "Contact via app", hours: "9am-5pm" }, nearbyFood: [], studentReviews: [], description: "Popular complex close to LSU with pool." },
  { id: "f10", name: "LSU Courtyard Studios", type: "Apartment", address: "355 E Boyd Dr, Baton Rouge, LA 70808", distance: "0.2 mi from LSU", lat: 30.4115, lng: -91.1755, price: 590, beds: 0, baths: 1, sqft: 420, rating: 4.0, reviews: 38, color: "#2D0B6B", verified: false, available: true, photo: PHOTOS[9], tags: ["Apartment", "Studio", "Available"], amenities: ["Studio", "All Bills Paid", "Walking Distance"], contact: { name: "Property Manager", phone: "Contact via app", email: "Contact via app", hours: "9am-5pm" }, nearbyFood: [], studentReviews: [], description: "Affordable studios steps from campus." },
  { id: "f11", name: "Perkins Place Townhomes", type: "Townhouse", address: "4576 Perkins Rd, Baton Rouge, LA 70808", distance: "1.4 mi from LSU", lat: 30.3968, lng: -91.1592, price: 1100, beds: 3, baths: 2, sqft: 1450, rating: 4.5, reviews: 23, color: "#2D0B6B", verified: true, available: true, photo: PHOTOS[0], tags: ["Townhouse", "3 Bed", "Available"], amenities: ["Garage", "Yard", "Modern Kitchen"], contact: { name: "Property Manager", phone: "Contact via app", email: "Contact via app", hours: "9am-5pm" }, nearbyFood: [], studentReviews: [], description: "Spacious townhomes near Perkins Road dining." },
  { id: "f12", name: "The Highland House", type: "Single Family", address: "3850 Highland Rd, Baton Rouge, LA 70808", distance: "0.5 mi from LSU", lat: 30.4068, lng: -91.1720, price: 1450, beds: 4, baths: 2, sqft: 1800, rating: 4.3, reviews: 14, color: "#2D0B6B", verified: false, available: true, photo: PHOTOS[1], tags: ["Single Family", "4 Bed", "Available"], amenities: ["Full House", "Driveway", "Washer/Dryer"], contact: { name: "Property Manager", phone: "Contact via app", email: "Contact via app", hours: "9am-5pm" }, nearbyFood: [], studentReviews: [], description: "Full house perfect for roommate groups." },
  { id: "f13", name: "South Campus Flats", type: "Apartment", address: "2950 S Acadian Thruway, Baton Rouge, LA 70808", distance: "1.0 mi from LSU", lat: 30.4044, lng: -91.1628, price: 880, beds: 2, baths: 2, sqft: 950, rating: 4.6, reviews: 71, color: "#2D0B6B", verified: true, available: true, photo: PHOTOS[2], tags: ["Apartment", "2 Bed", "Available"], amenities: ["Pool", "Gym", "Dog Friendly", "EV Charging"], contact: { name: "Property Manager", phone: "Contact via app", email: "Contact via app", hours: "9am-5pm" }, nearbyFood: [], studentReviews: [], description: "Modern complex south of campus with great amenities." },
  { id: "f14", name: "Brightside Village", type: "Apartment", address: "11616 Southfork Ave, Baton Rouge, LA 70816", distance: "4.2 mi from LSU", lat: 30.3780, lng: -91.0980, price: 760, beds: 1, baths: 1, sqft: 620, rating: 3.9, reviews: 44, color: "#2D0B6B", verified: false, available: true, photo: PHOTOS[3], tags: ["Apartment", "1 Bed", "Available"], amenities: ["Pool", "Covered Parking"], contact: { name: "Property Manager", phone: "Contact via app", email: "Contact via app", hours: "9am-5pm" }, nearbyFood: [], studentReviews: [], description: "Affordable option further from campus." },
  { id: "f15", name: "The Chimes Street Lofts", type: "Condo", address: "3357 Chimes St, Baton Rouge, LA 70802", distance: "0.4 mi from LSU", lat: 30.4095, lng: -91.1698, price: 1200, beds: 1, baths: 1, sqft: 750, rating: 4.7, reviews: 33, color: "#2D0B6B", verified: true, available: false, photo: PHOTOS[4], tags: ["Condo", "1 Bed", "Waitlist"], amenities: ["Renovated", "Hardwood Floors", "Walk to Tigerland"], contact: { name: "Property Manager", phone: "Contact via app", email: "Contact via app", hours: "9am-5pm" }, nearbyFood: [], studentReviews: [], description: "Trendy lofts steps from Tigerland nightlife." },
  { id: "f16", name: "Steele Blvd Suites", type: "Apartment", address: "6566 Steele Blvd, Baton Rouge, LA 70806", distance: "2.8 mi from LSU", lat: 30.4230, lng: -91.1430, price: 695, beds: 1, baths: 1, sqft: 560, rating: 4.1, reviews: 17, color: "#2D0B6B", verified: false, available: true, photo: PHOTOS[5], tags: ["Apartment", "1 Bed", "Available"], amenities: ["Budget-Friendly", "Near I-10"], contact: { name: "Property Manager", phone: "Contact via app", email: "Contact via app", hours: "9am-5pm" }, nearbyFood: [], studentReviews: [], description: "Budget option with easy highway access." },
];

export type Listing = typeof FALLBACK_LISTINGS[0];

interface ListingsContextType {
  listings: any[];
  loading: boolean;
  error: string;
  usingLiveData: boolean;
  refresh: () => void;
}

const ListingsContext = createContext<ListingsContextType>({
  listings: FALLBACK_LISTINGS,
  loading: false,
  error: "",
  usingLiveData: false,
  refresh: () => {},
});

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<any[]>(FALLBACK_LISTINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usingLiveData, setUsingLiveData] = useState(false);

  const fetchListings = useCallback(async () => {
    if (!RENTCAST_API_KEY) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://api.rentcast.io/v1/listings/rental/long-term?city=Baton%20Rouge&state=LA&limit=50&status=Active`,
        { headers: { "X-Api-Key": RENTCAST_API_KEY } }
      );
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      if (data && Array.isArray(data) && data.length > 0) {
        setListings(data.map(transformListing));
        setUsingLiveData(true);
      }
    } catch (e: any) {
      setError("Showing sample listings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchListings(); }, []);

  return (
    <ListingsContext.Provider value={{ listings, loading, error, usingLiveData, refresh: fetchListings }}>
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings() {
  return useContext(ListingsContext);
}
