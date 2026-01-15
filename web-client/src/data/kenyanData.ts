// Kenyan Rental Locations and Areas
export const KENYAN_RENTAL_AREAS = [
    // Kasarani Areas
    { id: "kasarani-seasons", name: "Kasarani Seasons", county: "Nairobi", region: "Kasarani" },
    { id: "kasarani-equity", name: "Kasarani Equity", county: "Nairobi", region: "Kasarani" },
    { id: "kasarani-clay-city", name: "Kasarani Clay City", county: "Nairobi", region: "Kasarani" },
    { id: "kasarani-sunton", name: "Kasarani Sunton", county: "Nairobi", region: "Kasarani" },
    { id: "kasarani-neema", name: "Kasarani Neema", county: "Nairobi", region: "Kasarani" },
    { id: "mwiki", name: "Mwiki", county: "Nairobi", region: "Kasarani" },
    { id: "githurai-44", name: "Githurai 44", county: "Nairobi", region: "Kasarani" },
    { id: "githurai-45", name: "Githurai 45", county: "Nairobi", region: "Kasarani" },

    // Roysambu Areas
    { id: "roysambu", name: "Roysambu", county: "Nairobi", region: "Roysambu" },
    { id: "mirema-drive", name: "Mirema Drive", county: "Nairobi", region: "Roysambu" },
    { id: "trm-area", name: "TRM Area", county: "Nairobi", region: "Roysambu" },
    { id: "zimmerman", name: "Zimmerman", county: "Nairobi", region: "Roysambu" },
    { id: "garden-estate", name: "Garden Estate", county: "Nairobi", region: "Roysambu" },
    { id: "thome-estate", name: "Thome Estate", county: "Nairobi", region: "Roysambu" },
    { id: "lumumba-drive", name: "Lumumba Drive", county: "Nairobi", region: "Roysambu" },
    { id: "marurui", name: "Marurui", county: "Nairobi", region: "Roysambu" },

    // Juja Areas
    { id: "juja-gata-a", name: "Juja Gata A", county: "Kiambu", region: "Juja" },
    { id: "juja-kalimoni", name: "Juja Kalimoni", county: "Kiambu", region: "Juja" },
    { id: "juja-south-estate", name: "Juja South Estate", county: "Kiambu", region: "Juja" },
    { id: "juja-highpoint", name: "Juja Highpoint", county: "Kiambu", region: "Juja" },
    { id: "juja-farm", name: "Juja Farm", county: "Kiambu", region: "Juja" },
    { id: "juja-kenyatta-road", name: "Juja Kenyatta Road", county: "Kiambu", region: "Juja" },

    // Kahawa Areas
    { id: "kahawa-west", name: "Kahawa West", county: "Nairobi", region: "Kahawa" },
    { id: "kahawa-sukari", name: "Kahawa Sukari", county: "Nairobi", region: "Kahawa" },
    { id: "kahawa-wendani", name: "Kahawa Wendani", county: "Nairobi", region: "Kahawa" },

    // Ruiru Areas
    { id: "ruiru-bypass", name: "Ruiru Bypass", county: "Kiambu", region: "Ruiru" },
    { id: "ruiru-town", name: "Ruiru Town", county: "Kiambu", region: "Ruiru" },

    // Thika Road Areas
    { id: "roasters", name: "Roasters", county: "Nairobi", region: "Thika Road" },
    { id: "safari-park", name: "Safari Park", county: "Nairobi", region: "Thika Road" },
    { id: "seasons", name: "Seasons", county: "Nairobi", region: "Thika Road" },

    // Kiambu Road Areas
    { id: "thindigua", name: "Thindigua", county: "Kiambu", region: "Kiambu Road" },
    { id: "runda", name: "Runda", county: "Nairobi", region: "Kiambu Road" },
    { id: "rosslyn", name: "Rosslyn", county: "Nairobi", region: "Kiambu Road" },
    { id: "ridgeways", name: "Ridgeways", county: "Nairobi", region: "Kiambu Road" },

    // CBD & Surrounding
    { id: "kilimani", name: "Kilimani", county: "Nairobi", region: "Central" },
    { id: "lavington", name: "Lavington", county: "Nairobi", region: "Central" },
    { id: "westlands", name: "Westlands", county: "Nairobi", region: "Central" },
    { id: "parklands", name: "Parklands", county: "Nairobi", region: "Central" },
    { id: "upperhill", name: "Upperhill", county: "Nairobi", region: "Central" },

    // Ngong Road
    { id: "dagoretti", name: "Dagoretti", county: "Nairobi", region: "Ngong Road" },
    { id: "kibra", name: "Kibra", county: "Nairobi", region: "Ngong Road" },
    { id: "riruta", name: "Riruta", county: "Nairobi", region: "Ngong Road" },

    // South B/C and Surrounding
    { id: "south-b", name: "South B", county: "Nairobi", region: "South" },
    { id: "south-c", name: "South C", county: "Nairobi", region: "South" },
    { id: "imara-daima", name: "Imara Daima", county: "Nairobi", region: "South" },
    { id: "pipeline", name: "Pipeline", county: "Nairobi", region: "South" },

    // Eastlands
    { id: "donholm", name: "Donholm", county: "Nairobi", region: "Eastlands" },
    { id: "umoja", name: "Umoja", county: "Nairobi", region: "Eastlands" },
    { id: "kayole", name: "Kayole", county: "Nairobi", region: "Eastlands" },
    { id: "embakasi", name: "Embakasi", county: "Nairobi", region: "Eastlands" },
    { id: "tassia", name: "Tassia", county: "Nairobi", region: "Eastlands" },
];

