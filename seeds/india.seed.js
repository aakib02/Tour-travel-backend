import dotenv from "dotenv";
import mongoose from "mongoose";
import { dbConnection } from "../config/database.js";
import Country from "../models/country/index.js";
import State from "../models/state/index.js";
import City from "../models/city/index.js";

dotenv.config();

// =============================================================================
// 1. COUNTRY DATA: INDIA
// =============================================================================
const indiaCountryData = {
  name: "India",
  slug: "india",
  code: "IN",
  region: "South Asia",
  currency: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
  },
  description:
    "India is a vast South Asian country with diverse terrain – from Himalayan peaks to Indian Ocean coastline – and history reaching back 5 millennia. Renowned for its magnificent royal palaces, sacred spiritual rivers, ancient temples, vibrant wildlife sanctuaries, and rich cultural traditions, India offers an unparalleled kaleidoscope of travel experiences.",
  seo: {
    title: "Incredible India Tourism & Holiday Tour Packages",
    description:
      "Explore Incredible India tour packages, royal Rajasthan palaces, serene Kerala backwaters, holy Varanasi ghats, and the breathtaking Himalayas.",
    keywords: [
      "india tourism",
      "india tour packages",
      "incredible india",
      "golden triangle tour",
      "rajasthan packages",
      "kerala backwaters",
      "himalayas holiday",
    ],
    canonicalUrl: "https://yourtravelwebsite.com/destinations/india",
    noIndex: false,
  },
  sortOrder: 1,
  status: "published",
  isActive: true,
};

