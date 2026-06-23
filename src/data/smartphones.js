import { redirectDocument } from "react-router-dom";

export const smartphonesData = [
  {
    id: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    price: 139999,
    originalPrice: 159999,
    rating: 4.8,
    reviewsCount: 342,
    tag: "Flagship",
    description: "The ultimate iPhone experience. Built with aerospace-grade titanium, featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.",
    image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg",
    colors: [
      { name: "Natural Titanium", value: "#33330a" },
      { name: "Blue Titanium", value: "#2F4452" },
      { name: "White Titanium", value: "#F2F1ED" },
      { name: "Black Titanium", value: "#323335" }
    ],
    specs: {
      processor: "A17 Pro chip with 6-core GPU",
      display: "6.7\" Super Retina XDR OLED (120Hz)",
      camera: "48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto",
      battery: "4441 mAh (25W charging)",
      os: "iOS 17 (Upgradable)",
      storage: "256GB / 512GB / 1TB"
    },
    gradient: "from-slate-300 to-slate-500",
    isNewlyLaunched: true,
    reviews: [
      { author: "Rajesh K.", rating: 5, date: "2026-05-12", comment: "The titanium build feels incredibly premium in hand, noticeably lighter than the 14 Pro Max. The camera is outstanding, especially the 5x zoom." },
      { author: "Ananya S.", rating: 4, date: "2026-06-01", comment: "Battery life easily lasts a day and a half. The screen is gorgeous. Only downside is the slow charging speed compared to Android flagships." },
      { author: "Vikram M.", rating: 5, date: "2026-06-18", comment: "A17 Pro chip handles any game I throw at it. The action button is surprisingly useful." }
    ]
  },
  {
    id: "galaxy-s24-ultra",
    name: "Galaxy S24 Ultra",
    brand: "Samsung",
    price: 129999,
    originalPrice: 144999,
    rating: 4.9,
    reviewsCount: 418,
    tag: "Flagship",
    description: "Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility, starting with the most important device in your life.",
    image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra.jpg",
    colors: [
      { name: "Titanium Gray", value: "#8C8C88" },
      { name: "Titanium Yellow", value: "#EBE3CD" },
      { name: "Titanium Violet", value: "#473F57" },
      { name: "Titanium Black", value: "#2D2D2D" }
    ],
    specs: {
      processor: "Snapdragon 8 Gen 3 for Galaxy",
      display: "6.8\" Dynamic AMOLED 2X (120Hz, QHD+)",
      camera: "200MP Main + 50MP + 12MP + 10MP Quad Camera",
      battery: "5000 mAh (45W charging)",
      os: "Android 14 (One UI 6.1)",
      storage: "256GB / 512GB / 1TB"
    },
    gradient: "from-zinc-400 to-zinc-600",
    isNewlyLaunched: true,
    reviews: [
      { author: "Amit P.", rating: 5, date: "2026-04-30", comment: "The anti-reflective glass is a game changer! I can use it under direct sunlight without squinting. S-pen is very handy." },
      { author: "Sneha G.", rating: 5, date: "2026-05-22", comment: "Galaxy AI features like Live Translate and Circle to Search are so practical. 200MP camera details are insane." }
    ]
  },
  {
    id: "pixel-8-pro",
    name: "Pixel 8 Pro",
    brand: "Google",
    price: 99999,
    originalPrice: 109999,
    rating: 4.7,
    reviewsCount: 228,
    tag: "Camera",
    description: "The all-pro phone engineered by Google. It has the best of Google AI, the most advanced Pixel Camera ever, and can help you do more, even faster. Plus, it comes with 7 years of OS updates.",
    image: "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg",
    colors: [
      { name: "Bay Blue", value: "#8EB2D6" },
      { name: "Porcelain", value: "#EFEBE4" },
      { name: "Obsidian", value: "#2B2B2B" }
    ],
    specs: {
      processor: "Google Tensor G3 (Titan M2)",
      display: "6.7\" Super Actua Display (120Hz)",
      camera: "50MP Main + 48MP Ultra Wide + 48MP 5x Zoom",
      battery: "5050 mAh (30W charging)",
      os: "Android 14 (Pure Pixel)",
      storage: "128GB / 256GB / 512GB"
    },
    gradient: "from-sky-300 to-indigo-400",
    isNewlyLaunched: true,
    reviews: [
      { author: "Varun R.", rating: 4, date: "2026-05-10", comment: "Photo Unblur and Magic Eraser work like magic. The camera takes the most natural photos. It gets slightly warm under heavy load though." },
      { author: "Neha T.", rating: 5, date: "2026-06-11", comment: "Display is extremely bright and crisp. Pixel features like Call Screen make it the smartest phone I've ever owned." }
    ]
  },
  {
    id: "oneplus-12",
    name: "OnePlus 12",
    brand: "OnePlus",
    price: 64999,
    originalPrice: 69999,
    rating: 4.6,
    reviewsCount: 184,
    tag: "Value Flagship",
    description: "it defined as the flagship performance. The OnePlus 12 blends flagship hardware with state-of-the-art software optimization, delivering a fast and smooth experience with 100W SuperVOOC charging.",
    image: "https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg",
    colors:[
      { name: "Flowy Emerald", value: "#4F685D" },
      { name: "Silky Black", value: "#202021" },
    ],
    specs: {
      processor: "Snapdragon 8 Gen 3",
      display: "6.82\" 2K Oriental AMOLED (120Hz)",
      camera: "50MP Main (Sony LYT-808) + 48MP + 64.0MP 3x Zoom",
      battery: "5400 mAh (100W charging)",
      os: "Android 14 (OxygenOS)",
      storage: "256GB / 512GB"
    },
    gradient: "from-emerald-300 to-teal-600",
    reviews: [
      { author: "Kunal S.", rating: 5, date: "2026-04-18", comment: "100W charging is mind-blowing, takes about 26 minutes to charge fully! Emerald green color looks elegant." }
    ]
  },
  {
    id: "redmi-12-pro",
    name: "Redmi 12 Pro",
    brand: "Redmi",
    price: 19999,
    originalPrice: 24999,
    rating: 4.5,
    reviewsCount: 38,
    tag: "Flagship",
    description: "The ultimate flagship of technology. A curated pair of luxury flagships—one finished in Champagne Gold Titanium and the other in Blush Rose Gold. Housed in a handcrafted mahogany gift box with dual premium wireless chargers, custom initials engraving, and Lifetime Platinum Support.",
    image: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-12-pro.jpg",
    colors: [
      { name: "Champagne & Rose Gold Duo", value: "#E4C07C" }
    ],
    specs: {
      processor: "Snapdragon 8 Gen 3 / A17 Pro (Tailored)",
      display: "Dual 6.7\" Super AMOLED LTPO displays",
      camera: "Pro-Photography optimized 50MP Triple Systems",
      battery: "5000 mAh each (15W wireless chargers included)",
      os: "iOS / Android Dual Option",
      storage: "512GB Premium Storage each"
    },
    gradient: "from-amber-200 via-yellow-100 to-rose-200",
    reviews: [
      { author: "Aditya & Priya", rating: 5, date: "2026-06-02", comment: "The custom initials engraving on the back of the titanium body looks so refined. Perfect gift!" },
      { author: "Meera Sen", rating: 5, date: "2026-06-15", comment: "Gifted this to my daughter and son-in-law. The packaging and the premium care cards made them feel so special. Worth every rupee." }
    ]
  },
  {
    id: "vivo-x100-pro",
    name: "Vivo X100 Pro",
    brand: "AeroMobiles Exclusive",
    price: 119999,
    originalPrice: 129999,
    rating: 4.9,
    reviewsCount: 52,
    tag: "Flagship",
    description: "Designed for elegance.top AI features, paired with an elegant gold-plated aluminum bezel. Perfect for gamers and camera enthusiasts, complete with best theme UI pre-installed.",
    image: "https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg",
    colors: [
      { name: "Pearl White", value: "#F5F2EB" }
    ],
    specs: {
      processor: "A17 Pro Premium Octa-core",
      display: "6.7\" Fluid Pearl AMOLED (120Hz)",
      camera: "Studio Portrait 64MP Camera + 12MP Ultra-wide",
      battery: "4800 mAh (50W flash charging)",
      os: "OriginOS 15",
      storage: "256GB / 512GB"
    },
    gradient: "from-rose-100 via-amber-50 to-blue-100",
    reviews: [
      { author: "Karan J.", rating: 5, date: "2026-05-20", comment: "The pearl back cover is stunning. It changes colors from pink to soft blue depending on how the light hits it. The photography portrait mode takes studio quality photos." }
    ]
  },
  {
    id: "xiaomi-14-ultra",
    name: "Xiaomi 14 Ultra",
    brand: "Xiaomi",
    price: 99999,
    originalPrice: 119999,
    rating: 4.8,
    reviewsCount: 96,
    tag: "Camera",
    description: "Co-engineered with Leica. Reimagining mobile optics with a 1-inch sensor and variable aperture, delivering unparalleled details and color fidelity for photography enthusiasts.",
    image: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-ultra.jpg",
    colors: [
      { name: "Black (Vegan Leather)", value: "#1A1A1A" },
      { name: "White (Vegan Leather)", value: "#ECEAE6" }
    ],
    specs: {
      processor: "Snapdragon 8 Gen 3",
      display: "6.73\" WQHD+ AMOLED (120Hz, 3000 nits)",
      camera: "Leica 50MP Quad Camera (1-inch Main)",
      battery: "5000 mAh (90W HyperCharge)",
      os: "Android 14 (Xiaomi HyperOS)",
      storage: "512GB"
    },
    gradient: "from-gray-700 to-gray-900",
    reviews: [
      { author: "Deepak S.", rating: 5, date: "2026-05-05", comment: "If you care about mobile photography, this is the phone to get. The variable aperture is amazing." }
    ]
  },
  {
    id: "sony-xperia-1-vi",
    name: "Xperia 1 VI",
    brand: "Sony",
    price: 114999,
    originalPrice: 124999,
    rating: 4.5,
    reviewsCount: 74,
    tag: "Multimedia",
    description: "Designed for creators. Sony's flagship smartphone with an optical telephoto zoom lens, a beautiful 19.5:9 Bravia-tuned display, and pro-level audio ports and software.",
    image: "https://fdn2.gsmarena.com/vv/bigpic/sony-xperia-1-iv.jpg",
    colors: [
      { name: "Black", value: "#121212" },
      { name: "Khaki Green", value: "#434B3D" },
      { name: "Platinum Silver", value: "#D9D8D5" }
    ],
    specs: {
      processor: "Snapdragon 8 Gen 3",
      display: "6.5\" FHD+ HDR OLED (120Hz)",
      camera: "52MP Main (Exmor T) + 12MP Ultra-wide + 12MP Continuous Zoom",
      battery: "5000 mAh (30W PD)",
      os: "Android 14 (Near Stock)",
      storage: "256GB"
    },
    gradient: "from-stone-500 to-stone-700",
    reviews: [
      { author: "Rohan D.", rating: 4, date: "2026-05-27", comment: "Audio jack output is clean, perfect for audiophiles. Aspect ratio change is good. Sony camera app requires a learning curve but manual control is unmatched." }
    ]
  },
  {
    id: "iphone-15",
    name: "iPhone 15",
    brand: "Apple",
    price: 79999,
    originalPrice: 89999,
    rating: 4.7,
    reviewsCount: 521,
    tag: "Flagship",
    description: "All the power of our most advanced chip with an ultra-reliable battery. A new dual-camera system and a tough design. All in a thinner, lighter phone.",
    image: "https://images.unsplash.com/photo-1574802860898-d7ce96e75b95?w=500&h=600&fit=crop",
    colors: [
      { name: "Black", value: "#000000" },
      { name: "Blue", value: "#3B82F6" },
      { name: "Green", value: "#10B981" },
      { name: "Yellow", value: "#FBBF24" },
      { name: "Pink", value: "#EC4899" }
    ],
    specs: {
      processor: "A16 Bionic chip with 5-core GPU",
      display: "6.1\" Super Retina XDR OLED (60Hz)",
      camera: "48MP Main + 12MP Ultra Wide",
      battery: "3349 mAh (20W charging)",
      os: "iOS 17",
      storage: "128GB / 256GB / 512GB"
    },
    gradient: "from-blue-300 to-blue-500",
    reviews: [
      { author: "Priya M.", rating: 5, date: "2026-06-10", comment: "Perfect size and great colors to choose from. The A16 chip handles everything smoothly." },
      { author: "Ashish K.", rating: 4, date: "2026-06-12", comment: "Very good phone but battery could be better for heavy users." }
    ]
  },
  {
    id: "galaxy-s24",
    name: "Galaxy S24",
    brand: "Samsung",
    price: 79999,
    originalPrice: 89999,
    rating: 4.6,
    reviewsCount: 387,
    tag: "Flagship",
    description: "The Galaxy S24 brings flagship intelligence and performance to everyone. Galaxy AI works with you to create, produce and get things done faster.",
    image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra.jpg",
    colors: [
      { name: "Onyx", value: "#1A1A1A" },
      { name: "Marble Gray", value: "#9CA3AF" },
      { name: "Cobalt Violet", value: "#7C3AED" },
      { name: "Amber Yellow", value: "#FCD34D" }
    ],
    specs: {
      processor: "Snapdragon 8 Gen 3",
      display: "6.2\" Dynamic AMOLED 2X (120Hz, FHD+)",
      camera: "50MP Main + 12MP Ultra Wide + 10MP 3x Zoom",
      battery: "4000 mAh (25W charging)",
      os: "Android 14 (One UI 6)",
      storage: "256GB / 512GB"
    },
    gradient: "from-purple-400 to-indigo-600",
    reviews: [
      { author: "Sanjay P.", rating: 4, date: "2026-06-05", comment: "Compact size is great. Galaxy AI features are impressive and practical." }
    ]
  },
  {
    id: "motorola-edge-50-pro",
    name: "Motorola Edge 50 Pro",
    brand: "Motorola",
    price: 54999,
    originalPrice: 64999,
    rating: 4.5,
    reviewsCount: 156,
    tag: "Value Flagship",
    description: "Experience cutting-edge performance with a stunning 50MP camera and premium all-day battery life. Engineered to deliver flagship performance at an unbeatable price.",
    image: "https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg",
    colors: [
      { name: "Forest Green", value: "#2D5016" },
      { name: "Midnight Purple", value: "#2E1A47" }
    ],
    specs: {
      processor: "Snapdragon 8 Gen 3 Leading Version",
      display: "6.7\" AMOLED (120Hz, 1440p)",
      camera: "50MP Main (f/1.6) + 50MP Ultra-wide + 12MP 3x Tele",
      battery: "5000 mAh (125W charging)",
      os: "Android 14 (Near Stock)",
      storage: "256GB / 512GB"
    },
    gradient: "from-green-500 to-emerald-700",
    reviews: [
      { author: "Vikas R.", rating: 5, date: "2026-05-28", comment: "125W charging is insanely fast! Gets to 50% in just 10 minutes. Great camera and performance." }
    ]
  },
  {
    id: "nothing-phone-2a",
    name: "Nothing Phone 2a",
    brand: "Nothing",
    price: 34999,
    originalPrice: 39999,
    rating: 4.4,
    reviewsCount: 203,
    tag: "Value",
    description: "The next nothing. A distinctive design with Nothing OS 2.5, bringing clarity to Android. Fast charging, fast processor, and a design that makes a statement.",
    image: "https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2a-plus.jpg",
    colors: [
      { name: "Black", value: "#1F2937" },
      { name: "White", value: "#F3F4F6" }
    ],
    specs: {
      processor: "Snapdragon 7+ Gen 3",
      display: "6.7\" AMOLED (120Hz, 1440p)",
      camera: "50MP Main (f/1.9) + 50MP Ultra Wide",
      battery: "5000 mAh (45W charging)",
      os: "Android 14 (Nothing OS 2.5)",
      storage: "128GB / 256GB"
    },
    gradient: "from-gray-600 to-gray-800",
    reviews: [
      { author: "Roshan A.", rating: 5, date: "2026-06-01", comment: "The transparent back with Glyph interface is so unique! Nothing OS is clean and minimal." }
    ]
  },
  {
    id: "oppo-reno-12-pro",
    name: "OPPO Reno 12 Pro",
    brand: "OPPO",
    price: 44999,
    originalPrice: 54999,
    rating: 4.5,
    reviewsCount: 128,
    tag: "Camera",
    description: "Portrait excellence redefined. The ultimate camera phone for portrait lovers with AI-powered beautification and ultra-bright lens technology.",
    image: "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno12-pro.jpg",
    colors: [
      { name: "Graphite Black", value: "#2D2D2D" },
      { name: "Moonlight White", value: "#F5F5F5" },
      { name: "Pearl Gold", value: "#E8D5B7" }
    ],
    specs: {
      processor: "MediaTek Dimensity 9300+",
      display: "6.7\" AMOLED (120Hz, 1440p)",
      camera: "50MP Main (f/1.6) + 50MP + 50MP Portrait + 32MP Front",
      battery: "5000 mAh (80W charging)",
      os: "Android 14 (ColorOS 14)",
      storage: "256GB"
    },
    gradient: "from-yellow-200 to-yellow-400",
    reviews: [
      { author: "Sneha P.", rating: 5, date: "2026-05-30", comment: "Best phone for selfies and portraits. The beautification AI is smart without overdoing it." }
    ]
  },
  {
    id: "samsung-galaxy-a55",
    name: "Samsung Galaxy A55",
    brand: "Samsung",
    price: 29999,
    originalPrice: 39999,
    rating: 4.3,
    reviewsCount: 412,
    tag: "Value",
    description: "Beautiful performance for all. The Galaxy A55 brings essential features with Samsung Knox security, Night Photography, and all-day intelligent battery that learns your habits.",
    image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg",
    colors: [
      { name: "Awesome Navy", value: "#0A1428" },
      { name: "Awesome Iceblue", value: "#ADD8E6" },
      { name: "Awesome Lilac", value: "#DDA0DD" },
      { name: "Awesome Black", value: "#0F0F0F" }
    ],
    specs: {
      processor: "Exynos 1480",
      display: "6.6\" AMOLED (120Hz, 1080p)",
      camera: "50MP Main + 12MP Ultra Wide + 5MP Macro + 50MP Front",
      battery: "5000 mAh (25W charging)",
      os: "Android 14 (One UI 6)",
      storage: "128GB / 256GB"
    },
    gradient: "from-blue-300 to-purple-400",
    reviews: [
      { author: "Amit S.", rating: 4, date: "2026-06-08", comment: "Best budget phone from Samsung. Good design, reliable performance, and regular updates." }
    ]
  },
  {
    id: "realme-gt-7-pro",
    name: "Realme GT 7 Pro",
    brand: "Realme",
    price: 59999,
    originalPrice: 69999,
    rating: 4.6,
    reviewsCount: 241,
    tag: "Value Flagship",
    description: "True flagship gaming performance. Powered by Snapdragon 8 Gen 3 Leading Version with an advanced cooling system and 144Hz gaming panel technology.",
    image: "https://fdn2.gsmarena.com/vv/bigpic/realme-gt7-pro.jpg",
    colors: [
      { name: "Quantum Black", value: "#0A0E27" },
      { name: "Pearl White", value: "#F8F8F8" }
    ],
    specs: {
      processor: "Snapdragon 8 Gen 3 Leading",
      display: "6.78\" AMOLED (120Hz)",
      camera: "50MP Main (f/1.6) + 50MP Ultra Wide + 50MP Tele",
      battery: "5800 mAh (120W charging)",
      os: "Android 14 (Realme UI 5)",
      storage: "256GB / 512GB"
    },
    gradient: "from-black-400 to-gray-600",
    reviews: [
      { author: "Kunal M.", rating: 5, date: "2026-05-25", comment: "Amazing for gaming and video editing. Thermal control is excellent even during long gaming sessions." }
    ]
  }
];

export const allBrands = ["All", "Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Sony", "Redmi", "Vivo", "Motorola", "Nothing", "OPPO", "Realme"];
export const allTags = ["All", "Flagship", "Camera", "Value Flagship", "Multimedia", "Value"];