// Kenyan Rental Amenities
export const KENYAN_AMENITIES = [
    // Essential Utilities
    { id: "water-supply", name: "Reliable Water Supply", category: "utilities", essential: true },
    { id: "water-backup", name: "Water Backup/Tanks", category: "utilities", essential: false },
    { id: "borehole", name: "Borehole Water", category: "utilities", essential: false },
    { id: "electricity", name: "Electricity (Prepaid)", category: "utilities", essential: true },
    { id: "electricity-postpaid", name: "Electricity (Postpaid)", category: "utilities", essential: false },
    { id: "generator", name: "Generator Backup", category: "utilities", essential: false },
    { id: "solar-power", name: "Solar Power Backup", category: "utilities", essential: false },

    // Security Features
    { id: "gated-community", name: "Gated Community", category: "security", essential: false },
    { id: "cctv", name: "CCTV Surveillance", category: "security", essential: false },
    { id: "security-guards", name: "24/7 Security Guards", category: "security", essential: false },
    { id: "electric-fence", name: "Electric Fence", category: "security", essential: false },
    { id: "secure-parking", name: "Secure Parking", category: "security", essential: false },

    // Kitchen & Appliances
    { id: "modern-kitchen", name: "Modern Kitchen", category: "kitchen", essential: false },
    { id: "kitchen-cabinets", name: "Built-in Kitchen Cabinets", category: "kitchen", essential: false },
    { id: "granite-counters", name: "Granite Countertops", category: "kitchen", essential: false },
    { id: "cooker", name: "Gas Cooker", category: "kitchen", essential: false },
    { id: "fridge", name: "Refrigerator", category: "kitchen", essential: false },

    // Storage & Furnishing
    { id: "wardrobes", name: "Built-in Wardrobes", category: "storage", essential: false },
    { id: "furnished", name: "Fully Furnished", category: "furnishing", essential: false },
    { id: "semi-furnished", name: "Semi-Furnished", category: "furnishing", essential: false },

    // Connectivity
    { id: "wifi-ready", name: "Wi-Fi Ready", category: "connectivity", essential: false },
    { id: "fiber-internet", name: "Fiber Internet Available", category: "connectivity", essential: false },

    // Building Features
    { id: "elevator", name: "Elevator/Lift", category: "building", essential: false },
    { id: "balcony", name: "Balcony", category: "building", essential: false },
    { id: "parking", name: "Parking Space", category: "building", essential: false },
    { id: "laundry-area", name: "Laundry Area", category: "building", essential: false },
    { id: "waste-management", name: "Waste Management", category: "building", essential: false },

    // Premium Amenities
    { id: "gym", name: "Gym/Fitness Center", category: "premium", essential: false },
    { id: "swimming-pool", name: "Swimming Pool", category: "premium", essential: false },
    { id: "playground", name: "Children's Play Area", category: "premium", essential: false },
    { id: "rooftop-lounge", name: "Rooftop Lounge", category: "premium", essential: false },
    { id: "clubhouse", name: "Clubhouse", category: "premium", essential: false },

    // Other Features
    { id: "pet-friendly", name: "Pet Friendly", category: "other", essential: false },
    { id: "close-to-transport", name: "Close to Public Transport", category: "other", essential: false },
    { id: "close-to-shops", name: "Close to Shopping Centers", category: "other", essential: false },
    { id: "quiet-neighborhood", name: "Quiet Neighborhood", category: "other", essential: false },
];

// Property Type Price Ranges (KES per month)
export const PROPERTY_PRICE_RANGES = {
    "bedsitter": { min: 8000, max: 25000, avg: 15000 },
    "studio": { min: 12000, max: 25000, avg: 18000 },
    "1-bedroom": { min: 10000, max: 75000, avg: 35000 },
    "2-bedroom": { min: 30000, max: 110000, avg: 60000 },
    "3-bedroom": { min: 50000, max: 150000, avg: 85000 },
    "4-bedroom+": { min: 80000, max: 250000, avg: 130000 },
};
