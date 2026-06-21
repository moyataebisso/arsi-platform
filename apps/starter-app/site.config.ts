// ============================================================
// ARSI PLATFORM -- Client Site Configuration
// This single file controls everything about a client's site
// ============================================================

export const siteConfig = {
  // -- 0. SITE URL --
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',

  // -- 1. BUSINESS IDENTITY --
  business: {
    name: "Client Business Name",
    type: "LocalBusiness",  // Schema.org type: Restaurant, HealthBusiness, etc.
    tagline: "Your tagline here",
    email: "hello@clientdomain.com",
    phone: "(612) 555-0100",
    address: "123 Main Street",
    city: "Minneapolis",
    state: "MN",
    zip: "55401",
    logo: "/images/logo.png",
    favicon: "/images/favicon.ico",
  },

  // -- 2. BRANDING & THEME --
  // ------------------------------------------------------------
  // LAYOUT vs THEME vs HERO VARIANT
  // ------------------------------------------------------------
  // `theme`        — color palette (75+ options). Drives CSS vars
  //                  like --color-primary, --color-text, etc.
  // `layout`       — industry-specific layout preset. Controls
  //                  which sections render on the homepage and in
  //                  what order. Each layout also has a sensible
  //                  default theme + heroVariant (see src/lib/layouts.ts).
  //                    fleet      — Fleet & Transport
  //                    restaurant — Restaurants & food
  //                    salon      — Salons & beauty
  //                    healthcare — Clinics, dental, therapy
  //                    community  — Nonprofits, faith, education
  // `heroVariant`  — Visual treatment of the hero section, independent
  //                  of layout/theme so it can be mixed-and-matched.
  //                    solid_color   — Flat color background, copy-forward
  //                    image_overlay — Full-bleed image with overlay
  //                    split         — Current 2-column text + image split
  // ------------------------------------------------------------
  branding: {
    theme: "warm" as "warm" | "corporate" | "bold" | "nature" | "luxury" | "ocean" | "sunset" | "midnight" | "rose" | "slate" | "forest" | "sand" | "arctic" | "grape" | "mint" | "fire" | "sage" | "navyGold" | "charcoal" | "crimson" | "stripe" | "linear" | "vercel" | "notion" | "figma" | "loom" | "clinical" | "wellness" | "dental" | "therapy" | "law" | "bistro" | "bakery" | "vegan" | "cafe" | "foodtruck" | "boutique" | "sport" | "kids" | "studio" | "portfolio" | "photography" | "music" | "oromo" | "nonprofit" | "faith" | "edu" | "realty" | "modernRealty" | "transport" | "stripeLight" | "aurora" | "sunriseSaas" | "obsidian" | "meadow" | "midnightMesh" | "coralReef" | "glacier" | "neonCity" | "sandDune" | "deepSpace" | "paper" | "mango" | "frosted" | "ember" | "lavenderField" | "arcticChrome" | "terra" | "stealth" | "goldenHour" | "mintFresh" | "brutalist" | "sakura" | "forestNight" | "marketplace" | "evergreen" | "arcticMin" | "editorial" | "vivid" | "pastel" | "nightshift" | "entrustedMaroon" | "adamaGold" | "elRoiNavy",
    layout: 'fleet' as 'fleet' | 'restaurant' | 'restaurant_centered' | 'salon' | 'healthcare' | 'community' | 'home_services' | 'modern_minimal' | 'editorial_premium' | 'bold_block' | 'friendly_soft' | 'tech_forward',
    heroVariant: 'split' as 'solid_color' | 'image_overlay' | 'split' | 'centered_minimal' | 'editorial_split' | 'block_hero' | 'rounded_card_hero' | 'terminal_hero' | 'video_hero',
    primaryColor: '#c2410c',
    accentColor: '#d97706',
    fontHeading: 'Playfair Display',
    fontBody: 'DM Sans',
    heroImage: '/images/hero.jpg',
    logoText: true,
    animationStyle: 'subtle' as 'subtle' | 'dramatic' | 'none',
  },

  // -- 3. MODULE FLAGS --
  // Toggle features on/off -- disabled modules don't render at all
  modules: {
    booking: false,       // Appointment scheduling system
    ecommerce: false,     // Online store + cart + checkout
    blog: false,          // Blog with categories + tags
    leads: true,          // Contact forms + lead tracking
    events: false,        // Events listing + registration
    reviews: false,       // Customer reviews + testimonials
    gallery: false,       // Image gallery with categories
    faq: false,           // Frequently asked questions
    members: false,       // Member profiles + directory
    emailMarketing: false,// Email campaigns + subscribers
    customForms: false,   // Custom form builder
    payments: false,      // Stripe payments integration
    // Healthcare / residential care modules (Entrusted Care + future tenants)
    mission_values: false,      // 3-column Mission / Values / Philosophy band on home
    our_homes: false,           // /our-homes multi-location page + nav link
    referrals: false,           // /referrals form page + nav link
    resources_page: false,      // /resources external links page + nav link
    community_subscribe: false, // "Join Our Care Community" subscribe band on home
    founder_bio: false,         // Founder profile block on /about (El Roi + future NP-led tenants)
    // Restaurant modules (Adama + future food tenants)
    drinks: false,              // /drinks page + nav link
    order_online: false,        // /order page + nav link (linkout or in-site)
    parties: false,             // /parties (private events) page + nav link
    catering: false,            // /catering page + nav link
    jobs: false,                // /jobs careers page + nav link
  },

  // -- 4. AUTHENTICATION --
  auth: {
    enabled: true,
    allowRegistration: true,
    requireEmailVerification: true,
    providers: ["email"] as ("email" | "google" | "facebook")[],
  },

  // -- 5. PAYMENTS --
  payments: {
    enabled: false,       // Master switch -- false = no Stripe loads at all
    provider: "stripe" as "stripe" | "paypal" | "both",
    currency: "usd",
    testMode: true,       // Switch to false for production
  },

  // -- 6. EMAIL AUTOMATION --
  email: {
    fromName: "Client Business Name",
    fromEmail: "hello@clientdomain.com",
    replyTo: "hello@clientdomain.com",
    templates: {
      welcome: true,
      bookingConfirmation: true,
      orderConfirmation: true,
      passwordReset: true,
      adminNewLead: true,
    },
  },

  // -- 7. PAGES & CONTENT --
  pages: {
    home: { enabled: true, title: "Home" },
    about: { enabled: true, title: "About Us" },
    services: { enabled: true, title: "Services" },
    contact: { enabled: true, title: "Contact" },
    shop: { enabled: false, title: "Shop" },      // auto-enabled with ecommerce
    book: { enabled: false, title: "Book Now" },  // auto-enabled with booking
    blog: { enabled: false, title: "Blog" },      // auto-enabled with blog module
    events: { enabled: false, title: "Events" },
    reviews: { enabled: false, title: "Reviews" },
    gallery: { enabled: false, title: "Gallery" },
    faq: { enabled: false, title: "FAQ" },
  },

  // -- 8. SEO & ANALYTICS --
  seo: {
    defaultTitle: "Client Business Name",
    titleTemplate: "%s | Client Business Name",
    defaultDescription: "Your business description here",
    ogImage: "/images/og-image.png",
    keywords: [] as string[],
    googleVerification: "",
    googleAnalyticsId: "",
    facebookPixelId: "",
    localBusiness: {
      category: "LocalBusiness",   // Schema.org: Restaurant, HealthBusiness, etc.
      priceRange: "$$",            // $, $$, $$$, $$$$
      areaServed: "Minneapolis, MN",
    },
  },

  // -- 9. INTEGRATIONS --
  integrations: {
    googleMaps: "",
    facebookPage: "",
    instagram: "",
    twitter: "",
    linkedin: "",
  },

  // -- 10. ADMIN NOTIFICATIONS --
  notifications: {
    adminEmail: "hello@clientdomain.com",
    notifyOnNewLead: true,
    notifyOnNewBooking: true,
    notifyOnNewOrder: true,
    notifyOnNewUser: true,
  },

  // -- 11. LOCATION --
  location: {
    address: '123 Main Street',
    city: 'Minneapolis',
    state: 'MN',
    zip: '55401',
    googleMapsEmbed: '',
    showMapOnContact: true,
    showMapOnHome: true,
    hours: [
      { day: 'Monday - Friday', hours: '9:00 AM - 5:00 PM' },
      { day: 'Saturday', hours: 'Closed' },
      { day: 'Sunday', hours: 'Closed' },
    ],
  },

  // -- 12. RESTAURANT (optional) --
  restaurant: {
    enabled: false,
    menuPdf: '',
    reservationsUrl: '',
    featuredDishes: [] as { name: string; description: string; price: string; image: string }[],
  },
  // -- 13. DATABASE --
  database: {
    schema: process.env.SUPABASE_SCHEMA || 'public',
  },

  // -- 14. ARSI PLATFORM MODE --
  arsiPlatform: {
    // HOSTING MODE:
    // 'local-business' — Arsi managed hosting
    //   ✅ Site lives on Arsi's Vercel account
    //   ✅ Monitored via Command Center
    //   ✅ $19/mo recurring revenue
    //   ✅ You handle all deployments + updates
    //
    // 'developer' — Self hosted
    //   ✅ Client owns their Vercel account
    //   ✅ No monitoring overhead
    //   ✅ One-time setup fee
    //   ✅ No Arsi branding
    mode: 'local-business' as 'local-business' | 'developer',

    // Monitoring (auto-set based on mode, can override)
    monitoringEnabled: true,

    // Shows "Built by Arsi Technology Group" in footer
    showPoweredBy: true,

    // Your Command Center URL
    commandCenterUrl: 'https://arsi-platform-dashboard.vercel.app',

    // Developer mode extras
    developer: {
      selfHosted: false,
      customBranding: true,
      hideArsiFooter: true,
    },
  },
} as const

export type SiteConfig = typeof siteConfig