// =============================================================================
// 2. STATES & CITIES DATA (COMPREHENSIVE ALL-INDIA SEED)
// =============================================================================
const statesData = [
  // ---------------------------------------------------------------------------
  // 1. DELHI (North)
  // ---------------------------------------------------------------------------
  {
    name: "Delhi",
    slug: "delhi",
    code: "DL",
    region: "north",
    capital: "New Delhi",
    shortDescription: "The bustling historic and political heart of India.",
    overview:
      "Delhi, India's capital territory, is a massive metropolitan area in the country's north. In Old Delhi, a neighborhood dating to the 1600s, stands the imposing Mughal-era Red Fort, a symbol of India, and the sprawling Jama Masjid mosque. Nearby is Chandni Chowk, a vibrant bazaar filled with food carts, sweets shops and spice stalls.",
    bestTimeToVisit: "October to March",
    popularFor: ["Monuments", "Street Food", "Shopping", "Mughal Architecture"],
    travelThemes: ["heritage", "culture", "culinary", "shopping", "urban"],
    seasons: {
      summer: {
        months: ["April", "May", "June"],
        description: "Hot weather with temperatures up to 45°C. Air-conditioned touring recommended.",
      },
      monsoon: {
        months: ["July", "August", "September"],
        description: "Humid with moderate to heavy monsoon showers that bring lush greenery.",
      },
      winter: {
        months: ["October", "November", "December", "January", "February", "March"],
        description: "Pleasantly cool to chilly winter days, perfect for monument visits and food walks.",
      },
    },
    rating: { average: 4.8, count: 320 },
    seo: {
      title: "Delhi Tourism - Top Attractions & City Tours",
      description: "Discover Delhi with our travel guide to Red Fort, Qutub Minar, India Gate, and Old Delhi street food.",
      keywords: ["delhi tourism", "delhi tour packages", "qutub minar", "india gate", "old delhi food"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/delhi",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: true,
    sortOrder: 1,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "New Delhi",
        slug: "new-delhi",
        region: "north",
        tagline: "The Grand Capital of India",
        shortDescription: "Home to India Gate, Rashtrapati Bhavan, and majestic broad avenues.",
        overview:
          "New Delhi serves as the seat of all three branches of the Government of India. Designed by Sir Edwin Lutyens and Herbert Baker, it is renowned for its wide boulevards, colonial architecture, sprawling gardens, and grand state memorials.",
        bestTimeToVisit: "October to March",
        popularDuration: { minDays: 2, maxDays: 3 },
        howToReach: {
          airport: "Indira Gandhi International Airport (DEL) connected worldwide",
          railway: "New Delhi Railway Station (NDLS), Hazrat Nizamuddin (NZM)",
          road: "Interstate Bus Terminals (ISBT) and national expressways",
          description: "Effortless connectivity by metro, air, trains, and express highways.",
        },
        coordinates: { latitude: 28.6139, longitude: 77.209 },
        address: "New Delhi, Delhi, India",
        cityType: ["metropolitan", "capital", "heritage"],
        popularFor: ["India Gate", "Humayun's Tomb", "Qutub Minar", "Lotus Temple"],
        travelThemes: ["heritage", "photography", "architecture", "diplomatic"],
        food: ["Chole Bhature", "Butter Chicken", "Kebabs", "Paranthas"],
        shopping: ["Connaught Place", "Dilli Haat", "Khan Market", "Janpath"],
        weather: {
          summer: { minTemperature: 28, maxTemperature: 44, description: "Hot and sunny" },
          monsoon: { minTemperature: 25, maxTemperature: 35, description: "Humid and rainy" },
          winter: { minTemperature: 7, maxTemperature: 22, description: "Crisp and cool" },
        },
        faqs: [
          {
            question: "What is the best way to get around New Delhi?",
            answer: "The Delhi Metro is fast, modern, safe, air-conditioned, and connects all major tourist spots.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.8, count: 210 },
        seo: {
          title: "New Delhi Travel Guide & Sightseeing Highlights",
          description: "Plan your trip to New Delhi with insights on monuments, Lutyens architecture, and food walks.",
          keywords: ["new delhi travel", "india gate", "qutub minar", "connaught place"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
      {
        name: "Old Delhi",
        slug: "old-delhi",
        region: "north",
        tagline: "The Walled Mughal City of Shahjahanabad",
        shortDescription: "Historic alleys, majestic Jama Masjid, and culinary legendary streets.",
        overview:
          "Founded as Shahjahanabad in 1639, Old Delhi remains the beating cultural and culinary heart of the capital. Packed with historic havelis, lively spice markets, and centuries-old culinary landmarks.",
        bestTimeToVisit: "October to March",
        popularDuration: { minDays: 1, maxDays: 2 },
        howToReach: {
          airport: "Indira Gandhi International Airport (20 km)",
          railway: "Old Delhi Railway Station (DLI)",
          road: "Red Fort and Chandni Chowk Metro Stations",
          description: "Best reached via Delhi Metro (Yellow or Violet Line) or dedicated chauffeur.",
        },
        coordinates: { latitude: 28.6562, longitude: 77.241 },
        address: "Old Delhi, Delhi, India",
        cityType: ["heritage", "cultural", "culinary"],
        popularFor: ["Red Fort", "Jama Masjid", "Chandni Chowk", "Khari Baoli Spice Market"],
        travelThemes: ["heritage", "street food", "photography", "shopping"],
        food: ["Jaleba", "Daulat ki Chaat", "Nihari", "Mughlai Biryani", "Stuffed Paranthas"],
        shopping: ["Chandni Chowk", "Khari Baoli", "Kinari Bazaar", "Dariba Kalan"],
        weather: {
          summer: { minTemperature: 28, maxTemperature: 43, description: "Hot conditions" },
          monsoon: { minTemperature: 24, maxTemperature: 34, description: "Rainy and lively" },
          winter: { minTemperature: 8, maxTemperature: 22, description: "Chilly and pleasant" },
        },
        faqs: [
          {
            question: "Is cycle rickshaw riding safe in Old Delhi?",
            answer: "Yes, heritage cycle rickshaw tours are the best and most popular way to explore the narrow lanes.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.7, count: 180 },
        seo: {
          title: "Old Delhi Heritage & Food Walks Guide",
          description: "Explore the historic charm of Old Delhi, Chandni Chowk food stalls, and the grand Red Fort.",
          keywords: ["old delhi", "chandni chowk", "jama masjid", "red fort delhi"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: false,
        sortOrder: 2,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 2. RAJASTHAN (North)
  // ---------------------------------------------------------------------------
  {
    name: "Rajasthan",
    slug: "rajasthan",
    code: "RJ",
    region: "north",
    capital: "Jaipur",
    shortDescription: "The Land of Kings, Royal Palaces, Fortresses & Desert Dunes.",
    overview:
      "Rajasthan is a northern Indian state bordering Pakistan. Its historical palaces, impregnable hill forts, vibrant folk music, desert safaris, and chivalric history make it India's premier international tourist destination.",
    bestTimeToVisit: "October to March",
    popularFor: ["Royal Palaces", "Hill Forts", "Thar Desert Safari", "Puppet Shows & Folk Dance"],
    travelThemes: ["heritage", "royalty", "luxury", "honeymoon", "desert"],
    seasons: {
      summer: { months: ["April", "May", "June"], description: "Warm to hot desert days" },
      monsoon: { months: ["July", "August", "September"], description: "Light monsoon, Peacock dances, lush Aravalis" },
      winter: { months: ["October", "November", "December", "January", "February", "March"], description: "Golden sunny days and cool breezy nights" },
    },
    rating: { average: 4.9, count: 480 },
    seo: {
      title: "Rajasthan Tour Packages - Royal Palaces & Desert Safaris",
      description: "Experience the royal splendour of Rajasthan. Explore Jaipur, Udaipur, Jodhpur, and Jaisalmer.",
      keywords: ["rajasthan tour", "rajasthan holiday packages", "jaipur tour", "udaipur lake palace"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/rajasthan",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: true,
    sortOrder: 2,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "Jaipur",
        slug: "jaipur",
        region: "north",
        tagline: "The Pink City of Royalty & Palaces",
        shortDescription: "Famous for Amber Fort, Hawa Mahal, City Palace, and exquisite handicrafts.",
        overview:
          "Jaipur is the capital of India’s Rajasthan state. It evokes the royal family that once ruled the region and that, in 1727, founded what is now called the Old City, or 'Pink City' for its trademark terracotta pink buildings.",
        bestTimeToVisit: "October to March",
        popularDuration: { minDays: 2, maxDays: 4 },
        howToReach: {
          airport: "Jaipur International Airport (JAI), 12 km from city center",
          railway: "Jaipur Junction (JP) connected to all major metros",
          road: "Delhi-Jaipur Expressway (NH48) and Delhi-Mumbai Expressway",
          description: "Around 4.5 hours drive from Delhi or a 45-minute direct flight.",
        },
        coordinates: { latitude: 26.9124, longitude: 75.7873 },
        address: "Jaipur, Rajasthan, India",
        cityType: ["heritage", "cultural", "royal"],
        popularFor: ["Amber Fort", "Hawa Mahal", "City Palace", "Jantar Mantar", "Nahargarh Fort"],
        travelThemes: ["heritage", "culture", "photography", "shopping", "luxury"],
        food: ["Dal Baati Churma", "Ghewar", "Pyaaz Kachori", "Laal Maas"],
        shopping: ["Johari Bazaar", "Bapu Bazaar", "Tripolia Bazaar"],
        weather: {
          summer: { minTemperature: 26, maxTemperature: 43, description: "Dry summer heat" },
          monsoon: { minTemperature: 22, maxTemperature: 33, description: "Pleasant showers" },
          winter: { minTemperature: 8, maxTemperature: 24, description: "Sunny days and cool crisp evenings" },
        },
        faqs: [
          {
            question: "Is elephant riding available at Amber Fort?",
            answer: "Yes, licensed traditional elephant ascents and jeep rides take visitors up to Amber Fort.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.9, count: 320 },
        seo: {
          title: "Jaipur City Travel Guide - Pink City Attractions",
          description: "Plan your trip to Jaipur: Amber Fort, Hawa Mahal, heritage hotels, and royal bazaars.",
          keywords: ["jaipur tour", "pink city jaipur", "amber fort", "hawa mahal"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
      {
        name: "Udaipur",
        slug: "udaipur",
        region: "north",
        tagline: "The City of Lakes & Venice of the East",
        shortDescription: "Mesmerizing Lake Pichola, floating palaces, and romantic heritage courtyards.",
        overview:
          "Set around a series of artificial lakes and known for its lavish royal residences, Udaipur is the romantic crown jewel of Rajasthan. Lake Palace in the middle of Lake Pichola is an architectural marvel.",
        bestTimeToVisit: "September to March",
        popularDuration: { minDays: 2, maxDays: 3 },
        howToReach: {
          airport: "Maharana Pratap Airport (UDR), 22 km east of Udaipur",
          railway: "Udaipur City Railway Station (UDZ)",
          road: "Well-maintained highways connecting Ahmedabad, Jaipur, and Jodhpur",
          description: "Daily flights from Mumbai, Delhi, and Jaipur.",
        },
        coordinates: { latitude: 24.5854, longitude: 73.7125 },
        address: "Udaipur, Rajasthan, India",
        cityType: ["romantic", "heritage", "lake"],
        popularFor: ["Lake Pichola Boat Ride", "City Palace Udaipur", "Jag Mandir", "Saheliyon Ki Bari"],
        travelThemes: ["honeymoon", "luxury", "heritage", "lakes"],
        food: ["Dal Baati", "Kadhi", "Gatte Ki Sabzi", "Mirchi Vada"],
        shopping: ["Hathi Pol Bazaar", "Bada Bazaar", "Rajasthali Emporium"],
        weather: {
          summer: { minTemperature: 24, maxTemperature: 40, description: "Warm days" },
          monsoon: { minTemperature: 22, maxTemperature: 31, description: "Lakes fill up, scenic hills" },
          winter: { minTemperature: 9, maxTemperature: 26, description: "Comfortable and romantic weather" },
        },
        faqs: [
          {
            question: "Can tourists take sunset boat cruises on Lake Pichola?",
            answer: "Yes, sunset boat cruises depart regularly from Rameshwar Ghat near City Palace.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.9, count: 280 },
        seo: {
          title: "Udaipur Tour Packages - Venice of the East",
          description: "Discover Udaipur Lake Palace, City Palace, boat rides, and romantic getaways.",
          keywords: ["udaipur tour", "lake pichola", "city palace udaipur", "udaipur honeymoon"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 2,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
      {
        name: "Jodhpur",
        slug: "jodhpur",
        region: "north",
        tagline: "The Sun City & Blue City of Marwar",
        shortDescription: "Dominated by the mighty Mehrangarh Fort and indigo blue houses.",
        overview:
          "Jodhpur is a city in the Thar Desert of the northwest Indian state of Rajasthan. Its 15th-century Mehrangarh Fort is a former palace that’s now a museum, displaying weapons, paintings and elaborate royal palanquins.",
        bestTimeToVisit: "October to March",
        popularDuration: { minDays: 1, maxDays: 2 },
        howToReach: {
          airport: "Jodhpur Domestic Airport (JDH)",
          railway: "Jodhpur Junction (JU)",
          road: "NH62 and expressway connectivity across Rajasthan",
          description: "Direct trains and flights from Delhi, Mumbai, and Jaipur.",
        },
        coordinates: { latitude: 26.2389, longitude: 73.0243 },
        address: "Jodhpur, Rajasthan, India",
        cityType: ["heritage", "fortress", "desert"],
        popularFor: ["Mehrangarh Fort", "Jaswant Thada", "Umaid Bhawan Palace", "Blue City Alleys"],
        travelThemes: ["heritage", "forts", "photography", "culture"],
        food: ["Makhaniya Lassi", "Pyaaz Kachori", "Mawa Kachori", "Mirchi Bada"],
        shopping: ["Clock Tower Market (Ghanta Ghar)", "Sojati Gate", "Nai Sarak"],
        weather: {
          summer: { minTemperature: 28, maxTemperature: 43, description: "Hot desert climate" },
          monsoon: { minTemperature: 24, maxTemperature: 36, description: "Light periodic showers" },
          winter: { minTemperature: 9, maxTemperature: 25, description: "Pleasant sunshine and cool nights" },
        },
        faqs: [
          {
            question: "Why are houses painted blue in Jodhpur?",
            answer: "The blue copper-sulfate wash traditionally repelled termites and kept homes cool in desert heat.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.8, count: 190 },
        seo: {
          title: "Jodhpur Blue City Travel Guide & Mehrangarh Fort",
          description: "Plan your trip to Jodhpur: Mehrangarh Fort zip-lining, Umaid Bhawan Palace, and Blue City photo walks.",
          keywords: ["jodhpur tour", "mehrangarh fort", "blue city jodhpur", "umaid bhawan"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: false,
        sortOrder: 3,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
      {
        name: "Jaisalmer",
        slug: "jaisalmer",
        region: "north",
        tagline: "The Golden City of the Thar Desert",
        shortDescription: "Living golden sandstone fort, Sam sand dunes, camel safaris, and stargazing.",
        overview:
          "Jaisalmer is a former medieval trading center and a princely state in the western Indian state of Rajasthan, in the heart of the Thar Desert. Known as the 'Golden City', it's distinguished by its yellow sandstone architecture.",
        bestTimeToVisit: "October to March",
        popularDuration: { minDays: 2, maxDays: 3 },
        howToReach: {
          airport: "Jaisalmer Domestic Airport (JSA)",
          railway: "Jaisalmer Railway Station (JSM)",
          road: "Connected by desert highways from Jodhpur and Bikaner",
          description: "Scenic 4.5 hours drive from Jodhpur across desert terrain.",
        },
        coordinates: { latitude: 26.9157, longitude: 70.9083 },
        address: "Jaisalmer, Rajasthan, India",
        cityType: ["desert", "heritage", "adventure"],
        popularFor: ["Jaisalmer Living Fort", "Sam Sand Dunes", "Patwon Ki Haveli", "Desert Camping"],
        travelThemes: ["desert", "camping", "heritage", "camel safari"],
        food: ["Ker Sangri", "Gatte Ki Sabzi", "Bajra Roti with Ghee", "Dal Baati"],
        shopping: ["Sadar Bazaar", "Bhatia Bazaar", "Rajasthani Camel Leather Bags"],
        weather: {
          summer: { minTemperature: 30, maxTemperature: 46, description: "Intense desert heat" },
          monsoon: { minTemperature: 25, maxTemperature: 37, description: "Scant rainfall" },
          winter: { minTemperature: 7, maxTemperature: 24, description: "Chilly desert nights, sunny days" },
        },
        faqs: [
          {
            question: "Can tourists stay overnight inside desert luxury Swiss tents?",
            answer: "Yes, Sam and Khuri sand dunes host evening folk performances, bonfires, and luxury tent stays.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.8, count: 220 },
        seo: {
          title: "Jaisalmer Desert Safari & Golden Fort Packages",
          description: "Experience desert camping, camel safaris, and golden fort tours in Jaisalmer, Rajasthan.",
          keywords: ["jaisalmer desert safari", "jaisalmer fort", "sam sand dunes", "golden city"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: false,
        sortOrder: 4,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 3. UTTAR PRADESH (North)
  // ---------------------------------------------------------------------------
  {
    name: "Uttar Pradesh",
    slug: "uttar-pradesh",
    code: "UP",
    region: "north",
    capital: "Lucknow",
    shortDescription: "Home to the Taj Mahal, holy Ganges river ghats, and royal Awadhi heritage.",
    overview:
      "Uttar Pradesh is India's most populous state and the epicentre of Indian civilization, spirituality, and monument grandeur. It houses the world-wonder Taj Mahal in Agra and the ancient spiritual city of Varanasi on the sacred banks of the Ganges.",
    bestTimeToVisit: "October to March",
    popularFor: ["Taj Mahal", "Varanasi Ghats & Ganga Aarti", "Awadhi Cuisine", "Spiritual Pilgrimages"],
    travelThemes: ["heritage", "spiritual", "wonders", "culinary", "pilgrimage"],
    seasons: {
      summer: { months: ["April", "May", "June"], description: "Warm summer plains" },
      monsoon: { months: ["July", "August", "September"], description: "Monsoon showers filling sacred rivers" },
      winter: { months: ["October", "November", "December", "January", "February", "March"], description: "Pleasant misty mornings and comfortable sightseeing" },
    },
    rating: { average: 4.9, count: 540 },
    seo: {
      title: "Uttar Pradesh Tourism - Taj Mahal & Varanasi Ghats",
      description: "Book unforgettable tours to Agra Taj Mahal, Varanasi Ganga Aarti, and royal Lucknow.",
      keywords: ["uttar pradesh tourism", "taj mahal tour", "varanasi ghats", "agra tour packages"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/uttar-pradesh",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: true,
    sortOrder: 3,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "Agra",
        slug: "agra",
        region: "north",
        tagline: "City of the Immortal Taj Mahal",
        shortDescription: "World-renowned UNESCO site Taj Mahal, Agra Fort, and Fatehpur Sikri.",
        overview:
          "Agra is a city on the banks of the Yamuna river in Uttar Pradesh. It is a major tourist destination because of its Mughal-era buildings, most notably the Taj Mahal, Agra Fort and Fatehpur Sikri, all three of which are UNESCO World Heritage Sites.",
        bestTimeToVisit: "October to March",
        popularDuration: { minDays: 1, maxDays: 2 },
        howToReach: {
          airport: "Agra Airport (AGR) or Indira Gandhi International Airport Delhi (200 km)",
          railway: "Agra Cantt (AGC) with Gatimaan & Vande Bharat Superfast Express",
          road: "Yamuna Expressway from Delhi (2.5 hours drive)",
          description: "Extremely well connected to Delhi and Jaipur via the Golden Triangle route.",
        },
        coordinates: { latitude: 27.1767, longitude: 78.0081 },
        address: "Agra, Uttar Pradesh, India",
        cityType: ["heritage", "wonders", "historical"],
        popularFor: ["Taj Mahal", "Agra Fort", "Fatehpur Sikri", "Mehtab Bagh Sunset View"],
        travelThemes: ["heritage", "wonders", "photography", "history"],
        food: ["Agra Petha", "Bedmi Puri & Aloo", "Mughlai Biryani", "Dalmoth"],
        shopping: ["Sadar Bazaar", "Kinari Bazaar", "Marble Inlay Handicrafts"],
        weather: {
          summer: { minTemperature: 26, maxTemperature: 43, description: "Hot summer days" },
          monsoon: { minTemperature: 24, maxTemperature: 34, description: "Lush gardens around monuments" },
          winter: { minTemperature: 7, maxTemperature: 22, description: "Cool and pleasant" },
        },
        faqs: [
          {
            question: "Is the Taj Mahal closed on Fridays?",
            answer: "Yes, the Taj Mahal is closed to general tourists every Friday for prayers.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.9, count: 450 },
        seo: {
          title: "Agra Taj Mahal Tours & Monument Travel Guide",
          description: "Discover Agra: Taj Mahal sunrise tours, Agra Fort, Fatehpur Sikri, and marble handicrafts.",
          keywords: ["taj mahal agra", "agra tour packages", "agra fort", "fatehpur sikri"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
      {
        name: "Varanasi",
        slug: "varanasi",
        region: "north",
        tagline: "The Spiritual Capital of India",
        shortDescription: "Sacred Ganges ghats, evening Ganga Aarti, and ancient spiritual alleys.",
        overview:
          "Varanasi, also known as Kashi and Benares, is one of the world's oldest continually inhabited cities. Situated along the holy river Ganges, its ghats are the spiritual heart of Hinduism, where life and eternity converge.",
        bestTimeToVisit: "October to March",
        popularDuration: { minDays: 2, maxDays: 3 },
        howToReach: {
          airport: "Lal Bahadur Shastri International Airport (VNS)",
          railway: "Varanasi Junction (BSB) and Banaras Station",
          road: "National highways connecting Lucknow, Prayagraj, and Patna",
          description: "Direct daily flights from Delhi, Mumbai, Bengaluru, and Kolkata.",
        },
        coordinates: { latitude: 25.3176, longitude: 82.9739 },
        address: "Varanasi, Uttar Pradesh, India",
        cityType: ["spiritual", "heritage", "ancient"],
        popularFor: ["Dashashwamedh Ghat", "Evening Ganga Aarti", "Kashi Vishwanath Temple", "Sunrise Boat Ride", "Sarnath"],
        travelThemes: ["spiritual", "culture", "photography", "pilgrimage"],
        food: ["Banarasi Paan", "Kachori Jalebi", "Malaiyo", "Tamatar Chaat", "Lassi"],
        shopping: ["Banarasi Silk Sarees", "Vishwanath Gali", "Brassware & Rudraksha"],
        weather: {
          summer: { minTemperature: 27, maxTemperature: 42, description: "Hot conditions" },
          monsoon: { minTemperature: 25, maxTemperature: 33, description: "Ganges in full flow" },
          winter: { minTemperature: 8, maxTemperature: 23, description: "Mist on the ghats, cool and pleasant" },
        },
        faqs: [
          {
            question: "When does the Evening Ganga Aarti take place?",
            answer: "Every evening at sunset (around 6:30 PM to 7:00 PM) at Dashashwamedh Ghat.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.9, count: 390 },
        seo: {
          title: "Varanasi Spiritual Tour Packages & Ganga Aarti",
          description: "Experience Varanasi sunrise boat rides on the Ganges, Kashi Vishwanath temple, and Banarasi silks.",
          keywords: ["varanasi tour", "ganga aarti varanasi", "kashi vishwanath", "varanasi ghats"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 2,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
      {
        name: "Lucknow",
        slug: "lucknow",
        region: "north",
        tagline: "The City of Nawabs & Tehzeeb",
        shortDescription: "Bara Imambara, regal Awadhi kebabs, and delicate Chikankari embroidery.",
        overview:
          "Lucknow, the capital of Uttar Pradesh, is celebrated for its historic Nawabi culture, refined courtly manners (Tehzeeb), architectural marvels like Bara Imambara, and world-renowned Awadhi gastronomy.",
        bestTimeToVisit: "October to March",
        popularDuration: { minDays: 2, maxDays: 3 },
        howToReach: {
          airport: "Chaudhary Charan Singh International Airport (LKO)",
          railway: "Lucknow Charbagh Railway Station (LKO)",
          road: "Agra-Lucknow Expressway and Purvanchal Expressway",
          description: "Well linked by air, high-speed rail, and six-lane expressways.",
        },
        coordinates: { latitude: 26.8467, longitude: 80.9462 },
        address: "Lucknow, Uttar Pradesh, India",
        cityType: ["heritage", "culinary", "cultural"],
        popularFor: ["Bara Imambara", "Chota Imambara", "Rumi Darwaza", "Hazratganj"],
        travelThemes: ["culinary", "heritage", "architecture", "shopping"],
        food: ["Galouti Kebab", "Tunday Kababi", "Lucknowi Biryani", "Sheermal", "Kulfi Falooda"],
        shopping: ["Chikankari Garments in Aminabad", "Hazratganj", "Janpath Market"],
        weather: {
          summer: { minTemperature: 27, maxTemperature: 42, description: "Warm summer days" },
          monsoon: { minTemperature: 24, maxTemperature: 33, description: "Pleasant rain" },
          winter: { minTemperature: 7, maxTemperature: 22, description: "Chilly and delightful for food walks" },
        },
        faqs: [
          {
            question: "What is special about the Bhool Bhulaiya inside Bara Imambara?",
            answer: "It is a 3D labyrinth of arched passageways built without iron or cement supports.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.8, count: 170 },
        seo: {
          title: "Lucknow City Guide - Nawabi Heritage & Awadhi Food",
          description: "Explore Lucknow Bara Imambara, Tunday Kebabs, and authentic Chikankari fashion.",
          keywords: ["lucknow tour", "bara imambara", "tunday kababi", "chikankari lucknow"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: false,
        sortOrder: 3,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 4. HIMACHAL PRADESH (North)
  // ---------------------------------------------------------------------------
  {
    name: "Himachal Pradesh",
    slug: "himachal-pradesh",
    code: "HP",
    region: "north",
    capital: "Shimla",
    shortDescription: "The Land of the Gods, snow-clad Himalayan peaks, and lush valleys.",
    overview:
      "Himachal Pradesh is a northern Indian state in the Himalayas. It's home to scenic mountain towns and resorts such as Dalhousie, Shimla, Manali, and Dharamshala, hosting outdoor adventure, Buddhist monasteries, and pine forests.",
    bestTimeToVisit: "March to June & September to February",
    popularFor: ["Snow Peaks", "Adventure Sports", "Pine Valleys", "Tibetan Monasteries"],
    travelThemes: ["himalayas", "nature", "adventure", "honeymoon", "spiritual"],
    seasons: {
      summer: { months: ["April", "May", "June"], description: "Pleasant mountain weather, escape from plains heat" },
      monsoon: { months: ["July", "August"], description: "Heavy rains and lush waterfalls" },
      winter: { months: ["October", "November", "December", "January", "February", "March"], description: "Snowfall, skiing, and winter wonderland" },
    },
    rating: { average: 4.9, count: 410 },
    seo: {
      title: "Himachal Pradesh Holiday Tour Packages - Shimla & Manali",
      description: "Book Himachal holiday packages: Shimla heritage toy train, Manali Solang valley, and Dharamshala.",
      keywords: ["himachal tour packages", "shimla tour", "manali tour packages", "dharamshala"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/himachal-pradesh",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: true,
    sortOrder: 4,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "Shimla",
        slug: "shimla",
        region: "north",
        tagline: "The Queen of Hills & British Summer Capital",
        shortDescription: "Colonial Mall Road, Christ Church, pine-covered ridges, and UNESCO Toy Train.",
        overview:
          "Shimla is the capital of Himachal Pradesh. In 1864, it was declared the summer capital of British India. Today it remains a premier hill resort celebrated for its Victorian architecture, cool breezes, and Himalayan panoramas.",
        bestTimeToVisit: "March to June & December to February (Snow)",
        popularDuration: { minDays: 2, maxDays: 3 },
        howToReach: {
          airport: "Jubbarhatti Airport Shimla (SLV) or Chandigarh Airport (IXC, 115 km)",
          railway: "Kalka-Shimla UNESCO Toy Train Railway",
          road: "Himalayan Expressway from Chandigarh (3.5 hours drive)",
          description: "Comfortable scenic drive from Chandigarh or unique toy train journey.",
        },
        coordinates: { latitude: 31.1048, longitude: 77.1734 },
        address: "Shimla, Himachal Pradesh, India",
        cityType: ["hill station", "colonial", "nature"],
        popularFor: ["The Mall Road", "The Ridge", "Jakhoo Temple", "Viceregal Lodge", "Kufri"],
        travelThemes: ["honeymoon", "family", "nature", "heritage"],
        food: ["Himachali Dham", "Siddu", "Chha Gosht", "Warm Apple Cider"],
        shopping: ["Mall Road", "Lakkar Bazaar (Wooden Crafts)", "Tibetan Market"],
        weather: {
          summer: { minTemperature: 15, maxTemperature: 28, description: "Pleasant and cool" },
          monsoon: { minTemperature: 14, maxTemperature: 22, description: "Mist and rainfall" },
          winter: { minTemperature: -2, maxTemperature: 12, description: "Snowfall in peak winter" },
        },
        faqs: [
          {
            question: "Is the Kalka-Shimla Toy Train ride scenic?",
            answer: "Yes, it travels through 102 mountain tunnels and lush green deodar valleys.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.8, count: 260 },
        seo: {
          title: "Shimla Tour Packages - Queen of Hills Guide",
          description: "Plan your Shimla vacation: Mall Road, Kufri snow sports, and Kalka-Shimla toy train.",
          keywords: ["shimla holiday", "queen of hills", "kufri", "mall road shimla"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
      {
        name: "Manali",
        slug: "manali",
        region: "north",
        tagline: "The Valley of the Gods & Adventure Hub",
        shortDescription: "Snow adventure at Solang, Rohtang Pass gateway, and pine forest trails.",
        overview:
          "Manali is a high-altitude Himalayan resort town in Himachal Pradesh. It has a reputation as a backpacking center and honeymoon destination. Set on the Beas River, it’s a gateway for skiing in the Solang Valley and trekking in Parvati Valley.",
        bestTimeToVisit: "October to June",
        popularDuration: { minDays: 3, maxDays: 5 },
        howToReach: {
          airport: "Bhuntar Airport Kullu (KUU, 50 km) or Chandigarh Airport (310 km)",
          railway: "Broad gauge rail up to Chandigarh, then private highway transfer",
          road: "Kiratpur-Manali four-lane expressway and Atal Tunnel route",
          description: "Connected by luxury Volvo buses and private chauffeur transfers.",
        },
        coordinates: { latitude: 32.2432, longitude: 77.1892 },
        address: "Manali, Himachal Pradesh, India",
        cityType: ["hill station", "adventure", "snow"],
        popularFor: ["Solang Valley", "Atal Tunnel", "Rohtang Pass", "Hadimba Temple", "Old Manali"],
        travelThemes: ["adventure", "honeymoon", "snow", "trekking"],
        food: ["Trout Fish", "Siddu", "Tibetan Momos & Thukpa", "Himachali Honey"],
        shopping: ["Mall Road Manali", "Old Manali Cafes", "Tibetan Handicrafts Center"],
        weather: {
          summer: { minTemperature: 10, maxTemperature: 25, description: "Comfortable and green" },
          monsoon: { minTemperature: 12, maxTemperature: 20, description: "Rainy" },
          winter: { minTemperature: -5, maxTemperature: 8, description: "Heavy snowfall and winter sports" },
        },
        faqs: [
          {
            question: "Is Atal Tunnel open all year round?",
            answer: "Yes, the Atal Tunnel provides all-weather connectivity towards Lahaul and Spiti.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.9, count: 340 },
        seo: {
          title: "Manali Tour Packages - Solang Valley & Atal Tunnel",
          description: "Book Manali holiday packages with Solang adventure, Rohtang snow points, and Old Manali stays.",
          keywords: ["manali tour", "solang valley", "atal tunnel", "manali snow packages"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 2,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 5. UTTARAKHAND (North)
  // ---------------------------------------------------------------------------
  {
    name: "Uttarakhand",
    slug: "uttarakhand",
    code: "UT",
    region: "north",
    capital: "Dehradun",
    shortDescription: "Devbhoomi - Land of Yoga, Ganga River Rafting, and Himalayan Peaks.",
    overview:
      "Uttarakhand, a state in northern India crossed by the Himalayas, is known for its Hindu pilgrimage sites. Rishikesh, a major centre for yoga study, was made famous by the Beatles' 1968 visit. The state also encompasses the sacred Char Dham and Jim Corbett National Park.",
    bestTimeToVisit: "September to June",
    popularFor: ["Yoga & Meditation", "River Rafting", "Wildlife Safaris", "Scenic Lakes"],
    travelThemes: ["spiritual", "adventure", "wildlife", "yoga", "nature"],
    seasons: {
      summer: { months: ["March", "April", "May", "June"], description: "Pleasant mountain weather and river rafting" },
      monsoon: { months: ["July", "August"], description: "Green valleys and dramatic clouds" },
      winter: { months: ["October", "November", "December", "January", "February"], description: "Snow in higher ridges, cool and crisp" },
    },
    rating: { average: 4.9, count: 390 },
    seo: {
      title: "Uttarakhand Tour Packages - Rishikesh, Corbett & Nainital",
      description: "Explore Devbhoomi Uttarakhand: Rishikesh river rafting, Corbett tiger safaris, and Nainital lake.",
      keywords: ["uttarakhand tour", "rishikesh rafting", "jim corbett packages", "nainital holiday"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/uttarakhand",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: true,
    sortOrder: 5,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "Rishikesh",
        slug: "rishikesh",
        region: "north",
        tagline: "The Yoga Capital of the World",
        shortDescription: "Holy Ganga Aarti, white-water river rafting, and ashrams.",
        overview:
          "Rishikesh is a city in India’s northern state of Uttarakhand, in the Himalayan foothills beside the Ganges River. The river is considered holy, and the city is renowned as a center for studying yoga and meditation.",
        bestTimeToVisit: "September to May",
        popularDuration: { minDays: 2, maxDays: 4 },
        howToReach: {
          airport: "Dehradun Jolly Grant Airport (DED, 20 km)",
          railway: "Yog Nagari Rishikesh (YNRK) & Haridwar (25 km)",
          road: "Delhi-Dehradun Expressway",
          description: "Around 4.5 hours drive from Delhi or a 45-minute flight to Dehradun.",
        },
        coordinates: { latitude: 30.0869, longitude: 78.2676 },
        address: "Rishikesh, Uttarakhand, India",
        cityType: ["spiritual", "adventure", "yoga"],
        popularFor: ["Ganga River Rafting", "Parmarth Niketan Aarti", "Ram Jhula & Laxman Jhula", "Beatles Ashram"],
        travelThemes: ["yoga", "adventure", "spiritual", "rafting"],
        food: ["Sattvic Thali", "Ayurvedic Herbal Teas", "Chotiwala Traditional Thali"],
        shopping: ["Tapasya Markets", "Yoga Mats & Beads", "Himalayan Singing Bowls"],
        weather: {
          summer: { minTemperature: 20, maxTemperature: 36, description: "Warm and ideal for rafting" },
          monsoon: { minTemperature: 22, maxTemperature: 30, description: "High river discharge, lush green" },
          winter: { minTemperature: 8, maxTemperature: 22, description: "Cool and calm, perfect for meditation" },
        },
        faqs: [
          {
            question: "Is alcohol or non-vegetarian food allowed in Rishikesh?",
            answer: "No, Rishikesh is a strictly vegetarian and alcohol-free sacred town.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.9, count: 310 },
        seo: {
          title: "Rishikesh Yoga & River Rafting Travel Guide",
          description: "Experience Rishikesh: White-water rafting on the Ganges, Parmarth Niketan Ganga Aarti, and yoga ashrams.",
          keywords: ["rishikesh tour", "ganga rafting rishikesh", "yoga capital", "parmarth niketan"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 6. KERALA (South)
  // ---------------------------------------------------------------------------
  {
    name: "Kerala",
    slug: "kerala",
    code: "KL",
    region: "south",
    capital: "Thiruvananthapuram",
    shortDescription: "God's Own Country - Emerald Backwaters, Ayurvedic Spas, and Tea Estates.",
    overview:
      "Kerala, a state on India's tropical Malabar Coast, has nearly 600km of Arabian Sea shoreline. It's known for its palm-lined beaches and backwaters, a network of canals. Inland are the Western Ghats, mountains whose slopes support tea, coffee and spice plantations.",
    bestTimeToVisit: "September to March",
    popularFor: ["Alleppey Houseboats", "Munnar Tea Plantations", "Ayurveda Wellness", "Kathakali Dance"],
    travelThemes: ["backwaters", "nature", "wellness", "honeymoon", "beach"],
    seasons: {
      summer: { months: ["March", "April", "May"], description: "Warm tropical weather, great for hill station visits" },
      monsoon: { months: ["June", "July", "August"], description: "Traditional Ayurvedic rejuvenation season" },
      winter: { months: ["September", "October", "November", "December", "January", "February"], description: "Pleasant tropical breezes, peak travel season" },
    },
    rating: { average: 4.9, count: 510 },
    seo: {
      title: "Kerala Tour Packages - God's Own Country Holidays",
      description: "Book Kerala holiday packages: Alleppey houseboat cruises, Munnar tea estates, and Kochi heritage.",
      keywords: ["kerala tour packages", "alleppey houseboat", "munnar hill station", "kerala backwaters"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/kerala",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: true,
    sortOrder: 6,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "Kochi",
        slug: "kochi",
        region: "south",
        tagline: "Queen of the Arabian Sea & Spice Port",
        shortDescription: "Chinese fishing nets, Fort Kochi colonial mansions, and spice bazaars.",
        overview:
          "Kochi (also known as Cochin) is a vibrant port city on the southwest coast of India. Fort Kochi preserves a rich blend of Portuguese, Dutch, and British colonial architecture, along with ancient Jewish synagogues and spice warehouses.",
        bestTimeToVisit: "October to March",
        popularDuration: { minDays: 2, maxDays: 3 },
        howToReach: {
          airport: "Cochin International Airport (COK) - world's first fully solar airport",
          railway: "Ernakulam Junction (ERS) & Ernakulam Town (ERN)",
          road: "NH66 coastal highway",
          description: "Major international gateway with direct Gulf and Asian flights.",
        },
        coordinates: { latitude: 9.9312, longitude: 76.2673 },
        address: "Kochi, Kerala, India",
        cityType: ["coastal", "heritage", "spice port"],
        popularFor: ["Chinese Fishing Nets", "Fort Kochi", "Mattancherry Palace", "Jew Town"],
        travelThemes: ["heritage", "coastal", "culinary", "art"],
        food: ["Kerala Seafood Curry", "Appam with Stew", "Karimeen Pollichathu", "Banana Chips"],
        shopping: ["Jew Town Antique Shops", "Broadway Spice Market", "Lulu Mall"],
        weather: {
          summer: { minTemperature: 25, maxTemperature: 34, description: "Tropical warm" },
          monsoon: { minTemperature: 23, maxTemperature: 30, description: "Lush tropical rains" },
          winter: { minTemperature: 22, maxTemperature: 31, description: "Pleasant coastal breeze" },
        },
        faqs: [
          {
            question: "Where can visitors watch authentic Kathakali dance in Kochi?",
            answer: "The Kerala Kathakali Centre in Fort Kochi hosts daily evening makeup and dance performances.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.8, count: 280 },
        seo: {
          title: "Kochi City Travel Guide - Fort Kochi & Chinese Fishing Nets",
          description: "Explore Kochi: Fort Kochi walks, spice warehouses, Kathakali shows, and Arabian sea sunsets.",
          keywords: ["kochi tour", "fort kochi", "chinese fishing nets", "kerala spice tour"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
      {
        name: "Alleppey",
        slug: "alleppey",
        region: "south",
        tagline: "The Venice of the East & Houseboat Capital",
        shortDescription: "Overnight luxury houseboat cruises along tranquil palm-fringed backwaters.",
        overview:
          "Alleppey (Alappuzha) is the hub of Kerala's backwaters, home to a vast network of waterways and more than a thousand houseboats. Known for its peaceful paddy fields and boat races.",
        bestTimeToVisit: "September to March",
        popularDuration: { minDays: 1, maxDays: 2 },
        howToReach: {
          airport: "Cochin International Airport (COK, 75 km)",
          railway: "Alappuzha Railway Station (ALLP)",
          road: "Connected via NH66 from Kochi (1.5 hours drive)",
          description: "Easily accessible from Kochi by private air-conditioned vehicle.",
        },
        coordinates: { latitude: 9.4981, longitude: 76.3388 },
        address: "Alappuzha, Kerala, India",
        cityType: ["backwaters", "houseboat", "nature"],
        popularFor: ["Overnight Houseboat Cruise", "Vembanad Lake", "Alappuzha Beach & Lighthouse", "Nehru Trophy Boat Race"],
        travelThemes: ["backwaters", "honeymoon", "relaxation", "nature"],
        food: ["Kerala Fish Fry", "Fresh Coconut Water", "Duck Roast", "Puttu and Kadala"],
        shopping: ["Coir Crafts", "Spices", "Handmade Coconut Shell Souvenirs"],
        weather: {
          summer: { minTemperature: 25, maxTemperature: 35, description: "Warm and humid" },
          monsoon: { minTemperature: 23, maxTemperature: 29, description: "Romantic monsoon backwaters" },
          winter: { minTemperature: 21, maxTemperature: 31, description: "Breezy and pleasant" },
        },
        faqs: [
          {
            question: "What amenities are included in an Alleppey luxury houseboat?",
            answer: "Private air-conditioned bedrooms, onboard private chef, living deck, and freshly cooked Kerala meals.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.9, count: 340 },
        seo: {
          title: "Alleppey Houseboat Packages & Backwater Tours",
          description: "Book private luxury houseboats in Alleppey: Vembanad lake cruising, local village life, and authentic dining.",
          keywords: ["alleppey houseboat", "kerala backwater tour", "alappuzha cruise", "luxury houseboat"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 2,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
      {
        name: "Munnar",
        slug: "munnar",
        region: "south",
        tagline: "Emerald Tea Garden Hills of the Western Ghats",
        shortDescription: "Rolling tea plantations, misty hill roads, and endangered Nilgiri Tahr.",
        overview:
          "Munnar is a town and hill station in the Idukki district of the southwestern Indian state of Kerala. Situated at around 1,600 metres above sea level in the Western Ghats, it was once the summer resort of the British Raj elite.",
        bestTimeToVisit: "September to May",
        popularDuration: { minDays: 2, maxDays: 3 },
        howToReach: {
          airport: "Cochin International Airport (COK, 110 km)",
          railway: "Aluva (110 km) or Ernakulam (125 km)",
          road: "Scenic ghat road from Kochi through rubber and tea plantations",
          description: "A scenic 3.5 hours drive winding through mist and mountain waterfalls.",
        },
        coordinates: { latitude: 10.0889, longitude: 77.0595 },
        address: "Munnar, Kerala, India",
        cityType: ["hill station", "tea plantations", "nature"],
        popularFor: ["Tea Museum", "Eravikulam National Park", "Mattupetty Dam", "Top Station Viewpoint"],
        travelThemes: ["nature", "honeymoon", "tea", "hills"],
        food: ["Kerala Ela Sadya", "Hot Cardamom Spiced Tea", "Fresh Corn and Banana Fritters"],
        shopping: ["Fresh Factory Tea Leaves", "Cardamom & Pepper", "Homemade Chocolates"],
        weather: {
          summer: { minTemperature: 15, maxTemperature: 25, description: "Pleasantly mild" },
          monsoon: { minTemperature: 13, maxTemperature: 19, description: "Heavy rains and gushing waterfalls" },
          winter: { minTemperature: 5, maxTemperature: 20, description: "Misty mornings and crisp chill" },
        },
        faqs: [
          {
            question: "Where can visitors see the Nilgiri Tahr in Munnar?",
            answer: "At Eravikulam National Park, which protects the largest wild population of Nilgiri Tahr.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.9, count: 290 },
        seo: {
          title: "Munnar Hill Station Packages & Tea Garden Tours",
          description: "Experience Munnar: Tea factory tastings, Eravikulam National Park, and luxury misty mountain resorts.",
          keywords: ["munnar tour", "munnar tea gardens", "eravikulam national park", "kerala hill station"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 3,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 7. GOA (West)
  // ---------------------------------------------------------------------------
  {
    name: "Goa",
    slug: "goa",
    code: "GA",
    region: "west",
    capital: "Panaji",
    shortDescription: "Sun, Sand, Portuguese Colonial Heritage, and Golden Arabian Sea Beaches.",
    overview:
      "Goa is a state in western India with coastlines stretching along the Arabian Sea. Its long history as a Portuguese colony prior to 1961 is evident in its preserved 17th-century churches and the area's tropical spice plantations.",
    bestTimeToVisit: "October to April",
    popularFor: ["Golden Beaches", "Water Sports", "Portuguese Churches", "Seafood & Nightlife"],
    travelThemes: ["beach", "nightlife", "heritage", "coastal", "relaxation"],
    seasons: {
      summer: { months: ["March", "April", "May"], description: "Warm coastal days, budget-friendly travel" },
      monsoon: { months: ["June", "July", "August", "September"], description: "Lush green countryside, roaring Dudhsagar falls" },
      winter: { months: ["October", "November", "December", "January", "February"], description: "Peak festival season, pleasant sea breeze and beach parties" },
    },
    rating: { average: 4.9, count: 520 },
    seo: {
      title: "Goa Holiday Tour Packages - Beaches, Cruises & Heritage",
      description: "Book Goa vacation packages: North Goa beaches, South Goa luxury resorts, and Old Goa churches.",
      keywords: ["goa tour packages", "goa beaches", "north goa", "south goa resorts", "old goa"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/goa",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: true,
    sortOrder: 7,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "North Goa",
        slug: "north-goa",
        region: "west",
        tagline: "The Vibrant Beach & Nightlife Hub",
        shortDescription: "Famous beaches, lively beach shacks, water sports, and historic forts.",
        overview:
          "North Goa is celebrated worldwide for its energetic beachfronts including Calangute, Baga, and Anjuna. Home to the 17th-century Fort Aguada and vibrant weekend flea markets.",
        bestTimeToVisit: "October to April",
        popularDuration: { minDays: 3, maxDays: 5 },
        howToReach: {
          airport: "Manohar International Airport Mopa (GOX) or Dabolim (GOI)",
          railway: "Thivim Railway Station (THVM)",
          road: "NH66 from Mumbai and Pune",
          description: "Direct connectivity to Mopa International Airport in North Goa.",
        },
        coordinates: { latitude: 15.5439, longitude: 73.7554 },
        address: "North Goa, Goa, India",
        cityType: ["beach", "party", "water sports"],
        popularFor: ["Baga Beach", "Calangute Beach", "Fort Aguada", "Anjuna Flea Market", "Chapora Fort"],
        travelThemes: ["beach", "nightlife", "water sports", "friends"],
        food: ["Goan Fish Curry", "Pork Vindaloo", "Bebinca", "Prawn Balchao"],
        shopping: ["Anjuna Flea Market", "Saturday Night Market Arpora", "Tibetan Street Stalls"],
        weather: {
          summer: { minTemperature: 26, maxTemperature: 35, description: "Warm and sunny" },
          monsoon: { minTemperature: 24, maxTemperature: 30, description: "High waves and romantic rain" },
          winter: { minTemperature: 21, maxTemperature: 32, description: "Perfect beach weather" },
        },
        faqs: [
          {
            question: "What water sports are available in North Goa?",
            answer: "Parasailing, jet skiing, banana boat rides, and bumper rides are available at Baga and Calangute.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.8, count: 340 },
        seo: {
          title: "North Goa Tour Packages - Baga, Calangute & Aguada",
          description: "Explore North Goa: Beach shacks, parasailing, Chapora Fort, and vibrant nightlife.",
          keywords: ["north goa tour", "baga beach", "calangute", "fort aguada"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
      {
        name: "South Goa",
        slug: "south-goa",
        region: "west",
        tagline: "Serene Sands, Luxury Beach Resorts & Heritage",
        shortDescription: "Quiet white sand beaches, 5-star beachfront resorts, and Old Goa UNESCO churches.",
        overview:
          "South Goa offers a relaxed, tranquil counterpoint to the north. Famed for its pristine white sands at Colva, Palolem, and Benaulim, as well as the UNESCO World Heritage Basilica of Bom Jesus in Old Goa.",
        bestTimeToVisit: "October to April",
        popularDuration: { minDays: 2, maxDays: 4 },
        howToReach: {
          airport: "Dabolim International Airport (GOI) in South Goa",
          railway: "Madgaon Junction (MAO)",
          road: "NH66 coastal highway",
          description: "Minutes away from Dabolim airport and Madgaon railway station.",
        },
        coordinates: { latitude: 15.2832, longitude: 73.9862 },
        address: "South Goa, Goa, India",
        cityType: ["beach", "luxury", "heritage"],
        popularFor: ["Palolem Beach", "Basilica of Bom Jesus", "Colva Beach", "Cabo de Rama Fort"],
        travelThemes: ["honeymoon", "luxury", "relaxation", "heritage"],
        food: ["Goan Crab Xacuti", "Poi Bread", "Kingfish Rava Fry", "Feni"],
        shopping: ["Margao Municipal Market", "Handicrafts Emporium"],
        weather: {
          summer: { minTemperature: 25, maxTemperature: 34, description: "Warm and bright" },
          monsoon: { minTemperature: 23, maxTemperature: 29, description: "Lush and serene" },
          winter: { minTemperature: 20, maxTemperature: 31, description: "Gentle sunshine and calm seas" },
        },
        faqs: [
          {
            question: "Where is the mortal remains of St. Francis Xavier kept?",
            answer: "Inside a silver casket at the Basilica of Bom Jesus in Old Goa.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.9, count: 280 },
        seo: {
          title: "South Goa Luxury Beach Resorts & Old Goa Churches",
          description: "Experience peace in South Goa: Palolem beach sunsets, 5-star luxury resorts, and historic Portuguese churches.",
          keywords: ["south goa tour", "palolem beach", "basilica of bom jesus", "south goa resorts"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: false,
        sortOrder: 2,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 8. MAHARASHTRA (West)
  // ---------------------------------------------------------------------------
  {
    name: "Maharashtra",
    slug: "maharashtra",
    code: "MH",
    region: "west",
    capital: "Mumbai",
    shortDescription: "Economic capital, UNESCO Ajanta-Ellora caves, and Western Ghat hill stations.",
    overview:
      "Maharashtra spans peninsular central and western India. Its capital, Mumbai, is India's financial hub and home to the Bollywood film industry. Inland, the state features the ancient rock-cut caves of Ajanta and Ellora.",
    bestTimeToVisit: "October to March",
    popularFor: ["Gateway of India", "Bollywood", "Ajanta & Ellora Caves", "Lonavala Hill Station"],
    travelThemes: ["metropolitan", "heritage", "nature", "caves", "coastal"],
    seasons: {
      summer: { months: ["March", "April", "May"], description: "Warm in coastal areas, cooler in Sahyadri hills" },
      monsoon: { months: ["June", "July", "August", "September"], description: "Scenic waterfalls across Lonavala, Khandala and Western Ghats" },
      winter: { months: ["October", "November", "December", "January", "February"], description: "Pleasant coastal climate, ideal for sightseeing" },
    },
    rating: { average: 4.8, count: 420 },
    seo: {
      title: "Maharashtra Tourism - Mumbai, Ajanta Ellora & Hill Stations",
      description: "Explore Maharashtra: Mumbai city tours, heritage cave temples, and Western Ghat getaways.",
      keywords: ["maharashtra tourism", "mumbai tour packages", "ajanta ellora caves", "lonavala packages"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/maharashtra",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: true,
    sortOrder: 8,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "Mumbai",
        slug: "mumbai",
        region: "west",
        tagline: "The City of Dreams & Financial Capital",
        shortDescription: "Gateway of India, Marine Drive Queen's Necklace, and Bollywood.",
        overview:
          "Mumbai (formerly Bombay) is a densely populated city on India’s west coast. A financial powerhouse, it's India's largest city. On the Mumbai Harbour waterfront stands the iconic Gateway of India stone arch, built in 1924.",
        bestTimeToVisit: "October to March",
        popularDuration: { minDays: 2, maxDays: 3 },
        howToReach: {
          airport: "Chhatrapati Shivaji Maharaj International Airport (BOM)",
          railway: "Chhatrapati Shivaji Maharaj Terminus (CSMT) - UNESCO World Heritage Site",
          road: "Mumbai-Pune Expressway and coastal sea links",
          description: "Global aviation hub with non-stop flights across the world.",
        },
        coordinates: { latitude: 18.922, longitude: 72.8347 },
        address: "Mumbai, Maharashtra, India",
        cityType: ["metropolitan", "financial", "coastal"],
        popularFor: ["Gateway of India", "Marine Drive", "Elephanta Caves", "Colaba Causeway", "CSMT Terminus"],
        travelThemes: ["urban", "heritage", "culinary", "shopping"],
        food: ["Vada Pav", "Pav Bhaji", "Bombay Duck", "Parsi Berry Pulao", "Bhel Puri"],
        shopping: ["Colaba Causeway", "Linking Road Bandra", "Fashion Street"],
        weather: {
          summer: { minTemperature: 25, maxTemperature: 35, description: "Warm and humid" },
          monsoon: { minTemperature: 24, maxTemperature: 30, description: "Heavy rains and stormy sea" },
          winter: { minTemperature: 18, maxTemperature: 31, description: "Cool and pleasant" },
        },
        faqs: [
          {
            question: "How can one visit the UNESCO Elephanta Caves?",
            answer: "Ferries depart regularly from the Gateway of India jetty across Mumbai harbour.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.8, count: 320 },
        seo: {
          title: "Mumbai City Tour Packages - Gateway of India & Marine Drive",
          description: "Plan your Mumbai vacation: South Mumbai heritage walks, Elephanta caves, and Bollywood studio tours.",
          keywords: ["mumbai tour", "gateway of india", "marine drive", "elephanta caves"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 9. TAMIL NADU (South)
  // ---------------------------------------------------------------------------
  {
    name: "Tamil Nadu",
    slug: "tamil-nadu",
    code: "TN",
    region: "south",
    capital: "Chennai",
    shortDescription: "Dravidian Temple Architecture, Silk Weaving, and Hill Stations.",
    overview:
      "Tamil Nadu is a South Indian state famed for its Dravidian-style Hindu temples. In Madurai, Meenakshi Amman Temple has high 'gopuram' towers adorned with colourful figures. On Pamban Island, Ramanathaswamy Temple is a major pilgrimage site.",
    bestTimeToVisit: "November to March",
    popularFor: ["Dravidian Temples", "Meenakshi Amman Temple", "Mahabalipuram Shore Temple", "Kanchipuram Silks"],
    travelThemes: ["heritage", "spiritual", "architecture", "coastal"],
    seasons: {
      summer: { months: ["March", "April", "May"], description: "Hot conditions in plains, great for Ooty and Kodaikanal" },
      monsoon: { months: ["October", "November", "December"], description: "Northeast monsoon season" },
      winter: { months: ["January", "February"], description: "Pleasant and ideal for temple tours" },
    },
    rating: { average: 4.8, count: 350 },
    seo: {
      title: "Tamil Nadu Tourism - Temple Tours & Heritage Sites",
      description: "Discover Tamil Nadu: Meenakshi temple Madurai, Mahabalipuram shore temples, and Ooty hills.",
      keywords: ["tamil nadu tourism", "madurai meenakshi temple", "mahabalipuram tour", "ooty packages"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/tamil-nadu",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: false,
    sortOrder: 9,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "Chennai",
        slug: "chennai",
        region: "south",
        tagline: "The Gateway to South India & Cultural Capital",
        shortDescription: "Marina Beach, Kapaleeshwarar Temple, and classical Carnatic music.",
        overview:
          "Chennai, on the Bay of Bengal in eastern India, is the capital of Tamil Nadu. The city is famous for its vibrant classical dance and music traditions, Marina Beach, and colonial Fort St. George.",
        bestTimeToVisit: "November to February",
        popularDuration: { minDays: 2, maxDays: 3 },
        howToReach: {
          airport: "Chennai International Airport (MAA)",
          railway: "Chennai Central (MAS) & Chennai Egmore (MS)",
          road: "East Coast Road (ECR) towards Mahabalipuram and Pondicherry",
          description: "Direct international flights to Asia, Middle East, and Europe.",
        },
        coordinates: { latitude: 13.0827, longitude: 80.2707 },
        address: "Chennai, Tamil Nadu, India",
        cityType: ["metropolitan", "coastal", "cultural"],
        popularFor: ["Marina Beach", "Kapaleeshwarar Temple", "San Thome Cathedral", "Mahabalipuram Excursion"],
        travelThemes: ["culture", "heritage", "coastal", "culinary"],
        food: ["Idli & Sambar", "Filter Coffee", "Chettinad Chicken", "Crisp Dosas"],
        shopping: ["T Nagar (Kanchipuram Silk Sarees)", "Express Avenue", "Mylapore Traditional Shops"],
        weather: {
          summer: { minTemperature: 28, maxTemperature: 40, description: "Hot tropical climate" },
          monsoon: { minTemperature: 24, maxTemperature: 31, description: "Northeast monsoon rains" },
          winter: { minTemperature: 21, maxTemperature: 30, description: "Pleasant sea breezes" },
        },
        faqs: [
          {
            question: "How long is Marina Beach in Chennai?",
            answer: "Marina Beach stretches approximately 13 km, making it one of the longest urban beaches in the world.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.7, count: 210 },
        seo: {
          title: "Chennai City Travel Guide - Temples, Beaches & Silk",
          description: "Explore Chennai: Marina beach, Mylapore Kapaleeshwarar temple, and South Indian culinary trails.",
          keywords: ["chennai tour", "marina beach", "mylapore temple", "chennai travel guide"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: false,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
      {
        name: "Madurai",
        slug: "madurai",
        region: "south",
        tagline: "The Ancient Lotus City of Temples",
        shortDescription: "Magnificent Meenakshi Amman Temple with towering colorful gopurams.",
        overview:
          "Madurai is an energetic, ancient city on the Vaigai River in Tamil Nadu. Its skyline is dominated by the 14 colorful gopurams (gateway towers) of Meenakshi Amman Temple, an architectural wonder.",
        bestTimeToVisit: "October to March",
        popularDuration: { minDays: 1, maxDays: 2 },
        howToReach: {
          airport: "Madurai Airport (IXM)",
          railway: "Madurai Junction (MDU)",
          road: "Connected by national highways from Chennai and Bengaluru",
          description: "Well linked by domestic flights and daily express trains.",
        },
        coordinates: { latitude: 9.9252, longitude: 78.1198 },
        address: "Madurai, Tamil Nadu, India",
        cityType: ["temple city", "heritage", "ancient"],
        popularFor: ["Meenakshi Amman Temple", "Thirumalai Nayakkar Palace", "Gandhi Memorial Museum"],
        travelThemes: ["spiritual", "architecture", "heritage", "photography"],
        food: ["Jigarthanda", "Madurai Bun Parotta", "Mutton Kari Dosa", "Filter Coffee"],
        shopping: ["Puthu Mandapam (Handloom fabrics & brassware)"],
        weather: {
          summer: { minTemperature: 27, maxTemperature: 41, description: "Hot conditions" },
          monsoon: { minTemperature: 24, maxTemperature: 33, description: "Moderate rains" },
          winter: { minTemperature: 20, maxTemperature: 30, description: "Comfortable and pleasant" },
        },
        faqs: [
          {
            question: "Is there a night ceremony at Meenakshi Temple?",
            answer: "Yes, every night around 9:00 PM, Lord Shiva's idol is carried in a procession to Goddess Meenakshi's shrine.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.9, count: 250 },
        seo: {
          title: "Madurai Meenakshi Temple Tours & Heritage Guide",
          description: "Experience the wonder of Madurai: Meenakshi Amman Temple, night ceremonies, and authentic Jigarthanda drink.",
          keywords: ["madurai tour", "meenakshi amman temple", "madurai temple guide", "thirumalai nayakkar palace"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 2,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 10. KARNATAKA (South)
  // ---------------------------------------------------------------------------
  {
    name: "Karnataka",
    slug: "karnataka",
    code: "KA",
    region: "south",
    capital: "Bengaluru",
    shortDescription: "One State Many Worlds - Silicon Valley, Hampi Ruins, and Coffee Hills.",
    overview:
      "Karnataka is a state in southwest India with Arabian Sea coastlines. The capital, Bengaluru, is a high-tech hub known for its shopping and nightlife. To the southwest, Mysore is home to lavish palaces including Mysore Palace. In the north, Hampi contains ruins of the Vijayanagara Empire.",
    bestTimeToVisit: "October to March",
    popularFor: ["Hampi UNESCO Ruins", "Mysore Palace", "Coorg Coffee Estates", "Bengaluru Tech Hub"],
    travelThemes: ["heritage", "coffee", "wildlife", "ruins", "urban"],
    seasons: {
      summer: { months: ["March", "April", "May"], description: "Warm in plains, cool in Coorg and Chikmagalur" },
      monsoon: { months: ["June", "July", "August", "September"], description: "Lush green plantations and roaring waterfalls" },
      winter: { months: ["October", "November", "December", "January", "February"], description: "Cool and pleasant weather across the state" },
    },
    rating: { average: 4.8, count: 360 },
    seo: {
      title: "Karnataka Tour Packages - Hampi, Coorg & Mysore Palace",
      description: "Book Karnataka holidays: Hampi ancient ruins, royal Mysore Palace, and Coorg coffee plantation stays.",
      keywords: ["karnataka tour packages", "hampi ruins", "coorg packages", "mysore palace"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/karnataka",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: false,
    sortOrder: 10,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "Bengaluru",
        slug: "bengaluru",
        region: "south",
        tagline: "The Garden City & Silicon Valley of India",
        shortDescription: "Lush botanical gardens, craft microbreweries, and pleasant year-round weather.",
        overview:
          "Bengaluru (also called Bangalore) is the center of India's high-tech industry. The city is also known for its parks and nightlife, featuring Lalbagh Botanical Garden and Cubbon Park.",
        bestTimeToVisit: "Year-Round (Best: October to March)",
        popularDuration: { minDays: 2, maxDays: 3 },
        howToReach: {
          airport: "Kempegowda International Airport (BLR)",
          railway: "KSR Bengaluru City Junction (SBC) & Yesvantpur (YPR)",
          road: "Connected by expressways to Mysuru, Chennai, and Hyderabad",
          description: "World-class international airport with domestic and intercontinental links.",
        },
        coordinates: { latitude: 12.9716, longitude: 77.5946 },
        address: "Bengaluru, Karnataka, India",
        cityType: ["metropolitan", "garden city", "tech hub"],
        popularFor: ["Lalbagh Botanical Garden", "Bangalore Palace", "Cubbon Park", "Indiranagar Breweries"],
        travelThemes: ["urban", "gardens", "breweries", "culinary"],
        food: ["Masala Dosa at Vidyarthi Bhavan", "Bisi Bele Bath", "Filter Coffee", "Mysore Pak"],
        shopping: ["Commercial Street", "Brigade Road", "UB City Luxury Mall"],
        weather: {
          summer: { minTemperature: 21, maxTemperature: 34, description: "Warm but rarely harsh" },
          monsoon: { minTemperature: 19, maxTemperature: 28, description: "Pleasant rain and cool breeze" },
          winter: { minTemperature: 15, maxTemperature: 28, description: "Delightfully cool" },
        },
        faqs: [
          {
            question: "Why is Bengaluru called the pub capital of India?",
            answer: "It has the largest concentration of independent craft microbreweries and open-air pubs in Asia.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.8, count: 270 },
        seo: {
          title: "Bengaluru City Travel Guide - Garden City & Breweries",
          description: "Plan your trip to Bengaluru: Lalbagh gardens, Bangalore Palace, and craft beer hotspots.",
          keywords: ["bengaluru tour", "bangalore palace", "lalbagh garden", "bangalore travel guide"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: false,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
      {
        name: "Hampi",
        slug: "hampi",
        region: "south",
        tagline: "The Golden Ruins of the Vijayanagara Empire",
        shortDescription: "UNESCO World Heritage boulder landscape, stone chariot, and ancient temples.",
        overview:
          "Hampi is an ancient village in Karnataka dotted with numerous ruined temple complexes from the Vijayanagara Empire. On the Tungabhadra River, its dramatic surreal landscape of giant granite boulders is unforgettable.",
        bestTimeToVisit: "October to March",
        popularDuration: { minDays: 2, maxDays: 3 },
        howToReach: {
          airport: "Hubli Airport (160 km) or Jindal Vijayanagar Airport (JVD, 40 km)",
          railway: "Hosapete Junction (HPT, 12 km from Hampi)",
          road: "Overnight luxury buses and trains from Bengaluru and Goa",
          description: "Convenient rail access from Bengaluru, Hyderabad, and Goa.",
        },
        coordinates: { latitude: 15.335, longitude: 76.46 },
        address: "Hampi, Karnataka, India",
        cityType: ["ruins", "heritage", "archaeological"],
        popularFor: ["Stone Chariot at Vijaya Vittala Temple", "Virupaksha Temple", "Lotus Mahal", "Sunset from Matanga Hill"],
        travelThemes: ["heritage", "archaeology", "photography", "history"],
        food: ["South Indian Vegetarian Thali", "Poli", "Filter Coffee"],
        shopping: ["Hampi Bazaar Souvenirs", "Stone Carvings", "Handmade Lambani Embroidery"],
        weather: {
          summer: { minTemperature: 25, maxTemperature: 41, description: "Hot dry rocks" },
          monsoon: { minTemperature: 22, maxTemperature: 31, description: "Green vegetation between boulders" },
          winter: { minTemperature: 15, maxTemperature: 30, description: "Sunny and comfortable for walking" },
        },
        faqs: [
          {
            question: "Is the Stone Chariot in Hampi featured on Indian currency?",
            answer: "Yes, the iconic Stone Chariot of Hampi is printed on the Indian 50-rupee currency note.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.9, count: 310 },
        seo: {
          title: "Hampi UNESCO Ruins Travel Guide - Vijaya Vittala & Virupaksha",
          description: "Discover Hampi: Ancient Vijayanagara ruins, Stone Chariot, boulder climbing, and coracle river rides.",
          keywords: ["hampi tour", "stone chariot hampi", "virupaksha temple", "hampi ruins karnataka"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 2,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 11. WEST BENGAL (East)
  // ---------------------------------------------------------------------------
  {
    name: "West Bengal",
    slug: "west-bengal",
    code: "WB",
    region: "east",
    capital: "Kolkata",
    shortDescription: "Cultural hub, Victoria Memorial, Darjeeling Himalayan Railway, and Sundarbans.",
    overview:
      "West Bengal stretches from the Himalayas in the north to the Bay of Bengal in the south. The state capital, Kolkata, displays grand colonial architecture. Northwards lies Darjeeling, famed for its world-renowned tea and views of Kangchenjunga.",
    bestTimeToVisit: "October to March",
    popularFor: ["Victoria Memorial", "Darjeeling Toy Train", "Durga Puja Festival", "Sundarbans Royal Bengal Tigers"],
    travelThemes: ["culture", "tea", "himalayas", "wildlife", "heritage"],
    seasons: {
      summer: { months: ["April", "May", "June"], description: "Warm in plains, pleasant in Darjeeling" },
      monsoon: { months: ["July", "August", "September"], description: "Heavy rains across delta and tea slopes" },
      winter: { months: ["October", "November", "December", "January", "February", "March"], description: "Delightfully cool, peak festival and sightseeing season" },
    },
    rating: { average: 4.8, count: 340 },
    seo: {
      title: "West Bengal Tourism - Kolkata, Darjeeling & Sundarbans",
      description: "Experience West Bengal: Kolkata colonial heritage, Darjeeling tea estates, and Sundarbans tiger safaris.",
      keywords: ["west bengal tourism", "kolkata tour", "darjeeling holiday", "sundarbans safari"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/west-bengal",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: false,
    sortOrder: 11,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "Kolkata",
        slug: "kolkata",
        region: "east",
        tagline: "The City of Joy & Cultural Capital of India",
        shortDescription: "Victoria Memorial, Howrah Bridge, iconic yellow taxis, and intellectual heritage.",
        overview:
          "Kolkata (formerly Calcutta) is the capital of India's West Bengal state. Founded as an East India Company trading post, it was India's capital under the British Raj until 1911. Known for its literary, artistic and revolutionary heritage.",
        bestTimeToVisit: "October to March",
        popularDuration: { minDays: 2, maxDays: 4 },
        howToReach: {
          airport: "Netaji Subhash Chandra Bose International Airport (CCU)",
          railway: "Howrah Junction (HWH) & Sealdah (SDAH)",
          road: "NH16 and national highway network",
          description: "Connected to all parts of India and Southeast Asia.",
        },
        coordinates: { latitude: 22.5726, longitude: 88.3639 },
        address: "Kolkata, West Bengal, India",
        cityType: ["metropolitan", "cultural", "colonial"],
        popularFor: ["Victoria Memorial", "Howrah Bridge", "Dakshineswar Kali Temple", "Park Street"],
        travelThemes: ["culture", "heritage", "literature", "culinary"],
        food: ["Rosogolla", "Kolkata Biryani with Aloo", "Kathi Rolls", "Mishti Doi", "Macher Jhol"],
        shopping: ["New Market", "College Street (World's Largest Second-hand Book Market)", "Gariahat"],
        weather: {
          summer: { minTemperature: 26, maxTemperature: 38, description: "Hot and humid" },
          monsoon: { minTemperature: 25, maxTemperature: 32, description: "Bountiful rains" },
          winter: { minTemperature: 13, maxTemperature: 26, description: "Pleasantly cool and festive" },
        },
        faqs: [
          {
            question: "Is the tram still operating in Kolkata?",
            answer: "Yes, Kolkata operates the oldest surviving electric tram system in Asia.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.8, count: 280 },
        seo: {
          title: "Kolkata Travel Guide - City of Joy & Victoria Memorial",
          description: "Plan your Kolkata trip: Howrah Bridge, Victoria Memorial, Durga Puja festivities, and sweets.",
          keywords: ["kolkata tour", "city of joy", "victoria memorial", "howrah bridge"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: false,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
      {
        name: "Darjeeling",
        slug: "darjeeling",
        region: "east",
        tagline: "The Queen of the Hills & Champagne of Teas",
        shortDescription: "UNESCO Toy Train, Tiger Hill sunrise over Mt. Kanchenjunga, and tea estates.",
        overview:
          "Darjeeling is a town in India's West Bengal state, in the Himalayan foothills. Once a summer resort for the British Raj elite, it remains the terminus of the narrow-gauge Darjeeling Himalayan Railway, or 'Toy Train', completed in 1881.",
        bestTimeToVisit: "March to May & October to December",
        popularDuration: { minDays: 2, maxDays: 3 },
        howToReach: {
          airport: "Bagdogra Airport (IXB, 70 km)",
          railway: "New Jalpaiguri Junction (NJP, 75 km)",
          road: "Hill Cart Road winding through tea gardens",
          description: "A scenic 3-hour hill drive from Bagdogra airport or NJP station.",
        },
        coordinates: { latitude: 27.041, longitude: 88.2663 },
        address: "Darjeeling, West Bengal, India",
        cityType: ["hill station", "tea", "himalayas"],
        popularFor: ["Tiger Hill Sunrise", "Darjeeling Himalayan Toy Train", "Batasia Loop", "Happy Valley Tea Estate"],
        travelThemes: ["tea", "himalayas", "nature", "honeymoon"],
        food: ["Darjeeling First Flush Tea", "Steamed Tibetan Momos", "Thukpa", "Churpee"],
        shopping: ["Mall Road (Chowrasta)", "Certified Darjeeling Tea Shops", "Tibetan Woolens"],
        weather: {
          summer: { minTemperature: 11, maxTemperature: 19, description: "Pleasantly cool" },
          monsoon: { minTemperature: 13, maxTemperature: 18, description: "Misty with heavy rains" },
          winter: { minTemperature: 2, maxTemperature: 10, description: "Chilly with clear Kanchenjunga mountain views" },
        },
        faqs: [
          {
            question: "When is the best time to see the sunrise at Tiger Hill?",
            answer: "Early morning around 4:30 AM to 5:00 AM on clear autumn and spring days.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.9, count: 290 },
        seo: {
          title: "Darjeeling Tour Packages - Toy Train & Kanchenjunga Views",
          description: "Book Darjeeling holidays: Tiger Hill sunrise, UNESCO toy train, and premier tea tasting estates.",
          keywords: ["darjeeling tour", "tiger hill sunrise", "darjeeling toy train", "darjeeling tea"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 2,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 12. GUJARAT (West)
  // ---------------------------------------------------------------------------
  {
    name: "Gujarat",
    slug: "gujarat",
    code: "GJ",
    region: "west",
    capital: "Gandhinagar",
    shortDescription: "White Rann of Kutch, Asiatic Lions at Gir, and UNESCO World Heritage City Ahmedabad.",
    overview:
      "Gujarat is India's westernmost state, bounded by the Arabian Sea. It encompasses diverse terrains from the White Salt Desert of Kutch to the dry deciduous forests of Gir National Park, the only home of the Asiatic lion in the world.",
    bestTimeToVisit: "October to March",
    popularFor: ["White Desert Rann Utsav", "Gir Asiatic Lions", "Statue of Unity", "Ahmedabad Heritage"],
    travelThemes: ["desert", "wildlife", "heritage", "textiles"],
    seasons: {
      summer: { months: ["March", "April", "May"], description: "Dry and hot" },
      monsoon: { months: ["June", "July", "August", "September"], description: "Moderate rainfall" },
      winter: { months: ["October", "November", "December", "January", "February"], description: "Pleasant days, ideal for Rann of Kutch full moon festival" },
    },
    rating: { average: 4.8, count: 310 },
    seo: {
      title: "Gujarat Tour Packages - Rann of Kutch & Gir Lions",
      description: "Explore Gujarat: White Rann desert festival, Gir forest lion safaris, and Statue of Unity.",
      keywords: ["gujarat tour packages", "rann of kutch", "gir national park", "statue of unity"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/gujarat",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: false,
    sortOrder: 12,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "Ahmedabad",
        slug: "ahmedabad",
        region: "west",
        tagline: "India's First UNESCO World Heritage City",
        shortDescription: "Sabarmati Ashram of Mahatma Gandhi, intricate stepwells, and street food.",
        overview:
          "Ahmedabad is the largest city in Gujarat. Founded in 1411 by Sultan Ahmed Shah, its historic walled city was declared India's first UNESCO World Heritage City. It is also famous as Mahatma Gandhi's headquarters during India's freedom struggle.",
        bestTimeToVisit: "October to March",
        popularDuration: { minDays: 2, maxDays: 3 },
        howToReach: {
          airport: "Sardar Vallabhbhai Patel International Airport (AMD)",
          railway: "Ahmedabad Junction (Kalupur - ADI)",
          road: "Connected by national expressways from Mumbai, Udaipur, and Delhi",
          description: "Major air hub with non-stop flights to London, Dubai, Singapore, and across India.",
        },
        coordinates: { latitude: 23.0225, longitude: 72.5714 },
        address: "Ahmedabad, Gujarat, India",
        cityType: ["heritage", "commercial", "cultural"],
        popularFor: ["Sabarmati Ashram", "Adalaj Stepwell", "Sidi Saiyyed Mosque", "Manek Chowk Night Market"],
        travelThemes: ["heritage", "history", "textiles", "street food"],
        food: ["Gujarati Thali", "Dhokla", "Khandvi", "Fafda Jalebi", "Dabeli"],
        shopping: ["Law Garden Night Market (Chaniya Cholis)", "Lal Darwaja", "Sindhi Market"],
        weather: {
          summer: { minTemperature: 27, maxTemperature: 43, description: "Hot and dry" },
          monsoon: { minTemperature: 25, maxTemperature: 34, description: "Moderate rains" },
          winter: { minTemperature: 12, maxTemperature: 29, description: "Sunny and delightful" },
        },
        faqs: [
          {
            question: "What is Manek Chowk famous for?",
            answer: "In the morning it is a vegetable market, in the afternoon a jewelry market, and at night a vibrant street food haven.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.8, count: 230 },
        seo: {
          title: "Ahmedabad Heritage City Guide - Sabarmati & Stepwells",
          description: "Discover Ahmedabad: Sabarmati Gandhi Ashram, Adalaj stepwell carvings, and authentic Gujarati cuisine.",
          keywords: ["ahmedabad tour", "sabarmati ashram", "adalaj stepwell", "unesco heritage ahmedabad"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: false,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 13. MADHYA PRADESH (Central)
  // ---------------------------------------------------------------------------
  {
    name: "Madhya Pradesh",
    slug: "madhya-pradesh",
    code: "MP",
    region: "central",
    capital: "Bhopal",
    shortDescription: "The Heart of India - Tiger Sanctuaries, Khajuraho Temples, and Fortresses.",
    overview:
      "Madhya Pradesh, a large state in central India, retains landmarks from eras throughout Indian history. Begun in the 10th century, its Hindu and Jain temples at Khajuraho are renowned for their carvings. The state is also home to India's finest national parks like Bandhavgarh and Kanha.",
    bestTimeToVisit: "October to March",
    popularFor: ["Khajuraho UNESCO Temples", "Bandhavgarh & Kanha Tiger Safaris", "Gwalior Fort", "Ujjain Mahakaleshwar"],
    travelThemes: ["heritage", "wildlife", "tigers", "temples"],
    seasons: {
      summer: { months: ["April", "May", "June"], description: "Hot, but best time for spotting wild tigers around waterholes" },
      monsoon: { months: ["July", "August", "September"], description: "Lush green forests, parks closed for breeding" },
      winter: { months: ["October", "November", "December", "January", "February", "March"], description: "Pleasant sunshine and cool safari mornings" },
    },
    rating: { average: 4.8, count: 320 },
    seo: {
      title: "Madhya Pradesh Tourism - Khajuraho & Tiger Safaris",
      description: "Experience the heart of India: Khajuraho temple sculptures, Bandhavgarh tiger safaris, and historic Gwalior.",
      keywords: ["madhya pradesh tourism", "khajuraho tour", "bandhavgarh tiger safari", "kanha national park"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/madhya-pradesh",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: false,
    sortOrder: 13,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "Khajuraho",
        slug: "khajuraho",
        region: "central",
        tagline: "UNESCO Masterpiece of Temple Architecture",
        shortDescription: "Stunning 10th-century medieval sandstone temples and intricate sculptures.",
        overview:
          "The Khajuraho Group of Monuments is a group of Hindu and Jain temples in Chhatarpur district, Madhya Pradesh. They are a UNESCO World Heritage Site famous for their nagara-style architectural symbolism and intricate sculptures.",
        bestTimeToVisit: "October to March",
        popularDuration: { minDays: 1, maxDays: 2 },
        howToReach: {
          airport: "Khajuraho Airport (HJR)",
          railway: "Khajuraho Railway Station (KURJ)",
          road: "Connected by highway from Jhansi (175 km) and Orchha",
          description: "Direct air links and express trains from Delhi and Agra.",
        },
        coordinates: { latitude: 24.8318, longitude: 79.9199 },
        address: "Khajuraho, Madhya Pradesh, India",
        cityType: ["heritage", "unesco", "sculptures"],
        popularFor: ["Kandariya Mahadeva Temple", "Western Group of Temples", "Light and Sound Show", "Khajuraho Dance Festival"],
        travelThemes: ["heritage", "architecture", "art", "photography"],
        food: ["Bundelkhandi Thali", "Poha Jalebi", "Mawa Baati", "Kaju Barfi"],
        shopping: ["Sandstone Replicas", "Brassware", "Tribal Handicrafts"],
        weather: {
          summer: { minTemperature: 28, maxTemperature: 44, description: "Hot" },
          monsoon: { minTemperature: 24, maxTemperature: 33, description: "Lush temple lawns" },
          winter: { minTemperature: 7, maxTemperature: 24, description: "Cool and crisp" },
        },
        faqs: [
          {
            question: "When is the annual Khajuraho Dance Festival celebrated?",
            answer: "Every year in February against the floodlit backdrop of the magnificent Western Group of Temples.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.9, count: 210 },
        seo: {
          title: "Khajuraho Temple Tour Packages & UNESCO Heritage",
          description: "Discover Khajuraho: Kandariya Mahadeva temple, Western group light show, and historic Bundelkhand.",
          keywords: ["khajuraho tour", "khajuraho temples", "kandariya mahadeva", "unesco khajuraho"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: false,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 14. LADAKH (North)
  // ---------------------------------------------------------------------------
  {
    name: "Ladakh",
    slug: "ladakh",
    code: "LA",
    region: "north",
    capital: "Leh",
    shortDescription: "The Land of High Passes, Blue Pangong Lake, and Buddhist Monasteries.",
    overview:
      "Ladakh is a region administered by India as a union territory, situated in the Karakoram and Great Himalaya ranges. It is renowned for remote mountain beauty, stark moonscapes, high-altitude passes like Khardung La, and Tibetan Buddhist culture.",
    bestTimeToVisit: "May to September",
    popularFor: ["Pangong Tso Lake", "Nubra Valley & Double-Humped Camels", "Khardung La Pass", "Thiksey Monastery"],
    travelThemes: ["himalayas", "high altitude", "adventure", "monasteries"],
    seasons: {
      summer: { months: ["May", "June", "July", "August", "September"], description: "Pleasant days, passes open, peak travel window" },
      monsoon: { months: ["July", "August"], description: "Rain shadow area, sunny and dry while rest of India rains" },
      winter: { months: ["October", "November", "December", "January", "February", "March", "April"], description: "Freezing sub-zero temperatures, Chadar frozen river trek" },
    },
    rating: { average: 4.9, count: 380 },
    seo: {
      title: "Ladakh Tour Packages - Pangong Lake & Nubra Valley",
      description: "Experience high-altitude adventure in Ladakh: Leh Palace, Pangong Tso, Nubra valley sand dunes, and Khardung La.",
      keywords: ["ladakh tour packages", "pangong lake", "nubra valley", "leh ladakh holiday"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/ladakh",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: true,
    sortOrder: 14,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "Leh",
        slug: "leh",
        region: "north",
        tagline: "The Crown of the Trans-Himalayas",
        shortDescription: "High-altitude capital with Leh Palace, Shanti Stupa, and ancient gompas.",
        overview:
          "Leh is the joint capital and largest city of Ladakh. Located at an altitude of 3,524 m (11,562 ft), it is framed by the dramatic barren peaks of the Himalayas, offering a blend of Buddhist culture and mountain trekking.",
        bestTimeToVisit: "May to September",
        popularDuration: { minDays: 4, maxDays: 7 },
        howToReach: {
          airport: "Kushok Bakula Rimpochee Airport (IXL) - one of the highest commercial airports in the world",
          railway: "Nearest railhead is Jammu Tawi (700 km) or Chandigarh",
          road: "Manali-Leh Highway and Srinagar-Leh Highway (open May-October)",
          description: "Direct morning flights from Delhi, Mumbai, and Srinagar.",
        },
        coordinates: { latitude: 34.1526, longitude: 77.5771 },
        address: "Leh, Ladakh, India",
        cityType: ["high altitude", "himalayas", "buddhist"],
        popularFor: ["Leh Palace", "Shanti Stupa", "Thiksey Monastery", "Hall of Fame", "Magnetic Hill"],
        travelThemes: ["himalayas", "buddhism", "photography", "adventure"],
        food: ["Ladakhi Thukpa", "Tingmo", "Butter Tea (Gur Gur Chai)", "Skyu", "Momos"],
        shopping: ["Leh Main Bazaar", "Pashmina Shawls", "Tibetan Silver Jewelry", "Apricot Jams"],
        weather: {
          summer: { minTemperature: 8, maxTemperature: 25, description: "Warm sunshine, cool breeze" },
          monsoon: { minTemperature: 9, maxTemperature: 24, description: "Dry and sunny" },
          winter: { minTemperature: -15, maxTemperature: 2, description: "Sub-zero cold, snow on passes" },
        },
        faqs: [
          {
            question: "Is acclimatization necessary upon landing in Leh?",
            answer: "Yes, travelers must rest completely for the first 24-48 hours to acclimatize to high altitude.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.9, count: 310 },
        seo: {
          title: "Leh Ladakh Travel Guide & Acclimatization Tips",
          description: "Plan your trip to Leh: Shanti Stupa, Leh Palace, Pangong Tso excursions, and high-altitude health tips.",
          keywords: ["leh tour", "leh ladakh travel guide", "shanti stupa leh", "thiksey monastery"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 15. JAMMU & KASHMIR (North)
  // ---------------------------------------------------------------------------
  {
    name: "Jammu and Kashmir",
    slug: "jammu-and-kashmir",
    code: "JK",
    region: "north",
    capital: "Srinagar",
    shortDescription: "Paradise on Earth - Dal Lake Shikaras, Gulmarg Gondola, and Snow Valleys.",
    overview:
      "Jammu and Kashmir is a region administered by India as a union territory, situated in the northern part of the Indian subcontinent in the Himalayas. World-renowned for its houseboats on Dal Lake, snow-capped mountains, saffron fields, and alpine meadows.",
    bestTimeToVisit: "March to October (Summer & Spring) / December to February (Snow & Skiing)",
    popularFor: ["Dal Lake Shikara Ride", "Gulmarg Skiing & Gondola", "Pahalgam Betaab Valley", "Mughal Gardens"],
    travelThemes: ["himalayas", "honeymoon", "nature", "snow", "adventure"],
    seasons: {
      summer: { months: ["April", "May", "June", "July"], description: "Blooms, pleasant 20-25°C, Shikara rides" },
      monsoon: { months: ["August", "September"], description: "Fruit orchards and crisp autumn golden chinar leaves" },
      winter: { months: ["December", "January", "February"], description: "Heavy snowfall, frozen lakes, skiing in Gulmarg" },
    },
    rating: { average: 4.9, count: 480 },
    seo: {
      title: "Jammu & Kashmir Tour Packages - Srinagar & Gulmarg Holidays",
      description: "Book unforgettable Kashmir packages: Dal Lake houseboats, Gulmarg Gondola rides, and Pahalgam valleys.",
      keywords: ["kashmir tour packages", "srinagar dal lake", "gulmarg gondola", "pahalgam tour"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/jammu-and-kashmir",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: true,
    sortOrder: 15,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "Srinagar",
        slug: "srinagar",
        region: "north",
        tagline: "The Summer Capital & Jewel of Kashmir",
        shortDescription: "Stay on wooden carved houseboats and cruise Dal Lake on painted shikaras.",
        overview:
          "Srinagar is the largest city and the summer capital of Jammu and Kashmir. Situated in the Kashmir Valley on the banks of the Jhelum River, it is famed for its houseboats, Mughal gardens, floating flower and vegetable markets, and traditional dried fruit stores.",
        bestTimeToVisit: "March to October",
        popularDuration: { minDays: 3, maxDays: 4 },
        howToReach: {
          airport: "Sheikh ul-Alam International Airport Srinagar (SXR)",
          railway: "Connected to Udhampur and Jammu Tawi, Banihal-Baramulla rail line",
          road: "NH44 through the Chenani-Nashri and Banihal Qazigund Tunnels",
          description: "Daily direct flights from Delhi, Mumbai, Bengaluru, and Chandigarh.",
        },
        coordinates: { latitude: 34.0837, longitude: 74.7973 },
        address: "Srinagar, Jammu and Kashmir, India",
        cityType: ["lake", "himalayas", "heritage"],
        popularFor: ["Dal Lake Houseboats", "Shikara Sunset Rides", "Nishat & Shalimar Mughal Gardens", "Hazratbal Shrine"],
        travelThemes: ["honeymoon", "nature", "romance", "culture"],
        food: ["Kashmiri Wazwan (Rogan Josh, Gushtaba)", "Kahwa Green Tea", "Modur Pulao", "Nadru Yakhni"],
        shopping: ["Lal Chowk", "Pashmina Shawls & Carpets", "Walnut Wood Carvings", "Saffron & Walnuts"],
        weather: {
          summer: { minTemperature: 14, maxTemperature: 29, description: "Pleasant sunshine" },
          monsoon: { minTemperature: 15, maxTemperature: 26, description: "Occasional showers and golden orchards" },
          winter: { minTemperature: -4, maxTemperature: 8, description: "Snowy cold and cozy wood-burning Bukhari stoves" },
        },
        faqs: [
          {
            question: "Is it safe to stay on a Dal Lake houseboat?",
            answer: "Yes, traditional cedar-wood houseboats offer 24/7 hospitality, attached heated bathrooms, and dedicated shikara transfers.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.9, count: 390 },
        seo: {
          title: "Srinagar Travel Guide - Dal Lake Houseboats & Mughal Gardens",
          description: "Experience Srinagar: Dal Lake Shikara cruises, Nishat Bagh gardens, and authentic Kashmiri Wazwan feasts.",
          keywords: ["srinagar tour", "dal lake houseboats", "shikara ride", "kashmir wazwan"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
      {
        name: "Gulmarg",
        slug: "gulmarg",
        region: "north",
        tagline: "The Meadow of Flowers & World Ski Resort",
        shortDescription: "World's highest cable car Gulmarg Gondola and premier ski slopes.",
        overview:
          "Gulmarg is a town, hill station and popular skiing destination in the Baramulla district of Jammu and Kashmir. Situated at an altitude of 2,650 m in the Pir Panjal range, it hosts the world-renowned Gulmarg Gondola rising to 3,950 m on Apharwat Peak.",
        bestTimeToVisit: "November to March (Skiing) / May to September (Green Meadows)",
        popularDuration: { minDays: 2, maxDays: 3 },
        howToReach: {
          airport: "Srinagar International Airport (55 km)",
          railway: "Jammu Tawi (330 km)",
          road: "Scenic mountain highway from Srinagar (1.5 hours drive)",
          description: "Chauffeur transfer from Srinagar with snow chains in winter.",
        },
        coordinates: { latitude: 34.0484, longitude: 74.3805 },
        address: "Gulmarg, Jammu and Kashmir, India",
        cityType: ["ski resort", "meadow", "snow"],
        popularFor: ["Gulmarg Gondola Phase 1 & 2", "Apharwat Peak Snow", "Skiing & Snowboarding", "Strawberry Valley"],
        travelThemes: ["snow", "adventure", "skiing", "honeymoon"],
        food: ["Hot Kashmiri Kahwa", "Mutton Rogan Josh", "Steamed Dumplings"],
        shopping: ["Woolen Pashminas", "Snow Sports Souvenirs"],
        weather: {
          summer: { minTemperature: 10, maxTemperature: 22, description: "Green meadow breeze" },
          monsoon: { minTemperature: 11, maxTemperature: 18, description: "Wildflowers bloom" },
          winter: { minTemperature: -10, maxTemperature: 2, description: "Deep powder snow for skiing" },
        },
        faqs: [
          {
            question: "Should Gulmarg Gondola tickets be booked in advance?",
            answer: "Yes, Gondola Phase 1 and Phase 2 tickets should always be reserved online in advance due to high demand.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.9, count: 320 },
        seo: {
          title: "Gulmarg Gondola & Ski Holiday Packages",
          description: "Book Gulmarg winter wonderland tours: Gondola rides to Apharwat peak, skiing lessons, and luxury pine resorts.",
          keywords: ["gulmarg gondola", "gulmarg skiing", "kashmir snow tour", "apharwat peak"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 2,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 16. PUNJAB (North)
  // ---------------------------------------------------------------------------
  {
    name: "Punjab",
    slug: "punjab",
    code: "PB",
    region: "north",
    capital: "Chandigarh",
    shortDescription: "The Golden Temple of Amritsar, Patriotic Wagah Border, and Rich Hospitality.",
    overview:
      "Punjab, a state bordering Pakistan, is the heart of India's Sikh community. The city of Amritsar is home to the holiest Gurdwara, Harmandir Sahib (the Golden Temple), which serves over 100,000 free meals daily at its community kitchen (Langar).",
    bestTimeToVisit: "October to March",
    popularFor: ["Golden Temple", "Wagah Border Ceremony", "Jallianwala Bagh", "Punjabi Dhaba Food"],
    travelThemes: ["spiritual", "patriotism", "culinary", "heritage"],
    seasons: {
      summer: { months: ["April", "May", "June"], description: "Warm summer days" },
      monsoon: { months: ["July", "August", "September"], description: "Lush mustard and wheat fields" },
      winter: { months: ["October", "November", "December", "January", "February", "March"], description: "Crisp winter, Sarson ka Saag & Makki ki Roti season" },
    },
    rating: { average: 4.9, count: 370 },
    seo: {
      title: "Punjab Tourism - Amritsar Golden Temple & Wagah Border",
      description: "Discover Punjab: Amritsar Golden Temple blessings, Wagah border parade, and authentic Punjabi cuisine.",
      keywords: ["punjab tourism", "amritsar tour", "golden temple amritsar", "wagah border tour"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/punjab",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: false,
    sortOrder: 16,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "Amritsar",
        slug: "amritsar",
        region: "north",
        tagline: "Home of the Golden Temple & Spiritual Light",
        shortDescription: "The gilded Harmandir Sahib, Langar kitchen, and Wagah Border sunset parade.",
        overview:
          "Amritsar is the spiritual and cultural center of the Sikh religion. The Golden Temple, plated with genuine gold leaf and surrounded by the holy Amrit Sarovar lake, welcomes people of all faiths with unconditional love and free meals.",
        bestTimeToVisit: "October to March",
        popularDuration: { minDays: 2, maxDays: 3 },
        howToReach: {
          airport: "Sri Guru Ram Dass Jee International Airport (ATQ)",
          railway: "Amritsar Junction (ASR) with direct Shatabdi and Vande Bharat trains",
          road: "Grand Trunk Road (NH44) and expressways from Delhi",
          description: "Excellent international air links to UK, Dubai, and Singapore.",
        },
        coordinates: { latitude: 31.62, longitude: 74.8765 },
        address: "Amritsar, Punjab, India",
        cityType: ["spiritual", "patriotic", "culinary"],
        popularFor: ["Golden Temple (Harmandir Sahib)", "Wagah Border Flag Lowering Ceremony", "Jallianwala Bagh", "Partition Museum"],
        travelThemes: ["spiritual", "patriotism", "culinary", "heritage"],
        food: ["Amritsari Kulcha with Chole", "Creamy Lassi", "Maa ki Dal", "Sarson ka Saag & Makki ki Roti", "Amritsari Fish"],
        shopping: ["Hall Bazaar", "Phulkari Embroidery Dupattas", "Traditional Punjabi Juttis"],
        weather: {
          summer: { minTemperature: 26, maxTemperature: 42, description: "Warm plains weather" },
          monsoon: { minTemperature: 24, maxTemperature: 33, description: "Green fields and humidity" },
          winter: { minTemperature: 4, maxTemperature: 20, description: "Chilly mornings and pleasant sunshine" },
        },
        faqs: [
          {
            question: "Is the Golden Temple open 24 hours?",
            answer: "Yes, the Golden Temple is open day and night for visitors and devotees.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.9, count: 350 },
        seo: {
          title: "Amritsar Tour Packages - Golden Temple & Wagah Border Guide",
          description: "Plan your Amritsar trip: Golden Temple darshan, Jallianwala Bagh history, Wagah border ceremony, and food walks.",
          keywords: ["amritsar tour", "golden temple", "amritsari kulcha", "wagah border"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 17. TELANGANA (South)
  // ---------------------------------------------------------------------------
  {
    name: "Telangana",
    slug: "telangana",
    code: "TS",
    region: "south",
    capital: "Hyderabad",
    shortDescription: "City of Pearls, Nizam Royal Heritage, and World-Famous Hyderabadi Dum Biryani.",
    overview:
      "Telangana in south-central India features the iconic Charminar in Hyderabad, Golconda Fort with its acoustics, and Ramoji Film City. Celebrated for its Nizami royalty, IT revolution, and culinary excellence.",
    bestTimeToVisit: "October to March",
    popularFor: ["Charminar", "Golconda Fort", "Hyderabadi Dum Biryani", "Ramoji Film City"],
    travelThemes: ["heritage", "culinary", "technology", "royalty"],
    seasons: {
      summer: { months: ["March", "April", "May"], description: "Warm conditions" },
      monsoon: { months: ["June", "July", "August", "September"], description: "Lush city parks and pleasant breezes" },
      winter: { months: ["October", "November", "December", "January", "February"], description: "Cool and comfortable sightseeing" },
    },
    rating: { average: 4.8, count: 290 },
    seo: {
      title: "Telangana Tourism - Hyderabad Charminar & Golconda Fort",
      description: "Explore Hyderabad: Charminar, Golconda Fort sound and light show, and royal Nizami food trails.",
      keywords: ["telangana tourism", "hyderabad tour", "charminar hyderabad", "hyderabadi biryani"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/telangana",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: false,
    sortOrder: 17,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "Hyderabad",
        slug: "hyderabad",
        region: "south",
        tagline: "The City of Pearls & Royal Nizams",
        shortDescription: "16th-century Charminar, Golconda Fort, and world-famous Dum Biryani.",
        overview:
          "Hyderabad is the capital of southern India's Telangana state. A major center for the technology industry, it's also home to historic sites including Golconda Fort, a former diamond-trading center that was the Qutb Shahi dynastic capital.",
        bestTimeToVisit: "October to March",
        popularDuration: { minDays: 2, maxDays: 3 },
        howToReach: {
          airport: "Rajiv Gandhi International Airport (HYD)",
          railway: "Secunderabad Junction (SC) & Hyderabad Deccan (HYB)",
          road: "Outer Ring Road and national expressways",
          description: "Top-rated international airport connected worldwide.",
        },
        coordinates: { latitude: 17.385, longitude: 78.4867 },
        address: "Hyderabad, Telangana, India",
        cityType: ["metropolitan", "royal", "culinary"],
        popularFor: ["Charminar", "Golconda Fort", "Ramoji Film City", "Chowmahalla Palace", "Hussain Sagar Lake"],
        travelThemes: ["heritage", "culinary", "shopping", "royalty"],
        food: ["Hyderabadi Dum Biryani", "Haleem", "Mirchi ka Salan", "Double ka Meetha", "Irani Chai with Osmania Biscuits"],
        shopping: ["Laad Bazaar (Bangles)", "Moazzam Jahi Market", "Natural Pearl Jewelry Centers"],
        weather: {
          summer: { minTemperature: 25, maxTemperature: 41, description: "Warm summer" },
          monsoon: { minTemperature: 22, maxTemperature: 31, description: "Cool showers" },
          winter: { minTemperature: 14, maxTemperature: 29, description: "Pleasant and breezy" },
        },
        faqs: [
          {
            question: "What is special about the acoustic engineering of Golconda Fort?",
            answer: "A hand clap at the entrance gate can be heard clearly at the Bala Hissar pavilion a kilometer away at the top.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.8, count: 260 },
        seo: {
          title: "Hyderabad Tour Packages - Charminar & Dum Biryani Trails",
          description: "Discover Hyderabad: Golconda fort, Charminar, Chowmahalla Palace, and authentic Hyderabadi Dum Biryani dining.",
          keywords: ["hyderabad tour", "charminar", "golconda fort", "hyderabad biryani"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: false,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 18. SIKKIM (North-East)
  // ---------------------------------------------------------------------------
  {
    name: "Sikkim",
    slug: "sikkim",
    code: "SK",
    region: "north-east",
    capital: "Gangtok",
    shortDescription: "India's 100% Organic State - Mt. Kanchenjunga, Sacred Tsomgo Lake, and Monasteries.",
    overview:
      "Sikkim is a state in northeast India, bordered by Bhutan, Tibet and Nepal. Part of the Himalayas, the area has a dramatic landscape that includes India’s highest mountain, 8,586m Kangchenjunga. Sikkim is also home to glaciers, alpine meadows and thousands of varieties of wildflowers.",
    bestTimeToVisit: "March to May & October to mid-December",
    popularFor: ["Mt. Kanchenjunga Views", "Tsomgo Lake & Nathula Pass", "Rumtek Monastery", "Organic Himalayan Tea"],
    travelThemes: ["himalayas", "buddhism", "nature", "organic", "adventure"],
    seasons: {
      summer: { months: ["April", "May", "June"], description: "Rhododendrons in full bloom, pleasant cool weather" },
      monsoon: { months: ["July", "August", "September"], description: "Heavy rains and cloud-covered peaks" },
      winter: { months: ["October", "November", "December", "January", "February", "March"], description: "Clear blue skies, snow at high altitudes" },
    },
    rating: { average: 4.9, count: 320 },
    seo: {
      title: "Sikkim Tour Packages - Gangtok, Tsomgo Lake & Kanchenjunga",
      description: "Book Sikkim holiday packages: Gangtok monastery tours, high-altitude Tsomgo Lake, and Himalayan vistas.",
      keywords: ["sikkim tour packages", "gangtok holiday", "tsomgo lake", "kanchenjunga view"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/sikkim",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: true,
    sortOrder: 18,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "Gangtok",
        slug: "gangtok",
        region: "north-east",
        tagline: "The Clean Himalayan Mountain Capital",
        shortDescription: "MG Marg promenade, Rumtek Monastery, and gateway to Nathula Pass.",
        overview:
          "Gangtok is the capital of the mountainous northern Indian state of Sikkim. Established as a Buddhist pilgrimage site in the 1840s, the city today is known for its pristine cleanliness, scenic cable cars, and views of Mt. Kanchenjunga.",
        bestTimeToVisit: "March to May & October to December",
        popularDuration: { minDays: 2, maxDays: 4 },
        howToReach: {
          airport: "Pakyong Airport (PYG, 30 km) or Bagdogra Airport (IXB, 125 km)",
          railway: "New Jalpaiguri Junction (NJP, 120 km)",
          road: "NH10 highway along the Teesta River",
          description: "Around 4 hours drive along the picturesque Teesta River from Bagdogra/NJP.",
        },
        coordinates: { latitude: 27.3389, longitude: 88.6065 },
        address: "Gangtok, Sikkim, India",
        cityType: ["hill station", "himalayas", "buddhist"],
        popularFor: ["MG Marg Promenade", "Tsomgo Glacial Lake", "Nathula Indo-China Border Pass", "Rumtek Monastery"],
        travelThemes: ["himalayas", "buddhism", "nature", "shopping"],
        food: ["Sikkimese Momos", "Thukpa", "Gundruk Soup", "Chhurpi Cheese", "Bamboo Shoot Curry"],
        shopping: ["MG Marg", "Lal Bazaar (Organic Spices & Teas)", "Tibetan Handicraft Centers"],
        weather: {
          summer: { minTemperature: 13, maxTemperature: 22, description: "Pleasantly mild" },
          monsoon: { minTemperature: 14, maxTemperature: 20, description: "Rainy and misty" },
          winter: { minTemperature: 4, maxTemperature: 14, description: "Crisp and clear" },
        },
        faqs: [
          {
            question: "Is a special permit required for Tsomgo Lake and Nathula Pass?",
            answer: "Yes, Protected Area Permits (PAP) are arranged for registered visitors through authorized tour operators.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.9, count: 280 },
        seo: {
          title: "Gangtok City Travel Guide - MG Marg & Tsomgo Lake",
          description: "Plan your Gangtok holiday: MG Marg walking street, Rumtek Monastery, and scenic cable car rides.",
          keywords: ["gangtok tour", "mg marg gangtok", "tsomgo lake permit", "sikkim holiday guide"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 19. MEGHALAYA (North-East)
  // ---------------------------------------------------------------------------
  {
    name: "Meghalaya",
    slug: "meghalaya",
    code: "ML",
    region: "north-east",
    capital: "Shillong",
    shortDescription: "Abode of Clouds - Living Root Bridges, Crystal Clear Dawki River, and Waterfalls.",
    overview:
      "Meghalaya is a state in northeast India. The name means 'the abode of clouds' in Sanskrit. Known for its incredible biodiversity, living root bridges engineered by the Khasi tribe, Cherrapunji's world-record rainfall, and crystal transparent waters at Dawki.",
    bestTimeToVisit: "September to May",
    popularFor: ["Living Root Bridges", "Dawki Transparent River Boating", "Cherrapunji Waterfalls", "Shillong Scotland of the East"],
    travelThemes: ["nature", "waterfalls", "adventure", "eco-tourism"],
    seasons: {
      summer: { months: ["March", "April", "May"], description: "Pleasant days, great for trekking and waterfalls" },
      monsoon: { months: ["June", "July", "August"], description: "Roaring waterfalls and clouds floating into rooms" },
      winter: { months: ["October", "November", "December", "January", "February"], description: "Crystal clear water at Dawki, sunny pleasant weather" },
    },
    rating: { average: 4.9, count: 310 },
    seo: {
      title: "Meghalaya Tour Packages - Shillong, Cherrapunji & Dawki",
      description: "Explore the Abode of Clouds: Double Decker Living Root Bridge, Nohkalikai Falls, and Dawki river boating.",
      keywords: ["meghalaya tour packages", "shillong tour", "cherrapunji waterfalls", "dawki river"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/meghalaya",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: false,
    sortOrder: 19,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "Shillong",
        slug: "shillong",
        region: "north-east",
        tagline: "The Scotland of the East & Rock Capital",
        shortDescription: "Pine hills, Umiam Lake, cascading waterfalls, and vibrant music culture.",
        overview:
          "Shillong is a hill station and the capital of Meghalaya. The British nicknamed it the 'Scotland of the East' because its rolling hills reminded them of Scottish landscapes. Known for its pleasant climate, waterfalls, and music culture.",
        bestTimeToVisit: "September to May",
        popularDuration: { minDays: 2, maxDays: 3 },
        howToReach: {
          airport: "Shillong Airport Umroi (SHL, 30 km) or Guwahati Airport (GAU, 120 km)",
          railway: "Guwahati Railway Station (100 km)",
          road: "Four-lane national highway from Guwahati through pine valleys",
          description: "Comfortable 3-hour scenic highway drive from Guwahati.",
        },
        coordinates: { latitude: 25.5788, longitude: 91.8933 },
        address: "Shillong, Meghalaya, India",
        cityType: ["hill station", "nature", "music"],
        popularFor: ["Umiam Lake", "Elephant Falls", "Shillong Peak", "Police Bazar", "Don Bosco Museum"],
        travelThemes: ["nature", "waterfalls", "music", "culture"],
        food: ["Jadoh (Khasi rice specialty)", "Dohneiiong", "Steamed Momos", "Tungrymbai"],
        shopping: ["Police Bazar", "Bara Bazar (Lewduh)", "Handmade Bamboo Crafts"],
        weather: {
          summer: { minTemperature: 15, maxTemperature: 24, description: "Pleasant and cool" },
          monsoon: { minTemperature: 16, maxTemperature: 21, description: "Frequent rain and dramatic mist" },
          winter: { minTemperature: 5, maxTemperature: 16, description: "Chilly and sunny" },
        },
        faqs: [
          {
            question: "Can travelers boat on Umiam Lake near Shillong?",
            answer: "Yes, Umiam Lake (Barapani) offers speedboat rides, kayaking, and serene water cruise options.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.8, count: 240 },
        seo: {
          title: "Shillong Tour Packages - Scotland of the East Guide",
          description: "Discover Shillong: Umiam lake boating, Elephant falls, Police Bazar cafes, and living root bridge trips.",
          keywords: ["shillong tour", "umiam lake", "scotland of the east", "elephant falls shillong"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: false,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 20. ANDAMAN & NICOBAR ISLANDS (South)
  // ---------------------------------------------------------------------------
  {
    name: "Andaman and Nicobar Islands",
    slug: "andaman-and-nicobar-islands",
    code: "AN",
    region: "south",
    capital: "Port Blair",
    shortDescription: "Tropical Coral Islands, Radhanagar Beach, and Scuba Diving Paradise.",
    overview:
      "The Andaman and Nicobar Islands, a union territory of India comprising 572 islands, lie at the juncture of the Bay of Bengal and Andaman Sea. Known for palm-fringed, white-sand beaches, mangroves, tropical rainforests, and world-class scuba diving reefs.",
    bestTimeToVisit: "October to May",
    popularFor: ["Radhanagar Beach (Asia's Best)", "Scuba Diving & Snorkeling", "Cellular Jail National Memorial", "Coral Reef Cruises"],
    travelThemes: ["island", "beach", "scuba diving", "honeymoon", "coral reef"],
    seasons: {
      summer: { months: ["March", "April", "May"], description: "Calm turquoise waters, ideal for diving" },
      monsoon: { months: ["June", "July", "August", "September"], description: "Tropical monsoons and lush rainforests" },
      winter: { months: ["October", "November", "December", "January", "February"], description: "Pleasant sea breeze, perfect island hopping weather" },
    },
    rating: { average: 4.9, count: 360 },
    seo: {
      title: "Andaman Tour Packages - Havelock Island & Scuba Diving",
      description: "Book Andaman holiday packages: Radhanagar beach sunsets, Havelock scuba diving, and Cellular Jail light show.",
      keywords: ["andaman tour packages", "havelock island", "radhanagar beach", "scuba diving andaman"],
      canonicalUrl: "https://yourtravelwebsite.com/destinations/india/andaman-and-nicobar-islands",
      noIndex: false,
    },
    isPopular: true,
    isFeatured: true,
    sortOrder: 20,
    status: "published",
    publishedAt: new Date(),
    isActive: true,
    cities: [
      {
        name: "Havelock Island",
        slug: "havelock-island",
        region: "south",
        tagline: "Home of Asia's Best White Sand Beach",
        shortDescription: "World-famous Radhanagar Beach, vibrant coral gardens, and scuba diving.",
        overview:
          "Havelock Island (officially Swaraj Dweep) is part of Ritchie’s Archipelago in India's Andaman Islands. It’s known for its dive sites and beaches, like crescent-shaped Radhanagar Beach, renowned for dramatic sunset vistas.",
        bestTimeToVisit: "October to May",
        popularDuration: { minDays: 2, maxDays: 4 },
        howToReach: {
          airport: "Veer Savarkar International Airport Port Blair (IXZ)",
          railway: "No railway (Island territory)",
          road: "Air-conditioned luxury catamarans (Makruzz / Green Ocean) from Port Blair (90 mins)",
          description: "Scenic 90-minute catamaran cruise across blue waters from Port Blair.",
        },
        coordinates: { latitude: 11.9761, longitude: 92.9876 },
        address: "Havelock Island (Swaraj Dweep), Andaman and Nicobar Islands, India",
        cityType: ["island", "beach", "diving"],
        popularFor: ["Radhanagar Beach Sunset", "Elephant Beach Water Sports", "Scuba Diving in Coral Reefs", "Kalapathar Beach"],
        travelThemes: ["honeymoon", "diving", "beach", "luxury"],
        food: ["Fresh Grilled Lobster & Crab", "Coconut Prawn Curry", "Continental Beachfront Breakfasts"],
        shopping: ["Pearl Jewelry", "Handmade Shell Souvenirs"],
        weather: {
          summer: { minTemperature: 24, maxTemperature: 32, description: "Sunny and clear seas" },
          monsoon: { minTemperature: 23, maxTemperature: 30, description: "Tropical showers" },
          winter: { minTemperature: 21, maxTemperature: 30, description: "Gentle island breeze and turquoise waters" },
        },
        faqs: [
          {
            question: "Is prior swimming experience required for introductory scuba diving?",
            answer: "No, certified PADI instructors accompany beginner divers throughout tandem discovery dives.",
            sortOrder: 1,
          },
        ],
        rating: { average: 4.9, count: 320 },
        seo: {
          title: "Havelock Island Packages - Radhanagar Beach & Scuba",
          description: "Discover Havelock Island: Radhanagar beach sunsets, scuba diving at Elephant beach, and luxury beachfront resorts.",
          keywords: ["havelock island tour", "radhanagar beach", "andaman scuba diving", "swaraj dweep"],
          noIndex: false,
        },
        isPopular: true,
        isFeatured: true,
        sortOrder: 1,
        status: "published",
        publishedAt: new Date(),
        isActive: true,
      },
    ],
  },
];

// =============================================================================
// 3. SEED RUNNER SCRIPT
// =============================================================================
export async function seedIndiaDestinationData(closeConnectionOnFinish = true) {
  try {
    console.log("============================================================");
    console.log("Starting Comprehensive India Destination Data Seed...");
    console.log("============================================================");

    // 1. Connect DB if not connected
    if (mongoose.connection.readyState !== 1) {
      await dbConnection();
    }
    console.log("Database connected successfully.");

    // 2. Upsert Country: India
    const country = await Country.findOneAndUpdate(
      { code: indiaCountryData.code },
      { $set: indiaCountryData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`[SUCCESS] Country upserted: ${country.name} (Code: ${country.code}, ID: ${country._id})`);

    let totalStates = 0;
    let totalCities = 0;

    // 3. Loop over each State and its Cities
    for (const stateItem of statesData) {
      const { cities, ...stateFields } = stateItem;

      // Upsert State
      const stateDoc = await State.findOneAndUpdate(
        { code: stateFields.code },
        {
          $set: {
            ...stateFields,
            countryId: country._id,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      totalStates++;
      console.log(`  -> [STATE] ${stateDoc.name} (${stateDoc.code}) saved.`);

      // Upsert Cities for this State
      if (Array.isArray(cities) && cities.length > 0) {
        for (const cityItem of cities) {
          const cityDoc = await City.findOneAndUpdate(
            { slug: cityItem.slug },
            {
              $set: {
                ...cityItem,
                stateId: stateDoc._id,
                countryId: country._id,
                region: stateDoc.region, // Keep normalized with state region
              },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          totalCities++;
          console.log(`     * [CITY] ${cityDoc.name} (Slug: ${cityDoc.slug}) saved.`);
        }
      }
    }

    console.log("============================================================");
    console.log("SEEDING COMPLETED SUCCESSFULLY!");
    console.log(`Total Countries: 1 (${country.name})`);
    console.log(`Total States/UTs: ${totalStates}`);
    console.log(`Total Cities: ${totalCities}`);
    console.log("============================================================");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed with error:", error);
    if (mongoose.connection) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

seedIndiaDestinationData();
