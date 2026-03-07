// ============================================================
// ARSI PLATFORM -- Client Site Configuration
// This single file controls everything about a client's site
// ============================================================

export const siteConfig = {
  // -- 1. BUSINESS IDENTITY --
  business: {
    name: "Client Business Name",
    tagline: "Your tagline here",
    email: "hello@clientdomain.com",
    phone: "",
    address: "",
    city: "Minneapolis",
    state: "MN",
    zip: "",
    logo: "/images/logo.png",
    favicon: "/images/favicon.ico",
  },

  // -- 2. BRANDING & THEME --
  branding: {
    theme: "warm" as "warm" | "corporate" | "bold",
    primaryColor: "#6366f1",
    accentColor: "#22c55e",
    fontHeading: "Inter",
    fontBody: "Inter",
  },

  // -- 3. MODULE FLAGS --
  // Toggle features on/off -- disabled modules don't render at all
  modules: {
    booking: false,       // Appointment scheduling system
    ecommerce: false,     // Online store + cart + checkout
    blog: false,          // Blog with categories + tags
    leads: true,          // Contact forms + lead tracking
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
  },

  // -- 8. SEO & ANALYTICS --
  seo: {
    defaultTitle: "Client Business Name",
    titleTemplate: "%s | Client Business Name",
    defaultDescription: "Your business description here",
    ogImage: "/images/og-image.png",
    googleAnalyticsId: "",
    facebookPixelId: "",
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
} as const

export type SiteConfig = typeof siteConfig
